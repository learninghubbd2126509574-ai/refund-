import React from 'react';
import { ShieldAlert, ArrowRight, FileCheck } from 'lucide-react';

interface RefundPolicyCardProps {
  onProceed: () => void;
  compact?: boolean;
  hasExistingRequest?: boolean;
  existingRequestId?: string;
}

export const RefundPolicyCard: React.FC<RefundPolicyCardProps> = ({
  onProceed,
  compact = false,
  hasExistingRequest = false,
  existingRequestId,
}) => {
  return (
    <div className="bg-gradient-to-br from-amber-50/90 via-amber-50/50 to-orange-50/40 rounded-2xl border border-amber-200/90 p-6 sm:p-8 shadow-md shadow-amber-900/5 relative overflow-hidden text-left">
      {/* Decorative corner icon */}
      <div className="absolute top-4 right-4 text-amber-200/60 pointer-events-none">
        <ShieldAlert className="w-24 h-24" />
      </div>

      <div className="relative z-10 max-w-3xl">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-amber-950">
            রিফান্ড পলিসি
          </h2>
        </div>

        <div className="space-y-3 text-sm sm:text-base text-amber-950/90 leading-relaxed font-normal">
          <p className="font-medium bg-amber-100/60 p-3 rounded-xl border border-amber-200/60">
            আমাদের কোর্স বা অ্যাডমিশন ফি প্রদান করার পর সাধারণভাবে কোনো রিফান্ড পলিসি প্রযোজ্য নয়।
          </p>

          <p>
            তবে কোনো বিশেষ কারণে আপনি যদি রিফান্ড রিকোয়েস্ট করতে চান, তাহলে আপনি রিফান্ডের জন্য আবেদন করতে পারেন। আপনার রিকোয়েস্ট কোম্পানি কর্তৃপক্ষের নির্ধারিত রিভিউ প্রক্রিয়ার মাধ্যমে যাচাই করা হবে।
          </p>

          <p className="text-amber-900/80 text-xs sm:text-sm">
            রিফান্ড রিকোয়েস্ট পাঠালেই রিফান্ড নিশ্চিত হবে না। আপনার দেওয়া তথ্য, কারণ এবং সংশ্লিষ্ট বিষয়গুলো পর্যালোচনা করার পর কর্তৃপক্ষ সিদ্ধান্ত গ্রহণ করবে।
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
            <FileCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>সর্বোচ্চ প্রায় ২০ থেকে ২৪ দিন পর্যন্ত রিভিউ সময় লাগতে পারে</span>
          </div>

          <button
            id="policy-accept-and-proceed-btn"
            onClick={onProceed}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all transform active:scale-98 cursor-pointer ${
              hasExistingRequest 
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white' 
                : 'bg-amber-950 hover:bg-amber-900 text-amber-50'
            }`}
          >
            <span>
              {hasExistingRequest 
                ? `আমার আবেদনের স্ট্যাটাস দেখুন (${existingRequestId || ''})` 
                : 'আমি বুঝেছি, রিফান্ড রিকোয়েস্ট করতে চাই'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
