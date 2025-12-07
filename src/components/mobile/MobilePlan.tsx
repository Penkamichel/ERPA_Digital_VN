import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { DemoUser, PlanSubTab } from './types';
import { FundRegistrationForm } from './forms/FundRegistrationForm';
import { IdeaRegistrationForm } from './forms/IdeaRegistrationForm';
import { MeetingMinutesForm } from './forms/MeetingMinutesForm';
import { PlanBudgetForm } from './forms/PlanBudgetForm';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';

interface MobilePlanProps {
  user: DemoUser;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  initialSubTab?: string;
  communityId: string;
  fiscalYearId: string;
}

export function MobilePlan({ user, selectedYear, setSelectedYear, initialSubTab, communityId, fiscalYearId }: MobilePlanProps) {
  const { t } = useLanguage();
  const [subTab, setSubTab] = useState<PlanSubTab>(initialSubTab as PlanSubTab || 'fund');
  const [showFundForm, setShowFundForm] = useState(false);
  const [showIdeaForm, setShowIdeaForm] = useState(false);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);

  if (showFundForm) {
    return (
      <FundRegistrationForm
        communityId={communityId}
        fiscalYearId={fiscalYearId}
        onBack={() => setShowFundForm(false)}
        onSuccess={() => {
          setShowFundForm(false);
          window.location.reload();
        }}
      />
    );
  }

  if (showIdeaForm) {
    return (
      <IdeaRegistrationForm
        communityId={communityId}
        fiscalYearId={fiscalYearId}
        onBack={() => setShowIdeaForm(false)}
        onSuccess={() => {
          setShowIdeaForm(false);
          window.location.reload();
        }}
      />
    );
  }

  if (showMeetingForm) {
    return (
      <MeetingMinutesForm
        communityId={communityId}
        fiscalYearId={fiscalYearId}
        onBack={() => setShowMeetingForm(false)}
        onSuccess={() => {
          setShowMeetingForm(false);
          window.location.reload();
        }}
      />
    );
  }

  if (showPlanForm) {
    return (
      <PlanBudgetForm
        communityId={communityId}
        fiscalYearId={fiscalYearId}
        onBack={() => setShowPlanForm(false)}
        onSuccess={() => {
          setShowPlanForm(false);
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl font-bold text-gray-900">{t('plan_and_ideas')}</h1>
        <p className="text-xs text-gray-600">{t('plan_and_ideas_subtitle')}</p>
      </div>

      <div className="bg-white border-b border-gray-200 flex text-xs overflow-x-auto">
        <button
          onClick={() => setSubTab('fund')}
          className={`px-4 py-3 font-semibold whitespace-nowrap border-b-2 ${subTab === 'fund' ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent'}`}
        >
          {t('fund_registration')}
        </button>
        <button
          onClick={() => setSubTab('ideas')}
          className={`px-4 py-3 font-semibold whitespace-nowrap border-b-2 ${subTab === 'ideas' ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent'}`}
        >
          {t('ideas')}
        </button>
        <button
          onClick={() => setSubTab('meetings')}
          className={`px-4 py-3 font-semibold whitespace-nowrap border-b-2 ${subTab === 'meetings' ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent'}`}
        >
          {t('meetings')}
        </button>
        <button
          onClick={() => setSubTab('plan')}
          className={`px-4 py-3 font-semibold whitespace-nowrap border-b-2 ${subTab === 'plan' ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent'}`}
        >
          {t('plan_input')}
        </button>
      </div>

      <div className="p-4 space-y-3">
        {subTab === 'fund' && <FundRegistrationTab user={user} selectedYear={selectedYear} communityId={communityId} fiscalYearId={fiscalYearId} onOpenForm={() => setShowFundForm(true)} />}
        {subTab === 'ideas' && <IdeasTab user={user} selectedYear={selectedYear} setSelectedYear={setSelectedYear} onOpenForm={() => setShowIdeaForm(true)} />}
        {subTab === 'meetings' && <MeetingsTab user={user} onOpenForm={() => setShowMeetingForm(true)} />}
        {subTab === 'plan' && <PlanInputTab user={user} onOpenForm={() => setShowPlanForm(true)} />}
      </div>
    </div>
  );
}

function FundRegistrationTab({ user, selectedYear, communityId, fiscalYearId, onOpenForm }: {
  user: DemoUser;
  selectedYear: number;
  communityId: string;
  fiscalYearId: string;
  onOpenForm: () => void
}) {
  const { t } = useLanguage();
  const [fundRegistrations, setFundRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFundRegistrations();
  }, [communityId, selectedYear]);

  const loadFundRegistrations = async () => {
    setLoading(true);
    try {
      const { data: fy } = await supabase
        .from('fiscal_years')
        .select('id')
        .eq('year', selectedYear)
        .maybeSingle();

      if (!fy) {
        setFundRegistrations([]);
        return;
      }

      const { data, error } = await supabase
        .from('fund_registrations')
        .select('*')
        .eq('community_id', communityId)
        .eq('fiscal_year_id', fy.id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setFundRegistrations(data || []);
    } catch (error) {
      console.error('Error loading fund registrations:', error);
      setFundRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M VND`;
    }
    return `${(amount / 1000).toFixed(0)}K VND`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-900 font-medium mb-2">💰 {t('fund_about')}</p>
        <p className="text-xs text-blue-800">
          {t('fund_about_desc')}
        </p>
      </div>

      {user.role === 'CMB' && selectedYear === 2025 && (
        <button
          onClick={onOpenForm}
          className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors"
        >
          {t('edit_fund_registration')}
        </button>
      )}

      {loading ? (
        <div className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      ) : fundRegistrations.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-sm text-amber-900">{t('no_fund_registration')}</p>
        </div>
      ) : (
        fundRegistrations.map((fund) => (
          <div key={fund.id} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">FY{selectedYear} {t('fund_registration')}</p>
                <p className="text-xs text-gray-600 mt-1">{user.communityName}</p>
              </div>
              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-lg font-semibold">
                {fund.status === 'registered' ? t('approved') : fund.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t('approved_amount')}</span>
                <span className="font-semibold text-gray-900">{formatAmount(fund.amount_received_vnd)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t('fund_source')}</span>
                <span className="text-gray-900 text-xs">{fund.fund_source}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t('payment_date')}</span>
                <span className="text-gray-900">{formatDate(fund.payment_date)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">{t('payer_name')}</span>
                <span className="text-gray-900 text-xs">{fund.payer_name}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">{t('recorded_by')}</span>
                <span className="text-gray-900">{fund.recorded_by}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </>
  );
}

function IdeasTab({ user, selectedYear, setSelectedYear, onOpenForm }: { user: DemoUser; selectedYear: number; setSelectedYear: (y: number) => void; onOpenForm: () => void }) {
  const { t } = useLanguage();

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">{t('year')}:</span>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
        >
          <option value={2025}>2025 ({t('this_year')})</option>
          <option value={2024}>2024</option>
          <option value={2023}>2023</option>
        </select>
      </div>

      {(user.role === 'Community Member' || user.role === 'CMB') && selectedYear === 2025 && (
        <button
          onClick={onOpenForm}
          className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl">💡</span>
          {t('new_idea')}
        </button>
      )}

      {selectedYear === 2025 && (
        <>
          <IdeaCard title="コミュニティの種子銀行" status="選ばれた" color="emerald" by="Somchai Prasert" />
          <IdeaCard title="堆肥化施設の建設" status="検討中" color="blue" by="Nittaya Wongsawat" />
          <IdeaCard title="若者向け森林教育" status="提出済み" color="amber" by="Prakit Thongchai" />
        </>
      )}

      {selectedYear === 2024 && (
        <>
          <IdeaCard title="薪の効率的な使用訓練" status="選ばれた" color="emerald" by="Village Member" />
          <IdeaCard title="エコツーリズム開発" status="選ばれなかった" color="red" by="Tourism Committee" />
          <IdeaCard title="伝統工芸品製作所" status="選ばれた" color="emerald" by="Craft Group" />
        </>
      )}

      {selectedYear === 2023 && (
        <>
          <IdeaCard title="森林パトロール強化" status="選ばれた" color="emerald" by="Forest Committee" />
          <IdeaCard title="NTFP採取訓練" status="選ばれた" color="emerald" by="NTFP Group" />
        </>
      )}
    </>
  );
}

function MeetingsTab({ user, onOpenForm }: { user: DemoUser; onOpenForm: () => void }) {
  const { t } = useLanguage();

  return (
    <>
      {user.role === 'CMB' && (
        <button
          onClick={onOpenForm}
          className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors"
        >
          {t('new_meeting')}
        </button>
      )}

      <MeetingCard
        date="2025年11月20日"
        title={t('planning_meeting')}
        chair={t('village_head')}
        participants={45}
        status={t('scheduled')}
      />
      <MeetingCard
        date="2025年10月15日"
        title={t('budget_approval_meeting')}
        chair={t('cmb_leader')}
        participants={38}
        status={t('completed')}
        hasMinutes
      />
      <MeetingCard
        date="2025年9月10日"
        title={t('quarterly_review')}
        chair={t('forest_officer')}
        participants={42}
        status={t('completed')}
        hasMinutes
      />
    </>
  );
}

function PlanInputTab({ user, onOpenForm }: { user: DemoUser; onOpenForm: () => void }) {
  const { t } = useLanguage();

  if (user.role !== 'CMB') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
        <p className="text-sm text-amber-900">{t('cmb_only')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-900 font-medium mb-2">📝 {t('planning_guide')}</p>
        <p className="text-xs text-blue-800">
          {t('planning_guide_desc')}
        </p>
      </div>

      <button
        onClick={onOpenForm}
        className="w-full bg-emerald-600 text-white rounded-xl py-3 font-semibold hover:bg-emerald-700 transition-colors"
      >
        {t('create_new_plan')}
      </button>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">{t('created_plans')}</h3>
        <PlanCard title={t('forest_patrol')} status={t('budget_input')} />
        <PlanCard title={t('ntfp_collection')} status={t('approved')} />
      </div>
    </>
  );
}

function IdeaCard({ title, status, color, by }: { title: string; status: string; color: string; by: string }) {
  const { t } = useLanguage();
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 flex-1 text-sm">{title}</h3>
        <span className={`${colors[color]} text-white text-xs px-2 py-1 rounded-lg font-semibold whitespace-nowrap ml-2`}>
          {status}
        </span>
      </div>
      <p className="text-xs text-gray-500">{t('submitter_label')}: {by}</p>
    </div>
  );
}

function MeetingCard({ date, title, chair, participants, status, hasMinutes }: {
  date: string;
  title: string;
  chair: string;
  participants: number;
  status: string;
  hasMinutes?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">{title}</p>
          <p className="text-xs text-gray-600 mt-1">{date}</p>
        </div>
        {status === t('scheduled') && (
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-lg font-semibold whitespace-nowrap">{status}</span>
        )}
      </div>
      <p className="text-xs text-gray-600">{t('chair')}: {chair}</p>
      <p className="text-xs text-gray-500 mt-1">{t('participants')}: {participants}名</p>
      {hasMinutes && (
        <button className="mt-3 w-full bg-blue-100 text-blue-600 rounded-lg py-2 text-xs font-semibold hover:bg-blue-200 transition-colors">
          {t('view_minutes')}
        </button>
      )}
    </div>
  );
}

function PlanCard({ title, status }: { title: string; status: string }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-blue-600 mt-1">{status}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
  );
}
