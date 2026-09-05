import React, { useState } from 'react';
import { RefundRequest } from '../types';
import { CheckCircle2, Copy, Check, Clock, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { motion } from 'motion/react';

interface SubmissionSuccessModalProps {
  isOpen: boolean;
  request: RefundRequest | null;
  onViewStatus: () => void;
}

export const SubmissionSuccessModal: React.FC<SubmissionSuccessModalProps> = ({
  isOpen,
  request,
  onViewStatus,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !request) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(request.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 text-center"
      >
        {/* Success Icon */}
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        {/* Title */}
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2 leading-snug">
          রিফান্ড রিকোয়েস্ট সফলভাবে পাঠানো হয়েছে!
        </h2>

        {/* Highlighted Token ID Box */}
        <div className="my-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <KeyRound className="w-4 h-4 text-emerald-700" />
              <span>আপনার রিফান্ড টোকেন আইডি (Token ID)</span>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              সংরক্ষণ করুন
            </span>
          </div>

          <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-300">
            <span className="text-base sm:text-lg font-black font-mono text-emerald-800 tracking-wider">
              {request.id}
            </span>
            <button
              onClick={handleCopyId}
              type="button"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>কপি করুন</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-emerald-950 font-medium leading-relaxed">
            এই টোকেন আইডি ব্যবহার করে যেকোনো ডিভাইস থেকে হোমপেজের সার্চ বক্সে সরাসরি লাইভ রিফান্ড অগ্রগতি ও আপডেট দেখতে পাবেন।
          </p>
        </div>

        {/* Message */}
        <div className="text-xs text-slate-600 space-y-2 leading-relaxed text-left mb-5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
          <p className="font-semibold text-slate-800">
            বর্তমান অবস্থান: <span className="text-emerald-700">ধাপ ১ - আবেদনপত্র সফলভাবে জমা ও পর্যালোচনার অপেক্ষায়</span>
          </p>
          <p className="text-slate-600">
            সর্বমোট ৯টি ধাপে পর্যালোচনা সম্পন্ন হতে আনুমানিক ২০-২৪ দিন সময় লাগতে পারে। কর্তৃপক্ষ দ্রুত যাচাই করে সিদ্ধান্ত প্রদান করবে।
          </p>
        </div>

        {/* Action Button */}
        <button
          id="success-view-status-btn"
          onClick={onViewStatus}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all transform active:scale-98 cursor-pointer"
        >
          <span>লাইভ টাইমলাইন ও স্ট্যাটাস ট্র্যাক করুন</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
