import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import BottomNav from "./BottomNav";
import { useAuth } from "../../contexts/AuthContext";
import { LogOut } from "lucide-react";
import Logo from "../common/Logo";

export default function Layout() {
  const { profile, signOut } = useAuth();

  return (
    <div className="bg-bg-gray min-h-screen flex flex-col pb-20 sm:pb-0">
      {/* Shared Top Bar for Desktop/Tablet */}
      <nav className="bg-navy h-16 flex items-center justify-between px-6 sm:px-8 text-white shadow-lg shrink-0 z-50">
        <div className="flex items-center gap-3">
          <Logo className="w-9 h-9" iconSize="h-5 w-5" />
          <span className="text-xl font-bold tracking-tight">LahanBersama</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center gap-8 mr-auto ml-12">
          {profile?.role === "admin" ? (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `font-bold text-sm transition-colors ${isActive ? "text-mint underline decoration-2 underline-offset-4" : "hover:text-mint"}`
              }
            >
              Panel Admin
            </NavLink>
          ) : profile?.role === "validator" ? (
            <NavLink
              to="/validator"
              className={({ isActive }) =>
                `font-bold text-sm transition-colors ${isActive ? "text-mint underline decoration-2 underline-offset-4" : "hover:text-mint"}`
              }
            >
              Panel Verifikasi
            </NavLink>
          ) : profile?.role === "petani" ? (
            <>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `font-bold text-sm transition-colors ${isActive ? "text-mint underline decoration-2 underline-offset-4" : "hover:text-mint"}`
                }
              >
                Daftar Lahan
              </NavLink>
              <NavLink
                to="/buka-lapak"
                className={({ isActive }) =>
                  `font-bold text-sm transition-colors ${isActive ? "text-mint underline decoration-2 underline-offset-4" : "hover:text-mint"}`
                }
              >
                Buka Lapak
              </NavLink>
              <NavLink
                to="/porto"
                className={({ isActive }) =>
                  `font-bold text-sm transition-colors ${isActive ? "text-mint underline decoration-2 underline-offset-4" : "hover:text-mint"}`
                }
              >
                Portofolio
              </NavLink>
              <NavLink
                to="/chat"
                className={({ isActive }) =>
                  `font-bold text-sm transition-colors ${isActive ? "text-mint underline decoration-2 underline-offset-4" : "hover:text-mint"}`
                }
              >
                Chat
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `font-bold text-sm transition-colors ${isActive ? "text-mint underline decoration-2 underline-offset-4" : "hover:text-mint"}`
                }
              >
                Cari Lahan
              </NavLink>
              <NavLink
                to="/favorites"
                className={({ isActive }) =>
                  `font-bold text-sm transition-colors ${isActive ? "text-mint underline decoration-2 underline-offset-4" : "hover:text-mint"}`
                }
              >
                Simpanan
              </NavLink>
              <NavLink
                to="/investments"
                className={({ isActive }) =>
                  `font-bold text-sm transition-colors ${isActive ? "text-mint underline decoration-2 underline-offset-4" : "hover:text-mint"}`
                }
              >
                Investasi Saya
              </NavLink>
              <NavLink
                to="/chat"
                className={({ isActive }) =>
                  `font-bold text-sm transition-colors ${isActive ? "text-mint underline decoration-2 underline-offset-4" : "hover:text-mint"}`
                }
              >
                Chat
              </NavLink>
            </>
          )}
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
          <button
            onClick={() => signOut()}
            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <main className="flex-grow">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
