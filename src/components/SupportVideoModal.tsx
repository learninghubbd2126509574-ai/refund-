import React from 'react';
import { X, ExternalLink, Play, Youtube, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SupportVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  videoTitle?: string;
}

export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  } catch {
    return null;
  }
}

export const SupportVideoModal: React.FC<SupportVideoModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  videoTitle = 'ইউনিটি আর্নিং সাপোর্ট ও রিফান্ড গাইডলাইন ভিডিও',
}) => {
  if (!isOpen) return null;

  const videoId = getYouTubeVideoId(videoUrl);
  const embedUrl = videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0` : null;

  const handleOpenDirect = () => {
    const targetUrl = videoUrl || 'https://www.youtube.com';
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] text-left"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/90 text-white flex items-center justify-center shadow-md shrink-0">
                <Youtube className="w-6 h-6" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  অফিসিয়াল ইউটিউব গাইডলাইন
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white line-clamp-1">
                  {videoTitle}
                </h3>
              </div>
            </div>

            <button
              id="support-video-modal-close-btn"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Video Player Area */}
          <div className="bg-black relative aspect-video w-full flex items-center justify-center overflow-hidden">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={videoTitle}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="p-8 text-center text-white space-y-3">
                <div className="w-16 h-16 rounded-full bg-red-600/20 text-red-500 flex items-center justify-center mx-auto">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <div>
                  <h4 className="font-bold text-base">ইউটিউব ভিডিও সরাসরি ওপেন করুন</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                    নিচের বাটনে ক্লিক করে সরাসরি অফিসিয়াল ভিডিও টিউটোরিয়ালটি দেখে নিন।
                  </p>
                </div>
                <button
                  onClick={handleOpenDirect}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
                >
                  <Youtube className="w-4 h-4" />
                  <span>ভিডিওটি ইউটিউবে দেখুন</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Bottom Actions & Helper Text */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>যেকোনো সমস্যায় ভিডিওটি দেখলে সহজেই সমাধান পেয়ে যাবেন।</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                id="support-video-direct-btn"
                onClick={handleOpenDirect}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer"
              >
                <Youtube className="w-4 h-4" />
                <span>সরাসরি YouTube এ ওপেন করুন</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
