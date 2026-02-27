
import React, { useState, useRef, useEffect } from 'react';
import { chatWithDocument } from '../services/geminiService';
import { ChatMessage } from '../types';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.mjs`;

const DocStudy: React.FC = () => {
  const [docContent, setDocContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [socratic, setSocratic] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setExtracting(true);
    
    try {
      if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = async () => {
          const typedArray = new Uint8Array(reader.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item: any) => item.str).join(' ') + '\n';
          }
          setDocContent(text);
          setExtracting(false);
          setMessages([{ role: 'model', text: `Loaded "${file.name}". What would you like to know from this document?` }]);
        };
        reader.readAsArrayBuffer(file);
      } else {
        const text = await file.text();
        setDocContent(text);
        setExtracting(false);
        setMessages([{ role: 'model', text: `Loaded "${file.name}". How can I help you study these notes?` }]);
      }
    } catch (err) {
      console.error(err);
      alert('Error reading file');
      setExtracting(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !docContent) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await chatWithDocument([...messages, userMsg], docContent, socratic);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error processing that request." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <i className="fa-solid fa-file-pdf text-indigo-600"></i>
            Doc Chat
          </h2>
          <p className="text-slate-500 font-medium">Chat with your specific lecture notes or textbooks.</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all shadow-sm">
            <input type="checkbox" checked={socratic} onChange={(e) => setSocratic(e.target.checked)} className="rounded text-indigo-600" />
            <span className="text-sm font-bold text-slate-600">Socratic Mode</span>
          </label>
          <button 
            onClick={() => {setDocContent(''); setFileName(''); setMessages([]);}}
            className="text-xs font-bold text-red-400 hover:text-red-500 uppercase tracking-widest"
          >
            Clear Document
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {!docContent ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mb-6 animate-pulse">
               <i className="fa-solid fa-cloud-arrow-up text-4xl"></i>
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Upload your Study Material</h3>
            <p className="text-slate-500 max-w-sm mb-8">Upload a PDF or text file to start a specialized learning session based on its content.</p>
            <label className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black cursor-pointer hover:bg-indigo-700 transition shadow-indigo-200 shadow-xl">
              {extracting ? 'Reading Document...' : 'Choose File'}
              <input type="file" onChange={handleFileUpload} accept=".pdf,.txt" className="hidden" disabled={extracting} />
            </label>
          </div>
        ) : (
          <>
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-bold text-slate-600 truncate max-w-xs">{fileName}</span>
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI RAG Session Active</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tr-none' 
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                  }`}>
                    <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none border border-slate-200">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-.3s]"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-.5s]"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question about the document..."
                  className="flex-1 px-5 py-4 bg-slate-50 rounded-2xl border border-transparent focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  <i className="fa-solid fa-paper-plane text-xl"></i>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default DocStudy;
