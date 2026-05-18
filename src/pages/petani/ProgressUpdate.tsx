import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { Camera, Send, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProgressUpdate() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !projectId) return;
    setLoading(true);

    try {
      // Mock photo upload for now
      const photoUrl = photo ? "https://placeholder-verify.io/progress.jpg" : "";

      await addDoc(collection(db, 'projects', projectId, 'audits'), {
        description,
        photoUrl,
        createdAt: serverTimestamp()
      });

      // Notify all investors of this project
      const invQ = query(collection(db, 'investments'), where('projectId', '==', projectId));
      const invSnap = await getDocs(invQ);
      
      const uniqueInvestors = new Set(invSnap.docs.map(doc => doc.data().userId));
      
      const notifPromises = Array.from(uniqueInvestors).map(investorId => 
        addDoc(collection(db, 'notifications'), {
          userId: investorId,
          title: 'Update Lahan Baru!',
          message: 'Petani baru saja mengirimkan laporan perkembangan pada lahan yang Anda investasikan.',
          type: 'project_update',
          isRead: false,
          createdAt: serverTimestamp()
        })
      );

      await Promise.all(notifPromises);

      navigate('/porto');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-gray font-bold text-sm mb-6 hover:text-navy transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> KEMBALI
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-minimal overflow-hidden"
      >
        <div className="bg-teal p-8 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-3">
             <Camera className="h-8 w-8" /> Update Mingguan
          </h1>
          <p className="text-white/80 font-medium mt-1">Berikan kabar terbaru lahan Anda kepada para investor.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-3">
             <label className="text-[10px] font-bold text-navy tracking-widest uppercase ml-1">Foto Kondisi Terbaru</label>
             <div className="border-2 border-dashed border-light-gray rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-mint/5 hover:border-mint transition-all relative group cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={e => setPhoto(e.target.files?.[0] || null)}
                />
                {photo ? (
                  <div className="flex flex-col items-center">
                    <ImageIcon className="h-10 w-10 text-teal mb-2" />
                    <p className="font-bold text-teal">{photo.name}</p>
                    <span className="text-xs text-blue-gray mt-1 uppercase font-bold tracking-widest">Ganti Foto</span>
                  </div>
                ) : (
                  <>
                    <Camera className="h-12 w-12 text-blue-gray mb-3 group-hover:scale-110 transition-transform" />
                    <p className="font-bold text-navy">Ambil atau Pilih Foto</p>
                    <p className="text-xs text-blue-gray mt-1">Max 5MB (JPG, PNG)</p>
                  </>
                )}
             </div>
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-bold text-navy tracking-widest uppercase ml-1">Deskripsi Update / Catatan</label>
             <textarea 
                required
                placeholder="Contoh: Pemberian pupuk tahap dua sudah selesai. Tanaman terlihat segar dan pertumbuhan stabil..." 
                className="input-minimal h-32 resize-none pt-4"
                value={description}
                onChange={e => setDescription(e.target.value)}
             />
          </div>

          <button
            type="submit"
            disabled={loading || !description}
            className="btn-mint w-full py-5 text-xl flex items-center justify-center gap-3 mt-4"
          >
            <Send className="h-6 w-6" />
            {loading ? 'Mengirim Update...' : 'Kirim Update Sekarang'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
