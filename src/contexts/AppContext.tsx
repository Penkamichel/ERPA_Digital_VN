import { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  selectedCommuneId: string | null;
  setSelectedCommuneId: (id: string | null) => void;
  selectedFiscalYearId: string;
  setSelectedFiscalYearId: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedCommuneId, setSelectedCommuneId] = useState<string | null>(null);
  const [selectedFiscalYearId, setSelectedFiscalYearId] = useState<string>('ffffffff-ffff-ffff-ffff-ffffffffffff');

  return (
    <AppContext.Provider
      value={{
        selectedCommuneId,
        setSelectedCommuneId,
        selectedFiscalYearId,
        setSelectedFiscalYearId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
