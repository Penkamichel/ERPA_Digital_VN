import { useState } from 'react';
import { Check, Circle, AlertCircle, ChevronRight, Info } from 'lucide-react';

type Tab = 'home' | 'plan' | 'activity' | 'settings';
type UserRole = 'CMB' | 'Community Member' | 'Forest Owner' | 'CPC';

interface DemoUser {
  id: string;
  name: string;
  role: UserRole;
  communityName: string;
}

const DEMO_USERS: DemoUser[] = [
  { id: '1', name: 'Siriporn (CMB)', role: 'CMB', communityName: 'Ban Pho Village' },
  { id: '2', name: 'Somchai (Member)', role: 'Community Member', communityName: 'Ban Pho Village' },
  { id: '3', name: 'Thawatchai (FO)', role: 'Forest Owner', communityName: 'Ban Pho Village' },
  { id: '4', name: 'Anan (CPC)', role: 'CPC', communityName: 'Ban Pho Village' },
];

export default function MobileAppDemo() {
  const [selectedUser, setSelectedUser] = useState<DemoUser | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('home');

  if (!selectedUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-6">
            <div className="text-6xl mb-4">🌲</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Provincial Fund</h1>
            <p className="text-gray-600">Mobile App Demo</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ユーザーを選択</h2>
            <div className="space-y-3">
              {DEMO_USERS.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="w-full bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-500 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{user.name}</div>
                      <div className="text-sm text-blue-600">{user.role}</div>
                    </div>
                    <span className="text-2xl">→</span>
                  </div>
                </button>
              ))}
            </div>
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
            <div className="bg-white px-4 py-2 flex items-center justify-between text-xs">
              <span>9:41</span>
              <div>📶 📡 🔋</div>
            </div>

            <div className="flex-1 overflow-auto bg-gray-50">
              {activeTab === 'home' && <HomeTab user={selectedUser} />}
              {activeTab === 'plan' && <PlanTab user={selectedUser} />}
              {activeTab === 'activity' && <ActivityTab user={selectedUser} />}
              {activeTab === 'settings' && <SettingsTab user={selectedUser} onLogout={() => setSelectedUser(null)} />}
            </div>

            <div className="bg-white border-t border-gray-200 flex">
              <TabButton icon="🏠" label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
              <TabButton icon="📋" label="Plan" active={activeTab === 'plan'} onClick={() => setActiveTab('plan')} />
              <TabButton icon="📊" label="Activity" active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} />
              <TabButton icon="⚙️" label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            </div>
          </div>
        </div>

        <button
          onClick={() => setSelectedUser(null)}
          className="absolute -top-4 -right-4 w-10 h-10 bg-red-500 rounded-full text-white text-xl shadow-lg"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

function TabButton({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 flex flex-col items-center gap-1 ${active ? 'text-blue-600' : 'text-gray-400'}`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function HomeTab({ user }: { user: DemoUser }) {
  const [showInfo, setShowInfo] = useState(false);

  const workflowSteps = [
    { id: 1, name: '会議を開催', desc: '今年の活動を決める話し合い', status: 'completed' as const },
    { id: 2, name: '活動計画を作成', desc: '何をするか詳しく決める', status: 'completed' as const },
    { id: 3, name: '予算を作成', desc: 'お金の使い方を決める', status: 'current' as const },
    { id: 4, name: '活動を実施', desc: '決めたことを実行する', status: 'pending' as const },
    { id: 5, name: '記録を残す', desc: '写真やレシートを保存', status: 'pending' as const },
    { id: 6, name: '報告書を作成', desc: '1年間の活動をまとめる', status: 'pending' as const },
  ];

  return (
    <div className="p-4 space-y-4">
      <div>
        <p className="text-xs text-gray-500">{user.communityName}</p>
        <h1 className="text-xl font-bold">{user.name}</h1>
        <p className="text-sm text-emerald-600">{user.role}</p>
      </div>

      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm">今年のコミュニティの予算 (2025)</p>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        <p className="text-3xl font-bold mb-4">50M VND</p>

        <div className="bg-white bg-opacity-20 rounded-xl p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span>💰 今年使えるお金</span>
            <span className="font-semibold">50M</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>✅ 今まで使った分</span>
            <span className="font-semibold">9.5M</span>
          </div>
          <div className="h-2 bg-white bg-opacity-30 rounded-full mt-2">
            <div className="h-full bg-white rounded-full" style={{ width: '19%' }}></div>
          </div>
          <p className="text-xs text-center">使った割合: 19%</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
        <h2 className="font-bold mb-2">📌 次にやること</h2>
        <div className="space-y-2">
          <button className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
            <div className="flex gap-3">
              <span className="text-2xl">📝</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">森林パトロールの予算詳細を入力</p>
                <p className="text-xs text-gray-600">備品や人件費の内訳を記入</p>
              </div>
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full h-fit">急ぎ</span>
            </div>
          </button>

          <button className="w-full bg-blue-50 border border-blue-200 rounded-xl p-3 text-left">
            <div className="flex gap-3">
              <span className="text-2xl">📸</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">NTFP採取活動の写真をアップロード</p>
                <p className="text-xs text-gray-600">活動の証拠を残す</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
        <h2 className="font-bold mb-3">🗓️ 今年の作業の流れ</h2>
        {workflowSteps.map((step, idx) => (
          <div key={step.id} className="flex gap-3 mb-3 last:mb-0">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.status === 'completed' ? 'bg-emerald-500 text-white' :
                  step.status === 'current' ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-400'
                }`}
              >
                {step.status === 'completed' ? <Check className="w-5 h-5" /> :
                 step.status === 'current' ? <AlertCircle className="w-5 h-5" /> :
                 <Circle className="w-5 h-5" />}
              </div>
              {idx < workflowSteps.length - 1 && (
                <div className={`w-0.5 h-8 ${step.status === 'completed' ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${step.status === 'current' ? 'text-blue-600' : ''}`}>
                {step.name}
              </p>
              <p className="text-xs text-gray-600">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs text-gray-600">現在実施中の活動</p>
          <p className="text-2xl font-bold text-blue-600">2</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs text-gray-600">終わった活動</p>
          <p className="text-2xl font-bold text-emerald-600">1</p>
        </div>
      </div>

      {showInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowInfo(false)}>
          <div className="bg-white rounded-2xl p-6 m-4 max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-3">💡 予算について</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>今年使えるお金：</strong>森を守る活動のために、今年使える全部のお金です。</p>
              <p><strong>今まで使った分：</strong>活動を始めてから、今までに使ったお金の合計です。</p>
            </div>
            <button onClick={() => setShowInfo(false)} className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg">
              わかりました
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PlanTab({ user }: { user: DemoUser }) {
  const [subTab, setSubTab] = useState<'ideas' | 'meetings' | 'plan'>('ideas');
  const [year, setYear] = useState(2025);

  return (
    <div>
      <div className="bg-white border-b px-4 py-3">
        <h1 className="text-xl font-bold">計画・アイデア</h1>
      </div>

      <div className="bg-white border-b flex text-xs">
        {['ideas', 'meetings', 'plan'].map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab as any)}
            className={`flex-1 py-3 font-semibold border-b-2 ${subTab === tab ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent'}`}
          >
            {tab === 'ideas' ? 'アイデア' : tab === 'meetings' ? '会議' : '計画入力'}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3">
        {subTab === 'ideas' && (
          <>
            <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-2 border rounded-lg text-sm">
              <option value={2025}>2025年（今年）</option>
              <option value={2024}>2024年</option>
            </select>

            {user.role === 'Community Member' && year === 2025 && (
              <button className="w-full bg-blue-600 text-white rounded-xl py-3">💡 新しいアイデアを提出</button>
            )}

            <IdeaCard title="コミュニティの種子銀行" status="選ばれた" color="emerald" />
            <IdeaCard title="堆肥化施設の建設" status="検討中" color="blue" />
            <IdeaCard title="若者向け森林教育" status="提出済み" color="amber" />
          </>
        )}

        {subTab === 'meetings' && (
          <>
            {user.role === 'CMB' && (
              <button className="w-full bg-blue-600 text-white rounded-xl py-3">新しい会議を設定</button>
            )}
            <MeetingCard date="2025年11月20日" title="活動計画会議" participants={45} />
            <MeetingCard date="2025年10月15日" title="予算承認会議" participants={38} hasMinutes />
          </>
        )}

        {subTab === 'plan' && user.role === 'CMB' && (
          <>
            <button className="w-full bg-emerald-600 text-white rounded-xl py-3">新しい活動計画を作成</button>
            <PlanCard title="森林パトロール・保護活動" status="予算入力中" />
            <PlanCard title="非木材林産物の採取" status="承認済み" />
          </>
        )}
      </div>
    </div>
  );
}

function ActivityTab({ user }: { user: DemoUser }) {
  const [subTab, setSubTab] = useState<'activities' | 'reporting'>('activities');
  const [year, setYear] = useState(2025);

  return (
    <div>
      <div className="bg-white border-b px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">活動管理</h1>
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-1.5 border rounded-lg text-xs">
          <option value={2025}>2025年</option>
          <option value={2024}>2024年</option>
        </select>
      </div>

      <div className="bg-emerald-500 p-4 text-white">
        <div className="flex justify-between mb-2">
          <div>
            <p className="text-xs">全体予算</p>
            <p className="text-2xl font-bold">50M VND</p>
          </div>
          <div className="text-right">
            <p className="text-xs">使用済み</p>
            <p className="text-2xl font-bold">9.5M VND</p>
          </div>
        </div>
        <div className="h-3 bg-white bg-opacity-30 rounded-full">
          <div className="h-full bg-white rounded-full" style={{ width: '19%' }}></div>
        </div>
        <p className="text-xs text-center mt-1">19% 使用済み</p>
      </div>

      <div className="bg-white border-b flex text-xs">
        {['activities', 'reporting'].map(tab => (
          <button
            key={tab}
            onClick={() => setSubTab(tab as any)}
            className={`flex-1 py-3 font-semibold border-b-2 ${subTab === tab ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent'}`}
          >
            {tab === 'activities' ? '活動一覧' : '報告・記録'}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3">
        {subTab === 'activities' && (
          <>
            <ActivityCard title="森林パトロール・保護活動" budget="24M VND" progress={50} />
            <ActivityCard title="非木材林産物の採取" budget="16M VND" progress={30} />
            <ActivityCard title="コミュニティ研修" budget="10M VND" progress={25} />
          </>
        )}

        {subTab === 'reporting' && user.role === 'CMB' && (
          <>
            <button className="w-full bg-blue-600 text-white rounded-xl py-4">📝 活動記録を入力</button>
            <button className="w-full bg-emerald-600 text-white rounded-xl py-4">📸 写真・レシートをアップロード</button>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6">
              <p className="text-sm font-semibold mb-2">📊 最終報告書</p>
              <button className="w-full bg-amber-600 text-white rounded-lg py-2 text-sm">最終報告書PDFを作成</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SettingsTab({ user, onLogout }: any) {
  return (
    <div>
      <div className="bg-white border-b px-4 py-3">
        <h1 className="text-xl font-bold">設定</h1>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">アカウント情報</p>
          <div className="bg-white rounded-xl p-4 border space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">名前</span>
              <span className="text-sm font-semibold">{user.name}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">役割</span>
              <span className="text-sm font-semibold">{user.role}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-600">コミュニティ</span>
              <span className="text-sm font-semibold">{user.communityName}</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">言語選択</p>
          <div className="space-y-2">
            <button className="w-full bg-gray-100 rounded-lg py-3 font-semibold">日本語</button>
            <button className="w-full bg-gray-50 text-gray-500 rounded-lg py-3">ไทย (Thai)</button>
            <button className="w-full bg-gray-50 text-gray-500 rounded-lg py-3">English</button>
          </div>
        </div>

        <button onClick={onLogout} className="w-full bg-red-500 text-white rounded-xl py-3 font-semibold">
          ログアウト
        </button>
      </div>
    </div>
  );
}

function IdeaCard({ title, status, color }: any) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
  };

  return (
    <div className="bg-white rounded-xl p-4 border flex justify-between items-start">
      <h3 className="font-semibold text-sm flex-1">{title}</h3>
      <span className={`${colors[color]} text-white text-xs px-2 py-1 rounded-lg ml-2`}>{status}</span>
    </div>
  );
}

function MeetingCard({ date, title, participants, hasMinutes }: any) {
  return (
    <div className="bg-white rounded-xl p-4 border">
      <p className="text-sm font-bold">{title}</p>
      <p className="text-xs text-gray-600 mt-1">{date}</p>
      <p className="text-xs text-gray-500 mt-1">参加者: {participants}名</p>
      {hasMinutes && (
        <button className="mt-3 w-full bg-blue-100 text-blue-600 rounded-lg py-2 text-xs">議事録を見る</button>
      )}
    </div>
  );
}

function PlanCard({ title, status }: any) {
  return (
    <div className="bg-white rounded-xl p-4 border flex justify-between items-center">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-blue-600 mt-1">{status}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
  );
}

function ActivityCard({ title, budget, progress }: any) {
  return (
    <button className="w-full bg-white rounded-xl p-4 border text-left">
      <h3 className="font-semibold text-sm mb-2">{title}</h3>
      <p className="text-xs text-gray-600 mb-3">予算: {budget}</p>
      <div className="flex justify-between text-xs mb-1">
        <span>進捗度</span>
        <span className="font-semibold text-blue-600">{progress}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full">
        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
    </button>
  );
}
