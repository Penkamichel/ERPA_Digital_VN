import { useState, useEffect } from 'react';
import { DemoUser, ActivitySubTab, FiscalYearData } from './types';
import { ActivityDetail } from './ActivityDetail';
import { ActivityLogForm } from './forms/ActivityLogForm';
import { ReceiptForm } from './forms/ReceiptForm';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';

interface MobileActivityProps {
  user: DemoUser;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  fiscalYearData: FiscalYearData | null;
  initialSubTab?: string;
  communityId: string;
  fiscalYearId: string;
}

interface Activity {
  id: string;
  activity_name: string;
  total_budget: number;
  status: string;
  period_start: string;
  period_end: string;
}

export function MobileActivity({ user, selectedYear, setSelectedYear, fiscalYearData, initialSubTab, communityId, fiscalYearId }: MobileActivityProps) {
  const { t } = useLanguage();
  const [subTab, setSubTab] = useState<ActivitySubTab>(initialSubTab as ActivitySubTab || 'activities');
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [showActivityLogForm, setShowActivityLogForm] = useState(false);
  const [showReceiptForm, setShowReceiptForm] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadActivities();
  }, [selectedYear]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const { data: community } = await supabase
        .from('communities')
        .select('id')
        .eq('name', 'Ban Pho Village')
        .maybeSingle();

      if (!community) {
        setLoading(false);
        return;
      }

      const { data: fy } = await supabase
        .from('fiscal_years')
        .select('id')
        .eq('year', selectedYear)
        .maybeSingle();

      if (!fy) {
        setLoading(false);
        return;
      }

      const { data: activitiesData } = await supabase
        .from('plan_activities')
        .select('id, activity_name, total_budget, status, period_start, period_end')
        .eq('community_id', community.id)
        .eq('fiscal_year_id', fy.id)
        .in('status', ['approved', 'ongoing', 'completed'])
        .order('created_at', { ascending: false });

      setActivities(activitiesData || []);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    return `${(amount / 1000).toFixed(0)}K`;
  };

  const usagePercent = fiscalYearData
    ? Math.round((fiscalYearData.totalSpent / fiscalYearData.totalBudget) * 100)
    : 0;

  if (showActivityLogForm) {
    return (
      <ActivityLogForm
        communityId={communityId}
        fiscalYearId={fiscalYearId}
        onBack={() => setShowActivityLogForm(false)}
        onSuccess={() => {
          setShowActivityLogForm(false);
          loadActivities();
        }}
      />
    );
  }

  if (showReceiptForm) {
    return (
      <ReceiptForm
        communityId={communityId}
        fiscalYearId={fiscalYearId}
        onBack={() => setShowReceiptForm(false)}
        onSuccess={() => {
          setShowReceiptForm(false);
          loadActivities();
        }}
      />
    );
  }

  if (selectedActivityId) {
    return (
      <ActivityDetail
        activityId={selectedActivityId}
        onBack={() => setSelectedActivityId(null)}
      />
    );
  }

  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl font-bold text-gray-900">{t('activity')}</h1>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white"
          >
            <option value={2025}>2025{t('fiscal_year') !== 'fiscal_year' ? ` (${t('fiscal_year')})` : ''}</option>
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
          </select>
        </div>
      </div>

      {fiscalYearData && (
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 text-white">
          <div className="flex justify-between items-center mb-2">
            <div>
              <p className="text-xs opacity-90">{t('total_budget')}</p>
              <p className="text-2xl font-bold">{formatAmount(fiscalYearData.totalBudget)} VND</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-90">{t('used')}</p>
              <p className="text-2xl font-bold">{formatAmount(fiscalYearData.totalSpent)} VND</p>
            </div>
          </div>
          <div className="h-3 bg-white bg-opacity-30 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${usagePercent}%` }}></div>
          </div>
          <p className="text-xs text-center mt-1 opacity-90">{usagePercent}% {t('used')}</p>
        </div>
      )}

      <div className="bg-white border-b border-gray-200 flex text-xs">
        <button
          onClick={() => setSubTab('activities')}
          className={`flex-1 py-3 font-semibold border-b-2 ${subTab === 'activities' ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent'}`}
        >
          {t('activity_list')}
        </button>
        <button
          onClick={() => setSubTab('reporting')}
          className={`flex-1 py-3 font-semibold border-b-2 ${subTab === 'reporting' ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent'}`}
        >
          {t('reporting')}
        </button>
      </div>

      <div className="p-4 space-y-3">
        {subTab === 'activities' && (
          <ActivitiesTab
            activities={activities}
            loading={loading}
            onActivityClick={setSelectedActivityId}
          />
        )}
        {subTab === 'reporting' && (
          <ReportingTab
            user={user}
            selectedYear={selectedYear}
            onOpenActivityLogForm={() => setShowActivityLogForm(true)}
            onOpenReceiptForm={() => setShowReceiptForm(true)}
          />
        )}
      </div>
    </div>
  );
}

function ActivitiesTab({ activities, loading, onActivityClick }: {
  activities: Activity[];
  loading: boolean;
  onActivityClick: (id: string) => void;
}) {
  const { t } = useLanguage();
  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    return `${(amount / 1000).toFixed(0)}K`;
  };

  const getProgress = (status: string) => {
    const progressMap: Record<string, number> = {
      draft: 0,
      submitted: 20,
      approved: 40,
      ongoing: 70,
      completed: 100,
      cancelled: 0,
    };
    return progressMap[status] || 0;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-gray-100 rounded-xl p-8 text-center">
        <p className="text-sm text-gray-600">{t('no_activities')}</p>
      </div>
    );
  }

  return (
    <>
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          title={activity.activity_name}
          budget={formatAmount(activity.total_budget)}
          progress={getProgress(activity.status)}
          status={activity.status}
          onClick={() => onActivityClick(activity.id)}
        />
      ))}
    </>
  );
}

function ReportingTab({ user, selectedYear, onOpenActivityLogForm, onOpenReceiptForm }: {
  user: DemoUser;
  selectedYear: number;
  onOpenActivityLogForm: () => void;
  onOpenReceiptForm: () => void;
}) {
  const { t } = useLanguage();
  const isCompleted = selectedYear < 2025;

  if (user.role !== 'CMB') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
        <p className="text-sm text-amber-900">{t('cmb_only')}</p>
      </div>
    );
  }

  return (
    <>
      {!isCompleted && (
        <>
          <button
            onClick={onOpenActivityLogForm}
            className="w-full bg-blue-600 text-white rounded-xl py-4 font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-xl">📝</span>
            {t('submit_activity_log')}
          </button>

          <button
            onClick={onOpenReceiptForm}
            className="w-full bg-emerald-600 text-white rounded-xl py-4 font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-xl">📸</span>
            {t('upload_receipt')}
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

function ActivityCard({ title, budget, progress, status, onClick }: {
  title: string;
  budget: string;
  progress: number;
  status: string;
  onClick: () => void;
}) {
  const { t } = useLanguage();
  const isCompleted = status === 'completed';

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-200 text-left hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-sm flex-1">{title}</h3>
        {isCompleted && (
          <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-lg font-semibold whitespace-nowrap ml-2">
            {t('completed')}
          </span>
        )}
      </div>
      <p className="text-xs text-gray-600 mb-3">{t('budget')}: {budget} VND</p>

      <div className="mb-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-600">{t('progress')}</span>
          <span className={`font-semibold ${isCompleted ? 'text-emerald-600' : 'text-blue-600'}`}>
            {progress}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isCompleted ? 'bg-emerald-600' : 'bg-blue-600'}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs text-blue-600 font-medium">{t('view_details')}</span>
        <span className="text-blue-600">→</span>
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
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">{item}</p>
          <p className="text-xs text-gray-600 mt-1">{date}</p>
        </div>
        {verified ? (
          <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-lg font-semibold whitespace-nowrap">
            ✓ {t('verified')}
          </span>
        ) : (
          <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-lg font-semibold whitespace-nowrap">
            {t('pending')}
          </span>
        )}
      </div>
      <p className="text-sm font-bold text-gray-900">{amount}</p>
      <button className="mt-2 text-xs text-blue-600 underline hover:text-blue-700">
        {t('view_details')}
      </button>
    </div>
  );
}
