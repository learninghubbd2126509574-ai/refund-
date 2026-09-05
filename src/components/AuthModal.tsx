import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { 
  X, 
  UserPlus, 
  LogIn, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Lock,
  User as UserIcon,
  BadgeCheck,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register' | 'admin';
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onRegisterSuccess: (user: User) => void;
  existingUsers: User[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onLoginSuccess,
  onRegisterSuccess,
  existingUsers,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'admin'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [forgotModal, setForgotModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredSuccessUser, setRegisteredSuccessUser] = useState<User | null>(null);

  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [teamLeaderName, setTeamLeaderName] = useState('');
  const [teamTrainerName, setTeamTrainerName] = useState('');

  // Login Form State
  const [loginWhatsapp, setLoginWhatsapp] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Admin Login State
  const [adminRole, setAdminRole] = useState<UserRole>('admin');
  const [adminPin, setAdminPin] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  useEffect(() => {
    setActiveTab(initialMode);
    setErrorMsg('');
    setSuccessMsg('');
    setRegisteredSuccessUser(null);
    if (initialMode === 'admin') {
      setAdminPin('');
    }
  }, [initialMode, isOpen]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim()) {
      setErrorMsg('অনুগ্রহ করে আপনার পুরো নাম লিখুন');
      return;
    }

    const cleanPhone = whatsapp.trim().replace(/[^\d+]/g, '');
    if (!cleanPhone || cleanPhone.replace(/\D/g, '').length < 10) {
      setErrorMsg('সঠিক হোয়াটসঅ্যাপ নম্বর লিখুন (যেমন: 017xxxxxxxx)');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('সঠিক ইমেইল ঠিকানা লিখুন');
      return;
    }

    if (!studentId.trim() || studentId.trim().length < 3) {
      setErrorMsg('অনুগ্রহ করে সঠিক স্টুডেন্ট আইডি লিখুন');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('পাসওয়ার্ড দুটি মেলেনি, আবার লিখুন');
      return;
    }

    setIsSubmitting(true);

    // Check if user already exists
    const exists = existingUsers.find(
      (u) => 
        (u.whatsapp && u.whatsapp === cleanPhone) || 
        (u.email && u.email.toLowerCase() === email.trim().toLowerCase()) ||
        (u.studentId && u.studentId.toUpperCase() === studentId.trim().toUpperCase())
    );

    if (exists) {
      setIsSubmitting(false);
      if (exists.status === 'pending') {
        setErrorMsg('আপনার অ্যাকাউন্টটি ইতোমধ্যে অ্যাডমিনের পেন্ডিং তালিকায় রয়েছে। অনুগ্রহ করে অ্যাডমিনের অনুমোদনের অপেক্ষা করুন।');
      } else {
        setErrorMsg('এই হোয়াটসঅ্যাপ নম্বর বা ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে। সরাসরি লগইন করুন।');
      }
      return;
    }

    const nameParts = fullName.trim().split(/\s+/);
    const derivedFirst = nameParts[0] || fullName.trim();
    const derivedLast = nameParts.slice(1).join(' ') || '';

    const newUser: User = {
      id: `usr-${Date.now()}`,
      firstName: derivedFirst,
      lastName: derivedLast,
      fullName: fullName.trim(),
      whatsapp: cleanPhone,
      password: password,
      email: email.trim().toLowerCase(),
      studentId: studentId.trim().toUpperCase(),
      address: address.trim() || 'ঠিকানা দেওয়া হয়নি',
      role: 'student',
      teamLeaderName: teamLeaderName.trim() || 'নির্ধারিত হয়নি',
      teamTrainerName: teamTrainerName.trim() || 'নির্ধারিত হয়নি',
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      registeredAt: new Date().toLocaleString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    try {
      await onRegisterSuccess(newUser);
      setRegisteredSuccessUser(newUser);
      setIsSubmitting(false);
    } catch (err) {
      console.error('Registration failed:', err);
      // Even if firestore error, show user registered in state
      setRegisteredSuccessUser(newUser);
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmedInput = loginWhatsapp.trim();
    if (!trimmedInput) {
      setErrorMsg('অনুগ্রহ করে আপনার হোয়াটসঅ্যাপ নম্বর বা ইমেইল লিখুন');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('অনুগ্রহ করে পাসওয়ার্ড প্রদান করুন');
      return;
    }

    // Find student in existing users
    const found = existingUsers.find(
      (u) => 
        (u.whatsapp === trimmedInput || u.email.toLowerCase() === trimmedInput.toLowerCase() || u.studentId.toLowerCase() === trimmedInput.toLowerCase()) &&
        u.role === 'student'
    );

    if (found) {
      if (found.status === 'pending') {
        setErrorMsg('আপনার অ্যাকাউন্টটি এখনও অনুমোদিত হয়নি। অনুগ্রহ করে অ্যাডমিনের অনুমোদনের জন্য অপেক্ষা করুন।');
        return;
      }
      onLoginSuccess(found);
      onClose();
    } else {
      setErrorMsg('অ্যাকাউন্টটি পাওয়া যায়নি। অনুগ্রহ করে সঠিক তথ্য প্রদান করুন বা রেজিস্ট্রেশন করুন।');
    }
  };

  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!adminPin.trim()) {
      setErrorMsg('অনুগ্রহ করে অ্যাডমিন পাসওয়ার্ড / সিকিউরিটি পিন লিখুন');
      return;
    }

    // Predefined role profiles
    const roleProfiles: Record<string, { name: string; email: string; id: string }> = {
      admin: { name: 'মোস্তফা কামাল (সুপার অ্যাডমিন)', email: 'admin@unityearning.com', id: 'ADM-001' },
      team_leader: { name: 'রাকিব হাসান (টিম লিডার - TL)', email: 'tl.rakib@unityearning.com', id: 'TL-104' },
      stl: { name: 'আরিফুল ইসলাম (Senior Team Leader - STL)', email: 'stl.ariful@unityearning.com', id: 'STL-082' },
      senior_tl: { name: 'আরিফুল ইসলাম (Senior Team Leader - STL)', email: 'stl.ariful@unityearning.com', id: 'STL-082' },
      htl: { name: 'আরিফুল ইসলাম (Senior Team Leader - STL)', email: 'stl.ariful@unityearning.com', id: 'STL-082' },
      hsl: { name: 'ফারহানা চৌধুরী (Higher Senior Leader - HSL)', email: 'hsl.farhana@unityearning.com', id: 'HSL-201' },
      hcl: { name: 'ফারহানা চৌধুরী (Higher Senior Leader - HSL)', email: 'hsl.farhana@unityearning.com', id: 'HSL-201' },
      hcr: { name: 'ফারহানা চৌধুরী (Higher Senior Leader - HSL)', email: 'hsl.farhana@unityearning.com', id: 'HSL-201' },
      refund_manager: { name: 'সাকলাইন মোস্তাক (Refund Manager - RM)', email: 'rm.saklayen@unityearning.com', id: 'RM-005' },
      manager: { name: 'সাকলাইন মোস্তাক (Refund Manager - RM)', email: 'rm.saklayen@unityearning.com', id: 'RM-005' },
      policy_team: { name: 'সৈয়দ আকরামুল হক (পলিসি হেড)', email: 'policy@unityearning.com', id: 'POL-012' },
      finance: { name: 'মাহমুদ আলম (ফিন্যান্স ম্যানেজার)', email: 'finance@unityearning.com', id: 'FIN-009' },
      student: { name: 'স্টুডেন্ট', email: 'student@unityearning.com', id: 'ST-000' }
    };

    const targetProfile = roleProfiles[adminRole] || roleProfiles.admin;

    const adminUser: User = {
      id: `usr-${adminRole}`,
      firstName: targetProfile.name.split(' ')[0],
      lastName: targetProfile.name.split(' ')[1] || 'অফিসার',
      fullName: targetProfile.name,
      whatsapp: '01700000000',
      email: targetProfile.email,
      studentId: targetProfile.id,
      address: 'হেড অফিস, বনানী, ঢাকা',
      role: adminRole,
      createdAt: '2025-01-01'
    };

    onLoginSuccess(adminUser);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              UE
            </div>
            <span className="font-bold text-slate-800 text-sm">
              Unity Earning E-learning Platform
            </span>
          </div>
          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50/40 text-sm font-semibold">
          <button
            id="tab-register-btn"
            onClick={() => { setActiveTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>রেজিস্ট্রেশন</span>
          </button>

          <button
            id="tab-login-btn"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>লগইন</span>
          </button>

          <button
            id="tab-admin-btn"
            onClick={() => { setActiveTab('admin'); setErrorMsg(''); setSuccessMsg(''); }}
            className={`py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'admin'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>অ্যাডমিন</span>
          </button>
        </div>

        <div className="p-6">
          {/* Notification Messages */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium flex items-start gap-2.5 leading-relaxed">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ======================= REGISTRATION FORM ======================= */}
          {activeTab === 'register' && (
            <div>
              {registeredSuccessUser ? (
                /* Registration Success & Pending State Screen */
                <div className="py-2 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-sm animate-bounce">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold mb-2">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      স্ট্যাটাস: পেন্ডিং (অ্যাডমিন অনুমোদনের অপেক্ষায়)
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">
                      রেজিস্ট্রেশন সফলভাবে সম্পন্ন হয়েছে!
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                      আপনার নিবন্ধনের যাবতীয় তথ্য অ্যাডমিন প্যানেলের <strong>"পেন্ডিং রেজিস্ট্রেশন"</strong> তালিকায় পাঠানো হয়েছে। অ্যাডমিন এটি অনুমোদন (Approve) করার পর আপনি লগইন করতে পারবেন।
                    </p>
                  </div>

                  {/* Details Card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-500">শিক্ষার্থীর নাম:</span>
                      <strong className="text-slate-900 text-sm">{registeredSuccessUser.fullName}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">স্টুডেন্ট আইডি:</span>
                      <strong className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {registeredSuccessUser.studentId}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">হোয়াটসঅ্যাপ নম্বর:</span>
                      <strong className="font-mono text-slate-800">{registeredSuccessUser.whatsapp}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">ইমেইল:</span>
                      <strong className="text-slate-800 truncate max-w-[200px]">{registeredSuccessUser.email}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">টিম লিডার:</span>
                      <strong className="text-slate-800">{registeredSuccessUser.teamLeaderName}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">টিম ট্রেনার:</span>
                      <strong className="text-slate-800">{registeredSuccessUser.teamTrainerName}</strong>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className="text-slate-500">নির্ধারিত পাসওয়ার্ড:</span>
                      <strong className="font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-900">{registeredSuccessUser.password}</strong>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      id="reg-goto-login-btn"
                      type="button"
                      onClick={() => {
                        setLoginWhatsapp(registeredSuccessUser.whatsapp);
                        setLoginPassword(registeredSuccessUser.password || '');
                        setActiveTab('login');
                        setRegisteredSuccessUser(null);
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>লগইন স্ক্রিনে যান</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRegisteredSuccessUser(null);
                          setFullName('');
                          setWhatsapp('');
                          setEmail('');
                          setStudentId('');
                          setAddress('');
                          setPassword('');
                          setConfirmPassword('');
                          setTeamLeaderName('');
                          setTeamTrainerName('');
                        }}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        আরেকটি নতুন রেজিস্ট্রেশন
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        মডাল বন্ধ করুন
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Registration Input Form */
                <div>
                  <div className="mb-5 text-left">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      নতুন অ্যাকাউন্ট তৈরি করুন
                    </h3>
                    <p className="text-xs text-slate-500">
                      সকল সঠিক তথ্য দিয়ে রেজিস্ট্রেশন সম্পন্ন করুন। রেজিস্ট্রেশনের পর তথ্যটি অ্যাডমিনের অনুমোদনের জন্য পেন্ডিং থাকবে।
                    </p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-left">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        শিক্ষার্থীর পূর্ণ নাম (Full Name) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          id="reg-full-name"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="আপনার পূর্ণ নাম লিখুন"
                          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* WhatsApp & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          হোয়াটসঅ্যাপ নম্বর <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                          <input
                            id="reg-whatsapp"
                            type="tel"
                            required
                            value={whatsapp}
                            onChange={(e) => setWhatsapp(e.target.value)}
                            placeholder="017xxxxxxxx"
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          ইমেইল <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                          <input
                            id="reg-email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Student ID */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        স্টুডেন্ট আইডি (Student ID) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="reg-student-id"
                        type="text"
                        required
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="আপনার স্টুডেন্ট আইডি লিখুন (যেমন: 1827271)"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                      />
                    </div>

                    {/* Team Leader & Trainer */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          টিম লিডার (Team Leader)
                        </label>
                        <input
                          id="reg-team-leader"
                          type="text"
                          value={teamLeaderName}
                          onChange={(e) => setTeamLeaderName(e.target.value)}
                          placeholder="টিম লিডারের নাম (যদি থাকে)"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          টিম ট্রেনার (Team Trainer)
                        </label>
                        <input
                          id="reg-team-trainer"
                          type="text"
                          value={teamTrainerName}
                          onChange={(e) => setTeamTrainerName(e.target.value)}
                          placeholder="টিম ট্রেনারের নাম (যদি থাকে)"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        ঠিকানা
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          id="reg-address"
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="জেলা ও থানা / এলাকা"
                          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Password & Confirm Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          পাসওয়ার্ড <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="reg-password"
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="কমপক্ষে ৬ অক্ষর"
                            className="w-full pl-3 pr-8 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          পাসওয়ার্ড নিশ্চিত করুন <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="reg-confirm-password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="আবার লিখুন"
                            className="w-full pl-3 pr-8 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Submit button */}
                    <button
                      id="reg-submit-btn"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-4 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>রেজিস্ট্রেশন জমা হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>রেজিস্ট্রেশন সম্পন্ন করুন</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ======================= STUDENT LOGIN FORM ======================= */}
          {activeTab === 'login' && (
            <div>
              <div className="mb-5">
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  আপনার অ্যাকাউন্টে লগইন করুন
                </h3>
                <p className="text-xs text-slate-500">
                  হোয়াটসঅ্যাপ নম্বর অথবা স্টুডেন্ট আইডি ও পাসওয়ার্ড দিয়ে প্রবেশ করুন
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    হোয়াটসঅ্যাপ নম্বর / ইমেইল / স্টুডেন্ট আইডি
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      id="login-whatsapp"
                      type="text"
                      required
                      value={loginWhatsapp}
                      onChange={(e) => setLoginWhatsapp(e.target.value)}
                      placeholder="017xxxxxxxx অথবা UE-88421"
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      পাসওয়ার্ড
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotModal(true)}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-medium"
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="আপনার পাসওয়ার্ড"
                      className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="login-submit-btn"
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all active:scale-98"
                >
                  লগইন করুন
                </button>
              </form>
            </div>
          )}

          {/* ======================= ADMIN LOGIN FORM ======================= */}
          {activeTab === 'admin' && (
            <div>
              <div className="mb-5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 text-white text-[11px] font-semibold mb-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>অ্যাডমিনিস্ট্রেটিভ পোর্টাল</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  অ্যাডমিন বা স্টাফ লগইন
                </h3>
                <p className="text-xs text-slate-500">
                  রিভিউয়ার, টিম লিডার ও ম্যানেজমেন্ট সদস্যদের জন্য নির্ধারিত পোর্টাল
                </p>
              </div>

              <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    দায়িত্ব / রোল নির্বাচন করুন
                  </label>
                  <select
                    id="admin-role-select"
                    value={adminRole}
                    onChange={(e) => setAdminRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white font-medium"
                  >
                    <option value="admin">সুপার অ্যাডমিন (Super Admin - সর্বময় ক্ষমতা)</option>
                    <option value="team_leader">টিম লিডার (Team Leader / TL - ২য় ধাপ)</option>
                    <option value="stl">সিনিয়র টিম লিডার (Senior Team Leader / STL - ৩য় ধাপ)</option>
                    <option value="hsl">হায়ার সিনিয়র লিডার (Higher Senior Leader / HSL - ৪র্থ ধাপ)</option>
                    <option value="refund_manager">রিফান্ড ম্যানেজার (Refund Manager / RM - ৫ম ধাপ)</option>
                    <option value="policy_team">রিফান্ড পলিসি কমিটি (Policy Team - ৬ষ্ঠ ধাপ)</option>
                    <option value="finance">ফিন্যান্স ও ক্যাশিয়ার (Finance - পেমেন্ট ইস্যু)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    অ্যাডমিন সিকিউরিটি পাসওয়ার্ড / পিন
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      id="admin-pin-input"
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      placeholder="আপনার পাসওয়ার্ড লিখুন"
                      className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="admin-submit-btn"
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all active:scale-98"
                >
                  অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করুন
                </button>
              </form>
            </div>
          )}
        </div>
      </motion.div>

      {/* Forgot Password Mini Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-base mb-2">পাসওয়ার্ড রিসেট সহায়তা</h4>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              পাসওয়ার্ড ভুলে গেলে অনুগ্রহ করে আপনার রেজিস্ট্রেশনকৃত হোয়াটসঅ্যাপ নম্বর থেকে আমাদের অফিশিয়াল হেল্পলাইনে মেসেজ করুন অথবা ডেমো লগইন ব্যবহার করুন।
            </p>
            <div className="p-3 bg-emerald-50 rounded-xl text-xs font-semibold text-emerald-800 mb-4">
              অফিশিয়াল হোয়াটসঅ্যাপ সাপোর্ট: +880 1700-000000
            </div>
            <button
              onClick={() => setForgotModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              ঠিক আছে, বুঝেছি
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
