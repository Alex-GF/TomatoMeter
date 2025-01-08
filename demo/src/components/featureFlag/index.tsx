export const FEATURES: Record<string, { value: boolean; usageLimits?: Record<string, number> }> = {
  expenses: {
    value: true,
    usageLimits: {
      maxExpenses: 5,
    },
  },
  expensesCategories: {
    value: true,
  },
  expensesGraph: {
    value: true,
  },
};

export default function FeatureFlag({
  featureName,
  children,
}: {
  featureName: string;
  children: React.ReactNode;
}) {
  const isEnabled = isFeatureEnabled(featureName);

  function isFeatureEnabled(featureName: string) {
    if (typeof FEATURES[featureName].value === 'boolean') {
      return FEATURES[featureName].value;
    } else {
      return false;
    }
  }

  return <>{isEnabled ? <>{children}</> : <></>}</>;
}
