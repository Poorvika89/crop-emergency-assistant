import React, { useState, useRef } from 'react';
import { Camera, Mic, Send, Image as ImageIcon, Loader2, AlertCircle, Volume2, Repeat, CheckCircle, Leaf, BookOpen, Smartphone, ShieldAlert, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { diagnoseCrop } from '../services/gemini';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';
import Logo from './Logo';
import MobileAlert from './MobileAlert';

interface DiagnosisResult {
  raw: string;
  parsed: {
    issue: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    severityLevel: string;
    reason: string;
    actions: string[];
    avoid: string[];
    spreadRisk: string;
    why: string;
    nextStep: string;
    urgency: string;
    languages: {
      hindi: string;
      kannada: string;
      marathi: string;
      tamil: string;
      telugu: string;
    };
    voiceGuide: string;
    shortSummary: string;
  };
}

export default function DiagnosisTool({ user }: { user: User | null }) {
  const [inputMode, setInputMode] = useState<'text' | 'image'>('image');
  const [textInput, setTextInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLang, setVoiceLang] = useState<'en-IN' | 'hi-IN' | 'kn-IN'>('en-IN');
  const [selectedLang, setSelectedLang] = useState<keyof DiagnosisResult['parsed']['languages']>('hindi');
  const [showMobileAlert, setShowMobileAlert] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!textInput && !selectedImage) return;

    setIsAnalyzing(true);
    setResult(null);
    setErrorStatus(null);

    try {
      const base64Image = selectedImage ? selectedImage.split(',')[1] : undefined;
      const responseText = await diagnoseCrop({
        text: textInput,
        image: base64Image,
        mimeType: mimeType || undefined,
      });

      if (responseText) {
        const parsed = parseGeminiResponse(responseText);
        const diagResult = { raw: responseText, parsed };
        setResult(diagResult);

        // Trigger Mobile Warning for High severity
        if (parsed.severity === 'HIGH') {
          setShowMobileAlert(true);
        }

        if (user) {
          await addDoc(collection(db, 'reports'), {
            userId: user.uid,
            cropIssue: parsed.issue,
            severity: parsed.severity,
            symptoms: textInput || 'Image scan',
            timestamp: serverTimestamp(),
            imageUrl: selectedImage || null,
            spreadRisk: parsed.spreadRisk,
            actions: parsed.actions,
          });
        }
      }
    } catch (error: any) {
      console.error("Diagnosis failed", error);
      setErrorStatus(error.message || "An unexpected error occurred during diagnosis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const parseGeminiResponse = (text: string) => {
    const getField = (label: string) => {
      const regex = new RegExp(`${label}:?\\s*([\\s\\S]*?)(?=\\n[🌿📊🚨⚠️📈💡🧪⏰🌍🇮🇳🔊🔁]|$)`, 'i');
      return text.match(regex)?.[1]?.trim() || '';
    };

    const getList = (label: string) => {
      const field = getField(label);
      return field.split('\n').map(line => line.replace(/^[-*•\d.]+\s*/, '').trim()).filter(Boolean);
    };

    const severityField = getField('📊 Severity Level');
    const severity: 'LOW' | 'MEDIUM' | 'HIGH' = severityField.includes('HIGH') ? 'HIGH' : severityField.includes('MEDIUM') ? 'MEDIUM' : 'LOW';

    return {
      issue: getField('🌿 Crop Issue'),
      severity,
      severityLevel: severityField.split('\n')[0],
      reason: severityField.split('Reason:')[1]?.trim() || '',
      actions: getList('🚨 IMMEDIATE ACTION'),
      avoid: getList('⚠️ AVOID THESE MISTAKES'),
      spreadRisk: getField('📈 SPREAD RISK'),
      why: getField('💡 WHY THIS HAPPENS'),
      nextStep: getField('🧪 OPTIONAL NEXT STEP'),
      urgency: getField('⏰ URGENCY'),
      languages: {
        hindi: getField('🇮🇳 Hindi'),
        kannada: getField('🇮🇳 Kannada'),
        marathi: getField('🇮🇳 Marathi'),
        tamil: getField('🇮🇳 Tamil'),
        telugu: getField('🇮🇳 Telugu'),
      },
      voiceGuide: getField('🔊 Voice Guide'),
      shortSummary: getField('🔁 Repeat Instructions'),
    };
  };

  const startVoiceCapture = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLang;
    recognition.start();
    setIsRecording(true);

    recognition.onstart = () => {
      setIsRecording(true);
      setErrorStatus(null);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTextInput(transcript);
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setErrorStatus(`Voice capture error: ${event.error}. Please try typing.`);
      setIsRecording(false);
    };
    
    recognition.onend = () => setIsRecording(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Mobile Alert Overlay */}
      <MobileAlert 
        show={showMobileAlert} 
        onClose={() => setShowMobileAlert(false)} 
        message={result?.parsed.voiceGuide || ''}
        issue={result?.parsed.issue || ''}
      />

      <div className="bg-white p-6 sm:p-10 rounded-[2rem] border border-emerald-100 shadow-xl shadow-emerald-900/5">
        <h2 className="text-3xl font-black text-emerald-950 mb-2">Emergency Rescue Center</h2>
        <p className="text-gray-500 mb-8">Scan your crop for an immediate life-saving protocol.</p>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="flex gap-2 p-1 bg-emerald-50 rounded-2xl w-fit">
              <button 
                onClick={() => setInputMode('image')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition ${inputMode === 'image' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-700 hover:bg-emerald-100'}`}
              >
                <Camera size={18} /> Image Scan
              </button>
              <button 
                onClick={() => setInputMode('text')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition ${inputMode === 'text' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-700 hover:bg-emerald-100'}`}
              >
                <Send size={18} /> Detail Report
              </button>
            </div>

            {inputMode === 'image' ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square bg-emerald-50 rounded-3xl border-4 border-dashed border-emerald-200 flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-emerald-100 transition relative overflow-hidden group"
              >
                {selectedImage ? (
                  <img src={selectedImage} alt="Crop" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <>
                    <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 text-emerald-600 group-hover:scale-110 transition">
                      <Camera size={40} />
                    </div>
                    <span className="font-bold text-emerald-900">Tap to Take Photo</span>
                    <span className="text-emerald-600 text-sm">or Choose from Gallery</span>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/*" 
                  capture="environment" 
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="space-y-4">
                <textarea 
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Describe white spots, leaf curling, or pest sightings..."
                  className="w-full h-48 bg-emerald-50 rounded-3xl p-6 border-0 focus:ring-2 focus:ring-emerald-500 text-emerald-900 placeholder-emerald-300 font-medium align-top resize-none"
                />
                
                <div className="flex gap-2 mb-2">
                   {(['en-IN', 'hi-IN', 'kn-IN'] as const).map(lang => (
                     <button 
                       key={lang}
                       onClick={() => setVoiceLang(lang)}
                       className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${voiceLang === lang ? 'bg-emerald-900 text-white' : 'bg-emerald-100 text-emerald-600'}`}
                     >
                       {lang.split('-')[0]}
                     </button>
                   ))}
                </div>

                <button 
                  onClick={startVoiceCapture}
                  className={`w-full py-5 rounded-[2rem] flex items-center justify-center gap-4 font-black transition relative overflow-hidden ${isRecording ? 'bg-red-500 text-white shadow-red-200 shadow-xl' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'}`}
                >
                  {isRecording && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                  <div className={`relative z-10 p-2 rounded-full ${isRecording ? 'bg-white text-red-600' : 'bg-emerald-200 text-emerald-600'}`}>
                    <Mic size={20} className={isRecording ? 'animate-bounce' : ''} />
                  </div>
                  <span className="relative z-10">
                    {isRecording ? 'Listening for Symptoms...' : 'Describe symptoms via Voice'}
                  </span>
                </button>
              </div>
            )}

            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!selectedImage && !textInput)}
              className="w-full bg-emerald-900 text-white py-5 rounded-[2rem] font-bold text-xl hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-3 shadow-xl"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" /> Analyzing Symptoms...
                </>
              ) : (
                <>
                  Generate Rescue Plan <CheckCircle size={24} />
                </>
              )}
            </button>

            {errorStatus && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-red-800 text-sm font-medium">{errorStatus}</p>
              </div>
            )}
          </div>

          {/* Tips Section */}
          <div className="hidden lg:block bg-emerald-50 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="font-bold text-emerald-900 text-lg flex items-center gap-2">
              <AlertCircle size={20} /> Field Expert Tips
            </h3>
            <ul className="space-y-4">
              <Tip icon="01" text="Ensure leaf symptoms are in natural light for accurate photo analysis." />
              <Tip icon="02" text="Mention if the issue is spreading fast or localized to a few plants." />
              <Tip icon="03" text="Check soil moisture and recent weather changes before reporting." />
            </ul>
            <div className="pt-6 relative">
               <div className="absolute top-0 right-0 p-4 bg-emerald-600 rounded-full text-white -translate-y-1/2 shadow-lg">
                  <Leaf className="w-6 h-6" />
               </div>
               <div className="bg-white p-6 rounded-3xl border border-emerald-100">
                  <p className="text-emerald-900 font-bold italic mb-2">"Preventing spread is 10x cheaper than curing an outbreak."</p>
                  <p className="text-emerald-600 text-xs">- Dr. Sharma, Agri Scientist</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result Section */}
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className={`p-8 rounded-[3rem] border-l-[12px] shadow-2xl relative overflow-hidden ${
              result.parsed.severity === 'HIGH' ? 'bg-red-50 border-red-500' : 
              result.parsed.severity === 'MEDIUM' ? 'bg-orange-50 border-orange-500' : 
              'bg-emerald-50 border-emerald-500'
            }`}>
              <div className="relative z-10 space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div>
                    <span className={`px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-4 inline-block ${
                      result.parsed.severity === 'HIGH' ? 'bg-red-600 text-white' : 
                      result.parsed.severity === 'MEDIUM' ? 'bg-orange-600 text-white' : 
                      'bg-emerald-600 text-white'
                    }`}>
                      {result.parsed.severityLevel}
                    </span>
                    <h2 className="text-4xl font-black text-gray-900 leading-tight">
                      {result.parsed.issue}
                    </h2>
                    <p className="text-gray-600 font-medium italic mt-2">{result.parsed.reason}</p>
                    
                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={() => {
                          const text = `🚨 CROP EMERGENCY: ${result.parsed.issue}\n\nSteps:\n${result.parsed.actions.join('\n')}`;
                          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                        }}
                        className="bg-[#25D366] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:scale-105 transition shadow-lg"
                      >
                         Share to WhatsApp
                      </button>
                      <button 
                        className="bg-emerald-950 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:scale-105 transition shadow-lg"
                      >
                         Broadcast to Village
                      </button>
                    </div>
                  </div>
                  <div className="bg-white/50 backdrop-blur rounded-2xl p-4 border border-white">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">Time Sensitivity</p>
                    <p className="text-emerald-900 font-black flex items-center gap-2">
                       <Repeat className="w-5 h-5 text-emerald-600" /> {result.parsed.urgency}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                   {/* Immediate Actions */}
                   <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-black/5">
                      <h3 className="font-bold text-emerald-900 mb-6 flex items-center gap-3 text-lg">
                        <div className="bg-red-100 p-2 rounded-xl text-red-600">
                           <AlertCircle size={20} />
                        </div>
                        IMMEDIATE RESCUE STEPS
                      </h3>
                      <div className="space-y-4">
                        {result.parsed.actions.map((act, i) => (
                          <div key={i} className="flex gap-4">
                             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                                {i + 1}
                             </div>
                             <p className="text-gray-700 font-medium pt-1">{act}</p>
                          </div>
                        ))}
                      </div>
                   </div>

                   {/* Risks & Prevention */}
                   <div className="space-y-6">
                      <div className="bg-red-600 text-white p-8 rounded-[2rem] shadow-xl">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                           <AlertCircle size={20} /> NEVER DO THESE:
                        </h3>
                        <ul className="space-y-2 opacity-90 font-medium">
                          {result.parsed.avoid.map((a, i) => <li key={i}>• {a}</li>)}
                        </ul>
                      </div>

                      <div className="bg-white p-8 rounded-[2rem] border border-black/5">
                         <h3 className="font-bold text-emerald-950 mb-2">📊 Spread Risk</h3>
                         <p className="text-gray-600 text-sm mb-4 italic font-medium">{result.parsed.spreadRisk}</p>
                         <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                            <div 
                               className="h-full bg-emerald-600 transition-all duration-1000" 
                               style={{ width: result.parsed.spreadRisk.includes('HIGH') ? '100%' : result.parsed.spreadRisk.includes('MEDIUM') ? '60%' : '20%' }}
                            />
                         </div>
                      </div>
                   </div>
                </div>

                {/* Why & Local Languages */}
                <div className="grid md:grid-cols-3 gap-6">
                   <div className="bg-emerald-950 text-white p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between col-span-1 md:col-span-3 border border-white/10 shadow-xl mb-4 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-red-600 p-3 rounded-2xl animate-pulse shadow-lg shadow-red-500/20">
                          <Smartphone size={24} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 mb-1">Mobile Alert Protocol Active</p>
                          <h4 className="font-black text-xl flex items-center gap-2">
                             System Dispatched Warn to +91 91*** ***10
                             <ShieldCheck className="text-emerald-400" size={18} />
                          </h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                           <p className="text-[10px] font-black uppercase text-emerald-500">Carrier Sync</p>
                           <p className="text-sm font-bold opacity-60">AgriPulse v1.2.4</p>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="text-right">
                           <p className="text-sm font-black text-emerald-400">DISPATCHED</p>
                           <p className="text-[10px] opacity-40">Ref: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                        </div>
                      </div>
                   </div>

                   <div className="bg-emerald-900 text-white p-8 rounded-3xl col-span-1 md:col-span-1 border border-white/10 shadow-lg">
                      <h4 className="text-[10px] font-black uppercase opacity-50 mb-4 tracking-widest flex items-center gap-2">
                        <BookOpen size={14} /> Expert Analysis
                      </h4>
                      <p className="text-sm font-medium leading-relaxed">{result.parsed.why}</p>
                   </div>
                   
                   <div className="bg-white p-8 rounded-3xl border border-black/5 col-span-1 md:col-span-2 shadow-sm relative overflow-hidden group">
                      <div className="flex flex-wrap items-center justify-between mb-6 gap-4 relative z-10">
                        <h4 className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Local Translations</h4>
                        <div className="flex flex-wrap gap-2">
                          {(['hindi', 'kannada', 'marathi', 'tamil', 'telugu'] as const).map(lang => (
                            <button 
                              key={lang}
                              onClick={() => setSelectedLang(lang)}
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${selectedLang === lang ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="relative z-10 min-h-[100px] flex items-center">
                         <p className="text-emerald-950 font-bold text-xl leading-relaxed">
                            {result.parsed.languages[selectedLang]}
                         </p>
                      </div>
                      <div className="absolute bottom-[-20%] right-[-10%] opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                        <Logo className="w-64 h-64" />
                      </div>
                   </div>
                </div>

                {/* Voice Guide */}
                <div className="bg-white/40 backdrop-blur-xl border border-white p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-6">
                   <div className="bg-emerald-600 text-white p-4 rounded-full shadow-lg shadow-emerald-200">
                      <Volume2 size={32} />
                   </div>
                   <div className="flex-1 text-center md:text-left">
                      <h4 className="font-black text-emerald-950">Voice Assistant Protocol</h4>
                      <p className="text-emerald-700 italic font-medium">"{result.parsed.voiceGuide}"</p>
                   </div>
                   <button 
                     onClick={() => {
                        const msg = new SpeechSynthesisUtterance(result.parsed.voiceGuide);
                        window.speechSynthesis.speak(msg);
                     }}
                     className="bg-emerald-950 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-800 transition"
                   >
                      Play Guide
                   </button>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Tip({ icon, text }: { icon: string, text: string }) {
  return (
    <li className="flex gap-4">
      <span className="flex-shrink-0 font-black text-emerald-200 text-2xl leading-none">{icon}</span>
      <span className="text-emerald-800 font-medium text-sm leading-snug">{text}</span>
    </li>
  );
}
