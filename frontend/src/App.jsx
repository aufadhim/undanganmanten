import LoadingScreen from './components/atelier/LoadingScreen.jsx';
import { Component, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getToken } from './api/client.js';
import CanvasRouteFrame from './components/atelier/CanvasRouteFrame.jsx';
import { UIProvider } from './context/UIContext.jsx';

const PlannerShared = lazy(() => import('./pages/PlannerShared.jsx'));
const PlannerPage = lazy(() => import('./pages/PlannerPage.jsx'));
const GuestDesk = lazy(() => import('./pages/GuestDesk.jsx'));
const Landing = lazy(() => import('./pages/Landing.jsx'));
const Terms = lazy(() => import('./pages/Terms.jsx'));
const Privacy = lazy(() => import('./pages/Privacy.jsx'));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const Guide = lazy(() => import('./pages/Guide.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Signup = lazy(() => import('./pages/Signup.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const SandboxDashboard = lazy(() => import('./pages/SandboxDashboard.jsx'));
const PublicInvitation = lazy(() => import('./pages/PublicInvitation.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));

class RouteErrorBoundary extends Component {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    render() {
        if (!this.state.failed) return this.props.children;
        return <main className="loading-screen">
            <p role="alert">Halaman belum bisa dimuat.</p>
            <button className="btn-secondary" onClick={() => window.location.reload()}>Coba lagi</button>
        </main>;
    }
}

function ProtectedRoute({ children }) {
    const token = getToken();
    return token ? children : <Navigate to="/login" replace />;
}

const initialLanding = document.querySelector('#root > [data-landing-first]')?.outerHTML;

function RouteLoading() {
    return window.location.pathname === '/' && initialLanding
        ? <div dangerouslySetInnerHTML={{ __html: initialLanding }} />
        : <LoadingScreen label="Memuat…" />;
}

export default function App() {
    return (
        <BrowserRouter>
          <CanvasRouteFrame>
            <UIProvider>
                <RouteErrorBoundary><Suspense fallback={<RouteLoading />}>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/planner/rundown/:token" element={<PlannerShared />} />
                    <Route path="/planner/invite/:token" element={<PlannerShared invite />} />
                    <Route path="/planner" element={<ProtectedRoute><PlannerPage /></ProtectedRoute>} />
                    <Route path="/guide" element={<Guide />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signin" element={<Navigate to="/login" replace />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/guest-desk" element={<GuestDesk />} />
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
                </Suspense></RouteErrorBoundary>
            </UIProvider>
          </CanvasRouteFrame>
        </BrowserRouter>
    );
}
