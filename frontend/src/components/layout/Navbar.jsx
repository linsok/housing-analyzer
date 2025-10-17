import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, Heart, User, LogOut, LayoutDashboard, Menu, X, TrendingUp, Info, HelpCircle, Shield, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useState } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'owner':
        return '/owner/dashboard';
      case 'renter':
        return '/renter/dashboard';
      default:
        return '/';
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'owner':
        return 'success';
      case 'renter':
        return 'info';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'owner':
        return 'Property Owner';
      case 'renter':
        return 'Renter';
      default:
        return 'User';
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Home className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">
              My Rentor
            </span>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition">
              Home
            </Link>
            
            {user?.role !== 'admin' && (
              <Link to="/properties" className="text-gray-700 hover:text-primary-600 transition">
                Rent
              </Link>
            )}
            
            <Link to="/market-trend" className="text-gray-700 hover:text-primary-600 transition">
              Market Trend
            </Link>
            
            {user?.role === 'admin' ? (
              <>
                <a href="http://localhost:8000/admin" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-primary-600 transition">
                  <Settings className="w-4 h-4 inline mr-1" />
                  Django Admin
                </a>
              </>
            ) : (
              <>
                <Link to="/about" className="text-gray-700 hover:text-primary-600 transition">
                  About Us
                </Link>
                
                <Link to="/support" className="text-gray-700 hover:text-primary-600 transition">
                  Support
                </Link>
              </>
            )}
          </div>

          {/* Desktop Navigation - Right (Auth) */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* User Role Badge */}
                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-200">
                  {user.role === 'admin' && <Shield className="w-4 h-4 text-red-600" />}
                  {user.role === 'owner' && <Home className="w-4 h-4 text-green-600" />}
                  {user.role === 'renter' && <User className="w-4 h-4 text-blue-600" />}
                  <span className="text-sm font-medium text-gray-700">{user.username}</span>
                  <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
                
                <Link to={getDashboardLink()} className="text-gray-700 hover:text-primary-600 transition">
                  <LayoutDashboard className="w-5 h-5 inline mr-1" />
                  Dashboard
                </Link>
                
                {user.role === 'renter' && (
                  <Link to="/favorites" className="text-gray-700 hover:text-primary-600 transition">
                    <Heart className="w-5 h-5 inline mr-1" />
                    Favorites
                  </Link>
                )}
                
                <Link to="/profile" className="text-gray-700 hover:text-primary-600 transition">
                  <User className="w-5 h-5 inline mr-1" />
                  Profile
                </Link>
                
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            {/* User Role Badge - Mobile */}
            {isAuthenticated && (
              <div className="px-4 py-2 mb-2">
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  {user.role === 'admin' && <Shield className="w-4 h-4 text-red-600" />}
                  {user.role === 'owner' && <Home className="w-4 h-4 text-green-600" />}
                  {user.role === 'renter' && <User className="w-4 h-4 text-blue-600" />}
                  <span className="text-sm font-medium text-gray-700">{user.username}</span>
                  <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
              </div>
            )}
            
            <Link
              to="/"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            
            {user?.role !== 'admin' && (
              <Link
                to="/properties"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Rent
              </Link>
            )}
            
            <Link
              to="/market-trend"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Market Trend
            </Link>
            
            {user?.role === 'admin' ? (
              <a
                href="http://localhost:8000/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Django Admin
              </a>
            ) : (
              <>
                <Link
                  to="/about"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About Us
                </Link>
                
                <Link
                  to="/support"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Support
                </Link>
              </>
            )}
            
            {isAuthenticated ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                
                {user.role === 'renter' && (
                  <Link
                    to="/favorites"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Favorites
                  </Link>
                )}
                
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                
                <button
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
