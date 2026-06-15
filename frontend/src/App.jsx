import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import ResumeEditor from './pages/ResumeEditor';
import JobSearch from './pages/JobSearch';
import ApplicationTracker from './pages/ApplicationTracker';
import SkillGap from './pages/SkillGap';
import MockInterview from './pages/MockInterview';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
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
      <Route path="/" element={<Navigate to="/register" />} />
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
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}