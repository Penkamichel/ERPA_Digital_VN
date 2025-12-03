export type UserRole = 'CMB' | 'Community Member' | 'Forest Owner' | 'CPC';

export type IdeaStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'implemented';

export type CommentType = 'question' | 'concern' | 'suggestion' | 'approval';

export type ActivityStatus = 'draft' | 'submitted' | 'approved' | 'ongoing' | 'completed' | 'cancelled';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  communityId: string;
  communityName: string;
}

export interface Idea {
  id: string;
  communityId: string;
  fiscalYearId: string;
  submittedBy: string;
  title: string;
  description: string;
  category: string;
  status: IdeaStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  planActivityId: string;
  commentedBy: string;
  commentText: string;
  commentType: CommentType;
  requiresRevision: boolean;
  createdAt: string;
}

export interface ProgressNote {
  id: string;
  planActivityId: string;
  noteText: string;
  progressPercentage: number;
  createdBy: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  activityName: string;
  communityId: string;
  fiscalYearId: string;
  totalBudget: number;
  forestOwnerSupport: number;
  communityContribution: number;
  otherFunds: number;
  periodStart: string;
  periodEnd: string;
  status: ActivityStatus;
  notes: string;
}

export interface BudgetItem {
  id: string;
  planActivityId: string;
  itemName: string;
  unit: string;
  quantity: number;
  unitCost: number;
  amount: number;
  remarks: string;
}

export interface Receipt {
  id: string;
  planActivityId: string;
  budgetItemId?: string;
  fileUrl: string;
  fileType: 'pdf' | 'jpg' | 'png';
  uploadedByRole: UserRole;
  uploadedAt: string;
  verified: boolean;
}

export interface Meeting {
  id: string;
  communityId: string;
  fiscalYearId: string;
  date: string;
  chairperson: string;
  participantsCount: number;
  agenda: string;
  votingMethod: 'hands' | 'secret';
  minutesFileUrl?: string;
  minutesSummary: string;
}

export interface FiscalYear {
  id: string;
  year: number;
  startDate: string;
  endDate: string;
}

export interface SyncQueueItem {
  id: string;
  userId: string;
  tableName: string;
  operation: 'insert' | 'update' | 'delete';
  data: any;
  synced: boolean;
  createdAt: string;
}
