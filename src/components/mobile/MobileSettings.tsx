import { DemoUser } from './types';
import { useLanguage } from '../../contexts/LanguageContext';

interface MobileSettingsProps {
  user: DemoUser;
  onLogout: () => void;
}

export function MobileSettings({ user, onLogout }: MobileSettingsProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">{t('settings')}</h1>
      </div>

      <div className="p-4 space-y-6">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
            {language === 'en' ? 'Account Information' : language === 'vi' ? 'Thông tin tài khoản' : 'アカウント情報'}
          </p>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-3">
            <InfoRow
              label={language === 'en' ? 'Name' : language === 'vi' ? 'Tên' : '名前'}
              value={user.name}
            />
            <InfoRow
              label={language === 'en' ? 'Role' : language === 'vi' ? 'Vai trò' : '役割'}
              value={user.role}
            />
            <InfoRow
              label={language === 'en' ? 'Community' : language === 'vi' ? 'Cộng đồng' : 'コミュニティ'}
              value={user.communityName}
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{t('select_language')}</p>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 space-y-2">
            <button
              onClick={() => setLanguage('ja')}
              className={`w-full rounded-lg py-3 font-semibold transition-colors ${
                language === 'ja'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {t('japanese')} (日本語)
            </button>
            <button
              onClick={() => setLanguage('vi')}
              className={`w-full rounded-lg py-3 font-semibold transition-colors ${
                language === 'vi'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {t('vietnamese')} (Tiếng Việt)
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`w-full rounded-lg py-3 font-semibold transition-colors ${
                language === 'en'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {t('english')} (English)
            </button>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full bg-red-500 text-white rounded-xl py-3 font-semibold hover:bg-red-600 transition-colors"
        >
          {language === 'en' ? 'Logout' : language === 'vi' ? 'Đăng xuất' : 'ログアウト'}
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
