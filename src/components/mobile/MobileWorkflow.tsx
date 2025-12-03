import { Check, Circle, AlertCircle, ChevronRight } from 'lucide-react';
import { WorkflowStep, FiscalYearData, NavigationProps } from './types';

interface MobileWorkflowProps extends NavigationProps {
  fiscalYearData: FiscalYearData | null;
}

export function MobileWorkflow({ fiscalYearData, setActiveTab, setSubTab }: MobileWorkflowProps) {
  if (!fiscalYearData) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const ws = fiscalYearData.workflowStatus;

  const getStepStatus = (currentComplete: boolean, prevComplete: boolean): 'completed' | 'current' | 'pending' => {
    if (currentComplete) return 'completed';
    if (prevComplete) return 'current';
    return 'pending';
  };

  const workflowSteps: WorkflowStep[] = [
    {
      id: 1,
      name: 'Fund登録',
      description: '承認された予算を登録',
      status: getStepStatus(ws.fundRegistrationCompleted, true),
      action: 'Fund登録ページへ',
      navigateTo: { tab: 'plan', subTab: 'fund' }
    },
    {
      id: 2,
      name: '会議を設定',
      description: '今年の活動を決める話し合い',
      status: getStepStatus(ws.meetingScheduledCompleted, ws.fundRegistrationCompleted),
      action: '会議設定ページへ',
      navigateTo: { tab: 'plan', subTab: 'meetings' }
    },
    {
      id: 3,
      name: '議事録を登録',
      description: '会議の記録を保存',
      status: getStepStatus(ws.minutesUploadedCompleted, ws.meetingScheduledCompleted),
      action: '議事録登録ページへ',
      navigateTo: { tab: 'plan', subTab: 'meetings' }
    },
    {
      id: 4,
      name: '活動計画を作成',
      description: '何をするか詳しく決める',
      status: getStepStatus(ws.planCreatedCompleted, ws.minutesUploadedCompleted),
      action: '計画作成ページへ',
      navigateTo: { tab: 'plan', subTab: 'plan' }
    },
    {
      id: 5,
      name: '活動を実施',
      description: '決めたことを実行して記録',
      status: ws.activitiesOngoing || ws.finalReportSubmitted ? 'completed' :
              getStepStatus(false, ws.planCreatedCompleted),
      action: '活動記録ページへ',
      navigateTo: { tab: 'activity', subTab: 'activities' }
    },
    {
      id: 6,
      name: '最終報告を作成',
      description: '1年間の活動をまとめる',
      status: getStepStatus(ws.finalReportSubmitted, ws.activitiesOngoing),
      action: ws.finalReportSubmitted ? '報告書を見る' : '報告書作成ページへ',
      navigateTo: { tab: 'activity', subTab: 'reporting' }
    },
  ];

  const handleStepClick = (step: WorkflowStep) => {
    if (step.status === 'pending') return;

    setActiveTab(step.navigateTo.tab);
    if (setSubTab && step.navigateTo.subTab) {
      setSubTab(step.navigateTo.subTab);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
      <h2 className="font-bold text-gray-900 mb-3">🗓️ 今年の作業の流れ</h2>

      <div className="space-y-3">
        {workflowSteps.map((step, idx) => (
          <button
            key={step.id}
            onClick={() => handleStepClick(step)}
            disabled={step.status === 'pending'}
            className={`w-full flex gap-3 text-left transition-all ${
              step.status === 'pending'
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-50 rounded-lg p-2 -m-2 cursor-pointer'
            }`}
          >
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
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

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold ${step.status === 'current' ? 'text-blue-600' : 'text-gray-900'}`}>
                {step.name}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">{step.description}</p>
              {step.status !== 'pending' && step.action && (
                <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
                  <span>{step.action}</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
