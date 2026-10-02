import React, { useState, useEffect } from 'react';
import { User, RefundRequest, StageId, RequestStatus, UserRole, AppSettings } from '../types';
import { REFUND_STAGES, STAGE_ORDER, getStageDetails, calculateReviewTimeline } from '../data/stages';
import { getYouTubeVideoId } from './SupportVideoModal';
import { 
  LayoutDashboard, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Search, 
  Filter, 
  UserCheck, 
  UserPlus,
  Settings, 
  LogOut, 
  FileText, 
  ChevronRight, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  AlertTriangle,
  MessageSquare, 
  CreditCard, 
  Shield, 
  Send,
  Building,
  Users,
  Eye,
  EyeOff,
  Plus,
  ExternalLink,
  Youtube,
  Play,
  Video,
  Save,
  Link,
  KeyRound,
  Trash2,
  Lock,
  Unlock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
  X,
  Receipt,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ApplicationDetailsModal } from './ApplicationDetailsModal';

interface AdminDashboardProps {
  currentUser: User;
  requests: RefundRequest[];
  users: User[];
  appSettings?: AppSettings;
  onUpdateRequest: (updated: RefundRequest) => void;
  onUpdateUser: (updated: User) => void;
  onDeleteUser?: (userId: string) => void;
  onUpdateAppSettings?: (settings: AppSettings) => Promise<void>;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  requests,
  users,
  appSettings,
  onUpdateRequest,
  onUpdateUser,
  onDeleteUser,
  onUpdateAppSettings,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<RefundRequest | null>(null);

  // Application Details View Modal State
  const [isApplicationDetailsModalOpen, setIsApplicationDetailsModalOpen] = useState(false);
  const [detailsModalRequest, setDetailsModalRequest] = useState<RefundRequest | null>(null);

  // Change Password Modal State
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [targetUserForPassword, setTargetUserForPassword] = useState<User | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Delete User Modal State
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [targetUserForDelete, setTargetUserForDelete] = useState<User | null>(null);

  // User Details Modal Password View
  const [showUserPasswordInModal, setShowUserPasswordInModal] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // App Settings & YouTube Video Configuration State
  const [videoUrlInput, setVideoUrlInput] = useState(appSettings?.supportVideoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [videoTitleInput, setVideoTitleInput] = useState(appSettings?.supportVideoTitle || 'রিফান্ড আবেদন ও ট্র্যাকিং সম্পর্কিত অফিসিয়াল ভিডিও গাইডলাইন');
  const [telegramUrlInput, setTelegramUrlInput] = useState(appSettings?.telegramUrl || 'https://t.me/unityearning12');
  const [supportEmailInput, setSupportEmailInput] = useState(appSettings?.supportEmail || 'unityearning13@gmail.com');
  const [helplineInput, setHelplineInput] = useState(appSettings?.officialHelpline || '+880 1700-000000');
  const [maxDaysInput, setMaxDaysInput] = useState(appSettings?.maxReviewDays || 20);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (appSettings) {
      if (appSettings.supportVideoUrl) setVideoUrlInput(appSettings.supportVideoUrl);
      if (appSettings.supportVideoTitle) setVideoTitleInput(appSettings.supportVideoTitle);
      if (appSettings.telegramUrl) setTelegramUrlInput(appSettings.telegramUrl);
      if (appSettings.supportEmail) setSupportEmailInput(appSettings.supportEmail);
      if (appSettings.officialHelpline) setHelplineInput(appSettings.officialHelpline);
      if (appSettings.maxReviewDays) setMaxDaysInput(appSettings.maxReviewDays);
    }
  }, [appSettings]);

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    try {
      const updated: AppSettings = {
        id: 'general_config',
        supportVideoUrl: videoUrlInput.trim() || 'https://www.youtube.com',
        supportVideoTitle: videoTitleInput.trim() || 'রিফান্ড আবেদন ও ট্র্যাকিং সম্পর্কিত অফিসিয়াল ভিডিও গাইডলাইন',
        telegramUrl: telegramUrlInput.trim() || 'https://t.me/unityearning12',
        supportEmail: supportEmailInput.trim() || 'unityearning13@gmail.com',
        officialHelpline: helplineInput.trim() || '+880 1700-000000',
        maxReviewDays: Number(maxDaysInput) || 20,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      if (onUpdateAppSettings) {
        await onUpdateAppSettings(updated);
      }
      setSaveSuccessMsg(true);
      setTimeout(() => setSaveSuccessMsg(false), 4000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Auto-Progression Cron logic
  useEffect(() => {
    if (currentUser.role !== 'admin') return;

    requests.forEach(req => {
      if (['approved', 'issued', 'completed', 'rejected'].includes(req.status)) return;
      if (!req.submissionDate) return;

      const submitTime = new Date(req.submissionDate).getTime();
      const now = Date.now();
      const daysElapsed = (now - submitTime) / (1000 * 3600 * 24);
      
      let targetStage: StageId = req.currentStageId;
      let targetStatus: RequestStatus = req.status;
      let isRejected = false;

      if (daysElapsed >= 20) {
        targetStage = 'policy_team_review';
        targetStatus = 'rejected';
        isRejected = true;
      } else if (daysElapsed >= 14) {
        targetStage = 'policy_team_review';
      } else if (daysElapsed >= 7) {
        targetStage = 'refund_manager_review';
      } else if (daysElapsed >= 3) {
        targetStage = 'hsl_review';
      } else if (daysElapsed >= 1) {
        targetStage = 'stl_review';
      }

      if (targetStage !== req.currentStageId || targetStatus !== req.status) {
        const nowStr = new Date().toISOString().split('T')[0];
        const updatedReq: RefundRequest = {
          ...req,
          currentStageId: targetStage,
          status: targetStatus,
          lastUpdatedDate: nowStr,
          stageLogs: [
            ...(req.stageLogs || []),
            {
              id: `log-auto-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              stageId: targetStage,
              status: isRejected ? 'rejected' : 'in_progress',
              reviewedBy: 'সিস্টেম অটো-পলিসি অডিট',
              reviewerRoleBn: '২০-দিন পলিসি অডিট কমিটি',
              timestamp: `${nowStr} (অটো আপডেট)`,
              notes: isRejected 
                ? 'আবেদন বাতিল: আমাদের অভ্যন্তরীণ পলিসি ও অডিট কমিটির পুঙ্খানুপুঙ্খ পর্যালোচনা শেষে আপনার রিফান্ড আবেদনটি বাতিল করা হয়েছে। রিফান্ড পলিসির নির্ধারিত শর্তাবলী অনুযায়ী আপনার দাখিলকৃত আবেদনের সপক্ষে কোনো সুনির্দিষ্ট ও প্রমাণযোগ্য যৌক্তিক কারণ পাওয়া যায়নি। ফলে ২০ কার্যদিবসের মাথায় প্রাতিষ্ঠানিক নীতিমালার আওতায় আপনার রিফান্ড রিকোয়েস্টটি বাতিল গণ্য করা হলো এবং এই আবেদনের রিফান্ড পলিসি বাদ/বাতিল ঘোষণা করা হলো।' 
                : 'আবেদনটি পরবর্তী ধাপে স্বয়ংক্রিয়ভাবে স্থানান্তরিত হয়েছে।'
            }
          ]
        };
        if (isRejected) {
          updatedReq.rejectionReason = 'আমাদের অভ্যন্তরীণ পলিসি ও অডিট কমিটির পুঙ্খানুপুঙ্খ পর্যালোচনা শেষে আপনার রিফান্ড আবেদনটি বাতিল করা হয়েছে। রিফান্ড পলিসির নির্ধারিত শর্তাবলী অনুযায়ী আপনার দাখিলকৃত আবেদনের সপক্ষে কোনো সুনির্দিষ্ট ও প্রমাণযোগ্য যৌক্তিক কারণ পাওয়া যায়নি। ফলে প্রাতিষ্ঠানিক নীতিমালার আওতায় ২০ কার্যদিবসের মাথায় আপনার রিফান্ড রিকোয়েস্টটি বাতিল গণ্য করা হলো এবং এই আবেদনের রিফান্ড পলিসি বাদ/বাতিল ঘোষণা করা হলো।';
          updatedReq.rejectedBy = 'সিস্টেম অটো-পলিসি অডিট';
          updatedReq.rejectedRoleBn = '২০-দিন পলিসি অডিট কমিটি';
          updatedReq.rejectedDate = `${nowStr} (অটো-বাতিল)`;
        }
        
        // Use timeout to avoid flushSync warnings during render cycles
        setTimeout(() => {
          onUpdateRequest(updatedReq);
        }, 100);
      }
    });
  }, [requests, currentUser.role, onUpdateRequest]);

  // Action Modals State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [internalNoteInput, setInternalNoteInput] = useState('');
  
  // Payout Issue State
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [transactionIdInput, setTransactionIdInput] = useState('');
  const [payoutSlipNoteInput, setPayoutSlipNoteInput] = useState('');

  // User Details Modal
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<User | null>(null);

  // Metrics
  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const inReviewCount = requests.filter(r => r.status === 'in_review').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;
  const completedCount = requests.filter(r => r.status === 'completed' || r.status === 'issued').length;
  const totalRefundedAmount = requests
    .filter(r => r.status === 'completed' || r.status === 'issued')
    .reduce((sum, r) => sum + r.amount, 0);

  // Pending Registrations Metrics
  const pendingUsers = users.filter(u => u.status === 'pending');
  const pendingUsersCount = pendingUsers.length;

  // Approved Students Metrics
  const approvedStudents = users.filter(u => u.status === 'approved' && (u.role === 'student' || !u.role));
  const approvedStudentsCount = approvedStudents.length;
  const [approvedStudentSearch, setApprovedStudentSearch] = useState('');

  // User Management Actions
  const handleAcceptUser = (user: User) => {
    const updated = { ...user, status: 'approved' as const };
    onUpdateUser(updated);
    if (selectedUserForDetails?.id === user.id) {
      setSelectedUserForDetails(updated);
    }
    showToast(`✅ ${user.fullName}-এর রেজিস্ট্রেশন অনুমোদন করা হয়েছে! তথ্যটি "অ্যাপ্রুভ স্টুডেন্ট" তালিকায় যুক্ত হয়েছে।`, 'success');
  };

  const handleRejectUser = (user: User) => {
    const updated = { ...user, status: 'rejected' as const };
    onUpdateUser(updated);
    if (selectedUserForDetails?.id === user.id) {
      setSelectedUserForDetails(updated);
    }
    showToast(`⚠️ ${user.fullName}-এর রেজিস্ট্রেশন বাতিল করা হয়েছে।`, 'error');
  };

  const handleOpenChangePasswordModal = (user: User) => {
    setTargetUserForPassword(user);
    setNewPasswordValue(user.password || '');
    setShowNewPassword(false);
    setPasswordError('');
    setChangePasswordModalOpen(true);
  };

  const handleSaveNewPasswordSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!targetUserForPassword) return;
    if (!newPasswordValue.trim() || newPasswordValue.trim().length < 6) {
      setPasswordError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    const updated = { ...targetUserForPassword, password: newPasswordValue.trim() };
    onUpdateUser(updated);
    if (selectedUserForDetails?.id === targetUserForPassword.id) {
      setSelectedUserForDetails(updated);
    }
    setChangePasswordModalOpen(false);
    showToast(`🔑 ${targetUserForPassword.fullName}-এর পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!`, 'success');
  };

  const handleOpenDeleteUserModal = (user: User) => {
    setTargetUserForDelete(user);
    setDeleteUserModalOpen(true);
  };

  const handleConfirmDeleteUserSubmit = () => {
    if (!targetUserForDelete) return;
    const userName = targetUserForDelete.fullName;
    if (onDeleteUser) {
      onDeleteUser(targetUserForDelete.id);
    }
    if (selectedUserForDetails?.id === targetUserForDelete.id) {
      setSelectedUserForDetails(null);
    }
    setDeleteUserModalOpen(false);
    setTargetUserForDelete(null);
    showToast(`🗑️ ${userName}-এর রেজিস্ট্রেশন ডাটা স্থায়ীভাবে মুছে ফেলা হয়েছে।`, 'error');
  };

  // Filter requests based on tab & search
  const filteredRequests = requests.filter((req) => {
    // Tab filter
    if (activeTab === 'pending' && req.status !== 'pending') return false;
    if (activeTab === 'in_review' && req.status !== 'in_review') return false;
    if (activeTab === 'approved' && req.status !== 'approved') return false;
    if (activeTab === 'rejected' && req.status !== 'rejected') return false;
    if (activeTab === 'completed' && req.status !== 'completed' && req.status !== 'issued') return false;
    
    // Method filter
    if (methodFilter !== 'all' && req.payoutMethod !== methodFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        req.id.toLowerCase().includes(q) ||
        req.fullName.toLowerCase().includes(q) ||
        req.studentId.toLowerCase().includes(q) ||
        req.whatsapp.includes(q)
      );
    }
    return true;
  });

  // Handle Advance to Next Stage
  const handleAdvanceStage = (req: RefundRequest) => {
    const currentIdx = STAGE_ORDER.indexOf(req.currentStageId);
    if (currentIdx < STAGE_ORDER.length - 1) {
      const nextStageId = STAGE_ORDER[currentIdx + 1];
      const nextStageDef = getStageDetails(nextStageId);
      const nowStr = new Date().toISOString().split('T')[0];

      let newStatus: RequestStatus = 'in_review';
      if (nextStageId === 'approved') newStatus = 'approved';
      if (nextStageId === 'issued') newStatus = 'issued';
      if (nextStageId === 'completed') newStatus = 'completed';

      const updatedLog = {
        id: `log-${Date.now()}`,
        stageId: nextStageId,
        status: 'passed' as const,
        reviewedBy: currentUser.fullName,
        reviewerRoleBn: currentUser.role === 'admin' ? 'সুপার অ্যাডমিন' : 'রিভিউয়ার',
        timestamp: `${nowStr} (অনুমোদিত)`,
        notes: `${nextStageDef?.titleBn} সম্পন্ন হয়েছে।`
      };

      const updatedReq: RefundRequest = {
        ...req,
        currentStageId: nextStageId,
        status: newStatus,
        lastUpdatedDate: nowStr,
        stageLogs: [...req.stageLogs, updatedLog]
      };

      onUpdateRequest(updatedReq);
      setSelectedRequest(updatedReq);
    }
  };

  // Handle Start Review
  const handleStartReview = (req: RefundRequest) => {
    const nowStr = new Date().toISOString().split('T')[0];
    const updatedReq: RefundRequest = {
      ...req,
      status: 'in_review',
      currentStageId: req.currentStageId === 'submitted' ? 'team_leader_review' : req.currentStageId,
      lastUpdatedDate: nowStr,
      stageLogs: [
        ...req.stageLogs,
        {
          id: `log-${Date.now()}`,
          stageId: 'team_leader_review',
          status: 'in_progress',
          reviewedBy: currentUser.fullName,
          reviewerRoleBn: 'রিভিউয়ার',
          timestamp: `${nowStr} (শুরু)`,
          notes: 'আবেদনের প্রাথমিক পর্যালোচনা শুরু করা হয়েছে।'
        }
      ]
    };
    onUpdateRequest(updatedReq);
    setSelectedRequest(updatedReq);
  };

  // Handle Direct Approve
  const handleDirectApprove = (req: RefundRequest) => {
    const nowStr = new Date().toISOString().split('T')[0];
    const updatedReq: RefundRequest = {
      ...req,
      status: 'approved',
      currentStageId: 'approved',
      lastUpdatedDate: nowStr,
      stageLogs: [
        ...req.stageLogs,
        {
          id: `log-${Date.now()}`,
          stageId: 'approved',
          status: 'passed',
          reviewedBy: currentUser.fullName,
          reviewerRoleBn: 'হেড অব একাউন্টস ও ম্যানেজমেন্ট',
          timestamp: nowStr,
          notes: 'রিফান্ড রিকোয়েস্ট চূড়ান্তভাবে অনুমোদন করা হয়েছে।'
        }
      ]
    };
    onUpdateRequest(updatedReq);
    setSelectedRequest(updatedReq);
  };

  // Handle Reject Submit
  const handleRejectSubmit = () => {
    if (!selectedRequest) return;
    if (!rejectionReasonInput.trim()) return;

    const nowStr = new Date().toISOString().split('T')[0];
    const updatedReq: RefundRequest = {
      ...selectedRequest,
      status: 'rejected',
      lastUpdatedDate: nowStr,
      rejectionReason: rejectionReasonInput.trim(),
      rejectedBy: currentUser.fullName,
      rejectedRoleBn: currentUser.role === 'admin' ? 'সুপার অ্যাডমিন' : 'রিভিউ কমিটি',
      rejectedDate: `${nowStr} (বাতিল)`,
      stageLogs: [
        ...selectedRequest.stageLogs,
        {
          id: `log-${Date.now()}`,
          stageId: selectedRequest.currentStageId,
          status: 'rejected',
          reviewedBy: currentUser.fullName,
          reviewerRoleBn: 'রিভিউ প্যানেল',
          timestamp: nowStr,
          notes: `আবেদন বাতিল: ${rejectionReasonInput.trim()}`
        }
      ]
    };

    onUpdateRequest(updatedReq);
    setSelectedRequest(updatedReq);
    setRejectModalOpen(false);
    setRejectionReasonInput('');
  };

  // Handle Issue Payout Submit
  const handleIssuePayoutSubmit = () => {
    if (!selectedRequest) return;
    const nowStr = new Date().toISOString().split('T')[0];
    const txn = transactionIdInput.trim() || `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const updatedReq: RefundRequest = {
      ...selectedRequest,
      status: 'completed',
      currentStageId: 'completed',
      lastUpdatedDate: nowStr,
      transactionId: txn,
      paidDate: `${nowStr}`,
      payoutSlipNote: payoutSlipNoteInput.trim() || 'নির্ধারিত ওয়ালেট নম্বরে অর্থ প্রদান সম্পন্ন হয়েছে।',
      stageLogs: [
        ...selectedRequest.stageLogs,
        {
          id: `log-issue-${Date.now()}`,
          stageId: 'issued',
          status: 'passed',
          reviewedBy: currentUser.fullName,
          reviewerRoleBn: 'ফিন্যান্স টিম',
          timestamp: nowStr,
          notes: `অর্থ ইস্যু সম্পন্ন: TrxID: ${txn}`
        },
        {
          id: `log-comp-${Date.now()}`,
          stageId: 'completed',
          status: 'passed',
          reviewedBy: 'সিস্টেম অ্যাডমিন',
          reviewerRoleBn: 'সিস্টেম',
          timestamp: nowStr,
          notes: 'রিফান্ড প্রক্রিয়া সফলভাবে সমাপ্ত।'
        }
      ]
    };

    onUpdateRequest(updatedReq);
    setSelectedRequest(updatedReq);
    setIssueModalOpen(false);
    setTransactionIdInput('');
    setPayoutSlipNoteInput('');
  };

  // Add Internal Note
  const handleAddInternalNote = () => {
    if (!selectedRequest || !internalNoteInput.trim()) return;
    const newNote = {
      id: `note-${Date.now()}`,
      author: currentUser.fullName,
      text: internalNoteInput.trim(),
      timestamp: new Date().toLocaleString('bn-BD')
    };

    const updatedReq: RefundRequest = {
      ...selectedRequest,
      internalNotes: [...(selectedRequest.internalNotes || []), newNote]
    };

    onUpdateRequest(updatedReq);
    setSelectedRequest(updatedReq);
    setInternalNoteInput('');
  };

  const navItems = [
    { id: 'pending', label: 'পেন্ডিং রিফান্ড', icon: Clock, count: pendingCount, isAlert: pendingCount > 0 },
    { id: 'all', label: 'সকল রিফান্ড রিকোয়েস্ট', icon: FileText, count: totalCount },
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard, count: totalCount },
    { id: 'pending_requests', label: 'পেন্ডিং রেজিস্ট্রেশন', icon: UserPlus, count: pendingUsersCount },
    { id: 'approved_students', label: 'অ্যাপ্রুভ স্টুডেন্ট', icon: UserCheck, count: approvedStudentsCount },
    { id: 'in_review', label: 'রিভিউ চলছে', icon: Clock, count: inReviewCount },
    { id: 'approved', label: 'অনুমোদিত রিফান্ড', icon: CheckCircle2, count: approvedCount },
    { id: 'rejected', label: 'প্রত্যাখ্যাত রিফান্ড', icon: XCircle, count: rejectedCount },
    { id: 'completed', label: 'সম্পন্ন রিফান্ড', icon: Check, count: completedCount },
    { id: 'support_video', label: 'সাপোর্ট ভিডিও লিংক', icon: Youtube },
    { id: 'users', label: 'সকল ইউজার ও স্টাফ', icon: Users, count: users.length },
    { id: 'settings', label: 'সেটিংস', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-left">
      
      {/* ================= ADMIN NAVIGATION (DESKTOP SIDEBAR & MOBILE HORIZONTAL TABS) ================= */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        
        {/* Admin Brand */}
        <div className="p-3.5 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-sm shadow-xs">
              UE
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-white leading-tight">
                অ্যাডমিন প্যানেল
              </div>
              <div className="text-[10px] text-emerald-400 font-medium">
                {currentUser.fullName}
              </div>
            </div>
          </div>
          
          {/* Mobile Logout Quick Icon */}
          <button
            id="admin-mobile-logout-btn"
            onClick={onLogout}
            title="লগআউট"
            className="md:hidden p-2 text-rose-400 hover:text-rose-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Vertical Nav & Mobile Horizontal Scroll Nav */}
        <nav className="p-2 sm:p-3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto no-scrollbar whitespace-nowrap md:whitespace-normal flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`admin-nav-${item.id}`}
                onClick={() => { setActiveTab(item.id); setSelectedRequest(null); }}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 md:w-full ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Desktop Sidebar Logout Button */}
        <div className="hidden md:block p-3 border-t border-slate-800">
          <button
            id="admin-sidebar-logout-btn"
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {navItems.find(i => i.id === activeTab)?.label || 'অ্যাডমিন ড্যাশবোর্ড'}
            </h1>
            <p className="text-xs text-slate-500">
              ইউনিটি আর্নিং প্ল্যাটফর্মের রিফান্ড রিকোয়েস্ট ও স্টুডেন্ট ডাটাবেজ
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="admin-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="আইডি, নাম বা ফোন নম্বর খুঁজুন..."
                className="pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none w-56 sm:w-64"
              />
            </div>

            <select
              id="admin-method-filter"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">সকল পেমেন্ট মাধ্যম</option>
              <option value="bkash">বিকাশ</option>
              <option value="nagad">নগদ</option>
              <option value="rocket">রকেট</option>
              <option value="binance">Binance</option>
              <option value="bank">ব্যাংক</option>
            </select>
          </div>
        </div>

        {/* ================= PROMINENT NEW PENDING REFUND ALERT BANNER ================= */}
        {pendingCount > 0 && activeTab !== 'pending' && (
          <div className="mb-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <div className="font-bold text-sm sm:text-base flex items-center gap-2">
                  <span>নতুন রিফান্ড আবেদন জমা পড়েছে!</span>
                  <span className="bg-white text-orange-950 px-2.5 py-0.5 rounded-full text-xs font-mono font-black shadow-xs">
                    {pendingCount}টি আবেদন পেন্ডিং
                  </span>
                </div>
                <p className="text-xs text-orange-100 mt-0.5">
                  শিক্ষার্থীদের প্রেরিত পেমেন্ট স্ক্রিনশট, TrxID ও আবেদনপত্র যাচাই করে অনুমোদন বা প্রসেস করুন।
                </p>
              </div>
            </div>
            <button
              onClick={() => { setActiveTab('pending'); setSelectedRequest(null); }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-orange-50 text-orange-900 font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>পেন্ডিং রিফান্ড তালিকায় যান ({pendingCount})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Overview KPIs (Shown in dashboard tab) */}
        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 block">মোট আবেদন</span>
                <span className="text-2xl font-black text-slate-900 font-mono">{totalCount}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs">
                <span className="text-[11px] font-semibold text-amber-700 block">রিভিউ চলছে</span>
                <span className="text-2xl font-black text-amber-600 font-mono">{inReviewCount + pendingCount}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-teal-200 shadow-2xs">
                <span className="text-[11px] font-semibold text-teal-700 block">অনুমোদিত</span>
                <span className="text-2xl font-black text-teal-600 font-mono">{approvedCount}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-2xs">
                <span className="text-[11px] font-semibold text-rose-700 block">প্রত্যাখ্যাত</span>
                <span className="text-2xl font-black text-rose-600 font-mono">{rejectedCount}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs col-span-2 lg:col-span-1">
                <span className="text-[11px] font-semibold text-emerald-700 block">পরিশোধিত অর্থ</span>
                <span className="text-xl font-black text-emerald-700 font-mono">৳ {totalRefundedAmount.toLocaleString('bn-BD')}</span>
              </div>
            </div>

            {/* Quick YouTube Support Video Card on Admin Overview */}
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white border border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shrink-0">
                  <Youtube className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">সক্রিয় ইউটিউব সাপোর্ট ভিডিও লিংক</span>
                    <span className="text-[9px] bg-red-500/30 text-red-300 font-mono font-bold px-1.5 py-0.5 rounded border border-red-500/40">লাইভ</span>
                  </div>
                  <div className="text-xs text-slate-300 font-mono truncate max-w-xs sm:max-w-md mt-0.5">
                    {videoUrlInput || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={videoUrlInput || 'https://www.youtube.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>ভিডিওটি টেস্ট দেখুন</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => setActiveTab('support_video')}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer"
                >
                  <Settings className="w-3 h-3" />
                  <span>লিংক পরিবর্তন করুন</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ================= PENDING REGISTRATIONS REQUESTS TAB ================= */}
        {activeTab === 'pending_requests' ? (
          <div className="space-y-4">
            {/* Sleek Compact Header Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      পেন্ডিং রেজিস্ট্রেশন তালিকা
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 font-mono">
                      {pendingUsers.length} জন অপেক্ষমান
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    আবেদনকারীর তথ্য যাচাই করুন, অনুমোদন (অ্যাকসেপ্ট) দিন অথবা পাসওয়ার্ড পরিচালনা করুন
                  </p>
                </div>
              </div>
              <div className="text-xs text-slate-400 font-medium">
                অ্যাকসেপ্ট করলেই শিক্ষার্থী অবিলম্বে সিস্টেমে লগইন করতে পারবে
              </div>
            </div>

            {/* Pending Requests Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                    অপেক্ষমান আবেদনকারী তালিকা ({pendingUsers.length})
                  </h3>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  এক নজরে সকল শিক্ষার্থীর তথ্য ও কার্যক্রম
                </div>
              </div>

              {pendingUsers.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5 border border-emerald-100">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">কোনো পেন্ডিং রিকোয়েস্ট নেই</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    বর্তমানে কোনো শিক্ষার্থী অনুমোদনের অপেক্ষায় নেই। নতুন কেউ রেজিস্ট্রেশন করলে এখানে তাৎক্ষণিক প্রদর্শিত হবে।
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase">
                      <tr>
                        <th className="py-3 px-3.5 whitespace-nowrap">স্টুডেন্ট আইডি</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">শিক্ষার্থীর নাম ও ঠিকানা</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">যোগাযোগ</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">টিম লিডার ও ট্রেনার</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">পাসওয়ার্ড</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">স্ট্যাটাস</th>
                        <th className="py-3 px-3.5 text-right whitespace-nowrap">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-emerald-50/30 transition-colors">
                          {/* Student ID */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap font-mono font-bold text-slate-900">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-900 text-xs">
                              {u.studentId || 'N/A'}
                            </span>
                          </td>

                          {/* Full Name & Address */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap">
                            <span className="font-bold text-slate-900 mr-2 text-xs">{u.fullName}</span>
                            {u.address && (
                              <span className="text-[11px] text-slate-500 font-normal">
                                • {u.address}
                              </span>
                            )}
                          </td>

                          {/* Contact Info */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap font-mono text-xs">
                            <a 
                              href={`https://wa.me/${u.whatsapp?.replace(/[^0-9]/g, '')}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="hover:underline text-emerald-700 font-semibold inline-flex items-center gap-1 mr-2"
                            >
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{u.whatsapp}</span>
                            </a>
                            <span className="text-[11px] text-slate-400 font-sans">
                              ({u.email})
                            </span>
                          </td>

                          {/* Team Leader & Trainer */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap text-[11px] text-slate-700">
                            <span>TL: <strong className="text-slate-900">{u.teamLeaderName || '—'}</strong></span>
                            <span className="mx-1.5 text-slate-300">|</span>
                            <span>Tr: {u.teamTrainerName || '—'}</span>
                          </td>

                          {/* Password Display / Quick View */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-slate-800 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-semibold">
                                {u.password ? u.password : '••••••••'}
                              </span>
                              <button
                                onClick={() => handleOpenChangePasswordModal(u)}
                                title="পাসওয়ার্ড পরিবর্তন করুন"
                                className="p-1 rounded hover:bg-amber-50 text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 font-bold text-[11px]">
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>পেন্ডিং</span>
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View All Details */}
                              <button
                                onClick={() => {
                                  setSelectedUserForDetails(u);
                                  setShowUserPasswordInModal(false);
                                }}
                                className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1 transition-colors border border-slate-200 cursor-pointer"
                                title="সম্পূর্ণ তথ্য দেখুন"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-600" />
                                <span>ভিউ</span>
                              </button>

                              {/* Accept Registration Button */}
                              <button
                                onClick={() => handleAcceptUser(u)}
                                className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                                title="অ্যাকসেপ্ট করুন"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>অ্যাকসেপ্ট</span>
                              </button>

                              {/* Change Password */}
                              <button
                                onClick={() => handleOpenChangePasswordModal(u)}
                                className="p-1.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs transition-colors cursor-pointer"
                                title="পাসওয়ার্ড পরিবর্তন করুন"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete User */}
                              <button
                                onClick={() => handleOpenDeleteUserModal(u)}
                                className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs transition-colors cursor-pointer"
                                title="ডাটা ডিলিট করুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'approved_students' ? (
          /* ================= APPROVED STUDENTS TAB VIEW ================= */
          <div className="space-y-4">
            {/* Sleek Compact Header Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      অনুমোদিত শিক্ষার্থীদের তালিকা
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 text-xs font-bold border border-teal-200 font-mono">
                      {approvedStudents.length} জন সক্রিয়
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    অনুমোদিত শিক্ষার্থীদের প্রোফাইল, পাসওয়ার্ড পরিচালনা ও তাদের রিফান্ড ফাইলের অগ্রগতি
                  </p>
                </div>
              </div>
              
              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={approvedStudentSearch}
                  onChange={(e) => setApprovedStudentSearch(e.target.value)}
                  placeholder="নাম, আইডি বা নম্বর..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50/50"
                />
              </div>
            </div>

            {/* Approved Students Content Container */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                    সক্রিয় শিক্ষার্থী তালিকা ({approvedStudents.length})
                  </h3>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  এক লাইনে সকল শিক্ষার্থীর তথ্য
                </div>
              </div>

              {/* Students List Table */}
              {approvedStudents.filter(u => {
                if (!approvedStudentSearch.trim()) return true;
                const q = approvedStudentSearch.toLowerCase().trim();
                return (
                  u.fullName.toLowerCase().includes(q) ||
                  u.studentId?.toLowerCase().includes(q) ||
                  u.whatsapp?.includes(q) ||
                  u.email?.toLowerCase().includes(q)
                );
              }).length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2.5">
                    <Users className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">কোনো অনুমোদিত শিক্ষার্থী পাওয়া যায়নি</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {approvedStudentSearch
                      ? 'আপনার খোঁজার সাথে কোনো শিক্ষার্থীর তথ্য মেলেনি।'
                      : 'পেন্ডিং রেজিস্ট্রেশন ট্যাব থেকে আবেদন অ্যাপ্রুভ করলে তারা এখানে প্রদর্শিত হবে।'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase">
                      <tr>
                        <th className="py-3 px-3.5 whitespace-nowrap">স্টুডেন্ট আইডি</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">শিক্ষার্থীর নাম ও তথ্য</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">যোগাযোগ</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">টিম লিডার ও ট্রেনার</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">পাসওয়ার্ড</th>
                        <th className="py-3 px-3.5 whitespace-nowrap">রিফান্ড ফাইল</th>
                        <th className="py-3 px-3.5 text-right whitespace-nowrap">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {approvedStudents
                        .filter(u => {
                          if (!approvedStudentSearch.trim()) return true;
                          const q = approvedStudentSearch.toLowerCase().trim();
                          return (
                            u.fullName.toLowerCase().includes(q) ||
                            u.studentId?.toLowerCase().includes(q) ||
                            u.whatsapp?.includes(q) ||
                            u.email?.toLowerCase().includes(q)
                          );
                        })
                        .map((u) => {
                          const studentRefundReq = requests.find(
                            r => r.studentId === u.studentId || r.whatsapp === u.whatsapp
                          );

                          return (
                            <tr key={u.id} className="hover:bg-teal-50/20 transition-colors">
                              {/* Student ID */}
                              <td className="py-2.5 px-3.5 whitespace-nowrap font-mono font-bold text-slate-900">
                                <span className="px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 text-xs">
                                  {u.studentId || 'N/A'}
                                </span>
                              </td>

                              {/* Full Name & Address */}
                              <td className="py-2.5 px-3.5 whitespace-nowrap">
                                <span className="font-bold text-slate-900 mr-2 text-xs">{u.fullName}</span>
                                {u.address && (
                                  <span className="text-[11px] text-slate-500 font-normal">
                                    • {u.address}
                                  </span>
                                )}
                              </td>

                              {/* Contact */}
                              <td className="py-2.5 px-3.5 whitespace-nowrap font-mono text-xs">
                                <a 
                                  href={`https://wa.me/${u.whatsapp?.replace(/[^0-9]/g, '')}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="hover:underline text-emerald-700 font-semibold inline-flex items-center gap-1 mr-2"
                                >
                                  <Phone className="w-3 h-3 text-emerald-600" />
                                  <span>{u.whatsapp}</span>
                                </a>
                                <span className="text-[11px] text-slate-400 font-sans">
                                  ({u.email})
                                </span>
                              </td>

                              {/* Team Leader & Trainer */}
                              <td className="py-2.5 px-3.5 whitespace-nowrap text-[11px] text-slate-700">
                                <span>TL: <strong className="text-slate-900">{u.teamLeaderName || '—'}</strong></span>
                                <span className="mx-1.5 text-slate-300">|</span>
                                <span>Tr: {u.teamTrainerName || '—'}</span>
                              </td>

                              {/* Password */}
                              <td className="py-2.5 px-3.5 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-slate-800 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-semibold">
                                    {u.password || '••••••••'}
                                  </span>
                                  <button
                                    onClick={() => handleOpenChangePasswordModal(u)}
                                    title="পাসওয়ার্ড পরিবর্তন করুন"
                                    className="p-1 rounded hover:bg-amber-50 text-slate-500 hover:text-amber-600 transition-colors cursor-pointer"
                                  >
                                    <KeyRound className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>

                              {/* Refund Status */}
                              <td className="py-2.5 px-3.5 whitespace-nowrap">
                                {studentRefundReq ? (
                                  <button
                                    onClick={() => {
                                      setSelectedRequest(studentRefundReq);
                                      setActiveTab('all');
                                      setSearchQuery(studentRefundReq.studentId || studentRefundReq.whatsapp || '');
                                    }}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-[11px] transition-colors cursor-pointer"
                                  >
                                    <FileText className="w-3 h-3 text-blue-600" />
                                    <span>{studentRefundReq.amount}৳ ({studentRefundReq.status})</span>
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-slate-400">
                                    কোনো রিফান্ড ফাইল নেই
                                  </span>
                                )}
                              </td>

                              {/* Action Buttons */}
                              <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* View All Details */}
                                  <button
                                    onClick={() => {
                                      setSelectedUserForDetails(u);
                                      setShowUserPasswordInModal(false);
                                    }}
                                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1 transition-colors border border-slate-200 cursor-pointer"
                                    title="সম্পূর্ণ তথ্য দেখুন"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                                    <span>ভিউ</span>
                                  </button>

                                  {/* Change Password */}
                                  <button
                                    onClick={() => handleOpenChangePasswordModal(u)}
                                    className="p-1.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs transition-colors cursor-pointer"
                                    title="পাসওয়ার্ড পরিবর্তন করুন"
                                  >
                                    <KeyRound className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Delete User */}
                                  <button
                                    onClick={() => handleOpenDeleteUserModal(u)}
                                    className="p-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs transition-colors cursor-pointer"
                                    title="ডাটা ডিলিট করুন"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'users' ? (
          /* ================= ALL USERS TAB VIEW ================= */
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-0">
            
            {/* Tab Header & Filter Pills */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/60">
              <div>
                <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  সকল নিবন্ধিত শিক্ষার্থী ও কর্মকর্তা তালিকা
                </h2>
                <p className="text-xs text-slate-500">ডাটাবেজে সংরক্ষিত সমস্ত ব্যবহারকারীর বিস্তারিত তালিকা</p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setUserStatusFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    userStatusFilter === 'all'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  সকল ({users.length})
                </button>
                <button
                  onClick={() => setUserStatusFilter('pending')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    userStatusFilter === 'pending'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  পেন্ডিং ({pendingUsers.length})
                </button>
                <button
                  onClick={() => setUserStatusFilter('approved')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    userStatusFilter === 'approved'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  অনুমোদিত ({users.filter(u => u.status === 'approved').length})
                </button>
                <button
                  onClick={() => setUserStatusFilter('rejected')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    userStatusFilter === 'rejected'
                      ? 'bg-rose-600 text-white font-bold'
                      : 'text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  প্রত্যাখ্যাত ({users.filter(u => u.status === 'rejected').length})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">স্টুডেন্ট আইডি</th>
                    <th className="p-3.5">শিক্ষার্থীর নাম</th>
                    <th className="p-3.5">হোয়াটসঅ্যাপ ও ইমেইল</th>
                    <th className="p-3.5">টিম লিডার ও ট্রেনার</th>
                    <th className="p-3.5">পাসওয়ার্ড</th>
                    <th className="p-3.5">স্ট্যাটাস</th>
                    <th className="p-3.5 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users
                    .filter((u) => {
                      if (userStatusFilter !== 'all' && u.status !== userStatusFilter) return false;
                      if (searchQuery.trim()) {
                        const q = searchQuery.toLowerCase();
                        return (
                          u.fullName.toLowerCase().includes(q) ||
                          u.studentId.toLowerCase().includes(q) ||
                          u.whatsapp.includes(q) ||
                          u.email.toLowerCase().includes(q) ||
                          (u.teamLeaderName && u.teamLeaderName.toLowerCase().includes(q)) ||
                          (u.teamTrainerName && u.teamTrainerName.toLowerCase().includes(q))
                        );
                      }
                      return true;
                    })
                    .map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {u.studentId}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{u.fullName}</div>
                        <div className="text-[10px] text-slate-500">{u.role === 'student' ? 'শিক্ষার্থী' : 'অফিসিয়াল স্টাফ'}</div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700">
                        <div>{u.whatsapp}</div>
                        <div className="text-[10px] text-slate-500">{u.email}</div>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <div className="text-[11px]">TL: <strong className="text-slate-800">{u.teamLeaderName || '-'}</strong></div>
                        <div className="text-[11px]">Tr: {u.teamTrainerName || '-'}</div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                            {u.password || '••••••'}
                          </span>
                          <button
                            onClick={() => handleOpenChangePasswordModal(u)}
                            title="পাসওয়ার্ড পরিবর্তন"
                            className="p-1 text-slate-400 hover:text-amber-600"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="p-3.5">
                        {u.status === 'pending' ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-200">
                            পেন্ডিং
                          </span>
                        ) : u.status === 'rejected' ? (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-200">
                            প্রত্যাখ্যাত
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                            অনুমোদিত
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedUserForDetails(u);
                              setShowUserPasswordInModal(false);
                            }}
                            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 border border-slate-200"
                          >
                            <Eye className="w-3 h-3" />
                            ভিউ
                          </button>
                          {u.status === 'pending' && currentUser.role === 'admin' && (
                            <button
                              onClick={() => handleAcceptUser(u)}
                              className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
                            >
                              <Check className="w-3 h-3" />
                              অ্যাকসেপ্ট
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenChangePasswordModal(u)}
                            className="p-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[11px]"
                            title="পাসওয়ার্ড চেঞ্জ"
                          >
                            <KeyRound className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteUserModal(u)}
                            className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px]"
                            title="ডাটা ডিলিট"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (activeTab === 'settings' || activeTab === 'support_video') ? (
          /* Support Video & Settings Tab */
          <div className="space-y-6 max-w-4xl">
            {/* Top YouTube Video Manager Banner */}
            <div className="bg-gradient-to-r from-red-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-red-950/50 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
                <Youtube className="w-72 h-72 text-red-500" />
              </div>

              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold mb-3">
                  <Youtube className="w-4 h-4 text-red-400" />
                  <span>লাইভ ইউটিউব সাপোর্ট ভিডিও লিংক ম্যানেজার</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  অফিসিয়াল সাপোর্ট ও টিউটোরিয়াল ভিডিও লিংক
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                  এখানে আপনি যে YouTube ভিডিও লিংক সাবমিট করবেন, ওয়েবসাইটের হেডারে থাকা 
                  <strong className="text-red-300 font-bold"> "সাপোর্ট ভিডিও" </strong> 
                  আইকনে ক্লিক করলে শিক্ষার্থীরা সরাসরি সেই ভিডিও দেখতে পারবে।
                </p>
              </div>
            </div>

            {/* Video Form & Live Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Form Config Box */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <form onSubmit={handleSaveSettings} className="space-y-4 text-xs sm:text-sm">
                  
                  {/* YouTube URL input */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1.5">
                      ইউটিউব ভিডিও ইউআরএল (YouTube Video URL) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Youtube className="w-5 h-5 absolute left-3.5 top-3 text-red-600" />
                      <input 
                        id="admin-support-video-url-input"
                        type="url" 
                        value={videoUrlInput}
                        onChange={(e) => setVideoUrlInput(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..." 
                        required
                        className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-slate-300 font-mono text-xs sm:text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 focus:outline-none transition-all" 
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      যেকোনো সাধারণ YouTube ভিডিও লিংক (যেমন: <code className="text-slate-700 bg-slate-100 px-1 rounded">https://youtu.be/...</code> বা <code className="text-slate-700 bg-slate-100 px-1 rounded">https://youtube.com/watch?v=...</code>) দিন।
                    </p>
                  </div>

                  {/* Video Title */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1.5">
                      ভিডিওর শিরোনাম (Title / Label)
                    </label>
                    <input 
                      id="admin-support-video-title-input"
                      type="text" 
                      value={videoTitleInput}
                      onChange={(e) => setVideoTitleInput(e.target.value)}
                      placeholder="রিফান্ড আবেদন ও ট্র্যাকিং সম্পর্কিত অফিসিয়াল ভিডিও গাইডলাইন" 
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium" 
                    />
                  </div>

                  {/* Telegram Support Link */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1.5">
                      অফিশিয়াল টেলিগ্রাম সাপোর্ট লিংক (Telegram URL)
                    </label>
                    <input 
                      id="admin-telegram-url-input"
                      type="url" 
                      value={telegramUrlInput}
                      onChange={(e) => setTelegramUrlInput(e.target.value)}
                      placeholder="https://t.me/unityearning12" 
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 font-mono text-xs sm:text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all" 
                    />
                  </div>

                  {/* Support Email */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1.5">
                      অফিশিয়াল সাপোর্ট ইমেইল (Support Email)
                    </label>
                    <input 
                      id="admin-support-email-input"
                      type="email" 
                      value={supportEmailInput}
                      onChange={(e) => setSupportEmailInput(e.target.value)}
                      placeholder="unityearning13@gmail.com" 
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 font-mono text-xs sm:text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all" 
                    />
                  </div>

                  {/* Helpline Number */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1.5">
                      অফিশিয়াল হেল্পলাইন নম্বর / যোগাযোগ
                    </label>
                    <input 
                      id="admin-helpline-input"
                      type="text" 
                      value={helplineInput}
                      onChange={(e) => setHelplineInput(e.target.value)}
                      placeholder="+880 1700-000000" 
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 font-mono text-xs sm:text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all" 
                    />
                  </div>

                  {/* Max Review Days */}
                  <div>
                    <label className="block font-bold text-slate-900 mb-1.5">
                      সর্বোচ্চ রিভিউ ও সমাধান সময়সীমা (দিন)
                    </label>
                    <input 
                      id="admin-max-days-input"
                      type="number" 
                      value={maxDaysInput}
                      onChange={(e) => setMaxDaysInput(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 font-mono text-xs sm:text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all" 
                    />
                  </div>

                  {/* Success Alert */}
                  {saveSuccessMsg && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>ইউটিউব সাপোর্ট ভিডিও লিংক সফলভাবে সাবমিট ও সেভ হয়েছে! সমস্ত শিক্ষার্থীরা এখন এই লিংকটি দেখতে পারবেন।</span>
                    </motion.div>
                  )}

                  {/* Submit Action Buttons */}
                  <div className="pt-3 flex flex-wrap items-center gap-3">
                    <button 
                      id="admin-submit-video-btn"
                      type="submit" 
                      disabled={isSavingSettings}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 text-emerald-400" />
                      <span>{isSavingSettings ? 'সংরক্ষণ হচ্ছে...' : 'ভিডিও লিংক সাবমিট ও সংরক্ষণ করুন'}</span>
                    </button>

                    <a
                      id="admin-test-video-open-btn"
                      href={videoUrlInput || 'https://www.youtube.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs sm:text-sm border border-red-200 transition-colors cursor-pointer"
                      title="নতুন ট্যাবে ভিডিওটি টেস্ট ওপেন করুন"
                    >
                      <Youtube className="w-4 h-4 text-red-600" />
                      <span>ভিডিওটি টেস্ট দেখুন</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </form>
              </div>

              {/* Live Preview Box */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-red-600 fill-current" />
                    লাইভ ভিডিও প্রিভিউ
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                    YouTube Embed
                  </span>
                </div>

                <div className="bg-slate-950 rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center border border-slate-800 shadow-inner">
                  {getYouTubeVideoId(videoUrlInput) ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${getYouTubeVideoId(videoUrlInput)}`}
                      title="YouTube Video Preview"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="p-6 text-center text-slate-400 space-y-2">
                      <Youtube className="w-12 h-12 text-slate-600 mx-auto" />
                      <p className="text-xs">একটি সঠিক YouTube লিংক দিলে এখানে লাইভ প্রিভিউ প্রদর্শিত হবে।</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800">লিংক স্ট্যাটাস:</div>
                  <div className="font-mono text-[10px] text-slate-500 truncate">{videoUrlInput}</div>
                  <div className="text-emerald-700 font-semibold pt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    রিয়েল-টাইমে সকল ডিভাইসের সাথে সিঙ্ক হচ্ছে
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* Table of Refund Requests */
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase">
                  <tr>
                    <th className="py-3 px-3.5 whitespace-nowrap">আইডি ও তারিখ</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">শিক্ষার্থীর তথ্য</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">পেমেন্ট স্ক্রিনশট ও TrxID</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">হাতে লেখা দরখাস্ত</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">রিফান্ডের কারণ</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">পরিমাণ ও মাধ্যম</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">বর্তমান ধাপ</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">স্ট্যাটাস</th>
                    <th className="py-3 px-3.5 text-right whitespace-nowrap">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        কোনো রিফান্ড আবেদন পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((req) => {
                      const stageDef = getStageDetails(req.currentStageId);
                      const isRejected = req.status === 'rejected';
                      const isCompleted = req.status === 'completed';
                      const { daysPassed, daysRemaining, isExpired } = calculateReviewTimeline(req.submissionDate, 20);

                      return (
                        <tr 
                          key={req.id} 
                          className={`hover:bg-slate-50/80 transition-colors ${
                            selectedRequest?.id === req.id ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          {/* Request ID & 20-day Timeline */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap font-mono font-bold text-slate-900">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800 text-xs">
                              {req.id}
                            </span>
                            <span className="text-[10px] text-slate-500 block mt-0.5 font-sans">{req.submissionDate}</span>
                            <span className={`inline-block text-[10px] font-sans font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                              isExpired && !isCompleted && !isRejected
                                ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {isExpired ? '২০ দিন শেষ' : `${daysPassed}/২০ দিন`}
                            </span>
                          </td>

                          {/* Student Info & Team Details */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <div className="font-bold text-slate-900 text-xs">{req.fullName}</div>
                              <button
                                id={`admin-view-sub-${req.id}`}
                                onClick={() => {
                                  setDetailsModalRequest(req);
                                  setIsApplicationDetailsModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-bold text-[10px] transition-colors cursor-pointer shadow-2xs"
                                title="শিক্ষার্থীর সাবমিটকৃত সকল তথ্য দেখুন (ভিউ)"
                              >
                                <Eye className="w-3 h-3 text-emerald-700" />
                                <span>ভিউ</span>
                              </button>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              ID: {req.studentId} • {req.whatsapp}
                            </div>
                            <div className="text-[10px] text-teal-800 font-medium mt-0.5">
                              TL: <strong className="text-slate-900">{req.teamLeaderName || '—'}</strong>
                              {req.teamTrainerName && <span> • Tr: {req.teamTrainerName}</span>}
                            </div>
                          </td>

                          {/* Payment Proof Screenshot & TrxID */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                                  {req.paidMethod || 'পেমেন্ট'}
                                </span>
                                <span className="font-mono font-bold text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  {req.paymentTransactionId || req.transactionId || 'TrxID নেই'}
                                </span>
                              </div>
                              {req.paymentProofUrl ? (
                                <div className="flex items-center gap-1.5">
                                  <img
                                    src={req.paymentProofUrl}
                                    alt="Payment Screenshot"
                                    className="w-8 h-8 rounded-lg object-cover border border-slate-200 cursor-pointer hover:ring-2 hover:ring-emerald-500 shadow-2xs"
                                    onClick={() => setZoomedImageUrl(req.paymentProofUrl || null)}
                                    title="ক্লিক করে বড় করে দেখুন"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setZoomedImageUrl(req.paymentProofUrl || null)}
                                    className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold hover:underline cursor-pointer"
                                  >
                                    স্ক্রিনশট ভিউ
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 block">স্ক্রিনশট নেই</span>
                              )}
                            </div>
                          </td>

                          {/* Handwritten Application Badge */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap">
                            {req.handwrittenApplicationUrl ? (
                              <button
                                onClick={() => {
                                  setDetailsModalRequest(req);
                                  setIsApplicationDetailsModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[11px] transition-colors cursor-pointer"
                                title="হাতে লেখা আবেদন পত্র দেখুন"
                              >
                                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                                <span>দরখাস্ত সংযুক্ত</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-400 text-[11px]">
                                দরখাস্ত নেই
                              </span>
                            )}
                          </td>

                          {/* Reason Detail */}
                          <td className="py-2.5 px-3.5 max-w-xs">
                            <div className="text-xs text-slate-800 font-medium truncate" title={req.reasonDetail}>
                              {req.reasonDetail || 'রিফান্ডের কারণ উল্লেখ করা হয়নি'}
                            </div>
                          </td>

                          {/* Amount & Method */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap">
                            <span className="font-bold text-emerald-700 font-mono text-xs">
                              ৳ {req.amount.toLocaleString('bn-BD')}
                            </span>
                            <span className="text-[11px] text-slate-500 block uppercase">
                              {req.payoutMethod}: {req.payoutAccount}
                            </span>
                          </td>

                          {/* Current Stage */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap">
                            <span className="font-semibold text-slate-800 text-xs block">
                              {stageDef?.titleBn || req.currentStageId}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              দায়িত্ব: {stageDef?.responsibleRoleBn}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-2.5 px-3.5 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-block ${
                              isRejected
                                ? 'bg-rose-100 text-rose-800'
                                : isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : req.status === 'approved'
                                ? 'bg-teal-100 text-teal-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isRejected
                                ? 'প্রত্যাখ্যাত'
                                : isCompleted
                                ? 'সম্পন্ন'
                                : req.status === 'issued'
                                ? 'অর্থ ইস্যু'
                                : req.status === 'approved'
                                ? 'অনুমোদিত'
                                : 'চলমান'}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                id={`admin-view-details-btn-${req.id}`}
                                onClick={() => {
                                  setDetailsModalRequest(req);
                                  setIsApplicationDetailsModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                                title="শিক্ষার্থীর সাবমিট করা সকল তথ্য দেখুন (ভিউ)"
                              >
                                <Eye className="w-3.5 h-3.5 text-emerald-700" />
                                <span>ভিউ</span>
                              </button>

                              <button
                                id={`admin-view-req-${req.id}`}
                                onClick={() => setSelectedRequest(req)}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                              >
                                <span>রিভিউ</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* ================= REQUEST DETAILS & ACTION DRAWER / MODAL ================= */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-end p-0 sm:p-4">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-2xl bg-white h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-left"
          >
            {/* Drawer Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-emerald-400">{selectedRequest.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    selectedRequest.status === 'rejected'
                      ? 'bg-rose-500 text-white'
                      : selectedRequest.status === 'completed'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-400 text-slate-950'
                  }`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedRequest.fullName} - রিফান্ড ফাইল
                </h3>
              </div>

              <button
                id="drawer-close-btn"
                onClick={() => setSelectedRequest(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
              
              {/* Action Buttons Toolbar */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-700 uppercase block mb-2">
                  অ্যাডমিন অ্যাকশন কন্ট্রোল:
                </span>
                <div className="flex flex-wrap gap-2">
                  
                  {/* View All Details Button */}
                  <button
                    id="btn-open-details-modal-drawer"
                    onClick={() => {
                      setDetailsModalRequest(selectedRequest);
                      setIsApplicationDetailsModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>শিক্ষার্থীর পূর্ণ আবেদন ভিউ (View)</span>
                  </button>

                  {/* Start Review */}
                  {selectedRequest.status === 'pending' && (
                    <button
                      id="btn-start-review"
                      onClick={() => handleStartReview(selectedRequest)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      রিভিউ শুরু করুন
                    </button>
                  )}

                  {/* Advance to Next Stage */}
                  {selectedRequest.status !== 'rejected' && selectedRequest.status !== 'completed' && selectedRequest.currentStageId !== 'policy_team_review' && (
                    <button
                      id="btn-advance-stage"
                      onClick={() => handleAdvanceStage(selectedRequest)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>পরবর্তী ধাপে পাঠান</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Approve */}
                  {selectedRequest.status !== 'approved' && selectedRequest.status !== 'completed' && selectedRequest.status !== 'rejected' && (
                    <button
                      id="btn-approve-req"
                      onClick={() => handleDirectApprove(selectedRequest)}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>অনুমোদন করুন</span>
                    </button>
                  )}

                  {/* Issue Payout */}
                  {(selectedRequest.status === 'approved' || selectedRequest.currentStageId === 'approved') && selectedRequest.status !== 'completed' && (
                    <button
                      id="btn-issue-payout"
                      onClick={() => setIssueModalOpen(true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>রিফান্ড ইস্যু করুন</span>
                    </button>
                  )}

                  {/* Reject */}
                  {selectedRequest.status !== 'rejected' && selectedRequest.status !== 'completed' && (
                    <button
                      id="btn-reject-req"
                      onClick={() => {
                        setRejectionReasonInput('আমরা আপনার এই আবেদনের কোনো স্পষ্ট কারণ পাইনি। আপনি যে কারণ দেখিয়েছেন তা কোম্পানির শর্তাবলী বহির্ভূত, তাই কোম্পানি থেকে আপনার রিফান্ড রিকোয়েস্টটি রিজেক্ট করা হয়েছে। দুঃখিত। যদি তারপরও আপনার কোনো সমস্যা থাকে তাহলে আমাদের ইমেইল অথবা টেলিগ্রামে যোগাযোগ করুন।');
                        setRejectModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>প্রত্যাখ্যান করুন</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Prominent Reason for Refund Highlight Card */}
              <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200 shadow-2xs space-y-2 text-left">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-slate-900 font-extrabold text-xs flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>কেন রিফান্ড রিকোয়েস্ট পাঠিয়েছে (আবেদনের মূল কারণ ও বিবরণ):</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-950 font-bold text-[11px] border border-emerald-300">
                    {selectedRequest.reasonCategory || 'সাধারণ রিফান্ড'}
                  </span>
                </div>
                <p className="text-slate-900 text-xs sm:text-sm leading-relaxed font-semibold bg-white p-3 rounded-lg border border-emerald-200 whitespace-pre-wrap">
                  {selectedRequest.reasonDetail || 'কোনো কারণ উল্লেখ করা হয়নি।'}
                </p>
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => {
                      setDetailsModalRequest(selectedRequest);
                      setIsApplicationDetailsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg border border-emerald-300 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3 h-3 text-emerald-700" />
                    <span>সকল সাবমিটকৃত তথ্য দেখুন (সম্পূর্ণ ভিউ)</span>
                  </button>
                </div>
              </div>

              {/* Handwritten Application / Uploaded Document */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                  <span className="text-slate-900 font-bold text-xs flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>হাতে লেখা দরখাস্ত (সংযুক্ত কপি)</span>
                  </span>
                  {selectedRequest.handwrittenApplicationUrl && (
                    <a
                      href={selectedRequest.handwrittenApplicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:text-emerald-800 font-bold text-xs flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>নতুন ট্যাবে বড় করে দেখুন</span>
                    </a>
                  )}
                </div>

                {selectedRequest.handwrittenApplicationUrl ? (
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 overflow-hidden text-center">
                    <img
                      src={selectedRequest.handwrittenApplicationUrl}
                      alt="Handwritten Application"
                      className="max-h-80 w-full object-contain rounded border border-slate-200 bg-white hover:opacity-95 transition-opacity cursor-pointer mx-auto"
                      onClick={() => window.open(selectedRequest.handwrittenApplicationUrl, '_blank')}
                      title="ক্লিক করে বড় করে দেখুন"
                    />
                    <span className="text-[11px] text-slate-400 block mt-1.5">
                      ছবিতে ক্লিক করে বা উপরের লিংকে ক্লিক করে পূর্ণ স্ক্রিনে যাচাই করুন
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-800 text-xs font-medium">
                    কোনো হাতে লেখা আবেদন পত্রের ছবি সংযুক্ত করা হয়নি।
                  </div>
                )}
              </div>

              {/* Reason Detail */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-900 font-bold block text-xs mb-2">
                  শিক্ষার্থীর লিখিত কারণ ও বিস্তারিত পরিস্থিতি:
                </span>
                <p className="text-slate-800 text-xs sm:text-sm leading-relaxed font-medium bg-slate-50 p-3 rounded-lg border border-slate-200 whitespace-pre-wrap">
                  {selectedRequest.reasonDetail || 'কোনো কারণ উল্লেখ করা হয়নি।'}
                </p>
              </div>

              {/* 20-Day Review Timeline & Auto-Reject Tracker */}
              {(() => {
                const { daysPassed, daysRemaining, isExpired } = calculateReviewTimeline(selectedRequest.submissionDate, 20);
                return (
                  <div className={`p-4 rounded-xl border text-xs ${
                    isExpired
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : 'bg-amber-50/70 border-amber-200 text-amber-950'
                  }`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>২০ দিনের রিভিউ সময়সীমা ও অটো-রিজেকশন ট্র্যাকার</span>
                      </span>
                      <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                        isExpired ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-white text-slate-800 border border-slate-200'
                      }`}>
                        {isExpired ? '২০ দিন শেষ (অটো-রিজেক্ট)' : `${daysPassed} দিন অতিক্রান্ত • বাকি ${daysRemaining} দিন`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {isExpired 
                        ? 'নির্ধারিত ২০ দিনের সময়সীমা পার হওয়ায় সিস্টেম পলিসি অনুযায়ী আবেদনটি অটোমেটিকালি রিজেক্ট করা হয়েছে।'
                        : '১ম দিন (২৪ ঘণ্টার ভেতর) টিম লিডার, ২য় দিন সিনিয়র টিম লিডার, ৩-৫ দিন HSL রিভিউ করবেন। আবেদন জমা থেকে সর্বমোট ২০ দিন পার হলে সিস্টেম স্বয়ংক্রিয়ভাবে আবেদনটি বাতিল (অটো-রিজেক্ট) করে দেবে।'}
                    </p>
                  </div>
                );
              })()}

              {/* Assigned Team Leader & Trainer Section (Selected during application) */}
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50/50 p-4 rounded-xl border border-teal-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-teal-950 font-bold text-xs flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-teal-600" />
                    <span>আবেদনে নির্বাচিত টিম লিডার ও ট্রেইনারের তথ্য:</span>
                  </span>
                  <span className="text-[10px] text-teal-700 bg-teal-100 font-semibold px-2 py-0.5 rounded-full border border-teal-200">
                    আবেদনে প্রদত্ত
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {/* Team Leader Box */}
                  <div className="bg-white p-3 rounded-lg border border-teal-100 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      দায়িত্বপ্রাপ্ত টিম লিডার (TL)
                    </span>
                    <div className="font-bold text-slate-900 text-sm">
                      {selectedRequest.teamLeaderName || 'নির্দিষ্ট করা নেই'}
                    </div>
                    <div className="mt-1 text-slate-600 flex items-center justify-between gap-1">
                      <span className="font-mono text-[11px]">{selectedRequest.teamLeaderWhatsapp || 'নম্বর নেই'}</span>
                      {selectedRequest.teamLeaderWhatsapp && (
                        <a
                          href={`https://wa.me/88${selectedRequest.teamLeaderWhatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          <span>হোয়াটসঅ্যাপ</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Team Trainer Box */}
                  <div className="bg-white p-3 rounded-lg border border-teal-100 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                      দায়িত্বপ্রাপ্ত টিম ট্রেইনার (Trainer)
                    </span>
                    <div className="font-bold text-slate-900 text-sm">
                      {selectedRequest.teamTrainerName || 'নির্দিষ্ট করা নেই'}
                    </div>
                    <div className="mt-1 text-slate-600 flex items-center justify-between gap-1">
                      <span className="font-mono text-[11px]">{selectedRequest.teamTrainerWhatsapp || 'নম্বর নেই'}</span>
                      {selectedRequest.teamTrainerWhatsapp && (
                        <a
                          href={`https://wa.me/88${selectedRequest.teamTrainerWhatsapp.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          <span>হোয়াটসঅ্যাপ</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Work Details row */}
                <div className="mt-2.5 pt-2.5 border-t border-teal-200/60 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">যোগদানের তারিখ:</span>
                    <span className="font-medium text-slate-800">{selectedRequest.joiningDate || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">কাজের সময়কাল:</span>
                    <span className="font-medium text-slate-800">{selectedRequest.durationWorked || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">কাজ করেছেন কিনা:</span>
                    <span className="font-medium text-slate-800">{selectedRequest.hasWorked === 'yes' ? 'হ্যাঁ (কাজ করেছেন)' : 'না'}</span>
                  </div>
                </div>
              </div>

              {/* Student Profile Info */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-slate-900 font-bold block text-xs mb-2.5">
                  শিক্ষার্থী প্রোফাইল:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">নাম</span>
                    <span className="font-bold text-slate-900 truncate block">{selectedRequest.fullName}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">আইডি</span>
                    <span className="font-mono font-bold text-slate-900 block">{selectedRequest.studentId}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">হোয়াটসঅ্যাপ</span>
                    <span className="font-mono font-bold text-slate-900 truncate block">{selectedRequest.whatsapp}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px]">ইমেইল</span>
                    <span className="text-slate-900 truncate block">{selectedRequest.email}</span>
                  </div>
                </div>
              </div>

              {/* Payout Details */}
              <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 shadow-2xs">
                <span className="text-emerald-900 font-bold block text-xs mb-2">রিফান্ড পরিশোধের তথ্য:</span>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-700 block">মাধ্যম: <strong className="uppercase font-mono text-slate-900">{selectedRequest.payoutMethod}</strong></span>
                    <span className="text-xs text-slate-700 block">অ্যাকাউন্ট: <strong className="font-mono text-slate-900">{selectedRequest.payoutAccount}</strong></span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block">রিফান্ড পরিমাণ</span>
                    <span className="text-lg font-black text-emerald-800 font-mono">৳ {selectedRequest.amount.toLocaleString('bn-BD')}</span>
                  </div>
                </div>

                {selectedRequest.bankDetails && (
                  <div className="mt-2 pt-2 border-t border-emerald-200/80 text-xs space-y-0.5 text-slate-700">
                    <div>হোল্ডার: <strong>{selectedRequest.bankDetails.accountHolderName}</strong></div>
                    <div>ব্যাংক: <strong>{selectedRequest.bankDetails.bankName}</strong> (শাখা: {selectedRequest.bankDetails.branchName})</div>
                    <div>রাউটিং: <strong>{selectedRequest.bankDetails.routingNumber}</strong></div>
                  </div>
                )}
              </div>

              {/* 9-Step Progress Status Visualizer for Admin */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <span className="font-bold text-slate-900 block text-xs mb-2.5">
                  ৯-ধাপের অগ্রগতি স্ট্যাটাস:
                </span>
                <div className="space-y-1.5">
                  {REFUND_STAGES.map((stg) => {
                    const currentIdx = STAGE_ORDER.indexOf(selectedRequest.currentStageId as StageId);
                    const isRejected = selectedRequest.status === 'rejected';
                    const isCompleted = selectedRequest.status === 'completed';
                    
                    let stepStatus: 'completed' | 'active' | 'pending' | 'rejected' = 'pending';

                    if (isRejected && stg.stepNumber - 1 >= (currentIdx !== -1 ? currentIdx : 0)) {
                      if (stg.stepNumber - 1 === (currentIdx !== -1 ? currentIdx : 0)) {
                        stepStatus = 'rejected';
                      } else {
                        stepStatus = 'pending';
                      }
                    } else if (isCompleted) {
                      stepStatus = 'completed';
                    } else if (stg.stepNumber - 1 < currentIdx) {
                      stepStatus = 'completed';
                    } else if (stg.stepNumber - 1 === currentIdx) {
                      stepStatus = 'active';
                    }

                    return (
                      <div 
                        key={stg.id}
                        className={`py-1.5 px-2.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                          stepStatus === 'completed'
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                            : stepStatus === 'active'
                            ? 'bg-amber-50 border-amber-300 text-amber-950 font-semibold ring-1 ring-amber-300'
                            : stepStatus === 'rejected'
                            ? 'bg-rose-50 border-rose-300 text-rose-950 font-semibold'
                            : 'bg-white border-slate-200 text-slate-500 opacity-75'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[9px] ${
                            stepStatus === 'completed'
                              ? 'bg-emerald-600 text-white'
                              : stepStatus === 'active'
                              ? 'bg-amber-500 text-white animate-pulse'
                              : stepStatus === 'rejected'
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {stg.stepNumber}
                          </span>
                          <span>{stg.titleBn}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          stepStatus === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : stepStatus === 'active'
                            ? 'bg-amber-100 text-amber-900'
                            : stepStatus === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {stepStatus === 'completed'
                            ? 'সম্পন্ন'
                            : stepStatus === 'active'
                            ? 'চলতি ধাপ'
                            : stepStatus === 'rejected'
                            ? 'বাতিল'
                            : 'অপেক্ষমান'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Internal Notes Section */}
              <div className="space-y-3">
                <span className="font-bold text-slate-900 block text-xs">অভ্যন্তরীণ অডিট ও রিভিউ নোট:</span>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedRequest.internalNotes?.map((note) => (
                    <div key={note.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between text-slate-500 text-[10px] mb-0.5">
                        <strong className="text-slate-800">{note.author}</strong>
                        <span>{note.timestamp}</span>
                      </div>
                      <p className="text-slate-700">{note.text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    id="admin-internal-note-input"
                    type="text"
                    value={internalNoteInput}
                    onChange={(e) => setInternalNoteInput(e.target.value)}
                    placeholder="নোট বা মন্তব্য লিখুন..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    id="admin-add-note-btn"
                    onClick={handleAddInternalNote}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs"
                  >
                    নোট যোগ করুন
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}

      {/* ================= REJECT CONFIRMATION MODAL ================= */}
      {rejectModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-200 text-left">
            <h3 className="text-lg font-bold text-rose-950 mb-2 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>রিফান্ড রিকোয়েস্ট প্রত্যাখ্যান করুন</span>
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              প্রত্যাখ্যানের সুনির্দিষ্ট কারণ উল্লেখ করুন। শিক্ষার্থী তার ড্যাশবোর্ডে এই কারণটি দেখতে পাবেন।
            </p>

            <div className="space-y-1.5 mb-3">
              <span className="text-[11px] font-bold text-slate-500 block">কুইক কারণ টেমপ্লেট নির্বাচন করুন:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setRejectionReasonInput('আমাদের অভ্যন্তরীণ পলিসি ও অডিট কমিটির পুঙ্খানুপুঙ্খ পর্যালোচনা শেষে আপনার রিফান্ড আবেদনটি বাতিল করা হয়েছে। রিফান্ড পলিসির নির্ধারিত শর্তাবলী অনুযায়ী আপনার দাখিলকৃত আবেদনের সপক্ষে কোনো সুনির্দিষ্ট ও প্রমাণযোগ্য যৌক্তিক কারণ পাওয়া যায়নি। ফলে ২০ কার্যদিবসের মাথায় প্রাতিষ্ঠানিক নীতিমালার আওতায় আপনার রিফান্ড রিকোয়েস্টটি বাতিল গণ্য করা হলো এবং এই আবেদনের রিফান্ড পলিসি বাদ/বাতিল ঘোষণা করা হলো।')}
                  className="px-2.5 py-1 text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors text-left"
                >
                  যথাযথ কারণ ও প্রমাণ না থাকায় বাতিল (২০ দিন পলিসি)
                </button>
                <button
                  type="button"
                  onClick={() => setRejectionReasonInput('দাখিলকৃত তথ্যাবলী কোম্পানির রিফান্ড শর্তাবলী বহির্ভূত এবং কোর্সের নির্ধারিত মেয়াদের চেয়ে বেশি সময় অতিবাহিত হওয়ায় রিফান্ড আবেদনটি বাতিল করা হলো।')}
                  className="px-2.5 py-1 text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors text-left"
                >
                  শর্তাবলী বহির্ভূত আবেদন
                </button>
              </div>
            </div>

            <textarea
              id="rejection-reason-textarea"
              rows={4}
              required
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="যেমন: আমাদের অভ্যন্তরীণ পলিসি পর্যালোচনা শেষে আপনার রিফান্ড আবেদনটি বাতিল করা হয়েছে..."
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-rose-500 mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                বাতিল
              </button>
              <button
                id="confirm-reject-submit-btn"
                onClick={handleRejectSubmit}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
              >
                প্রত্যাখ্যান সম্পন্ন করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ISSUE PAYOUT MODAL ================= */}
      {issueModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-emerald-200 text-left">
            <h3 className="text-lg font-bold text-emerald-950 mb-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>রিফান্ড ইস্যু ও সম্পন্নকরণ</span>
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              শিক্ষার্থী <strong className="text-slate-800">{selectedRequest.fullName}</strong>-কে ৳{selectedRequest.amount} পাঠানোর ট্রানজেকশন তথ্য দিন:
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ট্রানজেকশন আইডি (TrxID) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="payout-trx-input"
                  type="text"
                  value={transactionIdInput}
                  onChange={(e) => setTransactionIdInput(e.target.value)}
                  placeholder="যেমন: TXN-BK-99824190"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  পেমেন্ট স্লিপ নোট
                </label>
                <input
                  id="payout-slip-note-input"
                  type="text"
                  value={payoutSlipNoteInput}
                  onChange={(e) => setPayoutSlipNoteInput(e.target.value)}
                  placeholder="যেমন: বিকাশ পার্সোনাল নম্বরে পাঠানো হয়েছে"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIssueModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                বাতিল
              </button>
              <button
                id="confirm-issue-payout-btn"
                onClick={handleIssuePayoutSubmit}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
              >
                রিফান্ড সম্পন্ন করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= USER DETAILS MODAL (VIEW ALL DETAILS) ================= */}
      {selectedUserForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200 text-left">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    শিক্ষার্থীর পূর্ণাঙ্গ রেজিস্ট্রেশন তথ্য
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {selectedUserForDetails.studentId} • {selectedUserForDetails.status === 'pending' ? 'অপেক্ষমান আবেদন' : 'অনুমোদিত শিক্ষার্থী'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForDetails(null)}
                className="p-2 rounded-full hover:bg-slate-200/80 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
              
              {/* Status & ID Highlight Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">স্টুডেন্ট আইডি নম্বর</span>
                  <span className="text-xl font-black font-mono tracking-wider text-emerald-400">{selectedUserForDetails.studentId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">বর্তমান স্ট্যাটাস</span>
                  {selectedUserForDetails.status === 'pending' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                      <Clock className="w-3.5 h-3.5" />
                      পেন্ডিং রেজিস্ট্রেশন
                    </span>
                  ) : selectedUserForDetails.status === 'rejected' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/30">
                      <XCircle className="w-3.5 h-3.5" />
                      প্রত্যাখ্যাত
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      অনুমোদিত শিক্ষার্থী
                    </span>
                  )}
                </div>
              </div>

              {/* Personal & Academic Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 font-semibold mb-0.5">পূর্ণ নাম (Full Name)</p>
                  <p className="text-sm font-bold text-slate-900">{selectedUserForDetails.fullName}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 font-semibold mb-0.5">প্রথম ও শেষ নাম</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedUserForDetails.firstName || '-'} {selectedUserForDetails.lastName || ''}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 font-semibold mb-0.5">হোয়াটসঅ্যাপ নম্বর</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold font-mono text-emerald-700">{selectedUserForDetails.whatsapp}</p>
                    <a
                      href={`https://wa.me/${selectedUserForDetails.whatsapp?.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    >
                      মেসেজ পাঠান
                    </a>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 font-semibold mb-0.5">ইমেইল ঠিকানা</p>
                  <p className="text-sm font-medium text-slate-800 break-all">{selectedUserForDetails.email}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 font-semibold mb-0.5">টিম লিডার (Team Leader)</p>
                  <p className="text-sm font-bold text-slate-800">{selectedUserForDetails.teamLeaderName || 'দেওয়া হয়নি'}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 font-semibold mb-0.5">টিম ট্রেনার (Team Trainer)</p>
                  <p className="text-sm font-bold text-slate-800">{selectedUserForDetails.teamTrainerName || 'দেওয়া হয়নি'}</p>
                </div>
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs text-slate-500 font-semibold mb-0.5">ঠিকানা (Address)</p>
                  <p className="text-sm font-medium text-slate-800">{selectedUserForDetails.address || 'ঠিকানা দেওয়া হয়নি'}</p>
                </div>
              </div>

              {/* Password & Security Section */}
              <div className="border border-amber-200 bg-amber-50/50 rounded-2xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-amber-700" />
                    <h3 className="text-xs sm:text-sm font-bold text-amber-950">অ্যাকাউন্ট সিকিউরিটি ও পাসওয়ার্ড</h3>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedUserForDetails(null);
                      handleOpenChangePasswordModal(selectedUserForDetails);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors self-start sm:self-auto cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>পাসওয়ার্ড চেঞ্জ করুন</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-amber-200">
                  <span className="text-xs text-slate-500 font-medium">নিবন্ধিত পাসওয়ার্ড:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {showUserPasswordInModal ? selectedUserForDetails.password : '••••••••••••'}
                  </span>
                  <button
                    onClick={() => setShowUserPasswordInModal(!showUserPasswordInModal)}
                    className="p-1 text-slate-500 hover:text-slate-700 ml-auto"
                    title={showUserPasswordInModal ? 'হাইড করুন' : 'পাসওয়ার্ড দেখুন'}
                  >
                    {showUserPasswordInModal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div className="border-t border-slate-200 pt-5">
                <h3 className="text-sm font-bold text-slate-800 mb-3">আপলোডকৃত ডকুমেন্ট ও ছবি</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                    <p className="text-xs text-slate-600 font-semibold mb-2">এনআইডি / জন্ম নিবন্ধন</p>
                    {selectedUserForDetails.nidUrl ? (
                      <img 
                        src={selectedUserForDetails.nidUrl} 
                        alt="NID" 
                        className="w-full h-auto rounded-lg shadow-xs border border-slate-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="p-6 text-center text-slate-400 bg-white rounded-lg border border-dashed border-slate-300">
                        <p className="text-xs">ছবি পাওয়া যায়নি</p>
                      </div>
                    )}
                  </div>
                  <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                    <p className="text-xs text-slate-600 font-semibold mb-2">পাসপোর্ট সাইজ ছবি</p>
                    {selectedUserForDetails.photoUrl ? (
                      <img 
                        src={selectedUserForDetails.photoUrl} 
                        alt="Photo" 
                        className="w-full h-auto rounded-lg shadow-xs border border-slate-300 object-cover aspect-square"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="p-6 text-center text-slate-400 bg-white rounded-lg border border-dashed border-slate-300">
                        <p className="text-xs">ছবি পাওয়া যায়নি</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Modal Actions Toolbar */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {/* Delete Button */}
                <button
                  onClick={() => {
                    handleOpenDeleteUserModal(selectedUserForDetails);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>ডাটা ডিলিট</span>
                </button>

                {/* Change Password Button */}
                <button
                  onClick={() => {
                    setSelectedUserForDetails(null);
                    handleOpenChangePasswordModal(selectedUserForDetails);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>পাসওয়ার্ড চেঞ্জ</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {selectedUserForDetails.status === 'pending' && currentUser.role === 'admin' ? (
                  <>
                    <button
                      onClick={() => {
                        handleRejectUser(selectedUserForDetails);
                        setSelectedUserForDetails(null);
                      }}
                      className="px-4 py-2 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer"
                    >
                      বাতিল করুন
                    </button>
                    <button
                      onClick={() => {
                        handleAcceptUser(selectedUserForDetails);
                        setSelectedUserForDetails(null);
                      }}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>অ্যাকাউন্ট অ্যাকসেপ্ট করুন</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setSelectedUserForDetails(null)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                  >
                    বন্ধ করুন
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= CHANGE PASSWORD MODAL ================= */}
      {changePasswordModalOpen && targetUserForPassword && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-amber-200 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  শিক্ষার্থীর পাসওয়ার্ড পরিবর্তন করুন
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {targetUserForPassword.fullName} (ID: {targetUserForPassword.studentId})
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveNewPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  বর্তমান নম্বর: <span className="font-mono font-bold text-slate-900">{targetUserForPassword.whatsapp}</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  নতুন পাসওয়ার্ড প্রদান করুন <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPasswordValue}
                    onChange={(e) => {
                      setNewPasswordValue(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs text-rose-600 mt-1 font-semibold">{passwordError}</p>
                )}
                <p className="text-[11px] text-slate-400 mt-1">
                  নতুন পাসওয়ার্ড সেট করার পর শিক্ষার্থী এই পাসওয়ার্ড ও তার নাম্বার দিয়ে সরাসরি লগইন করতে পারবে।
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setChangePasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>পাসওয়ার্ড সেভ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE USER CONFIRMATION MODAL ================= */}
      {deleteUserModalOpen && targetUserForDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-200 text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  রেজিস্ট্রেশন ডাটা মুছে ফেলবেন?
                </h3>
                <p className="text-xs text-rose-600 font-semibold">
                  এই কাজটি অপরিবর্তনীয়
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-4 text-xs space-y-1 text-slate-700">
              <p>শিক্ষার্থীর নাম: <strong className="text-slate-900">{targetUserForDelete.fullName}</strong></p>
              <p>স্টুডেন্ট আইডি: <strong className="font-mono text-slate-900">{targetUserForDelete.studentId}</strong></p>
              <p>হোয়াটসঅ্যাপ: <strong className="font-mono text-slate-900">{targetUserForDelete.whatsapp}</strong></p>
            </div>

            <p className="text-xs text-slate-600 mb-5">
              আপনি কি নিশ্চিতভাবে এই রেজিস্ট্রেশন রেকর্ড ও সমস্ত তথ্য স্থায়ীভাবে ডাটাবেজ থেকে মুছে ফেলতে চান?
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteUserModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUserSubmit}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>হ্যাঁ, মুছে ফেলুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FLOATING TOAST NOTIFICATION ================= */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-70 max-w-sm">
          <div className={`p-4 rounded-2xl shadow-xl flex items-start gap-3 border text-left ${
            toastMessage.type === 'success'
              ? 'bg-slate-900 text-white border-emerald-500/50'
              : toastMessage.type === 'error'
              ? 'bg-rose-950 text-white border-rose-500/50'
              : 'bg-slate-900 text-white border-slate-700'
          }`}>
            <div className="mt-0.5">
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : toastMessage.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              ) : (
                <Sparkles className="w-5 h-5 text-amber-400" />
              )}
            </div>
            <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
              {toastMessage.text}
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Submitted Application Full Details Modal */}
      <ApplicationDetailsModal
        isOpen={isApplicationDetailsModalOpen}
        request={detailsModalRequest}
        onClose={() => {
          setIsApplicationDetailsModalOpen(false);
          setDetailsModalRequest(null);
        }}
        supportEmail={appSettings?.supportEmail}
        telegramUrl={appSettings?.telegramUrl}
      />

      {/* Zoomed Image Lightbox Modal */}
      {zoomedImageUrl && (
        <div 
          className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setZoomedImageUrl(null)}
        >
          <div 
            className="bg-white rounded-3xl p-3 sm:p-4 max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">সংযুক্ত প্রুফ / নথিপত্র প্রিভিউ</span>
              <button
                onClick={() => setZoomedImageUrl(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-auto flex-1 flex items-center justify-center bg-slate-900 rounded-2xl p-2">
              <img
                src={zoomedImageUrl}
                alt="Zoomed document"
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="pt-3 flex items-center justify-end gap-2">
              <a
                href={zoomedImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>নতুন ট্যাবে আসল সাইজে দেখুন</span>
              </a>
              <button
                onClick={() => setZoomedImageUrl(null)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
