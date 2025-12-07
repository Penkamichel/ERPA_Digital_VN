import { useState } from 'react';
import {
  DemoUser,
  Tab,
  MobileHome,
  MobilePlan,
  MobileActivity,
  MobileSettings,
  useFiscalYearData
} from '../components/mobile';
import { useLanguage } from '../contexts/LanguageContext';

const DEMO_COMMUNITY_ID = 'a0000001-0000-0000-0000-000000000000';
const DEMO_FISCAL_YEAR_ID_2025 = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

const DEMO_USERS: DemoUser[] = [
  { id: '1', name: 'Siriporn (CMB)', role: 'CMB', communityId: DEMO_COMMUNITY_ID, communityName: 'Ban Pho Village' },
  { id: '2', name: 'Somchai (Member)', role: 'Community Member', communityId: DEMO_COMMUNITY_ID, communityName: 'Ban Pho Village' },
  { id: '3', name: 'Thawatchai (FO)', role: 'Forest Owner', communityId: DEMO_COMMUNITY_ID, communityName: 'Ban Pho Village' },
  { id: '4', name: 'Anan (CPC)', role: 'CPC', communityId: DEMO_COMMUNITY_ID, communityName: 'Ban Pho Village' },
];

export default function MobileAppDemo() {
  const { t } = useLanguage();
  const [selectedUser, setSelectedUser] = useState<DemoUser | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [subTab, setSubTab] = useState<string | undefined>();

  const { data: fiscalYearData, loading } = useFiscalYearData(
    selectedUser?.communityName || '',
    selectedYear
  );

  if (!selectedUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🌲</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Provincial Fund</h1>
            <p className="text-gray-600">Mobile App Demo</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">ユーザーを選択</h2>
            <p className="text-sm text-gray-600 mb-4">役割を選んでアプリを体験</p>

            <div className="space-y-3">
              {DEMO_USERS.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{user.name}</div>
                      <div className="text-sm font-medium text-blue-600">{user.role}</div>
                      <div className="text-xs text-gray-500">{user.communityName}</div>
                    </div>
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <span className="text-blue-600 text-xl">→</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">Demo Mode • Supabase接続済み</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="relative">
        <div className="w-[375px] h-[667px] bg-black rounded-[3rem] p-3 shadow-2xl">
          <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
            <div className="bg-white px-4 py-2 flex items-center justify-between text-xs text-gray-900">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <span>📶</span>
                <span>📡</span>
                <span>🔋</span>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-gray-50">
              {activeTab === 'home' && (
                <MobileHome
                  user={selectedUser}
                  fiscalYearData={fiscalYearData}
                  loading={loading}
                  selectedYear={selectedYear}
                  setSelectedYear={setSelectedYear}
                  setActiveTab={setActiveTab}
                  setSubTab={setSubTab}
                />
              )}
              {activeTab === 'plan' && (
                <MobilePlan
                  user={selectedUser}
                  selectedYear={selectedYear}
                  setSelectedYear={setSelectedYear}
                  initialSubTab={subTab}
                  communityId={DEMO_COMMUNITY_ID}
                  fiscalYearId={DEMO_FISCAL_YEAR_ID_2025}
                />
              )}
              {activeTab === 'activity' && (
                <MobileActivity
                  user={selectedUser}
                  selectedYear={selectedYear}
                  setSelectedYear={setSelectedYear}
                  fiscalYearData={fiscalYearData}
                  initialSubTab={subTab}
                  communityId={DEMO_COMMUNITY_ID}
                  fiscalYearId={DEMO_FISCAL_YEAR_ID_2025}
                />
              )}
              {activeTab === 'settings' && (
                <MobileSettings
                  user={selectedUser}
                  onLogout={() => {
                    setSelectedUser(null);
                    setActiveTab('home');
                    setSelectedYear(2025);
                    setSubTab(undefined);
                  }}
                />
              )}
            </div>

            <div className="bg-white border-t border-gray-200 flex">
              <TabButton
                icon="🏠"
                label={t('home')}
                active={activeTab === 'home'}
                onClick={() => {
                  setActiveTab('home');
                  setSubTab(undefined);
                }}
              />
              <TabButton
                icon="📋"
                label={t('plan')}
                active={activeTab === 'plan'}
                onClick={() => {
                  setActiveTab('plan');
                  setSubTab(undefined);
                }}
              />
              <TabButton
                icon="📊"
                label={t('activity')}
                active={activeTab === 'activity'}
                onClick={() => {
                  setActiveTab('activity');
                  setSubTab(undefined);
                }}
              />
              <TabButton
                icon="⚙️"
                label={t('settings')}
                active={activeTab === 'settings'}
                onClick={() => {
                  setActiveTab('settings');
                  setSubTab(undefined);
                }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedUser(null);
            setActiveTab('home');
            setSelectedYear(2025);
            setSubTab(undefined);
          }}
          className="absolute -top-4 -right-4 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white text-xl hover:bg-red-600 shadow-lg transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function TabButton({ icon, label, active, onClick }: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
        active ? 'text-blue-600' : 'text-gray-400'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
