import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, TrendingUp, Calendar, ArrowUpRight, Camera, MessageCircle, ChevronRight, Activity, Sprout, Wallet } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';

interface Investment {
  id: string;
  projectId: string;
  slots: number;
  totalPaid: number;
  project?: any;
  lastUpdate?: any;
}

export default function InvestorPortfolio() {
  const { user, profile } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'investments'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const invData: Investment[] = [];
      
      for (const invDoc of snapshot.docs) {
        const data = invDoc.data() as Investment;
        const projectSnap = await getDoc(doc(db, 'projects', data.projectId));
        
        // Also fetch latest audit for each project
        const auditQ = query(
          collection(db, 'projects', data.projectId, 'audits'),
          where('createdAt', '!=', null)
        );
        const auditSnap = await getDocs(auditQ);
        const lastAudit = auditSnap.docs[0]?.data();

        invData.push({
          id: invDoc.id,
          ...data,
          project: projectSnap.exists() ? { id: projectSnap.id, ...projectSnap.data() } : null,
          lastUpdate: lastAudit
        });
      }
      
      setInvestments(invData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const totalInv = investments.reduce((acc, inv) => acc + (inv.totalPaid || 0), 0);

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-10 pb-24">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link 
          to="/wallet"
          className="bg-white p-6 rounded-[2rem] border border-light-gray shadow-sm group hover:border-[#00B0A0] transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#00B0A0]/10 p-2 rounded-xl text-[#00B0A0]">
                <Wallet className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black text-blue-gray uppercase tracking-widest">Saldo Saya</span>
            </div>
            <p className="text-2xl font-black text-[#00B0A0]">Rp {(profile?.balance || 0).toLocaleString('id-ID')}</p>
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] font-black text-teal tracking-widest">
            ISI SALDO <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Portfolio Header */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-navy p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden md:col-span-3"
        >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
             <div className="bg-mint/20 p-2 rounded-xl border border-mint/20">
                <Briefcase className="h-5 text-mint w-5" />
             </div>
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-gray">Total Investasi Aktif</span>
          </div>
          <h2 className="text-5xl font-black tracking-tight">Rp {totalInv.toLocaleString('id-ID')}</h2>
          
          <div className="mt-12 flex gap-8">
             <div className="bg-white/5 backdrop-blur p-4 rounded-2xl border border-white/5 flex-1 max-w-[140px]">
                <Activity className="h-4 w-4 text-mint mb-2" />
                <p className="text-[10px] text-blue-gray font-bold uppercase tracking-wider">Aset Lahan</p>
                <p className="text-xl font-bold">{investments.length}</p>
             </div>
             <div className="bg-white/5 backdrop-blur p-4 rounded-2xl border border-white/5 flex-1 max-w-[140px]">
                <TrendingUp className="h-4 w-4 text-mint mb-2" />
                <p className="text-[10px] text-blue-gray font-bold uppercase tracking-wider">ROI Tertinggu</p>
                <p className="text-xl font-bold">15.4%</p>
             </div>
          </div>
        </div>
        <div className="absolute -right-16 -top-16 opacity-10 animate-spin-slow">
           <Sprout className="h-64 w-64" />
        </div>
      </motion.div>
    </div>

      {/* Investment List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="font-bold text-navy text-2xl tracking-tight flex items-center gap-3">
             Investasi Saya
          </h3>
          <span className="text-xs font-bold text-teal bg-teal/10 px-4 py-1.5 rounded-full border border-teal/10">REAL-TIME</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
             <div className="border-4 h-12 w-12 border-t-teal border-gray-200 rounded-full animate-spin"></div>
          </div>
        ) : investments.length === 0 ? (
          <div className="card-minimal flex flex-col items-center justify-center p-20 text-center border-dashed">
             <Briefcase className="h-20 w-20 text-blue-gray mb-6 opacity-30" />
             <p className="font-bold text-navy text-xl">Belum Ada Investasi</p>
             <p className="text-blue-gray text-base mt-2 max-w-xs mx-auto leading-relaxed">Mulai bantu petani lokal dan bagilah hasil bersama keuntungan yang adil.</p>
             <button 
               onClick={() => navigate('/')}
               className="btn-mint px-10 py-4 mt-8"
             >JELAJAHI MARKETPLACE</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {investments.map((inv) => (
              <motion.div 
                key={inv.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-minimal group cursor-pointer overflow-hidden hover:border-teal/50 transition-all shadow-md"
                onClick={() => navigate(`/land/${inv.projectId}`)}
              >
                 <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-56 h-48 sm:h-auto bg-bg-gray overflow-hidden shrink-0">
                       <img 
                          src={`https://api.dicebear.com/7.x/identicon/svg?seed=${inv.projectId}`} 
                          className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform" 
                          alt="Icon"
                       />
                    </div>
                    <div className="p-8 flex-1 flex flex-col justify-between">
                       <div>
                          <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-teal tracking-[0.2em] uppercase">{inv.project?.fruitType}</span>
                                <span className="bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-green-100">STABIL</span>
                             </div>
                             <ArrowUpRight className="h-6 w-6 text-blue-gray group-hover:text-teal transition-colors" />
                          </div>
                          <h4 className="font-black text-navy text-2xl mb-4 group-hover:text-teal transition-colors tracking-tight line-clamp-1">
                            {inv.project?.title}
                          </h4>
                          
                          <div className="grid grid-cols-2 gap-8 mb-6">
                             <div>
                                <p className="text-[10px] font-extrabold text-blue-gray uppercase tracking-widest mb-1">Kepemilikan</p>
                                <p className="font-bold text-navy text-lg">{inv.slots} Petak</p>
                             </div>
                             <div>
                                <p className="text-[10px] font-extrabold text-blue-gray uppercase tracking-widest mb-1">Total Nilai</p>
                                <p className="font-black text-teal text-lg">Rp {inv.totalPaid.toLocaleString('id-ID')}</p>
                             </div>
                          </div>
                       </div>

                       {inv.lastUpdate && (
                         <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start gap-4">
                            <div className="bg-white p-2 rounded-xl text-blue-600 border border-blue-100 shrink-0">
                               <Camera className="h-4 w-4" />
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Berita Terbaru dari Petani</p>
                               <p className="text-xs text-navy font-bold leading-snug line-clamp-2">{inv.lastUpdate.description}</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-blue-400 ml-auto self-center" />
                         </div>
                       )}
                    </div>
                 </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
