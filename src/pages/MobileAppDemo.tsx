import { useState } from 'react';

type Tab = 'home' | 'participate' | 'monitor' | 'settings';
type UserRole = 'CMB' | 'Community Member' | 'Forest Owner' | 'CPC';

interface DemoUser {
  id: string;
  name: string;
  role: UserRole;
  communityName: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    id: '1',
    name: 'Siriporn (CMB Coordinator)',
    role: 'CMB',
    communityName: 'Ban Pho Village',
  },
  {
    id: '2',
    name: 'Somchai (Community Member)',
    role: 'Community Member',
    communityName: 'Ban Pho Village',
  },
  {
    id: '3',
    name: 'Thawatchai (Forest Owner)',
    role: 'Forest Owner',
    communityName: 'Ban Pho Village',
  },
  {
    id: '4',
    name: 'Anan (CPC Representative)',
    role: 'CPC',
    communityName: 'Ban Pho Village',
  },
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Select Demo User</h2>
            <p className="text-sm text-gray-600 mb-4">Choose a role to explore the app</p>

            <div className="space-y-3">
              {DEMO_USERS.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user as DemoUser)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{user.name}</div>
                      <div className="text-sm font-medium text-blue-600">{user.role}</div>
                      <div className="text-xs text-gray-500">{user.communityName}</div>
                    </div>
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <span className="text-blue-600">→</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">Demo Mode • No authentication required</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Phone Frame */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative">
          {/* Phone Frame */}
          <div className="w-[375px] h-[667px] bg-black rounded-[3rem] p-3 shadow-2xl">
            {/* Screen */}
            <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
              {/* Status Bar */}
              <div className="bg-white px-4 py-2 flex items-center justify-between text-xs">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <span>📶</span>
                  <span>📡</span>
                  <span>🔋</span>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-auto">
                {activeTab === 'home' && <HomeTab user={selectedUser} />}
                {activeTab === 'participate' && <ParticipateTab user={selectedUser} />}
                {activeTab === 'monitor' && <MonitorTab user={selectedUser} />}
                {activeTab === 'settings' && <SettingsTab user={selectedUser} onLogout={() => setSelectedUser(null)} />}
              </div>

              {/* Bottom Navigation */}
              <div className="bg-white border-t border-gray-200 flex">
                <TabButton icon="🏠" label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                <TabButton icon="👥" label="Participate" active={activeTab === 'participate'} onClick={() => setActiveTab('participate')} />
                <TabButton icon="📊" label="Monitor" active={activeTab === 'monitor'} onClick={() => setActiveTab('monitor')} />
                <TabButton icon="⚙️" label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
              </div>
            </div>
          </div>

          {/* Back to Login Button */}
          <button
            onClick={() => setSelectedUser(null)}
            className="absolute -top-4 -right-4 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 shadow-lg"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

function TabButton({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) {
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
  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Welcome, {user.name}</h1>
        <p className="text-sm text-gray-600">{user.role}</p>
      </div>

      <div className="bg-blue-100 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-2xl">📅</div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-blue-800 uppercase">Next Meeting</p>
            <p className="text-sm font-bold text-blue-900">Dec 15, 2025</p>
            <p className="text-xs text-blue-700">Review Q4 Progress</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
        <p className="text-xs opacity-80 mb-1">Fiscal Year: 2025</p>
        <div className="flex items-baseline gap-2 mb-3">
          <p className="text-3xl font-bold">50M</p>
          <p className="text-sm">VND Total Budget</p>
        </div>
        <div className="flex justify-between text-xs">
          <div>
            <p className="opacity-80">Spent</p>
            <p className="font-semibold">9.5M (19%)</p>
          </div>
          <div>
            <p className="opacity-80">Activities</p>
            <p className="font-semibold">3 Total</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-xs text-gray-600">Active</p>
          <p className="text-2xl font-bold text-gray-900">2</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-xs text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-emerald-600">1</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
        {user.role === 'CMB' && (
          <>
            <ActionButton icon="📝" text="Create Plan & Budget" />
            <ActionButton icon="📸" text="Upload Receipt/Photo" />
            <ActionButton icon="📊" text="Submit Activity Report" />
          </>
        )}
        {user.role === 'Community Member' && (
          <>
            <ActionButton icon="💡" text="Submit New Idea" />
            <ActionButton icon="📋" text="Browse Submitted Ideas" />
          </>
        )}
        {(user.role === 'Forest Owner' || user.role === 'CPC') && (
          <>
            <ActionButton icon="👁️" text="Review Plan & Budget" />
            <ActionButton icon="💬" text="Add Comment" />
          </>
        )}
      </div>
    </div>
  );
}

function ParticipateTab({ user }: { user: DemoUser }) {
  const [subTab, setSubTab] = useState<'ideas' | 'meetings'>('ideas');

  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Participate</h1>
      </div>

      <div className="bg-white border-b border-gray-200 flex">
        <button
          onClick={() => setSubTab('ideas')}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 ${subTab === 'ideas' ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent'}`}
        >
          Ideas
        </button>
        <button
          onClick={() => setSubTab('meetings')}
          className={`flex-1 py-3 text-sm font-semibold border-b-2 ${subTab === 'meetings' ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent'}`}
        >
          Meetings
        </button>
      </div>

      <div className="p-4 space-y-3">
        {subTab === 'ideas' && (
          <>
            {user.role === 'Community Member' && (
              <button className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold">
                💡 Submit New Idea
              </button>
            )}

            <IdeaCard title="Community Seed Bank" status="approved" by="Somchai Prasert" />
            <IdeaCard title="Composting Facility" status="under_review" by="Nittaya Wongsawat" />
            <IdeaCard title="Youth Education Program" status="submitted" by="Prakit Thongchai" />
          </>
        )}

        {subTab === 'meetings' && (
          <>
            <MeetingCard date="Nov 20, 2025" chair="Village Chief" agenda="Activity Planning Session" participants={45} />
            <MeetingCard date="Oct 15, 2025" chair="CMB Leader" agenda="Budget Approval Meeting" participants={38} hasMinutes />
            <MeetingCard date="Sep 10, 2025" chair="Forest Officer" agenda="Progress Review Q3" participants={42} hasMinutes />
          </>
        )}
      </div>
    </div>
  );
}

function MonitorTab({ user }: { user: DemoUser }) {
  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Monitor Activities</h1>
      </div>

      <div className="p-4 space-y-3">
        <ActivityCard
          name="Forest Patrol and Protection"
          progress={50}
          budget="24M VND"
          foPercent={70}
          commPercent={20}
          otherPercent={10}
          receipts={5}
          photos={8}
        />
        <ActivityCard
          name="NTFP Collection"
          progress={30}
          budget="16M VND"
          foPercent={60}
          commPercent={30}
          otherPercent={10}
          receipts={2}
          photos={12}
        />
        <ActivityCard
          name="Community Training"
          progress={25}
          budget="10M VND"
          foPercent={80}
          commPercent={15}
          otherPercent={5}
          receipts={3}
          photos={6}
        />
      </div>
    </div>
  );
}

function SettingsTab({ user, onLogout }: { user: DemoUser; onLogout: () => void }) {
  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Account</p>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-3">
            <InfoRow label="Name" value={user.name} />
            <InfoRow label="Role" value={user.role} />
            <InfoRow label="Community" value={user.communityName} />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Language</p>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-2">
            <button className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold">English</button>
            <button className="w-full bg-gray-100 text-gray-700 rounded-lg py-3 font-semibold">ไทย (Thai)</button>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Offline Mode</p>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600">Connection Status</p>
                <p className="text-sm font-semibold text-gray-900">Online</p>
              </div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            </div>
            <p className="text-xs text-gray-500 mb-2">Pending Sync: 0 items</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Grievance Mechanism</p>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y">
            <button className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50">
              <span className="text-xl">📞</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">Hotline</p>
                <p className="text-xs text-gray-500">Call Provincial Fund Support</p>
              </div>
            </button>
            <button className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50">
              <span className="text-xl">✉️</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">Email</p>
                <p className="text-xs text-gray-500">grievance@provincialfund.gov</p>
              </div>
            </button>
            <button className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50">
              <span className="text-xl">📝</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">Online Form</p>
                <p className="text-xs text-gray-500">Submit anonymous complaint</p>
              </div>
            </button>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full bg-red-500 text-white rounded-xl py-3 font-semibold hover:bg-red-600"
        >
          Logout
        </button>

        <div className="text-center text-xs text-gray-500">
          <p>Provincial Fund Management System</p>
          <p className="mt-1">Version 1.0.0 • © 2025</p>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, text }: { icon: string; text: string }) {
  return (
    <button className="w-full flex items-center gap-3 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
      <span className="text-xl">{icon}</span>
      <span className="text-sm text-gray-700">{text}</span>
    </button>
  );
}

function IdeaCard({ title, status, by }: { title: string; status: string; by: string }) {
  const statusColors: Record<string, string> = {
    approved: 'bg-emerald-500',
    under_review: 'bg-blue-500',
    submitted: 'bg-amber-500',
  };
  const statusLabels: Record<string, string> = {
    approved: 'Approved',
    under_review: 'Under Review',
    submitted: 'Submitted',
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 flex-1">{title}</h3>
        <span className={`${statusColors[status]} text-white text-xs px-2 py-1 rounded-lg font-semibold`}>
          {statusLabels[status]}
        </span>
      </div>
      <p className="text-xs text-gray-500">By {by}</p>
    </div>
  );
}

function MeetingCard({ date, chair, agenda, participants, hasMinutes }: any) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <p className="text-sm font-bold text-gray-900">{date}</p>
      <p className="text-xs text-gray-600 mt-1">Chair: {chair}</p>
      <p className="text-sm text-gray-700 mt-2">{agenda}</p>
      <p className="text-xs text-gray-500 mt-2">👥 {participants} participants</p>
      {hasMinutes && (
        <button className="mt-3 w-full bg-blue-100 text-blue-600 rounded-lg py-2 text-sm font-semibold">
          View Full Minutes
        </button>
      )}
    </div>
  );
}

function ActivityCard({ name, progress, budget, foPercent, commPercent, otherPercent, receipts, photos }: any) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-3">{name}</h3>

      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold text-blue-600">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <p className="text-sm font-semibold text-gray-700 mb-2">Budget: {budget}</p>
      <div className="flex gap-3 text-xs mb-3">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-gray-600">FO: {foPercent}%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          <span className="text-gray-600">Comm: {commPercent}%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
          <span className="text-gray-600">Other: {otherPercent}%</span>
        </div>
      </div>

      <div className="flex gap-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <span>📄</span>
          <span>{receipts} receipts</span>
        </div>
        <div className="flex items-center gap-1">
          <span>📸</span>
          <span>{photos} photos</span>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}
