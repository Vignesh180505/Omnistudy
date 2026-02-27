
import React, { useState, useEffect } from 'react';
import { ReviewItem, View } from '../types';

const ReviewCenter: React.FC<{ onNavigate: (v: View) => void }> = ({ onNavigate }) => {
  const [items, setItems] = useState<ReviewItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('omnistudy_reviews');
    if (stored) {
      setItems(JSON.parse(stored));
    } else {
      // Demo initial data if nothing exists
      const initial: ReviewItem[] = [
        { id: '1', topic: 'The Krebs Cycle Steps', nextReview: Date.now(), interval: 1, difficulty: 'hard' },
        { id: '2', topic: 'Big O Notation Complexity', nextReview: Date.now() + 86400000, interval: 3, difficulty: 'medium' },
      ];
      setItems(initial);
      localStorage.setItem('omnistudy_reviews', JSON.stringify(initial));
    }
  }, []);

  const clearReviews = () => {
    if (confirm('Clear all items from your review list?')) {
      localStorage.removeItem('omnistudy_reviews');
      setItems([]);
    }
  };

  const handleDone = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    localStorage.setItem('omnistudy_reviews', JSON.stringify(updated));
  };

  const todayItems = items.filter(item => item.nextReview <= Date.now());
  const upcomingItems = items.filter(item => item.nextReview > Date.now());

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Daily Review</h2>
          <p className="text-slate-500 text-lg">Harness spaced repetition to never forget again.</p>
        </div>
        <button 
          onClick={clearReviews}
          className="text-xs font-black text-red-400 hover:text-red-500 uppercase tracking-widest bg-red-50 px-3 py-2 rounded-lg"
        >
          Reset List
        </button>
      </header>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <span className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-fire-flame-curved"></i>
            </span>
            Due for Review
          </h3>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{todayItems.length} Topics pending</span>
        </div>

        {todayItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {todayItems.map(item => (
              <div key={item.id} className="bg-white p-7 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                      item.difficulty === 'hard' ? 'bg-red-50 text-red-500' : 
                      item.difficulty === 'medium' ? 'bg-amber-50 text-amber-500' : 'bg-green-50 text-green-500'
                    }`}>
                      {item.difficulty} Priority
                    </div>
                    <button 
                      onClick={() => handleDone(item.id)}
                      className="text-slate-300 hover:text-green-500 transition-colors"
                    >
                      <i className="fa-solid fa-circle-check text-xl"></i>
                    </button>
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-6 group-hover:text-indigo-600 transition-colors">{item.topic}</h4>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => onNavigate(View.EXPLAINER)}
                    className="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-sm font-black hover:bg-indigo-100 transition shadow-sm"
                  >
                    Deep Dive
                  </button>
                  <button 
                    onClick={() => onNavigate(View.QUIZ)}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
                  >
                    Quick Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-16 text-center shadow-inner">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <i className="fa-solid fa-check text-3xl text-green-500"></i>
            </div>
            <h4 className="text-2xl font-black text-slate-800 mb-2">You're All Caught Up!</h4>
            <p className="text-slate-400 max-w-sm mx-auto">Your mastery is solid. Come back later for your next scheduled reviews.</p>
          </div>
        )}
      </section>

      {upcomingItems.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-slate-100">
          <h3 className="text-xl font-bold flex items-center gap-3 text-slate-400">
            <span className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center">
              <i className="fa-solid fa-calendar-days"></i>
            </span>
            Upcoming Mastery
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {upcomingItems.map(item => (
              <div key={item.id} className="bg-white/50 px-6 py-5 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white transition-all">
                <span className="font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">{item.topic}</span>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap ml-4">
                  In {Math.max(1, Math.round((item.nextReview - Date.now()) / 3600000))}h
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ReviewCenter;
