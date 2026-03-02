import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@context/AuthContext";
import { GameProvider } from "@context/GameContext";
import Navbar from "@components/common/Navbar";
import ProtectedRoute from "@components/common/ProtectedRoute";

// Public Pages
import LandingPage from "@pages/LandingPage";
import LoginPage from "@pages/LoginPage";
import RegisterPage from "@pages/RegisterPage";
import GameSetupPage from "@pages/GameSetupPage";
import GamePlayPage from "@pages/GamePlayPage";
import ChildPlayPage from "@pages/ChildPlayPage";

// Protected Pages
import ParentDashboardPage from "@pages/ParentDashboardPage";
import AchievementsPage from "@pages/AchievementsPage";
import SubscriptionPage from "@pages/SubscriptionPage";

// Admin Pages
import AdminPage from "@pages/AdminPage";

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/setup" element={<GameSetupPage />} />
            <Route path="/play" element={<GamePlayPage />} />
            <Route path="/play/:gameId" element={<GamePlayPage />} />
            <Route path="/child-play/:token" element={<ChildPlayPage />} />

            {/* Protected - requires login */}
            <Route path="/dashboard" element={<ProtectedRoute><ParentDashboardPage /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
            <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />

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
