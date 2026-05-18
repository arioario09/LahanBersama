import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Search, RotateCcw, Trash2, Sprout, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logActivity } from '../../lib/activityLogger';

export default function ProjectManager() {
  const { user: currentUser } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'projects'), (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleResetStatus = async (id: string) => {
    if (!currentUser) return;
    if (window.confirm('Kembalikan status lahan ke Pending? Proyek akan hilang dari marketplace jika sebelumnya Approved.')) {
      try {
        await updateDoc(doc(db, 'projects', id), { status: 'pending' });
        await logActivity(currentUser.uid, currentUser.displayName || 'Admin', 'RESET_PROJECT_STATUS', `Me-reset status proyek ${id} ke Pending`, id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!currentUser) return;
    if (window.confirm('Hapus lahan ini secara permanen? Seluruh data investasi terkait mungkin akan terpengaruh.')) {
      try {
        await deleteDoc(doc(db, 'projects', id));
        await logActivity(currentUser.uid, currentUser.displayName || 'Admin', 'DELETE_PROJECT', `Menghapus lahan permanen: ${id}`, id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title?.toLowerCase().includes(search.toLowerCase()) || 
    p.fruitType?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-3xl border border-light-gray flex items-center px-6 gap-4">
        <Search className="h-5 w-5 text-blue-gray" />
        <input 
          type="text" 
          placeholder="Cari judul lahan atau jenis buah..." 
          className="flex-1 bg-transparent border-none focus:ring-0 text-navy font-medium placeholder:text-blue-gray"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-light-gray overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-bg-gray border-b border-light-gray">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black tracking-widest text-blue-gray uppercase">Lahan</th>
                <th className="px-8 py-5 text-[10px] font-black tracking-widest text-blue-gray uppercase">Petani ID</th>
                <th className="px-8 py-5 text-[10px] font-black tracking-widest text-blue-gray uppercase">Status</th>
                <th className="px-8 py-5 text-[10px] font-black tracking-widest text-blue-gray uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {filteredProjects.map((p) => (
                <tr key={p.id} className="hover:bg-bg-gray/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-mint/10 rounded-xl flex items-center justify-center text-teal">
                        <Sprout className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-black text-navy">{p.title}</p>
                        <p className="text-xs text-blue-gray font-medium">{p.fruitType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-mono text-[10px] text-blue-gray">
                    {p.userId}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${
                      p.status === 'approved' ? 'bg-mint/10 text-teal' :
                      p.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                      p.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                      'bg-bg-gray text-blue-gray'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <button 
                         onClick={() => handleResetStatus(p.id)}
                         className="p-2 bg-bg-gray text-navy hover:bg-orange-500 hover:text-white rounded-xl transition-all"
                         title="Reset ke Pending"
                      >
                         <RotateCcw className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(p.id)}
                        className="p-2 bg-bg-gray text-navy hover:bg-red-500 hover:text-white rounded-xl transition-all"
                        title="Hapus Permanen"
                      >
                         <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
