import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { DemoUser, PlanSubTab } from './types';
import { FundRegistrationForm } from './forms/FundRegistrationForm';
import { IdeaRegistrationForm } from './forms/IdeaRegistrationForm';
import { MeetingMinutesForm } from './forms/MeetingMinutesForm';
import { PlanBudgetForm } from './forms/PlanBudgetForm';

interface MobilePlanProps {
  user: DemoUser;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  initialSubTab?: string;
  communityId: string;
  fiscalYearId: string;
}

export function MobilePlan({ user, selectedYear, setSelectedYear, initialSubTab, communityId, fiscalYearId }: MobilePlanProps) {
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
        <h1 className="text-xl font-bold text-gray-900">計画・アイデア</h1>
        <p className="text-xs text-gray-600">活動の計画とアイデア管理</p>
      </div>

      <div className="bg-white border-b border-gray-200 flex text-xs overflow-x-auto">
        <button
          onClick={() => setSubTab('fund')}
          className={`px-4 py-3 font-semibold whitespace-nowrap border-b-2 ${subTab === 'fund' ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent'}`}
        >
          Fund登録
        </button>
        <button
          onClick={() => setSubTab('ideas')}
          className={`px-4 py-3 font-semibold whitespace-nowrap border-b-2 ${subTab === 'ideas' ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent'}`}
        >
          アイデア
        </button>
        <button
          onClick={() => setSubTab('meetings')}
          className={`px-4 py-3 font-semibold whitespace-nowrap border-b-2 ${subTab === 'meetings' ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent'}`}
        >
          会議
        </button>
        <button
          onClick={() => setSubTab('plan')}
          className={`px-4 py-3 font-semibold whitespace-nowrap border-b-2 ${subTab === 'plan' ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent'}`}
        >
          計画入力
        </button>
      </div>

      <div className="p-4 space-y-3">
        {subTab === 'fund' && <FundRegistrationTab user={user} selectedYear={selectedYear} onOpenForm={() => setShowFundForm(true)} />}
        {subTab === 'ideas' && <IdeasTab user={user} selectedYear={selectedYear} setSelectedYear={setSelectedYear} onOpenForm={() => setShowIdeaForm(true)} />}
        {subTab === 'meetings' && <MeetingsTab user={user} onOpenForm={() => setShowMeetingForm(true)} />}
        {subTab === 'plan' && <PlanInputTab user={user} onOpenForm={() => setShowPlanForm(true)} />}
      </div>
    </div>
  );
}

function FundRegistrationTab({ user, selectedYear, onOpenForm }: { user: DemoUser; selectedYear: number; onOpenForm: () => void }) {
  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-900 font-medium mb-2">💰 Fund登録について</p>
        <p className="text-xs text-blue-800">
          各年度の初めに、承認された予算額を登録します。この金額が、その年の活動予算の基準となります。
        </p>
      </div>

      {user.role === 'CMB' && selectedYear === 2025 && (
        <button
          onClick={onOpenForm}
          className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors"
        >
          Fund登録情報を編集
        </button>
      )}

      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">FY{selectedYear} Fund登録</p>
            <p className="text-xs text-gray-600 mt-1">Ban Pho Village</p>
          </div>
          <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-lg font-semibold">承認済み</span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">承認金額</span>
            <span className="font-semibold text-gray-900">
              {selectedYear === 2025 ? '50M VND' : selectedYear === 2024 ? '37M VND' : '33M VND'}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">承認日</span>
            <span className="text-gray-900">
              {selectedYear === 2025 ? '2025年1月10日' : selectedYear === 2024 ? '2024年1月20日' : '2023年1月15日'}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-600">登録者</span>
            <span className="text-gray-900">Siriporn</span>
          </div>
        </div>
      </div>
    </>
  );
}

function IdeasTab({ user, selectedYear, setSelectedYear, onOpenForm }: { user: DemoUser; selectedYear: number; setSelectedYear: (y: number) => void; onOpenForm: () => void }) {
  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">年度:</span>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
        >
          <option value={2025}>2025年（今年）</option>
          <option value={2024}>2024年</option>
          <option value={2023}>2023年</option>
        </select>
      </div>

      {(user.role === 'Community Member' || user.role === 'CMB') && selectedYear === 2025 && (
        <button
          onClick={onOpenForm}
          className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl">💡</span>
          新しいアイデアを提出
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
  return (
    <>
      {user.role === 'CMB' && (
        <button
          onClick={onOpenForm}
          className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors"
        >
          新しい会議を設定
        </button>
      )}

      <MeetingCard
        date="2025年11月20日"
        title="活動計画会議"
        chair="村長"
        participants={45}
        status="予定"
      />
      <MeetingCard
        date="2025年10月15日"
        title="予算承認会議"
        chair="CMBリーダー"
        participants={38}
        status="完了"
        hasMinutes
      />
      <MeetingCard
        date="2025年9月10日"
        title="第3四半期進捗レビュー"
        chair="森林官"
        participants={42}
        status="完了"
        hasMinutes
      />
    </>
  );
}

function PlanInputTab({ user, onOpenForm }: { user: DemoUser; onOpenForm: () => void }) {
  if (user.role !== 'CMB') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
        <p className="text-sm text-amber-900">この機能はCMBメンバーのみ利用できます</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-900 font-medium mb-2">📝 計画作成ガイド</p>
        <p className="text-xs text-blue-800">
          選ばれたアイデアに基づいて、詳しい活動計画を作成します。
        </p>
      </div>

      <button
        onClick={onOpenForm}
        className="w-full bg-emerald-600 text-white rounded-xl py-3 font-semibold hover:bg-emerald-700 transition-colors"
      >
        新しい活動計画を作成
      </button>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">作成済みの計画</h3>
        <PlanCard title="森林パトロール・保護活動" status="予算入力中" />
        <PlanCard title="非木材林産物の採取" status="承認済み" />
      </div>
    </>
  );
}

function IdeaCard({ title, status, color, by }: { title: string; status: string; color: string; by: string }) {
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
      <p className="text-xs text-gray-500">提出者: {by}</p>
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
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900">{title}</p>
          <p className="text-xs text-gray-600 mt-1">{date}</p>
        </div>
        {status === '予定' && (
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-lg font-semibold whitespace-nowrap">予定</span>
        )}
      </div>
      <p className="text-xs text-gray-600">議長: {chair}</p>
      <p className="text-xs text-gray-500 mt-1">参加者: {participants}名</p>
      {hasMinutes && (
        <button className="mt-3 w-full bg-blue-100 text-blue-600 rounded-lg py-2 text-xs font-semibold hover:bg-blue-200 transition-colors">
          議事録を見る
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
