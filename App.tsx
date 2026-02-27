
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Explainer from './components/Explainer';
import Summarizer from './components/Summarizer';
import QuizMaker from './components/QuizMaker';
import Flashcards from './components/Flashcards';
import DocStudy from './components/DocStudy';
import ReviewCenter from './components/ReviewCenter';
import MnemonicGen from './components/MnemonicGen';
import StoryGen from './components/StoryGen';
import Login from './components/Login';
import Register from './components/Register';
import { View, User } from './types';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./services/firebase";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser?.email) {
        const user: User = {
          name: firebaseUser.email.split("@")[0],
          email: firebaseUser.email,
        };
        setUser(user);
      } else {
        setUser(null);
      }
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem('omnistudy_user');
    setUser(null);
    setCurrentView(View.DASHBOARD);
    setShowRegister(false);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <i className="fa-solid fa-circle-notch fa-spin text-4xl text-indigo-600"></i>
      </div>
    );
  }

  if (!user) {
    return showRegister ? (
      <Register
        onRegister={setUser}
        onSwitchToLogin={() => setShowRegister(false)}
      />
    ) : (
      <Login
        onLogin={setUser}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard onNavigate={setCurrentView} user={user} />;
      case View.EXPLAINER:
        return <Explainer />;
      case View.SUMMARIZER:
        return <Summarizer />;
      case View.QUIZ:
        return <QuizMaker />;
      case View.FLASHCARDS:
        return <Flashcards />;
      case View.DOC_STUDY:
        return <DocStudy />;
      case View.MNEMONIC:
        return <MnemonicGen />;
      case View.STORY:
        return <StoryGen />;
      case View.REVIEW_CENTER:
        return <ReviewCenter onNavigate={setCurrentView} />;
      default:
        return <Dashboard onNavigate={setCurrentView} user={user} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} onLogout={handleLogout} user={user} />
      
      <main className="flex-1 p-4 md:p-10 bg-slate-50 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>

      {/* Floating Action Button for Snap & Solve */}
      {currentView !== View.EXPLAINER && (
        <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40">
          <button 
            onClick={() => setCurrentView(View.EXPLAINER)}
            className="w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition-transform animate-pulse hover:animate-none group relative"
          >
            <i className="fa-solid fa-camera"></i>
            <span className="absolute right-full mr-4 px-3 py-1 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity">
              Snap & Solve
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
