import { useState, useContext, useEffect, useMemo } from 'react';
import Sidebar from '../../components/sidebar';
import { SettingsContext } from '../../contexts/settingsContext';
import axios from '../../lib/axios';
import { usePricingToken, useSpaceClient } from 'space-react-client';
import { renewToken } from '../../utils/helpers';
import PricingEditor from '../../components/pricing-editor';
import { useSubscription } from '../../hooks/useSubscription';
import { TimelineDual } from '../../components/timeline/TimelineDual';
import { SIDEBAR_ITEMS } from '../../constants/sidebarItems';
import { usePage } from '../../contexts/pageContext';

// SIDEBAR_ITEMS debe moverse fuera de este archivo para evitar el error de Fast Refresh.
// Puedes moverlo a un archivo como src/constants/sidebarItems.ts y exportarlo desde allí.
// Por ahora, lo dejamos aquí para mantener la funcionalidad, pero considera refactorizarlo.

export function DemoApp() {
  const { toggles, setToggles } = useContext(SettingsContext);
  const { setCurrentSubscription } = useSubscription();
  const { selectedPage } = usePage();
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);
  const [isPricingEditorOpen, setPricingEditorOpen] = useState<boolean>(false);

  const spaceClient = useSpaceClient();
  const tokenService = usePricingToken();

  const settingsValue = useMemo(() => ({ toggles, setToggles }), [toggles, setToggles]);

  useEffect(() => {
    renewToken(tokenService);
    const onPricingCreated = async (data: { serviceName: string; pricingVersion: string }) => {  
      axios.get(`/pricings/${data.serviceName}/${data.pricingVersion}`).then(response => {
        const pricing = response.data;
        axios
          .put('/contracts', {
            contractedServices: {
              tomatometer: data.pricingVersion || '1.0.0',
            },
            subscriptionPlans: {
              tomatometer: Object.keys(pricing.plans)[0]
            },
            subscriptionAddOns: {},
          })
          .then(() => {
            renewToken(tokenService).then(() => {
              setCurrentSubscription([Object.keys(pricing.plans)[0]]);
              setReloadTrigger(prev => prev + 1);
            });
          });
      });
    };
    const onPricingArchived = async () => {
      await renewToken(tokenService);
      setReloadTrigger(prev => prev + 1);
    };
    spaceClient.on('pricing_created', onPricingCreated);
    spaceClient.on('pricing_archived', onPricingArchived);
    return () => {
      spaceClient.off('pricing_created', onPricingCreated);
      spaceClient.off('pricing_archived', onPricingArchived);
    };
  }, [spaceClient, tokenService, setCurrentSubscription]);

  return (
    <SettingsContext.Provider value={settingsValue}>
      <div className="relative h-screen w-screen bg-gray-200">
        {/* TimelineDual at the top, outside main app block */}
        <div className="fixed w-full left-0 top-0 flex justify-center pt-4 pb-2 z-50 bg-gray-200/95 transition-all">
          <TimelineDual />
        </div>
        {/* Floating button to open Pricing Editor */}
        <button
          onClick={() => setPricingEditorOpen(true)}
          className="fixed top-8 left-8 z-50 bg-white shadow-lg rounded-full px-5 py-2 font-semibold text-demo-primary hover:bg-gray-100 transition-all border border-gray-200 flex items-center gap-2"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Edit Pricing
        </button>
        {/* Sidebar de Pricing Editor a la izquierda */}
        <PricingEditor
          open={isPricingEditorOpen}
          onClose={() => setPricingEditorOpen(false)}
          side="left"
        />
        {/* Main app centered */}
        <main className="flex h-screen items-center justify-center pt-[120px]">
          <div className="h-[75vh] w-[75vw] max-w-[1500px] overflow-hidden rounded-[25px] bg-white shadow-lg">
            <div className="flex h-full bg-demo-primary">
              <Sidebar />
              <div
                key={reloadTrigger}
                className="my-6 mr-6 flex flex-grow flex-col overflow-hidden rounded-[25px]"
              >
                <div className={`flex h-full w-full items-center justify-center bg-white`}>
                  <div className="w-full h-full overflow-y-auto">
                    {SIDEBAR_ITEMS.find(item => item.name === selectedPage)!.component}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SettingsContext.Provider>
  );
}
