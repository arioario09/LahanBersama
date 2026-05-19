import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  where,
} from "firebase/firestore";
import {
  Users,
  Sprout,
  Activity,
  ShieldAlert,
  LogOut,
  Search,
  Filter,
  Trash2,
  UserCog,
  RotateCcw,
  ShieldCheck,
  LayoutDashboard,
  Menu,
  X,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/common/Logo";
import { logActivity } from "../../lib/activityLogger";

// Sub-components
import UserManager from "./UserManager";
import ProjectManager from "./ProjectManager";
import ActivityLogViewer from "./ActivityLogViewer";
import AdminStats from "./AdminStats";

type AdminTab = "dashboard" | "users" | "projects" | "logs";

export default function AdminDashboard() {
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (profile && profile.role !== "admin") {
      navigate("/");
    }
  }, [profile, navigate]);

  if (profile?.role !== "admin") return null;

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Manajemen User", icon: Users },
    { id: "projects", label: "Manajemen Lahan", icon: Sprout },
    { id: "logs", label: "Log Aktivitas", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-bg-gray flex">
      {/* Sidebar for Desktop */}

      <aside
        className={`bg-navy text-white transition-all duration-300 fixed left-0 top-0 h-full z-50 ${isSidebarOpen ? "w-64" : "w-20"}`}
      >
        <div className="p-6 flex items-center gap-3 relative">
          <Logo className="w-10 h-10 flex-shrink-0" iconSize="h-5 w-5" />
          {isSidebarOpen && (
            <span className="text-xl font-bold tracking-tight whitespace-nowrap">
              Dashboard <br />Lahan Bersama
            </span>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute -right-4 top-1/2 -translate-y-1/2 bg-mint text-navy p-2 rounded-full shadow-lg hidden sm:flex items-center justify-center"
          >
            {isSidebarOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AdminTab)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
                activeTab === item.id
                  ? "bg-mint text-navy font-black shadow-lg shadow-mint/20"
                  : "text-blue-gray hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="h-6 w-6 shrink-0" />
              {isSidebarOpen && (
                <span className="text-sm tracking-wide">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-8 left-0 right-0 px-4">
          <button
            onClick={signOut}
            className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-400/10 transition-all font-bold"
          >
            <LogOut className="h-6 w-6 shrink-0" />
            {isSidebarOpen && <span className="text-sm">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 overflow-y-auto h-screen p-4 sm:p-10 transition-all ${isSidebarOpen ? "sm:ml-64" : "sm:ml-20"}`}
      >
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-navy capitalize">
              {activeTab.replace("_", " ")}
            </h1>
            <p className="text-blue-gray font-medium mt-1">
              Sistem kontrol pusat LahanBersama.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-light-gray">
            <div className="bg-mint/10 p-2 rounded-xl">
              <ShieldCheck className="h-5 w-5 text-teal" />
            </div>
            <div className="pr-4">
              <p className="text-[10px] font-black tracking-widest text-blue-gray uppercase">
                Mode
              </p>
              <p className="text-xs font-black text-navy">SUPER ADMIN</p>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "dashboard" && <AdminStats />}
            {activeTab === "users" && <UserManager />}
            {activeTab === "projects" && <ProjectManager />}
            {activeTab === "logs" && <ActivityLogViewer />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
