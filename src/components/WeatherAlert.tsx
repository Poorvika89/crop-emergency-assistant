import React, { useState, useEffect } from 'react';
import { CloudRain, Wind, Thermometer, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import MobileAlert from './MobileAlert';

export default function WeatherAlert() {
  const [activeAlert, setActiveAlert] = useState<{ issue: string; type: string } | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Initial simulated delay for a weather alert
    const timer = setTimeout(() => {
      const alerts = [
        { issue: "Sudden Humidity Surge: High Blight Risk", type: "WEATHER" },
        { issue: "Unseasonal Rain Forecast: Prevent Root Rot", type: "WEATHER" },
        { issue: "Heat Wave Alert: Increase Irrigation", type: "WEATHER" }
      ];
      const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
      setActiveAlert(randomAlert);
      setShowNotification(true);
    }, 5000); // 5 seconds instead of 15

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <MobileAlert 
        show={showNotification} 
        onClose={() => setShowNotification(false)} 
        issue={activeAlert?.issue || "Climate Change Detected"}
        message="Local weather telemetry indicates high risk for fungal spread. Please check your dashboard for preventative sprays."
        type="WEATHER"
      />
      
      <AnimatePresence>
        {activeAlert && !showNotification && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="fixed top-24 left-6 z-[100] max-w-sm hidden lg:block"
          >
            <div className="bg-amber-600 text-white p-6 rounded-[2rem] shadow-2xl border-2 border-white flex gap-4 relative overflow-hidden">
               <div className="bg-white/20 p-3 rounded-2xl self-start">
                  <CloudRain />
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Localized Weather Risk</span>
                  </div>
                  <p className="font-black text-sm">{activeAlert.issue}</p>
                  <p className="text-[10px] opacity-70 mt-1 font-medium italic">Station ID: AIS-K0291</p>
               </div>
               <button 
                onClick={() => setActiveAlert(null)}
                className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full"
               >
                <X size={14} />
               </button>
               {/* Pulse effect */}
               <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full blur-2xl animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
