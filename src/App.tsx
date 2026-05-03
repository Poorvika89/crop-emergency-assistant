import React, { useState, useEffect } from 'react';
import { Shield, Activity, Camera, Leaf, History, Home, LogIn, LogOut, ChevronRight, Zap, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from './lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import DiagnosisTool from './components/DiagnosisTool';
import Dashboard from './components/Dashboard';
import FeaturedApps from './components/FeaturedApps';
import Logo from './components/Logo';
import WeatherAlert from './components/WeatherAlert';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'diagnose' | 'dashboard'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center font-display">
        <div className="flex flex-col items-center">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Logo className="w-16 h-16" />
          </motion.div>
          <p className="text-emerald-900 font-black mt-4 tracking-tight">CROP RESCUE LABS</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FBF9] font-sans text-gray-900 selection:bg-emerald-200">
      {/* Premium Header */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-emerald-100/50 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between h-20 items-center">
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => setActiveTab('home')}
            >
              <Logo className="w-10 h-10 group-hover:rotate-12 transition-transform duration-500" />
              <div className="flex flex-col">
                <span className="font-black text-xl text-emerald-950 tracking-tighter leading-none">CropRescue</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Emergency AI</span>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-1 bg-emerald-50 p-1 rounded-2xl">
              <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} label="Home" />
              <NavButton active={activeTab === 'diagnose'} onClick={() => setActiveTab('diagnose')} label="AI Rescue" />
              <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} label="Farm Stats" />
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-emerald-900/40 hover:text-emerald-900 transition hover:bg-emerald-50 rounded-xl">
                 <Bell size={24} />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
              </button>
              {user ? (
                <div className="flex items-center gap-3 pl-4 border-l border-emerald-100">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-emerald-950 truncate max-w-[100px]">{user.displayName}</p>
                    <button onClick={logout} className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition uppercase tracking-widest">Sign Out</button>
                  </div>
                  <img src={user.photoURL || ''} alt="User" className="w-10 h-10 rounded-xl border-2 border-white shadow-md ring-1 ring-emerald-100" />
                </div>
              ) : (
                <button 
                  onClick={login}
                  className="bg-emerald-950 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-emerald-800 transition flex items-center gap-2 shadow-xl shadow-emerald-900/10 active:scale-95"
                >
                  <LogIn size={18} /> Login
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 relative">
        <WeatherAlert />
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-24"
            >
              {/* Hero Section */}
              <div className="grid lg:grid-cols-2 gap-16 items-center pt-8">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase">
                    <Zap size={14} className="fill-current" /> Powered by Gemini 1.5 Pro
                  </div>
                  <h1 className="text-6xl md:text-8xl font-black text-emerald-950 tracking-tighter leading-[0.9]">
                    Saving Crops, <span className="text-emerald-500">Fast.</span>
                  </h1>
                  <p className="text-xl text-emerald-900/60 font-medium max-w-lg leading-relaxed">
                    Identify plant diseases and pest infestations with surgical precision. Get action steps in 30 seconds.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => setActiveTab('diagnose')}
                      className="bg-emerald-600 text-white px-10 py-5 rounded-[2rem] font-black text-lg hover:bg-emerald-700 transition shadow-2xl shadow-emerald-300 flex items-center justify-center gap-3 group"
                    >
                      Start Analysis <ChevronRight className="group-hover:translate-x-2 transition-transform" />
                    </button>
                    <button 
                      onClick={() => setActiveTab('dashboard')}
                      className="bg-white text-emerald-950 border border-emerald-100 px-10 py-5 rounded-[2rem] font-black text-lg hover:bg-emerald-50 transition shadow-sm flex items-center justify-center gap-3"
                    >
                      View Farm Stats
                    </button>
                  </div>
                </div>
                
                <div className="relative">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative z-10 aspect-square rounded-[4rem] bg-gradient-to-br from-emerald-100 to-emerald-50 overflow-hidden border border-white shadow-2xl"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1592659762303-90081d34b277?q=80&w=1000&auto=format&fit=crop" 
                      alt="Agri Tech" 
                      className="w-full h-full object-cover opacity-80 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-emerald-900/10" />
                    <div className="absolute bottom-8 left-8 right-8 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                      <div className="flex items-center gap-4">
                         <div className="bg-emerald-600 p-3 rounded-2xl text-white">
                            <Activity size={24} />
                         </div>
                         <div>
                            <p className="text-sm font-black text-emerald-900">Real-time Precision</p>
                            <p className="text-xs text-emerald-800 font-bold opacity-70">98.4% Diagnostic Accuracy</p>
                         </div>
                      </div>
                    </div>
                  </motion.div>
                  {/* Decorative blobs */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-yellow-200/40 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl" />
                </div>
              </div>

              {/* Tools Section */}
              <FeaturedApps />
            </motion.div>
          )}

          {activeTab === 'diagnose' && (
            <motion.div key="diagnose" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <DiagnosisTool user={user} />
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Dashboard user={user} login={login} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Bottom Tab Bar (Mobile) */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 bg-emerald-950 text-white rounded-[2.5rem] p-2 flex justify-between items-center z-[1000] shadow-2xl backdrop-blur-md border border-white/10">
        <MobileNavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home />} label="Home" />
        <MobileNavButton active={activeTab === 'diagnose'} onClick={() => setActiveTab('diagnose')} icon={<Camera />} label="AI AI" />
        <MobileNavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Activity />} label="Stats" />
      </div>
    </div>
  );
}

function NavButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${active ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-900/40 hover:text-emerald-900 hover:bg-white/50'}`}
    >
      {label}
    </button>
  );
}

function MobileNavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-[2rem] transition-all duration-500 ${active ? 'bg-emerald-600 text-white translate-y-[-10px] shadow-lg ring-4 ring-emerald-950' : 'text-emerald-100/40 opacity-80'}`}
    >
      {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );
}

