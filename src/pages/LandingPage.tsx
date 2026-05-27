import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Coins,
  ShieldCheck,
  Wallet,
  Search,
  Smartphone,
  TrendingUp,
  ChevronRight,
  Star,
  Quote,
  ArrowRight,
  Menu,
  X,
  Leaf,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  ArrowUpRight
} from "lucide-react";
import Logo from "../components/common/Logo";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Animation variants for unified graceful animations
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" as const }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardHover = {
    hover: {
      y: -8,
      boxShadow: "0 20px 25px -5px rgba(18, 43, 79, 0.1), 0 10px 10px -5px rgba(18, 43, 79, 0.04)",
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-white text-navy font-sans selection:bg-mint/30 selection:text-navy overflow-x-hidden">
      
      {/* 1. STICKY NAVBAR WITH GLASSMORPHISM */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-light-gray/40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo & Brand Name */}
          <Link to="/landing" className="flex items-center gap-3 group">
            <Logo className="w-10 h-10 group-hover:scale-105 transition-transform" iconSize="h-5 w-5" />
            <span className="text-xl md:text-2xl font-bold tracking-tight text-navy group-hover:text-teal transition-colors">
              Lahan<span className="text-teal">Bersama</span>
            </span>
          </Link>

          {/* Desktop Navigation Action Buttons */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/login"
              className="text-navy hover:text-teal font-semibold text-base transition-colors py-2 px-4"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              className="btn-mint py-3 px-6 text-base shadow-lg shadow-mint/20 hover:shadow-mint/40 hover:-translate-y-0.5"
            >
              Daftar
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-navy hover:text-teal transition-colors focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-b border-light-gray px-6 py-8 flex flex-col gap-4 shadow-xl"
          >
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-navy hover:text-teal font-semibold text-lg py-3 px-4 rounded-xl hover:bg-bg-gray transition-colors text-center"
            >
              Masuk
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-mint text-center py-4 px-6 text-lg shadow-lg shadow-mint/20"
            >
              Daftar
            </Link>
          </motion.div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:py-32 overflow-hidden bg-gradient-to-b from-bg-gray/50 to-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Hero Left Content */}
          <motion.div 
            className="lg:col-span-7 flex flex-col gap-6 md:gap-8"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <div className="inline-flex items-center gap-2 bg-teal/10 border border-teal/20 text-teal py-2 px-4 rounded-full w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal"></span>
              </span>
              <span className="text-xs md:text-sm font-semibold tracking-wide uppercase">
                Platform Tani & Investasi PWA No. 1
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-navy leading-[1.1] tracking-tight">
              Hubungkan Petani Hebat <br className="hidden md:inline" />
              dengan <span className="text-teal relative">
                Investor Cerdas
                <span className="absolute bottom-1 left-0 w-full h-[6px] bg-mint/50 -z-10 rounded-full"></span>
              </span>.
            </h1>

            <p className="text-navy/80 text-base md:text-lg lg:text-xl font-normal leading-relaxed max-w-2xl">
              Platform terpercaya untuk mendanai petak lahan produktif. Pantau progres dari HP Anda, nikmati hasil panen transparan, dan majukan ketahanan pangan bersama.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                to="/register"
                className="btn-mint py-4 px-8 text-base md:text-lg flex items-center justify-center gap-2 shadow-xl shadow-mint/30 hover:shadow-mint/50 hover:-translate-y-1 transition-all"
              >
                Mulai Investasi
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/register"
                className="border-2 border-navy text-navy hover:bg-navy hover:text-white font-bold rounded-xl py-4 px-8 text-base md:text-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-1"
              >
                Buka Lahan
                <ArrowUpRight size={18} />
              </Link>
            </div>

            {/* Quick Micro-stats for Credibility */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-light-gray/60 max-w-xl">
              <div>
                <p className="text-2xl md:text-3xl font-black text-navy">15.2k+</p>
                <p className="text-xs md:text-sm text-blue-gray font-semibold uppercase tracking-wider">Investor Aktif</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-black text-teal">240+</p>
                <p className="text-xs md:text-sm text-blue-gray font-semibold uppercase tracking-wider">Hektar Lahan</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-black text-navy">100%</p>
                <p className="text-xs md:text-sm text-blue-gray font-semibold uppercase tracking-wider">Lahan Terverifikasi</p>
              </div>
            </div>
          </motion.div>

          {/* Hero Right: Premium CSS Simulated PWA Phone Mockup */}
          <motion.div 
            className="lg:col-span-5 flex justify-center lg:justify-end relative"
            initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Soft background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 md:w-96 md:h-96 bg-teal/20 rounded-full filter blur-[80px] -z-10 animate-pulse"></div>

            {/* Smartphone Case */}
            <div className="relative w-[300px] h-[600px] bg-navy border-[8px] border-navy/95 rounded-[45px] shadow-[0_25px_60px_-15px_rgba(18,43,79,0.4)] overflow-hidden flex flex-col">
              
              {/* Camera Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-navy rounded-b-2xl z-40 flex items-center justify-between px-6">
                <div className="w-3.5 h-3.5 bg-navy border-[3px] border-zinc-800 rounded-full"></div>
                <div className="w-10 h-1 bg-zinc-800 rounded-full"></div>
              </div>

              {/* Status Bar */}
              <div className="h-8 bg-navy flex items-end justify-between px-6 pb-1 text-[10px] text-white/60 font-semibold z-30 select-none">
                <span>09:41</span>
                <div className="flex items-center gap-1.5">
                  <span>5G</span>
                  <div className="w-5 h-2.5 border border-white/40 rounded-sm p-0.5 flex">
                    <div className="w-3 bg-mint rounded-[1px]"></div>
                  </div>
                </div>
              </div>

              {/* PWA App Body Container */}
              <div className="flex-1 bg-bg-gray overflow-y-auto flex flex-col p-4 gap-4 no-scrollbar">
                
                {/* PWA App Header */}
                <div className="flex items-center justify-between border-b border-light-gray/60 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-mint rounded-lg flex items-center justify-center shadow-md">
                      <Leaf size={14} className="text-white fill-white/20" />
                    </div>
                    <span className="text-xs font-black tracking-tight text-navy">LahanBersama</span>
                  </div>
                  {/* Status Tag */}
                  <span className="text-[10px] bg-teal/10 text-teal py-0.5 px-2 rounded-full font-bold">
                    PWA Terpasang
                  </span>
                </div>

                {/* Simulated Wallet Widget */}
                <div className="bg-white border border-light-gray rounded-2xl p-3 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-teal/10 rounded-xl flex items-center justify-center text-teal">
                      <Wallet size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] text-blue-gray font-semibold tracking-wide uppercase">Saldo Dompet</p>
                      <p className="text-sm font-black text-navy">Rp 2.450.000</p>
                    </div>
                  </div>
                  <button className="text-[10px] bg-mint text-navy font-bold py-1.5 px-3 rounded-lg shadow-sm hover:opacity-90 active:scale-95 transition-all">
                    Tarik Dana
                  </button>
                </div>

                {/* Investment Status Title */}
                <div className="flex items-center justify-between mt-1">
                  <h4 className="text-xs font-black text-navy uppercase tracking-wider">Investasi Saya</h4>
                  <span className="text-[10px] text-teal font-bold flex items-center gap-0.5">
                    1 Aktif <ChevronRight size={10} />
                  </span>
                </div>

                {/* Interactive Simulated Crop Card */}
                <div className="bg-white border border-light-gray rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  {/* Styled Agricultural Background Gradient */}
                  <div className="h-28 bg-gradient-to-br from-teal/30 via-emerald-600/40 to-teal/80 relative flex items-end p-3">
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-[9px] text-teal font-bold py-0.5 px-2 rounded-full border border-teal/10 shadow-sm flex items-center gap-1">
                      <CheckCircle size={10} className="text-teal fill-teal/20" /> Terverifikasi
                    </div>
                    <div className="z-10">
                      <span className="bg-navy text-white text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide">
                        PROYEK A1
                      </span>
                      <h5 className="text-sm font-extrabold text-white drop-shadow-sm mt-0.5">Kebun Tomat, Bandung</h5>
                    </div>
                    {/* Visual Crop overlay effect */}
                    <div className="absolute bottom-0 right-0 w-24 h-20 opacity-30 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-mint via-teal to-transparent rounded-tl-full"></div>
                  </div>

                  {/* Crop Card Details */}
                  <div className="p-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-blue-gray font-semibold">Progres Budidaya</span>
                      <span className="text-navy font-bold">Minggu 6 - Berbunga (65%)</span>
                    </div>
                    {/* Animated Progress Bar */}
                    <div className="w-full bg-bg-gray h-2 rounded-full overflow-hidden">
                      <div className="bg-mint h-full rounded-full" style={{ width: "65%" }}></div>
                    </div>

                    <div className="border-t border-light-gray/40 pt-2.5 flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-teal rounded-full animate-ping"></span>
                        <span className="text-[10px] text-teal font-bold uppercase tracking-wider">Laporan Mingguan</span>
                      </div>
                      <span className="text-[9px] text-blue-gray font-semibold">Hari ini, 08:30 WIB</span>
                    </div>

                    {/* Weekly Image Thumbnail */}
                    <div className="flex gap-2 items-center bg-bg-gray/50 border border-light-gray/40 p-2 rounded-xl">
                      <div className="w-10 h-10 bg-gradient-to-tr from-teal/40 to-mint/40 rounded-lg flex items-center justify-center text-teal">
                        <Leaf size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-navy">Kondisi tanaman sehat</p>
                        <p className="text-[9px] text-blue-gray">Foto kebun diupload oleh Pak Yanto</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Navigator Frame */}
                <div className="mt-auto border-t border-light-gray/60 pt-3 flex justify-around text-blue-gray select-none">
                  <div className="flex flex-col items-center gap-0.5 text-teal">
                    <Leaf size={16} />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Lahan</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 hover:text-navy transition-colors">
                    <Coins size={16} />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Investasi</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5 hover:text-navy transition-colors">
                    <Wallet size={16} />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Dompet</span>
                  </div>
                </div>

              </div>

              {/* iOS Home Indicator */}
              <div className="h-5 bg-navy flex items-center justify-center select-none pb-1 z-30">
                <div className="w-28 h-1 bg-white/40 rounded-full"></div>
              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* 3. SECTION: KENAPA MEMILIH LAHANBERSAMA? */}
      <section className="py-20 md:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 flex flex-col gap-4">
            <span className="text-teal text-sm md:text-base font-black tracking-widest uppercase">
              Keunggulan Kami
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-navy tracking-tight">
              Kenapa Memilih LahanBersama?
            </h2>
            <div className="h-1.5 w-16 bg-mint rounded-full mx-auto mt-1"></div>
          </div>

          {/* Cards Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            
            {/* Card 1: Modal Terjangkau */}
            <motion.div 
              variants={fadeInUp}
              whileHover="hover"
              custom={0}
              className="bg-white border border-light-gray rounded-3xl p-8 flex flex-col gap-6 transition-all shadow-sm hover:border-mint"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="w-16 h-16 bg-mint/10 text-mint rounded-2xl flex items-center justify-center shadow-lg shadow-mint/5">
                <Coins size={32} />
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-xl md:text-2xl font-black text-navy">Modal Terjangkau</h3>
                <p className="text-navy/70 text-base md:text-lg font-normal leading-relaxed">
                  Beli per petak, tidak perlu sewa 1 hektar penuh.
                </p>
              </div>
            </motion.div>

            {/* Card 2: Transparan & Aman */}
            <motion.div 
              variants={fadeInUp}
              whileHover="hover"
              custom={1}
              className="bg-white border border-light-gray rounded-3xl p-8 flex flex-col gap-6 transition-all shadow-sm hover:border-teal"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="w-16 h-16 bg-teal/10 text-teal rounded-2xl flex items-center justify-center shadow-lg shadow-teal/5">
                <ShieldCheck size={32} />
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-xl md:text-2xl font-black text-navy">Transparan & Aman</h3>
                <p className="text-navy/70 text-base md:text-lg font-normal leading-relaxed">
                  Progres diupdate mingguan langsung dari kebun dengan bukti foto.
                </p>
              </div>
            </motion.div>

            {/* Card 3: Bagi Hasil Jelas */}
            <motion.div 
              variants={fadeInUp}
              whileHover="hover"
              custom={2}
              className="bg-white border border-light-gray rounded-3xl p-8 flex flex-col gap-6 transition-all shadow-sm hover:border-mint"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="w-16 h-16 bg-mint/10 text-mint rounded-2xl flex items-center justify-center shadow-lg shadow-mint/5">
                <Wallet size={32} />
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-xl md:text-2xl font-black text-navy">Bagi Hasil Jelas</h3>
                <p className="text-navy/70 text-base md:text-lg font-normal leading-relaxed">
                  Sistem dompet digital untuk penarikan dana langsung ke rekening Anda.
                </p>
              </div>
            </motion.div>

          </motion.div>

        </div>
      </section>

      {/* 4. SECTION CARA KERJA (LANGKAH SIMPEL) */}
      <section className="py-20 md:py-32 bg-bg-gray/40 border-y border-light-gray/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 flex flex-col gap-4">
            <span className="text-teal text-sm md:text-base font-black tracking-widest uppercase">
              Panduan Pemula
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-navy tracking-tight">
              Cara Kerja
            </h2>
            <div className="h-1.5 w-16 bg-mint rounded-full mx-auto mt-1"></div>
          </div>

          {/* Stepper Pipeline */}
          <div className="relative">
            {/* Connector Line (Desktop Only) */}
            <div className="hidden md:block absolute top-[52px] left-[15%] right-[15%] h-1 bg-gradient-to-r from-mint via-teal to-mint rounded-full z-0"></div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative z-10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              
              {/* Langkah 1 */}
              <motion.div variants={fadeInUp} className="flex flex-col items-center text-center px-4 group">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-mint/20 text-mint flex items-center justify-center text-3xl font-black shadow-lg shadow-mint/10 mb-6 group-hover:scale-110 group-hover:border-mint transition-all duration-300">
                  <Search size={36} />
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-xs text-teal font-extrabold uppercase tracking-widest">Langkah 01</span>
                  <h3 className="text-xl md:text-2xl font-black text-navy">Pilih Lahan & Petak</h3>
                  <p className="text-navy/70 text-base md:text-lg font-normal max-w-sm">
                    Telusuri kebun produktif yang telah divalidasi ketat oleh tim pengawas kami, lalu beli petak sesuai keinginan Anda.
                  </p>
                </div>
              </motion.div>

              {/* Langkah 2 */}
              <motion.div variants={fadeInUp} className="flex flex-col items-center text-center px-4 group">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-teal/20 text-teal flex items-center justify-center text-3xl font-black shadow-lg shadow-teal/10 mb-6 group-hover:scale-110 group-hover:border-teal transition-all duration-300">
                  <Smartphone size={36} />
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-xs text-teal font-extrabold uppercase tracking-widest">Langkah 02</span>
                  <h3 className="text-xl md:text-2xl font-black text-navy">Pantau Progres Mingguan</h3>
                  <p className="text-navy/70 text-base md:text-lg font-normal max-w-sm">
                    Ikuti perkembangan lahan dari HP Anda. Petani mengunggah foto lapangan dan laporan berkala secara transparan.
                  </p>
                </div>
              </motion.div>

              {/* Langkah 3 */}
              <motion.div variants={fadeInUp} className="flex flex-col items-center text-center px-4 group">
                <div className="w-24 h-24 rounded-full bg-white border-4 border-mint/20 text-mint flex items-center justify-center text-3xl font-black shadow-lg shadow-mint/10 mb-6 group-hover:scale-110 group-hover:border-mint transition-all duration-300">
                  <TrendingUp size={36} />
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-xs text-teal font-extrabold uppercase tracking-widest">Langkah 03</span>
                  <h3 className="text-xl md:text-2xl font-black text-navy">Nikmati Keuntungan Panen</h3>
                  <p className="text-navy/70 text-base md:text-lg font-normal max-w-sm">
                    Hasil panen disalurkan ke pembeli terpercaya. Keuntungan ditransfer langsung ke saldo dompet digital Anda.
                  </p>
                </div>
              </motion.div>

            </motion.div>
          </div>

        </div>
      </section>

      {/* 5. SECTION TESTIMONI PENGGUNA */}
      <section className="py-20 md:py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 flex flex-col gap-4">
            <span className="text-teal text-sm md:text-base font-black tracking-widest uppercase">
              Bukti Nyata
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-navy tracking-tight">
              Testimoni Pengguna
            </h2>
            <div className="h-1.5 w-16 bg-mint rounded-full mx-auto mt-1"></div>
          </div>

          {/* Testimonials Grid (2 Cards) */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            
            {/* Investor Testimonial */}
            <motion.div 
              variants={fadeInUp}
              whileHover="hover"
              className="bg-bg-gray/40 border border-light-gray rounded-[32px] p-8 md:p-10 flex flex-col gap-6 relative"
            >
              <div className="absolute top-8 right-8 text-teal/20">
                <Quote size={56} className="fill-current" />
              </div>

              <div className="flex gap-1 text-mint">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-current" />
                ))}
              </div>

              <blockquote className="text-navy text-lg md:text-xl font-medium leading-relaxed italic z-10 flex-1">
                "Awalnya ragu, tapi fitur update mingguan bikin tenang. Panen tomat bulan lalu cuannya lumayan!"
              </blockquote>

              <div className="flex items-center gap-4 pt-4 border-t border-light-gray/60">
                <div className="w-12 h-12 rounded-full bg-teal text-white font-extrabold flex items-center justify-center shadow-md">
                  B
                </div>
                <div>
                  <cite className="not-italic text-lg font-black text-navy">Budi</cite>
                  <p className="text-sm text-blue-gray font-semibold">45 Tahun, Investor</p>
                </div>
              </div>
            </motion.div>

            {/* Petani Testimonial */}
            <motion.div 
              variants={fadeInUp}
              whileHover="hover"
              className="bg-bg-gray/40 border border-light-gray rounded-[32px] p-8 md:p-10 flex flex-col gap-6 relative"
            >
              <div className="absolute top-8 right-8 text-teal/20">
                <Quote size={56} className="fill-current" />
              </div>

              <div className="flex gap-1 text-mint">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-current" />
                ))}
              </div>

              <blockquote className="text-navy text-lg md:text-xl font-medium leading-relaxed italic z-10 flex-1">
                "Sangat terbantu. Dulu susah cari modal beli bibit, sekarang modal cair di awal, saya tinggal fokus rawat tanaman."
              </blockquote>

              <div className="flex items-center gap-4 pt-4 border-t border-light-gray/60">
                <div className="w-12 h-12 rounded-full bg-mint text-navy font-extrabold flex items-center justify-center shadow-md">
                  PY
                </div>
                <div>
                  <cite className="not-italic text-lg font-black text-navy">Pak Yanto</cite>
                  <p className="text-sm text-blue-gray font-semibold">50 Tahun, Petani</p>
                </div>
              </div>
            </motion.div>

          </motion.div>

        </div>
      </section>

      {/* CALL TO ACTION BOTTOM BANNER */}
      <section className="py-20 md:py-28 bg-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-teal/20 via-transparent to-transparent opacity-60"></div>
        
        <div className="max-w-5xl mx-auto px-6 text-center flex flex-col gap-6 md:gap-8 relative z-10">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-[1.2]">
            Siap Majukan Pertanian Nasional Bersama Kami?
          </h2>
          <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto">
            Bergabunglah dengan belasan ribu investor lainnya di LahanBersama dan wujudkan kemandirian pangan Indonesia sekarang juga.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="btn-mint w-full sm:w-auto py-4 px-8 text-base md:text-lg shadow-xl shadow-mint/20 flex items-center justify-center gap-2 hover:scale-[1.02] hover:-translate-y-0.5"
            >
              Mulai Investasi Sekarang
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-navy text-white/70 border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Logo & Intro */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Logo className="w-10 h-10" iconSize="h-5 w-5" />
              <span className="text-xl font-bold tracking-tight text-white">
                Lahan<span className="text-teal">Bersama</span>
              </span>
            </div>
            <p className="text-sm font-normal leading-relaxed text-white/60">
              Menghubungkan petani hebat dengan investor cerdas secara transparan, aman, dan berkelanjutan untuk mewujudkan kedaulatan pangan Indonesia.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-black uppercase text-white tracking-widest">Bantuan & Informasi</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <a href="#cara-kerja" className="hover:text-mint transition-colors flex items-center gap-1.5">
                  Pusat Bantuan <HelpCircle size={14} />
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-mint transition-colors">
                  Pertanyaan Sering Diajukan (FAQ)
                </a>
              </li>
              <li>
                <a href="#kontak" className="hover:text-mint transition-colors">
                  Hubungi Layanan Konsumen
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-black uppercase text-white tracking-widest">Kebijakan Hukum</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link to="/syarat-ketentuan" className="hover:text-mint transition-colors">
                  Syarat & Ketentuan Penggunaan
                </Link>
              </li>
              <li>
                <Link to="/kebijakan-privasi" className="hover:text-mint transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link to="/mitigasi-risiko" className="hover:text-mint transition-colors">
                  Mitigasi Risiko Investasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust badges */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-black uppercase text-white tracking-widest">Didukung Oleh</h4>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 flex items-center gap-2">
                <ShieldCheck size={16} className="text-mint" />
                <span className="text-[11px] font-bold text-white tracking-wide uppercase">Otoritas Valid</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 flex items-center gap-2">
                <CheckCircle size={16} className="text-teal" />
                <span className="text-[11px] font-bold text-white tracking-wide uppercase">PWA Penuh</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-6 border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p className="font-normal text-white/50 text-center md:text-left">
            &copy; 2026 LahanBersama. Seluruh hak cipta dilindungi undang-undang.
          </p>
          <div className="flex gap-6 text-white/50">
            <Link to="/syarat-ketentuan" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
            <Link to="/kebijakan-privasi" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
