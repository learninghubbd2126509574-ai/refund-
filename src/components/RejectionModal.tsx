import React from 'react';
import { RefundRequest } from '../types';
import { XCircle, ArrowLeft, AlertOctagon, HelpCircle, FileText, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface RejectionModalProps {
  isOpen: boolean;
  request: RefundRequest | null;
  onClose: () => void;
}

export const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  request,
  onClose,
}) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-200 overflow-hidden text-left"
      >
        {/* Red Header Bar */}
        <div className="bg-rose-600 px-6 py-5 text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <XCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              রিফান্ড রিকোয়েস্ট প্রত্যাখ্যান করা হয়েছে
            </h2>
            <span className="text-xs text-rose-100 font-mono">
              রিকোয়েস্ট আইডি: {request.id}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-7 space-y-5">
          {/* Main Rejection Message */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-950 text-xs sm:text-sm leading-relaxed">
            <p className="font-semibold mb-1">
              আপনার রিফান্ড রিকোয়েস্টটি পর্যালোচনা করা হয়েছে।
            </p>
            <p className="text-slate-700">
              প্রদত্ত তথ্য ও কারণের ভিত্তিতে আপনার রিকোয়েস্টটি রিফান্ডের জন্য যোগ্য হিসেবে বিবেচিত হয়নি।
            </p>
          </div>

          {/* Details Table */}
          <div className="space-y-3 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 text-xs sm:text-sm">
            
            {/* Rejection Reason */}
            <div>
              <span className="text-slate-500 font-medium block text-xs mb-1">
                প্রত্যাখ্যানের কারণ:
              </span>
              <div className="p-3 bg-white rounded-xl border border-rose-200 text-rose-900 font-medium leading-relaxed">
                {request.rejectionReason || 'পলিসির নির্ধারিত শর্তাবলী পূরণ না করায় আবেদনটি মঞ্জুর করা সম্ভব হয়নি।'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <span className="text-slate-500 font-medium block text-xs">
                  পর্যালোচনাকারী:
                </span>
                <span className="font-bold text-slate-800">
                  {request.rejectedBy || 'সৈয়দ আকরামুল হক'}
                </span>
                <span className="text-[11px] text-slate-500 block">
                  ({request.rejectedRoleBn || 'রিফান্ড পলিসি টিম হেড'})
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-medium block text-xs">
                  পর্যালোচনার তারিখ:
                </span>
                <span className="font-bold text-slate-800">
                  {request.rejectedDate || request.lastUpdatedDate}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80">
              <span className="text-slate-500 font-medium block text-xs">
                রিফান্ড রিকোয়েস্ট আইডি:
              </span>
              <span className="font-mono font-bold text-slate-900">
                {request.id}
              </span>
            </div>
          </div>

          {/* Support Note */}
          <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span>
              কোনো তথ্য বা পুনর্বিবেচনার ব্যাপারে বিস্তারিত জানতে আমাদের অফিশিয়াল স্টুডেন্ট হেল্পডেস্কে যোগাযোগ করতে পারেন।
            </span>
          </div>

          {/* Action Button */}
          <button
            id="rejection-back-to-dashboard-btn"
            onClick={onClose}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ড্যাশবোর্ডে ফিরে যান</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
