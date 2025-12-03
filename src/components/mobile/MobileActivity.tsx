import { useState } from 'react';
import { DemoUser, ActivitySubTab, FiscalYearData } from './types';

interface MobileActivityProps {
  user: DemoUser;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  fiscalYearData: FiscalYearData | null;
  initialSubTab?: string;
}

export function MobileActivity({ user, selectedYear, setSelectedYear, fiscalYearData, initialSubTab }: MobileActivityProps) {
  const [subTab, setSubTab] = useState<ActivitySubTab>(initialSubTab as ActivitySubTab || 'activities');

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    return `${(amount / 1000).toFixed(0)}K`;
  };

  const usagePercent = fiscalYearData
    ? Math.round((fiscalYearData.totalSpent / fiscalYearData.totalBudget) * 100)
    : 0;

  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-900">活動管理</h1>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white"
          >
            <option value={2025}>2025年</option>
            <option value={2024}>2024年</option>
            <option value={2023}>2023年</option>
          </select>
        </div>
      </div>

      {fiscalYearData && (
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 text-white">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-xs opacity-90">全体予算</p>
              <p className="text-2xl font-bold">{formatAmount(fiscalYearData.totalBudget)} VND</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-90">使用済み</p>
              <p className="text-2xl font-bold">{formatAmount(fiscalYearData.totalSpent)} VND</p>
            </div>
          </div>
          <div className="h-3 bg-white bg-opacity-30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${usagePercent}%` }}></div>
          </div>
          <p className="text-xs text-center mt-1 opacity-90">{usagePercent}% 使用済み</p>
        </div>
      )}

      <div className="bg-white border-b border-gray-200 flex text-xs">
        <button
          onClick={() => setSubTab('activities')}
          className={`flex-1 py-3 font-semibold border-b-2 ${subTab === 'activities' ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent'}`}
        >
          活動一覧
        </button>
        <button
          onClick={() => setSubTab('reporting')}
          className={`flex-1 py-3 font-semibold border-b-2 ${subTab === 'reporting' ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent'}`}
        >
          報告・記録
        </button>
      </div>

      <div className="p-4 space-y-3">
        {subTab === 'activities' && <ActivitiesTab selectedYear={selectedYear} />}
        {subTab === 'reporting' && <ReportingTab user={user} selectedYear={selectedYear} />}
      </div>
    </div>
  );
}

function ActivitiesTab({ selectedYear }: { selectedYear: number }) {
  if (selectedYear === 2025) {
    return (
      <>
        <ActivityCard title="森林パトロール・保護活動" budget="24M VND" progress={50} status="ongoing" />
        <ActivityCard title="非木材林産物の採取" budget="16M VND" progress={30} status="ongoing" />
        <ActivityCard title="コミュニティ研修" budget="10M VND" progress={100} status="completed" />
      </>
    );
  }

  if (selectedYear === 2024) {
    return (
      <>
        <ActivityCard title="持続可能な森林管理訓練" budget="15M VND" progress={100} status="completed" />
        <ActivityCard title="エコツーリズム開発" budget="12M VND" progress={100} status="completed" />
        <ActivityCard title="炭焼き技術改善" budget="10M VND" progress={100} status="completed" />
      </>
    );
  }

  return (
    <>
      <ActivityCard title="森林保護活動" budget="18M VND" progress={100} status="completed" />
      <ActivityCard title="NTFP採取訓練" budget="15M VND" progress={100} status="completed" />
    </>
  );
}

function ReportingTab({ user, selectedYear }: { user: DemoUser; selectedYear: number }) {
  const isCompleted = selectedYear < 2025;

  if (user.role !== 'CMB') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
        <p className="text-sm text-amber-900">この機能はCMBメンバーのみ利用できます</p>
      </div>
    );
  }

  return (
    <>
      {!isCompleted && (
        <>
          <button className="w-full bg-blue-600 text-white rounded-xl py-4 font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <span className="text-xl">📝</span>
            活動記録を入力
          </button>

          <button className="w-full bg-emerald-600 text-white rounded-xl py-4 font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
            <span className="text-xl">📸</span>
            写真・レシートをアップロード
          </button>
        </>
      )}

      <div className={`${isCompleted ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'} border rounded-xl p-4 mt-2`}>
        <p className={`text-sm font-semibold ${isCompleted ? 'text-blue-900' : 'text-amber-900'} mb-2`}>
          📊 最終報告書
        </p>
        <p className={`text-xs ${isCompleted ? 'text-blue-800' : 'text-amber-800'} mb-3`}>
          {isCompleted
            ? `${selectedYear}年度の活動報告書をダウンロードできます。`
            : '1年間の活動をまとめた報告書を作成できます。'}
        </p>
        <button className={`w-full ${isCompleted ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700'} text-white rounded-lg py-2 font-medium text-sm transition-colors`}>
          {isCompleted ? '最終報告書PDFをダウンロード' : '最終報告書PDFを作成'}
        </button>
      </div>

      {!isCompleted && (
        <>
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">最近のアップロード</h3>
            <ReceiptCard date="2025年11月15日" item="燃料購入" amount="45,000 VND" verified />
            <div className="mt-2">
              <ReceiptCard date="2025年11月10日" item="無線機購入" amount="1,800,000 VND" verified />
            </div>
            <div className="mt-2">
              <ReceiptCard date="2025年11月5日" item="安全装備" amount="900,000 VND" verified={false} />
            </div>
          </div>
        </>
      )}
    </>
  );
}

function ActivityCard({ title, budget, progress, status }: {
  title: string;
  budget: string;
  progress: number;
  status: 'ongoing' | 'completed';
}) {
  return (
    <button className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-left hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-sm flex-1">{title}</h3>
        {status === 'completed' && (
          <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-lg font-semibold whitespace-nowrap ml-2">
            完了
          </span>
        )}
      </div>
      <p className="text-xs text-gray-600 mb-3">予算: {budget}</p>

      <div className="mb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-600">進捗度</span>
          <span className={`font-semibold ${status === 'completed' ? 'text-emerald-600' : 'text-blue-600'}`}>
            {progress}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${status === 'completed' ? 'bg-emerald-600' : 'bg-blue-600'}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-500">詳細を見る</span>
        <span className="text-gray-400">→</span>
      </div>
    </button>
  );
}

function ReceiptCard({ date, item, amount, verified }: {
  date: string;
  item: string;
  amount: string;
  verified: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{item}</p>
          <p className="text-xs text-gray-600 mt-1">{date}</p>
        </div>
        {verified ? (
          <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-lg font-semibold whitespace-nowrap">
            ✓ 確認済み
          </span>
        ) : (
          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-lg font-semibold whitespace-nowrap">
            確認待ち
          </span>
        )}
      </div>
      <p className="text-sm font-bold text-gray-900">{amount}</p>
      <button className="mt-2 text-xs text-blue-600 underline hover:text-blue-700">画像を見る</button>
    </div>
  );
}
