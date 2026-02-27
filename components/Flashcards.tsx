
import React, { useState } from 'react';
import { generateFlashcards } from '../services/geminiService';
import { Flashcard } from '../types';

const Flashcards: React.FC = () => {
  const [input, setInput] = useState('');
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const startCards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setCards([]);
    setCurrentIdx(0);
    setIsFlipped(false);
    try {
      const res = await generateFlashcards(input);
      setCards(res);
    } catch (error) {
      console.error(error);
      alert('Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIdx(c => (c + 1) % cards.length);
    }, 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIdx(c => (c - 1 + cards.length) % cards.length);
    }, 150);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Study Flashcards</h2>
        <p className="text-slate-500">Perfect for memorizing definitions and concepts.</p>
      </div>

      {!cards.length && !loading && (
        <form onSubmit={startCards} className="space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your notes or enter a topic..."
            className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 shadow-sm"
          />
          <button className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700">
            Generate Flashcards
          </button>
        </form>
      )}

      {loading && (
        <div className="text-center p-20">
          <i className="fa-solid fa-clone fa-spin text-4xl text-indigo-500 mb-4"></i>
          <p className="text-slate-500">Preparing your study deck...</p>
        </div>
      )}

      {cards.length > 0 && (
        <div className="space-y-8">
          <div 
            className={`card-flip h-80 w-full cursor-pointer ${isFlipped ? 'is-flipped' : ''}`}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="card-inner relative w-full h-full text-center">
              {/* Front */}
              <div className="card-front absolute inset-0 bg-white border-2 border-slate-100 rounded-3xl shadow-xl flex items-center justify-center p-8">
                <h3 className="text-2xl font-bold text-slate-800">{cards[currentIdx].front}</h3>
                <div className="absolute bottom-6 text-slate-300 text-sm uppercase tracking-widest font-bold">Question</div>
              </div>
              {/* Back */}
              <div className="card-back absolute inset-0 bg-indigo-600 border-2 border-indigo-700 rounded-3xl shadow-xl flex items-center justify-center p-8 text-white">
                <p className="text-xl leading-relaxed">{cards[currentIdx].back}</p>
                <div className="absolute bottom-6 text-indigo-300 text-sm uppercase tracking-widest font-bold">Answer</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-4">
            <button 
              onClick={prevCard}
              className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <div className="text-slate-500 font-medium">
              {currentIdx + 1} / {cards.length}
            </div>
            <button 
              onClick={nextCard}
              className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>

          <button 
            onClick={() => setCards([])}
            className="w-full text-sm text-slate-400 hover:text-indigo-600 transition"
          >
            Start New Deck
          </button>
        </div>
      )}
    </div>
  );
};

export default Flashcards;
