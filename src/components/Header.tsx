import React from 'react';
import { User } from '../types';
import { Shield, LogOut, LayoutDashboard, Send, Bot, Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  currentUser: User | null;
  currentView: string;
  telegramUrl?: string;
  supportEmail?: string;
  onOpenChatBot?: () => void;
  onNavigate: (view: string) => void;
  onOpenAuth: (mode: 'login' | 'register' | 'admin') => void;
  onLogout: () => void;
  onTrackRequest?: (query: string) => boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentView,
  telegramUrl = 'https://t.me/unityearning12',
  onOpenChatBot,
  onNavigate,
  onOpenAuth,
  onLogout,
}) => {
  const { isBn, toggleLanguage } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Company Brand & Logo */}
          <div 
            id="header-brand-logo"
            onClick={() => onNavigate(currentUser ? (currentUser.role === 'student' ? 'dashboard' : 'admin') : 'landing')}
            className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
          >
            {/* Logo Badge */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <span className="font-extrabold text-xs sm:text-sm tracking-tight">UE</span>
            </div>
            
            {/* Company Name & Subtitle */}
            <div className="flex flex-col text-left justify-center">
              <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-tight whitespace-nowrap">
                Unity Earning
              </span>
              <span className="text-[10px] text-emerald-700 font-bold tracking-tight leading-tight whitespace-nowrap">
                {isBn ? 'ই-লার্নিং প্ল্যাটফর্ম' : 'E-learning Platform'}
              </span>
            </div>
          </div>

          {/* Right Action Area: 4 Icons with refined spacing (Unity Chat + Language Translate + Telegram + Admin Shield) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* 1. Unity Chatbot Icon Button */}
            <button
              id="header-unity-chat-btn"
              onClick={onOpenChatBot}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 active:bg-emerald-200 text-emerald-700 border border-emerald-200/80 flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer shrink-0 group relative"
              title={isBn ? "ইউনিটি এআই অ্যাসিস্ট্যান্ট" : "Unity AI Assistant"}
              aria-label="Unity AI Assistant"
            >
              <Bot className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse"></span>
            </button>

            {/* 2. Language Translate Toggle Button */}
            <button
              id="header-language-toggle-btn"
              onClick={toggleLanguage}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 hover:bg-amber-100/80 active:bg-amber-200 text-amber-800 border border-amber-200/80 flex flex-col items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer shrink-0 group relative"
              title={isBn ? "Click to switch to English (ইংরেজি করুন)" : "Click to switch to Bengali (বাংলায় দেখুন)"}
              aria-label="Language Toggle"
            >
              <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700 group-hover:rotate-12 transition-transform shrink-0" />
              <span className="text-[8px] sm:text-[9px] font-black text-amber-900 leading-none tracking-tighter mt-0.5">
                {isBn ? 'বাং' : 'EN'}
              </span>
            </button>

            {/* 3. Telegram Support Icon Button */}
            <a
              id="header-support-telegram-btn"
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-50 hover:bg-sky-100/80 active:bg-sky-200 text-sky-600 border border-sky-200/80 flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer shrink-0 group"
              title={isBn ? "অফিসিয়াল টেলিগ্রাম সাপোর্ট" : "Official Telegram Support"}
              aria-label="Telegram Support"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-600 shrink-0 transform -rotate-12 translate-x-0.5 -translate-y-0.5 group-hover:scale-110 transition-transform" />
            </a>

            {/* 4. Navigation Controls: Admin Login Shield or Logged In Navigation */}
            <nav className="flex items-center shrink-0">
              {!currentUser ? (
                <button
                  id="nav-admin-login-btn"
                  onClick={() => onOpenAuth('admin')}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-emerald-400 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl shadow-xs border border-slate-700/80 transition-all active:scale-95 cursor-pointer shrink-0 group"
                  title={isBn ? "অ্যাডমিন প্রবেশাধিকার" : "Admin Access"}
                  aria-label="Admin Access"
                >
                  <Shield className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
                </button>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {currentUser.role === 'student' ? (
                    <button
                      id="nav-student-dashboard-btn"
                      onClick={() => onNavigate('dashboard')}
                      className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                        currentView === 'dashboard'
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 shadow-xs'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="hidden xs:inline">{isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
                    </button>
                  ) : (
                    <button
                      id="nav-admin-dashboard-btn"
                      onClick={() => onNavigate('admin')}
                      className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                        currentView === 'admin'
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 shadow-xs'
                          : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="hidden xs:inline">{isBn ? 'অ্যাডমিন' : 'Admin'}</span>
                    </button>
                  )}

                  {/* User Profile Badge & Logout */}
                  <div className="flex items-center gap-1 pl-1.5 sm:pl-2 border-l border-slate-200">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200 shrink-0">
                      {currentUser.firstName ? currentUser.firstName.charAt(0) : 'U'}
                    </div>
                    <button
                      id="nav-logout-btn"
                      onClick={onLogout}
                      title={isBn ? "লগআউট" : "Logout"}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </nav>

          </div>

        </div>
      </div>
    </header>
  );
};


