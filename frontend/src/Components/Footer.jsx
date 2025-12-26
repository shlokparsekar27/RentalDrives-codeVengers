// src/Components/Footer.jsx
import { Link } from 'react-router-dom';
import logo from '../assets/car.jpg';
import { FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaHeart, FaShieldAlt } from 'react-icons/fa';
import Badge from './ui/Badge';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 dark:bg-black text-slate-400 border-t border-slate-900 relative overflow-hidden font-sans">

      {/* Abstract Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-900/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Top Section: Branding & Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 py-16">

          {/* Brand Column */}
          <div className="lg:col-span-5 space-y-6">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 rounded-full"></div>
                <img src={logo} alt="RentalDrives" className="relative h-10 w-10 rounded-xl border border-slate-800 object-cover" />
              </div>
              <span className="font-display font-bold text-2xl text-white tracking-tight">RentalDrives</span>
            </Link>
            <p className="text-slate-500 text-base leading-relaxed max-w-md">
              The digital infrastructure for trusted vehicle rentals in Goa. Connecting verified hosts with modern travelers for seamless, reliable mobility.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <SocialLink href="https://x.com" icon={FaTwitter} hoverColor="hover:text-sky-400" />
              <SocialLink href="https://instagram.com" icon={FaInstagram} hoverColor="hover:text-pink-500" />
              <SocialLink href="https://linkedin.com" icon={FaLinkedin} hoverColor="hover:text-blue-500" />
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Links Section */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-8">

            {/* Company */}
            <div className="space-y-6">
              <FooterHeading>Company</FooterHeading>
              <ul className="space-y-3">
                <FooterLink to="/about">About Us</FooterLink>
                <FooterLink to="/careers">Careers <Badge variant="neutral" className="ml-2 text-[10px] py-0 bg-slate-800 border-slate-700 text-slate-400">Hiring</Badge></FooterLink>
                <FooterLink to="/press">Newsroom</FooterLink>
                <FooterLink to="/contact">Contact</FooterLink>
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-6">
              <FooterHeading>Resources</FooterHeading>
              <ul className="space-y-3">
                <FooterLink to="/faq">Help Center</FooterLink>
                <FooterLink to="/host-rules">Host Guidelines</FooterLink>
                <FooterLink to="/safety">Safety First</FooterLink>
                <FooterLink to="/insurance">Insurance Policy</FooterLink>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-6">
              <FooterHeading>Legal</FooterHeading>
              <ul className="space-y-3">
                <FooterLink to="/terms">Terms of Service</FooterLink>
                <FooterLink to="/privacy">Privacy Policy</FooterLink>
                <FooterLink to="/cookies">Cookie Settings</FooterLink>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-600">

          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-8">
            <span>&copy; {currentYear} RentalDrives Inc.</span>
            <span className="hidden md:inline text-slate-800">|</span>
            <span className="flex items-center gap-1">
              <FaShieldAlt className="text-slate-700" />
              Secure Payment Standards
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span>Engineered with</span>
            <FaHeart className="text-red-900/50 animate-pulse mx-1" />
            <span>in Goa</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// --- Sub-components for Consistency ---

const FooterHeading = ({ children }) => (
  <h3 className="font-display font-bold text-white text-sm uppercase tracking-wider">{children}</h3>
);

const FooterLink = ({ to, children }) => (
  <li>
    <Link to={to} className="text-sm text-slate-500 hover:text-white transition-colors duration-200 flex items-center">
      {children}
    </Link>
  </li>
);

const SocialLink = ({ href, icon: Icon, hoverColor }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-slate-500 transition-all duration-300 hover:bg-slate-800 ${hoverColor}`}
  >
    <Icon size={18} />
  </a>
);

export default Footer;