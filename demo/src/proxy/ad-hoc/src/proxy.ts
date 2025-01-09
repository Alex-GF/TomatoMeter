const FEATURES: Record<string, boolean | number | string> = {
  expenses: true,
  expensesCategories: true,
  expensesGraph: true,
};

export function initializeAdHoc() {
  return {
    getFeature: (key: string) => {
      if (typeof FEATURES[key] !== 'boolean') {
        return false;
      }

      return FEATURES[key] ?? false;
    },
  };
}
