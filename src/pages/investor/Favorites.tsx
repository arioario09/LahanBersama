import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Heart, ArrowLeft, Search, Calendar, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export default function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(collection(db, 'users', user.uid, 'favorites'), async (snapshot) => {
      const favList: any[] = [];
      for (const favDoc of snapshot.docs) {
        // Fetch project details for each favorite
        const projectSnap = await (await import('firebase/firestore')).getDoc(doc(db, 'projects', favDoc.id));
        if (projectSnap.exists()) {
          favList.push({ id: projectSnap.id, ...projectSnap.data() });
        }
      }
      setFavorites(favList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const removeFavorite = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'favorites', projectId));
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-8 pb-24">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-bg-gray rounded-xl transition-colors">
          <ArrowLeft className="h-6 w-6 text-navy" />
        </button>
        <h1 className="text-3xl font-black text-navy tracking-tight">Simpanan Saya</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
           <div className="border-4 h-12 w-12 border-t-teal border-gray-200 rounded-full animate-spin"></div>
        </div>
      ) : favorites.length === 0 ? (
        <div className="card-minimal flex flex-col items-center justify-center p-20 text-center border-dashed">
           <Heart className="h-20 w-20 text-blue-gray mb-6 opacity-30" />
           <p className="font-bold text-navy text-xl">Daftar Masih Kosong</p>
           <p className="text-blue-gray text-base mt-2 max-w-xs mx-auto leading-relaxed">Simpan lahan yang Anda minati di marketplace untuk dipantau sewaktu-waktu.</p>
           <button 
             onClick={() => navigate('/')}
             className="btn-mint px-10 py-4 mt-8"
           >LIHAT MARKETPLACE</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
           <AnimatePresence>
            {favorites.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                className="card-minimal group cursor-pointer overflow-hidden border-2 border-transparent hover:border-teal/30 transition-all shadow-sm"
                onClick={() => navigate(`/land/${project.id}`)}
              >
                <div className="relative h-40 bg-navy/5 overflow-hidden">
                  <img 
                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${project.id}`} 
                    className="w-full h-full object-cover opacity-60 transition-transform group-hover:scale-110" 
                    alt={project.title}
                  />
                  <button 
                    onClick={(e) => removeFavorite(e, project.id)}
                    className="absolute top-4 right-4 p-2.5 bg-red-500 text-white rounded-xl shadow-lg ring-4 ring-white/50"
                  >
                    <Heart className="h-5 w-5 fill-current" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-teal tracking-widest uppercase">{project.fruitType}</span>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-gray uppercase">
                      <Calendar className="h-3 w-3" /> {project.harvestPeriod}
                    </div>
                  </div>
                  <h3 className="font-bold text-navy text-lg line-clamp-1 mb-6 group-hover:text-teal transition-colors tracking-tight">{project.title}</h3>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold text-teal">Rp {project.slotPrice.toLocaleString('id-ID')}</p>
                    <ChevronRight className="h-5 w-5 text-blue-gray group-hover:text-teal transition-all group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
