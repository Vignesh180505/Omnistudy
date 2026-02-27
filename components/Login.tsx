import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    try {
      setLoading(true);
      setError(null);

      const normalizedEmail = email.trim().toLowerCase();
      const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password);

      const user: User = {
        name: credential.user.displayName || normalizedEmail.split("@")[0],
        email: credential.user.email || normalizedEmail,
      };

      localStorage.setItem("omnistudy_user", JSON.stringify(user));
      onLogin(user);
    } catch (error) {
      console.error("Firebase Auth Error:", error);
      setError("Login failed. Check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-[2rem] text-white text-4xl font-black shadow-2xl shadow-indigo-200 mb-6">
            O
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">OmniStudy AI</h1>
          <p className="text-slate-500 mt-2 font-medium">Your personalized AI learning sanctuary.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Academic Email</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-lg font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-lg font-medium"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 font-semibold bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 hover:-translate-y-1 transition-all shadow-2xl shadow-indigo-100 disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <i className="fa-solid fa-circle-notch fa-spin"></i>
                  <span>Syncing Space...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <span>Enter Study Space</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button type="button" onClick={onSwitchToRegister} className="text-sm text-indigo-600 font-semibold">
              New here? Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
