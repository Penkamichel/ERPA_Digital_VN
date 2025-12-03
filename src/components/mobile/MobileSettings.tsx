import { DemoUser } from './types';

interface MobileSettingsProps {
  user: DemoUser;
  onLogout: () => void;
}

export function MobileSettings({ user, onLogout }: MobileSettingsProps) {
  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">設定</h1>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">アカウント情報</p>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-3">
            <InfoRow label="名前" value={user.name} />
            <InfoRow label="役割" value={user.role} />
            <InfoRow label="コミュニティ" value={user.communityName} />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">言語選択</p>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-2">
            <button className="w-full bg-gray-100 text-gray-700 rounded-lg py-3 font-semibold hover:bg-gray-200 transition-colors">
              日本語
            </button>
            <button className="w-full bg-gray-50 text-gray-500 rounded-lg py-3 font-semibold hover:bg-gray-100 transition-colors">
              ไทย (Thai)
            </button>
            <button className="w-full bg-gray-50 text-gray-500 rounded-lg py-3 font-semibold hover:bg-gray-100 transition-colors">
              English
            </button>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full bg-red-500 text-white rounded-xl py-3 font-semibold hover:bg-red-600 transition-colors"
        >
          ログアウト
        </button>

        <div className="text-center text-xs text-gray-500">
          <p>Provincial Fund Management System</p>
          <p className="mt-1">Version 1.0.0 © 2025</p>
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
