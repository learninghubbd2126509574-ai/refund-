import React, { useState } from 'react';
import { RefundRequest } from '../types';
import { 
  UserPlus, 
  LogIn, 
  Search, 
  ShieldCheck, 
  ArrowRight, 
  KeyRound, 
  Info, 
  AlertCircle,
  Youtube,
  Play
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register' | 'admin') => void;
  onTrackRequest: (requestId: string) => void;
  onOpenSupportVideo?: () => void;
  allRequests: RefundRequest[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onTrackRequest,
  onOpenSupportVideo,
  allRequests,
}) => {
  const { isBn } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchError(
        isBn 
          ? 'অনুগ্রহ করে আপনার রিফান্ড টোকেন আইডি (Token ID) অথবা হোয়াটসঅ্যাপ নম্বর লিখুন' 
          : 'Please enter your refund Token ID or WhatsApp phone number'
      );
      return;
    }

    const match = allRequests.find(
      (r) => 
        r.id.toLowerCase() === trimmed.toLowerCase() || 
        r.whatsapp === trimmed ||
        r.studentId.toLowerCase() === trimmed.toLowerCase()
    );

    if (match) {
      onTrackRequest(match.id);
    } else {
      setSearchError(
        isBn
          ? 'এই টোকেন আইডি বা নম্বরে কোনো রিফান্ড রিকোয়েস্ট পাওয়া যায়নি। সঠিক টোকেন আইডি প্রদান করুন অথবা অ্যাকাউন্টে লগইন করে আবেদন করুন।'
          : 'No refund request found with this Token ID or number. Please verify your reference or sign in to submit an application.'
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between text-left">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-10 sm:pt-10 sm:pb-14 md:pt-14 md:pb-16 flex-1 flex flex-col justify-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-gradient-to-b from-emerald-50/70 via-teal-50/20 to-transparent -z-10 blur-3xl pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Official Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/90 text-xs sm:text-[13px] font-bold mb-4 shadow-2xs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {isBn 
                ? 'Unity Earning • অফিশিয়াল স্টুডেন্ট কেয়ার পোর্টাল' 
                : 'Unity Earning • Official Student Care Portal'}
            </span>
          </motion.div>

          {/* Main Title & Subtitle */}
          <motion.h1 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-slate-900 tracking-tight leading-[1.3] mb-3"
          >
            {isBn ? 'রিফান্ড রিকোয়েস্ট পোর্টাল' : 'Refund Request Portal'}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="text-xs sm:text-sm md:text-base text-slate-600 max-w-xl mx-auto mb-5 leading-relaxed"
          >
            {isBn 
              ? 'রিফান্ডের জন্য আবেদন করতে প্রথমে আপনার অ্যাকাউন্টে রেজিস্ট্রেশন অথবা লগইন করুন।' 
              : 'To apply for a refund, please first register or sign in to your student account.'}
          </motion.p>

          {/* Mandatory Info Banner */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.18 }}
            className="max-w-lg mx-auto mb-6 p-3.5 sm:p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 flex items-start gap-3 text-left shadow-2xs"
          >
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-[13px] font-medium leading-relaxed">
              <span className="font-bold text-amber-950 block mb-0.5">
                {isBn ? 'জরুরি নির্দেশনা:' : 'Mandatory Guidelines:'}
              </span>
              {isBn 
                ? 'রিফান্ড রিকোয়েস্ট পাঠানোর পূর্বে অবশ্যই আপনার অ্যাকাউন্টে রেজিস্ট্রেশন সম্পন্ন করতে হবে। আবেদন জমা দেওয়ার পর একটি ইউনিক টোকেন আইডি প্রদান করা হবে।'
                : 'You must register your student account before submitting a refund request. A unique Token ID will be generated upon submission.'}
            </div>
          </motion.div>

          {/* Primary Action Buttons: Registration & Login & Support Video */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="flex flex-col gap-2.5 max-w-md mx-auto mb-6 w-full"
          >
            {/* Top Row: Registration & Login */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
              <button
                id="landing-register-btn"
                onClick={() => onOpenAuth('register')}
                className="w-full h-11 sm:h-12 inline-flex items-center justify-center gap-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-[0.98] cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isBn ? 'রেজিস্ট্রেশন করুন' : 'Register Account'}</span>
              </button>

              <button
                id="landing-login-btn"
                onClick={() => onOpenAuth('login')}
                className="w-full h-11 sm:h-12 inline-flex items-center justify-center gap-2 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm border border-slate-200/90 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-emerald-600" />
                <span>{isBn ? 'লগইন করুন' : 'Sign In'}</span>
              </button>
            </div>

            {/* Below Row: Official Video Guide Button */}
            {onOpenSupportVideo && (
              <button
                id="landing-support-video-btn"
                onClick={onOpenSupportVideo}
                className="w-full h-11 sm:h-12 inline-flex items-center justify-center gap-2 px-4 rounded-xl bg-rose-50 hover:bg-rose-100/80 text-rose-700 font-bold text-xs sm:text-sm border border-rose-200/80 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
                title={isBn ? "ভিডিও গাইডলাইন দেখুন" : "Watch Video Guidelines"}
              >
                <Youtube className="w-4 h-4 text-rose-600" />
                <span>{isBn ? 'ভিডিও গাইড' : 'Video Guide'}</span>
              </button>
            )}
          </motion.div>

          {/* Live Token ID Search Box */}
          <motion.div 
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-lg mx-auto bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                  {isBn ? 'টোকেন আইডি দিয়ে রিফান্ড স্ট্যাটাস ট্র্যাক করুন' : 'Track Refund Status via Token ID'}
                </h2>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/90">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {isBn ? 'লাইভ ট্র্যাকার' : 'Live Tracker'}
              </span>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mt-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                <input
                  id="landing-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isBn ? "যেমন: UE-REF-89241 অথবা 01712345678" : "e.g., UE-REF-89241 or 01712345678"}
                  className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm rounded-xl border border-slate-200/90 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 font-mono bg-slate-50/60 focus:bg-white transition-all"
                />
              </div>
              <button
                id="landing-search-submit-btn"
                type="submit"
                className="h-11 inline-flex items-center justify-center gap-1.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all shadow-xs active:scale-[0.98] cursor-pointer shrink-0"
              >
                <span>{isBn ? 'সার্চ করুন' : 'Track Status'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {searchError && (
              <p className="text-xs text-rose-600 font-medium mt-2.5 flex items-start gap-1.5 leading-relaxed bg-rose-50 p-2.5 rounded-xl border border-rose-200/90">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{searchError}</span>
              </p>
            )}

            <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5 leading-tight">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                {isBn 
                  ? 'যেকোনো ডিভাইস থেকে টোকেন আইডি দিয়ে সার্চ করে সরাসরি রিফান্ডের লাইভ অগ্রগতি দেখতে পারবেন।'
                  : 'Enter your Token ID from any device to instantly inspect the live audit and clearance progress.'}
              </span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p className="font-semibold text-slate-800 mb-0.5">
            {isBn 
              ? '© 2026 Unity Earning E-learning Platform. সর্বস্বত্ব সংরক্ষিত।' 
              : '© 2026 Unity Earning E-learning Platform. All rights reserved.'}
          </p>
          <p className="text-slate-400 text-[11px]">
            {isBn 
              ? 'অফিশিয়াল হেল্পডেস্ক ও স্টুডেন্ট কেয়ার পোর্টাল | ঢাকা, বাংলাদেশ' 
              : 'Official Helpdesk & Student Care Portal | Dhaka, Bangladesh'}
          </p>
        </div>
      </footer>
    </div>
  );
};
