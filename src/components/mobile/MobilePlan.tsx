import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { DemoUser, PlanSubTab } from './types';
import { FundRegistrationForm } from './forms/FundRegistrationForm';
import { IdeaRegistrationForm } from './forms/IdeaRegistrationForm';
import { MeetingRegistrationForm } from './forms/MeetingRegistrationForm';
import { MeetingMinutesForm } from './forms/MeetingMinutesForm';
import { MeetingMinutesView } from './forms/MeetingMinutesView';
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
  const [showMinutesForm, setShowMinutesForm] = useState(false);
  const [showMinutesView, setShowMinutesView] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
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
      <MeetingRegistrationForm
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

  if (showMinutesForm && selectedMeetingId) {
    return (
      <MeetingMinutesForm
        communityId={communityId}
        fiscalYearId={fiscalYearId}
        meetingId={selectedMeetingId}
        onBack={() => {
          setShowMinutesForm(false);
          setSelectedMeetingId(null);
        }}
        onSuccess={() => {
          setShowMinutesForm(false);
          setSelectedMeetingId(null);
          window.location.reload();
        }}
      />
    );
  }

  if (showMinutesView && selectedMeetingId) {
    return (
      <MeetingMinutesView
        meetingId={selectedMeetingId}
        onBack={() => {
          setShowMinutesView(false);
          setSelectedMeetingId(null);
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
        {subTab === 'ideas' && <IdeasTab user={user} selectedYear={selectedYear} setSelectedYear={setSelectedYear} onOpenForm={() => setShowIdeaForm(true)} communityId={communityId} />}
        {subTab === 'meetings' && (
          <MeetingsTab
            user={user}
            communityId={communityId}
            fiscalYearId={fiscalYearId}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            onOpenForm={() => setShowMeetingForm(true)}
            onOpenMinutesForm={(meetingId) => {
              setSelectedMeetingId(meetingId);
              setShowMinutesForm(true);
            }}
            onViewMinutes={(meetingId) => {
              setSelectedMeetingId(meetingId);
              setShowMinutesView(true);
            }}
          />
        )}
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

function IdeasTab({ user, selectedYear, setSelectedYear, onOpenForm, communityId }: { user: DemoUser; selectedYear: number; setSelectedYear: (y: number) => void; onOpenForm: () => void; communityId: string }) {
  const { t } = useLanguage();
  const [ideas, setIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fiscalYears, setFiscalYears] = useState<any[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<any | null>(null);

  useEffect(() => {
    loadFiscalYears();
  }, []);

  useEffect(() => {
    if (fiscalYears.length > 0) {
      loadIdeas();
    }
  }, [selectedYear, fiscalYears, communityId]);

  const loadFiscalYears = async () => {
    try {
      const { data, error } = await supabase
        .from('fiscal_years')
        .select('*')
        .order('year', { ascending: false });

      if (error) throw error;
      setFiscalYears(data || []);
    } catch (error) {
      console.error('Error loading fiscal years:', error);
    }
  };

  const loadIdeas = async () => {
    setLoading(true);
    try {
      const currentFiscalYear = fiscalYears.find(fy => fy.year === selectedYear);
      if (!currentFiscalYear) {
        setIdeas([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('community_id', communityId)
        .eq('fiscal_year_id', currentFiscalYear.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      console.error('Error loading ideas:', error);
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusTranslationKey = (status: string) => {
    const statusMap: Record<string, string> = {
      'approved': 'selected',
      'under_review': 'under_review',
      'submitted': 'submitted',
      'rejected': 'not_selected',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'approved': 'emerald',
      'under_review': 'blue',
      'submitted': 'amber',
      'rejected': 'red',
    };
    return colorMap[status] || 'gray';
  };

  const availableYears = fiscalYears.map(fy => fy.year);
  const currentYear = new Date().getFullYear();

  if (selectedIdea) {
    return (
      <IdeaDetailView
        idea={selectedIdea}
        onBack={() => setSelectedIdea(null)}
      />
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-3">
        <label className="block text-xs font-semibold text-gray-700 mb-2">{t('fiscal_year')}</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {availableYears.map(year => (
            <option key={year} value={year}>
              {year} {year === currentYear && `(${t('this_year')})`}
            </option>
          ))}
        </select>
      </div>

      {(user.role === 'Community Member' || user.role === 'CMB') && selectedYear === currentYear && (
        <button
          onClick={onOpenForm}
          className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl">💡</span>
          {t('new_idea')}
        </button>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">{t('loading')}</div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">{t('no_ideas_this_year')}</div>
      ) : (
        ideas.map(idea => (
          <IdeaCard
            key={idea.id}
            title={idea.title}
            status={t(getStatusTranslationKey(idea.status))}
            color={getStatusColor(idea.status)}
            by={idea.submitted_by}
            onClick={() => setSelectedIdea(idea)}
          />
        ))
      )}
    </>
  );
}

function MeetingsTab({
  user,
  communityId,
  fiscalYearId,
  selectedYear,
  setSelectedYear,
  onOpenForm,
  onOpenMinutesForm,
  onViewMinutes,
}: {
  user: DemoUser;
  communityId: string;
  fiscalYearId: string;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  onOpenForm: () => void;
  onOpenMinutesForm: (meetingId: string) => void;
  onViewMinutes: (meetingId: string) => void;
}) {
  const { t } = useLanguage();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fiscalYears, setFiscalYears] = useState<any[]>([]);

  useEffect(() => {
    loadFiscalYears();
  }, [communityId]);

  useEffect(() => {
    if (fiscalYears.length > 0) {
      loadMeetings();
    }
  }, [selectedYear, fiscalYears]);

  const loadFiscalYears = async () => {
    try {
      const { data, error } = await supabase
        .from('fiscal_years')
        .select('*')
        .order('year', { ascending: false });

      if (error) throw error;
      setFiscalYears(data || []);
    } catch (error) {
      console.error('Error loading fiscal years:', error);
    }
  };

  const loadMeetings = async () => {
    setLoading(true);
    try {
      const currentFiscalYear = fiscalYears.find(fy => fy.year === selectedYear);
      if (!currentFiscalYear) {
        setMeetings([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('community_id', communityId)
        .eq('fiscal_year_id', currentFiscalYear.id)
        .order('scheduled_date', { ascending: false });

      if (error) throw error;
      setMeetings(data || []);
    } catch (error) {
      console.error('Error loading meetings:', error);
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };

  const availableYears = fiscalYears.map(fy => fy.year);
  const currentYear = new Date().getFullYear();

  return (
    <>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-3">
        <label className="block text-xs font-semibold text-gray-700 mb-2">{t('fiscal_year')}</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          {availableYears.map(year => (
            <option key={year} value={year}>
              {year} {year === currentYear && `(${t('this_year')})`}
            </option>
          ))}
        </select>
      </div>

      {user.role === 'CMB' && selectedYear === currentYear && (
        <button
          onClick={onOpenForm}
          className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors mb-3"
        >
          + {t('new_meeting')}
        </button>
      )}

      {loading ? (
        <div className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      ) : meetings.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-sm text-amber-900">{t('no_meetings')}</p>
        </div>
      ) : (
        meetings.map((meeting) => (
          <MeetingCard
            key={meeting.id}
            meeting={meeting}
            user={user}
            currentYear={currentYear}
            selectedYear={selectedYear}
            onRegisterMinutes={() => onOpenMinutesForm(meeting.id)}
            onViewMinutes={() => onViewMinutes(meeting.id)}
          />
        ))
      )}
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

function IdeaCard({ title, status, color, by, onClick }: { title: string; status: string; color: string; by: string; onClick?: () => void }) {
  const { t } = useLanguage();
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    gray: 'bg-gray-500',
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
    >
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

function MeetingCard({
  meeting,
  user,
  currentYear,
  selectedYear,
  onRegisterMinutes,
  onViewMinutes,
}: {
  meeting: any;
  user: DemoUser;
  currentYear: number;
  selectedYear: number;
  onRegisterMinutes: () => void;
  onViewMinutes: () => void;
}) {
  const { t } = useLanguage();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-emerald-100 text-emerald-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return t('scheduled');
      case 'completed':
        return t('completed');
      case 'cancelled':
        return t('cancelled');
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">{meeting.title}</p>
          <p className="text-xs text-gray-600 mt-1">
            {formatDate(meeting.scheduled_date)}
            {meeting.scheduled_time && ` ${meeting.scheduled_time}`}
          </p>
        </div>
        <span
          className={`${getStatusColor(meeting.status)} text-xs px-2 py-1 rounded-lg font-semibold whitespace-nowrap ml-2`}
        >
          {getStatusText(meeting.status)}
        </span>
      </div>
      {meeting.chairperson && (
        <p className="text-xs text-gray-600">
          {t('chair')}: {meeting.chairperson}
        </p>
      )}
      {meeting.location && (
        <p className="text-xs text-gray-500 mt-1">
          {t('location')}: {meeting.location}
        </p>
      )}
      {meeting.agenda && (
        <p className="text-xs text-gray-500 mt-1">{meeting.agenda}</p>
      )}
      {meeting.status === 'scheduled' && user.role === 'CMB' && selectedYear === currentYear && (
        <button
          onClick={onRegisterMinutes}
          className="mt-3 w-full bg-emerald-600 text-white rounded-lg py-2 text-xs font-semibold hover:bg-emerald-700 transition-colors"
        >
          {t('register_minutes')}
        </button>
      )}
      {meeting.status === 'completed' && (
        <button
          onClick={onViewMinutes}
          className="mt-3 w-full bg-blue-100 text-blue-600 rounded-lg py-2 text-xs font-semibold hover:bg-blue-200 transition-colors"
        >
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

function IdeaDetailView({ idea, onBack }: { idea: any; onBack: () => void }) {
  const { t } = useLanguage();

  const getStatusTranslationKey = (status: string) => {
    const statusMap: Record<string, string> = {
      'approved': 'selected',
      'under_review': 'under_review',
      'submitted': 'submitted',
      'rejected': 'not_selected',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'approved': 'bg-emerald-100 text-emerald-700',
      'under_review': 'bg-blue-100 text-blue-700',
      'submitted': 'bg-amber-100 text-amber-700',
      'rejected': 'bg-red-100 text-red-700',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'THB',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white shadow-sm z-10">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
          >
            ← {t('back')}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 flex-1">{idea.title}</h2>
            <span className={`${getStatusColor(idea.status)} text-xs px-3 py-1 rounded-lg font-semibold whitespace-nowrap ml-2`}>
              {t(getStatusTranslationKey(idea.status))}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-600 font-semibold">{t('submitter_label')}</p>
              <p className="text-gray-900">{idea.submitted_by}</p>
            </div>

            {idea.category && (
              <div>
                <p className="text-gray-600 font-semibold">{t('category')}</p>
                <p className="text-gray-900 capitalize">{idea.category}</p>
              </div>
            )}

            {idea.submission_date && (
              <div>
                <p className="text-gray-600 font-semibold">{t('submission_date')}</p>
                <p className="text-gray-900">{formatDate(idea.submission_date)}</p>
              </div>
            )}
          </div>
        </div>

        {idea.description && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-2">{t('description')}</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{idea.description}</p>
          </div>
        )}

        {idea.problem_statement && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-2">{t('problem_statement')}</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{idea.problem_statement}</p>
          </div>
        )}

        {idea.expected_location && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-2">{t('expected_location')}</h3>
            <p className="text-sm text-gray-700">{idea.expected_location}</p>
          </div>
        )}

        {idea.expected_beneficiaries && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-2">{t('expected_beneficiaries')}</h3>
            <p className="text-sm text-gray-700">{idea.expected_beneficiaries}</p>
          </div>
        )}

        {idea.estimated_budget_total && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-2">{t('estimated_budget')}</h3>
            <p className="text-sm text-gray-700">{formatCurrency(idea.estimated_budget_total)}</p>
            {idea.estimated_community_contribution && (
              <p className="text-xs text-gray-600 mt-1">
                {t('community_contribution')}: {idea.estimated_community_contribution}
              </p>
            )}
          </div>
        )}

        {idea.alignment_with_decree && Array.isArray(idea.alignment_with_decree) && idea.alignment_with_decree.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-2">{t('alignment_with_decree')}</h3>
            <ul className="list-disc list-inside space-y-1">
              {idea.alignment_with_decree.map((item: string, index: number) => (
                <li key={index} className="text-sm text-gray-700">{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
