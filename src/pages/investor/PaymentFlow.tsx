import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Box, DollarSign, Wallet, CreditCard, QrCode, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';

export default function PaymentFlow() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [project, setProject] = useState<any>(null);
  const [slots, setSlots] = useState(1);
  const [method, setMethod] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!projectId) return;
    getDoc(doc(db, 'projects', projectId)).then(snap => {
      if (snap.exists()) setProject(snap.data());
    });
  }, [projectId]);

  const total = (project?.slotPrice || 0) * slots;

  const handlePayment = async () => {
    if (!user || !projectId) return;
    setLoading(true);
    
    try {
      // Simulate real-time delay
      await new Promise(r => setTimeout(r, 2000));
      
      await addDoc(collection(db, 'investments'), {
        userId: user.uid,
        projectId: projectId,
        slots,
        totalPaid: total,
        status: 'success',
        createdAt: serverTimestamp()
      });

      // Update project total funds
      await updateDoc(doc(db, 'projects', projectId), {
        totalFunds: increment(total)
      });

      // Send notification to farmer
      await addDoc(collection(db, 'notifications'), {
        userId: project.userId,
        title: 'Dana Investasi Masuk!',
        message: `Seseorang baru saja berinvestasi senilai Rp ${total.toLocaleString('id-ID')} pada lahan ${project.title}.`,
        type: 'fund_received',
        isRead: false,
        createdAt: serverTimestamp()
      });

      setStep(4);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!project) return null;

  return (
    <div className="bg-bg-gray min-h-screen py-10 px-4">
      <div className="max-w-md mx-auto h-full flex flex-col">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-gray font-bold text-sm mb-6">
           <ArrowLeft className="h-4 w-4" /> KEMBALI
        </button>

        <motion.div layout className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col">
          {/* Header Progress */}
          <div className="bg-navy p-6 flex justify-between items-center relative overflow-hidden">
             {[1, 2, 3].map(i => (
               <div key={i} className={`z-10 w-2 h-2 rounded-full transition-all duration-500 ${step >= i ? 'bg-mint scale-125' : 'bg-white/20'}`}></div>
             ))}
             <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 mx-10">
                <motion.div 
                  initial={false}
                  animate={{ width: `${(step - 1) * 50}%` }}
                  className="h-full bg-mint"
                />
             </div>
          </div>

          <div className="p-8 flex-1">
             <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                     <div>
                        <p className="text-[10px] font-bold text-teal tracking-[0.2em] uppercase mb-1">PROYEK PILIHAN</p>
                        <h2 className="text-2xl font-bold text-navy truncate">{project.title}</h2>
                     </div>

                     <div className="space-y-4">
                        <label className="text-xs font-bold text-blue-gray uppercase ml-1">Jumlah Petak (m²)</label>
                        <div className="flex items-center gap-4 bg-bg-gray p-4 rounded-2xl border border-light-gray">
                           <button 
                             onClick={() => setSlots(Math.max(1, slots - 1))}
                             className="w-12 h-12 bg-white rounded-xl shadow-sm text-navy font-bold text-2xl"
                           >-</button>
                           <div className="flex-1 text-center font-bold text-2xl text-navy">{slots}</div>
                           <button 
                             onClick={() => setSlots(slots + 1)}
                             className="w-12 h-12 bg-white rounded-xl shadow-sm text-navy font-bold text-2xl"
                           >+</button>
                        </div>
                     </div>

                     <div className="bg-mint/5 p-6 rounded-2xl border border-mint/20">
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-blue-gray text-sm">Total Investasi</span>
                           <span className="font-bold text-navy">Rp {total.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-blue-gray text-sm">Admin & Layanan</span>
                           <span className="font-bold text-navy">FREE</span>
                        </div>
                     </div>

                     <button 
                        onClick={() => setStep(2)}
                        className="btn-mint w-full py-5 text-xl flex items-center justify-center gap-3 shadow-mint/30"
                     >
                        PILIH PEMBAYARAN <ChevronRight className="h-6 w-6" />
                     </button>
                  </motion.div>
                )}

                {step === 2 && (
                   <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                     <h2 className="text-2xl font-bold text-navy">Metode Pembayaran</h2>
                     <div className="space-y-4">
                        {[
                           { id: 'qris', label: 'QRIS', icon: <QrCode className="h-6 w-6" />, desc: 'Gopay, OVO, Dana, LinkAja' },
                           { id: 'wallet', label: 'E-Wallet / M-Banking', icon: <Wallet className="h-6 w-6" />, desc: 'Transfer Bank Otomatis' },
                           { id: 'card', label: 'Kartu Kredit', icon: <CreditCard className="h-6 w-6" />, desc: 'Visa, Mastercard' }
                        ].map(m => (
                           <button
                             key={m.id}
                             onClick={() => setMethod(m.id)}
                             className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                               method === m.id ? 'border-teal bg-teal/[0.03] ring-1 ring-teal' : 'border-light-gray bg-white'
                             }`}
                           >
                              <div className={`p-3 rounded-xl ${method === m.id ? 'bg-teal text-white' : 'bg-bg-gray text-blue-gray'}`}>{m.icon}</div>
                              <div className="text-left">
                                 <p className="font-bold text-navy text-lg">{m.label}</p>
                                 <p className="text-xs font-semibold text-blue-gray uppercase tracking-widest">{m.desc}</p>
                              </div>
                           </button>
                        ))}
                     </div>
                     <button 
                        disabled={!method}
                        onClick={() => setStep(3)}
                        className="btn-mint w-full py-5 text-xl flex items-center justify-center gap-3 shadow-mint/30 disabled:opacity-50"
                     >
                        LANJUT BAYAR <ArrowLeft className="h-6 w-6 rotate-180" />
                     </button>
                  </motion.div>
                )}

                {step === 3 && (
                   <motion.div 
                    key="step3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-10"
                  >
                     <div className="w-64 h-64 bg-gray-50 border-2 border-light-gray rounded-3xl p-6 mb-8 relative">
                         {method === 'qris' ? (
                           <div className="w-full h-full flex flex-col items-center justify-center p-4">
                              <QrCode className="h-full w-full text-navy opacity-20" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="bg-white p-4 shadow-xl rounded-2xl border border-light-gray">
                                    <div className="w-32 h-32 bg-navy flex items-center justify-center text-mint font-black text-4xl">QRIS</div>
                                 </div>
                              </div>
                           </div>
                         ) : (
                           <div className="flex flex-col items-center justify-center h-full">
                              <Box className="h-20 w-20 text-blue-gray mb-4 animate-pulse" />
                              <p className="font-bold text-navy uppercase tracking-widest">Waiting Payment</p>
                           </div>
                         )}
                     </div>
                     <p className="text-center text-blue-gray text-sm mb-12">Silakan selesaikan pembayaran senilai <br /> <span className="text-teal font-black text-xl tracking-tight">Rp {total.toLocaleString('id-ID')}</span></p>
                     <button 
                        onClick={handlePayment}
                        disabled={loading}
                        className="btn-mint w-full py-5 text-xl flex items-center justify-center gap-3"
                     >
                        {loading ? 'MENGECEK PEMBAYARAN...' : 'KLIK JIKA SUDAH BAYAR'}
                     </button>
                  </motion.div>
                )}

                {step === 4 && (
                   <motion.div 
                    key="step4"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-12 text-center"
                  >
                     <div className="bg-green-100 p-6 rounded-full mb-8">
                        <CheckCircle className="h-20 w-20 text-green-600" />
                     </div>
                     <h2 className="text-3xl font-bold text-navy mb-4">Investasi Berhasil!</h2>
                     <p className="text-blue-gray text-lg mb-12 leading-relaxed">Selamat! Anda telah resmi menjadi investor dalam proyek <br /><span className="text-navy font-bold">{project.title}</span>.</p>
                     
                     <div className="w-full space-y-4">
                        <button 
                          onClick={() => navigate('/investments')} 
                          className="btn-mint w-full py-5 text-xl"
                        >PORTFOLIO SAYA</button>
                        <button 
                          onClick={() => navigate('/')} 
                          className="w-full py-4 text-sm font-bold text-blue-gray hover:text-navy"
                        >KEMBALI KE MARKETPLACE</button>
                     </div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
