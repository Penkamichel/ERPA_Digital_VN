export type Tab = 'home' | 'plan' | 'activity' | 'settings';
export type UserRole = 'CMB' | 'Community Member' | 'Forest Owner' | 'CPC';
export type PlanSubTab = 'fund' | 'ideas' | 'meetings' | 'plan';
export type ActivitySubTab = 'activities' | 'reporting';

export interface DemoUser {
  id: string;
  name: string;
  role: UserRole;
  communityId: string;
  communityName: string;
}

export interface WorkflowStatus {
  fundRegistrationCompleted: boolean;
  meetingScheduledCompleted: boolean;
  minutesUploadedCompleted: boolean;
  planCreatedCompleted: boolean;
  activitiesOngoing: boolean;
  finalReportSubmitted: boolean;
  currentStep: string;
}

export interface FiscalYearData {
  id: string;
  year: number;
  totalBudget: number;
  totalSpent: number;
  activityCount: number;
  completedCount: number;
  ongoingCount: number;
  workflowStatus: WorkflowStatus;
}

export interface WorkflowStep {
  id: number;
  name: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  action: string | null;
  navigateTo: {
    tab: Tab;
    subTab?: string;
  };
}

export interface NavigationProps {
  setActiveTab: (tab: Tab) => void;
  setSubTab?: (subTab: string) => void;
}
