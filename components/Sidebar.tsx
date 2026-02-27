
import React from 'react';
import { View, User } from '../types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  user: User;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onLogout, user }) => {
  const navItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: 'fa-house' },
    { id: View.EXPLAINER, label: 'Snap & Solve', icon: 'fa-camera' },
    { id: View.DOC_STUDY, label: 'Doc Chat (RAG)', icon: 'fa-file-pdf' },
    { id: View.MNEMONIC, label: 'Mnemonics', icon: 'fa-lightbulb' },
    { id: View.STORY, label: 'Study Story', icon: 'fa-book-open' },
    { id: View.SUMMARIZER, label: 'Summarizer', icon: 'fa-file-lines' },
    { id: View.QUIZ, label: 'Quiz Maker', icon: 'fa-list-check' },
    { id: View.FLASHCARDS, label: 'Flashcards', icon: 'fa-clone' },
    { id: View.REVIEW_CENTER, label: 'Daily Review', icon: 'fa-calendar-check' },
  ];

  return (
    <aside className="fixed bottom-0 w-full bg-white border-t border-slate-200 z-50 md:sticky md:top-0 md:h-screen md:w-64 md:border-r md:border-t-0 flex flex-col">
      <div className="p-4 flex flex-col flex-1 h-full">
        <div className="hidden md:flex items-center gap-2 mb-10 px-2">
          <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-indigo-200 shadow-md">O</div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">OmniStudy</h1>
        </div>

        <nav className="flex md:flex-col justify-around md:justify-start gap-1 overflow-x-auto md:overflow-x-visible">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 px-3 py-2 rounded-xl transition-all whitespace-nowrap ${
                currentView === item.id 
                  ? 'text-indigo-600 bg-indigo-50 font-semibold' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-lg md:text-base`}></i>
              <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="hidden md:flex flex-col mt-auto pt-6 border-t border-slate-100 px-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold border-2 border-white shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-black text-slate-900 truncate">{user.name}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Student ID: #8492</span>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
