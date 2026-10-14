import { createContext, useContext, useState, ReactNode } from 'react';

interface PageContextType {
  selectedPage: string;
  setSelectedPage: (page: string) => void;
}

const PageContext = createContext<PageContextType | undefined>(undefined);

export function PageProvider({ children }: { children: ReactNode }) {
  const [selectedPage, setSelectedPage] = useState<string>('Pomodoro Timer');
  return (
    <PageContext.Provider value={{ selectedPage, setSelectedPage }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePage() {
  const ctx = useContext(PageContext);
  if (!ctx) throw new Error('usePage must be used within a PageProvider');
  return ctx;
}
