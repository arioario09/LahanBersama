import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useAuth, UserRole } from "../contexts/AuthContext";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  UserCheck,
  AlertCircle,
  ChevronRight,
  Sprout,
  TrendingUp,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Logo from "../components/common/Logo";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole | "">("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const isGoogleRegister =
    new URLSearchParams(location.search).get("provider") === "google";

  useEffect(() => {
    if (isGoogleRegister && user) {
      if (user.displayName) setName(user.displayName);
      if (user.email) setEmail(user.email);
    }
  }, [isGoogleRegister, user]);

  useEffect(() => {
    if (isGoogleRegister && user && profile) {
      navigate("/");
    }
  }, [isGoogleRegister, user, profile, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError("Silakan pilih peran Anda terlebih dahulu.");
      return;
    }

    if (isGoogleRegister && !user) {
      setError("");
      setLoading(true);
      try {
        await signInWithPopup(auth, new GoogleAuthProvider());
      } catch (err: any) {
        console.error("Google sign-in (register) error:", err);
        if (err.code === "auth/account-exists-with-different-credential") {
          setError(
            "Akun Google sudah terdaftar dengan metode lain. Silakan login dengan email/password.",
          );
        } else if (
          err.code === "auth/popup-blocked" ||
          err.code === "auth/popup-closed-by-user"
        ) {
          setError(
            "Popup Google diblokir atau ditutup — izinkan popup lalu coba lagi.",
          );
        } else {
          setError(`Gagal masuk dengan Google: ${err.message || err.code}`);
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    setError("");
    setLoading(true);

    try {
      let uid = "";
      if (isGoogleRegister) {
        uid = user!.uid;
      } else {
        const result = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        uid = result.user.uid;
      }

      await setDoc(doc(db, "users", uid), {
        name,
        email,
        role,
        status: "active",
        createdAt: serverTimestamp(),
        verificationStatus: "unverified",
        ktpPhotoUrl: "",
        nik: "",
        bio: "",
        balance: 0,
        rejectionReason: "",
      });

      navigate("/verify-ktp");
    } catch (err: any) {
      if (!isGoogleRegister && err.code === "auth/email-already-in-use") {
        setError("Email sudah terdaftar.");
      } else if (!isGoogleRegister && err.code === "auth/weak-password") {
        setError("Kata sandi minimal 6 karakter.");
      } else {
        setError("Terjadi kesalahan saat pendaftaran.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError("");
    setLoading(true);

    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      navigate("/register?provider=google");
    } catch (err: any) {
      console.error("Google register popup error:", err);
      if (err.code === "auth/account-exists-with-different-credential") {
        setError(
          "Akun Google sudah terdaftar dengan metode lain. Silakan login dengan email/password.",
        );
      } else if (
        err.code === "auth/popup-blocked" ||
        err.code === "auth/popup-closed-by-user"
      ) {
        setError(
          "Popup Google diblokir atau ditutup — izinkan popup lalu coba lagi.",
        );
      } else {
        setError(`Gagal masuk dengan Google: ${err.message || err.code}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    {
      id: "petani",
      title: "Petani",
      desc: "Kelola lahan dan dapatkan modal kerja",
      icon: <Sprout className="h-6 w-6" />,
    },
    {
      id: "investor",
      title: "Investor",
      desc: "Bantu petani lokal dan dapatkan bagi hasil",
      icon: <TrendingUp className="h-6 w-6" />,
    },
  ];

  return (
    <div className="flex bg-bg-gray min-h-screen px-4 items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white p-8 sm:p-10 shadow-xl border border-light-gray rounded-3xl">
          <div className="flex flex-col mb-10 items-center text-center">
            <Logo className="w-20 h-20 mb-6" iconSize="h-10 w-10" />
            <h1 className="font-bold text-navy text-3xl tracking-tight">
              Daftar Akun
            </h1>
            <p className="text-blue-gray mt-2 text-base font-medium">
              {step === 1
                ? "Pilih peran Anda di platform"
                : "Lengkapi data pendaftaran Anda"}
            </p>
          </div>

          {error && (
            <div className="flex bg-red-50 mb-8 p-4 rounded-xl gap-3 items-center text-red-600 border border-red-100">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-xs font-bold leading-none">
                {error.toUpperCase()}
              </p>
            </div>
          )}

          {!isGoogleRegister && (
            <div className="mb-8 space-y-4">
              <button
                type="button"
                onClick={handleGoogleRegister}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-3 rounded-2xl border border-light-gray bg-white py-4 text-sm font-bold text-navy shadow-sm transition-all hover:bg-gray-100"
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="h-5 w-5"
                />
                DAFTAR DENGAN GOOGLE
              </button>
              <div className="relative h-0.5">
                <div className="absolute inset-x-0 top-1/2 h-px bg-light-gray"></div>
                <div className="relative mx-auto w-fit bg-white px-4 text-[10px] uppercase tracking-widest text-blue-gray">
                  Atau daftar manual
                </div>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRole(r.id as UserRole);
                      setStep(2);
                    }}
                    className={`flex items-center w-full p-5 text-left border rounded-2xl transition-all group ${
                      role === r.id
                        ? "border-teal bg-teal/3 ring-1 ring-teal"
                        : "border-light-gray hover:border-teal/50 bg-gray-50/50"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-xl mr-4 transition-colors ${
                        role === r.id
                          ? "bg-teal text-white"
                          : "bg-white text-navy border border-light-gray"
                      }`}
                    >
                      {r.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-navy text-lg">{r.title}</h3>
                      <p className="text-blue-gray text-xs font-medium leading-snug">
                        {r.desc}
                      </p>
                    </div>
                    <ChevronRight
                      className={`h-5 w-5 text-blue-gray transition-transform ${role === r.id ? "translate-x-1 text-teal" : ""}`}
                    />
                  </button>
                ))}
              </motion.div>
            ) : (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleRegister}
                className="space-y-6"
              >
                {isGoogleRegister && user && (
                  <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 text-sm text-yellow-700">
                    Anda masuk dengan Google sebagai{" "}
                    <span className="font-bold">{user.email}</span>. Lengkapi
                    peran dan data akun untuk menyelesaikan pendaftaran.
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-navy tracking-[0.2em] uppercase ml-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-minimal"
                    placeholder="Contoh: John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-navy tracking-[0.2em] uppercase ml-1">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    required
                    disabled={isGoogleRegister}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-minimal"
                    placeholder="name@example.com"
                  />
                </div>

                {!isGoogleRegister && (
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
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-4 text-sm font-bold text-navy hover:text-teal transition-colors"
                  >
                    KEMBALI
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-mint text-white flex-1 py-5 text-lg shadow-mint/30"
                  >
                    {loading ? "MENDAFTAR..." : "DAFTAR SEKARANG"}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="text-blue-gray mt-12 text-center text-sm font-medium">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="font-bold text-teal hover:underline tracking-tight"
            >
              MASUK DISINI
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
