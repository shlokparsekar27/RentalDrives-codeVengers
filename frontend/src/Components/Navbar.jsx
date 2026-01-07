// src/Components/Navbar.jsx
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import Button from './ui/Button';
import {
  FaBars, FaTimes, FaUserCircle, FaSignOutAlt, FaCar,
  FaMotorcycle, FaBicycle, FaChevronRight
} from 'react-icons/fa';

function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      try {
        await signOut();
        navigate('/login');
      } catch (error) {
        console.error("Error logging out:", error);
      }
    }
  };

  const navLinks = [
    { name: 'Cars', path: '/cars', icon: FaCar },
    { name: 'Bikes', path: '/bikes', icon: FaMotorcycle },
    { name: 'Scooters', path: '/scooters', icon: FaBicycle },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled || isOpen
          ? 'bg-background/95 backdrop-blur-xl border-b border-border shadow-sm py-2'
          : 'bg-transparent border-b border-transparent py-4'
          }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 md:h-14">

            {/* Logo - Always visible and full text */}
            <Link to="/" className="flex items-center gap-2 group z-50">
              <div className={`p-1.5 rounded-lg transition-colors ${scrolled || isOpen ? 'bg-primary text-primary-foreground' : 'bg-foreground text-background '}`}>
                <FaCar className="text-xl" />
              </div>
              <span className={`text-lg font-bold tracking-tight transition-colors ${scrolled || isOpen ? 'text-foreground' : 'text-primary-foreground md:text-foreground mix-blend-exclusion'}`}>
                Rental<span className="text-primary">Drives</span>
              </span>
            </Link>

            {/* Desktop Nav - Hidden on Mobile */}
            <div className="hidden md:flex items-center gap-6 bg-secondary/50 px-6 py-2 rounded-full border border-border/50 backdrop-blur-md">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) => `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary font-bold' : 'text-muted-foreground'
                    }`}
                >
                  {link.name}
                </NavLink>
              ))}
            </div>

            {/* Right Side Actions - Desktop Only for full buttons */}
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />

              {user ? (
                <div className="flex items-center gap-4 pl-4 border-l border-border">
                  <Link
                    to={user.role === 'admin' ? "/admin/dashboard" : user.role === 'host' ? "/host/dashboard" : "/profile"}
                    className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border group-hover:border-primary transition-all">
                      <FaUserCircle />
                    </div>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className={`text-sm font-bold transition-colors ${scrolled ? 'text-muted-foreground hover:text-foreground' : 'text-muted-foreground md:text-foreground'}`}>
                    Log in
                  </Link>
                  <Button to="/signup" size="sm" className="shadow-lg shadow-primary/20">
                    Get Started
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle - Visible on Mobile */}
            <div className="md:hidden flex items-center gap-4 z-50">
              <ThemeToggle />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-foreground focus:outline-none p-2 active:scale-95 transition-transform"
              >
                {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`md:hidden fixed inset-0 top-[60px] bg-background border-t border-border transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
        >
          <div className="flex flex-col p-4 space-y-2 h-[calc(100vh-60px)] overflow-y-auto pb-20">

            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-primary shadow-sm">
                    <link.icon size={18} />
                  </div>
                  <span className="font-bold text-lg">{link.name}</span>
                </div>
                <FaChevronRight className="text-muted-foreground text-sm" />
              </Link>
            ))}

            <div className="my-4 border-t border-dashed border-border"></div>

            {user ? (
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Signed in as</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl uppercase">
                      {(user.user_metadata?.full_name || user.email)?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-foreground capitalize">{user.user_metadata?.full_name || user.email}</p>
                      <span className="text-xs bg-background border border-border px-2 py-0.5 rounded-full text-muted-foreground capitalize">{user.role}</span>
                    </div>
                  </div>
                </div>

                <Link to={user.role === 'admin' ? "/admin/dashboard" : user.role === 'host' ? "/host/dashboard" : "/profile"}
                  className="w-full btn btn-primary flex items-center justify-center gap-2 p-3 rounded-lg font-bold bg-secondary hover:bg-border transition-colors">
                  Access Dashboard
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center p-3 rounded-lg text-destructive font-bold bg-destructive/10 hover:bg-destructive/20 transition-colors"
                >
                  <FaSignOutAlt className="mr-2" /> Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Button to="/login" variant="ghost" fullWidth size="lg">Log in</Button>
                <Button to="/signup" variant="primary" fullWidth size="lg">Create Account</Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Backdrop for Mobile Menu */}
      {isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  );
}

export default Navbar;