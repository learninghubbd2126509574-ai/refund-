import React, { useState } from 'react';
import { RefundRequest } from '../types';
import { getStageDetails, calculateReviewTimeline } from '../data/stages';
import { 
  X, 
  FileText, 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  CreditCard, 
  Building2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  ExternalLink,
  MessageCircle,
  Maximize2,
  Download,
  Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ApplicationDetailsModalProps {
  isOpen: boolean;
  request: RefundRequest | null;
  onClose: () => void;
  supportEmail?: string;
  telegramUrl?: string;
}

export const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({
  isOpen,
  request,
  onClose,
  supportEmail = 'unityearning12@gmail.com',
  telegramUrl = 'https://t.me/unityearning12',
}) => {
  const [imageZoomed, setImageZoomed] = useState(false);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  if (!isOpen || !request) return null;

  const stageDef = getStageDetails(request.currentStageId);
  const isRejected = request.status === 'rejected';
  const isCompleted = request.status === 'completed';
  const { daysPassed, daysRemaining, isExpired } = calculateReviewTimeline(request.submissionDate, 20);

  const methodLabels: Record<string, string> = {
    bkash: 'বিকাশ (bKash)',
    nagad: 'নগদ (Nagad)',
    rocket: 'রকেট (Rocket)',
    upay: 'উপায় (Upay)',
    mcash: 'এমক্যাশ (mCash)',
    binance: 'Binance (USDT)',
    bank: 'ব্যাংক ট্রান্সফার'
  };

  const payoutMethodName = methodLabels[request.payoutMethod || request.paymentMethod || 'bkash'] || request.payoutMethod || 'বিকাশ';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 text-left">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-emerald-400">#{request.id}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isRejected
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {isRejected ? 'বাতিল' : isCompleted ? 'সম্পন্ন' : 'পর্যালোচনাধীন'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                রিফান্ড আবেদনের পূর্ণাঙ্গ বিবরণ ও সাবমিটকৃত তথ্য
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">

          {/* Official 20-Working-Day Policy Notice Banner */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-900">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>২০ কার্যদিবসের মধ্যে যাচাই-বাছাই ও নোটিশ:</span>
              </div>
              <span className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-md ${
                isExpired 
                  ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                  : 'bg-white text-slate-800 border border-slate-200'
              }`}>
                {isExpired ? '২০ দিন সমাপ্ত' : `${daysPassed} দিন অতিক্রান্ত • বাকি ${daysRemaining} দিন`}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">
              আপনার রিফান্ড আবেদনটি সর্বোচ্চ <strong>২০ কার্যদিবসের</strong> মধ্যে বিভিন্ন স্তরে সতর্কতার সাথে যাচাই-বাছাই করা হবে। সকল শর্তাবলী ও প্রমাণপত্র সন্তোষজনক হলে রিফান্ড অনুমোদন ও অর্থ প্রদান করা হবে।
            </p>

            <div className="pt-2 border-t border-amber-200/70 flex items-center justify-between gap-2 flex-wrap text-xs">
              <span className="text-slate-600 font-medium">কোনো সমস্যা বা তথ্যের জন্য যোগাযোগ:</span>
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${supportEmail}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 font-semibold hover:bg-slate-50 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-red-500" />
                  <span>ইমেইল</span>
                </a>
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0088cc] text-white font-semibold hover:bg-[#0077b3] transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>টেলিগ্রাম</span>
                </a>
              </div>
            </div>
          </div>

          {/* Section 1: Why Refund Was Requested (কারণ ও বিস্তারিত পরিস্থিতি) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>রিফান্ড চাওয়ার কারণ ও বিস্তারিত বিবরণ:</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs">
                {request.reasonCategory || 'সাধারণ রিফান্ড'}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
              {request.reasonDetail || 'কোনো কারণ উল্লেখ করা হয়নি।'}
            </div>
          </div>

          {/* Section 2: Student Profile & Course Data */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <span className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>শিক্ষার্থী পরিচিতি ও কাজের বিবরণ:</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">শিক্ষার্থীর নাম</span>
                <strong className="text-slate-900 font-semibold block truncate">{request.fullName || request.studentName}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">স্টুডেন্ট আইডি</span>
                <strong className="font-mono text-slate-900 font-bold block">{request.studentId}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">হোয়াটসঅ্যাপ</span>
                <strong className="font-mono text-slate-900 font-bold block truncate">{request.whatsapp}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">ইমেইল</span>
                <strong className="text-slate-900 font-medium block truncate">{request.email}</strong>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">যোগদানের তারিখ</span>
                <span className="text-slate-800 font-medium block">{request.joiningDate || '—'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">কাজের সময়কাল</span>
                <span className="text-slate-800 font-medium block">{request.durationWorked || '—'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">কাজ করেছেন কিনা</span>
                <span className="text-slate-800 font-medium block">{request.hasWorked === 'yes' ? 'হ্যাঁ (কাজ করেছেন)' : 'না'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px]">আবেদনের তারিখ</span>
                <span className="text-slate-800 font-medium block">{request.submissionDate}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Assigned Team Leader & Trainer */}
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50/50 p-4 sm:p-5 rounded-2xl border border-teal-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-teal-950 text-xs sm:text-sm flex items-center gap-2">
                <User className="w-4 h-4 text-teal-700" />
                <span>আবেদনে নির্বাচিত টিম কর্মকর্তা:</span>
              </span>
              <span className="text-[10px] text-teal-800 bg-teal-100 font-bold px-2 py-0.5 rounded-full border border-teal-200">
                দায়িত্বপ্রাপ্ত
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Team Leader */}
              <div className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  দায়িত্বপ্রাপ্ত টিম লিডার (TL)
                </span>
                <div className="font-bold text-slate-900 text-sm">
                  {request.teamLeaderName || 'নির্দিষ্ট করা নেই'}
                </div>
                <div className="mt-1 text-slate-600 flex items-center justify-between gap-1">
                  <span className="font-mono text-xs">{request.teamLeaderWhatsapp || 'নম্বর নেই'}</span>
                  {request.teamLeaderWhatsapp && (
                    <a
                      href={`https://wa.me/88${request.teamLeaderWhatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                    >
                      <Phone className="w-2.5 h-2.5" />
                      <span>হোয়াটসঅ্যাপ</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Trainer */}
              <div className="bg-white p-3.5 rounded-xl border border-teal-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                  দায়িত্বপ্রাপ্ত টিম ট্রেইনার (Trainer)
                </span>
                <div className="font-bold text-slate-900 text-sm">
                  {request.teamTrainerName || 'নির্দিষ্ট করা নেই'}
                </div>
                <div className="mt-1 text-slate-600 flex items-center justify-between gap-1">
                  <span className="font-mono text-xs">{request.teamTrainerWhatsapp || 'নম্বর নেই'}</span>
                  {request.teamTrainerWhatsapp && (
                    <a
                      href={`https://wa.me/88${request.teamTrainerWhatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                    >
                      <Phone className="w-2.5 h-2.5" />
                      <span>হোয়াটসঅ্যাপ</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Admission Payment Details & Payment Screenshot */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <span className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <span>ভর্তির পেমেন্ট ও স্ক্রিনশট তথ্য:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">পরিশোধিত ফি</span>
                <strong className="text-sm font-black text-slate-900 font-mono block mt-0.5">
                  ৳ {(request.paidAmount || request.amount || 0).toLocaleString('bn-BD')}
                </strong>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">পেমেন্ট মেথড</span>
                <strong className="text-sm font-bold text-slate-900 block mt-0.5">
                  {methodLabels[request.paidMethod || 'bkash'] || request.paidMethod || 'বিকাশ'}
                </strong>
              </div>

              <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-800 block uppercase font-bold">ট্রানজেকশন আইডি (TrxID)</span>
                <strong className="text-sm font-mono font-black text-emerald-900 block mt-0.5 tracking-wider">
                  {request.paymentTransactionId || request.transactionId || 'প্রদান করা হয়নি'}
                </strong>
              </div>
            </div>

            {/* Payment Screenshot Preview */}
            {request.paymentProofUrl ? (
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-slate-700 block">পেমেন্টের স্ক্রিনশট:</span>
                <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
                  <img
                    src={request.paymentProofUrl}
                    alt="পেমেন্টের স্ক্রিনশট"
                    className="w-full max-h-64 object-contain mx-auto cursor-pointer"
                    onClick={() => { setZoomedImageUrl(request.paymentProofUrl || null); }}
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                    <button
                      onClick={() => { setZoomedImageUrl(request.paymentProofUrl || null); }}
                      className="px-3 py-1.5 rounded-lg bg-white text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>বড় করে দেখুন</span>
                    </button>
                    <a
                      href={request.paymentProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>নতুন ট্যাবে খুলুন</span>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                কোনো পেমেন্ট স্ক্রিনশট সংযুক্ত করা হয়নি।
              </div>
            )}
          </div>

          {/* Section 5: Refund Payout Method & Amount */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <span className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>রিফান্ড পাওয়ার তথ্য (Payout Details):</span>
            </span>

            <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-600 block">
                  পেমেন্ট মেথড: <strong className="font-bold text-slate-900">{payoutMethodName}</strong>
                </span>
                <span className="text-xs text-slate-600 block mt-0.5">
                  অ্যাকাউন্ট নম্বর: <strong className="font-mono font-bold text-slate-900 text-sm">{request.payoutAccount || request.paymentAccount}</strong>
                  {request.payoutAccountType && (
                    <span className="ml-1 text-[11px] text-slate-500 capitalize">({request.payoutAccountType})</span>
                  )}
                </span>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">রিফান্ড প্রত্যাশিত পরিমাণ</span>
                <span className="text-xl font-black text-emerald-800 font-mono">
                  ৳ {request.amount.toLocaleString('bn-BD')}
                </span>
              </div>
            </div>

            {request.bankDetails && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-700">
                <span className="font-bold text-slate-900 block text-xs mb-1">ব্যাংক ট্রান্সফার বিস্তারিত:</span>
                <div>অ্যাকাউন্ট হোল্ডার: <strong>{request.bankDetails.accountHolderName}</strong></div>
                <div>ব্যাংক: <strong>{request.bankDetails.bankName}</strong> (শাখা: {request.bankDetails.branchName})</div>
                <div>রাউটিং নম্বর: <strong>{request.bankDetails.routingNumber}</strong></div>
              </div>
            )}
          </div>

          {/* Section 5: Handwritten Application (হাতে লেখা দরখাস্ত) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <span className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>সংযুক্ত হাতে লেখা আবেদন পত্র:</span>
            </span>

            {request.handwrittenApplicationUrl ? (
              <div className="space-y-2">
                <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
                  <img
                    src={request.handwrittenApplicationUrl}
                    alt="হাতে লেখা দরখাস্ত"
                    className="w-full max-h-72 object-contain mx-auto cursor-pointer"
                    onClick={() => setImageZoomed(true)}
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                    <button
                      onClick={() => setImageZoomed(true)}
                      className="px-3 py-1.5 rounded-lg bg-white text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>বড় করে দেখুন</span>
                    </button>
                    <a
                      href={request.handwrittenApplicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>নতুন ট্যাবে খুলুন</span>
                    </a>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 block text-center">
                  ছবিতে ক্লিক করে বড় করে পূর্ণ দরখাস্তটি পরীক্ষা করুন
                </span>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                কোনো হাতে লেখা আবেদন পত্র সংযুক্ত করা হয়নি।
              </div>
            )}

            {/* Handwritten text note if typed */}
            {request.handwrittenApplicationNote && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800">
                <span className="font-bold text-slate-900 block text-xs mb-1">দরখাস্তের সারসংক্ষেপ / টেক্সট:</span>
                <p className="whitespace-pre-wrap">{request.handwrittenApplicationNote}</p>
              </div>
            )}
          </div>

          {/* Section 6: Current Review Stage & Stage History */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <span className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>বর্তমান পর্যালোচনার অবস্থা:</span>
            </span>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">বর্তমান স্টেজ</span>
                <strong className="text-slate-900 font-bold">{stageDef?.titleBn || request.currentStageId}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">দায়িত্বপ্রাপ্ত টিম</span>
                <strong className="text-slate-800 font-semibold">{stageDef?.responsibleRoleBn}</strong>
              </div>
            </div>

            {request.stageLogs && request.stageLogs.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-slate-500 text-xs font-semibold block">রিভিউ লগ ও নোট:</span>
                {request.stageLogs.map((log, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-0.5">
                    <div className="flex items-center justify-between text-slate-700">
                      <strong className="text-slate-900">{log.reviewedBy || log.reviewerRoleBn}</strong>
                      <span className="text-slate-400 font-mono text-[10px]">{log.timestamp}</span>
                    </div>
                    {log.notes && <p className="text-slate-600">{log.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>

      </motion.div>

      {/* Full Size Image Lightbox */}
      <AnimatePresence>
        {(imageZoomed || zoomedImageUrl) && (
          <div 
            className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs cursor-pointer"
            onClick={() => {
              setImageZoomed(false);
              setZoomedImageUrl(null);
            }}
          >
            <div className="relative max-w-4xl max-h-[90vh] bg-white p-3 rounded-2xl shadow-2xl overflow-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">পূর্ণাঙ্গ ছবি ভিউ</span>
                <button
                  onClick={() => {
                    setImageZoomed(false);
                    setZoomedImageUrl(null);
                  }}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <img
                src={zoomedImageUrl || request.handwrittenApplicationUrl || ''}
                alt="পূর্ণ ছবি"
                className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl"
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
