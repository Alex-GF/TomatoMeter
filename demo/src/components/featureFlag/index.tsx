import { useFeatureToggling } from "../../hooks/useFeatureToggling";

// export const FEATURES: Record<string, { value: boolean; usageLimits?: Record<string, number> }> = {
//   expenses: {
//     value: true,
//     usageLimits: {
//       maxExpenses: 5,
//     },
//   },
//   expensesCategories: {
//     value: true,
//   },
//   expensesGraph: {
//     value: true,
//   },
// };

export default function FeatureFlag({
  featureName,
  children,
}: {
  featureName: string;
  children: React.ReactNode;
}) {

  const {isFeatureEnabled} = useFeatureToggling();

  const isEnabled = isFeatureEnabled(featureName);

  return isEnabled ? <>{children}</> : <></>;
}
