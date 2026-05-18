import React, { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Users, Sprout, ShieldCheck, TrendingUp, AlertCircle, Wallet } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFarmers: 0,
    activeProjects: 0,
    pendingVerifications: 0,
    totalInvestment: 0
  });

  useEffect(() => {
    async function fetchStats() {
      const usersSnap = await getDocs(collection(db, 'users'));
      const projectsSnap = await getDocs(collection(db, 'projects'));
      const investmentsSnap = await getDocs(collection(db, 'investments'));

      const users = usersSnap.docs.map(d => d.data());
      const projects = projectsSnap.docs.map(d => d.data());
      const investments = investmentsSnap.docs.map(d => d.data());

      setStats({
        totalUsers: users.length,
        totalFarmers: users.filter((u: any) => u.role === 'petani').length,
        activeProjects: projects.filter((p: any) => p.status === 'approved').length,
        pendingVerifications: users.filter((u: any) => u.verificationStatus === 'pending').length,
        totalInvestment: investments.reduce((sum: number, inv: any) => sum + (inv.totalPaid || 0), 0)
      });
    }

    fetchStats();
  }, []);

  const cardData = [
    { label: 'Total Pengguna', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
    { label: 'Petani Aktif', value: stats.totalFarmers, icon: Sprout, color: 'bg-mint' },
    { label: 'Lahan Disetujui', value: stats.activeProjects, icon: ShieldCheck, color: 'bg-teal' },
    { label: 'Antrean Verifikasi', value: stats.pendingVerifications, icon: AlertCircle, color: 'bg-orange-500' },
    { label: 'Total Investasi', value: `Rp ${stats.totalInvestment.toLocaleString('id-ID')}`, icon: Wallet, color: 'bg-purple-500' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {cardData.map((data, index) => (
        <motion.div
          key={data.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-6 rounded-[2rem] border border-light-gray shadow-sm hover:shadow-md transition-all group"
        >
          <div className={`w-12 h-12 rounded-2xl ${data.color} text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
            <data.icon className="h-6 w-6" />
          </div>
          <p className="text-[10px] font-black tracking-widest text-blue-gray uppercase mb-1">{data.label}</p>
          <p className="text-2xl font-black text-navy">{data.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
