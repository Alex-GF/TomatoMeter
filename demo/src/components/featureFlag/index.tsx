export const FEATURES: Record<string, boolean | number | string> = {
    'expensesList': true,
    'expensesLimit': 5,
    'expensesGraph': true
}

export default function FeatureFlag({featureName, children}: {featureName: string, children: React.ReactNode}) {

    const isEnabled = isFeatureEnabled(featureName);

    function isFeatureEnabled(featureName: string) {
        
        if (typeof FEATURES[featureName] === 'boolean') {
            return FEATURES[featureName];
        }else{
            return false;
        }
    }
    
    
    return (
        <>
            {isEnabled ? (
                <>{children}</>
            ) : (
                <></>
            )}
        </>
    )
}