import React, { useState, useEffect } from 'react';
import { User, RefundRequest, AppSettings } from './types';
import { 
  loadCurrentUser, 
  saveCurrentUser,
  INITIAL_USERS 
} from './data/mockData';
import { 
  subscribeToRequests, 
  subscribeToUsers, 
  subscribeToAppSettings,
  saveRefundRequestToDb, 
  updateRefundRequestInDb, 
  saveUserToDb,
  deleteUserFromDb,
  saveAppSettingsToDb,
  DEFAULT_APP_SETTINGS
} from './lib/firebase';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { UserDashboard } from './components/UserDashboard';
import { RefundRequestForm } from './components/RefundRequestForm';
import { RefundTimeline } from './components/RefundTimeline';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { SubmissionSuccessModal } from './components/SubmissionSuccessModal';
import { RejectionModal } from './components/RejectionModal';
import { SupportVideoModal } from './components/SupportVideoModal';
import { UnityChatBotModal } from './components/UnityChatBotModal';
import { RefundPolicyNoticeModal } from './components/RefundPolicyNoticeModal';
import { calculateReviewTimeline } from './data/stages';

export default function App() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadCurrentUser());

  // Views: 'landing' | 'dashboard' | 'request-form' | 'timeline' | 'admin'
  const [currentView, setCurrentView] = useState<string>(() => {
    const savedUser = loadCurrentUser();
    if (savedUser) {
      return savedUser.role === 'student' ? 'dashboard' : 'admin';
    }
    return 'landing';
  });

  // Modals & Active Selections
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'admin'>('login');
  
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [justSubmittedRequest, setJustSubmittedRequest] = useState<RefundRequest | null>(null);

  const [activeRequestForTimeline, setActiveRequestForTimeline] = useState<RefundRequest | null>(null);
  
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionModalRequest, setRejectionModalRequest] = useState<RefundRequest | null>(null);

  const [supportVideoModalOpen, setSupportVideoModalOpen] = useState(false);
  const [chatBotOpen, setChatBotOpen] = useState(false);

  // Policy Notice Modal: shows automatically whenever link is opened/visited
  const [policyNoticeModalOpen, setPolicyNoticeModalOpen] = useState(true);

  // 1. Subscribe to Live Firestore database for Refund Requests (Real-time sync across devices)
  useEffect(() => {
    const unsubscribe = subscribeToRequests((liveRequests) => {
      setRequests(liveRequests);
      // If currently viewing a timeline, keep it updated in real-time
      setActiveRequestForTimeline((currentActive) => {
        if (!currentActive) return null;
        const matching = liveRequests.find((r) => r.id === currentActive.id);
        return matching || currentActive;
      });
    });

    return () => unsubscribe();
  }, []);

  // 2. Subscribe to Live Firestore database for Users
  useEffect(() => {
    const unsubscribe = subscribeToUsers((liveUsers) => {
      setUsers(liveUsers);
    });

    return () => unsubscribe();
  }, []);

  // 3. Subscribe to Live Firestore database for App Settings (Support Video URL, etc.)
  useEffect(() => {
    const unsubscribe = subscribeToAppSettings((liveSettings) => {
      setAppSettings(liveSettings);
    });

    return () => unsubscribe();
  }, []);

  // 4. Time-based Auto-Rejection (20-Day threshold rule)
  // Automatically cancels/rejects refund requests that reach 20 days without approval
  useEffect(() => {
    if (!requests || requests.length === 0) return;
    const nowStr = new Date().toISOString().split('T')[0];

    requests.forEach((req) => {
      if (req.status === 'pending' || req.status === 'in_review') {
        const { isExpired, daysPassed } = calculateReviewTimeline(req.submissionDate, 20);
        if (isExpired || daysPassed >= 20) {
          const autoRejectionNotice = `আমাদের অভ্যন্তরীণ অডিট ও পলিসি কমিটির পুঙ্খানুপুঙ্খ পর্যালোচনা শেষে আপনার রিফান্ড আবেদনটি বাতিল করা হয়েছে। রিফান্ড পলিসির নির্ধারিত শর্তাবলী অনুযায়ী আপনার দাখিলকৃত আবেদনের সপক্ষে কোনো সুনির্দিষ্ট ও প্রমাণযোগ্য যৌক্তিক কারণ পাওয়া যায়নি। ফলে ২০ কার্যদিবসের মাথায় প্রাতিষ্ঠানিক নীতিমালার আওতায় আপনার রিফান্ড রিকোয়েস্টটি বাতিল গণ্য করা হলো এবং এই আবেদনের রিফান্ড পলিসি বাদ/বাতিল ঘোষণা করা হলো।`;
          
          const autoRejectedReq: RefundRequest = {
            ...req,
            status: 'rejected',
            currentStageId: 'policy_team_review',
            rejectionReason: autoRejectionNotice,
            rejectedBy: 'সিস্টেম অটো-পলিসি অডিট কমিটি',
            rejectedRoleBn: '২০-দিন পলিসি রিভিউয়ার',
            rejectedDate: `${nowStr} (অটো-ক্যান্সেল)`,
            lastUpdatedDate: nowStr,
            stageLogs: [
              ...(req.stageLogs || []),
              {
                id: `log-autoreject-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                stageId: 'policy_team_review',
                status: 'rejected',
                reviewedBy: 'সিস্টেম অটো-পলিসি অডিট',
                reviewerRoleBn: '২০-দিন পলিসি অডিট কমিটি',
                timestamp: nowStr,
                notes: `২০ কার্যদিবসের রিভিউ সময়সীমা অতিক্রান্ত: যথাযথ কারণ ও শর্ত পূরণ না হওয়ায় আবেদনটি বাতিল ও রিফান্ড পলিসিটি বাদ ঘোষণা করা হয়েছে।`
              }
            ]
          };
          updateRefundRequestInDb(autoRejectedReq).catch((err) => {
            console.error('Failed to auto-reject expired request:', err);
          });
        }
      }
    });
  }, [requests]);

  // Sync current user session
  useEffect(() => {
    saveCurrentUser(currentUser);
  }, [currentUser]);

  // Auth Handlers
  const handleOpenAuth = (mode: 'login' | 'register' | 'admin') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'student') {
      setCurrentView('dashboard');
    } else {
      setCurrentView('admin');
    }
  };

  const handleRegisterSuccess = async (newUser: User) => {
    setUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id)]);
    try {
      await saveUserToDb(newUser);
    } catch (err) {
      console.error('Error saving user to Firestore:', err);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveCurrentUser(null);
    setCurrentView('landing');
    setActiveRequestForTimeline(null);
  };

  // Student Refund Submission (Saves to Firestore -> broadcast to all devices)
  const handleRefundSubmitSuccess = async (newReq: RefundRequest) => {
    setRequests((prev) => [newReq, ...prev]);
    setJustSubmittedRequest(newReq);
    setActiveRequestForTimeline(newReq);
    setCurrentView('timeline'); // Directly show the refund tracker after submission
    setSuccessModalOpen(true);

    try {
      await saveRefundRequestToDb(newReq);
    } catch (err) {
      console.error('Error saving request to Firestore:', err);
    }
  };

  // Update Request (from admin or timeline, writes to Firestore)
  const handleUpdateRequest = async (updatedReq: RefundRequest) => {
    setRequests((prev) => prev.map((r) => (r.id === updatedReq.id ? updatedReq : r)));
    if (activeRequestForTimeline?.id === updatedReq.id) {
      setActiveRequestForTimeline(updatedReq);
    }

    try {
      await updateRefundRequestInDb(updatedReq);
    } catch (err) {
      console.error('Error updating request in Firestore:', err);
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    try {
      await saveUserToDb(updatedUser);
    } catch (err) {
      console.error('Error updating user in Firestore:', err);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    try {
      await deleteUserFromDb(userId);
    } catch (err) {
      console.error('Error deleting user in Firestore:', err);
    }
  };

  // Update App Settings / Support Video in Firestore
  const handleUpdateAppSettings = async (newSettings: AppSettings) => {
    setAppSettings(newSettings);
    try {
      await saveAppSettingsToDb(newSettings);
    } catch (err) {
      console.error('Error updating app settings in Firestore:', err);
    }
  };


  // Direct Tracking from Token ID Search
  const handleDirectTrack = (requestIdOrQuery: string): boolean => {
    const q = requestIdOrQuery.trim().toLowerCase();
    if (!q) return false;

    const cleanQ = q.replace(/[^a-z0-9]/g, '');

    const found = requests.find((r) => {
      const cleanId = (r.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanStudent = (r.studentId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanPhone = (r.whatsapp || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      
      return (
        r.id.toLowerCase() === q ||
        cleanId === cleanQ ||
        (cleanQ.length >= 3 && cleanId.includes(cleanQ)) ||
        r.whatsapp === q ||
        (cleanQ.length >= 6 && cleanPhone.includes(cleanQ)) ||
        r.studentId.toLowerCase() === q ||
        (cleanQ.length >= 3 && cleanStudent.includes(cleanQ))
      );
    });

    if (found) {
      setActiveRequestForTimeline(found);
      setCurrentView('timeline');
      return true;
    }
    return false;
  };

  // Filter requests for current student
  const studentRequests = currentUser && currentUser.role === 'student'
    ? requests.filter((r) => 
        (r as any).userId === currentUser.id ||
        (currentUser.studentId && r.studentId.toLowerCase() === currentUser.studentId.toLowerCase()) ||
        (currentUser.whatsapp && r.whatsapp === currentUser.whatsapp) ||
        (currentUser.email && r.email.toLowerCase() === currentUser.email.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Noto_Sans_Bengali','Hind_Siliguri','Plus_Jakarta_Sans',sans-serif]">
      
      {/* Sleek, responsive Header */}
      <Header
        currentUser={currentUser}
        currentView={currentView}
        telegramUrl={appSettings.telegramUrl}
        supportEmail={appSettings.supportEmail}
        onOpenChatBot={() => setChatBotOpen(true)}
        onNavigate={(view) => {
          if (view === 'dashboard' && currentUser?.role !== 'student') {
            setCurrentView('admin');
          } else {
            setCurrentView(view);
          }
        }}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onTrackRequest={handleDirectTrack}
      />

      {/* Main Content Area based on View */}
      <main className="flex-1">
        {/* Landing Page */}
        {currentView === 'landing' && (
          <LandingPage
            onOpenAuth={handleOpenAuth}
            onTrackRequest={handleDirectTrack}
            onOpenSupportVideo={() => setSupportVideoModalOpen(true)}
            allRequests={requests}
          />
        )}

        {/* Student Dashboard & Timeline View for Student */}
        {currentView === 'dashboard' && currentUser && (
          currentUser.role === 'student' && studentRequests.length > 0 ? (
            <RefundTimeline
              request={studentRequests[0]}
              supportEmail={appSettings.supportEmail}
              telegramUrl={appSettings.telegramUrl}
              isStudentView={true}
            />
          ) : (
            <UserDashboard
              currentUser={currentUser}
              userRequests={studentRequests}
              supportEmail={appSettings.supportEmail}
              telegramUrl={appSettings.telegramUrl}
              onOpenRequestForm={() => setCurrentView('request-form')}
              onSelectRequest={(req) => {
                setActiveRequestForTimeline(req);
                setCurrentView('timeline');
              }}
              onOpenRejectionModal={(req) => {
                setRejectionModalRequest(req);
                setRejectionModalOpen(true);
              }}
            />
          )
        )}

        {/* Refund Request Form */}
        {currentView === 'request-form' && currentUser && (
          <RefundRequestForm
            currentUser={currentUser}
            onBack={() => setCurrentView('dashboard')}
            onSubmitSuccess={handleRefundSubmitSuccess}
            existingRequest={studentRequests.length > 0 ? studentRequests[0] : null}
            onSelectRequest={(req) => {
              setActiveRequestForTimeline(req);
              setCurrentView('timeline');
            }}
          />
        )}

        {/* Timeline View */}
        {currentView === 'timeline' && activeRequestForTimeline && (
          <RefundTimeline
            request={activeRequestForTimeline}
            supportEmail={appSettings.supportEmail}
            telegramUrl={appSettings.telegramUrl}
            isStudentView={currentUser?.role === 'student'}
            onBack={currentUser?.role === 'student' ? undefined : () => {
              if (currentUser) {
                setCurrentView(currentUser.role === 'student' ? 'dashboard' : 'admin');
              } else {
                setCurrentView('landing');
              }
            }}
            onOpenRejectionModal={() => {
              setRejectionModalRequest(activeRequestForTimeline);
              setRejectionModalOpen(true);
            }}
          />
        )}

        {/* Admin Dashboard */}
        {currentView === 'admin' && currentUser && currentUser.role !== 'student' && (
          <AdminDashboard
            currentUser={currentUser}
            requests={requests}
            users={users}
            appSettings={appSettings}
            onUpdateRequest={handleUpdateRequest}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onUpdateAppSettings={handleUpdateAppSettings}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Auth Modal (Login / Register / Admin) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
        existingUsers={users}
      />

      {/* Submission Success Modal */}
      <SubmissionSuccessModal
        isOpen={successModalOpen}
        request={justSubmittedRequest}
        onViewStatus={() => {
          setSuccessModalOpen(false);
          setCurrentView('timeline');
        }}
      />

      {/* Rejection Details Modal */}
      <RejectionModal
        isOpen={rejectionModalOpen}
        request={rejectionModalRequest}
        onClose={() => setRejectionModalOpen(false)}
      />

      {/* Support YouTube Video Guide Modal */}
      <SupportVideoModal
        isOpen={supportVideoModalOpen}
        onClose={() => setSupportVideoModalOpen(false)}
        videoUrl={appSettings.supportVideoUrl}
        videoTitle={appSettings.supportVideoTitle}
      />

      {/* Unity Chat Automated Chatbot Modal */}
      <UnityChatBotModal
        isOpen={chatBotOpen}
        onClose={() => setChatBotOpen(false)}
        supportEmail={appSettings.supportEmail}
        telegramUrl={appSettings.telegramUrl}
      />

      {/* Official Refund Policy Disclaimer Popup Modal (Displayed whenever link is accessed) */}
      <RefundPolicyNoticeModal
        isOpen={policyNoticeModalOpen}
        onClose={() => setPolicyNoticeModalOpen(false)}
        telegramUrl={appSettings.telegramUrl}
      />

      {/* Floating Telegram Button */}
      <a
        href="https://t.me/unityearning12"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-[#0088cc] hover:bg-[#0077b3] text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
        aria-label="Telegram"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.5 1.15-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.09.08.13.19.14.33-.01.07.01.19-.01.32z"/>
        </svg>
      </a>

    </div>
  );
}
