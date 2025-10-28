import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PlanReview from './pages/PlanReview';
import CommunityDetail from './pages/CommunityDetail';
import Monitoring from './pages/Monitoring';
import Disbursement from './pages/Disbursement';
import Meetings from './pages/Meetings';
import Publications from './pages/Publications';
import Accounts from './pages/Accounts';
import AccountDetail from './pages/AccountDetail';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/plan-review"
        element={
          <ProtectedRoute>
            <MainLayout>
              <PlanReview />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/plan-review/:communityId"
        element={
          <ProtectedRoute>
            <MainLayout>
              <CommunityDetail />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/monitoring"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Monitoring />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/disbursement"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Disbursement />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/meetings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Meetings />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/publications"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Publications />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounts"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Accounts />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/accounts/:id"
        element={
          <ProtectedRoute>
            <MainLayout>
              <AccountDetail />
            </MainLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Settings />
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
