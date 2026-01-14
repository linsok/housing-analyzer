import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import OTPVerification from './pages/OTPVerification';
import ResetPassword from './pages/ResetPassword';
import Properties from './pages/Properties';
import PropertyPublicView from './pages/PropertyPublicView';
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
import MyRoomBookings from './pages/MyRoomBookings';
import MyVisitBookings from './pages/MyVisitBookings';
import OwnerProperties from './pages/OwnerProperties';
import OwnerBookings from './pages/OwnerBookings';
import ManageViewBookings from './pages/ManageViewBookings';
import PaymentPage from './pages/PaymentPage';
import BookingConfirmation from './pages/BookingConfirmation';
import RenterAnalysis from './pages/RenterAnalysis';
import RenterRentalProperties from './pages/RenterRentalProperties';
import OwnerAnalysis from './pages/OwnerAnalysis';
import OwnerCustomers from './pages/OwnerCustomers';
import AdminCustomerManagement from './pages/AdminCustomerManagement';
import { useAuthStore } from './store/useAuthStore';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    // Only redirect to login if not on the home page
    if (window.location.pathname !== '/') {
      return <Navigate to="/login" replace />;
    }
    return children; // Allow access to the home page
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
        <Route path="/" element={
          <Layout>
            <Home />
          </Layout>
        } />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp-verification" element={<OTPVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Public Property Routes */}
        <Route path="/properties" element={
          <Layout>
            <Properties />
          </Layout>
        } />
        <Route path="/properties/:id" element={
          <Layout>
            <PropertyPublicView />
          </Layout>
        } />
        <Route path="/properties/:id/payment" element={
          <Layout>
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          </Layout>
        } />
        <Route path="/booking-confirmation" element={
          <Layout>
            <ProtectedRoute>
              <BookingConfirmation />
            </ProtectedRoute>
          </Layout>
        } />

        {/* Protected Routes with Layout */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/market-trend" element={<MarketTrend />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/support" element={<Support />} />
                  
                  {/* Profile Route - Protected */}
                  <Route
                    path="/profile"
                    element={<Profile />}
                  />

                  {/* Renter Routes */}
                  <Route
                    path="/renter/dashboard"
                    element={<RenterDashboardEnhanced />}
                  />
                  <Route
                    path="/renter/room-bookings"
                    element={<MyRoomBookings />}
                  />
                  <Route
                    path="/renter/visit-bookings"
                    element={<MyVisitBookings />}
                  />
                  <Route
                    path="/favorites"
                    element={<Favorites />}
                  />
                  <Route
                    path="/renter/analysis"
                    element={<RenterAnalysis />}
                  />
                  <Route
                    path="/renter/rental-properties"
                    element={<RenterRentalProperties />}
                  />

                  {/* Owner Routes */}
                  <Route
                    path="/owner/dashboard"
                    element={<OwnerDashboard />}
                  />
                  <Route
                    path="/owner/properties/new"
                    element={<AddProperty />}
                  />
                  <Route
                    path="/owner/analytics"
                    element={<OwnerAnalytics />}
                  />
                  <Route
                    path="/owner/properties"
                    element={<OwnerProperties />}
                  />
                  <Route
                    path="/owner/bookings"
                    element={<OwnerBookings />}
                  />
                  <Route
                    path="/owner/view-bookings"
                    element={<ManageViewBookings />}
                  />
                  <Route
                    path="/owner/customers"
                    element={<OwnerCustomers />}
                  />
                  <Route
                    path="/owner/analysis"
                    element={<OwnerAnalysis />}
                  />
                  <Route
                    path="/edit-property/:id"
                    element={<AddProperty editMode={true} />}
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin/dashboard"
                    element={<AdminDashboard />}
                  />
                  <Route
                    path="/admin/customers"
                    element={<AdminCustomerManagement />}
                  />

                  {/* Catch all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
