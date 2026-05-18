import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sprout, TrendingUp, User, PlusCircle, Search, Heart, Briefcase, MessageCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function BottomNav() {
  const { profile } = useAuth();
  
  const petaniItems = [
    { to: '/', icon: <Sprout className="h-6 w-6" />, label: 'Lahan' },
    { to: '/porto', icon: <TrendingUp className="h-6 w-6" />, label: 'Porto' },
    { to: '/chat', icon: <MessageCircle className="h-6 w-6" />, label: 'Chat' },
    { to: '/profile', icon: <User className="h-6 w-6" />, label: 'Profil' },
  ];

  const investorItems = [
    { to: '/', icon: <Search className="h-6 w-6" />, label: 'Cari' },
    { to: '/investments', icon: <Briefcase className="h-6 w-6" />, label: 'Investasi' },
    { to: '/chat', icon: <MessageCircle className="h-6 w-6" />, label: 'Chat' },
    { to: '/profile', icon: <User className="h-6 w-6" />, label: 'Profil' },
  ];

  const validatorItems = [
    { to: '/validator', icon: <ShieldCheck className="h-6 w-6" />, label: 'Verifikasi' },
    { to: '/profile', icon: <User className="h-6 w-6" />, label: 'Profil' },
  ];

  const adminItems = [
    { to: '/admin', icon: <ShieldCheck className="h-6 w-6" />, label: 'Admin' },
    { to: '/profile', icon: <User className="h-6 w-6" />, label: 'Profil' },
  ];

  const navItems = profile?.role === 'admin' ? adminItems : (profile?.role === 'validator' ? validatorItems : (profile?.role === 'petani' ? petaniItems : investorItems));

  return (
    <nav className="bg-white border-light-gray bottom-0 fixed w-full z-50 border-t pb-safe sm:hidden">
      <div className="flex items-center justify-around py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 transition-colors ${
                isActive ? 'text-teal' : 'text-blue-gray'
              }`
            }
          >
            {item.icon}
            <span className="font-bold text-[10px] uppercase tracking-wider">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
