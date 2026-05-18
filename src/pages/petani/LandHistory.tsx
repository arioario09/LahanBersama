import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore';
import { Sprout, TrendingUp, History, ShieldCheck, Clock, AlertCircle, Plus, Zap, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  title: string;
  fruitType: string;
  status: string;
  totalFunds: number;
  createdAt: any;
  isBoosted?: boolean;
  boostExpiry?: any;
}

export default function LandHistory() {
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [boostingId, setBoostingId] = useState<string | null>(null);
  const [isProcessingBoost, setIsProcessingBoost] = useState(false);
  const navigate = useNavigate();

  const BOOST_PRICE = 50000; // Harga boost simulasi

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'projects'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleBoost = async (projectId: string) => {
    if (!user || (profile?.balance || 0) < BOOST_PRICE) {
      alert('Saldo tidak cukup untuk boost iklan.');
      return;
    }

    setIsProcessingBoost(true);
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7); // Boost aktif 7 hari

      await updateDoc(doc(db, 'projects', projectId), {
        isBoosted: true,
        boostExpiry: expiryDate.toISOString()
      });

      await updateDoc(doc(db, 'users', user.uid), {
        balance: increment(-BOOST_PRICE)
      });

      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        amount: BOOST_PRICE,
        type: 'withdraw',
        status: 'success',
        paymentMethod: 'Iklan Boost',
        createdAt: serverTimestamp()
      });

      setBoostingId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingBoost(false);
    }
  };

  const filteredProjects = projects.filter(p => filter === 'all' || p.status === filter);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-navy tracking-tight">Manajemen Lahan</h1>
          <p className="text-blue-gray font-medium">Kelola status dan pantau perkembangan setiap lahan yang Anda publikasikan.</p>
        </div>
        <button 
          onClick={() => navigate('/buka-lapak')}
          className="bg-navy text-white px-6 py-3 rounded-2xl font-black text-xs tracking-widest hover:bg-teal transition-all flex items-center gap-2 shadow-lg"
        >
          <Plus className="h-4 w-4" /> BUKA LAPAK BARU
        </button>
      </header>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-light-gray">
          <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest mb-1">Total Lahan</p>
          <p className="text-2xl font-black text-navy">{projects.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-light-gray border-l-4 border-l-green-500">
          <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest mb-1">Aktif</p>
          <p className="text-2xl font-black text-navy">{projects.filter(p => p.status === 'approved').length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-light-gray border-l-4 border-l-orange-500">
          <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest mb-1">Menunggu</p>
          <p className="text-2xl font-black text-navy">{projects.filter(p => p.status === 'pending').length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-light-gray border-l-4 border-l-blue-gray">
          <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest mb-1">Draft/Henti</p>
          <p className="text-2xl font-black text-navy">{projects.filter(p => p.status !== 'approved' && p.status !== 'pending').length}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-bg-gray rounded-xl w-fit">
        {(['all', 'approved', 'pending'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${
              filter === t ? 'bg-white text-teal shadow-sm' : 'text-blue-gray hover:text-navy'
            }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Lands List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-20">
             <div className="border-4 h-12 w-12 border-t-teal border-gray-200 rounded-full animate-spin"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white flex flex-col items-center justify-center p-16 text-center border-2 border-dashed rounded-3xl border-light-gray">
             <Sprout className="h-16 w-16 text-blue-gray mb-4 opacity-20" />
             <p className="font-black text-navy text-xl">Lahan Tidak Ditemukan</p>
             <p className="text-blue-gray text-sm mt-2 max-w-xs mx-auto">Anda belum memiliki lahan dengan status ini dalam daftar manajemen.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((project) => (
              <motion.div 
                key={project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-3xl border border-light-gray hover:border-teal transition-all group flex flex-col shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="h-14 w-14 bg-mint/10 rounded-2xl flex items-center justify-center">
                    <Sprout className="h-8 w-8 text-teal" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(project.status)}`}>
                    {project.status}
                  </span>
                </div>
                
                <h4 className="font-black text-navy text-xl group-hover:text-teal transition-colors mb-1 truncate">
                  {project.title}
                </h4>
                <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest flex items-center gap-2">
                  {project.fruitType} <span className="h-1 w-1 bg-light-gray rounded-full"></span> {project.id.slice(0, 8)}
                </p>

                <div className="mt-8 space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest">Dana Terkumpul</p>
                    <p className="font-black text-navy">Rp {project.totalFunds.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="h-2 bg-bg-gray rounded-full overflow-hidden">
                    <div className="h-full bg-teal rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-light-gray grid grid-cols-2 gap-3">
                   <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/update-progress/${project.id}`);
                    }}
                    className="bg-bg-gray hover:bg-light-gray text-navy py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all"
                   >
                     UPDATE
                   </button>
                   {project.isBoosted ? (
                     <div className="bg-mint/10 border border-mint/20 text-teal rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black tracking-widest">
                       <Zap className="h-3 w-3 fill-teal" /> TERBOOST
                     </div>
                   ) : (
                     <button 
                      disabled={project.status !== 'approved'}
                      onClick={() => setBoostingId(project.id)}
                      className="bg-navy text-white hover:bg-teal py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                     >
                       <Zap className="h-3 w-3" /> BOOST IKLAN
                     </button>
                   )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Boost Modal */}
      <AnimatePresence>
        {boostingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 backdrop-blur-sm p-4">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="bg-white max-w-sm w-full rounded-[2.5rem] p-8 shadow-2xl relative"
             >
                <div className="bg-teal/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-teal">
                   <Zap className="h-8 w-8 fill-teal" />
                </div>
                <h3 className="text-2xl font-black text-navy text-center mb-2">Naikkan Lahan Anda</h3>
                <p className="text-blue-gray text-center text-sm font-medium leading-relaxed mb-8">
                  Tampilkan lahan Anda di posisi teratas marketplace selama 7 hari untuk mendapatkan investor lebih cepat.
                </p>
                <div className="bg-bg-gray p-4 rounded-2xl mb-8 flex justify-between items-center border border-light-gray">
                   <span className="text-[10px] font-black tracking-widest text-blue-gray uppercase">Biaya Boost</span>
                   <span className="font-black text-navy text-lg">Rp 50.000</span>
                </div>
                <div className="flex gap-4">
                   <button 
                     onClick={() => setBoostingId(null)}
                     className="flex-1 text-blue-gray font-bold text-xs tracking-widest"
                   >
                     BATAL
                   </button>
                   <button 
                     onClick={() => handleBoost(boostingId)}
                     disabled={isProcessingBoost}
                     className="flex-[2] bg-navy text-white py-4 rounded-2xl font-black text-xs tracking-widest hover:bg-teal transition-all flex items-center justify-center gap-2"
                   >
                     {isProcessingBoost ? <div className="h-4 w-4 border-2 border-t-white border-white/20 rounded-full animate-spin"></div> : 'BAYAR & BOOST'}
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
