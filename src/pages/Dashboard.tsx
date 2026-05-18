import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  Sprout,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { motion } from "motion/react";

export default function Dashboard() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const stats = [
    {
      title: "Lahan Aktif",
      value: "0",
      icon: <Sprout className="h-6 w-6" />,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Total Investasi",
      value: "Rp 0",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "bg-blue-100 text-blue-600",
    },
  ];

  return (
    <div className="bg-bg-gray min-h-screen flex flex-col">
      {/* Top Bar */}
      <nav className="bg-navy h-16 flex items-center justify-between px-6 sm:px-8 text-white shadow-lg shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-mint rounded-lg flex items-center justify-center font-bold text-navy">
            LB
          </div>
          <span className="text-xl font-bold tracking-tight">LahanBersama</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden sm:text-right sm:block">
            <p className="text-[10px] text-blue-gray uppercase font-bold leading-none mb-1">
              Role Pengguna
            </p>
            <p className="text-sm font-medium capitalize">
              {profile?.role} Terdaftar
            </p>
          </div>
          <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-mint overflow-hidden shrink-0">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.name}`}
              alt="Avatar"
            />
          </div>
        </div>
      </nav>

      <main className="flex-grow flex items-center justify-center py-10 px-4 sm:p-8">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="card-minimal p-6 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-navy/5 rounded-3xl flex items-center justify-center mb-4">
                <User className="h-10 text-navy w-10" />
              </div>
              <h2 className="font-bold text-navy text-xl line-clamp-1">
                {profile?.name}
              </h2>
              <div className="flex flex-col mt-3 gap-2 w-full">
                <span className="bg-teal/10 px-4 py-1.5 rounded-xl font-bold text-teal text-xs uppercase tracking-wider">
                  {profile?.role}
                </span>
                {profile?.verificationStatus === "verified" ? (
                  <div className="flex items-center justify-center gap-1 text-green-600 font-bold text-xs bg-green-50 py-1.5 rounded-xl border border-green-100">
                    <ShieldCheck className="h-4 w-4" />
                    TERVERIFIKASI
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1 text-orange-500 font-bold text-xs bg-orange-50 py-1.5 rounded-xl border border-orange-100">
                    <AlertCircle className="h-4 w-4" />
                    BUTUH VERIFIKASI
                  </div>
                )}
              </div>
            </div>

            <div className="card-minimal p-6">
              <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-blue-gray">
                Aksi Cepat
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-mint/10 transition-colors group">
                  <span className="font-bold text-sm text-navy">
                    Lengkapi Profil
                  </span>
                  <ChevronRight className="h-4 w-4 text-blue-gray group-hover:text-teal" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-mint/10 transition-colors group">
                  <span className="font-bold text-sm text-navy">
                    Bantuan & Support
                  </span>
                  <ChevronRight className="h-4 w-4 text-blue-gray group-hover:text-teal" />
                </button>
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors group"
                >
                  <span className="font-bold text-sm text-red-600">
                    Keluar Sistem
                  </span>
                  <LogOut className="h-4 w-4 text-red-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="card-minimal p-6 flex items-center gap-5"
                >
                  <div className={`p-4 rounded-2xl ${stat.color} shrink-0`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-blue-gray font-bold text-xs uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <h3 className="font-bold text-navy text-2xl mt-0.5">
                      {stat.value}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl shadow-lg border border-light-gray flex flex-col overflow-hidden"
            >
              <div className="p-8 border-b border-light-gray bg-navy/5">
                <h3 className="font-bold text-navy text-2xl">
                  Selamat Datang di LahanBersama!
                </h3>
                <p className="text-blue-gray mt-2 text-lg">
                  Mulai jelajahi peluang pertanian hari ini.
                </p>
              </div>
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-mint/5 rounded-full flex items-center justify-center mb-6">
                  <Sprout className="h-12 text-teal w-12" />
                </div>
                <p className="text-blue-gray max-w-sm text-lg leading-relaxed mb-8">
                  Anda dapat mulai berpartisipasi penuh setelah proses
                  verifikasi akun Anda disetujui oleh tim validator kami.
                </p>
                {profile?.verificationStatus !== "verified" && (
                  <button
                    onClick={() => navigate("/verify-ktp")}
                    className="btn-mint px-10 py-4 text-lg"
                  >
                    Verifikasi Sekarang
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <footer className="h-12 bg-white border-t border-light-gray flex items-center justify-center px-8 shrink-0 text-[10px] text-blue-gray font-bold uppercase tracking-[0.2em] mt-auto">
        LahanBersama &copy; 2026 &bull; Platform Gotong Royong Digital
      </footer>
    </div>
  );
}
