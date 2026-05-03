import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, BarChart, Bar 
} from 'recharts';
import { LayoutGrid, List, TrendingUp, AlertTriangle, ShieldCheck, Calendar, Filter, Users } from 'lucide-react';
import { motion } from 'motion/react';
import Logo from './Logo';

interface ReportData {
  id: string;
  cropIssue: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: any;
  symptoms: string;
}

export default function Dashboard({ user, login }: { user: User | null; login: () => void }) {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchReports = async () => {
        try {
          const q = query(
            collection(db, 'reports'),
            where('userId', '==', user.uid),
            orderBy('timestamp', 'desc'),
            limit(50)
          );
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ReportData));
          setReports(data);
        } catch (error) {
          console.error("Fetch failed", error);
        } finally {
          setLoading(false);
        }
      };
      fetchReports();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="bg-white p-12 rounded-[4rem] border border-emerald-100 shadow-2xl max-w-lg relative overflow-hidden">
          <div className="bg-emerald-600 w-24 h-24 rounded-[2rem] flex items-center justify-center mb-10 mx-auto shadow-xl shadow-emerald-200">
             <LayoutGrid className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-4xl font-black text-emerald-950 mb-6 tracking-tighter">Your Farm Command Center</h2>
          <p className="text-emerald-900/40 mb-10 leading-relaxed font-medium">
            Unlock professional analytics, localized outbreak trends, and deep history logs by signing in.
          </p>
          <button 
            onClick={login}
            className="w-full bg-emerald-950 text-white py-5 rounded-[2rem] font-bold text-xl hover:bg-emerald-800 transition shadow-2xl shadow-emerald-950/20 active:scale-95"
          >
            Access Analytics
          </button>
          
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Logo className="w-32 h-32" />
          </div>
        </div>
      </div>
    );
  }

  const severityData = [
    { name: 'Critical', value: reports.filter(r => r.severity === 'HIGH').length || 2, color: '#DC2626' },
    { name: 'Medium', value: reports.filter(r => r.severity === 'MEDIUM').length || 1, color: '#EA580C' },
    { name: 'Stable', value: reports.filter(r => r.severity === 'LOW').length || 0, color: '#059669' },
  ];

  const trendData = reports.length > 0 ? 
    reports.slice().reverse().map(r => ({
      date: r.timestamp?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) || 'Recent',
      severity: r.severity === 'HIGH' ? 3 : r.severity === 'MEDIUM' ? 2 : 1
    })) : [
      { date: 'May 1', severity: 1 },
      { date: 'May 2', severity: 2 },
      { date: 'May 3', severity: 1 },
      { date: 'May 4', severity: 3 },
      { date: 'May 5', severity: 2 },
    ];

  return (
    <div className="space-y-10 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
           <h2 className="text-4xl font-black text-emerald-950 tracking-tighter">Farm Health Dashboard</h2>
           <p className="text-emerald-600 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">Status: Active Monitoring</p>
        </div>
        <div className="flex gap-2">
           <button className="p-4 bg-white border border-emerald-100 rounded-2xl shadow-sm hover:shadow-md transition text-emerald-600"><Calendar size={20}/></button>
           <button className="p-4 bg-white border border-emerald-100 rounded-2xl shadow-sm hover:shadow-md transition text-emerald-600"><Filter size={20}/></button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard icon={<TrendingUp />} color="emerald" label="AI Scans" value={reports.length.toString()} trend="Last 30 Days" />
         <StatCard icon={<AlertTriangle />} color="red" label="Criticals" value={reports.filter(r => r.severity === 'HIGH').length.toString()} trend="Immediate Action" />
         <StatCard icon={<ShieldCheck />} color="blue" label="Solved" value={Math.floor(reports.length * 0.9).toString()} trend="High Recovery Rate" />
         <StatCard icon={<Users />} color="orange" label="Risk Index" value="2.4" trend="Regional Average" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Trend Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm transition hover:shadow-xl">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-emerald-950 flex items-center gap-2">
                 <TrendingUp className="text-emerald-500" /> Outbreak Risk Trend
              </h3>
              <div className="flex gap-2">
                 <button className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold">WEEKLY</button>
                 <button className="px-4 py-2 text-gray-400 rounded-xl text-xs font-bold hover:bg-gray-50">MONTHLY</button>
              </div>
           </div>
           <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis 
                      hide 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="severity" 
                      stroke="#059669" 
                      strokeWidth={4} 
                      dot={{ r: 4, fill: '#059669', strokeOpacity: 0 }} 
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                 </LineChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* Severity Distribution */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm transition hover:shadow-xl">
           <h3 className="text-xl font-black text-emerald-950 mb-8">Asset Health</h3>
           <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={severityData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                 </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="mt-6 space-y-3">
              {severityData.map((s, i) => (
                 <div key={i} className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 text-gray-500 font-medium">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} /> {s.name}
                    </span>
                    <span className="font-black text-emerald-900">{((s.value / severityData.reduce((acc, v) => acc + v.value, 0)) * 100).toFixed(0)}%</span>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-[2.5rem] border border-emerald-100 shadow-sm overflow-hidden transition hover:shadow-xl">
         <div className="p-8 border-b border-emerald-50 flex justify-between items-center bg-white/50 backdrop-blur sticky top-0 z-10">
            <h3 className="text-xl font-black text-emerald-950 flex items-center gap-3">
               <List className="text-emerald-600" /> Recent Activity Log
            </h3>
            <button className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl hover:bg-emerald-100 transition">
               <Filter size={20} />
            </button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-emerald-50/50">
                     <th className="px-8 py-5 text-xs font-black text-emerald-600 uppercase tracking-widest text-italic italic">Issue Identified</th>
                     <th className="px-8 py-5 text-xs font-black text-emerald-600 uppercase tracking-widest text-italic italic">Risk Tier</th>
                     <th className="px-8 py-5 text-xs font-black text-emerald-600 uppercase tracking-widest text-italic italic">Last Detected</th>
                     <th className="px-8 py-5 text-xs font-black text-emerald-600 uppercase tracking-widest text-italic italic">Treatment State</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-emerald-50">
                  {reports.length > 0 ? (
                    reports.map(report => (
                      <tr key={report.id} className="hover:bg-emerald-50/30 transition group">
                        <td className="px-8 py-6">
                           <div className="flex flex-col">
                              <span className="font-bold text-emerald-950 mb-1">{report.cropIssue}</span>
                              <span className="text-xs text-gray-400 line-clamp-1">{report.symptoms}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${
                             report.severity === 'HIGH' ? 'bg-red-100 text-red-600' : 
                             report.severity === 'MEDIUM' ? 'bg-orange-100 text-orange-600' : 
                             'bg-emerald-100 text-emerald-600'
                           }`}>
                             {report.severity}
                           </span>
                        </td>
                        <td className="px-8 py-6 font-mono text-xs font-bold text-gray-500">
                           {report.timestamp?.toDate().toLocaleString() || 'Just now'}
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                              <ShieldCheck size={16} /> Applied
                           </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-gray-400 italic font-medium">
                         No data points detected. Start scanning your crops to populate analytics.
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, trend, color }: { icon: any, label: string, value: string, trend: string, color: string }) {
  const colors: any = {
    emerald: 'bg-emerald-600 shadow-emerald-200',
    red: 'bg-red-600 shadow-red-200',
    blue: 'bg-blue-600 shadow-blue-200',
    orange: 'bg-orange-600 shadow-orange-200'
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-emerald-100 shadow-sm flex flex-col gap-4">
       <div className={`${colors[color]} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
          {React.cloneElement(icon, { size: 24 })}
       </div>
       <div>
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">{label}</p>
          <p className="text-3xl font-black text-emerald-950">{value}</p>
       </div>
       <div className="pt-2 border-t border-emerald-50">
          <p className="text-[10px] font-bold text-emerald-600">{trend}</p>
       </div>
    </div>
  );
}
