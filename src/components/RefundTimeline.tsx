import React, { useState } from 'react';
import { RefundRequest } from '../types';
import { REFUND_STAGES, getStageIndex, calculateReviewTimeline } from '../data/stages';
import { ApplicationDetailsModal } from './ApplicationDetailsModal';
import { 
  Check, 
  Clock, 
  X, 
  ArrowLeft,
  XCircle,
  Printer,
  FileText,
  UserCheck,
  Eye,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  CreditCard,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { formatTrackingDate } from '../utils/formatDate';
import { useLanguage } from '../context/LanguageContext';

interface RefundTimelineProps {
  request: RefundRequest;
  onBack?: () => void;
  onOpenRejectionModal?: () => void;
  supportEmail?: string;
  telegramUrl?: string;
  isStudentView?: boolean;
}

export const RefundTimeline: React.FC<RefundTimelineProps> = ({
  request,
  onBack,
  onOpenRejectionModal,
  supportEmail = 'unityearning13@gmail.com',
  telegramUrl = 'https://t.me/unityearning12',
  isStudentView = false,
}) => {
  const { isBn } = useLanguage();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const currentIndex = getStageIndex(request.currentStageId);
  const isRejected = request.status === 'rejected';
  const isCompleted = request.status === 'completed';
  const progressPercent = Math.round(((currentIndex + 1) / REFUND_STAGES.length) * 100);

  const currentStageObj = REFUND_STAGES[currentIndex] || REFUND_STAGES[0];
  const nextStageObj = REFUND_STAGES[currentIndex + 1] || null;

  // 20-day review timeline calculation
  const { daysPassed, daysRemaining } = calculateReviewTimeline(request.submissionDate, 20);

  // Method Labels in English and Bengali
  const methodLabelsEn: Record<string, string> = {
    bkash: 'bKash (Personal)',
    nagad: 'Nagad (Personal)',
    rocket: 'Rocket (Personal)',
    upay: 'Upay',
    mcash: 'mCash',
    binance: 'Binance (USDT)',
    bank: 'Bank Transfer'
  };

  const methodLabelsBn: Record<string, string> = {
    bkash: 'বিকাশ (পার্সোনাল)',
    nagad: 'নগদ (পার্সোনাল)',
    rocket: 'রকেট (পার্সোনাল)',
    upay: 'উপায়',
    mcash: 'এমক্যাশ',
    binance: 'বাইনান্স (USDT)',
    bank: 'ব্যাংক ট্রান্সফার'
  };

  const methodLabels = isBn ? methodLabelsBn : methodLabelsEn;
  const studentDisplayName = request.fullName || request.studentName || (isBn ? 'শিক্ষার্থী' : 'Student');

  return (
    <div className="max-w-2xl mx-auto px-3.5 sm:px-6 py-4 sm:py-7 text-left space-y-3.5 sm:space-y-4 font-sans text-slate-800">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2 pb-1">
        {onBack && !isStudentView && (
          <button
            id="timeline-back-btn"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
          </button>
        )}
        
        {isStudentView && (
          <div className="text-xs sm:text-sm font-bold text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">{isBn ? `স্বাগতম, ${studentDisplayName}` : `Welcome, ${studentDisplayName}`}</span>
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {/* View Details Modal Button - Hidden for students */}
          {!isStudentView && (
            <button
              id="timeline-view-details-btn"
              onClick={() => setIsDetailsModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title={isBn ? "জমা দেওয়া আবেদনের বিবরণ দেখুন" : "View submitted application details"}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isBn ? 'বিস্তারিত দেখুন' : 'View Details'}</span>
            </button>
          )}

          {!isStudentView && (
            <button
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:bg-slate-50 shadow-2xs cursor-pointer"
            >
              <Printer className="w-3 h-3" />
              <span>{isBn ? 'প্রিন্ট' : 'Print'}</span>
            </button>
          )}

          <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-xl border border-slate-200 shrink-0">
            #{request.id}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PROMINENT 20-BUSINESS-DAY OFFICIAL NOTICE OR REJECTION CANCELLATION BOX   */}
      {/* ========================================================================= */}
      {isRejected ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-50 via-red-50/60 to-rose-100/50 border-2 border-rose-300 shadow-sm space-y-3 text-left">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                <XCircle className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-xs sm:text-sm text-rose-950 block">
                  {isBn ? 'রিফান্ড আবেদন বাতিল ও পলিসি বাতিল নোটিশ' : 'Refund Application Cancelled & Policy Void Notice'}
                </span>
                <span className="text-[10px] sm:text-[11px] text-rose-700 font-semibold block">
                  {isBn ? 'যথাযথ কারণ ও শর্তাবলী পূরণ না হওয়ায় ২০ কার্যদিবসের মাথায় বাতিল' : 'Cancelled at 20-day mark due to lack of verified valid grounds'}
                </span>
              </div>
            </div>

            <span className="font-mono font-bold text-[11px] px-2.5 py-1 rounded-lg bg-rose-600 text-white shadow-2xs">
              {isBn ? 'চূড়ান্তভাবে বাতিল' : 'Officially Declined'}
            </span>
          </div>

          <div className="p-3 bg-white/90 rounded-xl border border-rose-200 text-rose-950 text-xs sm:text-sm leading-relaxed space-y-1.5">
            <p className="font-bold text-rose-900">
              {isBn ? 'কর্তৃপক্ষের আনুষ্ঠানিক অডিট নোটিশ:' : 'Official Audit Clearance Notice:'}
            </p>
            <p className="text-slate-800 text-xs leading-relaxed">
              {request.rejectionReason || (isBn 
                ? 'আমাদের অভ্যন্তরীণ পলিসি ও অডিট কমিটির পুঙ্খানুপুঙ্খ পর্যালোচনা শেষে আপনার রিফান্ড আবেদনটি বাতিল করা হয়েছে। রিফান্ড পলিসির নির্ধারিত শর্তাবলী অনুযায়ী আপনার দাখিলকৃত আবেদনের সপক্ষে কোনো সুনির্দিষ্ট ও প্রমাণযোগ্য যৌক্তিক কারণ পাওয়া যায়নি। ফলে প্রাতিষ্ঠানিক নীতিমালার আওতায় ২০ কার্যদিবসের মাথায় আপনার রিফান্ড রিকোয়েস্টটি বাতিল গণ্য করা হলো এবং এই আবেদনের রিফান্ড পলিসি বাদ/বাতিল ঘোষণা করা হলো।'
                : 'Following institutional compliance and policy committee audit, your refund request has been declined. No verified qualifying grounds were established under standard refund terms. Consequently, at the 20-business-day milestone, your request is closed and the refund policy is voided for this application.')
              }
            </p>
          </div>

          <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between gap-2 flex-wrap text-xs">
            <span className="text-[11px] text-rose-800 font-medium">
              {isBn ? 'পুনর্বিবেচনা বা সহায়তার জন্য যোগাযোগ:' : 'Contact Official Support:'}
            </span>
            <div className="flex items-center gap-1.5">
              <a
                href={`mailto:${supportEmail}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-900 text-[11px] font-bold hover:bg-rose-50 transition-colors shadow-2xs"
              >
                <Mail className="w-3 h-3 text-rose-600" />
                <span>{isBn ? 'ইমেইল সাপোর্ট' : 'Email Support'}</span>
              </a>
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0088cc] hover:bg-[#0077b3] text-white text-[11px] font-bold transition-colors shadow-2xs"
              >
                <Send className="w-3 h-3" />
                <span>{isBn ? 'টেলিগ্রাম' : 'Telegram'}</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-slate-50 border border-emerald-200/90 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 block truncate">
                  {isBn ? 'অফিসিয়াল ২০ কার্যদিবসের প্রসেসিং নোটিশ' : 'Official 20-Business-Day Processing Notice'}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-600 block">
                  {isBn ? 'বহুস্তরীয় প্রাতিষ্ঠানিক অডিট ও অর্থনৈতিক অনুমোদন প্রটোকল' : 'Multi-tier institutional audit & financial clearance protocol'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="font-mono font-bold text-[11px] px-2.5 py-1 rounded-lg bg-white text-slate-800 border border-slate-200 shadow-2xs">
                {isBn ? `${daysPassed} দিন অতিবাহিত • ${daysRemaining} দিন বাকি` : `${daysPassed} Days Elapsed • ${daysRemaining} Days Left`}
              </span>
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
            {isBn ? (
              <>আপনার রিফান্ড আবেদনটি আমাদের স্ট্যান্ডার্ড <strong>২০ কার্যদিবসের</strong> প্রাতিষ্ঠানিক যাচাইকরণ প্রক্রিয়ায় রয়েছে। সংশ্লিষ্ট সকল প্রশাসনিক পর্যালোচনা সম্পন্ন হলে নির্ধারিত অ্যাকাউন্টে অর্থ রিফান্ড করা হবে।</>
            ) : (
              <>Your refund request is processed under our standard <strong>20-business-day</strong> departmental verification pipeline. Once all administrative requirements and audits are cleared, disbursement is issued directly to your designated account.</>
            )}
          </p>

          <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between gap-2 flex-wrap text-xs">
            <span className="text-[11px] text-slate-500 font-medium">
              {isBn ? 'অফিসিয়াল সাপোর্ট চ্যানেল:' : 'Official Support Channels:'}
            </span>
            <div className="flex items-center gap-1.5">
              <a
                href={`mailto:${supportEmail}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 text-[11px] font-bold hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Mail className="w-3 h-3 text-amber-600" />
                <span>{isBn ? 'ইমেইল সাপোর্ট' : 'Email Support'}</span>
              </a>
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0088cc] hover:bg-[#0077b3] text-white text-[11px] font-bold transition-colors shadow-2xs"
              >
                <Send className="w-3 h-3" />
                <span>{isBn ? 'টেলিগ্রাম' : 'Telegram'}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TICKET-STYLE OVERVIEW CARD                                                */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs text-left space-y-3 sm:space-y-4">
        
        {/* Card Header Tags */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              isRejected
                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                : isCompleted
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-900 border border-amber-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                isRejected ? 'bg-rose-600' : isCompleted ? 'bg-emerald-600' : 'bg-amber-600 animate-pulse'
              }`} />
              {isRejected 
                ? (isBn ? 'বাতিল' : 'DECLINED')
                : isCompleted 
                ? (isBn ? 'রিফান্ড সম্পন্ন' : 'DISBURSED') 
                : (isBn ? 'যাচাইকরণ চলমান' : 'IN PROGRESS')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{formatTrackingDate(request.lastUpdatedDate || request.submissionDate, 0)}</span>
            </span>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight">
            {isBn ? 'অফিসিয়াল রিফান্ড ট্র্যাকার' : 'Official Refund Tracker'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isBn ? 'শিক্ষার্থী:' : 'Student:'} <strong className="text-slate-800 font-semibold">{studentDisplayName}</strong> ({request.studentId}) • {isBn ? 'পরিমাণ:' : 'Amount:'} <strong className="text-emerald-700">{isBn ? `৳ ${request.amount.toLocaleString()}` : `BDT ${request.amount.toLocaleString()}`}</strong>
          </p>
        </div>

        {/* Horizontal Progress Bar */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div>
              <span className="text-xs sm:text-sm font-black font-mono text-slate-900">{isBn ? 'ধাপ ১' : 'Step 1'}</span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 block">{isBn ? 'আবেদন জমা' : 'Application Filed'}</span>
            </div>

            <div className="text-center px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-mono font-bold text-slate-700">
              {isBn ? `${progressPercent}% সম্পন্ন` : `${progressPercent}% Complete`}
            </div>

            <div className="text-right">
              <span className="text-xs sm:text-sm font-black font-mono text-slate-900">{isBn ? 'ধাপ ৯' : 'Step 9'}</span>
              <span className="text-[10px] sm:text-[11px] text-slate-500 block">{isBn ? 'পেমেন্ট সম্পন্ন' : 'Disbursed'}</span>
            </div>
          </div>

          {/* Connected Track Bar */}
          <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                isRejected ? 'bg-rose-500' : 'bg-gradient-to-r from-emerald-500 to-teal-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Current Stage & Next Stage Micro Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
              {isBn ? `বর্তমান ধাপ (${currentIndex + 1}/৯)` : `CURRENT STAGE (${currentIndex + 1}/9)`}
            </span>
            <div className="font-bold text-slate-900 truncate text-xs sm:text-sm">
              {isBn ? currentStageObj.titleBn : (currentStageObj.titleEn || currentStageObj.titleBn)}
            </div>
            <span className="text-[10px] sm:text-[11px] text-emerald-700 font-medium block mt-0.5">
              {isRejected 
                ? (isBn ? 'পর্যালোচনা শেষে বাতিল' : 'Declined upon Review') 
                : isCompleted 
                ? (isBn ? 'অর্থ প্রেরণ সম্পন্ন' : 'Disbursement Finalized') 
                : (isBn ? 'যাচাইকরণ চলমান' : 'Verification Underway')}
            </span>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-0.5">
              {isBn ? 'পরবর্তী ধাপ' : 'UPCOMING MILESTONE'}
            </span>
            <div className="font-bold text-slate-900 truncate text-xs sm:text-sm">
              {nextStageObj ? (isBn ? nextStageObj.titleBn : (nextStageObj.titleEn || nextStageObj.titleBn)) : (isBn ? 'সকল ধাপ সম্পন্ন' : 'Disbursement Complete')}
            </div>
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium block mt-0.5">
              {nextStageObj ? (isBn ? `ধাপ ${nextStageObj.stepNumber} (মোট ৯)` : `Step ${nextStageObj.stepNumber} of 9`) : (isBn ? 'চূড়ান্ত পর্যায়' : 'Final Step Reached')}
            </span>
          </div>
        </div>

        {/* Assigned Team Leader & Trainer Info from Application */}
        {(request.teamLeaderName || request.teamTrainerName) && (
          <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200/80 text-xs">
            <span className="text-[10px] uppercase font-bold text-teal-900 block mb-1">
              {isBn ? 'আবেদনে নির্বাচিত টিম কর্মকর্তা:' : 'Assigned Supervisory Officers:'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-slate-500 text-[11px]">{isBn ? 'টিম লিডার:' : 'Team Leader:'}</span>
                <strong className="text-slate-900 font-semibold">{request.teamLeaderName || '—'}</strong>
                {request.teamLeaderWhatsapp && (
                  <span className="font-mono text-[10px] text-slate-500">({request.teamLeaderWhatsapp})</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-slate-500 text-[11px]">{isBn ? 'ট্রেইনার:' : 'Trainer:'}</span>
                <strong className="text-slate-900 font-semibold">{request.teamTrainerName || '—'}</strong>
                {request.teamTrainerWhatsapp && (
                  <span className="font-mono text-[10px] text-slate-500">({request.teamTrainerWhatsapp})</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Rejection Notice if any */}
        {isRejected && onOpenRejectionModal && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-rose-900">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{isBn ? 'আবেদনটি বাতিল করা হয়েছে। কারণ দেখতে ক্লিক করুন।' : 'Application declined. Click to review remarks.'}</span>
            </div>
            <button
              onClick={onOpenRejectionModal}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer"
            >
              {isBn ? 'কারণ দেখুন' : 'View Reason'}
            </button>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* COMPACT ROUTE TIMELINE (9 STOPS SLEEK LIST)                                */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs text-left">
        
        {/* Section Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
          <div>
            <h2 className="text-xs font-extrabold tracking-wider uppercase text-slate-700">
              {isBn ? 'রিফান্ড রোডম্যাপ • ৯টি ধাপ' : 'Refund Roadmap • 9 Milestones'}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold">
            <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {isBn ? 'যাচাইকৃত' : 'Verified'}
            </span>
            <span className="inline-flex items-center gap-1 text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {isBn ? 'পর্যালোচনাধীন' : 'In Review'}
            </span>
            <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              {isBn ? 'অপেক্ষমাণ' : 'Queued'}
            </span>
          </div>
        </div>

        {/* Sleek Vertical List with Connector Line & Nodes */}
        <div className="space-y-0 relative">
          {REFUND_STAGES.map((stage, idx) => {
            const isCompletedStage = !isRejected && idx < currentIndex;
            const isCurrentActive = !isRejected && idx === currentIndex;
            const isRejectedAtThisStage = isRejected && idx === currentIndex;
            const isPassedBeforeRejection = isRejected && idx < currentIndex;
            const isLast = idx === REFUND_STAGES.length - 1;

            // Generate clean timestamp
            const stageLog = request.stageLogs?.find((l) => l.stageId === stage.id);
            const timeFormatted = stageLog?.timestamp 
              ? formatTrackingDate(stageLog.timestamp) 
              : isCompletedStage || isPassedBeforeRejection
              ? formatTrackingDate(request.submissionDate, (currentIndex - idx) * 90)
              : isCurrentActive
              ? formatTrackingDate(request.lastUpdatedDate || request.submissionDate, 0)
              : '—';

            return (
              <div key={stage.id} className="relative flex items-start gap-2.5 sm:gap-3.5 pb-4 last:pb-1 group">
                
                {/* 1. Left Column: Compact Timestamp */}
                <div className="w-14 sm:w-16 pt-0.5 text-right shrink-0">
                  <div className={`text-[11px] sm:text-xs font-mono font-bold leading-tight ${
                    isCurrentActive
                      ? 'text-amber-800'
                      : isRejectedAtThisStage
                      ? 'text-rose-700'
                      : isCompletedStage || isPassedBeforeRejection
                      ? 'text-slate-800'
                      : 'text-slate-300'
                  }`}>
                    {timeFormatted !== '—' ? timeFormatted.split(',')[0] : '—'}
                  </div>
                  {timeFormatted !== '—' && (
                    <div className="text-[9px] sm:text-[10px] font-medium text-slate-400 leading-tight mt-0.5">
                      {isBn 
                        ? (isCurrentActive ? 'চলতি' : isRejectedAtThisStage ? 'বাতিল' : 'উত্তীর্ণ')
                        : (isCurrentActive ? 'Active' : isRejectedAtThisStage ? 'Declined' : 'Passed')}
                    </div>
                  )}
                </div>

                {/* 2. Middle Column: Clean Dot Node & Connector Line */}
                <div className="flex flex-col items-center shrink-0 pt-0.5">
                  
                  {/* Node Dot */}
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                    isRejectedAtThisStage
                      ? 'bg-rose-600 ring-4 ring-rose-100 text-white'
                      : isCompletedStage || isPassedBeforeRejection
                      ? 'bg-emerald-600 ring-4 ring-emerald-100 text-white shadow-2xs'
                      : isCurrentActive
                      ? 'bg-amber-500 ring-4 ring-amber-100 animate-pulse text-white shadow-2xs'
                      : 'bg-white border-2 border-slate-300'
                  }`}>
                    {isCompletedStage || isPassedBeforeRejection ? (
                      <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                    ) : isRejectedAtThisStage ? (
                      <X className="w-2.5 h-2.5 text-white stroke-[3]" />
                    ) : null}
                  </div>

                  {/* Vertical Connector Line */}
                  {!isLast && (
                    <div className={`w-0.5 h-8 sm:h-9 my-0.5 ${
                      isCompletedStage || isPassedBeforeRejection
                        ? 'bg-emerald-500'
                        : isRejectedAtThisStage
                        ? 'bg-rose-400'
                        : 'bg-slate-200'
                    }`} />
                  )}
                </div>

                {/* 3. Right Column: Stage Details & Status Tag */}
                <div className="flex-1 min-w-0 pt-0 flex items-start justify-between gap-2">
                  <div className="min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs sm:text-sm font-bold truncate ${
                        isCurrentActive
                          ? 'text-amber-950 font-extrabold'
                          : isRejectedAtThisStage
                          ? 'text-rose-950 font-extrabold'
                          : isCompletedStage || isPassedBeforeRejection
                          ? 'text-slate-900'
                          : 'text-slate-400'
                      }`}>
                        {isBn ? stage.titleBn : (stage.titleEn || stage.titleBn)}
                      </span>
                    </div>

                    <div className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-tight">
                      {isBn ? `${stage.responsibleRoleBn} • ${stage.estimatedTimeBn}` : `${stage.responsibleRoleEn || stage.responsibleRoleBn} • ${stage.estimatedTimeEn || stage.estimatedTimeBn}`}
                    </div>

                    <div className="text-[10px] text-slate-400 mt-0.5 hidden sm:block truncate">
                      {isBn ? stage.descriptionBn : (stage.descriptionEn || stage.descriptionBn)}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0 pt-0.5">
                    {isRejectedAtThisStage ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                        {isBn ? 'বাতিল' : 'DECLINED'}
                      </span>
                    ) : isCompletedStage || isPassedBeforeRejection ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        {isBn ? 'যাচাইকৃত' : 'VERIFIED'}
                      </span>
                    ) : isCurrentActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200 shadow-2xs animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                        {isBn ? 'পর্যালোচনাধীন' : 'IN REVIEW'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-400 border border-slate-200">
                        {isBn ? 'অপেক্ষমাণ' : 'QUEUED'}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SUMMARY PAYMENT & DISBURSEMENT DETAILS CARD                               */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs text-left space-y-3">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isBn ? 'পেমেন্ট ও রিফান্ড সারসংক্ষেপ' : 'Disbursement & Settlement Summary'}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">{isBn ? 'ক্যাটাগরি' : 'Category'}</span>
            <span className="font-semibold text-slate-800 truncate block mt-0.5">
              {request.reasonCategory || (isBn ? 'স্ট্যান্ডার্ড রিফান্ড' : 'Standard Refund')}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">{isBn ? 'রিফান্ড পরিমাণ' : 'Refund Amount'}</span>
            <span className="font-extrabold text-emerald-700 block mt-0.5 text-xs sm:text-sm">
              {isBn ? `৳ ${request.amount.toLocaleString()}` : `BDT ${request.amount.toLocaleString()}`}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">{isBn ? 'পেমেন্ট মেথড' : 'Payout Method'}</span>
            <span className="font-semibold text-slate-800 truncate block mt-0.5">
              {methodLabels[request.payoutMethod || request.paymentMethod || 'bkash'] || (isBn ? 'বিকাশ' : 'bKash')}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">{isBn ? 'অ্যাকাউন্ট নম্বর' : 'Account Number'}</span>
            <span className="font-mono font-bold text-slate-800 truncate block mt-0.5">
              {request.payoutAccount || request.paymentAccount}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>{isBn ? 'বেনিফিশিয়ারি:' : 'Beneficiary:'} <strong className="text-slate-700">{studentDisplayName}</strong></span>
          <span className="font-mono text-[10px]">{isBn ? 'রেফারেন্স:' : 'Reference:'} #{request.id}</span>
        </div>
      </div>

      {/* Submitted Application Full Details Modal */}
      <ApplicationDetailsModal
        isOpen={isDetailsModalOpen}
        request={request}
        onClose={() => setIsDetailsModalOpen(false)}
        supportEmail={supportEmail}
        telegramUrl={telegramUrl}
      />

    </div>
  );
};


