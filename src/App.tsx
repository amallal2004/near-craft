import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, OnboardingGuard } from "@/components/auth/RouteGuards";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import CallbackPage from "./pages/CallbackPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";
import JobsPage from "./pages/JobsPage";
import CreateJobPage from "./pages/CreateJobPage";
import JobDetailPage from "./pages/JobDetailPage";
import ChatPage from "./pages/ChatPage";
import MessagesPage from "./pages/MessagesPage";
import ApplicationsPage from "./pages/ApplicationsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ReviewsPage from "./pages/ReviewsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/callback" element={<CallbackPage />} />
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<OnboardingGuard><DashboardPage /></OnboardingGuard>} />
            <Route path="/jobs" element={<OnboardingGuard><JobsPage /></OnboardingGuard>} />
            <Route path="/jobs/new" element={<OnboardingGuard><CreateJobPage /></OnboardingGuard>} />
            <Route path="/jobs/:id" element={<OnboardingGuard><JobDetailPage /></OnboardingGuard>} />
            <Route path="/jobs/:id/chat" element={<OnboardingGuard><ChatPage /></OnboardingGuard>} />
            <Route path="/messages" element={<OnboardingGuard><MessagesPage /></OnboardingGuard>} />
            <Route path="/applications" element={<OnboardingGuard><ApplicationsPage /></OnboardingGuard>} />
            <Route path="/notifications" element={<OnboardingGuard><NotificationsPage /></OnboardingGuard>} />
            <Route path="/reviews" element={<OnboardingGuard><ReviewsPage /></OnboardingGuard>} />
            <Route path="/profile" element={<OnboardingGuard><ProfilePage /></OnboardingGuard>} />
            <Route path="/settings" element={<OnboardingGuard><SettingsPage /></OnboardingGuard>} />
            <Route path="/admin" element={<OnboardingGuard><AdminPage /></OnboardingGuard>} />
            <Route path="/payment-success" element={<OnboardingGuard><PaymentSuccessPage /></OnboardingGuard>} />
            <Route path="/payment-cancel" element={<OnboardingGuard><PaymentCancelPage /></OnboardingGuard>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
