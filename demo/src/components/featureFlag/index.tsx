import { useContext } from 'react';
import { FeatureTogglingContext } from '../../contexts/featureFlagContext';

export default function FeatureFlag({
  featureName,
  children,
}: {
  featureName: string;
  children: React.ReactNode;
}) {

  const {isFeatureEnabled} = useContext(FeatureTogglingContext)!;

  const isEnabled = isFeatureEnabled(featureName);

  return isEnabled ? <>{children}</> : <></>;
}
