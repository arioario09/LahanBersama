import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Sprout, MapPin, Calendar, DollarSign, Box, Send, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function BukaLapak() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (profile?.verificationStatus !== 'verified') {
    return (
      <div className="p-4 sm:p-8 max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-light-gray text-center space-y-6"
        >
          <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-black text-navy tracking-tight">Akun Belum Terverifikasi</h1>
          <p className="text-blue-gray font-medium leading-relaxed">
            Anda harus memproses verifikasi KTP terlebih dahulu sebelum dapat membuka lapak atau menambahkan lahan pertanian baru.
          </p>
          <div className="pt-6">
            <button 
              onClick={() => navigate('/verify-ktp')}
              className="btn-mint w-full py-5 text-sm font-black tracking-widest uppercase transition-all shadow-mint/30"
            >
              VERIFIKASI KTP SEKARANG
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    title: '',
    fruitType: '',
    slotSize: '',
    slotPrice: '',
    harvestPeriod: '',
    location: { lat: -6.2000, lng: 106.8166 } // Default Jakarta for demo
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      await addDoc(collection(db, 'projects'), {
        ...formData,
        userId: user.uid,
        slotSize: Number(formData.slotSize),
        slotPrice: Number(formData.slotPrice),
        status: 'pending',
        totalFunds: 0,
        createdAt: serverTimestamp()
      });
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl border border-light-gray overflow-hidden"
      >
        <div className="bg-navy p-6 sm:p-8 text-white">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-mint p-3 rounded-2xl">
              <Sprout className="h-6 text-navy w-6" />
            </div>
            <h1 className="text-2xl font-bold">Buka Lapak Lahan</h1>
          </div>
          <p className="text-blue-gray font-medium">Lengkapi detail lahan pertanian Anda untuk dipasarkan ke investor.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-navy tracking-widest uppercase ml-1">Nama Lahan / Judul Proyek</label>
            <input
              required
              className="input-minimal"
              placeholder="Contoh: Kebun Durian Musang King Bogor"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-navy tracking-widest uppercase ml-1 flex items-center gap-1">
                <Box className="h-3 w-3" /> Jenis Komoditas
              </label>
              <select 
                className="input-minimal"
                value={formData.fruitType}
                onChange={e => setFormData({ ...formData, fruitType: e.target.value })}
                required
              >
                <option value="">Pilih Buah</option>
                <option value="Durian">Durian</option>
                <option value="Mangga">Mangga</option>
                <option value="Alpukat">Alpukat</option>
                <option value="Manggis">Manggis</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-navy tracking-widest uppercase ml-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Prediksi Panen
              </label>
              <input
                required
                className="input-minimal"
                placeholder="Contoh: 12-18 Bulan"
                value={formData.harvestPeriod}
                onChange={e => setFormData({ ...formData, harvestPeriod: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-navy tracking-widest uppercase ml-1 flex items-center gap-1">
                <Box className="h-3 w-3" /> Luas per Petak (m²)
              </label>
              <input
                required
                type="number"
                className="input-minimal"
                placeholder="100"
                value={formData.slotSize}
                onChange={e => setFormData({ ...formData, slotSize: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-navy tracking-widest uppercase ml-1 flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> Harga per Petak
              </label>
              <input
                required
                type="number"
                className="input-minimal"
                placeholder="5000000"
                value={formData.slotPrice}
                onChange={e => setFormData({ ...formData, slotPrice: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-navy tracking-widest uppercase ml-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Lokasi (Koordinat GPS)
            </label>
            <div className="flex gap-4">
               <input 
                  className="input-minimal flex-1" 
                  placeholder="Lat: -6.200" 
                  value={formData.location.lat}
                  onChange={e => setFormData({ ...formData, location: { ...formData.location, lat: Number(e.target.value) }})}
               />
               <input 
                  className="input-minimal flex-1" 
                  placeholder="Lng: 106.81" 
                  value={formData.location.lng}
                  onChange={e => setFormData({ ...formData, location: { ...formData.location, lng: Number(e.target.value) }})}
               />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed font-medium">
              Data yang Anda kirim akan ditinjau oleh tim validator kami maksimal dalam 2x24 jam sebelum dipasarkan ke calon investor.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-mint w-full py-5 text-lg flex items-center justify-center gap-3 mt-4"
          >
            <Send className="h-6 w-6" />
            {loading ? 'Mengirim Data...' : 'Kirim Penawaran Lahan'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
