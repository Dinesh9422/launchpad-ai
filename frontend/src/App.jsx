import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import ResumeEditor from './pages/ResumeEditor';
import JobSearch from './pages/JobSearch';
import ApplicationTracker from './pages/ApplicationTracker';
import SkillGap from './pages/skillgap';
import MockInterview from './pages/MockInterview';
import InsightsDashboard from './pages/InsightsDashboard';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" />;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
      <Route path="/onboarding" element={
        <ProtectedRoute><Onboarding /></ProtectedRoute>
      } />
      <Route path="/resume" element={
        <ProtectedRoute><ResumeEditor /></ProtectedRoute>
      } />
      <Route path="/jobs" element={
        <ProtectedRoute><JobSearch /></ProtectedRoute>
      } />
      <Route path="/tracker" element={
        <ProtectedRoute><ApplicationTracker /></ProtectedRoute>
      } />
      <Route path="/skillgap" element={
        <ProtectedRoute><SkillGap /></ProtectedRoute>
      } />
      <Route path="/interview" element={
        <ProtectedRoute><MockInterview /></ProtectedRoute>
      } />
      <Route path="/insights" element={
        <ProtectedRoute><InsightsDashboard /></ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/register" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{
            duration: 3000,
            style: { background: '#363636', color: '#fff', fontSize: '14px' },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }} />
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}