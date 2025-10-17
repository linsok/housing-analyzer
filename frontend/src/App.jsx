import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import RenterDashboard from './pages/RenterDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MarketTrend from './pages/MarketTrend';
import AboutUs from './pages/AboutUs';
import Support from './pages/Support';
import AddProperty from './pages/AddProperty';
import OwnerAnalytics from './pages/OwnerAnalytics';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import RenterDashboardEnhanced from './pages/RenterDashboardEnhanced';
import { useAuthStore } from './store/useAuthStore';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes with Layout */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/properties/:id" element={<PropertyDetail />} />
                <Route path="/market-trend" element={<MarketTrend />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/support" element={<Support />} />
                
                {/* Profile Route - Protected */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Renter Routes */}
                <Route
                  path="/renter/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['renter']}>
                      <RenterDashboardEnhanced />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute allowedRoles={['renter']}>
                      <Favorites />
                    </ProtectedRoute>
                  }
                />

                {/* Owner Routes */}
                <Route
                  path="/owner/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['owner']}>
                      <OwnerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner/properties/new"
                  element={
                    <ProtectedRoute allowedRoles={['owner']}>
                      <AddProperty />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/owner/analytics"
                  element={
                    <ProtectedRoute allowedRoles={['owner']}>
                      <OwnerAnalytics />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
