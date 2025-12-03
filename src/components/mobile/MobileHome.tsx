import { useState } from 'react';
import { Info } from 'lucide-react';
import { DemoUser, FiscalYearData, NavigationProps } from './types';
import { MobileWorkflow } from './MobileWorkflow';

interface MobileHomeProps extends NavigationProps {
  user: DemoUser;
  fiscalYearData: FiscalYearData | null;
  loading: boolean;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}

export function MobileHome({
  user,
  fiscalYearData,
  loading,
  selectedYear,
  setSelectedYear,
  setActiveTab,
  setSubTab
}: MobileHomeProps) {
  const [showInfo, setShowInfo] = useState(false);

  const nextActions = [
    { icon: '📝', title: '森林パトロールの予算詳細を入力', subtitle: '備品や人件費の内訳を記入', urgent: true },
    { icon: '📸', title: 'NTFP採取活動の写真をアップロード', subtitle: '活動の証拠を残す', urgent: false },
  ];

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
    <div className="p-4 space-y-4">
      <div>
        <p className="text-xs text-gray-500">{user.communityName}</p>
        <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
        <p className="text-sm text-emerald-600 font-medium">{user.role}</p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">年度:</span>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value={2025}>2025年（今年）</option>
          <option value={2024}>2024年</option>
          <option value={2023}>2023年</option>
        </select>
      </div>

      {loading ? (
        <div className="bg-gray-200 rounded-2xl h-48 animate-pulse"></div>
      ) : fiscalYearData ? (
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-90">今年のコミュニティの予算 ({selectedYear})</p>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-colors"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <p className="text-3xl font-bold mb-4">{formatAmount(fiscalYearData.totalBudget)} VND</p>

          <div className="bg-white bg-opacity-20 rounded-xl p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <span>💰</span>
                <span>今年使えるお金</span>
              </span>
              <span className="font-semibold">{formatAmount(fiscalYearData.totalBudget)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <span>✅</span>
                <span>今まで使った分</span>
              </span>
              <span className="font-semibold">{formatAmount(fiscalYearData.totalSpent)}</span>
            </div>
            <div className="h-2 bg-white bg-opacity-30 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${usagePercent}%` }}></div>
            </div>
            <p className="text-xs text-center opacity-90">使った割合: {usagePercent}%</p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
          <p className="text-sm text-amber-900">データを読み込めませんでした</p>
        </div>
      )}

      {selectedYear === 2025 && fiscalYearData && !fiscalYearData.workflowStatus.finalReportSubmitted && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <h2 className="font-bold text-gray-900 mb-1">📌 次にやること</h2>
          <p className="text-xs text-gray-600 mb-3">これを完了させましょう</p>

          <div className="space-y-2">
            {nextActions.map((action, idx) => (
              <button
                key={idx}
                className="w-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 text-left hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{action.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900">{action.title}</p>
                      {action.urgent && (
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">急ぎ</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{action.subtitle}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <MobileWorkflow
        fiscalYearData={fiscalYearData}
        setActiveTab={setActiveTab}
        setSubTab={setSubTab}
      />

      {fiscalYearData && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">現在実施中の活動</p>
            <p className="text-2xl font-bold text-blue-600">{fiscalYearData.ongoingCount}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">終わった活動</p>
            <p className="text-2xl font-bold text-emerald-600">{fiscalYearData.completedCount}</p>
          </div>
        </div>
      )}

      {showInfo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowInfo(false)}
        >
          <div className="bg-white rounded-2xl p-6 m-4 max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-gray-900 mb-3">💡 予算について</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>今年使えるお金：</strong><br />森を守る活動のために、今年使える全部のお金です。</p>
              <p><strong>今まで使った分：</strong><br />活動を始めてから、今までに使ったお金の合計です。</p>
              <p><strong>使った割合：</strong><br />全体のお金のうち、どれくらい使ったかをパーセントで表しています。</p>
            </div>
            <button
              onClick={() => setShowInfo(false)}
              className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              わかりました
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
