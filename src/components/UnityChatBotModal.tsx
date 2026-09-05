import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot, Sparkles, Mail, MessageSquare, RefreshCw, ChevronRight } from 'lucide-react';

interface UnityChatBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  supportEmail?: string;
  telegramUrl?: string;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  quickActions?: { label: string; action: () => void }[];
}

export const UnityChatBotModal: React.FC<UnityChatBotModalProps> = ({
  isOpen,
  onClose,
  supportEmail = 'unityearning13@gmail.com',
  telegramUrl = 'https://t.me/unityearning12',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'আসসালামু আলাইকুম! আমি Unity Chat — Unity Earning E-learning Platform এর ভার্চুয়াল অ্যাসিস্ট্যান্ট। রিফান্ড সংক্রান্ত কোনো প্রশ্ন থাকলে আমাকে জানাতে পারেন।',
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const quickQuestions = [
    'রিফান্ড পাওয়ার নিয়ম কি?',
    'টাকা কবে ফেরত পাব?',
    'আমার রিফান্ড কি নিশ্চিত পাব?',
    'জরুরি প্রয়োজনে কোথায় যোগাযোগ করব?',
  ];

  const generateBotReply = (userQuery: string): string => {
    const q = userQuery.toLowerCase();

    if (q.includes('নিয়ম') || q.includes('কিভাবে') || q.includes('আবেদন') || q.includes('process')) {
      return 'Unity Earning প্ল্যাটফর্মে রিফান্ড আবেদনের নিয়মাবলী:\n১. প্রথমে হোমপেজ থেকে রেজিস্ট্রেশন বা লগইন করুন।\n২. সঠিক তথ্য ও পেমেন্ট ট্রানজেকশন আইডি দিয়ে আবেদন সাবমিট করুন।\n৩. সাবমিটের পর একটি সিক্রেট টোকেন আইডি পাবেন যা দিয়ে লাইভ স্ট্যাটাস দেখতে পারবেন।';
    }

    if (q.includes('টাকা') || q.includes('কবে') || q.includes('সময়') || q.includes('কতদিন') || q.includes('days')) {
      return 'সাধারণত সর্বোচ্চ ২৪ কার্যদিবসের মধ্যে রিফান্ড আবেদন যাচাই-বাছাই করা হয়। কর্তৃপক্ষ আবেদন পর্যালোচনা করে সিদ্ধান্ত অনুমোদন করলে নির্ধারিত মোবাইল ব্যাংকিং একাউন্টে টাকা পাঠিয়ে দেওয়া হবে।';
    }

    if (q.includes('পাব') || q.includes('নিশ্চিত') || q.includes('অনুমোদন') || q.includes('বিবেচনা') || q.includes('হবে কি')) {
      return 'আপনি যদি সঠিক তথ্য দিয়ে রিফান্ড রিকোয়েস্ট পাঠান, তাহলে Unity Earning প্ল্যাটফর্ম কর্তৃপক্ষ আপনার আবেদনটি আন্তরিকতার সাথে বিবেচনা করবে। সকল শর্ত ও তথ্যাদি যাচাই করে সন্তোষজনক মনে হলে কর্তৃপক্ষ আপনার সম্পূর্ণ রিফান্ড টাকা পরিশোধ করে দিবে।';
    }

    if (q.includes('ইমেইল') || q.includes('টেলিগ্রাম') || q.includes('যোগাযোগ') || q.includes('সমস্যা') || q.includes('হেল্প')) {
      return `যেকোনো সমস্যা বা প্রশ্নের জন্য সরাসরি আমাদের অফিশিয়াল ইমেইলে যোগাযোগ করতে পারেন:\n📧 ইমেইল: ${supportEmail}\n💬 টেলিগ্রাম: ${telegramUrl}\nআমাদের টিম দ্রুত আপনার সমস্যার সমাধান করতে সচেষ্ট থাকবে।`;
    }

    // Default polite comprehensive response matching user prompt requirements
    return `আপনার প্রশ্নের জন্য ধন্যবাদ! আপনি যদি সঠিকভাবে রিফান্ড রিকোয়েস্ট পাঠান, তবে Unity Earning প্ল্যাটফর্ম কর্তৃপক্ষ আপনার সার্বিক বিষয়টি যত্নসহকারে বিবেচনা করবে। সবকিছু পর্যালোচনা করে উপযুক্ত মনে হলে কর্তৃপক্ষ আপনার রিফান্ড পরিশোধ করে দিবে।\n\nযেকোনো বিশেষ সমস্যা বা জরুরি প্রয়োজনে সরাসরি আমাদের ইমেইল (${supportEmail}) বা টেলিগ্রামে যোগাযোগ করার অনুরোধ রইল।`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      const replyText = generateBotReply(query);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: 'চ্যাট হিস্ট্রি রিসেট করা হয়েছে। আপনার কি কোনো নতুন তথ্য জানার আছে?',
        time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[560px] max-h-[90vh]"
          >
            {/* Chatbot Header */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-4 flex items-center justify-between shadow-xs shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner shrink-0">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm sm:text-base leading-tight">Unity Chat</h3>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      অটোমেটেড হেল্প
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
                    Unity Earning E-learning Platform
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetChat}
                  title="রিসেট করুন"
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/70">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm shadow-2xs leading-relaxed whitespace-pre-line ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-xs font-medium'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 mb-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>Unity Bot</span>
                      </div>
                    )}
                    <div>{msg.text}</div>
                    <div
                      className={`text-[9px] mt-1.5 text-right font-mono ${
                        msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                      }`}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs px-4 py-2.5 shadow-2xs flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-0.5">
                <MessageSquare className="w-3 h-3 text-slate-400" />
                সাজেস্ট:
              </span>
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[11px] font-medium transition-colors border border-slate-200 shrink-0 cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="রিফান্ড সম্পর্কে যেকোনো প্রশ্ন লিখুন..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isTyping}
                className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>

            {/* Footer Support Info */}
            <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between shrink-0">
              <span className="flex items-center gap-1 text-slate-500">
                <Mail className="w-3.5 h-3.5 text-amber-600" />
                <span>{supportEmail}</span>
              </span>
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-600 font-bold hover:underline flex items-center gap-0.5"
              >
                <span>টেলিগ্রাম সাপোর্ট</span>
                <ChevronRight className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
