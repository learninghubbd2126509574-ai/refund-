export type UserRole = 
  | 'student' 
  | 'admin' 
  | 'team_leader' 
  | 'stl'
  | 'senior_tl' 
  | 'hsl'
  | 'refund_manager' 
  | 'policy_team' 
  | 'finance'
  | 'manager'
  | 'htl'
  | 'hcl'
  | 'hcr';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  whatsapp: string;
  password?: string;
  email: string;
  studentId: string;
  address: string;
  role: UserRole;
  avatar?: string;
  nidUrl?: string;
  photoUrl?: string;
  teamLeaderName?: string;
  teamTrainerName?: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  registeredAt?: string;
}

export interface RegistrationRequest {
  id: string;
  firstName: string;
  lastName: string;
  whatsapp: string;
  password?: string;
  email: string;
  studentId: string;
  address: string;
  nidUrl: string;
  photoUrl: string;
  teamLeaderName?: string;
  teamTrainerName?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export type RefundMethod = 'bkash' | 'nagad' | 'rocket' | 'upay' | 'mcash' | 'binance' | 'bank';

export interface BankDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  branchName?: string;
  routingNumber: string;
}

export type StageId = 
  | 'submitted'
  | 'team_leader_review'
  | 'stl_review'
  | 'senior_tl_review'
  | 'hsl_review'
  | 'refund_manager_review'
  | 'policy_team_review'
  | 'approved'
  | 'issued'
  | 'completed'
  | 'htl_review'
  | 'hcl_review'
  | 'hcr_review'
  | 'manager_review';

export type RequestStatus = 'pending' | 'in_review' | 'approved' | 'issued' | 'completed' | 'rejected';

export interface StageDefinition {
  id: StageId;
  stepNumber: number;
  titleBn: string;
  descriptionBn: string;
  estimatedTimeBn: string;
  responsibleRoleBn: string;
  titleEn?: string;
  descriptionEn?: string;
  estimatedTimeEn?: string;
  responsibleRoleEn?: string;
}

export interface StageLog {
  id: string;
  stageId: StageId;
  status: 'passed' | 'in_progress' | 'rejected' | 'skipped';
  reviewedBy: string;
  reviewerRoleBn: string;
  timestamp: string;
  notes?: string;
  rejectionReason?: string;
}

export interface InternalNote {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

export interface RefundRequest {
  id: string; // Token ID e.g. "UE-REF-89241"
  userId: string;
  studentId: string;
  studentName?: string;
  fullName: string;
  whatsapp: string;
  emergencyContact?: string;
  email: string;
  
  // Academic info
  courseName?: string;
  batchNumber?: string;
  joiningDate?: string;
  durationWorked?: string;
  hasWorked?: string;
  studentIdBalance?: number;
  trainerName?: string;
  teamTrainerName?: string;
  teamTrainerWhatsapp?: string;
  teamLeaderName?: string;
  teamLeaderWhatsapp?: string;
  enrollmentDate?: string;
  submissionDate: string;
  lastUpdatedDate: string;
  
  // Refund Financial Info
  courseFee?: number;
  paidAmount?: number;
  paidMethod?: RefundMethod;
  requestedAmount?: number;
  amount: number;
  paymentMethod?: RefundMethod;
  paymentAccount?: string;
  payoutMethod: RefundMethod;
  payoutAccount: string;
  transactionId?: string; // initial payment or payout txn
  bankDetails?: BankDetails;
  
  // Grounds & Evidence
  primaryReason?: string;
  detailedReason?: string;
  reasonCategory?: string;
  reasonDetail?: string; // The 5 typed reasons
  attachmentUrls?: string[];
  handwrittenApplicationUrl?: string; // New field for handwritten application
  
  // Current Workflow State
  status: RequestStatus;
  currentStageId: StageId;
  stageLogs: StageLog[];
  internalNotes?: InternalNote[];
  
  // Final Completion Data
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedRoleBn?: string;
  rejectedDate?: string;
  rejectedAtStage?: StageId;
  paidDate?: string;
  payoutSlipNote?: string;
}

export interface AppSettings {
  id?: string;
  supportVideoUrl: string;
  supportVideoTitle?: string;
  telegramUrl?: string;
  supportEmail?: string;
  officialHelpline?: string;
  maxReviewDays?: number;
  lastUpdated?: string;
}
