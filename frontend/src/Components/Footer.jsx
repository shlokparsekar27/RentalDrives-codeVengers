// src/Components/Footer.jsx
import { Link } from 'react-router-dom';
import logo from '../assets/car.jpg'; // Using the same logo as the navbar
import { FaTwitter, FaInstagram, FaFacebook, FaLinkedin } from 'react-icons/fa'; // Using react-icons

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-12">
          
          {/* Logo and Description Section */}
          <div className="md:col-span-12 lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
            <Link to="/" className="flex items-center mb-4">
              <img src={logo} alt="RentalDrives Logo" className="h-10 w-auto mr-3" />
              <span className="text-white font-bold text-2xl">RentalDrives</span>
            </Link>
            <p className="text-sm max-w-sm">
              Your premier destination for vehicle rentals in Goa. Explore with freedom and book your perfect ride in minutes.
            </p>
          </div>

          {/* Quick Links Section */}
          <div className="md:col-span-6 lg:col-span-3 text-center lg:text-left">
            <h3 className="font-bold text-white text-lg mb-4 tracking-wider">Help & Support</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Follow Us Section */}
          <div className="md:col-span-6 lg:col-span-4 text-center lg:text-left">
            <h3 className="font-bold text-white text-lg mb-4 tracking-wider">Follow Us</h3>
            <p className="mb-4">Stay connected for the latest news and offers.</p>
            <div className="flex justify-center lg:justify-start space-x-5">
              <a href="https://x.com/home" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors" aria-label="Twitter">
                <FaTwitter size={24} />
              </a>
              <a href="https://www.instagram.com/rental.drives/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors" aria-label="Instagram">
                <FaInstagram size={24} />
              </a>
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors" aria-label="Facebook">
                <FaFacebook size={24} />
              </a>
              <a href="https://www.linkedin.com/feed/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors" aria-label="LinkedIn">
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar with Copyright */}
        <div className="border-t border-gray-800 py-6 text-center text-sm">
          <p>© {new Date().getFullYear()} RentalDrives. All Rights Reserved.</p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;