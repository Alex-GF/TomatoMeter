import { useState, useContext, useEffect, useMemo } from 'react';
import Sidebar from '../../components/sidebar';
import { SettingsContext } from '../../contexts/settingsContext';
import { useTokenService, useSpaceClient } from 'space-react-client';
import { useSubscription } from '../../hooks/useSubscription';
import { TimelineDual } from '../../components/timeline/TimelineDual';
import { SIDEBAR_ITEMS } from '../../constants/sidebarItems';
import { usePage } from '../../contexts/pageContext';
import useAxios from '../../hooks/useAxios';

// SIDEBAR_ITEMS debe moverse fuera de este archivo para evitar el error de Fast Refresh.
// Puedes moverlo a un archivo como src/constants/sidebarItems.ts y exportarlo desde allí.
// Por ahora, lo dejamos aquí para mantener la funcionalidad, pero considera refactorizarlo.

export function DemoApp() {
  const { toggles, setToggles } = useContext(SettingsContext);
  const { setCurrentSubscription } = useSubscription();
  const { selectedPage } = usePage();
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

  const spaceClient = useSpaceClient();
  const tokenService = useTokenService();
  const axiosInstance = useAxios();

  const settingsValue = useMemo(() => ({ toggles, setToggles }), [toggles, setToggles]);

  useEffect(() => {
    const onPricingCreated = async (data: { serviceName: string; pricingVersion: string }) => {  
      axiosInstance.put('/contracts/pricing', { serviceName: data.serviceName, pricingVersion: data.pricingVersion })
        .then((pricing: any) => {
          setCurrentSubscription([Object.keys(pricing.data.plans)[0]]);
          setReloadTrigger(prev => prev + 1);
        })
        .catch((error: any) => {
          console.error('Error updating contract with new pricing:', error);
        });
    };
    const onPricingArchived = async () => {
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
