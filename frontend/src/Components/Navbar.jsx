import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import Button from './ui/Button';
import { FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaTachometerAlt, FaCar } from 'react-icons/fa';

function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const navLinks = [
    { name: 'Fleet', path: '/cars' },
    { name: 'Bikes', path: '/bikes' },
    { name: 'Scooters', path: '/scooters' },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled
          ? 'bg-background/80 backdrop-blur-md border-border shadow-sm'
          : 'bg-background/0 border-transparent'
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <FaCar className="text-xl" />
            </div>
            <span className={`text-lg font-bold tracking-tight transition-colors ${scrolled ? 'text-foreground' : 'text-foreground'}`}>
              Rental<span className="text-primary">Drives</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to={user.role === 'admin' ? "/admin/dashboard" : user.role === 'host' ? "/host/dashboard" : "/profile"}
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  <FaUserCircle className="text-lg" />
                  <span>{user.email?.split('@')[0]}</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                  <FaSignOutAlt />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Log in
                </Link>
                <Button to="/signup" size="sm">
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground focus:outline-none p-2"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border absolute w-full px-4 py-4 shadow-lg animate-accordion-down">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-base font-medium text-foreground hover:text-primary py-2 border-b border-border/50"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 text-base font-medium py-2" onClick={() => setIsOpen(false)}>
                  <FaUserCircle /> My Profile
                </Link>
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="flex items-center gap-2 text-base font-medium py-2 text-destructive">
                  <FaSignOutAlt /> Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 mt-2">
                <Button to="/login" variant="secondary" fullWidth onClick={() => setIsOpen(false)}>Log in</Button>
                <Button to="/signup" variant="primary" fullWidth onClick={() => setIsOpen(false)}>Sign up</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;