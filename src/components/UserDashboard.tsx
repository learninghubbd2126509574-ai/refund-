import React, { useState } from 'react';
import { User, RefundRequest } from '../types';
import { RefundPolicyCard } from './RefundPolicyCard';
import { REFUND_STAGES, getStageIndex, getStageDetails, calculateReviewTimeline } from '../data/stages';
import { ApplicationDetailsModal } from './ApplicationDetailsModal';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  PlusCircle, 
  User as UserIcon, 
  Phone, 
  Mail, 
  Calendar,
  AlertCircle,
  Sparkles,
  CreditCard,
  Eye,
  MessageCircle,
  AlertTriangle,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface UserDashboardProps {
  currentUser: User;
  userRequests: RefundRequest[];
  onOpenRequestForm: () => void;
  onSelectRequest: (request: RefundRequest) => void;
  onOpenRejectionModal: (request: RefundRequest) => void;
  supportEmail?: string;
  telegramUrl?: string;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  userRequests,
  onOpenRequestForm,
  onSelectRequest,
  onOpenRejectionModal,
  supportEmail = 'unityearning12@gmail.com',
  telegramUrl = 'https://t.me/unityearning12',
}) => {
  const { isBn } = useLanguage();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedRequestForDetails, setSelectedRequestForDetails] = useState<RefundRequest | null>(null);

  const primaryRequest = userRequests[0] || null;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 text-left space-y-5 sm:space-y-8">
      
      {/* Student Profile Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-7 shadow-2xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* User Info */}
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center font-extrabold text-lg sm:text-2xl shadow-md shadow-emerald-600/20 shrink-0">
              {currentUser.firstName ? currentUser.firstName.charAt(0) : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <h1 className="text-base sm:text-2xl font-bold text-slate-900 truncate">
                  {isBn ? `স্বাগতম, ${currentUser.fullName}` : `Welcome, ${currentUser.fullName}`}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                  {isBn ? 'ভেরিফাইড স্টুডেন্ট' : 'Verified Student'}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] sm:text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1 font-mono">
                  {isBn ? 'আইডি:' : 'ID:'} <strong className="text-slate-800">{currentUser.studentId}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{currentUser.whatsapp}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{currentUser.email}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <div>
              {primaryRequest ? (
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    id="dash-view-details-primary-btn"
                    onClick={() => {
                      setSelectedRequestForDetails(primaryRequest);
                      setIsDetailsModalOpen(true);
                    }}
                    className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all transform active:scale-98 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{isBn ? 'সাবমিটকৃত তথ্য দেখুন (ভিউ)' : 'View Submitted Information'}</span>
                  </button>

                  <button
                    id="dash-track-existing-request-btn"
                    onClick={() => onSelectRequest(primaryRequest)}
                    className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all transform active:scale-98 cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                    <span>{isBn ? `টাইমলাইন (${primaryRequest.id})` : `Timeline (${primaryRequest.id})`}</span>
                  </button>
                </div>
              ) : (
                <button
                  id="dash-create-new-request-btn"
                  onClick={onOpenRequestForm}
                  className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all transform active:scale-98 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isBn ? 'নতুন রিফান্ড রিকোয়েস্ট পাঠান' : 'Submit Refund Request'}</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 20-WORKING-DAY OFFICIAL NOTICE / REJECTION CANCELLATION BANNER              */}
      {/* ========================================================================= */}
      {primaryRequest && (
        (() => {
          const { daysPassed, daysRemaining, isExpired } = calculateReviewTimeline(primaryRequest.submissionDate, 20);
          const isRejected = primaryRequest.status === 'rejected';

          if (isRejected) {
            return (
              <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-rose-50 via-red-50 to-rose-100/60 border-2 border-rose-300 shadow-xs space-y-3 text-left">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="font-extrabold text-sm sm:text-base text-rose-950">
                        {isBn ? 'রিফান্ড আবেদন বাতিল ও পলিসি বাতিল নোটিশ' : 'Refund Application Cancelled & Policy Void Notice'}
                      </h2>
                      <span className="text-xs text-rose-700 font-semibold">
                        {isBn ? 'যথাযথ প্রমাণ ও কারণ না পাওয়ায় ২০ কার্যদিবসের মাথায় বাতিল' : 'Cancelled at 20-day milestone due to lack of qualifying grounds'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs px-3 py-1 rounded-xl bg-rose-600 text-white shadow-2xs">
                      {isBn ? 'আবেদন বাতিল' : 'Cancelled'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-white/90 rounded-xl border border-rose-200 text-xs sm:text-sm text-slate-800 leading-relaxed space-y-1">
                  <span className="font-bold text-rose-900 block">
                    {isBn ? 'কর্তৃপক্ষের আনুষ্ঠানিক নোটিশ:' : 'Official Audit Notice:'}
                  </span>
                  <p>
                    {primaryRequest.rejectionReason || (isBn 
                      ? 'আমাদের অভ্যন্তরীণ পলিসি ও অডিট কমিটির পুঙ্খানুপুঙ্খ পর্যালোচনা শেষে আপনার রিফান্ড আবেদনটি বাতিল করা হয়েছে। রিফান্ড পলিসির নির্ধারিত শর্তাবলী অনুযায়ী আপনার দাখিলকৃত আবেদনের সপক্ষে কোনো সুনির্দিষ্ট ও প্রমাণযোগ্য যৌক্তিক কারণ পাওয়া যায়নি। ফলে ২০ কার্যদিবসের মাথায় প্রাতিষ্ঠানিক নীতিমালার আওতায় আপনার রিফান্ড রিকোয়েস্টটি বাতিল গণ্য করা হলো এবং এই আবেদনের রিফান্ড পলিসি বাদ/বাতিল ঘোষণা করা হলো।'
                      : 'Following institutional policy audit, your refund request has been cancelled as no verified qualifying grounds were established. The refund policy is voided for this case.')
                    }
                  </p>
                </div>

                <div className="pt-2.5 border-t border-rose-200 flex items-center justify-between gap-2 flex-wrap text-xs">
                  <span className="text-rose-800 font-medium">
                    {isBn ? 'জরুরি কোনো প্রশ্ন বা তথ্যের জন্য সরাসরি যোগাযোগ:' : 'For inquiries or assistance, contact support:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${supportEmail}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-900 font-bold hover:bg-rose-50 transition-colors shadow-2xs"
                    >
                      <Mail className="w-3.5 h-3.5 text-rose-600" />
                      <span>{isBn ? 'ইমেইল সাপোর্ট' : 'Email Support'}</span>
                    </a>
                    <a
                      href={telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold transition-colors shadow-2xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{isBn ? 'টেলিগ্রাম সাপোর্ট' : 'Telegram Support'}</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-50 via-emerald-50/40 to-teal-50 border border-amber-300 shadow-2xs space-y-3 text-left">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center font-bold shrink-0">
                    <Clock className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-sm sm:text-base text-slate-900">
                      {isBn ? '২০ কার্যদিবসের মধ্যে যাচাই-বাছাই ও রিফান্ড নোটিশ' : 'Official 20-Business-Day Verification Notice'}
                    </h2>
                    <span className="text-xs text-slate-600">
                      {isBn ? 'আপনার রিফান্ড আবেদনটি সর্বোচ্চ ২০ কার্যদিবসের মধ্যে প্রসেস করা হবে' : 'Your refund application is processed within maximum 20 business days'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`font-mono font-bold text-xs px-3 py-1 rounded-xl shadow-2xs ${
                    isExpired 
                      ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                      : 'bg-white text-slate-800 border border-slate-200'
                  }`}>
                    {isExpired 
                      ? (isBn ? '২০ দিন সমাপ্ত' : '20 Days Complete') 
                      : (isBn ? `${daysPassed} দিন অতিক্রান্ত • অবশিষ্ট ${daysRemaining} দিন` : `${daysPassed} Days Elapsed • ${daysRemaining} Days Left`)}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                {isBn ? (
                  <>আপনার রিফান্ড আবেদনটি সর্বোচ্চ <strong>২০ কার্যদিবসের</strong> মধ্যে বিভিন্ন স্তরে সতর্কতার সাথে যাচাই-বাছাই করা হবে। সকল শর্তাবলী ও প্রমাণপত্র সন্তোষজনক হলে রিফান্ড অনুমোদন করে একাউন্টে অর্থ প্রদান করা হবে।</>
                ) : (
                  <>Your refund application is thoroughly audited within maximum <strong>20 business days</strong>. Upon institutional clearance and satisfying all conditions, approval is granted for electronic payout.</>
                )}
              </p>

              <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between gap-2 flex-wrap text-xs">
                <span className="text-slate-600 font-medium">
                  {isBn ? 'জরুরি কোনো সমস্যা বা তথ্যের জন্য সরাসরি যোগাযোগ:' : 'For urgent queries, reach official support:'}
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${supportEmail}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold hover:bg-slate-50 transition-colors shadow-2xs"
                  >
                    <Mail className="w-3.5 h-3.5 text-rose-500" />
                    <span>{isBn ? 'ইমেইল সাপোর্ট' : 'Email Support'}</span>
                  </a>
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0088cc] hover:bg-[#0077b3] text-white font-bold transition-colors shadow-2xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{isBn ? 'টেলিগ্রাম সাপোর্ট' : 'Telegram Support'}</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* ========================================================================= */}
      {/* FEATURED DYNAMIC REFUND TRACKER (SHOWN DIRECTLY IN STUDENT PANEL)         */}
      {/* ========================================================================= */}
      {primaryRequest && (
        (() => {
          const currentIndex = getStageIndex(primaryRequest.currentStageId);
          const isRejected = primaryRequest.status === 'rejected';
          const isCompleted = primaryRequest.status === 'completed';
          const progressPercent = Math.round(((currentIndex + 1) / REFUND_STAGES.length) * 100);
          const currentStageObj = REFUND_STAGES[currentIndex] || REFUND_STAGES[0];
          const nextStageObj = REFUND_STAGES[currentIndex + 1] || null;

          return (
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-xs text-left space-y-5">
              
              {/* Header with status badge & Token */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-extrabold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                      টোকেন: #{primaryRequest.id}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      isRejected
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}>
                      {isRejected 
                        ? 'বাতিল (REJECTED)' 
                        : isCompleted 
                        ? 'রিফান্ড সম্পন্ন (COMPLETED)' 
                        : 'প্রসেসিং চলছে (IN PROGRESS)'}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                    লাইভ রিফান্ড ট্র্যাকার • ৯-ধাপের পাইপলাইন
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedRequestForDetails(primaryRequest);
                      setIsDetailsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>আবেদনের সকল তথ্য দেখুন (ভিউ)</span>
                  </button>

                  <button
                    onClick={() => onSelectRequest(primaryRequest)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>পূর্ণাঙ্গ টাইমলাইন</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Indicator Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <div>
                    <span className="font-mono font-bold text-slate-900">Step 1: আবেদন জমা</span>
                  </div>
                  <div className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800">
                    অগ্রগতি: {progressPercent}%
                  </div>
                  <div>
                    <span className="font-mono font-bold text-slate-900">Step 9: অর্থ প্রদান</span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      isRejected ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Current & Next Stage Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                    CURRENT STAGE ({currentIndex + 1}/9)
                  </span>
                  <div className="font-bold text-slate-900 text-sm truncate">
                    {currentStageObj.titleBn}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    {isRejected ? 'পর্যালোচনা শেষে বাতিল' : isCompleted ? 'সম্পূর্ণ সম্পন্ন' : 'যাচাই ও প্রসেসিং চলমান'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
                    NEXT STAGE
                  </span>
                  <div className="font-bold text-slate-900 text-sm truncate">
                    {nextStageObj ? nextStageObj.titleBn : 'চূড়ান্ত পেমেন্ট সম্পন্ন'}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {nextStageObj ? `Step ${nextStageObj.stepNumber} of 9` : 'সর্বশেষ ধাপ'}
                  </span>
                </div>
              </div>

              {/* Assigned Team Leader & Trainer Banner */}
              {(primaryRequest.teamLeaderName || primaryRequest.teamTrainerName) && (
                <div className="p-3.5 bg-teal-50/70 rounded-xl border border-teal-200 text-xs">
                  <span className="text-[10px] uppercase font-bold text-teal-900 block mb-1">
                    আবেদনে নির্বাচিত টিম কর্মকর্তা:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-slate-500">টিম লিডার:</span>
                      <strong className="text-slate-900 font-semibold">{primaryRequest.teamLeaderName || '—'}</strong>
                      {primaryRequest.teamLeaderWhatsapp && (
                        <span className="font-mono text-[11px] text-slate-500">({primaryRequest.teamLeaderWhatsapp})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-slate-500">ট্রেইনার:</span>
                      <strong className="text-slate-900 font-semibold">{primaryRequest.teamTrainerName || '—'}</strong>
                      {primaryRequest.teamTrainerWhatsapp && (
                        <span className="font-mono text-[11px] text-slate-500">({primaryRequest.teamTrainerWhatsapp})</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })()
      )}

      {/* ================= REFUND POLICY NOTICE CARD ================= */}
      {/* If no requests yet, prominently display policy */}
      {userRequests.length === 0 && (
        <section aria-label="রিফান্ড পলিসি নোটিশ">
          <RefundPolicyCard 
            onProceed={() => {
              if (userRequests.length > 0) {
                onSelectRequest(userRequests[0]);
              } else {
                onOpenRequestForm();
              }
            }}
            hasExistingRequest={userRequests.length > 0}
            existingRequestId={userRequests[0]?.id}
          />
        </section>
      )}

      {/* Student's Refund Requests List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              আপনার রিফান্ড রিকোয়েস্ট হিস্ট্রি ও বর্তমান স্ট্যাটাস
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            মোট আবেদন: {userRequests.length} টি
          </span>
        </div>

        {userRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              আপনার কোনো সক্রিয় রিফান্ড রিকোয়েস্ট নেই
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5">
              প্রয়োজনীয় ক্ষেত্রে রিফান্ডের জন্য উপরের পলিসি দেখে "রিফান্ড রিকোয়েস্ট পাঠান" বাটনে ক্লিক করে আবেদন করতে পারেন।
            </p>
            <button
              onClick={onOpenRequestForm}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>রিফান্ড আবেদন শুরু করুন</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {userRequests.map((req) => {
              const stageInfo = getStageDetails(req.currentStageId);
              const isRejected = req.status === 'rejected';
              const isCompleted = req.status === 'completed';

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs hover:border-emerald-300 transition-all text-left"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Left Details */}
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                          {req.id}
                        </span>

                        {/* Status Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isRejected
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : isCompleted || req.status === 'approved' || req.status === 'issued'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          {isRejected
                            ? 'বাতিল / প্রত্যাখ্যাত (Cancelled)'
                            : isCompleted
                            ? 'রিফান্ড সম্পন্ন (Completed)'
                            : req.status === 'issued'
                            ? 'অর্থ প্রদান সম্পন্ন (Issued)'
                            : req.status === 'approved'
                            ? 'অনুমোদিত (Approved)'
                            : 'পেন্ডিং / পর্যালোচনা চলছে (Pending)'}
                        </span>

                        <span className="text-xs text-slate-500">
                          আবেদনের তারিখ: {req.submissionDate}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900">
                        {req.reasonCategory || 'কোর্স রিফান্ড'}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        <strong className="text-slate-700">কারণ: </strong> {req.reasonDetail}
                      </p>

                      {/* Current Stage Indicator */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-500">বর্তমান অবস্থান:</span>
                        <span className="font-bold text-slate-900">
                          {stageInfo?.titleBn || req.currentStageId}
                        </span>
                        <span className="text-slate-500 hidden sm:inline">
                          ({stageInfo?.responsibleRoleBn})
                        </span>
                      </div>
                    </div>

                    {/* Right Amount & Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="text-left lg:text-right">
                        <span className="text-[11px] text-slate-500 font-semibold block">রিফান্ড প্রত্যাশিত পরিমাণ</span>
                        <span className="text-xl font-black text-emerald-700 font-mono">
                          ৳ {req.amount.toLocaleString('bn-BD')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                        {/* View Submitted Details Button */}
                        <button
                          id={`view-details-${req.id}`}
                          onClick={() => {
                            setSelectedRequestForDetails(req);
                            setIsDetailsModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          <span>সকল তথ্য দেখুন (ভিউ)</span>
                        </button>

                        {isRejected && (
                          <button
                            id={`view-rejection-${req.id}`}
                            onClick={() => onOpenRejectionModal(req)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>বাতিলের কারণ</span>
                          </button>
                        )}

                        <button
                          id={`track-btn-${req.id}`}
                          onClick={() => onSelectRequest(req)}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                        >
                          <span>টাইমলাইন</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Submitted Application Full Details Modal */}
      <ApplicationDetailsModal
        isOpen={isDetailsModalOpen}
        request={selectedRequestForDetails}
        onClose={() => setIsDetailsModalOpen(false)}
        supportEmail={supportEmail}
        telegramUrl={telegramUrl}
      />

    </div>
  );
};

