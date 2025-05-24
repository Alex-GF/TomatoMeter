import { useContext } from 'react';

export default function FeatureFlag({
  featureName,
  children,
}: {
  featureName: string;
  children: React.ReactNode;
}) {

  function isFeatureEnabled(feature: string): boolean {
    return true;
  }

  const isEnabled = isFeatureEnabled(featureName);

  return isEnabled ? <>{children}</> : <></>;
}
