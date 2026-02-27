
import React, { useState } from 'react';
import { generateMnemonics } from '../services/geminiService';
import { MnemonicItem } from '../types';

const MnemonicGen: React.FC = () => {
  const [text, setText] = useState('');
  const [mnemonics, setMnemonics] = useState<MnemonicItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await generateMnemonics(text);
      setMnemonics(res);
    } catch (error) {
      console.error(error);
      alert('Failed to generate mnemonics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-900">Mnemonic Master</h2>
        <p className="text-slate-500">Transform complex lists or steps into unforgettable phrases.</p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Your Study Notes</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Orders of the Planets, Stages of Mitosis, or specific terms to remember..."
              className="w-full h-40 px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition shadow-xl shadow-indigo-100 disabled:opacity-50"
          >
            {loading ? <i className="fa-solid fa-spinner fa-spin mr-2"></i> : <i className="fa-solid fa-lightbulb mr-2"></i>}
            {loading ? 'Generating...' : 'Create Mnemonics'}
          </button>
        </form>
      </div>

      {mnemonics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mnemonics.map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl border border-indigo-50 shadow-sm hover:shadow-lg transition-all animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-lg tracking-widest">{item.type}</span>
              </div>
              <p className="text-2xl font-black text-slate-800 mb-4 leading-tight">"{item.phrase}"</p>
              <p className="text-sm text-slate-500 leading-relaxed border-t border-slate-50 pt-4">{item.explanation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MnemonicGen;
