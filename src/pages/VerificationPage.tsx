import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Upload, Send, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { motion } from 'motion/react';
import Logo from '../components/common/Logo';

export default function VerificationPage() {
  const { profile, user, signOut } = useAuth();
  const [nik, setNik] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (nik.length !== 16) {
      setError('NIK harus berjumlah 16 digit.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const url = "https://placeholder-verify.io/photo.jpg"; 
      await updateDoc(doc(db, 'users', user.uid), {
        nik,
        ktpPhotoUrl: url,
        verificationStatus: 'pending',
        rejectionReason: null
      });

      setSuccess(true);
    } catch (err: any) {
      setError('Gagal mengunggah data verifikasi.');
    } finally {
      setLoading(false);
    }
  };

  if (profile?.verificationStatus === 'verified') {
    return (
      <div className="flex bg-bg-gray min-h-screen items-center justify-center">
        <div className="flex flex-col max-w-sm items-center text-center">
          <div className="bg-green-100 mb-6 p-4 rounded-full">
            <CheckCircle className="h-12 text-green-600 w-12" />
          </div>
          <h1 className="font-bold text-navy text-2xl">Sudah Terverifikasi</h1>
          <p className="text-blue-gray mt-2 text-lg">
            Akun Anda sudah terverifikasi dan siap digunakan.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="btn-mint mt-8 px-10 py-4 text-lg"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  if (profile?.verificationStatus === 'pending' || success) {
    return (
      <div className="flex bg-bg-gray min-h-screen items-center justify-center p-6">
        <div className="flex flex-col max-w-sm items-center text-center">
          <div className="bg-blue-50 mb-6 p-6 rounded-[2rem] border border-blue-100 shadow-sm">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <AlertCircle className="h-12 text-blue-500 w-12" />
            </motion.div>
          </div>
          <h1 className="font-black text-navy text-2xl tracking-tight">Verifikasi Sedang Diproses</h1>
          <p className="text-blue-gray mt-4 text-base font-medium leading-relaxed">
            Data Anda sedang ditinjau oleh validator kami. Proses ini biasanya memakan waktu 1x24 jam.
          </p>
          <div className="mt-8 space-y-4 w-full">
            <button 
              onClick={() => navigate('/')}
              className="w-full btn-mint py-4 text-sm font-black tracking-widest"
            >
              KEMBALI KE BERANDA
            </button>
            <button 
              onClick={() => signOut()}
              className="w-full text-blue-gray font-bold text-xs p-2 hover:text-navy transition-colors"
            >
              KELUAR AKUN
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-gray min-h-screen flex flex-col overflow-x-hidden">
      {/* Top Bar */}
      <nav className="bg-navy h-16 flex items-center justify-between px-6 sm:px-8 text-white shadow-lg shrink-0 z-50">
        <div className="flex items-center gap-3">
          <Logo className="w-9 h-9" iconSize="h-5 w-5" />
          <span className="text-xl font-bold tracking-tight">LahanBersama</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:text-right sm:block">
            <p className="text-[10px] text-blue-gray uppercase font-bold leading-none mb-1">Role Pengguna</p>
            <p className="text-sm font-medium capitalize">{profile?.role} Terdaftar</p>
          </div>
          <button onClick={() => signOut()} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center py-10 px-4 sm:p-8">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Status Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6 order-2 lg:order-1">
            <div className="card-minimal p-6">
              <h2 className="text-lg font-bold mb-4">Status Verifikasi</h2>
              
              {profile?.verificationStatus === 'rejected' ? (
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 mb-6">
                   <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-sm font-black text-red-600">VERIFIKASI DITOLAK</p>
                  </div>
                  <p className="text-xs text-red-800 font-medium leading-relaxed">
                    Alasan: {profile.rejectionReason || 'Data tidak valid atau foto kurang jelas.'}
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Belum Terverifikasi</p>
                    <p className="text-xs text-blue-gray">Lengkapi KTP Anda</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <div className="flex gap-3 items-center">
                  <div className="w-6 h-6 rounded-full bg-mint flex items-center justify-center text-[10px] text-navy font-bold">1</div>
                  <span className="text-sm font-semibold">Data Diri (KTP)</span>
                </div>
                <div className="flex gap-3 items-center opacity-40">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-navy font-bold">2</div>
                  <span className="text-sm font-semibold">Konfirmasi Admin</span>
                </div>
                <div className="flex gap-3 items-center opacity-40">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-navy font-bold">3</div>
                  <span className="text-sm font-semibold">Selesai</span>
                </div>
              </div>
            </div>

            <div className="bg-navy text-white p-6 rounded-2xl shadow-md">
              <h3 className="text-sm font-bold mb-2">Butuh Bantuan?</h3>
              <p className="text-xs text-blue-gray mb-4">Hubungi layanan pelanggan kami jika Anda kesulitan mengunggah dokumen.</p>
              <button className="text-xs font-bold text-mint uppercase tracking-wider underline">Hubungi Validator</button>
            </div>
          </div>

          {/* Verification Form */}
          <div className="lg:col-span-8 bg-white rounded-3xl shadow-lg border border-light-gray overflow-hidden flex flex-col order-1 lg:order-2">
            <div className="p-6 sm:p-8 border-b border-light-gray">
              <h1 className="text-2xl font-bold mb-1">Verifikasi Identitas</h1>
              <p className="text-blue-gray text-base shadow-none">Silakan masukkan NIK dan unggah foto KTP asli Anda.</p>
            </div>

            <div className="p-6 sm:p-8 space-y-8 flex-grow">
              {success ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col py-12 items-center text-center"
                >
                  <div className="bg-green-100 mb-6 p-5 rounded-full">
                    <CheckCircle className="h-16 text-green-600 w-16" />
                  </div>
                  <h2 className="font-bold text-navy text-2xl">Data Terkirim</h2>
                  <p className="text-blue-gray mt-3 text-lg leading-relaxed">
                    Terima kasih! Tim validator kami akan segera memeriksa data Anda.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleUpload} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-navy tracking-widest uppercase ml-1">Nomor Induk Kependudukan (NIK)</label>
                    <input
                      type="text"
                      required
                      maxLength={16}
                      value={nik}
                      onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                      className="input-minimal text-xl font-medium tracking-wider"
                      placeholder="Contoh: 3275010203040001"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-navy tracking-widest uppercase ml-1">Foto KTP</label>
                    <div className="border-2 border-dashed border-light-gray rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors relative group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                        className="inset-0 opacity-0 absolute cursor-pointer z-10"
                      />
                      {photo ? (
                        <div className="flex flex-col items-center">
                          <CheckCircle className="h-12 w-12 text-teal mb-3" />
                          <p className="font-bold text-teal text-lg">{photo.name}</p>
                          <span className="text-xs text-blue-gray mt-1">Ganti Dokumen</span>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Upload className="h-8 w-8 text-mint" />
                          </div>
                          <p className="font-bold text-navy text-center">Klik untuk Ambil Foto atau Unggah</p>
                          <p className="text-sm text-blue-gray mt-1">Format JPG, PNG (Maks. 5MB)</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-6 sm:p-8 flex items-center justify-end gap-4 mt-8">
                    <button 
                      type="button" 
                      onClick={() => navigate('/')}
                      className="px-6 py-4 text-sm font-bold text-navy hover:text-teal transition-colors"
                    >
                      Nanti Saja
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !photo || nik.length !== 16}
                      className="btn-mint px-8 sm:px-12 py-4 text-lg"
                    >
                      {loading ? 'Mengirim...' : 'Kirim Verifikasi'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="h-12 bg-white border-t border-light-gray flex items-center justify-center px-8 shrink-0 text-[10px] text-blue-gray font-bold uppercase tracking-[0.2em]">
        LahanBersama &copy; 2026 &bull; Platform Gotong Royong Digital
      </footer>
    </div>
  );
}
