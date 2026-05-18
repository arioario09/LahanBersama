import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { Wallet, ArrowDownLeft, ArrowUpRight, Plus, History, QrCode, CreditCard, Banknote, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Transaction {
  id: string;
  amount: number;
  type: 'topup' | 'invest' | 'withdraw' | 'profit';
  status: 'pending' | 'success';
  paymentMethod: string;
  createdAt: any;
}

export default function WalletPage() {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleTopUp = async () => {
    if (!user || !amount || isNaN(Number(amount))) return;
    setIsProcessing(true);
    
    try {
      const numAmount = Number(amount);
      // Create transaction
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        amount: numAmount,
        type: 'topup',
        status: 'success',
        paymentMethod: 'QRIS/E-Wallet',
        createdAt: serverTimestamp()
      });

      // Update user balance
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        balance: increment(numAmount)
      });

      setShowTopUp(false);
      setAmount('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!user || !amount || isNaN(Number(amount)) || Number(amount) > (profile?.balance || 0)) return;
    setIsProcessing(true);
    
    try {
      const numAmount = Number(amount);
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        amount: numAmount,
        type: 'withdraw',
        status: 'success',
        paymentMethod: 'Transfer Bank',
        createdAt: serverTimestamp()
      });

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        balance: increment(-numAmount)
      });

      setWithdrawSuccess(true);
      setTimeout(() => {
        setShowWithdraw(false);
        setWithdrawSuccess(false);
        setAmount('');
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto space-y-8 pb-24">
      <header>
        <h1 className="text-3xl font-black text-navy tracking-tight">Dompet Saya</h1>
        <p className="text-blue-gray font-medium">Kelola saldo dan riwayat transaksi keuangan Anda.</p>
      </header>

      {/* Balance Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#122B4F] p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6 opacity-80">
            <Wallet className="h-5 w-5 text-mint" />
            <span className="text-[10px] font-black uppercase tracking-widest">Saldo Aktif</span>
          </div>
          <h2 className="text-5xl font-black text-[#00B0A0]">
            Rp {(profile?.balance || 0).toLocaleString('id-ID')}
          </h2>
          
          <div className="mt-12 flex gap-4">
            <button 
              onClick={() => setShowTopUp(true)}
              className="flex-1 bg-[#00B0A0] hover:bg-teal text-white py-4 rounded-2xl font-black text-xs tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" /> TOP UP
            </button>
            <button 
              onClick={() => setShowWithdraw(true)}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black text-xs tracking-widest border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="h-4 w-4" /> TARIK
            </button>
          </div>
        </div>
        <div className="absolute -right-12 -bottom-12 opacity-5 pointer-events-none">
           <Wallet className="h-64 w-64" />
        </div>
      </motion.div>

      {/* Transaction History */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-navy tracking-tight flex items-center gap-2">
            <History className="h-5 w-5 text-[#00B0A0]" /> Riwayat Transaksi
          </h3>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="h-8 w-8 border-4 border-t-[#00B0A0] border-gray-100 rounded-full animate-spin"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-bg-gray rounded-3xl p-12 text-center border-2 border-dashed border-light-gray">
              <Banknote className="h-12 w-12 text-blue-gray mx-auto mb-4 opacity-50" />
              <p className="font-bold text-navy">Belum ada transaksi</p>
              <p className="text-xs text-blue-gray mt-1">Lakukan top up pertama Anda untuk mulai berinvestasi.</p>
            </div>
          ) : (
            transactions.map((tx, i) => (
              <motion.div 
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-5 rounded-3xl border border-light-gray flex items-center justify-between hover:border-[#00B0A0] transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${tx.type === 'topup' ? 'bg-mint/10 text-teal' : 'bg-red-50 text-red-500'}`}>
                    {tx.type === 'topup' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-navy text-sm capitalize">{tx.type}</h4>
                    <p className="text-[10px] text-blue-gray font-black uppercase tracking-widest">{tx.paymentMethod}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black ${tx.type === 'topup' || tx.type === 'profit' ? 'text-teal' : 'text-red-500'}`}>
                    {tx.type === 'topup' || tx.type === 'profit' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[10px] text-blue-gray font-medium">
                    {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString('id-ID') : 'Baru saja'}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Top Up Modal */}
      <AnimatePresence>
        {showTopUp && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-navy/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowTopUp(false)}
                className="absolute right-6 top-6 text-blue-gray hover:text-navy"
              >
                Tutup
              </button>
              
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="bg-[#00B0A0]/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <QrCode className="h-8 w-8 text-[#00B0A0]" />
                  </div>
                  <h3 className="text-2xl font-black text-navy">Isi Saldo</h3>
                  <p className="text-sm text-blue-gray font-medium">Masukkan jumlah dana yang ingin Anda tambahkan.</p>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-navy">Rp</span>
                    <input 
                      type="number"
                      placeholder="Minimal 50.000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-bg-gray border-2 border-transparent focus:border-[#00B0A0] focus:bg-white rounded-2xl py-4 pl-12 pr-4 font-black transition-all outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {['100000', '250000', '500000'].map(val => (
                      <button 
                        key={val}
                        onClick={() => setAmount(val)}
                        className="bg-bg-gray hover:bg-[#00B0A0]/10 hover:text-[#00B0A0] transition-all py-2 rounded-xl text-xs font-black text-blue-gray"
                      >
                        Rp {Number(val).toLocaleString('id-ID')}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-blue-gray uppercase tracking-widest text-center">Metode Pembayaran</p>
                    <div className="flex gap-4 items-center justify-center opacity-60">
                       <CreditCard className="h-6 w-6" />
                       <Banknote className="h-6 w-6" />
                       <Plus className="h-6 w-6" />
                    </div>
                  </div>

                  <button 
                    onClick={handleTopUp}
                    disabled={!amount || isProcessing}
                    className="w-full bg-navy text-white py-4 rounded-2xl font-black text-xs tracking-widest hover:bg-[#00B0A0] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <div className="h-4 w-4 border-2 border-t-white border-white/20 rounded-full animate-spin"></div>
                    ) : (
                      <>KONFIRMASI PEMBAYARAN <CheckCircle2 className="h-4 w-4" /></>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdraw && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-navy/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowWithdraw(false)}
                className="absolute right-6 top-6 text-blue-gray hover:text-navy"
              >
                Tutup
              </button>
              
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500 border border-red-100">
                    <ArrowUpRight className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-black text-navy">Tarik Dana</h3>
                  <p className="text-sm text-blue-gray font-medium">Dana akan ditransfer ke rekening terdaftar Anda.</p>
                </div>

                {withdrawSuccess ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-12 text-center"
                  >
                    <div className="bg-mint text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <p className="font-black text-navy">Penarikan Berhasil!</p>
                    <p className="text-xs text-blue-gray">Diharapkan saldo masuk dalam 1-3 hari kerja.</p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-bg-gray p-4 rounded-2xl border border-light-gray">
                      <p className="text-[10px] font-black text-blue-gray tracking-widest uppercase mb-1">Maksimal Penarikan</p>
                      <p className="text-lg font-black text-navy">Rp {(profile?.balance || 0).toLocaleString('id-ID')}</p>
                    </div>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-navy">Rp</span>
                      <input 
                        type="number"
                        placeholder="Jumlah penarikan"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-bg-gray border-2 border-transparent focus:border-red-500 focus:bg-white rounded-2xl py-4 pl-12 pr-4 font-black transition-all outline-none"
                      />
                    </div>

                    <button 
                      onClick={handleWithdraw}
                      disabled={!amount || isProcessing || Number(amount) > (profile?.balance || 0)}
                      className="w-full bg-navy text-white py-4 rounded-2xl font-black text-xs tracking-widest hover:bg-teal transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <div className="h-4 w-4 border-2 border-t-white border-white/20 rounded-full animate-spin"></div>
                      ) : (
                        <>Tarik Sekarang <CheckCircle2 className="h-4 w-4" /></>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
