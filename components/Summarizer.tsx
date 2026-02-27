
import React, { useState } from 'react';
import { summarizeNotes } from '../services/geminiService';
import { SummaryResult } from '../types';

const Summarizer: React.FC = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await summarizeNotes(text);
      setResult(res);
    } catch (error) {
      console.error(error);
      alert('Summarization failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Note Summarizer</h2>
        <p className="text-slate-500">Paste your long articles or notes to get the core points instantly.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <form onSubmit={handleSummarize} className="space-y-4">
            <label className="block text-sm font-bold text-slate-700">Paste Notes Below</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste long-form content here..."
              className="w-full h-80 px-4 py-3 rounded-xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-slate-50/50"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : null}
              {loading ? 'Summarizing...' : 'Generate Summary'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          {result ? (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-indigo-50 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">{result.title}</h3>
              <p className="text-slate-600 leading-relaxed mb-6 italic">"{result.summary}"</p>
              
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Key Takeaways</h4>
                <ul className="space-y-3">
                  {result.keyPoints.map((point, i) => (
                    <li key={i} className="flex gap-3 text-slate-700">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="h-80 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl p-8">
              <i className="fa-solid fa-file-waveform text-5xl mb-4"></i>
              <p className="text-center font-medium">Your summarized notes will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summarizer;
