import { type CSSProperties, useContext, useMemo, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { compareSelections, mergeSelection, reconcileSelection } from 'pricing-renderer';
import type { NormalizedPricing, PricingSelection, SelectionComparison } from 'pricing-renderer';
import type { PricingActionEvent } from 'pricing-renderer/element';
import { PricingChangeReview, PricingRenderer } from 'pricing-renderer/react';
import {
  contractedVersion,
  selectionFromContract,
  subscriptionFromSelection,
} from 'pricing-renderer/space';
import { parsePricingYaml } from 'pricing-renderer/yaml';
import 'pricing-renderer/styles.css';
import './pricing.css';

import { SubscriptionContext } from '../../contexts/subscriptionContext';
import { SettingsContext } from '../../contexts/settingsContext';
import PricingLoader from '../../components/loading/PricingLoader';
import { SpaceNotReady } from '../../components/loading/SpaceNotReady';
import { useTimeline } from '../../contexts/timelineContext';

const SERVICE = 'tomatometer';

// The app already says where you are, and the action lives in the bar that is always on screen.
const HIDDEN_SECTIONS = ['saasName', 'summary'] as const;

const BRAND_TOKENS = {
  '--pr-color-accent': '#7e22ce',
  '--pr-color-on-accent': '#ffffff',
  '--pr-color-link': '#6b21a8',
  '--pr-color-focus': '#a855f7',
} as CSSProperties;

// TomatoMeter shows every page in a frame of 75% of the window, so the renderer's own width
// check would only show the table on very wide screens. The window decides instead.
const TABLE_WINDOW = window.matchMedia('(min-width: 1280px)');

function subscribeToTableWindow(onChange: () => void) {
  TABLE_WINDOW.addEventListener('change', onChange);
  return () => TABLE_WINDOW.removeEventListener('change', onChange);
}

interface Review {
  comparison: SelectionComparison;
  selection: PricingSelection;
  actionId: string;
}

function compare(pricing: NormalizedPricing, before: PricingSelection, after: PricingSelection) {
  return compareSelections({
    before: { pricing, selection: before },
    after: { pricing, selection: after },
  });
}

const PricingPage = () => {
  const subscription = useContext(SubscriptionContext);
  if (!subscription) throw new Error('SubscriptionContext not found');
  const { status, contract, pricing, pricingYaml, updateSubscription } = subscription;
  const { toggles } = useContext(SettingsContext);
  const { addEvent } = useTimeline();
  const tableFits = useSyncExternalStore(subscribeToTableWindow, () => TABLE_WINDOW.matches);

  // What is picked on screen until it is confirmed. Null means "what the contract says", so
  // every mark on the page follows the contract as soon as a change lands.
  const [draft, setDraft] = useState<PricingSelection | null>(null);
  const [review, setReview] = useState<Review | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string>();
  const [notification, setNotification] = useState<string | null>(null);

  const normalized = useMemo(() => {
    const parsed = pricingYaml ? parsePricingYaml(pricingYaml) : null;
    return parsed?.ok ? parsed.value : null;
  }, [pricingYaml]);

  const currentSelection = useMemo(
    () =>
      contract && normalized
        ? mergeSelection(normalized, selectionFromContract(contract, SERVICE))
        : undefined,
    [contract, normalized]
  );

  const pendingChange = useMemo(() => {
    if (!draft || !normalized || !currentSelection) return null;
    const comparison = compare(normalized, currentSelection, draft);
    return comparison.relation === 'current' ? null : comparison;
  }, [draft, normalized, currentSelection]);

  if (status === 'disconnected' || status === 'pending') return <SpaceNotReady status={status} />;

  if (!contract || !pricing || !pricingYaml) {
    return (
      <PricingLoader
        title="Pricing"
        message="Please wait while we fetch the latest plans and your subscription details."
      />
    );
  }

  const notify = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2500);
  };

  // The contract only changes once the review is confirmed.
  const openReview = (selection: PricingSelection, actionId: string) => {
    if (!normalized || !currentSelection) return;
    setReview({ comparison: compare(normalized, currentSelection, selection), selection, actionId });
  };

  const onAction = (event: PricingActionEvent) => {
    if (!normalized) return;
    const { actionId, planId, selection } = event.detail;
    // A plan button is an action, not a selection change: the target plan travels in planId and
    // detail.selection is still the one on screen, with add-ons the new plan may not allow.
    const target = planId
      ? reconcileSelection(normalized, { ...selection, planId }).selection
      : selection;
    openReview(target, actionId);
  };

  const applyChange = async ({ selection, actionId }: Review) => {
    setPendingActionId(actionId);
    try {
      const version = contractedVersion(contract, SERVICE) ?? '';
      const novation = subscriptionFromSelection(SERVICE, version, selection);
      const plan = novation.subscriptionPlans[SERVICE];
      const addOns = novation.subscriptionAddOns[SERVICE] ?? {};
      const planChanged = plan !== contract.subscriptionPlans[SERVICE];

      await updateSubscription(plan, addOns);
      setDraft(null);

      if (toggles['Show plan/add-on notifications']) {
        notify(planChanged ? 'Plan changed successfully!' : 'Add-on selection updated!');
      }
      addEvent({
        type: 'user',
        label: planChanged ? `User changed plan to ${plan}` : 'User updated add-ons',
        plansSnapshot: pricing.plans ? { [plan]: pricing.plans[plan] } : {},
        addOnsSnapshot: { ...addOns },
      });
    } catch {
      notify('Your subscription could not be changed. Please try again.');
    } finally {
      setPendingActionId(undefined);
    }
  };

  const barMessage = !pendingChange
    ? 'Your current subscription'
    : pendingChange.plan.changed
      ? `Switching to ${pendingChange.plan.after.name ?? pendingChange.plan.after.id}`
      : 'Changing your add-ons';

  return (
    // The overlay is anchored to this wrapper, which does not scroll, so the review stays inside
    // the pricing area instead of covering the sidebar.
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="h-full w-full overflow-y-auto bg-gradient-to-br from-purple-100 to-blue-100 p-4 pb-24 transition-colors duration-500 dark:from-gray-900 dark:to-gray-800"
        style={BRAND_TOKENS}
      >
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="fixed left-1/2 top-8 z-50 -translate-x-1/2 rounded-xl bg-purple-600 px-6 py-3 text-lg font-bold text-white shadow-lg"
            >
              {notification}
            </motion.div>
          )}
        </AnimatePresence>

        <PricingRenderer
          yaml={pricingYaml}
          selection={draft ?? currentSelection}
          currentSelection={currentSelection}
          pendingActionId={pendingActionId}
          locale="en-US"
          theme={toggles['Dark mode'] ? 'dark' : 'light'}
          layout={tableFits ? 'table' : 'compact'}
          hideSections={HIDDEN_SECTIONS}
          onAction={onAction}
          onSelectionChange={event => setDraft(event.detail.selection)}
        />
      </div>

      {!review && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center p-4">
          <div className="pointer-events-auto flex items-center gap-4 rounded-full border border-black/5 bg-white/90 py-2 pl-5 pr-2 shadow-lg backdrop-blur dark:border-white/10 dark:bg-gray-900/90">
            <span className="text-sm text-gray-600 dark:text-gray-300">{barMessage}</span>
            <button
              type="button"
              disabled={!pendingChange}
              onClick={() => draft && openReview(draft, 'review-change')}
              className="rounded-full bg-purple-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 dark:disabled:bg-gray-700"
            >
              Review change
            </button>
          </div>
        </div>
      )}

      {review && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Review your change of subscription"
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm"
          onClick={event => {
            if (event.target === event.currentTarget) setReview(null);
          }}
        >
          <div className="flex max-h-full min-h-0 w-full max-w-xl flex-col overflow-y-auto overscroll-contain rounded-2xl bg-white px-6 pb-0 pt-6 shadow-2xl dark:bg-gray-900">
            <PricingChangeReview
              comparison={review.comparison}
              locale="en-US"
              onConfirm={async () => {
                setReview(null);
                await applyChange(review);
              }}
              onBack={() => setReview(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPage;
