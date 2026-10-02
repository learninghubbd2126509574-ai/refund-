import React, { useState } from 'react';
import { User, RefundRequest, RefundMethod, BankDetails } from '../types';
import { 
  Send, 
  UserCheck, 
  Briefcase, 
  HelpCircle, 
  CreditCard, 
  CheckSquare, 
  AlertCircle, 
  Building2, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  ArrowLeft,
  DollarSign,
  FileText,
  UploadCloud,
  Trash2,
  Eye,
  CheckCircle2,
  Receipt,
  Image as ImageIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { compressImageFile } from '../utils/imageCompressor';

interface RefundRequestFormProps {
  currentUser: User;
  onBack: () => void;
  onSubmitSuccess: (newRequest: RefundRequest) => void;
  existingRequest?: RefundRequest | null;
  onSelectRequest?: (request: RefundRequest) => void;
}

export const RefundRequestForm: React.FC<RefundRequestFormProps> = ({
  currentUser,
  onBack,
  onSubmitSuccess,
  existingRequest,
  onSelectRequest,
}) => {
  // Student Info (Pre-filled from profile)
  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [whatsapp, setWhatsapp] = useState(currentUser.whatsapp || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [studentId, setStudentId] = useState(currentUser.studentId || '');

  // Work Info
  const [joiningDate, setJoiningDate] = useState('');
  const [durationWorked, setDurationWorked] = useState('');
  const [teamLeaderName, setTeamLeaderName] = useState(currentUser.teamLeaderName || '');
  const [teamLeaderWhatsapp, setTeamLeaderWhatsapp] = useState('');
  const [teamTrainerName, setTeamTrainerName] = useState(currentUser.teamTrainerName || '');
  const [teamTrainerWhatsapp, setTeamTrainerWhatsapp] = useState('');
  const [hasWorked, setHasWorked] = useState('yes');
  
  // Financial Info & Payment Proof
  const [amount, setAmount] = useState<number | ''>(''); // Amount to be refunded
  const [paidAmount, setPaidAmount] = useState<number | ''>(''); // Amount paid during admission
  const [paidMethod, setPaidMethod] = useState<RefundMethod>('bkash');
  const [paymentTransactionId, setPaymentTransactionId] = useState('');
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreviewUrl, setPaymentProofPreviewUrl] = useState<string | null>(null);

  const [studentIdBalance, setStudentIdBalance] = useState<number | ''>('');
  const [emergencyContact, setEmergencyContact] = useState('');

  const handlePaymentProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setPaymentProofFile(file);
      const url = URL.createObjectURL(file);
      setPaymentProofPreviewUrl(url);
    }
  };

  const handleRemovePaymentProofFile = () => {
    setPaymentProofFile(null);
    if (paymentProofPreviewUrl) {
      URL.revokeObjectURL(paymentProofPreviewUrl);
      setPaymentProofPreviewUrl(null);
    }
  };

  // Refund Reason & Files
  const [reasonCategory, setReasonCategory] = useState('ব্যক্তিগত ও বাস্তব পরিস্থিতি');
  const [reasonDetail, setReasonDetail] = useState('');
  const [handwrittenApplicationFile, setHandwrittenApplicationFile] = useState<File | null>(null);
  const [handwrittenPreviewUrl, setHandwrittenPreviewUrl] = useState<string | null>(null);

  const handleHandwrittenFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setHandwrittenApplicationFile(file);
      const url = URL.createObjectURL(file);
      setHandwrittenPreviewUrl(url);
    }
  };

  const handleRemoveHandwrittenFile = () => {
    setHandwrittenApplicationFile(null);
    if (handwrittenPreviewUrl) {
      URL.revokeObjectURL(handwrittenPreviewUrl);
      setHandwrittenPreviewUrl(null);
    }
  };

  // Payout Method & Account
  const [payoutMethod, setPayoutMethod] = useState<RefundMethod>('bkash');
  const [payoutAccount, setPayoutAccount] = useState(currentUser.whatsapp || '');

  // Bank specific fields
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    accountHolderName: currentUser.fullName || '',
    bankName: '',
    accountNumber: '',
    branchName: '',
    routingNumber: '',
  });

  // Confirmation checkbox
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const showError = (msg: string) => {
      setFormError(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (existingRequest) {
      showError('আপনি ইতিমধ্যে একটি রিফান্ড রিকোয়েস্ট জমা দিয়েছেন (টোকেন: ' + existingRequest.id + ')। একই অ্যাকাউন্ট থেকে দ্বিতীয়বার আবেদন করা সম্ভব নয়।');
      return;
    }

    if (!fullName.trim() || !whatsapp.trim() || !email.trim() || !studentId.trim()) {
      showError('অনুগ্রহ করে আপনার সকল ব্যক্তিগত তথ্য (নাম, হোয়াটসঅ্যাপ, ইমেইল, স্টুডেন্ট আইডি) সঠিকভাবে পূরণ করুন');
      return;
    }

    if (!joiningDate || !durationWorked.trim() || !teamLeaderName.trim() || !teamLeaderWhatsapp.trim()) {
      showError('অনুগ্রহ করে প্ল্যাটফর্মে আপনার কাজের সকল তথ্য (যোগদানের তারিখ, কাজের সময়কাল, টিম লিডার নাম ও নম্বর) পূরণ করুন');
      return;
    }

    if (amount === '' || paidAmount === '' || Number(amount) <= 0 || Number(paidAmount) <= 0) {
      showError('অনুগ্রহ করে আর্থিক তথ্য (পরিশোধিত অর্থ ও রিফান্ড দাবি করা পরিমাণ) সঠিকভাবে পূরণ করুন');
      return;
    }

    if (!paymentTransactionId.trim()) {
      showError('অনুগ্রহ করে ভর্তির সময় যে মাধ্যমে পেমেন্ট করেছেন তার ট্রানজেকশন আইডি (TrxID) প্রদান করুন');
      return;
    }

    if (!paymentProofFile) {
      showError('অনুগ্রহ করে ভর্তির ফি পেমেন্টের স্ক্রিনশট বা রসিদের ছবি আপলোড করুন');
      return;
    }

    if (!reasonCategory) {
      showError('অনুগ্রহ করে রিফান্ড চাওয়ার প্রাথমিক কারণ নির্বাচন করুন');
      return;
    }

    if (!handwrittenApplicationFile) {
      showError('অনুগ্রহ করে সাদা কাগজে নিজের হাতে লেখা দরখাস্তের ছবি (Handwritten Application Letter) আপলোড করুন');
      return;
    }

    if (!reasonDetail.trim() || reasonDetail.trim().length < 15) {
      showError('অনুগ্রহ করে কেন রিফান্ড চাচ্ছেন তার বিস্তারিত বিবরণ ও ব্যাখ্যা লিখুন (কমপক্ষে ১৫ অক্ষর)');
      return;
    }

    if (payoutMethod === 'bank') {
      if (!bankDetails.accountHolderName || !bankDetails.bankName || !bankDetails.accountNumber) {
        showError('ব্যাংক অ্যাকাউন্টের সম্পূর্ণ তথ্য (হোল্ডারের নাম, ব্যাংক নাম ও অ্যাকাউন্ট নম্বর) প্রদান করুন');
        return;
      }
    } else {
      if (!payoutAccount.trim()) {
        showError('রিফান্ড গ্রহণের নম্বর বা ওয়ালেট আইডি প্রদান করুন');
        return;
      }
    }

    if (!isConfirmed) {
      showError('অনুগ্রহ করে নিচে সম্মতি নিশ্চিতকরণ বক্সে টিক চিহ্ন দিন');
      return;
    }

    setIsSubmitting(true);

    let handwrittenUrl: string | undefined = undefined;
    if (handwrittenApplicationFile) {
      try {
        handwrittenUrl = await compressImageFile(handwrittenApplicationFile, 1000, 0.72);
      } catch (err) {
        console.error('File compression failed:', err);
      }
    }

    let paymentProofUrl: string | undefined = undefined;
    if (paymentProofFile) {
      try {
        paymentProofUrl = await compressImageFile(paymentProofFile, 1000, 0.72);
      } catch (err) {
        console.error('Payment proof compression failed:', err);
      }
    }

    const newRequestId = `UE-REF-${Math.floor(10000 + Math.random() * 90000)}`;
    const nowStr = new Date().toISOString().split('T')[0];

    const newRequest: RefundRequest = {
      id: newRequestId,
      userId: currentUser.id,
      fullName: fullName.trim(),
      whatsapp: whatsapp.trim(),
      email: email.trim(),
      studentId: studentId.trim(),
      joiningDate,
      durationWorked: durationWorked.trim(),
      hasWorked,
      teamLeaderName: teamLeaderName.trim(),
      teamLeaderWhatsapp: teamLeaderWhatsapp.trim(),
      teamTrainerName: teamTrainerName.trim(),
      teamTrainerWhatsapp: teamTrainerWhatsapp.trim(),
      amount: Number(amount) || 0,
      paidAmount: Number(paidAmount) || 0,
      paidMethod: paidMethod,
      paymentTransactionId: paymentTransactionId.trim(),
      transactionId: paymentTransactionId.trim(),
      paymentProofUrl: paymentProofUrl || '',
      studentIdBalance: Number(studentIdBalance) || 0,
      emergencyContact: emergencyContact.trim(),
      reasonCategory,
      reasonDetail: reasonDetail.trim(),
      handwrittenApplicationUrl: handwrittenUrl || '',
      payoutMethod,
      payoutAccount: payoutMethod === 'bank' ? bankDetails.accountNumber : payoutAccount.trim(),
      bankDetails: payoutMethod === 'bank' ? bankDetails : undefined,
      status: 'pending',
      currentStageId: 'submitted',
      submissionDate: nowStr,
      lastUpdatedDate: nowStr,
      stageLogs: [
        {
          id: `log-${Date.now()}`,
          stageId: 'submitted',
          status: 'passed',
          reviewedBy: 'সিস্টেম অটোমেশন',
          reviewerRoleBn: 'সিস্টেম অটোমেশন',
          timestamp: `${nowStr} (তাৎক্ষণিক)`,
          notes: 'রিফান্ড রিকোয়েস্ট সফলভাবে সিস্টেমে নিবন্ধিত হয়েছে এবং টোকেন আইডি ইস্যু করা হয়েছে।'
        }
      ],
      internalNotes: []
    };

    setIsSubmitting(false);
    onSubmitSuccess(newRequest);
  };

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8 text-left">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-slate-200/80">
        <button
          id="form-back-btn"
          onClick={onBack}
          type="button"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ড্যাশবোর্ডে ফিরে যান</span>
        </button>

        <div className="text-right">
          <span className="text-xs text-slate-500 font-mono">
            স্টুডেন্ট আইডি: <strong className="text-slate-900">{currentUser.studentId}</strong>
          </span>
        </div>
      </div>

      {/* Main Title Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-8 mb-6 sm:mb-8">
        {existingRequest && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 mb-6 text-left space-y-3">
            <div className="flex items-center gap-3 text-amber-950">
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 shrink-0" />
              <h3 className="text-sm sm:text-base font-bold">একটি অ্যাকাউন্ট থেকে একটিই রিফান্ড আবেদন গ্রহণযোগ্য!</h3>
            </div>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              আপনার অ্যাকাউন্ট থেকে ইতিমধ্যেই একটি রিফান্ড আবেদন (টোকেন আইডি: <strong className="font-mono bg-amber-100 px-2 py-0.5 rounded text-amber-950">{existingRequest.id}</strong>) সিস্টেমে নিবন্ধিত রয়েছে। ডুপ্লিকেট আবেদন এড়াতে একটি অ্যাকাউন্ট থেকে দ্বিতীয়বার ফরম জমা দেওয়া বন্ধ রাখা হয়েছে।
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => onSelectRequest && onSelectRequest(existingRequest)}
                className="h-10 sm:h-11 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
              >
                <span>আপনার পূর্ববর্তী রিফান্ড আবেদন ট্র্যাক করুন</span>
              </button>
            </div>
          </div>
        )}

        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mb-1.5 leading-tight">
          রিফান্ড রিকোয়েস্ট পাঠান
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          অনুগ্রহ করে প্রতিটি সেকশনের তথ্য সতর্কতার সাথে পূরণ করুন। আপনার দেওয়া তথ্যের সত্যতা আমাদের রিভিউ টিম কর্তৃক যাচাই করা হবে।
        </p>

        {formError && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3.5 sm:p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-center gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{formError}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6 sm:mt-8 space-y-6 sm:space-y-8">
          
          {/* ================= REFUND POLICY ================= */}
          <div className="bg-emerald-50/80 border border-emerald-200/90 p-4 sm:p-5 rounded-2xl">
            <h3 className="font-bold text-emerald-950 mb-1.5 flex items-center gap-2 text-xs sm:text-sm">
              <AlertCircle className="w-4 h-4 text-emerald-700" />
              <span>কোম্পানির রিফান্ড পলিসি</span>
            </h3>
            <p className="text-xs sm:text-[13px] text-emerald-900 leading-relaxed">
              ইউনিটি আর্নিং প্ল্যাটফর্মের রিফান্ড পলিসি অনুযায়ী, যুক্তিসঙ্গত কারণ এবং যথাযথ প্রমাণের ভিত্তিতে রিফান্ড আবেদন গ্রহণ করা হয়। আপনার আবেদনটি আমাদের রিভিউ টিম যাচাই করবে। আপনি কাজ শুরু না করে থাকলে এবং যুক্তিসঙ্গত কারণ দেখালে রিফান্ড বিবেচনা করা হবে।
            </p>
          </div>

          {/* ================= SECTION 1: আপনার তথ্য ================= */}
          <div className="bg-slate-50/70 p-5 sm:p-6 rounded-2xl border border-slate-200/90">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-200">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">
                আপনার তথ্য
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  পূর্ণ নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  id="form-full-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  হোয়াটসঅ্যাপ নম্বর <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    id="form-whatsapp"
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ইমেইল <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    id="form-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  স্টুডেন্ট আইডি <span className="text-rose-500">*</span>
                </label>
                <input
                  id="form-student-id"
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ''))}
                  maxLength={7}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  জরুরী যোগাযোগের নম্বর (বিকল্প) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    id="form-emergency"
                    type="tel"
                    required
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="পিতা/মাতা বা অভিভাবকের নম্বর"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ================= SECTION 2: আপনার কাজের তথ্য ================= */}
          <div className="bg-slate-50/70 p-5 sm:p-6 rounded-2xl border border-slate-200/90">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-200">
              <Briefcase className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">
                আপনার কাজের তথ্য
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  আপনি কবে আমাদের প্ল্যাটফর্মে যোগ দিয়েছেন? <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    id="form-joining-date"
                    type="date"
                    required
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  আপনি কতদিন কাজ করেছেন? <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    id="form-duration-worked"
                    type="text"
                    required
                    value={durationWorked}
                    onChange={(e) => setDurationWorked(e.target.value)}
                    placeholder="যেমন: ১ মাস ১৫ দিন"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  আপনি কি কোনো কাজ সম্পন্ন করেছেন? <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="hasWorked" 
                      value="yes" 
                      checked={hasWorked === 'yes'} 
                      onChange={(e) => setHasWorked(e.target.value)} 
                      className="text-emerald-600 focus:ring-emerald-500" 
                    />
                    <span>হ্যাঁ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="hasWorked" 
                      value="no" 
                      checked={hasWorked === 'no'} 
                      onChange={(e) => setHasWorked(e.target.value)} 
                      className="text-rose-600 focus:ring-rose-500" 
                    />
                    <span>না</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  আপনার টিম লিডারের নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  id="form-tl-name"
                  type="text"
                  required
                  value={teamLeaderName}
                  onChange={(e) => setTeamLeaderName(e.target.value)}
                  placeholder="টিম লিডারের নাম"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  টিম লিডারের হোয়াটসঅ্যাপ নম্বর <span className="text-rose-500">*</span>
                </label>
                <input
                  id="form-tl-whatsapp"
                  type="tel"
                  required
                  value={teamLeaderWhatsapp}
                  onChange={(e) => setTeamLeaderWhatsapp(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  আপনার টিম ট্রেনারের নাম
                </label>
                <input
                  id="form-trainer-name"
                  type="text"
                  value={teamTrainerName}
                  onChange={(e) => setTeamTrainerName(e.target.value)}
                  placeholder="ট্রেনারের নাম"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  টিম ট্রেনারের হোয়াটসঅ্যাপ নম্বর
                </label>
                <input
                  id="form-trainer-whatsapp"
                  type="tel"
                  value={teamTrainerWhatsapp}
                  onChange={(e) => setTeamTrainerWhatsapp(e.target.value)}
                  placeholder="018xxxxxxxx"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* ================= SECTION 3: ভর্তির পেমেন্ট ও প্রুফ স্ক্রিনশট ================= */}
          <div className="bg-slate-50/70 p-5 sm:p-6 rounded-2xl border border-slate-200/90 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
              <Receipt className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  ভর্তির পেমেন্ট ও প্রুফ তথ্য
                </h2>
                <p className="text-xs text-slate-500">
                  ভর্তির সময় যে মাধ্যমে টাকা দিয়েছেন তার বিবরণ, ট্রানজেকশন আইডি এবং পেমেন্টের স্ক্রিনশট প্রদান করুন
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ভর্তির সময় পরিশোধিত অর্থ (টাকা ৳) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="form-paid-amount"
                  type="number"
                  required
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  placeholder="3500"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-semibold"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  যে মাধ্যমে পেমেন্ট করেছেন <span className="text-rose-500">*</span>
                </label>
                <select
                  id="form-paid-method"
                  value={paidMethod}
                  onChange={(e) => setPaidMethod(e.target.value as RefundMethod)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="bkash">বিকাশ (bKash)</option>
                  <option value="nagad">নগদ (Nagad)</option>
                  <option value="rocket">রকেট (Rocket)</option>
                  <option value="upay">উপায় (Upay)</option>
                  <option value="mcash">এমক্যাশ (mCash)</option>
                  <option value="binance">Binance</option>
                  <option value="bank">ব্যাংক (Bank)</option>
                </select>
              </div>

              {/* Transaction ID Input */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span>পেমেন্টের ট্রানজেকশন আইডি (Transaction ID / TrxID)</span>
                    <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-500">বিকাশ/নগদ/রকেট বা ব্যাংকের TrxID</span>
                </label>
                <div className="relative">
                  <Receipt className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    id="form-payment-trx-id"
                    type="text"
                    required
                    value={paymentTransactionId}
                    onChange={(e) => setPaymentTransactionId(e.target.value)}
                    placeholder="যেমন: 8N29XKL90 অথবা TrxID নম্বর"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-mono uppercase tracking-wider"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  ভর্তি ফি পাঠানোর পর যে TrxID পেয়েছেন তা এখানে নির্ভুলভাবে লিখুন।
                </p>
              </div>

              {/* Payment Screenshot File Upload */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span>পেমেন্টের স্ক্রিনশট বা রসিদের ছবি (Payment Screenshot)</span>
                    <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-500">JPG, PNG বা স্পষ্ট ছবি</span>
                </label>

                {!paymentProofFile ? (
                  <label 
                    htmlFor="form-payment-proof-file"
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-700">
                      পেমেন্টের স্ক্রিনশট আপলোড করতে এখানে ক্লিক করুন
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      টাকা পাঠানোর কনফার্মেশন মেসেজ বা স্টেটমেন্টের ছবি সিলেক্ট করুন
                    </span>
                    <input
                      id="form-payment-proof-file"
                      type="file"
                      accept="image/*"
                      required
                      onChange={handlePaymentProofFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {paymentProofPreviewUrl ? (
                          <img
                            src={paymentProofPreviewUrl}
                            alt="Payment Proof Preview"
                            className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-2xs"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>পেমেন্টের স্ক্রিনশট সংযুক্ত করা হয়েছে</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-xs">
                            {paymentProofFile.name} ({(paymentProofFile.size / 1024).toFixed(1)} KB)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {paymentProofPreviewUrl && (
                          <button
                            type="button"
                            onClick={() => window.open(paymentProofPreviewUrl, '_blank')}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>বড় করে দেখুন</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleRemovePaymentProofFile}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>মুছে ফেলুন</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  স্টুডেন্ট আইডি ব্যালেন্স (টাকা ৳)
                </label>
                <input
                  id="form-student-id-balance"
                  type="number"
                  value={studentIdBalance}
                  onChange={(e) => setStudentIdBalance(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  রিফান্ডের দাবি করা পরিমাণ (টাকা ৳) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="form-amount"
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="3500"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-semibold"
                />
              </div>
            </div>
          </div>

          {/* ================= SECTION 3: রিফান্ডের লিখিত কারণ ও হাতে লেখা দরখাস্ত ================= */}
          <div className="bg-slate-50/70 p-5 sm:p-6 rounded-2xl border border-slate-200/90">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-200">
              <FileText className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  রিফান্ডের লিখিত কারণ ও হাতে লেখা দরখাস্ত
                </h2>
                <p className="text-xs text-slate-500">
                  সাদা কাগজে নিজের হাতে লেখা দরখাস্ত সংযুক্ত করুন এবং কেন রিফান্ড চাচ্ছেন তা বিস্তারিত ব্যাখ্যা করুন
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {/* দরখাস্ত লেখার নিয়মাবলী গাইড বক্স */}
              <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-xl p-4 text-xs text-emerald-950 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>দরখাস্ত (Application Letter) লেখার নিয়মাবলী:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-emerald-900/90 pl-1 leading-relaxed">
                  <li>সাদা কাগজের ওপর স্পষ্ট ও সুন্দর হস্তাক্ষরে রিফান্ডের একটি পূর্ণাঙ্গ দরখাস্ত লিখুন।</li>
                  <li>দরখাস্তে আপনার নাম, স্টুডেন্ট আইডি, কোর্সের বিবরণ এবং রিফান্ড চাওয়ার কারণসমূহ বিস্তারিত উল্লেখ করুন।</li>
                  <li>নিচে আপনার স্বাক্ষর ও ফোন নম্বর দিয়ে দরখাস্তটির স্পষ্ট ছবি তুলে নিচে অ্যাটাচ (Attach) করুন।</li>
                </ul>
              </div>

              {/* হাতে লেখা দরখাস্তের ছবি আপলোড সেকশন */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span>হাতে লেখা দরখাস্তের ছবি (Handwritten Application)</span>
                    <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-500">JPG, PNG বা স্পষ্ট ছবি</span>
                </label>

                {!handwrittenApplicationFile ? (
                  <label 
                    htmlFor="form-handwritten-app"
                    className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-700">
                      হাতে লেখা দরখাস্তের ছবি আপলোড করতে এখানে ক্লিক করুন
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1">
                      মোবাইল দিয়ে তোলা স্পষ্ট ছবি বা স্ক্যান কপি সিলেক্ট করুন
                    </span>
                    <input
                      id="form-handwritten-app"
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleHandwrittenFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {handwrittenPreviewUrl ? (
                          <img
                            src={handwrittenPreviewUrl}
                            alt="Application Preview"
                            className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-2xs"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                            <FileText className="w-8 h-8" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>দরখাস্তের ছবি সংযুক্ত করা হয়েছে</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-xs">
                            {handwrittenApplicationFile.name} ({(handwrittenApplicationFile.size / 1024).toFixed(1)} KB)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {handwrittenPreviewUrl && (
                          <button
                            type="button"
                            onClick={() => window.open(handwrittenPreviewUrl, '_blank')}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>বড় করে দেখুন</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleRemoveHandwrittenFile}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>মুছে ফেলুন</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* রিফান্ডের প্রাথমিক বিষয় */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  রিফান্ডের প্রাথমিক বিষয় বা ধরন
                </label>
                <select
                  id="form-reason-category"
                  value={reasonCategory}
                  onChange={(e) => setReasonCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="ব্যক্তিগত ও বাস্তব পরিস্থিতি">ব্যক্তিগত ও বাস্তব পরিস্থিতি</option>
                  <option value="ব্যক্তিগত ও শারীরিক অসুস্থতা">ব্যক্তিগত ও শারীরিক অসুস্থতা</option>
                  <option value="পারিবারিক আর্থিক সমস্যা">পারিবারিক আর্থিক সমস্যা</option>
                  <option value="ডিভাইস ও টেকনিক্যাল সমস্যা (ল্যাপটপ/পিসি নষ্ট)">ডিভাইস ও টেকনিক্যাল সমস্যা (ল্যাপটপ/পিসি নষ্ট)</option>
                  <option value="পরীক্ষা বা প্রাতিষ্ঠানিক পড়াশোনার চাপ">পরীক্ষা বা প্রাতিষ্ঠানিক পড়াশোনার চাপ</option>
                  <option value="অন্যান্য বিশেষ কারণ">অন্যান্য বিশেষ কারণ</option>
                </select>
              </div>

              {/* রিফান্ড চাওয়ার বিস্তারিত বিবরণ (কোনো ৫টি কারণ নয়, বিস্তারিত বিবরণ) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  কেন রিফান্ড চাচ্ছেন তার বিস্তারিত কারণ ও বিবরণ <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="form-reason-detail"
                  required
                  rows={6}
                  value={reasonDetail}
                  onChange={(e) => setReasonDetail(e.target.value)}
                  placeholder="এখানে আপনার রিফান্ড চাওয়ার মূল কারণ, বিস্তারিত পরিস্থিতি ও বাস্তবতা বিশদভাবে বর্ণনা করুন... কেন আপনি কাজ বা ক্লাস চালিয়ে যেতে পারছেন না তা খুলে বলুন।"
                  className="w-full px-3.5 py-3 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white leading-relaxed"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  আপনার সম্পূর্ণ বিষয়টি বিশদভাবে লিখুন যাতে অ্যাডমিন ও রিভিউ টিম আপনার পরিস্থিতি সঠিকভাবে বিবেচনা করতে পারে।
                </p>
              </div>
            </div>
          </div>

          {/* ================= SECTION 4: রিফান্ড পাওয়ার তথ্য ================= */}
          <div className="bg-slate-50/70 p-5 sm:p-6 rounded-2xl border border-slate-200/90">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-200">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">
                রিফান্ড পাওয়ার তথ্য
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  কোন মাধ্যমে রিফান্ড নিতে চান? <span className="text-rose-500">*</span>
                </label>
                
                {/* Method Selector Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  {[
                    { id: 'bkash', label: 'বিকাশ', color: 'border-pink-500 text-pink-700' },
                    { id: 'nagad', label: 'নগদ', color: 'border-orange-500 text-orange-700' },
                    { id: 'rocket', label: 'রকেট', color: 'border-purple-500 text-purple-700' },
                    { id: 'upay', label: 'উপায়', color: 'border-blue-500 text-blue-700' },
                    { id: 'mcash', label: 'এমক্যাশ', color: 'border-teal-500 text-teal-700' },
                    { id: 'binance', label: 'Binance', color: 'border-amber-500 text-amber-700' },
                    { id: 'bank', label: 'ব্যাংক', color: 'border-slate-700 text-slate-900' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPayoutMethod(m.id as RefundMethod)}
                      className={`py-2.5 px-3 text-xs sm:text-sm font-bold rounded-xl border transition-all text-center ${
                        payoutMethod === m.id
                          ? `bg-white shadow-md border-2 ${m.color} ring-2 ring-emerald-500/20`
                          : 'bg-white/80 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic inputs based on method */}
              {payoutMethod !== 'bank' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {payoutMethod === 'binance' 
                      ? 'Binance Pay ID / USDT TRC20 Wallet Address' 
                      : 'রিফান্ড নেওয়ার নম্বর / অ্যাকাউন্ট'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="form-payout-account"
                    type="text"
                    required
                    value={payoutAccount}
                    onChange={(e) => setPayoutAccount(e.target.value)}
                    placeholder={payoutMethod === 'binance' ? 'Binance Pay ID or USDT Address' : '017xxxxxxxx'}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {payoutMethod === 'binance' ? 'সঠিক Pay ID নিশ্চিত করুন।' : 'অনুগ্রহ করে সচল পার্সোনাল ওয়ালেট নম্বর দিন।'}
                  </span>
                </div>
              ) : (
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 pb-2 border-b border-slate-100">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>ব্যাংক অ্যাকাউন্টের বিস্তারিত তথ্য</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        অ্যাকাউন্ট হোল্ডারের নাম <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="form-bank-holder"
                        type="text"
                        required
                        value={bankDetails.accountHolderName}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                        placeholder="যেমন: MD TANVIR AHMED"
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        ব্যাংকের নাম <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="form-bank-name"
                        type="text"
                        required
                        value={bankDetails.bankName}
                        onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                        placeholder="যেমন: Islami Bank / DBBL / City Bank"
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        অ্যাকাউন্ট নম্বর <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="form-bank-acc-no"
                        type="text"
                        required
                        value={bankDetails.accountNumber}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                        placeholder="2050xxxxxxxxxxx"
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        শাখার নাম (Branch Name)
                      </label>
                      <input
                        id="form-bank-branch"
                        type="text"
                        value={bankDetails.branchName}
                        onChange={(e) => setBankDetails({ ...bankDetails, branchName: e.target.value })}
                        placeholder="যেমন: মিরপুর শাখা"
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        রাউটিং নম্বর (Routing Number - অপশনাল)
                      </label>
                      <input
                        id="form-bank-routing"
                        type="text"
                        value={bankDetails.routingNumber}
                        onChange={(e) => setBankDetails({ ...bankDetails, routingNumber: e.target.value })}
                        placeholder="যেমন: 125272641"
                        className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= CONFIRMATION CHECKBOX ================= */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                id="form-confirm-checkbox"
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-semibold text-amber-950 leading-relaxed">
                আমি নিশ্চিত করছি যে, আমি যে তথ্যগুলো প্রদান করেছি সেগুলো সঠিক এবং রিফান্ড রিকোয়েস্ট পাঠালেই রিফান্ড নিশ্চিত হবে না।
              </span>
            </label>
          </div>

          {/* Submit Button */}
          {formError && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-center gap-3 mb-4"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <span>{formError}</span>
            </motion.div>
          )}
          <div className="pt-2 flex justify-end">
            <button
              id="form-submit-request-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-10 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-base shadow-lg shadow-emerald-600/25 transition-all transform active:scale-98 cursor-pointer"
            >
              <Send className="w-5 h-5" />
              <span>{isSubmitting ? 'প্রসেসিং হচ্ছে...' : 'রিফান্ড রিকোয়েস্ট পাঠান'}</span>
            </button>
          </div>
        </form>
      </div>
      
      {/* ================= SUPPORT EMAIL ================= */}
      <div className="text-center pb-8">
        <p className="text-xs font-semibold text-slate-500">
          যেকোনো প্রয়োজনে আমাদের ইমেইল করুন: <a href="mailto:unityearning13@gmail.com" className="text-emerald-600 hover:underline">unityearning13@gmail.com</a>
        </p>
      </div>
    </div>
  );
};
