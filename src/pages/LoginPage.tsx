import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import {
  LogIn,
  Mail,
  Lock,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion } from "motion/react";
import Logo from "../components/common/Logo";

export default function LoginPage() {
  const { setMockProfile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const routeForRole = (role?: string) => {
    if (role === "admin") return "/admin";
    if (role === "validator") return "/validator";
    if (role === "petani") return "/";
    return "/";
  };

  const handleDemoLogin = (role: "petani" | "investor" | "validator") => {
    setLoading(true);
    setError("");

    // Use the mock mode to bypass Firebase authentication issues
    setTimeout(() => {
      setMockProfile(role);
      setLoading(false);
      navigate("/");
    }, 500);
  };

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, "users", result.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const role = userDocSnap.data()?.role;
        navigate(routeForRole(role), { replace: true });
      } else {
        navigate("/register", { replace: true });
      }
    } catch (err: any) {
      setError("Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      const userDocRef = doc(db, "users", googleUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        navigate("/register?provider=google", { replace: true });
      } else {
        const role = userDocSnap.data()?.role;
        navigate(routeForRole(role), { replace: true });
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      if (err.code === "auth/account-exists-with-different-credential") {
        setError(
          `Akun Google sudah terdaftar dengan metode lain. Silakan login dengan email/password. (${err.message || err.code})`,
        );
      } else if (
        err.code === "auth/popup-blocked" ||
        err.code === "auth/popup-closed-by-user"
      ) {
        setError(
          "Popup Google diblokir atau ditutup — izinkan popup lalu coba lagi.",
        );
      } else {
        setError(`Gagal login dengan Google: ${err.message || err.code}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-bg-gray min-h-screen px-4 items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white p-8 sm:p-10 shadow-xl border border-light-gray rounded-3xl">
          <div className="flex flex-col mb-10 items-center text-center">
            <Logo className="w-20 h-20 mb-6" iconSize="h-10 w-10" />
            <h1 className="font-bold text-navy text-3xl tracking-tight">
              LahanBersama
            </h1>
            <p className="text-blue-gray mt-2 text-base font-medium">
              Akses platform pertanian gotong royong
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex bg-red-50 mb-8 p-4 rounded-xl gap-3 items-center text-red-600 border border-red-100"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-xs font-bold leading-none">
                {error.toUpperCase()}
              </p>
            </motion.div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-navy tracking-[0.2em] uppercase ml-1">
                Alamat Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-minimal"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-navy tracking-[0.2em] uppercase ml-1">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-minimal pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-gray hover:text-navy transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-mint w-full py-5 text-lg mt-4 shadow-mint/30 text-white"
            >
              {loading ? "Memproses..." : "Masuk sekarang"}
            </button>
          </form>

          <div className="mt-10 mb-8 relative h-0.5">
            <div className="border-light-gray top-1/2 absolute w-full border-t"></div>
            <div className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 absolute">
              <span className="bg-white px-4 text-blue-gray text-[10px] font-bold uppercase tracking-widest">
                Atau
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="flex bg-gray-50 hover:bg-gray-100 mt-8 border border-light-gray w-full py-4 rounded-xl font-bold text-navy items-center justify-center gap-3 text-sm transition-all"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="h-5 w-5"
            />
            MASUK DENGAN GOOGLE
          </button>

          {/* Demo Login Buttons */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <button
              onClick={() => handleDemoLogin("petani")}
              disabled={loading}
              className="bg-navy/5 hover:bg-navy/10 p-4 rounded-2xl flex flex-col items-center gap-2 border border-navy/10 transition-all group disabled:opacity-50"
            >
              <div className="bg-white p-2 rounded-xl shadow-sm text-navy group-hover:bg-navy group-hover:text-white transition-all">
                <LogIn className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black tracking-widest text-navy">
                DEMO PETANI
              </span>
              <span className="text-[8px] text-blue-gray font-medium">
                farmer@demo.com
              </span>
            </button>

            <button
              onClick={() => handleDemoLogin("investor")}
              disabled={loading}
              className="bg-mint/5 hover:bg-mint/10 p-4 rounded-2xl flex flex-col items-center gap-2 border border-mint/10 transition-all group disabled:opacity-50"
            >
              <div className="bg-white p-2 rounded-xl shadow-sm text-teal group-hover:bg-teal group-hover:text-white transition-all">
                <LogIn className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black tracking-widest text-teal">
                DEMO INVESTOR
              </span>
              <span className="text-[8px] text-blue-gray font-medium">
                investor@demo.com
              </span>
            </button>
            <button
              onClick={() => handleDemoLogin("validator")}
              disabled={loading}
              className="bg-gray-100 hover:bg-gray-200 p-4 rounded-2xl flex flex-col items-center gap-2 border border-gray-200 transition-all group disabled:opacity-50 col-span-2"
            >
              <div className="bg-white p-2 rounded-xl shadow-sm text-navy group-hover:bg-navy group-hover:text-white transition-all">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black tracking-widest text-navy uppercase">
                Panel Validator (Reviewer)
              </span>
            </button>
          </div>

          <p className="text-blue-gray mt-12 text-center text-sm font-medium">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="font-bold text-teal hover:underline tracking-tight"
            >
              DAFTAR DISINI
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
