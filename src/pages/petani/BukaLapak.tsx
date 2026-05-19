import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  Sprout, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Box, 
  Send, 
  AlertCircle, 
  Image as ImageIcon, 
  Compass, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';

// Premium high-quality unsplash presets for farm images matching crop types
const FRUIT_PRESETS: Record<string, string> = {
  Durian: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80",
  Mangga: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80",
  Alpukat: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&auto=format&fit=crop&q=80",
  Manggis: "https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?w=800&auto=format&fit=crop&q=80",
  Default: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80"
};

export default function BukaLapak() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    fruitType: '',
    slotSize: '',
    slotPrice: '',
    harvestPeriod: '',
    address: '',
    imageUrl: '',
    location: { lat: -6.2000, lng: 106.8166 } // Default Jakarta
  });

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState<boolean | null>(null);

  // Auto-populate preset image when crop type is selected
  useEffect(() => {
    if (formData.fruitType) {
      const presetUrl = FRUIT_PRESETS[formData.fruitType] || FRUIT_PRESETS.Default;
      setFormData(prev => ({ ...prev, imageUrl: presetUrl }));
    }
  }, [formData.fruitType]);

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
              className="btn-mint w-full py-5 text-sm font-black tracking-widest uppercase transition-all shadow-mint/30 animate-pulse"
            >
              VERIFIKASI KTP SEKARANG
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Geolocation API helper for 1-click location retrieval
  const handleGetLocation = () => {
    setGpsLoading(true);
    setGpsSuccess(null);

    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung pendeteksian lokasi GPS.");
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        }));
        setGpsLoading(false);
        setGpsSuccess(true);
      },
      (error) => {
        console.warn("Geolocation denied or failed. Using dynamic simulation.", error);
        // High quality Indonesian location simulation if permission denied/fails
        const randomLat = -6.2000 + (Math.random() - 0.5) * 0.08;
        const randomLng = 106.8166 + (Math.random() - 0.5) * 0.08;
        setFormData(prev => ({
          ...prev,
          location: { lat: randomLat, lng: randomLng }
        }));
        setGpsLoading(false);
        setGpsSuccess(false);
        alert("Gagal mendeteksi koordinat riil. Sebagai simulasi, sistem telah menetapkan koordinat terdekat di wilayah Anda secara otomatis!");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

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
        imageUrl: formData.imageUrl || FRUIT_PRESETS.Default,
        status: 'pending',
        totalFunds: 0,
        createdAt: serverTimestamp()
      });
      navigate('/');
    } catch (err) {
      console.error("Error creating land project:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto pb-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-xl border border-light-gray overflow-hidden"
      >
        {/* Top Header Card */}
        <div className="bg-navy p-6 sm:p-8 text-white">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-mint p-3 rounded-2xl shrink-0">
              <Sprout className="h-6 text-navy w-6" />
            </div>
            <h1 className="text-2xl font-bold">Buka Lapak Lahan Baru</h1>
          </div>
          <p className="text-blue-gray font-medium text-sm">
            Lengkapi detail spesifikasi, koordinat GPS, dan foto lahan pertanian Anda untuk mulai dipasarkan ke para calon investor.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          
          {/* Project Title */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-navy tracking-widest uppercase ml-1">Nama Lahan / Judul Proyek</label>
            <input
              required
              className="input-minimal text-sm"
              placeholder="Contoh: Kebun Durian Bawor Premium Bogor"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Fruit Type & Harvest Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-navy tracking-widest uppercase ml-1 flex items-center gap-1.5">
                <Box className="h-3.5 w-3.5 text-teal" /> Jenis Komoditas
              </label>
              <select 
                className="input-minimal text-sm"
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
              <label className="text-[10px] font-bold text-navy tracking-widest uppercase ml-1 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-teal" /> Prediksi Masa Panen
              </label>
              <input
                required
                className="input-minimal text-sm"
                placeholder="Contoh: 12-18 Bulan"
                value={formData.harvestPeriod}
                onChange={e => setFormData({ ...formData, harvestPeriod: e.target.value })}
              />
            </div>
          </div>

          {/* Slot Size & Slot Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-navy tracking-widest uppercase ml-1 flex items-center gap-1.5">
                <Box className="h-3.5 w-3.5 text-teal" /> Luas per Petak (m²)
              </label>
              <input
                required
                type="number"
                className="input-minimal text-sm"
                placeholder="100"
                value={formData.slotSize}
                onChange={e => setFormData({ ...formData, slotSize: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-navy tracking-widest uppercase ml-1 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-teal" /> Harga per Petak
              </label>
              <input
                required
                type="number"
                className="input-minimal text-sm"
                placeholder="5000000"
                value={formData.slotPrice}
                onChange={e => setFormData({ ...formData, slotPrice: e.target.value })}
              />
            </div>
          </div>

          {/* Address of the Land */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-navy tracking-widest uppercase ml-1 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-teal" /> Alamat Fisik Lahan
            </label>
            <textarea
              required
              rows={2}
              className="w-full px-5 py-4 bg-gray-50 border border-light-gray rounded-xl focus:ring-2 focus:ring-mint outline-none transition-all placeholder:text-blue-gray text-sm font-medium"
              placeholder="Masukkan alamat lengkap lokasi lahan kebun (cth. Jl. Raya Puncak Km. 82, Cisarua, Bogor)"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          {/* GPS Location (Coordinates) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold text-navy tracking-widest uppercase flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-teal" /> Koordinat GPS Lahan
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={gpsLoading}
                className="text-[10px] font-black text-teal hover:text-navy hover:underline flex items-center gap-1 bg-mint/10 border border-mint/20 px-2.5 py-1 rounded-lg transition-all"
              >
                {gpsLoading ? (
                  <>
                    <Clock className="h-3 w-3 animate-spin" />
                    <span>Mencari GPS...</span>
                  </>
                ) : gpsSuccess ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                    <span>GPS Terdeteksi!</span>
                  </>
                ) : (
                  <>
                    <MapPin className="h-3 w-3" />
                    <span>Deteksi GPS Saya (1-Klik)</span>
                  </>
                )}
              </button>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-1 space-y-1">
                <p className="text-[8px] font-black text-blue-gray uppercase ml-1">Latitude</p>
                <input 
                  type="number"
                  step="any"
                  required
                  className="input-minimal text-xs font-mono" 
                  placeholder="Lat: -6.2000" 
                  value={formData.location.lat}
                  onChange={e => setFormData({ 
                    ...formData, 
                    location: { ...formData.location, lat: Number(e.target.value) }
                  })}
                />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[8px] font-black text-blue-gray uppercase ml-1">Longitude</p>
                <input 
                  type="number"
                  step="any"
                  required
                  className="input-minimal text-xs font-mono" 
                  placeholder="Lng: 106.8166" 
                  value={formData.location.lng}
                  onChange={e => setFormData({ 
                    ...formData, 
                    location: { ...formData.location, lng: Number(e.target.value) }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Kebun Image Upload / Preset Link */}
          <div className="space-y-3 pt-2">
            <label className="text-[10px] font-bold text-navy tracking-widest uppercase ml-1 flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-teal" /> Foto / Gambar Kebun Lahan
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <div className="space-y-3">
                <p className="text-[9px] text-blue-gray font-medium leading-relaxed">
                  Masukkan tautan URL foto kebun Anda, atau sistem akan menyematkan foto katalog preset premium otomatis berdasarkan jenis komoditas buah yang Anda pilih!
                </p>
                <input
                  className="input-minimal text-xs"
                  placeholder="Masukkan link gambar kustom (HTTP/HTTPS)"
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>
              
              {/* Image Preview Box */}
              <div className="aspect-[3/1.8] bg-bg-gray rounded-2xl overflow-hidden border border-light-gray relative shadow-inner group">
                {formData.imageUrl ? (
                  <img 
                    src={formData.imageUrl} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    alt="Preview Lahan" 
                    onError={(e) => {
                      // Fallback in case of broken custom url
                      (e.target as HTMLImageElement).src = FRUIT_PRESETS.Default;
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                    <ImageIcon className="h-8 w-8 text-blue-gray mb-2 opacity-50" />
                    <p className="text-[10px] font-black text-blue-gray uppercase">Belum Ada Foto</p>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-navy/70 backdrop-blur text-white text-[8px] font-black tracking-widest px-2 py-0.5 rounded uppercase">
                  PRATINJAU LAHAN
                </div>
              </div>
            </div>
          </div>

          {/* Alert Message */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed font-medium">
              Data penawaran lahan Anda akan masuk ke antrean validator terlebih dahulu. Setelah disetujui, penawaran akan langsung tercantum di marketplace investor!
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-mint w-full py-5 text-base sm:text-lg flex items-center justify-center gap-3 mt-4 text-white shadow-lg shadow-mint/20"
          >
            <Send className="h-5 w-5" />
            {loading ? 'Mengirim Data Lahan...' : 'Kirim Penawaran Lahan'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
