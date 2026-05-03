import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Bell, MessageSquare, AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface MobileAlertProps {
  show: boolean;
  onClose: () => void;
  message: string;
  issue: string;
  type?: 'EMERGENCY' | 'WEATHER';
}

export default function MobileAlert({ show, onClose, message, issue, type = 'EMERGENCY' }: MobileAlertProps) {
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    if (show) {
      // Play a subtle notification sound if possible
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (e) {}

      const timer = setTimeout(onClose, 10000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          className="fixed inset-x-0 bottom-24 md:bottom-10 md:right-10 md:left-auto z-[2000] flex justify-center px-4"
        >
          <div className="bg-white rounded-[3rem] shadow-2xl border-[6px] border-emerald-950 w-full max-w-[340px] overflow-hidden relative">
            <button 
              onClick={onClose}
              className="absolute top-12 right-6 z-20 p-2 bg-emerald-100 text-emerald-900 rounded-full"
            >
              <X size={16} />
            </button>

            {/* Phone Top Notch */}
            <div className="h-10 bg-emerald-950 flex items-center justify-center">
              <div className="w-20 h-5 bg-black rounded-full" />
            </div>
            
            <div className="p-6 bg-slate-50 h-[450px] flex flex-col font-sans">
              <div className="flex justify-between items-center mb-6">
                <p className="text-xs font-black text-emerald-900">{time}</p>
                <div className="flex gap-1.5 items-center">
                   <div className="w-1.5 h-1.5 bg-emerald-900 rounded-full" />
                   <div className="w-1.5 h-1.5 bg-emerald-900 rounded-full" />
                   <div className="w-1.5 h-1.5 bg-emerald-900/30 rounded-full" />
                </div>
              </div>

              {/* Notification Banner */}
              <motion.div 
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className={`p-4 rounded-3xl shadow-xl flex gap-4 border ${type === 'EMERGENCY' ? 'bg-red-600 text-white border-red-700' : 'bg-amber-500 text-white border-amber-600'}`}
              >
                <div className="bg-white/20 p-2 rounded-xl">
                  <Bell size={24} className="animate-ring" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-0.5">
                     {type === 'EMERGENCY' ? 'Crop Emergency Dispatch' : 'Climate Warning'}
                   </p>
                   <p className="text-sm font-black leading-tight">{issue}</p>
                </div>
              </motion.div>

              <div className="mt-8 flex-1 space-y-4 overflow-y-auto pr-1">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-emerald-100 max-w-[85%]">
                  <p className="text-[11px] font-semibold text-emerald-900 leading-relaxed">
                    🚨 URGENT: Our AI detected a {type.toLowerCase()} threat on your farm.
                  </p>
                </div>
                
                <div className="bg-emerald-600 text-white p-3 rounded-2xl rounded-tr-none shadow-sm self-end ml-auto max-w-[85%]">
                  <p className="text-[11px] font-bold">
                    Acknowledged. What are the immediate rescue steps?
                  </p>
                </div>

                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-emerald-100 max-w-[85%]">
                  <p className="text-[11px] font-medium text-gray-600">
                    {message || "Checking localized data... Please follow the app guide immediately."}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                 <button 
                  onClick={onClose}
                  className="w-full bg-emerald-950 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-800 transition shadow-lg active:scale-95"
                >
                  I am at the farm now
                </button>
                <p className="text-[9px] text-center text-gray-400 font-bold uppercase tracking-widest">AIS-AGRI SECURE CHANNEL</p>
              </div>
            </div>
          </div>
          
          <div className="absolute -bottom-12 flex justify-center w-full">
             <div className="bg-emerald-950/90 backdrop-blur-xl text-white px-5 py-2 rounded-full text-[10px] font-black flex items-center gap-2 shadow-2xl border border-white/10">
                <Smartphone size={14} className="text-emerald-400" /> CROP-NET SIMULATOR ACTIVE
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
