import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@context/AuthContext";
import { GameProvider } from "@context/GameContext";
import Navbar from "@components/common/Navbar";
import FloatingWhatsApp from "@components/common/FloatingWhatsApp";
import ProtectedRoute from "@components/common/ProtectedRoute";

// Public Pages
import LandingPage from "@pages/LandingPage";
import LoginPage from "@pages/LoginPage";
import RegisterPage from "@pages/RegisterPage";
import GameSetupPage from "@pages/GameSetupPage";
import GamePlayPage from "@pages/GamePlayPage";
import BridgeGamePage from "@pages/BridgeGamePage";
import ForgivenessGamePage from "@pages/ForgivenessGamePage";
import ChildPlayPage from "@pages/ChildPlayPage";
import OrderFormPage from "@pages/OrderFormPage";
import FAQPage from "@pages/FAQPage";

// Protected Pages
// import ParentDashboardPage from "@pages/ParentDashboardPage"; // مخفية مؤقتاً
import AchievementsPage from "@pages/AchievementsPage";
// import SubscriptionPage from "@pages/SubscriptionPage"; // replaced by OrderFormPage

// Admin Pages
import AdminPage from "@pages/AdminPage";

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <BrowserRouter>
          <Navbar />
          <FloatingWhatsApp />
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/setup" element={<GameSetupPage />} />
            <Route path="/play" element={<GamePlayPage />} />
            <Route path="/play/:gameId" element={<GamePlayPage />} />
            <Route path="/child-play/:token" element={<ChildPlayPage />} />
            <Route path="/bridge-game" element={<BridgeGamePage />} />
            <Route path="/forgiveness-game" element={<ForgivenessGamePage />} />
            <Route path="/order" element={<OrderFormPage />} />
            <Route path="/faq" element={<FAQPage />} />

            {/* Protected - requires login */}
            {/* لوحة التحكم مخفية مؤقتاً */}
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
            <Route path="/subscription" element={<Navigate to="/order" replace />} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </AuthProvider>
  );
}
