import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Sprout, MapPin, Calendar, ShieldCheck, Star, Users, TrendingUp, ChevronRight, Camera, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [farmer, setFarmer] = useState<any>(null);
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const fetchProject = async () => {
      const docSnap = await getDoc(doc(db, 'projects', projectId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProject({ id: docSnap.id, ...data });
        
        // Fetch farmer profile
        const farmerSnap = await getDoc(doc(db, 'users', data.userId));
        if (farmerSnap.exists()) {
          setFarmer(farmerSnap.data());
        }
      }
      setLoading(false);
    };

    const auditsQ = query(
      collection(db, 'projects', projectId, 'audits'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribeAudits = onSnapshot(auditsQ, (snapshot) => {
      setAudits(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    fetchProject();
    return () => unsubscribeAudits();
  }, [projectId]);

  const startChat = async () => {
    if (!user || !project) return;
    
    // Check if chat already exists
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      where('projectId', '==', project.id)
    );
    
    const snap = await getDocs(q);
    const existingChat = snap.docs.find(doc => doc.data().participants.includes(project.userId));

    if (existingChat) {
      navigate(`/chat/${existingChat.id}`);
    } else {
      const newChatRef = await addDoc(collection(db, 'chats'), {
        participants: [user.uid, project.userId],
        projectId: project.id,
        projectTitle: project.title,
        lastMessage: '',
        updatedAt: serverTimestamp()
      });
      navigate(`/chat/${newChatRef.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-gray">
        <div className="border-4 h-12 w-12 border-t-teal border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) return <div>Lahan tidak ditemukan</div>;

  return (
    <div className="bg-bg-gray min-h-screen">
      <div className="relative h-64 sm:h-80 bg-navy overflow-hidden">
        <img 
          src={`https://api.dicebear.com/7.x/identicon/svg?seed=${project.id}`} 
          className="w-full h-full object-cover opacity-40" 
          alt={project.title}
        />
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 p-3 bg-white/20 backdrop-blur rounded-2xl text-white hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      <main className="max-w-4xl mx-auto px-4 -mt-12 relative z-10 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8"
        >
           <div className="p-8 border-b border-light-gray">
              <div className="flex items-center gap-2 mb-2">
                 <span className="bg-teal/10 text-teal text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                   {project.fruitType}
                 </span>
                 <span className="bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-green-100 flex items-center gap-1">
                   {project.status}
                 </span>
              </div>
              <h1 className="text-3xl font-bold text-navy mb-4">{project.title}</h1>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-4">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-bg-gray rounded-xl"><MapPin className="h-5 w-5 text-blue-gray" /></div>
                    <div>
                       <p className="text-[10px] font-bold text-blue-gray uppercase">Lokasi</p>
                       <p className="text-sm font-bold truncate">Jawa Barat</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-bg-gray rounded-xl"><Calendar className="h-5 w-5 text-blue-gray" /></div>
                    <div>
                       <p className="text-[10px] font-bold text-blue-gray uppercase">Periode</p>
                       <p className="text-sm font-bold">{project.harvestPeriod}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-bg-gray rounded-xl"><TrendingUp className="h-5 w-5 text-teal" /></div>
                    <div>
                       <p className="text-[10px] font-bold text-blue-gray uppercase">ROI ±</p>
                       <p className="text-sm font-bold text-teal">15% / Thn</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-bg-gray rounded-xl"><Users className="h-5 w-5 text-blue-gray" /></div>
                    <div>
                       <p className="text-[10px] font-bold text-blue-gray uppercase">Petak</p>
                       <p className="text-sm font-bold">{project.slotSize} m²</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <h3 className="font-bold text-navy text-xl tracking-tight">Profil Pengelola</h3>
                 <div className="flex items-center gap-4 bg-bg-gray/50 p-4 rounded-2xl border border-light-gray">
                    <div className="w-14 h-14 bg-navy rounded-xl flex items-center justify-center shrink-0">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${farmer?.name}`} alt="Avatar" className="h-10 w-10" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="font-bold text-navy truncate">{farmer?.name}</h4>
                       <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center gap-0.5 text-orange-500">
                             <Star className="h-3 w-3 fill-current" />
                             <span className="text-xs font-bold">4.9</span>
                          </div>
                          <span className="text-blue-gray text-[10px]">•</span>
                          <span className="text-green-600 text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5">
                             <ShieldCheck className="h-3 w-3" /> KTP Verified
                          </span>
                       </div>
                    </div>
                 </div>
                 <p className="text-blue-gray text-sm leading-relaxed italic">
                   "{farmer?.bio || 'Petani berpengalaman di komunitas LahanBersama.'}"
                 </p>
              </div>

              <div className="space-y-6">
                 <h3 className="font-bold text-navy text-xl tracking-tight">Timeline Proyek</h3>
                 <div className="space-y-4">
                    <div className="flex gap-4">
                       <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-teal rounded-full"></div>
                          <div className="w-0.5 flex-1 bg-teal/20"></div>
                       </div>
                       <div className="pb-4">
                          <p className="text-[10px] font-bold text-teal uppercase mb-1">Mei 2026</p>
                          <p className="font-bold text-sm">Pembukaan Pendanaan</p>
                       </div>
                    </div>
                    <div className="flex gap-4 opacity-40">
                       <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-light-gray rounded-full"></div>
                          <div className="w-0.5 flex-1 bg-light-gray/20"></div>
                       </div>
                       <div className="pb-4">
                          <p className="text-[10px] font-bold text-blue-gray uppercase mb-1">Juni 2026</p>
                          <p className="font-bold text-sm">Tahap Penyiapan Lahan</p>
                       </div>
                    </div>
                    <div className="flex gap-4 opacity-40">
                       <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-light-gray rounded-full"></div>
                       </div>
                       <div>
                          <p className="text-[10px] font-bold text-blue-gray uppercase mb-1">Januari 2027</p>
                          <p className="font-bold text-sm">Target Masa Panen</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </motion.div>

        {/* Update Feed */}
        <section className="space-y-6">
           <h3 className="font-bold text-navy text-2xl tracking-tight flex items-center gap-3">
              <Camera className="h-6 w-6 text-teal" /> Update Progress
           </h3>
           {audits.length === 0 ? (
             <div className="card-minimal p-12 text-center border-dashed">
                <p className="text-blue-gray font-medium">Belum ada update dari petani.</p>
             </div>
           ) : (
             <div className="space-y-6">
                {audits.map((audit) => (
                  <div key={audit.id} className="card-minimal overflow-hidden">
                     <div className="flex flex-col sm:flex-row h-full">
                        <div className="sm:w-48 h-48 bg-bg-gray shrink-0">
                           <img src={audit.photoUrl} className="w-full h-full object-cover" alt="Update" />
                        </div>
                        <div className="p-6">
                           <p className="text-[10px] font-bold text-blue-gray uppercase mb-1">
                              {audit.createdAt?.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                           </p>
                           <p className="text-navy font-medium leading-relaxed">{audit.description}</p>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
           )}
        </section>
      </main>

      {/* Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-light-gray p-6 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] sm:bottom-0">
         <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
            <div className="hidden sm:block">
               <p className="text-[10px] font-bold text-blue-gray uppercase">Harga / Petak</p>
               <h4 className="text-2xl font-bold text-teal tracking-tight">Rp {project.slotPrice.toLocaleString('id-ID')}</h4>
            </div>
          <div className="flex gap-4">
            <button 
              onClick={startChat}
              className="p-4 bg-navy text-white rounded-2xl hover:bg-teal transition-all flex items-center justify-center shadow-lg"
              title="Tanya Petani"
            >
              <MessageCircle className="h-6 w-6" />
            </button>
            <button 
              onClick={() => {
                if (profile?.verificationStatus !== 'verified') {
                  navigate('/verify-ktp');
                } else {
                  navigate(`/invest/${project.id}`);
                }
              }}
              className="btn-mint flex-1 h-16 text-xl tracking-tight flex items-center justify-center gap-3 shadow-mint/30"
            >
               INVESTASI SEKARANG
               <ChevronRight className="h-6 w-6" />
            </button>
          </div>
         </div>
      </div>
    </div>
  );
}
