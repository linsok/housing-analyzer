import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Home className="w-6 h-6 text-primary-500" />
              <span className="text-lg font-bold text-white">Housing Analyzer</span>
            </div>
            <p className="text-sm text-gray-400">
              Your trusted platform for finding the perfect rental property in Cambodia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/properties" className="hover:text-primary-500">Browse Properties</Link></li>
              <li><Link to="/about" className="hover:text-primary-500">About Us</Link></li>
              <li><Link to="/analytics" className="hover:text-primary-500">Market Analytics</Link></li>
              <li><Link to="/contact" className="hover:text-primary-500">Contact</Link></li>
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Property Owners</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/register" className="hover:text-primary-500">List Your Property</Link></li>
              <li><Link to="/owner/dashboard" className="hover:text-primary-500">Owner Dashboard</Link></li>
              <li><Link to="/pricing" className="hover:text-primary-500">Pricing</Link></li>
              <li><Link to="/faq" className="hover:text-primary-500">FAQ</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>group05support@housinganalyzer.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+855 97 756 9023</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Phnom Penh, Cambodia</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center text-gray-400">
          <p>&copy; 2025 Housing & Rent Analyzer - Group 05. All rights reserved.</p>
          <p className="mt-2">Built with  by Thoeun Soklin, Sov Sakura, Chhom Sodanith, Chhiv Sivmeng</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
