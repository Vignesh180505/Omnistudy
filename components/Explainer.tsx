
import React, { useState, useRef, useEffect } from 'react';
import { explainConcept, generateMnemonics, generateStory } from '../services/geminiService';
import { GroundingSource, MnemonicItem, StoryResult } from '../types';

const Explainer: React.FC = () => {
  const [concept, setConcept] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [result, setResult] = useState<{ text: string; sources: GroundingSource[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [socratic, setSocratic] = useState(false);
  
  // Memory Boost states
  const [mnemonics, setMnemonics] = useState<MnemonicItem[] | null>(null);
  const [story, setStory] = useState<StoryResult | null>(null);
  const [boostLoading, setBoostLoading] = useState<'mnemonic' | 'story' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setImage(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() && !image) return;
    
    setLoading(true);
    // Reset previous boosts on new submission
    setMnemonics(null);
    setStory(null);
    
    const promptText = concept.trim() 
      ? concept 
      : image 
        ? "Analyze this image and explain the concepts, diagrams, or problems shown in detail." 
        : "";

    try {
      const res = await explainConcept(promptText, image || undefined, socratic);
      setResult(res);
    } catch (error) {
      console.error(error);
      alert('Failed to get explanation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMnemonicBoost = async () => {
    if (!result) return;
    setBoostLoading('mnemonic');
    try {
      const res = await generateMnemonics(result.text);
      setMnemonics(res);
    } catch (err) {
      console.error(err);
    } finally {
      setBoostLoading(null);
    }
  };

  const handleStoryBoost = async () => {
    if (!result) return;
    setBoostLoading('story');
    try {
      const res = await generateStory(result.text, "A Scientific Mythos");
      setStory(res);
    } catch (err) {
      console.error(err);
    } finally {
      setBoostLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-32">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Snap & Solve</h2>
        <p className="text-slate-500 font-medium text-lg">Upload an image or describe a concept to unlock deep understanding.</p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-100/50 border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
             <div className="flex-1 space-y-2">
               <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Your Question</label>
               <input
                type="text"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder={image ? "Priority: Image analysis. Add context if needed..." : "What complex topic should we simplify?"}
                className="w-full px-6 py-5 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none shadow-sm transition-all text-lg"
              />
             </div>
             
             <div className="md:w-64 flex gap-2">
                <button
                  type="button"
                  onClick={isCameraActive ? capturePhoto : startCamera}
                  className={`flex-1 h-full py-5 rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${isCameraActive ? 'bg-amber-500 border-amber-600 text-white shadow-lg animate-pulse' : 'bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100'}`}
                >
                  <i className={`fa-solid ${isCameraActive ? 'fa-circle-dot' : 'fa-camera'} text-xl mb-1`}></i>
                  <span className="text-[10px] font-black uppercase tracking-widest">{isCameraActive ? 'Snap Now' : 'Camera'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 h-full py-5 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-400 flex flex-col items-center justify-center hover:bg-slate-100 transition-all"
                >
                  <i className="fa-solid fa-cloud-arrow-up text-xl mb-1"></i>
                  <span className="text-[10px] font-black uppercase tracking-widest">Upload</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
             </div>
          </div>

          {isCameraActive && (
            <div className="relative rounded-3xl overflow-hidden bg-black aspect-video shadow-2xl border-4 border-indigo-500">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <button type="button" onClick={stopCamera} className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />

          {image && !isCameraActive && (
            <div className="relative inline-block group">
              <div className="relative overflow-hidden rounded-3xl border-4 border-indigo-500 shadow-xl">
                 <img src={image} alt="Preview" className="h-48 w-48 object-cover" />
                 <div className="absolute inset-0 bg-indigo-600/10"></div>
              </div>
              <button type="button" onClick={() => setImage(null)} className="absolute -top-3 -right-3 bg-red-500 text-white w-9 h-9 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all hover:scale-110 z-10">
                <i className="fa-solid fa-trash-can text-sm"></i>
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-50">
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer group">
                <input type="checkbox" checked={socratic} onChange={(e) => setSocratic(e.target.checked)} className="sr-only peer" />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                <div className="ml-4 flex flex-col">
                  <span className="text-sm font-black text-slate-700">Socratic Mode</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">AI will guide your thinking</span>
                </div>
              </label>
            </div>
            
            <button
              type="submit"
              disabled={loading || (!concept && !image)}
              className="w-full sm:w-auto px-16 py-6 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 transition-all shadow-2xl shadow-indigo-300/60 disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  <span>Analyzing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  <span>Solve Concept</span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Result Section */}
      {result && (
        <div className="space-y-10 animate-in slide-in-from-bottom-12 duration-700">
          <div className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-2xl border border-indigo-50 space-y-12">
            <div className="prose prose-slate max-w-none">
              <div className="flex items-center gap-6 mb-10">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200">
                  <i className="fa-solid fa-brain text-3xl"></i>
                </div>
                <div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">AI Insights</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-lg tracking-widest border border-indigo-100">
                      {socratic ? 'Socratic Guidance' : 'Expert Explanation'}
                    </span>
                    <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase rounded-lg tracking-widest border border-slate-100">
                      Verified Data
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="whitespace-pre-wrap leading-relaxed text-slate-700 text-xl md:text-2xl font-medium">
                {result.text}
              </div>
            </div>

            {result.sources.length > 0 && (
              <div className="pt-10 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Cross-Verified Sources</h4>
                <div className="flex flex-wrap gap-4">
                  {result.sources.map((src, i) => (
                    <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] text-sm font-black text-indigo-600 hover:bg-white hover:border-indigo-300 hover:-translate-y-1 transition-all shadow-sm">
                      <i className="fa-solid fa-link"></i>
                      {src.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
            
            {/* Highly Visible Memory Boost Panel */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden group border border-slate-700/50 shadow-2xl shadow-slate-900/20">
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                  <div className="text-center md:text-left space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-2">
                       <i className="fa-solid fa-bolt"></i>
                       Next Step: Lock it in
                    </div>
                    <h4 className="text-3xl font-black leading-tight">Master this memory forever?</h4>
                    <p className="text-slate-400 font-medium text-lg max-w-md">Transform this raw analysis into memory-ready mnemonics or an engaging story.</p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <button 
                      onClick={handleMnemonicBoost}
                      disabled={boostLoading === 'mnemonic'}
                      className="flex-1 px-8 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/30 group/btn active:scale-95 disabled:opacity-50"
                    >
                      {boostLoading === 'mnemonic' ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-lightbulb group-hover/btn:animate-bounce"></i>}
                      Generate Mnemonics
                    </button>
                    <button 
                      onClick={handleStoryBoost}
                      disabled={boostLoading === 'story'}
                      className="flex-1 px-8 py-5 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
                    >
                      {boostLoading === 'story' ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-book-sparkles"></i>}
                      Story Mode
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full opacity-10 blur-[100px] -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 rounded-full opacity-5 blur-[80px] -ml-24 -mb-24"></div>
            </div>
          </div>

          {/* Mnemonics Render */}
          {mnemonics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-8 duration-500">
              {mnemonics.map((m, i) => (
                <div key={i} className="bg-white p-10 rounded-[2rem] border-l-[10px] border-indigo-600 shadow-xl hover:shadow-2xl transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">{m.type}</span>
                    <i className="fa-solid fa-key text-slate-100 text-3xl"></i>
                  </div>
                  <p className="text-3xl font-black text-slate-800 mb-6 italic leading-tight">"{m.phrase}"</p>
                  <p className="text-lg text-slate-500 font-medium leading-relaxed border-t border-slate-50 pt-6">{m.explanation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Story Render */}
          {story && (
            <div className="bg-white p-12 md:p-20 rounded-[3.5rem] shadow-2xl border border-indigo-50 animate-in slide-in-from-bottom-8 duration-1000">
               <div className="max-w-3xl mx-auto space-y-10">
                  <div className="text-center space-y-4">
                    <div className="inline-block px-4 py-1.5 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded-full tracking-[0.3em] border border-amber-100">Visualized Narrative</div>
                    <h3 className="text-5xl font-black text-slate-900 leading-tight">{story.title}</h3>
                    <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full"></div>
                  </div>
                  <div className="text-xl md:text-2xl text-slate-700 leading-loose font-medium first-letter:text-7xl first-letter:font-black first-letter:text-indigo-600 first-letter:mr-4 first-letter:float-left first-letter:mb-2">
                    {story.content}
                  </div>
                  <div className="flex justify-center pt-10">
                     <button className="flex items-center gap-2 text-indigo-600 font-black text-sm uppercase tracking-widest hover:gap-4 transition-all">
                        Keep for later <i className="fa-solid fa-arrow-right"></i>
                     </button>
                  </div>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Explainer;
