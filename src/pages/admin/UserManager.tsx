import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, getDocs, where } from 'firebase/firestore';
import { Search, UserCog, ShieldAlert, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logActivity } from '../../lib/activityLogger';

export default function UserManager() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateRole = async (id: string, newRole: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'users', id), { role: newRole });
      await logActivity(currentUser.uid, currentUser.displayName || 'Admin', 'UPDATE_ROLE', `Mengubah role user ${id} menjadi ${newRole}`, id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSuspend = async (id: string, currentStatus: string) => {
    if (!currentUser) return;
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await updateDoc(doc(db, 'users', id), { status: newStatus });
      await logActivity(currentUser.uid, currentUser.displayName || 'Admin', 'TOGGLE_SUSPEND', `Mengubah status user ${id} menjadi ${newStatus}`, id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!currentUser) return;
    if (window.confirm('Hapus user ini secara permanen? Tindakan ini tidak dapat dibatalkan.')) {
      try {
        await deleteDoc(doc(db, 'users', id));
        await logActivity(currentUser.uid, currentUser.displayName || 'Admin', 'DELETE_USER', `Menghapus user permanen: ${id}`, id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name?.toLowerCase().includes(search.toLowerCase()) || 
     u.email?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-3xl border border-light-gray flex items-center px-6 gap-4">
        <Search className="h-5 w-5 text-blue-gray" />
        <input 
          type="text" 
          placeholder="Cari nama atau email..." 
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
                <th className="px-8 py-5 text-[10px] font-black tracking-widest text-blue-gray uppercase">Pengguna</th>
                <th className="px-8 py-5 text-[10px] font-black tracking-widest text-blue-gray uppercase">Role</th>
                <th className="px-8 py-5 text-[10px] font-black tracking-widest text-blue-gray uppercase">Status Verifikasi</th>
                <th className="px-8 py-5 text-[10px] font-black tracking-widest text-blue-gray uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-bg-gray/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-navy/5 rounded-full flex items-center justify-center text-navy font-black text-xs">
                        {u.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-navy">{u.name}</p>
                        <p className="text-xs text-blue-gray font-medium">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                      className="bg-bg-gray border-none rounded-xl text-xs font-black text-navy py-2 px-4 focus:ring-2 focus:ring-mint transition-all"
                    >
                      <option value="investor">Investor</option>
                      <option value="petani">Petani</option>
                      <option value="validator">Validator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${
                      u.verificationStatus === 'verified' ? 'bg-mint/10 text-teal' :
                      u.verificationStatus === 'pending' ? 'bg-blue-100 text-blue-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {u.verificationStatus || 'unverified'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <button 
                         onClick={() => handleToggleSuspend(u.id, u.status || 'active')}
                         className={`p-2 rounded-xl transition-all ${
                           u.status === 'suspended' ? 'bg-red-500 text-white' : 'bg-bg-gray text-navy hover:bg-red-50'
                         }`}
                         title={u.status === 'suspended' ? 'Aktifkan Kembali' : 'Suspend User'}
                      >
                         <ShieldAlert className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
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
