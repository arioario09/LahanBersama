import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  where,
  addDoc,
  setDoc,
} from "firebase/firestore";
import {
  Search,
  UserCog,
  ShieldAlert,
  Trash2,
  CheckCircle,
  XCircle,
  Plus,
  Edit2,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { logActivity } from "../../lib/activityLogger";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";

export default function UserManager() {
  const { user: currentUser } = useAuth();
  const auth = getAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [addFormData, setAddFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "investor",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "investor",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateRole = async (id: string, newRole: string) => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, "users", id), { role: newRole });
      await logActivity(
        currentUser.uid,
        currentUser.displayName || "Admin",
        "UPDATE_ROLE",
        `Mengubah role user ${id} menjadi ${newRole}`,
        id,
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSuspend = async (id: string, currentStatus: string) => {
    if (!currentUser) return;
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      await updateDoc(doc(db, "users", id), { status: newStatus });
      await logActivity(
        currentUser.uid,
        currentUser.displayName || "Admin",
        "TOGGLE_SUSPEND",
        `Mengubah status user ${id} menjadi ${newStatus}`,
        id,
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!currentUser) return;
    if (
      window.confirm(
        "Hapus user ini secara permanen? Tindakan ini tidak dapat dibatalkan.",
      )
    ) {
      try {
        await deleteDoc(doc(db, "users", id));
        await logActivity(
          currentUser.uid,
          currentUser.displayName || "Admin",
          "DELETE_USER",
          `Menghapus user permanen: ${id}`,
          id,
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !currentUser ||
      !addFormData.name ||
      !addFormData.email ||
      !addFormData.password
    ) {
      alert("Semua field harus diisi");
      return;
    }

    setIsSubmitting(true);
    const adminUid = currentUser.uid;

    try {
      // Generate a new uid for the user document (don't create auth account yet)
      const newUserRef = doc(collection(db, "users"));
      const newUid = newUserRef.id;

      // Create user profile in Firestore (without Firebase Auth account)
      await setDoc(newUserRef, {
        uid: newUid,
        name: addFormData.name,
        email: addFormData.email,
        role: addFormData.role,
        status: "active",
        verificationStatus: "pending",
        password: addFormData.password, // Simpan password di Firestore (opsional, untuk user bisa login)
        createdAt: new Date().toISOString(),
      });

      await logActivity(
        adminUid,
        currentUser.displayName || "Admin",
        "CREATE_USER",
        `Menambahkan user baru: ${addFormData.name} (${addFormData.role})`,
        newUid,
      );

      alert(
        `User '${addFormData.name}' berhasil dibuat!\n\nEmail: ${addFormData.email}\nPassword: ${addFormData.password}\n\nUser dapat login dengan kredensial ini.`,
      );
      setAddFormData({ name: "", email: "", password: "", role: "investor" });
      setShowAddModal(false);
    } catch (err: any) {
      console.error(err);
      alert("Gagal membuat user: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !editingUser) return;

    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, "users", editingUser.id), {
        name: editFormData.name,
        email: editFormData.email,
        role: editFormData.role,
      });

      await logActivity(
        currentUser.uid,
        currentUser.displayName || "Admin",
        "EDIT_USER",
        `Mengedit data user ${editingUser.name}`,
        editingUser.id,
      );

      setEditFormData({ name: "", email: "", role: "investor" });
      setEditingUser(null);
      setShowEditModal(false);
    } catch (err: any) {
      console.error(err);
      alert("Gagal mengubah user: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="bg-white p-4 rounded-3xl border border-light-gray flex items-center px-6 gap-4 flex-1">
          <Search className="h-5 w-5 text-blue-gray" />
          <input
            type="text"
            placeholder="Cari nama atau email..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-navy font-medium placeholder:text-blue-gray"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-mint text-navy px-6 py-4 rounded-3xl font-black flex items-center gap-2 hover:shadow-lg transition-all"
        >
          <Plus className="h-5 w-5" />
          Tambah User
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-light-gray overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-bg-gray border-b border-light-gray">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black tracking-widest text-blue-gray uppercase">
                  Pengguna
                </th>
                <th className="px-8 py-5 text-[10px] font-black tracking-widest text-blue-gray uppercase">
                  Role
                </th>
                <th className="px-8 py-5 text-[10px] font-black tracking-widest text-blue-gray uppercase">
                  Status Verifikasi
                </th>
                <th className="px-8 py-5 text-[10px] font-black tracking-widest text-blue-gray uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {filteredUsers.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-bg-gray/50 transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-navy/5 rounded-full flex items-center justify-center text-navy font-black text-xs">
                        {u.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-navy">{u.name}</p>
                        <p className="text-xs text-blue-gray font-medium">
                          {u.email}
                        </p>
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
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${
                        u.verificationStatus === "verified"
                          ? "bg-mint/10 text-teal"
                          : u.verificationStatus === "pending"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-red-100 text-red-600"
                      }`}
                    >
                      {u.verificationStatus || "unverified"}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-2 rounded-xl transition-all bg-bg-gray text-navy hover:bg-mint hover:text-navy"
                        title="Edit User"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleToggleSuspend(u.id, u.status || "active")
                        }
                        className={`p-2 rounded-xl transition-all ${
                          u.status === "suspended"
                            ? "bg-red-500 text-white"
                            : "bg-bg-gray text-navy hover:bg-red-50"
                        }`}
                        title={
                          u.status === "suspended"
                            ? "Aktifkan Kembali"
                            : "Suspend User"
                        }
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

      {/* Modal Add User */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-navy">
                Tambah User Baru
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-bg-gray rounded-xl transition-all"
              >
                <X className="h-5 w-5 text-navy" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-blue-gray mb-2 uppercase tracking-widest">
                  Nama
                </label>
                <input
                  type="text"
                  value={addFormData.name}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, name: e.target.value })
                  }
                  className="w-full bg-bg-gray border border-light-gray rounded-xl p-3 text-navy font-medium focus:ring-2 focus:ring-mint focus:border-transparent"
                  placeholder="Nama lengkap"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-blue-gray mb-2 uppercase tracking-widest">
                  Email
                </label>
                <input
                  type="email"
                  value={addFormData.email}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, email: e.target.value })
                  }
                  className="w-full bg-bg-gray border border-light-gray rounded-xl p-3 text-navy font-medium focus:ring-2 focus:ring-mint focus:border-transparent"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-blue-gray mb-2 uppercase tracking-widest">
                  Password
                </label>
                <input
                  type="password"
                  value={addFormData.password}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, password: e.target.value })
                  }
                  className="w-full bg-bg-gray border border-light-gray rounded-xl p-3 text-navy font-medium focus:ring-2 focus:ring-mint focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-blue-gray mb-2 uppercase tracking-widest">
                  Role
                </label>
                <select
                  value={addFormData.role}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, role: e.target.value })
                  }
                  className="w-full bg-bg-gray border border-light-gray rounded-xl p-3 text-navy font-medium focus:ring-2 focus:ring-mint focus:border-transparent"
                >
                  <option value="investor">Investor</option>
                  <option value="petani">Petani</option>
                  <option value="validator">Validator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-bg-gray text-navy font-black py-3 rounded-xl hover:bg-light-gray transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-mint text-navy font-black py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit User */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-navy">Edit User</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-bg-gray rounded-xl transition-all"
              >
                <X className="h-5 w-5 text-navy" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-blue-gray mb-2 uppercase tracking-widest">
                  Nama
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full bg-bg-gray border border-light-gray rounded-xl p-3 text-navy font-medium focus:ring-2 focus:ring-mint focus:border-transparent"
                  placeholder="Nama lengkap"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-blue-gray mb-2 uppercase tracking-widest">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className="w-full bg-bg-gray border border-light-gray rounded-xl p-3 text-navy font-medium focus:ring-2 focus:ring-mint focus:border-transparent"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-blue-gray mb-2 uppercase tracking-widest">
                  Role
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, role: e.target.value })
                  }
                  className="w-full bg-bg-gray border border-light-gray rounded-xl p-3 text-navy font-medium focus:ring-2 focus:ring-mint focus:border-transparent"
                >
                  <option value="investor">Investor</option>
                  <option value="petani">Petani</option>
                  <option value="validator">Validator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-bg-gray text-navy font-black py-3 rounded-xl hover:bg-light-gray transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-mint text-navy font-black py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
