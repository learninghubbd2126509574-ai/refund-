import { RefundRequest, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    firstName: 'মোস্তফা',
    lastName: 'কামাল',
    fullName: 'মোস্তফা কামাল (সুপার অ্যাডমিন)',
    whatsapp: '01700000001',
    email: 'admin@unityearning.com',
    studentId: 'ADM-001',
    address: 'হেড অফিস, বনানী, ঢাকা',
    role: 'admin',
    createdAt: '2025-01-01'
  }
];

export const INITIAL_REQUESTS: RefundRequest[] = [
  {
    id: 'UE-REF-89241',
    userId: 'usr-demo-1',
    studentId: '1827271',
    studentName: 'মোঃ আরিফুল ইসলাম',
    fullName: 'মোঃ আরিফুল ইসলাম',
    whatsapp: '01712345678',
    email: 'ariful@gmail.com',
    courseName: 'ডিজিটাল মার্কেটিং অ্যান্ড এফিলিয়েট',
    joiningDate: '2026-08-01',
    durationWorked: '১৫ দিন',
    teamLeaderName: 'মোস্তফা কামাল',
    teamLeaderWhatsapp: '01700000001',
    hasWorked: 'yes',
    amount: 5990,
    paidAmount: 5990,
    paidMethod: 'bkash',
    studentIdBalance: 0,
    emergencyContact: '01700000000',
    reasonCategory: 'ব্যক্তিগত সমস্যা (Personal Reason)',
    reasonDetail: 'পারিবারিক সমস্যার কারণে নিয়মিত ক্লাস ও কাজের সময় দেওয়া সম্ভব হচ্ছে না, তাই চুক্তি অনুযায়ী রিফান্ড চাচ্ছি।',
    handwrittenApplicationUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
    payoutMethod: 'bkash',
    payoutAccount: '01712345678',
    status: 'pending',
    currentStageId: 'submitted',
    submissionDate: '2026-08-26',
    lastUpdatedDate: '2026-08-26',
    stageLogs: [
      {
        id: 'log-1',
        stageId: 'submitted',
        status: 'passed',
        reviewedBy: 'সিস্টেম অটোমেশন',
        reviewerRoleBn: 'সিস্টেম',
        timestamp: '2026-08-26',
        notes: 'শিক্ষার্থী রিফান্ড আবেদনপত্র সফলভাবে জমা দিয়েছেন।'
      }
    ],
    internalNotes: []
  },
  {
    id: 'UE-REF-45210',
    userId: 'usr-demo-2',
    studentId: '1928301',
    studentName: 'রাফসান আহমেদ',
    fullName: 'রাফসান আহমেদ',
    whatsapp: '01898765432',
    email: 'rafsan@gmail.com',
    courseName: 'গ্রাফিক্স অ্যান্ড ইউআই ডিজাইন',
    joiningDate: '2026-08-05',
    durationWorked: '২০ দিন',
    teamLeaderName: 'কামাল হোসেন',
    teamLeaderWhatsapp: '01800000002',
    hasWorked: 'yes',
    amount: 3500,
    paidAmount: 3500,
    paidMethod: 'nagad',
    studentIdBalance: 0,
    emergencyContact: '01800000000',
    reasonCategory: 'সময়সূচী সমস্যা (Schedule Issue)',
    reasonDetail: 'অফিসের শিফটিংয়ের কারণে ট্রেইনিং শিডিউলের সাথে সময় মেলাতে পারছি না।',
    handwrittenApplicationUrl: 'https://images.unsplash.com/photo-1583521214690-73421a1829a9?auto=format&fit=crop&w=800&q=80',
    payoutMethod: 'nagad',
    payoutAccount: '01898765432',
    status: 'in_review',
    currentStageId: 'team_leader_review',
    submissionDate: '2026-08-25',
    lastUpdatedDate: '2026-08-25',
    stageLogs: [
      {
        id: 'log-1',
        stageId: 'submitted',
        status: 'passed',
        reviewedBy: 'সিস্টেম অটোমেশন',
        reviewerRoleBn: 'সিস্টেম',
        timestamp: '2026-08-25',
        notes: 'শিক্ষার্থী রিফান্ড আবেদন জমা দিয়েছেন।'
      },
      {
        id: 'log-2',
        stageId: 'team_leader_review',
        status: 'passed',
        reviewedBy: 'টিম লিডার মোস্তফা',
        reviewerRoleBn: 'টিম লিডার',
        timestamp: '2026-08-25',
        notes: 'টিম লিডার কর্তৃক কাজের তথ্য যাচাই করা হয়েছে।'
      }
    ],
    internalNotes: []
  }
];

const CURRENT_USER_KEY = 'ue_refund_portal_current_user_v2';

export function loadCurrentUser(): User | null {
  try {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return null;
}

export function saveCurrentUser(user: User | null) {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (e) {
    console.error(e);
  }
}
