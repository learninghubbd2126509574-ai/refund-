import React from 'react';
import { ShieldAlert, X, CheckCircle2, ArrowRight, Send, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface RefundPolicyNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  telegramUrl?: string;
}

export const RefundPolicyNoticeModal: React.FC<RefundPolicyNoticeModalProps> = ({
  isOpen,
  onClose,
  telegramUrl = 'https://t.me/unityearning12'
}) => {
  const { isBn } = useLanguage();

  if (!isOpen) return null;

  return (
    <div 
      id="refund-policy-notice-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-fadeIn text-left font-sans"
      onClick={onClose}
    >
      <div 
        id="refund-policy-notice-container"
        className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full p-5 sm:p-6 relative overflow-hidden transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500" />

        {/* Header with Title and Cross (X) Close Button */}
        <div className="flex items-start justify-between gap-3 pt-1 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0 shadow-2xs">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                {isBn ? 'অফিসিয়াল নোটিশ • Unity Earning' : 'Official Notice • Unity Earning'}
              </span>
              <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                {isBn ? 'রিফান্ড পলিসি সম্পর্কিত সতর্কতা' : 'Refund Policy Notice'}
              </h2>
            </div>
          </div>

          {/* Cross Close Button */}
          <button
            id="close-notice-cross-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 flex items-center justify-center transition-all cursor-pointer shrink-0 group active:scale-95"
            title={isBn ? "নোটিশ বন্ধ করুন (ক্রস)" : "Close notice"}
            aria-label="Close Notice"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Core Message Box */}
        <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
          
          <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 font-medium space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>{isBn ? 'জরুরি অবগতি:' : 'Important Notice:'}</span>
            </div>
            <p className="text-xs sm:text-[13px] text-amber-900/95 leading-relaxed">
              {isBn 
                ? 'আমাদের প্ল্যাটফর্মে সাধারণ কোনো রিফান্ড পলিসি বা রিফান্ড সিস্টেম নেই।' 
                : 'Our platform does not operate an unconditional refund policy or automated refund system.'}
            </p>
          </div>

          <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed">
            {isBn 
              ? 'তবে ইউনিটি আর্নিং শিক্ষার্থীদের বাস্তব ও যৌক্তিক সমস্যা বিবেচনায় বিশেষ শর্তে রিফান্ড পলিসি কার্যকর করে থাকে। আপনার যদি সুনির্দিষ্ট ও প্রমাণিত কোনো সমস্যা থাকে, তবে কর্তৃপক্ষের নির্দেশনা মেনে সঠিকভাবে রিফান্ড রিকোয়েস্ট পাঠান।'
              : 'However, Unity Earning considers exceptional refund requests under strict review for verified and legitimate circumstances. If you have a valid, documented hardship, please submit your refund request strictly following institutional guidelines.'}
          </p>

          {/* Structured Key Rules */}
          <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-start gap-2 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{isBn ? 'সাধারণ কারণে আবেদন গ্রহণযোগ্য নয়, কেবল যাচাইকৃত যৌক্তিক সমস্যা বিবেচ্য।' : 'Arbitrary requests are not admissible; only verified legitimate hardship is considered.'}</span>
            </div>
            <div className="flex items-start gap-2 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{isBn ? 'সঠিক শিক্ষার্থী আইডি, ব্যাচ ও প্রমাণপত্র ছাড়া রিফান্ড প্রসেস সম্ভব নয়।' : 'Accurate Student ID, batch verification, and proof documents are mandatory.'}</span>
            </div>
            <div className="flex items-start gap-2 text-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{isBn ? 'সকল তথ্য সঠিকভাবে নিশ্চিত করে আবেদন ফর্ম জমা দিন।' : 'Verify all payout account credentials and details prior to submission.'}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-slate-500 hover:text-[#0088cc] flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-[#0088cc]" />
            <span>{isBn ? 'সরাসরি হেল্পলাইন টেলিগ্রাম' : 'Official Telegram Helpline'}</span>
          </a>

          <button
            id="accept-notice-and-enter-btn"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
          >
            <span>{isBn ? 'বুঝেছি, প্রবেশ করুন' : 'Understood, Proceed'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
