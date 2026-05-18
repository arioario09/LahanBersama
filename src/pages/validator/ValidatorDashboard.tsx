import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldCheck, User, CheckCircle, XCircle, ChevronRight, AlertCircle, Search, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/common/Logo';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  nik: string;
  ktpPhotoUrl: string;
  role: string;
  verificationStatus: string;
}

export default function ValidatorDashboard() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.role !== 'validator') {
      // Small delay to allow profile to load
      if (profile) navigate('/');
      return;
    }

    const q = query(
      collection(db, 'users'),
      where('verificationStatus', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PendingUser));
      setUsers(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile, navigate]);

  const handleAction = async (userId: string, action: 'verified' | 'rejected') => {
    setIsProcessing(true);
    try {
      const updateData: any = {
        verificationStatus: action,
        updatedAt: serverTimestamp()
      };

      if (action === 'rejected') {
        updateData.rejectionReason = rejectionReason || 'Dokumen tidak valid atau foto kurang jelas.';
      }

      await updateDoc(doc(db, 'users', userId), updateData);
      setSelectedUser(null);
      setRejectionReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (profile?.role !== 'validator') {
    return <div className="p-20 text-center">Akses Ditolak</div>;
  }

  return (
    <div className="min-h-screen bg-bg-gray pb-24">
      <header className="bg-navy text-white p-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Logo className="w-10 h-10" iconSize="h-6 w-6" />
              <h1 className="text-2xl font-black tracking-tight">Panel Validator</h1>
            </div>
            <p className="text-blue-gray font-medium">Verifikasi identitas pengguna untuk keamanan platform.</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black uppercase text-blue-gray tracking-widest leading-none mb-1">Antrean</p>
             <p className="text-2xl font-black text-mint">{users.length}</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-8 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List Section */}
          <div className="lg:col-span-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-gray" />
              <input 
                type="text" 
                placeholder="Cari NIK/Nama..." 
                className="w-full bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-bold shadow-sm border border-light-gray outline-none focus:border-teal transition-all"
              />
            </div>

            {loading ? (
              <div className="py-20 text-center flex justify-center"><Clock className="animate-spin text-teal" /></div>
            ) : users.length === 0 ? (
              <div className="bg-white p-12 rounded-[2.5rem] text-center border border-light-gray">
                 <CheckCircle className="h-12 w-12 text-mint mx-auto mb-4 opacity-20" />
                 <p className="font-bold text-navy">Semua Bersih!</p>
                 <p className="text-xs text-blue-gray">Belum ada pengajuan verifikasi baru.</p>
              </div>
            ) : (
              users.map(u => (
                <motion.div
                  key={u.id}
                  layoutId={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`bg-white p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                    selectedUser?.id === u.id ? 'border-teal shadow-lg scale-[1.02]' : 'border-light-gray hover:border-teal/50 shadow-sm'
                  }`}
                >
                  <div className="h-12 w-12 bg-bg-gray rounded-xl flex items-center justify-center text-blue-gray">
                    <User className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-navy truncate">{u.name}</h4>
                    <p className="text-[10px] text-blue-gray font-black tracking-widest uppercase">{u.role}</p>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-colors ${selectedUser?.id === u.id ? 'text-teal' : 'text-light-gray'}`} />
                </motion.div>
              ))
            )}
          </div>

          {/* Verification Detail Section */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {selectedUser ? (
                <motion.div
                  key={selectedUser.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-[2.5rem] shadow-xl border border-light-gray overflow-hidden"
                >
                  <div className="p-8 border-b border-light-gray bg-gray-50 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-navy">{selectedUser.name}</h2>
                        <p className="text-sm font-medium text-blue-gray">{selectedUser.email}</p>
                    </div>
                    <div className="text-right">
                       <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                         Pending Review
                       </span>
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <h3 className="text-xs font-black text-navy uppercase tracking-widest">Informasi Identitas</h3>
                          <div className="bg-bg-gray p-4 rounded-2xl border border-light-gray">
                             <p className="text-[10px] font-bold text-blue-gray uppercase mb-1">NIK (Nomor Induk Kependudukan)</p>
                             <p className="text-xl font-black text-navy tracking-widest">{selectedUser.nik}</p>
                          </div>
                          <div className="bg-bg-gray p-4 rounded-2xl border border-light-gray">
                             <p className="text-[10px] font-bold text-blue-gray uppercase mb-1">Role Pendaftaran</p>
                             <p className="text-sm font-black text-teal uppercase tracking-widest">{selectedUser.role}</p>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <h3 className="text-xs font-black text-navy uppercase tracking-widest">Foto KTP</h3>
                          <div className="aspect-[3/2] bg-bg-gray rounded-2xl overflow-hidden border border-light-gray group relative">
                             <img 
                                src={selectedUser.ktpPhotoUrl || "https://images.unsplash.com/photo-1557124816-e9b7d5440de2?w=800"} 
                                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                                alt="KTP" 
                             />
                             <div className="absolute inset-0 bg-navy/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Search className="text-white h-8 w-8" />
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-light-gray">
                       <h3 className="text-xs font-black text-navy uppercase tracking-widest">Tindakan Validator</h3>
                       
                       <div className="flex flex-col gap-4">
                          <div className="relative">
                            <label className="text-[10px] font-bold text-blue-gray uppercase absolute left-4 top-2">Alasan Penolakan (Opsional)</label>
                            <textarea 
                              placeholder="Contoh: Foto buram, NIK tidak sesuai..."
                              value={rejectionReason}
                              onChange={e => setRejectionReason(e.target.value)}
                              className="w-full bg-bg-gray border border-light-gray rounded-2xl pt-8 pb-4 px-4 text-sm font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all h-24"
                            />
                          </div>

                          <div className="flex gap-4">
                             <button
                                onClick={() => handleAction(selectedUser.id, 'rejected')}
                                disabled={isProcessing}
                                className="flex-1 py-4 px-6 border-2 border-red-500 text-red-500 rounded-2xl font-black text-xs tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                             >
                                <XCircle className="h-4 w-4" /> TOLAK VERIFIKASI
                             </button>
                             <button
                                onClick={() => handleAction(selectedUser.id, 'verified')}
                                disabled={isProcessing}
                                className="flex-1 py-4 px-6 bg-teal text-white rounded-2xl font-black text-xs tracking-widest hover:bg-navy transition-all shadow-lg shadow-teal/20 flex items-center justify-center gap-2"
                             >
                                <CheckCircle className="h-4 w-4" /> SETUJUI & VERIFIKASI
                             </button>
                          </div>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full bg-white rounded-[2.5rem] border border-light-gray border-dashed flex flex-col items-center justify-center p-12 text-center">
                   <div className="w-20 h-20 bg-bg-gray rounded-full flex items-center justify-center mb-6">
                      <AlertCircle className="h-10 w-10 text-light-gray" />
                   </div>
                   <h3 className="text-xl font-bold text-navy">Pilih Pengguna</h3>
                   <p className="text-sm text-blue-gray max-w-xs mx-auto mt-2">
                     Pilih salah satu pengajuan dari daftar di samping untuk meninjau data verifikasi.
                   </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
