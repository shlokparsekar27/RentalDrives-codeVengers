// src/Components/Footer.jsx
import { Link } from 'react-router-dom';
import { FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaShieldAlt, FaPaperPlane } from 'react-icons/fa';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-background border-t border-border mt-auto font-sans overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-card to-background pointer-events-none -z-10"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        {/* Top Grid */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-12 mb-16">

          {/* Brand Column */}
          <div className="col-span-2 md:col-span-5 lg:col-span-5">
            <Link to="/" className="flex items-center gap-2 mb-6 group w-fit">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform">
                R
              </div>
              <span className="font-bold text-2xl tracking-tight text-foreground">Rental<span className="text-primary">Drives</span></span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm mb-8">
              Goa's premier peer-to-peer vehicle rental marketplace.
              We bridge the gap between trusted local hosts and travelers seeking freedom.
            </p>

            {/* Socials */}
            <div className="flex gap-3">
              {[
                { icon: FaTwitter, href: "https://x.com", label: "Twitter" },
                { icon: FaInstagram, href: "https://instagram.com", label: "Instagram" },
                { icon: FaFacebook, href: "https://facebook.com", label: "Facebook" },
                { icon: FaLinkedin, href: "https://linkedin.com", label: "LinkedIn" }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-secondary/80 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:scale-110 transition-all duration-300 shadow-sm"
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>


          {/* Links Column 1 */}
          <div className="col-span-1 md:col-span-3 lg:col-span-2">
            <h4 className="font-bold text-foreground mb-6 uppercase text-xs tracking-widest text-primary/80">Explore</h4>
            <ul className="space-y-4 text-sm text-muted-foreground font-medium">
              <li><Link to="/" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Home</Link></li>
              <li><Link to="/cars" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Cars</Link></li>
              <li><Link to="/bikes" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Motorcycles</Link></li>
              <li><Link to="/scooters" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Scooters</Link></li>
              <li><Link to="/profile" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Profile</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="col-span-1 md:col-span-4 lg:col-span-2">
            <h4 className="font-bold text-foreground mb-6 uppercase text-xs tracking-widest text-primary/80">Support</h4>
            <ul className="space-y-4 text-sm text-muted-foreground font-medium">
              <li><Link to="/about" className="hover:text-primary hover:translate-x-1 transition-all inline-block">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Help Center</Link></li>
              <li><Link to="/faq" className="hover:text-primary hover:translate-x-1 transition-all inline-block">FAQs</Link></li>
              <li><Link to="/terms" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-primary hover:translate-x-1 transition-all inline-block">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div className="col-span-2 md:col-span-12 lg:col-span-3">
            <div className="bg-secondary/30 p-6 rounded-2xl border border-border/50 backdrop-blur-sm">
              <h4 className="font-bold text-foreground mb-2">Stay Updated</h4>
              <p className="text-xs text-muted-foreground mb-4">Get the latest travel tips and rental offers.</p>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-background border border-border rounded-xl py-3 pl-4 pr-12 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
                <button className="absolute right-2 top-2 p-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  <FaPaperPlane size={12} />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground font-medium">
            © {currentYear} RentalDrives Inc.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <FaShieldAlt /> 256-Bit SSL Secured
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;