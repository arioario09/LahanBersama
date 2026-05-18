import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Filter, Heart, ChevronRight, Sprout, TrendingUp, Calendar, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface Project {
  id: string;
  title: string;
  fruitType: string;
  slotPrice: number;
  harvestPeriod: string;
  status: string;
  totalFunds: number;
  isBoosted?: boolean;
}

export default function Marketplace() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filter, setFilter] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fruitTypes = ['Semua', 'Durian', 'Mangga', 'Alpukat', 'Manggis'];

  useEffect(() => {
    const q = query(collection(db, 'projects'), where('status', '==', 'approved'));
    const unsubscribeProjects = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      // Sort: Boosted lands first
      const sorted = [...docs].sort((a, b) => {
        if (a.isBoosted && !b.isBoosted) return -1;
        if (!a.isBoosted && b.isBoosted) return 1;
        return 0;
      });
      setProjects(sorted);
      setLoading(false);
    });

    let unsubscribeFavs = () => {};
    if (user) {
      const favQ = collection(db, 'users', user.uid, 'favorites');
      unsubscribeFavs = onSnapshot(favQ, (snapshot) => {
        setFavorites(snapshot.docs.map(doc => doc.id));
      });
    }

    return () => {
      unsubscribeProjects();
      unsubscribeFavs();
    };
  }, [user]);

  const toggleFavorite = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    if (!user) return;
    const favRef = doc(db, 'users', user.uid, 'favorites', projectId);
    if (favorites.includes(projectId)) {
      await deleteDoc(favRef);
    } else {
      await setDoc(favRef, { createdAt: new Date() });
    }
  };

  const filteredProjects = projects.filter(p => filter === 'Semua' || p.fruitType === filter);

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto pb-24">
      {/* Search & Filter */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-gray h-5 w-5" />
          <input 
            className="input-minimal pl-12" 
            placeholder="Cari lahan atau komoditas..."
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {fruitTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                filter === type 
                  ? 'bg-teal text-white shadow-lg shadow-teal/20' 
                  : 'bg-white border border-light-gray text-blue-gray hover:border-teal'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <div className="border-4 h-12 w-12 border-t-teal border-gray-200 rounded-full animate-spin"></div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="col-span-full card-minimal p-12 text-center border-dashed">
            <Search className="h-12 w-12 text-blue-gray mx-auto mb-4 opacity-30" />
            <p className="font-bold text-navy">Tidak Ada Lahan Ditemukan</p>
            <p className="text-blue-gray text-sm">Coba ubah filter atau cari kata kunci lain.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="card-minimal group cursor-pointer overflow-hidden flex flex-col"
                onClick={() => navigate(`/land/${project.id}`)}
              >
                <div className="relative h-48 bg-navy/5 overflow-hidden">
                  <img 
                    src={`https://api.dicebear.com/7.x/identicon/svg?seed=${project.id}`} 
                    className="w-full h-full object-cover opacity-60 transition-transform group-hover:scale-110" 
                    alt={project.title}
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {project.isBoosted && (
                      <div className="bg-[#FFD700] text-navy px-2 py-1 rounded-lg font-black text-[9px] uppercase tracking-tighter flex items-center gap-1 shadow-lg border border-white/20">
                        <Zap className="h-3 w-3 fill-navy" /> BOOSTED
                      </div>
                    )}
                    <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-lg font-bold text-[10px] text-teal border border-teal/20">
                      DIAMBIL OLEH INVESTOR
                    </div>
                  </div>
                  <button 
                    onClick={(e) => toggleFavorite(e, project.id)}
                    className={`absolute top-4 right-4 p-2.5 rounded-xl transition-all ${
                      favorites.includes(project.id) 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/80 backdrop-blur text-blue-gray hover:bg-white hover:text-red-500'
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${favorites.includes(project.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-teal tracking-widest uppercase">{project.fruitType}</span>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-blue-gray uppercase">
                      <Calendar className="h-3 w-3" /> {project.harvestPeriod}
                    </div>
                  </div>
                  <h3 className="font-bold text-navy text-xl line-clamp-1 mb-4 group-hover:text-teal transition-colors">{project.title}</h3>
                  
                  <div className="mt-auto pt-4 border-t border-light-gray flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-blue-gray uppercase">Harga / Petak</p>
                      <p className="text-xl font-bold text-teal">Rp {project.slotPrice.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-blue-gray uppercase">Prediksi Profit</p>
                       <p className="text-sm font-bold text-navy bg-mint/20 px-2 py-0.5 rounded-lg whitespace-nowrap">± 12-15% / Thn</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
