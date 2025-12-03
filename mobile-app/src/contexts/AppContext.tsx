import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FiscalYear } from '../types';
import { supabase } from '../utils/supabase';

interface AppContextType {
  fiscalYears: FiscalYear[];
  selectedFiscalYear: FiscalYear | null;
  setSelectedFiscalYear: (year: FiscalYear) => void;
  isOffline: boolean;
  language: 'en' | 'th';
  setLanguage: (lang: 'en' | 'th') => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [selectedFiscalYear, setSelectedFiscalYearState] = useState<FiscalYear | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [language, setLanguageState] = useState<'en' | 'th'>('en');

  useEffect(() => {
    loadFiscalYears();
    loadLanguage();
  }, []);

  const loadFiscalYears = async () => {
    try {
      const { data, error } = await supabase
        .from('fiscal_years')
        .select('*')
        .order('year', { ascending: false });

      if (error) throw error;

      if (data) {
        const years: FiscalYear[] = data.map(fy => ({
          id: fy.id,
          year: fy.year,
          startDate: fy.start_date,
          endDate: fy.end_date,
        }));
        setFiscalYears(years);

        if (!selectedFiscalYear && years.length > 0) {
          setSelectedFiscalYearState(years[0]);
        }
      }
    } catch (error) {
      console.error('Error loading fiscal years:', error);
      setIsOffline(true);
      const cached = await AsyncStorage.getItem('@fiscal_years');
      if (cached) {
        const years = JSON.parse(cached);
        setFiscalYears(years);
        if (years.length > 0) setSelectedFiscalYearState(years[0]);
      }
    }
  };

  const loadLanguage = async () => {
    const lang = await AsyncStorage.getItem('@language');
    if (lang === 'th' || lang === 'en') {
      setLanguageState(lang);
    }
  };

  const setSelectedFiscalYear = (year: FiscalYear) => {
    setSelectedFiscalYearState(year);
  };

  const setLanguage = async (lang: 'en' | 'th') => {
    setLanguageState(lang);
    await AsyncStorage.setItem('@language', lang);
  };

  const refreshData = async () => {
    await loadFiscalYears();
  };

  return (
    <AppContext.Provider
      value={{
        fiscalYears,
        selectedFiscalYear,
        setSelectedFiscalYear,
        isOffline,
        language,
        setLanguage,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
