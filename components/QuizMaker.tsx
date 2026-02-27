
import React, { useState } from 'react';
import { generateQuiz } from '../services/geminiService';
import { QuizQuestion } from '../types';

type SourceType = 'general' | 'content';

const QuizMaker: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('general');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const startQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = sourceType === 'general' ? topic : content;
    if (!input.trim()) return;

    setLoading(true);
    setQuestions([]);
    setIsFinished(false);
    setCurrentIdx(0);
    setScore(0);
    try {
      // The generateQuiz service already accepts a generic string
      const res = await generateQuiz(input);
      setQuestions(res);
    } catch (error) {
      console.error(error);
      alert('Quiz generation failed. Please try a different topic or shorter content.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowResult(true);

    const isCorrect = idx === questions[currentIdx].correctAnswer;

    if (isCorrect) {
      setScore(s => s + 1);
    } else {
      // Spaced Repetition Logic: Save missed topic
      const missedTopic = sourceType === 'general' ? topic : questions[currentIdx].question.split(' ').slice(0, 5).join(' ');
      const existingReviews = JSON.parse(localStorage.getItem('omnistudy_reviews') || '[]');
      const newItem = {
        id: Date.now().toString(),
        topic: `Review: ${missedTopic}`,
        nextReview: Date.now() + 86400000, // Schedule for tomorrow
        interval: 1,
        difficulty: 'hard'
      };
      localStorage.setItem('omnistudy_reviews', JSON.stringify([...existingReviews, newItem]));
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowResult(false);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(c => c + 1);
    } else {
      setIsFinished(true);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Quiz Maker</h2>
        <p className="text-slate-500 text-lg">Test your knowledge with AI-generated interactive challenges.</p>
      </div>

      {!questions.length && !loading && (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-100/50 border border-slate-100 animate-in zoom-in-95 duration-500">
          <div className="flex p-1.5 bg-slate-100 rounded-2xl mb-8">
            <button
              onClick={() => setSourceType('general')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all ${sourceType === 'general' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <i className="fa-solid fa-globe mr-2"></i>
              General Topic
            </button>
            <button
              onClick={() => setSourceType('content')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all ${sourceType === 'content' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <i className="fa-solid fa-file-lines mr-2"></i>
              My Study Notes
            </button>
          </div>

          <form onSubmit={startQuiz} className="space-y-6">
            {sourceType === 'general' ? (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quiz Subject</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Organic Chemistry, 19th Century History, React Hooks..."
                  className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none shadow-sm transition-all text-lg"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Source Material</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your lecture notes, textbook passages, or articles here..."
                  className="w-full h-64 px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none shadow-sm transition-all text-lg resize-none"
                />
              </div>
            )}

            <button 
              type="submit"
              disabled={loading || (sourceType === 'general' ? !topic.trim() : !content.trim())}
              className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 transition-all shadow-2xl shadow-indigo-300/60 disabled:opacity-50 disabled:translate-y-0"
            >
              <i className="fa-solid fa-wand-magic-sparkles mr-3"></i>
              Generate Custom Quiz
            </button>
          </form>
        </div>
      )}

      {loading && (
        <div className="text-center py-32 space-y-6 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 animate-pulse">
          <div className="relative inline-block">
             <i className="fa-solid fa-puzzle-piece text-6xl text-indigo-500"></i>
             <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full border-4 border-white"></div>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-black text-slate-800">Crafting your challenge...</p>
            <p className="text-slate-400 font-medium">Extracting key concepts from your {sourceType === 'general' ? 'topic' : 'notes'}.</p>
          </div>
        </div>
      )}

      {questions.length > 0 && !isFinished && (
        <div className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-2xl border border-indigo-50 animate-in slide-in-from-bottom-12 duration-700">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
               <div className="px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-black rounded-xl border border-indigo-100">
                Question {currentIdx + 1} of {questions.length}
              </div>
              <div className="hidden sm:block text-[10px] font-black text-slate-300 uppercase tracking-widest">
                Source: {sourceType === 'general' ? 'AI Knowledge' : 'Personal Notes'}
              </div>
            </div>
            <div className="flex items-center gap-3 text-lg font-black text-slate-700">
              <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-500">
                <i className="fa-solid fa-star"></i>
              </div>
              {score}
            </div>
          </div>

          <h3 className="text-2xl md:text-3xl font-black mb-10 text-slate-900 leading-tight">
            {questions[currentIdx].question}
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {questions[currentIdx].options.map((option, i) => {
              let btnClass = "w-full text-left p-6 rounded-[1.5rem] border-2 transition-all duration-300 font-bold text-lg flex items-center gap-4 ";
              if (selectedAnswer !== null) {
                if (i === questions[currentIdx].correctAnswer) {
                  btnClass += "bg-green-50 border-green-500 text-green-700 ring-8 ring-green-100";
                } else if (i === selectedAnswer) {
                  btnClass += "bg-red-50 border-red-500 text-red-700 ring-8 ring-red-100";
                } else {
                  btnClass += "bg-slate-50 border-slate-100 opacity-40";
                }
              } else {
                btnClass += "bg-white border-slate-100 hover:border-indigo-400 hover:bg-indigo-50/30 hover:-translate-y-1 hover:shadow-lg";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={selectedAnswer !== null}
                  className={btnClass}
                >
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-sm ${selectedAnswer === null ? 'bg-slate-100 text-slate-400' : (i === questions[currentIdx].correctAnswer ? 'bg-green-500 text-white' : 'bg-red-500 text-white')}`}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{option}</span>
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className="mt-12 p-8 bg-slate-900 rounded-[2rem] border border-slate-800 animate-in slide-in-from-top-4 duration-500 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg ${selectedAnswer === questions[currentIdx].correctAnswer ? 'bg-green-500' : 'bg-red-500'}`}>
                     <i className={`fa-solid ${selectedAnswer === questions[currentIdx].correctAnswer ? 'fa-check' : 'fa-xmark'}`}></i>
                  </div>
                  <h4 className="text-xl font-black text-white">
                    {selectedAnswer === questions[currentIdx].correctAnswer ? 'Excellent Mastery!' : 'Knowledge Gap Found'}
                  </h4>
                </div>
                <p className="text-slate-300 leading-relaxed text-lg font-medium mb-8 pl-14">
                  {questions[currentIdx].explanation}
                </p>
                
                <button
                  onClick={nextQuestion}
                  className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-lg hover:bg-slate-100 transition shadow-xl active:scale-[0.98]"
                >
                  {currentIdx < questions.length - 1 ? (
                    <div className="flex items-center justify-center gap-2">
                      <span>Next Challenge</span>
                      <i className="fa-solid fa-arrow-right"></i>
                    </div>
                  ) : 'See Final Results'}
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
            </div>
          )}
        </div>
      )}

      {isFinished && (
        <div className="text-center bg-white rounded-[3rem] p-16 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-700">
          <div className="relative inline-block mb-10">
            <div className="w-32 h-32 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner relative z-10">
              <i className="fa-solid fa-award text-6xl text-indigo-600"></i>
            </div>
            <div className="absolute -inset-4 bg-indigo-100 rounded-[3rem] blur-xl opacity-30 animate-pulse"></div>
          </div>
          
          <div className="space-y-4 mb-12">
            <h3 className="text-5xl font-black text-slate-900 leading-tight">Session Complete!</h3>
            <p className="text-slate-400 text-xl font-medium">You achieved {Math.round((score / questions.length) * 100)}% mastery on this subject.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
             <button
              onClick={() => {setQuestions([]); setIsFinished(false);}}
              className="px-8 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-indigo-700 hover:-translate-y-1 transition shadow-2xl shadow-indigo-200"
            >
              Start New Quiz
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-5 bg-slate-100 text-slate-600 rounded-[1.5rem] font-black text-lg hover:bg-slate-200 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizMaker;
