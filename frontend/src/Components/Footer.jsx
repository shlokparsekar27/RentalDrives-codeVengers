import { Link } from 'react-router-dom';
import { FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaShieldAlt } from 'react-icons/fa';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-16">

          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl group-hover:bg-primary/90 transition-colors">
                R
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">Rental<span className="text-primary">Drives</span></span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              The premium marketplace for verified vehicle rentals in Goa.
              Engineered for trust, safety, and transparent pricing.
            </p>
            <div className="mt-8 flex gap-4">
              {[
                { icon: FaTwitter, href: "https://x.com" },
                { icon: FaInstagram, href: "https://instagram.com" },
                { icon: FaFacebook, href: "https://facebook.com" },
                { icon: FaLinkedin, href: "https://linkedin.com" }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <social.icon />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="font-bold text-foreground mb-6">Discovery</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link to="/cars" className="hover:text-primary transition-colors">Cars & SUVs</Link></li>
              <li><Link to="/bikes" className="hover:text-primary transition-colors">Motorcycles</Link></li>
              <li><Link to="/scooters" className="hover:text-primary transition-colors">City Scooters</Link></li>
              <li><Link to="/host/add-vehicle" className="hover:text-primary transition-colors">Become a Host</Link></li>
            </ul>
          </div>

          {/* Legal/Support */}
          <div className="col-span-1">
            <h4 className="font-bold text-foreground mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} RentalDrives Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-1 bg-secondary rounded-full">
            <FaShieldAlt className="text-emerald-500" />
            <span>Secure SSL Transaction System</span>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;