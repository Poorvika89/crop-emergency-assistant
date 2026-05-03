import React from 'react';
import { Bug, Thermometer, CloudRain, BookOpen, Users, PhoneCall, Smartphone, BellRing } from 'lucide-react';
import { motion } from 'motion/react';

export default function FeaturedApps() {
  const tools = [
    { icon: <Smartphone />, title: "Mobile Warning", desc: "Get SMS & WhatsApp alerts for high-risk outbreaks.", color: "bg-red-50 text-red-600" },
    { icon: <BellRing />, title: "Panic Broadcast", desc: "Inform nearby farms of localized pest movements.", color: "bg-orange-50 text-orange-600" },
    { icon: <Bug />, title: "Pest Library", desc: "Identify 500+ common Indian crop pests.", color: "bg-amber-50 text-amber-600" },
    { icon: <Thermometer />, title: "Climate Sentinel", desc: "Disease risk forecasts based on local humidity.", color: "bg-blue-50 text-blue-600" },
    { icon: <CloudRain />, title: "Precise Spraying", desc: "Calculate exact pesticide doses for your area.", color: "bg-emerald-50 text-emerald-600" },
    { icon: <PhoneCall />, title: "Expert Hotline", desc: "Direct call to government agricultural officers.", color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
        <div>
          <h2 className="text-3xl font-black text-emerald-950 mb-2">Featured Agri-Tools</h2>
          <p className="text-gray-500 font-medium">Professional grade applications for modern farms.</p>
        </div>
        <button className="text-emerald-600 font-bold hover:underline">View All Extensions →</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-[2rem] border border-emerald-100 shadow-sm flex items-start gap-4 hover:shadow-xl transition group"
          >
            <div className={`p-4 rounded-2xl ${tool.color} group-hover:scale-110 transition`}>
              {React.cloneElement(tool.icon as React.ReactElement, { size: 24 })}
            </div>
            <div>
              <h3 className="font-bold text-emerald-950 mb-1">{tool.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{tool.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 bg-emerald-900 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="bg-emerald-400/20 text-emerald-300 px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-4 inline-block">
            Pro Feature
          </span>
          <h3 className="text-4xl font-black mb-4">Join 50,000+ Farmers Protecting Their Yields.</h3>
          <p className="text-emerald-100/70 mb-8 font-medium">Get real-time SMS alerts for disease outbreaks in your pin code area.</p>
          <button className="bg-white text-emerald-900 px-8 py-4 rounded-2xl font-black hover:bg-emerald-50 transition shadow-xl">
            Register Your Farm
          </button>
        </div>
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-700/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>
    </div>
  );
}
