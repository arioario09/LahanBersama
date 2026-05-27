/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import LandingPage from "./pages/LandingPage";
import RegisterPage from "./pages/RegisterPage";
import VerificationPage from "./pages/VerificationPage";
import Layout from "./components/layout/Layout";

// Petani Pages
import LandHistory from "./pages/petani/LandHistory";
import FarmerPortfolio from "./pages/petani/FarmerPortfolio";
import BukaLapak from "./pages/petani/BukaLapak";
import ProfileEditor from "./pages/petani/ProfileEditor";
import ProgressUpdate from "./pages/petani/ProgressUpdate";

// Investor Pages
import Marketplace from "./pages/investor/Marketplace";
import LandDetail from "./pages/investor/LandDetail";
import InvestorPortfolio from "./pages/investor/InvestorPortfolio";
import Favorites from "./pages/investor/Favorites";
import PaymentFlow from "./pages/investor/PaymentFlow";
import WalletPage from "./pages/WalletPage";
import ChatList from "./pages/chat/ChatList";
import ChatRoom from "./pages/chat/ChatRoom";
import ValidatorDashboard from "./pages/validator/ValidatorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotificationListener from "./components/NotificationListener";
import PWAInstallPrompt from "./components/common/PWAInstallPrompt";

function HomeRedirect() {
  const { profile } = useAuth();
  if (profile?.role === "admin") return <Navigate to="/admin" replace />;
  if (profile?.role === "validator")
    return <Navigate to="/validator" replace />;
  if (profile?.role === "petani") return <LandHistory />;
  return <Marketplace />;
}

function PortoRedirect() {
  const { profile } = useAuth();
  if (profile?.role === "admin") return <Navigate to="/admin" replace />;
  if (profile?.role === "validator")
    return <Navigate to="/validator" replace />;
  if (profile?.role === "petani") return <FarmerPortfolio />;
  return <InvestorPortfolio />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationListener />
        <PWAInstallPrompt />
        <Routes>
          {/* Public Routes */}
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/verify-ktp" element={<VerificationPage />} />
            <Route element={<Layout />}>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/buka-lapak" element={<BukaLapak />} />
              <Route path="/porto" element={<PortoRedirect />} />
              <Route path="/investments" element={<InvestorPortfolio />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<ProfileEditor />} />
              <Route
                path="/update-progress/:projectId"
                element={<ProgressUpdate />}
              />
              <Route path="/land/:projectId" element={<LandDetail />} />
              <Route path="/invest/:projectId" element={<PaymentFlow />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/chat" element={<ChatList />} />
              <Route path="/chat/:chatId" element={<ChatRoom />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["validator"]} />}>
            <Route path="/validator" element={<ValidatorDashboard />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
