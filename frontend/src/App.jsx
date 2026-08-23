import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getToken } from './api/client.js';
import { UIProvider } from './context/UIContext.jsx';

const Landing = lazy(() => import('./pages/Landing.jsx'));
const Terms = lazy(() => import('./pages/Terms.jsx'));
const Privacy = lazy(() => import('./pages/Privacy.jsx'));
const Guide = lazy(() => import('./pages/Guide.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Signup = lazy(() => import('./pages/Signup.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const SandboxDashboard = lazy(() => import('./pages/SandboxDashboard.jsx'));
const PublicInvitation = lazy(() => import('./pages/PublicInvitation.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));

function ProtectedRoute({ children }) {
    const token = getToken();
    return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <UIProvider>
            <BrowserRouter>
                <Suspense fallback={<div className="loading-screen">Memuat...</div>}>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/guide" element={<Guide />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/sandbox" element={<SandboxDashboard />} />
                    <Route path="/:slug" element={<PublicInvitation />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
            </BrowserRouter>
        </UIProvider>
    );
}
