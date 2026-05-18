import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Calendar,
  Sprout,
  ChevronRight,
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

interface Project {
  id: string;
  title: string;
  fruitType: string;
  status: string;
  totalFunds: number;
  createdAt: any;
}

interface Transaction {
  id: string;
  amount: number;
  type: "payout" | "investment";
  status: "completed" | "pending";
  date: any;
  projectName: string;
}

export default function FarmerPortfolio() {
  const { user, profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "projects"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Project,
      );
      setProjects(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const totalFunds = projects.reduce((acc, p) => acc + (p.totalFunds || 0), 0);
  const totalEarnings = totalFunds * 0.15; // Mock profit sharing logic

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-black text-navy tracking-tight">
          Portofolio Keuangan
        </h1>
        <p className="text-blue-gray font-medium">
          Pantau pendapatan dan performa investasi di lahan Anda.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link
          to="/wallet"
          className="bg-white p-6 rounded-3xl border border-light-gray shadow-sm group hover:border-[#00B0A0] transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#00B0A0]/10 p-2 rounded-xl text-[#00B0A0]">
                <Wallet className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black text-blue-gray uppercase tracking-widest">
                Dana Tersedia
              </span>
            </div>
            <p className="text-2xl font-black text-[#00B0A0]">
              Rp {(profile?.balance || 0).toLocaleString("id-ID")}
            </p>
            <p className="text-[10px] text-blue-gray font-medium mt-1">
              Siap ditarik ke rekening
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px] font-black text-teal tracking-widest">
            TARIK DANA{" "}
            <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Financial Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-navy p-6 rounded-3xl text-white md:col-span-3 relative overflow-hidden shadow-xl"
        >
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6 opacity-80">
              <Wallet className="h-5 w-5 text-mint" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Total Estimasi Pendapatan
              </span>
            </div>
            <h2 className="text-4xl font-black">
              Rp {totalEarnings.toLocaleString("id-ID")}
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold text-blue-gray uppercase mb-1">
                  Dana Terkumpul
                </p>
                <p className="font-bold">
                  Rp {totalFunds.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold text-blue-gray uppercase mb-1">
                  Total Lahan
                </p>
                <p className="font-bold">{projects.length}</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-10">
            <TrendingUp className="h-48 w-48" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-light-gray shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-red-100 p-2 rounded-xl">
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              </div>
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                Penurunan
              </span>
            </div>
            <p className="text-3xl font-black text-red-600">-4.8%</p>
            <p className="text-xs text-blue-gray font-medium mt-1">
              Dibandingkan bulan lalu
            </p>
          </div>
          <div className="h-16 flex items-end gap-1 mt-4">
            {[70, 60, 55, 40, 35, 45, 30].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-red-100 rounded-t-sm"
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-light-gray shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-mint/20 p-2 rounded-xl">
                <ArrowUpRight className="h-4 w-4 text-teal" />
              </div>
              <span className="text-[10px] font-black text-blue-gray uppercase tracking-widest">
                Pertumbuhan
              </span>
            </div>
            <p className="text-3xl font-black text-navy">+12.5%</p>
            <p className="text-xs text-blue-gray font-medium mt-1">
              Dibandingkan bulan lalu
            </p>
          </div>
          <div className="h-16 flex items-end gap-1 mt-4">
            {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-mint/30 rounded-t-sm"
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-light-gray shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-mint/20 p-2 rounded-xl">
                <ArrowUpRight className="h-4 w-4 text-teal" />
              </div>
              <span className="text-[10px] font-black text-blue-gray uppercase tracking-widest">
                Pertumbuhan
              </span>
            </div>
            <p className="text-3xl font-black text-navy">+12.5%</p>
            <p className="text-xs text-blue-gray font-medium mt-1">
              Dibandingkan bulan lalu
            </p>
          </div>
          <div className="h-16 flex items-end gap-1 mt-4">
            {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-mint/30 rounded-t-sm"
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-3xl border border-light-gray shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-mint/20 p-2 rounded-xl">
                <ArrowUpRight className="h-4 w-4 text-teal" />
              </div>
              <span className="text-[10px] font-black text-blue-gray uppercase tracking-widest">
                Pertumbuhan
              </span>
            </div>
            <p className="text-3xl font-black text-navy">+12.5%</p>
            <p className="text-xs text-blue-gray font-medium mt-1">
              Dibandingkan bulan lalu
            </p>
          </div>
          <div className="h-16 flex items-end gap-1 mt-4">
            {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-mint/30 rounded-t-sm"
                style={{ height: `${h}%` }}
              ></div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transaction History */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-navy tracking-tight flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal" /> Riwayat Keuangan
            </h3>
            <button className="text-xs font-black text-teal hover:underline tracking-widest">
              LIHAT SEMUA
            </button>
          </div>
          <div className="space-y-3">
            {projects.length === 0 ? (
              <div className="p-12 text-center border-2 border-dashed rounded-3xl border-light-gray opacity-50">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-blue-gray" />
                <p className="font-bold text-navy">Belum ada transaksi</p>
              </div>
            ) : (
              projects.slice(0, 5).map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white p-4 rounded-2xl border border-light-gray flex items-center justify-between hover:border-teal transition-all shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-mint/10 p-3 rounded-xl">
                      <ArrowDownRight className="h-5 w-5 text-teal" />
                    </div>
                    <div>
                      <h4 className="font-bold text-navy text-sm">
                        {project.title}
                      </h4>
                      <p className="text-[10px] text-blue-gray font-medium uppercase tracking-tight">
                        Investasi Masuk
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-navy">
                      Rp {project.totalFunds.toLocaleString("id-ID")}
                    </p>
                    <p className="text-[10px] text-teal font-bold uppercase tracking-tight">
                      Selesai
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Project Breakdown */}
        <section className="space-y-4">
          <h3 className="text-xl font-black text-navy tracking-tight flex items-center gap-2">
            <Sprout className="h-5 w-5 text-teal" /> Performa Lahan
          </h3>
          <div className="bg-bg-gray p-6 rounded-3xl space-y-6">
            {projects.length === 0 ? (
              <p className="text-sm text-blue-gray text-center py-8">
                Belum ada performa lahan untuk ditampilkan.
              </p>
            ) : (
              projects.map((p) => (
                <div key={p.id} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="font-bold text-navy text-sm">{p.title}</p>
                      <p className="text-[10px] text-blue-gray uppercase font-bold">
                        {p.fruitType}
                      </p>
                    </div>
                    <p className="font-black text-navy text-sm">85%</p>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal rounded-full"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
