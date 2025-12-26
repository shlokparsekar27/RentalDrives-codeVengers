// src/Components/Footer.jsx
import { Link } from 'react-router-dom';
import logo from '../assets/car.jpg';
import { FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaHeart } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-slate-950 dark:bg-black text-slate-400 border-t border-slate-900 overflow-hidden relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 py-16">

          {/* Logo and Description Section */}
          <div className="md:col-span-4 lg:col-span-5 flex flex-col items-start">
            <Link to="/" className="flex items-center mb-6 px-1 group">
              <img
                src={logo}
                alt="RentalDrives Logo"
                className="h-10 w-auto rounded-full border border-slate-800 mr-3 group-hover:scale-105 transition-transform"
              />
              <span className="text-white font-display font-bold text-2xl tracking-tight">RentalDrives</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
              Your premier destination for vehicle rentals in Goa. We connect trusted local hosts with travelers looking for freedom on the road. Verified vehicles, transparent pricing, and zero hidden fees.
            </p>
            <div className="flex space-x-4">
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/50">
                <FaTwitter size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-pink-600 hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-lg hover:shadow-pink-900/50">
                <FaInstagram size={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-blue-700 hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/50">
                <FaFacebook size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-blue-500 hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-900/50">
                <FaLinkedin size={18} />
              </a>
            </div>
          </div>

          {/* Spacer for desktop layout balance */}
          <div className="hidden md:block md:col-span-1 lg:col-span-2"></div>

          {/* Quick Links Section */}
          <div className="md:col-span-3 lg:col-span-2">
            <h3 className="font-bold text-white text-base mb-6 uppercase tracking-wider">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-blue-400 transition-colors block py-0.5">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition-colors block py-0.5">Contact Support</Link></li>
              <li><Link to="/careers" className="hover:text-blue-400 transition-colors block py-0.5">Careers</Link></li>
              <li><Link to="/press" className="hover:text-blue-400 transition-colors block py-0.5">Press Kit</Link></li>
            </ul>
          </div>

          {/* Legal/Support Section */}
          <div className="md:col-span-4 lg:col-span-3">
            <h3 className="font-bold text-white text-base mb-6 uppercase tracking-wider">Legal & Support</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/faq" className="hover:text-blue-400 transition-colors block py-0.5">Help Center (FAQ)</Link></li>
              <li><Link to="/terms" className="hover:text-blue-400 transition-colors block py-0.5">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-blue-400 transition-colors block py-0.5">Privacy Policy</Link></li>
              <li><Link to="/host-rules" className="hover:text-blue-400 transition-colors block py-0.5">Host Rules</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Copyright */}
        <div className="border-t border-slate-900 py-8 text-center md:flex md:justify-between md:items-center">
          <p className="text-sm text-slate-600 mb-4 md:mb-0">
            © {new Date().getFullYear()} RentalDrives Inc. All Rights Reserved.
          </p>
          <div className="flex items-center justify-center gap-6">
            <Link to="/privacy" className="text-xs text-slate-600 hover:text-slate-400">Privacy</Link>
            <Link to="/terms" className="text-xs text-slate-600 hover:text-slate-400">Terms</Link>
            <Link to="/sitemap" className="text-xs text-slate-600 hover:text-slate-400">Sitemap</Link>
          </div>
          <p className="text-sm text-slate-600 flex items-center justify-center gap-1 mt-4 md:mt-0">
            Made with <FaHeart className="text-red-500 mx-1" /> in Goa, India
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;