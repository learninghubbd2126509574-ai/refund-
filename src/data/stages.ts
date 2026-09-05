import { StageDefinition, StageId } from '../types';

export const REFUND_STAGES: StageDefinition[] = [
  {
    id: 'submitted',
    stepNumber: 1,
    titleBn: '১. রিকোয়েস্ট জমা',
    descriptionBn: 'শিক্ষার্থীর রিফান্ড আবেদন সিস্টেমে সফলভাবে জমা হয়েছে।',
    estimatedTimeBn: 'তাৎক্ষণিক',
    responsibleRoleBn: 'সিস্টেম',
    titleEn: '1. Application Logged',
    descriptionEn: 'Refund application successfully registered in the verification system.',
    estimatedTimeEn: 'Instant',
    responsibleRoleEn: 'Automated Ingestion'
  },
  {
    id: 'team_leader_review',
    stepNumber: 2,
    titleBn: '২. টিম লিডার (TL) রিভিউ',
    descriptionBn: 'টিম লিডার শিক্ষার্থীর ক্লাসের তথ্য ও উপস্থিতি রেকর্ড যাচাই করছেন।',
    estimatedTimeBn: '২৪ ঘণ্টার মধ্যে (১ম দিন)',
    responsibleRoleBn: 'টিম লিডার (TL)',
    titleEn: '2. Team Leader (TL) Audit',
    descriptionEn: 'Verification of course batch enrollment, attendance and initial logs.',
    estimatedTimeEn: 'Within 24 Hours (Day 1)',
    responsibleRoleEn: 'Team Leader (TL)'
  },
  {
    id: 'stl_review',
    stepNumber: 3,
    titleBn: '৩. সিনিয়র টিম লিডার (STL) রিভিউ',
    descriptionBn: 'সিনিয়র টিম লিডার ট্রেইনার রিপোর্ট ও শিক্ষার্থীর পারফর্মেন্স মূল্যায়ন করছেন।',
    estimatedTimeBn: '২ দিনের মধ্যে (২য় দিন)',
    responsibleRoleBn: 'সিনিয়র টিম লিডার (STL)',
    titleEn: '3. Senior TL (STL) Evaluation',
    descriptionEn: 'Assessment of trainer remarks and student progress documentation.',
    estimatedTimeEn: 'Day 2',
    responsibleRoleEn: 'Senior Team Leader (STL)'
  },
  {
    id: 'hsl_review',
    stepNumber: 4,
    titleBn: '৪. হায়ার সিনিয়র লিডার (HSL) রিভিউ',
    descriptionBn: 'হায়ার সিনিয়র লিডার টিম শিক্ষার্থীর কেস স্টাডি পর্যালোচনা করছেন।',
    estimatedTimeBn: '৩ থেকে ৫ দিনের মধ্যে',
    responsibleRoleBn: 'Higher Senior Leader (HSL)',
    titleEn: '4. Higher Senior Leader (HSL) Review',
    descriptionEn: 'Cross-verification of academic engagement and departmental metrics.',
    estimatedTimeEn: 'Days 3 - 5',
    responsibleRoleEn: 'Higher Senior Leader (HSL)'
  },
  {
    id: 'refund_manager_review',
    stepNumber: 5,
    titleBn: '৫. রিফান্ড ম্যানেজার (RM) রিভিউ',
    descriptionBn: 'রিফান্ড ম্যানেজার সার্বিক রিপোর্ট ও রিফান্ড পলিসি শর্তাবলী অনুমোদন করছেন।',
    estimatedTimeBn: '৭ থেকে ১০ দিনের মধ্যে',
    responsibleRoleBn: 'Refund Manager (RM)',
    titleEn: '5. Refund Manager (RM) Assessment',
    descriptionEn: 'Comprehensive policy validation and refund eligibility clearance.',
    estimatedTimeEn: 'Days 7 - 10',
    responsibleRoleEn: 'Refund Manager (RM)'
  },
  {
    id: 'policy_team_review',
    stepNumber: 6,
    titleBn: '৬. রিফান্ড পলিসি টিম রিভিউ',
    descriptionBn: 'পলিসি কমিটি কর্তৃক চূড়ান্ত মূল্যায়ন ও শর্তাবলীর পুঙ্খানুপুঙ্খ অডিট।',
    estimatedTimeBn: '১৪ থেকে ১৮ দিনের মধ্যে',
    responsibleRoleBn: 'পলিসি কমিটি',
    titleEn: '6. Compliance & Policy Clearance',
    descriptionEn: 'Institutional policy review and authorization recommendation.',
    estimatedTimeEn: 'Days 14 - 18',
    responsibleRoleEn: 'Policy Committee'
  },
  {
    id: 'approved',
    stepNumber: 7,
    titleBn: '৭. রিফান্ড অনুমোদিত',
    descriptionBn: 'সকল অডিট সন্তোষজনক হলে রিফান্ড রিকোয়েস্ট অফিসিয়ালি অনুমোদিত হয়।',
    estimatedTimeBn: '১৯ দিনের মধ্যে',
    responsibleRoleBn: 'হেড অব একাউন্টস',
    titleEn: '7. Refund Approved & Authorized',
    descriptionEn: 'Official grant approval finalized by Accounts Administration.',
    estimatedTimeEn: 'Day 19',
    responsibleRoleEn: 'Head of Accounts'
  },
  {
    id: 'issued',
    stepNumber: 8,
    titleBn: '৮. অর্থ ইস্যু সম্পন্ন',
    descriptionBn: 'অনুমোদিত হলে নির্ধারিত ওয়ালেট বা ব্যাংকে অর্থ প্রেরণের ছাড়পত্র ইস্যু করা হয়।',
    estimatedTimeBn: '১৯-২০ দিনের মধ্যে',
    responsibleRoleBn: 'ফিন্যান্স টিম',
    titleEn: '8. Financial Clearance & Payout Queue',
    descriptionEn: 'Disbursement queued for automated electronic fund transfer.',
    estimatedTimeEn: 'Days 19 - 20',
    responsibleRoleEn: 'Finance Department'
  },
  {
    id: 'completed',
    stepNumber: 9,
    titleBn: '৯. রিফান্ড সম্পন্ন',
    descriptionBn: 'সম্পূর্ণ প্রক্রিয়া সমাপ্ত ও অর্থ প্রদান সফল।',
    estimatedTimeBn: '২০ কার্যদিবসের মধ্যে',
    responsibleRoleBn: 'অ্যাডমিন',
    titleEn: '9. Disbursement Complete',
    descriptionEn: 'Funds successfully credited to recipient account and case closed.',
    estimatedTimeEn: 'Within 20 Days',
    responsibleRoleEn: 'Disbursement System'
  }
];

export const STAGE_ORDER: StageId[] = [
  'submitted',
  'team_leader_review',
  'stl_review',
  'hsl_review',
  'refund_manager_review',
  'policy_team_review',
  'approved',
  'issued',
  'completed'
];

export function getStageIndex(stageId: StageId | string): number {
  if (stageId === 'senior_tl_review' || stageId === 'htl_review') return 2;
  if (stageId === 'hcr_review' || stageId === 'hcl_review') return 3;
  if (stageId === 'manager_review') return 4;
  const idx = STAGE_ORDER.indexOf(stageId as StageId);
  return idx !== -1 ? idx : 0;
}

export function getStageDetails(stageId: StageId | string): StageDefinition | undefined {
  let mappedId = stageId;
  if (stageId === 'senior_tl_review' || stageId === 'htl_review') mappedId = 'stl_review';
  if (stageId === 'hcr_review' || stageId === 'hcl_review') mappedId = 'hsl_review';
  if (stageId === 'manager_review') mappedId = 'refund_manager_review';
  return REFUND_STAGES.find(s => s.id === mappedId) || REFUND_STAGES[0];
}

/**
 * Calculates review duration, elapsed days, and whether 20 days have expired for auto-cancellation
 */
export function calculateReviewTimeline(submissionDateStr?: string, maxDays = 20) {
  if (!submissionDateStr) {
    return { daysPassed: 0, daysRemaining: maxDays, isExpired: false, percentElapsed: 0 };
  }
  try {
    const subDate = new Date(submissionDateStr);
    const now = new Date();
    const diffTime = Math.max(0, now.getTime() - subDate.getTime());
    const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, maxDays - daysPassed);
    const isExpired = daysPassed >= maxDays;
    const percentElapsed = Math.min(100, Math.round((daysPassed / maxDays) * 100));
    return { daysPassed, daysRemaining, isExpired, percentElapsed };
  } catch (e) {
    return { daysPassed: 0, daysRemaining: maxDays, isExpired: false, percentElapsed: 0 };
  }
}
