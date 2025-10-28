import { useState, useEffect } from 'react';
import { Search, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';
import type { Commune, FiscalYear } from '../../types';
import Badge from '../ui/Badge';

export default function Header() {
  const { user, logout } = useAuth();
  const { selectedCommuneId, setSelectedCommuneId, selectedFiscalYearId, setSelectedFiscalYearId } = useApp();
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    loadCommunes();
    loadFiscalYears();
  }, []);

  const loadCommunes = async () => {
    const { data } = await supabase.from('communes').select('*').order('name');
    if (data) setCommunes(data);
  };

  const loadFiscalYears = async () => {
    const { data } = await supabase.from('fiscal_years').select('*').order('year', { ascending: false });
    if (data) setFiscalYears(data);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'pf':
        return <Badge variant="success">PF Officer</Badge>;
      case 'cmb':
        return <Badge variant="info">CMB Member</Badge>;
      case 'viewer':
        return <Badge variant="gray">Viewer</Badge>;
      default:
        return null;
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <select
              value={selectedCommuneId || ''}
              onChange={(e) => setSelectedCommuneId(e.target.value || null)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              <option value="">All Communes</option>
              {communes.map((commune) => (
                <option key={commune.id} value={commune.id}>
                  {commune.name}
                </option>
              ))}
            </select>

            <select
              value={selectedFiscalYearId}
              onChange={(e) => setSelectedFiscalYearId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            >
              {fiscalYears.map((fy) => (
                <option key={fy.id} value={fy.id}>
                  FY {fy.year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {user && getRoleBadge(user.role)}
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
