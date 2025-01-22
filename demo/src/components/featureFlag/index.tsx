import { useFeatureToggling } from '../../hooks/useFeatureToggling';

export default function FeatureFlag({
  featureName,
  children,
}: {
  featureName: string;
  children: React.ReactNode;
}) {
  const { isFeatureEnabled } = useFeatureToggling();

  const isEnabled = isFeatureEnabled(featureName);

  return isEnabled ? <>{children}</> : <></>;
}
