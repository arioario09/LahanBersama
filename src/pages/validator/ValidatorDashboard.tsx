import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ShieldCheck, 
  User, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  AlertCircle, 
  Search, 
  Clock, 
  LogOut, 
  Sprout, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Box, 
  ExternalLink 
} from 'lucide-react';
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
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'users' | 'projects'>('users');
  
  // User Identity Verification states
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);

  // Land Verification states
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  // General states
  const [userMap, setUserMap] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch KTP Queue (Users with pending status)
  useEffect(() => {
    if (profile?.role !== 'validator') {
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
      setLoadingUsers(false);
    });

    return () => unsubscribe();
  }, [profile, navigate]);

  // Fetch Land Queue (Projects with pending status)
  useEffect(() => {
    if (profile?.role !== 'validator') return;

    const q = query(
      collection(db, 'projects'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(docs);
      setLoadingProjects(false);
    });

    return () => unsubscribe();
  }, [profile]);

  // Fetch all users once for live identification of farmer details on lands
  useEffect(() => {
    if (profile?.role !== 'validator') return;

    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const map: Record<string, any> = {};
      snapshot.docs.forEach(docSnap => {
        map[docSnap.id] = docSnap.data();
      });
      setUserMap(map);
    });

    return () => unsubscribe();
  }, [profile]);

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  // Actions for User Verification
  const handleUserAction = async (userId: string, action: 'verified' | 'rejected') => {
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

  // Actions for Land Verification
  const handleProjectAction = async (projectId: string, action: 'approved' | 'rejected') => {
    setIsProcessing(true);
    try {
      const updateData: any = {
        status: action,
        updatedAt: serverTimestamp()
      };

      if (action === 'rejected') {
        updateData.rejectionReason = rejectionReason || 'Lahan tidak memenuhi kriteria kelayakan platform.';
      }

      await updateDoc(doc(db, 'projects', projectId), updateData);
      setSelectedProject(null);
      setRejectionReason('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (profile?.role !== 'validator') {
    return <div className="p-20 text-center font-bold text-navy">Akses Ditolak</div>;
  }

  // Filter lists based on search
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.nik?.includes(searchQuery) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.fruitType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (userMap[p.userId]?.name || '')?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-bg-gray pb-24">
      {/* Header Panel */}
      <header className="bg-navy text-white p-6 sm:p-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10 shrink-0" iconSize="h-6 w-6" />
            <div>
              <h1 className="text-2xl font-black tracking-tight">Panel Validator</h1>
              <p className="text-blue-gray text-xs sm:text-sm font-medium leading-tight mt-0.5">
                Verifikasi identitas pengguna dan kelayakan lahan pertanian baru.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <div className="hidden md:block text-right border-r border-light-gray/20 pr-6">
               <p className="text-[10px] font-black uppercase text-blue-gray tracking-widest leading-none mb-1">Status</p>
               <p className="text-sm font-bold text-mint uppercase tracking-wider flex items-center gap-1.5">
                 <ShieldCheck className="w-4.5 h-4.5" /> Validator Aktif
               </p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/25 text-red-400 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tabs Switcher Navigation */}
      <div className="bg-navy/95 text-white border-t border-light-gray/10 py-1.5 sticky top-0 z-30 backdrop-blur-md shadow-md">
        <div className="max-w-6xl mx-auto px-4 flex gap-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              setActiveTab('users');
              setSelectedUser(null);
              setSelectedProject(null);
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'users' 
                ? 'bg-white/10 text-mint' 
                : 'text-blue-gray hover:text-white'
            }`}
          >
            <User className="h-4 w-4 shrink-0" />
            <span>Verifikasi Identitas</span>
            {users.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center animate-pulse">
                {users.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('projects');
              setSelectedUser(null);
              setSelectedProject(null);
              setSearchQuery('');
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'projects' 
                ? 'bg-white/10 text-mint' 
                : 'text-blue-gray hover:text-white'
            }`}
          >
            <Sprout className="h-4 w-4 shrink-0" />
            <span>Verifikasi Lahan</span>
            {projects.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center animate-pulse">
                {projects.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-4 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LIST SECTION */}
          <div className="lg:col-span-1 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-gray" />
              <input 
                type="text" 
                placeholder={activeTab === 'users' ? "Cari NIK / Nama / Email..." : "Cari Lahan / Petani / Buah..."}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white rounded-2xl py-4 pl-12 pr-4 text-sm font-bold shadow-sm border border-light-gray outline-none focus:border-teal transition-all"
              />
            </div>

            {activeTab === 'users' ? (
              // Users Pending List
              loadingUsers ? (
                <div className="py-20 text-center flex justify-center"><Clock className="animate-spin text-teal" /></div>
              ) : filteredUsers.length === 0 ? (
                <div className="bg-white p-12 rounded-[2rem] text-center border border-light-gray">
                   <CheckCircle className="h-12 w-12 text-mint mx-auto mb-4 opacity-25" />
                   <p className="font-bold text-navy text-sm">Antrean Bersih!</p>
                   <p className="text-xs text-blue-gray mt-1">Belum ada pengajuan verifikasi KTP baru.</p>
                </div>
              ) : (
                filteredUsers.map(u => (
                  <motion.div
                    key={u.id}
                    layoutId={u.id}
                    onClick={() => { setSelectedUser(u); setRejectionReason(''); }}
                    className={`bg-white p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                      selectedUser?.id === u.id ? 'border-teal shadow-lg scale-[1.02]' : 'border-light-gray hover:border-teal/50 shadow-sm'
                    }`}
                  >
                    <div className="h-12 w-12 bg-bg-gray rounded-xl flex items-center justify-center text-blue-gray shrink-0">
                      <User className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-navy truncate text-sm">{u.name}</h4>
                      <p className="text-[10px] text-blue-gray font-black tracking-widest uppercase mt-0.5">{u.role}</p>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-colors shrink-0 ${selectedUser?.id === u.id ? 'text-teal' : 'text-light-gray'}`} />
                  </motion.div>
                ))
              )
            ) : (
              // Lands Pending List
              loadingProjects ? (
                <div className="py-20 text-center flex justify-center"><Clock className="animate-spin text-teal" /></div>
              ) : filteredProjects.length === 0 ? (
                <div className="bg-white p-12 rounded-[2rem] text-center border border-light-gray">
                   <CheckCircle className="h-12 w-12 text-mint mx-auto mb-4 opacity-25" />
                   <p className="font-bold text-navy text-sm">Antrean Bersih!</p>
                   <p className="text-xs text-blue-gray mt-1">Belum ada pengajuan lahan baru.</p>
                </div>
              ) : (
                filteredProjects.map(p => (
                  <motion.div
                    key={p.id}
                    layoutId={p.id}
                    onClick={() => { setSelectedProject(p); setRejectionReason(''); }}
                    className={`bg-white p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${
                      selectedProject?.id === p.id ? 'border-teal shadow-lg scale-[1.02]' : 'border-light-gray hover:border-teal/50 shadow-sm'
                    }`}
                  >
                    <div className="h-12 w-12 bg-mint/10 rounded-xl flex items-center justify-center text-teal shrink-0">
                      <Sprout className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-navy truncate text-sm">{p.title}</h4>
                      <p className="text-[10px] text-blue-gray font-black tracking-widest uppercase mt-0.5">
                        {p.fruitType} • {userMap[p.userId]?.name || 'Petani'}
                      </p>
                    </div>
                    <ChevronRight className={`h-4 w-4 transition-colors shrink-0 ${selectedProject?.id === p.id ? 'text-teal' : 'text-light-gray'}`} />
                  </motion.div>
                ))
              )
            )}
          </div>

          {/* VERIFICATION DETAIL SECTION */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {activeTab === 'users' ? (
                selectedUser ? (
                  // User Identity Details
                  <motion.div
                    key={selectedUser.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-[2rem] shadow-xl border border-light-gray overflow-hidden"
                  >
                    <div className="p-6 sm:p-8 border-b border-light-gray bg-gray-50 flex items-center justify-between">
                      <div>
                          <h2 className="text-xl sm:text-2xl font-black text-navy">{selectedUser.name}</h2>
                          <p className="text-xs sm:text-sm font-medium text-blue-gray mt-0.5">{selectedUser.email}</p>
                      </div>
                      <div>
                         <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                           Pending Review
                         </span>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <h3 className="text-xs font-black text-navy uppercase tracking-widest">Informasi Identitas</h3>
                            <div className="bg-bg-gray p-4 rounded-2xl border border-light-gray">
                               <p className="text-[10px] font-bold text-blue-gray uppercase mb-1">NIK (Nomor Induk Kependudukan)</p>
                               <p className="text-lg sm:text-xl font-black text-navy tracking-wider font-mono">{selectedUser.nik}</p>
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
                                placeholder="Contoh: Foto buram, NIK tidak sesuai, dokumen palsu..."
                                value={rejectionReason}
                                onChange={e => setRejectionReason(e.target.value)}
                                className="w-full bg-bg-gray border border-light-gray rounded-2xl pt-8 pb-4 px-4 text-sm font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all h-24"
                              />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                               <button
                                  onClick={() => handleUserAction(selectedUser.id, 'rejected')}
                                  disabled={isProcessing}
                                  className="flex-1 py-4 px-6 border-2 border-red-500 text-red-500 rounded-2xl font-black text-xs tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                               >
                                  <XCircle className="h-4 w-4" /> TOLAK VERIFIKASI
                               </button>
                               <button
                                  onClick={() => handleUserAction(selectedUser.id, 'verified')}
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
                  <div className="h-full min-h-[350px] bg-white rounded-[2rem] border border-light-gray border-dashed flex flex-col items-center justify-center p-12 text-center">
                     <div className="w-16 h-16 bg-bg-gray rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="h-8 w-8 text-blue-gray" />
                     </div>
                     <h3 className="text-lg font-bold text-navy">Pilih Pengguna</h3>
                     <p className="text-xs text-blue-gray max-w-xs mx-auto mt-2 leading-relaxed">
                       Pilih salah satu pengajuan dari daftar di samping untuk meninjau data identitas pengguna.
                     </p>
                  </div>
                )
              ) : (
                // Project/Land Details
                selectedProject ? (
                  <motion.div
                    key={selectedProject.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-white rounded-[2rem] shadow-xl border border-light-gray overflow-hidden"
                  >
                    <div className="p-6 sm:p-8 border-b border-light-gray bg-gray-50 flex items-center justify-between">
                      <div>
                          <h2 className="text-xl sm:text-2xl font-black text-navy">{selectedProject.title}</h2>
                          <p className="text-xs sm:text-sm font-medium text-blue-gray mt-0.5">
                            Diajukan oleh: <span className="text-teal font-bold">{userMap[selectedProject.userId]?.name || 'Memuat Petani...'}</span>
                          </p>
                      </div>
                      <div>
                         <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                           Pending Review
                         </span>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         
                         {/* Land info breakdown */}
                         <div className="space-y-4">
                            <h3 className="text-xs font-black text-navy uppercase tracking-widest">Detail Spesifikasi Lahan</h3>
                            <div className="bg-bg-gray p-5 rounded-2xl border border-light-gray space-y-4">
                               <div>
                                  <p className="text-[10px] font-bold text-blue-gray uppercase mb-0.5">Komoditas Utama</p>
                                  <p className="text-sm font-black text-navy uppercase tracking-wide flex items-center gap-2">
                                    <Box className="w-4 h-4 text-teal" /> {selectedProject.fruitType}
                                  </p>
                               </div>
                               <hr className="border-light-gray/60" />
                               <div>
                                  <p className="text-[10px] font-bold text-blue-gray uppercase mb-0.5">Total Luas Area Lahan</p>
                                  <p className="text-sm font-black text-navy flex items-center gap-2">
                                    <Sprout className="w-4 h-4 text-teal" /> {selectedProject.slotSize} m²
                                  </p>
                               </div>
                               <hr className="border-light-gray/60" />
                               <div>
                                  <p className="text-[10px] font-bold text-blue-gray uppercase mb-0.5">Harga Per Petak</p>
                                  <p className="text-base font-black text-teal flex items-center gap-1">
                                    <DollarSign className="w-4.5 h-4.5" /> Rp {selectedProject.slotPrice?.toLocaleString('id-ID')}
                                  </p>
                               </div>
                               <hr className="border-light-gray/60" />
                               <div>
                                  <p className="text-[10px] font-bold text-blue-gray uppercase mb-0.5">Periode Siklus Panen</p>
                                  <p className="text-sm font-black text-navy flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-teal" /> {selectedProject.harvestPeriod}
                                  </p>
                               </div>
                            </div>
                         </div>
                         
                         {/* Location & Farmer contact verification */}
                         <div className="space-y-4">
                            <h3 className="text-xs font-black text-navy uppercase tracking-widest">Verifikasi Lokasi & Farmer</h3>
                            <div className="bg-bg-gray p-5 rounded-2xl border border-light-gray space-y-4">
                               <div>
                                  <p className="text-[10px] font-bold text-blue-gray uppercase mb-1">Titik GPS Koordinat</p>
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-bold text-navy font-mono truncate">
                                      {selectedProject.location?.lat?.toFixed(6)}, {selectedProject.location?.lng?.toFixed(6)}
                                    </p>
                                    <a 
                                      href={`https://www.google.com/maps/search/?api=1&query=${selectedProject.location?.lat},${selectedProject.location?.lng}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[10px] font-black text-teal hover:underline flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl border border-light-gray shadow-sm shrink-0"
                                    >
                                      <MapPin className="w-3 h-3" /> PETA <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  </div>
                               </div>
                               <hr className="border-light-gray/60" />
                               <div>
                                  <p className="text-[10px] font-bold text-blue-gray uppercase mb-0.5">Kontak Petani</p>
                                  <p className="text-xs font-bold text-navy truncate">{userMap[selectedProject.userId]?.email || 'Tidak tersedia'}</p>
                               </div>
                               <hr className="border-light-gray/60" />
                               <div>
                                  <p className="text-[10px] font-bold text-blue-gray uppercase mb-0.5">Nomor NIK Pengelola</p>
                                  <p className="text-xs font-bold text-navy tracking-wider font-mono">{userMap[selectedProject.userId]?.nik || 'Tidak tersedia'}</p>
                                </div>
                            </div>

                            <div className="aspect-[3/1.8] bg-bg-gray rounded-2xl overflow-hidden border border-light-gray relative">
                               <img 
                                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${selectedProject.id}`} 
                                  className="w-full h-full object-cover opacity-60" 
                                  alt="Identicon Lahan" 
                               />
                               <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent flex items-end p-4">
                                  <p className="text-[10px] text-white font-mono font-bold tracking-tight">ID Lahan: {selectedProject.id}</p>
                               </div>
                            </div>
                         </div>

                      </div>

                      {/* Validator controls */}
                      <div className="space-y-4 pt-4 border-t border-light-gray">
                         <h3 className="text-xs font-black text-navy uppercase tracking-widest">Tindakan Validasi Lahan</h3>
                         
                         <div className="flex flex-col gap-4">
                            <div className="relative">
                              <label className="text-[10px] font-bold text-blue-gray uppercase absolute left-4 top-2">Alasan Penolakan Lahan (Opsional)</label>
                              <textarea 
                                placeholder="Contoh: Lokasi tidak valid, harga tidak rasional, komoditas tidak sesuai..."
                                value={rejectionReason}
                                onChange={e => setRejectionReason(e.target.value)}
                                className="w-full bg-bg-gray border border-light-gray rounded-2xl pt-8 pb-4 px-4 text-sm font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all h-24"
                              />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                               <button
                                  onClick={() => handleProjectAction(selectedProject.id, 'rejected')}
                                  disabled={isProcessing}
                                  className="flex-1 py-4 px-6 border-2 border-red-500 text-red-500 rounded-2xl font-black text-xs tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                               >
                                  <XCircle className="h-4 w-4" /> TOLAK PENAWARAN LAHAN
                               </button>
                               <button
                                  onClick={() => handleProjectAction(selectedProject.id, 'approved')}
                                  disabled={isProcessing}
                                  className="flex-1 py-4 px-6 bg-teal text-white rounded-2xl font-black text-xs tracking-widest hover:bg-navy transition-all shadow-lg shadow-teal/20 flex items-center justify-center gap-2"
                               >
                                  <CheckCircle className="h-4 w-4" /> SETUJUI & PASARKAN
                               </button>
                            </div>
                         </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full min-h-[350px] bg-white rounded-[2rem] border border-light-gray border-dashed flex flex-col items-center justify-center p-12 text-center">
                     <div className="w-16 h-16 bg-bg-gray rounded-full flex items-center justify-center mb-6">
                        <Sprout className="h-8 w-8 text-blue-gray" />
                     </div>
                     <h3 className="text-lg font-bold text-navy">Pilih Penawaran Lahan</h3>
                     <p className="text-xs text-blue-gray max-w-xs mx-auto mt-2 leading-relaxed">
                       Pilih salah satu penawaran lahan dari daftar di samping untuk meninjau data spesifikasi kelayakan proyek.
                     </p>
                  </div>
                )
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>
    </div>
  );
}
