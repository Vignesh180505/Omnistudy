
import React from 'react';
import { View, User } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  onNavigate: (view: View) => void;
  user: User;
}

const data = [
  { name: 'Mon', hours: 2.5 },
  { name: 'Tue', hours: 4.1 },
  { name: 'Wed', hours: 3.2 },
  { name: 'Thu', hours: 1.8 },
  { name: 'Fri', hours: 5.4 },
  { name: 'Sat', hours: 6.0 },
  { name: 'Sun', hours: 4.8 },
];

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, user }) => {
  return (
    <div className="space-y-10 pb-20">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900">Hello, {user.name.split(' ')[0]}! 👋</h1>
        <p className="text-slate-500 text-lg">What are we mastering today?</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { id: View.EXPLAINER, title: 'Deep Dive', desc: 'Simplify complex concepts', icon: 'fa-brain', color: 'bg-indigo-600' },
          { id: View.SUMMARIZER, title: 'Summarize', desc: 'Crush long notes fast', icon: 'fa-compress', color: 'bg-emerald-500' },
          { id: View.QUIZ, title: 'Self Test', desc: 'Test your knowledge', icon: 'fa-check-double', color: 'bg-amber-500' },
          { id: View.FLASHCARDS, title: 'Flashcards', desc: 'Retain everything', icon: 'fa-bolt', color: 'bg-rose-500' },
        ].map((tool) => (
          <button
            key={tool.id}
            onClick={() => onNavigate(tool.id)}
            className="group relative bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all text-left overflow-hidden"
          >
            <div className={`w-12 h-12 ${tool.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              <i className={`fa-solid ${tool.icon} text-xl`}></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800">{tool.title}</h3>
            <p className="text-slate-500 text-sm mt-1">{tool.desc}</p>
          </button>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold">Study Activity</h3>
            <select className="text-sm bg-slate-50 border-none rounded-lg px-3 py-1 text-slate-500 font-medium">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? '#4f46e5' : '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-indigo-600 rounded-3xl p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-indigo-200 shadow-xl">
           <div className="relative z-10">
              <h3 className="text-2xl font-black mb-2">Pro Tip</h3>
              <p className="text-indigo-100 leading-relaxed">
                Active recall and spaced repetition are your best friends. Try generating a quiz right after summarizing your notes!
              </p>
           </div>
           <div className="relative z-10 mt-8">
              <button 
                onClick={() => onNavigate(View.QUIZ)}
                className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl hover:bg-indigo-50 transition shadow-lg"
              >
                Boost Memory Now
              </button>
           </div>
           {/* Decorative shapes */}
           <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-indigo-500 rounded-full opacity-50"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-indigo-400 rounded-full opacity-30"></div>
        </div>
      </div>

      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-bold mb-6">Learning Streak</h3>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 shadow-inner">
             <i className="fa-solid fa-fire text-3xl"></i>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-800">12 Days</div>
            <p className="text-slate-500 font-medium">Keep it up! You're in the top 5% of learners this month.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
