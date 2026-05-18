import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { User, Mail, FileText, Save, CheckCircle, AlertCircle, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function ProfileEditor() {
  const { profile, user } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setSuccess(false);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name,
        bio
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-minimal overflow-hidden"
      >
        <div className="p-8 border-b border-light-gray flex items-center gap-4">
           <div className="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center shrink-0">
              <User className="h-8 text-mint w-8" />
           </div>
           <div>
              <h1 className="text-2xl font-bold">Profil Saya</h1>
              <p className="text-blue-gray font-medium">Kelola informasi publik Anda</p>
           </div>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          {/* Verification Status */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-navy tracking-widest uppercase ml-1">Status Verifikasi Akun</label>
            {profile?.verificationStatus === 'verified' ? (
              <div className="bg-mint/10 border border-mint/20 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-teal" />
                  <span className="text-sm font-bold text-teal">Akun Terverifikasi</span>
                </div>
                <CheckCircle className="h-5 w-5 text-teal" />
              </div>
            ) : profile?.verificationStatus === 'pending' ? (
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-bold text-blue-500">Menunggu Verifikasi</span>
                </div>
                <Link to="/verify-ktp" className="text-[10px] font-black text-blue-500 hover:underline">CEK STATUS</Link>
              </div>
            ) : (
              <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                profile?.verificationStatus === 'rejected' 
                ? 'bg-red-50 border-red-100' 
                : 'bg-orange-50 border-orange-100'
              }`}>
                <div className="flex items-center gap-3">
                  <AlertCircle className={`h-5 w-5 ${profile?.verificationStatus === 'rejected' ? 'text-red-500' : 'text-orange-500'}`} />
                  <div>
                    <span className={`text-sm font-bold block ${profile?.verificationStatus === 'rejected' ? 'text-red-600' : 'text-orange-600'}`}>
                      {profile?.verificationStatus === 'rejected' ? 'Verifikasi Ditolak' : 'Belum Diverifikasi'}
                    </span>
                    {profile?.verificationStatus === 'rejected' && (
                      <p className="text-[10px] text-red-800 font-medium">{profile.rejectionReason}</p>
                    )}
                  </div>
                </div>
                <Link to="/verify-ktp" className="flex items-center gap-1 text-[10px] font-black text-navy hover:text-teal transition-colors">
                  {profile?.verificationStatus === 'rejected' ? 'UNGGAH ULANG' : 'VERIFIKASI SEKARANG'}
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>

          {success && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-3 text-green-700"
            >
              <CheckCircle className="h-5 w-5" />
              <p className="text-sm font-bold uppercase tracking-wider">Profil Berhasil Diperbarui!</p>
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-navy tracking-widest uppercase ml-1">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-gray" />
              <input
                required
                className="input-minimal pl-12"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-navy tracking-widest uppercase ml-1 opacity-50">Email (Permanen)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-light-gray" />
              <input
                disabled
                className="input-minimal pl-12 bg-gray-100 border-none cursor-not-allowed text-blue-gray"
                value={profile?.email || ''}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-navy tracking-widest uppercase ml-1">Biografi / Pengalaman Petani</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 h-5 w-5 text-blue-gray" />
              <textarea
                className="input-minimal pl-12 h-32 pt-4 resize-none"
                placeholder="Ceritakan pengalaman Anda di dunia pertanian..."
                value={bio}
                onChange={e => setBio(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-mint w-full py-5 text-lg flex items-center justify-center gap-3"
          >
            <Save className="h-6 w-6" />
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
