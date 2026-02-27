
import React, { useState } from 'react';
import { generateStory } from '../services/geminiService';
import { StoryResult } from '../types';

const StoryGen: React.FC = () => {
  const [text, setText] = useState('');
  const [theme, setTheme] = useState('Fantasy Adventure');
  const [story, setStory] = useState<StoryResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await generateStory(text, theme);
      setStory(res);
    } catch (error) {
      console.error(error);
      alert('Failed to generate story.');
    } finally {
      setLoading(false);
    }
  };

  const themes = [
    "Fantasy Adventure",
    "Space Sci-Fi",
    "Cyberpunk Mystery",
    "Cooking Show",
    "Detective Noir",
    "Wild West"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Educational Storyteller</h2>
        <p className="text-slate-500">Weave your facts into a narrative theme to make them stick.</p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Study Material</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the core concepts or notes you want to turn into a story..."
                className="w-full h-40 px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
              />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Story Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {themes.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTheme(t)}
                      className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${theme === t ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-indigo-200'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !text.trim()}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 disabled:opacity-50"
              >
                {loading ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-book-open mr-2"></i>}
                {loading ? 'Writing your Saga...' : 'Generate Study Story'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {story && (
        <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl border border-indigo-50 animate-in slide-in-from-bottom-8 duration-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <i className="fa-solid fa-quote-right text-9xl"></i>
          </div>
          <div className="relative z-10 space-y-8">
            <header className="space-y-2">
               <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-lg tracking-widest">Theme: {theme}</span>
               <h3 className="text-4xl font-black text-slate-900 leading-tight">{story.title}</h3>
            </header>
            <div className="whitespace-pre-wrap leading-relaxed text-slate-700 text-lg md:text-xl font-medium first-letter:text-6xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-indigo-600">
              {story.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryGen;
