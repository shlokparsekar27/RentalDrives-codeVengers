// src/Components/Navbar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import logo from "../assets/car.jpg";
import { useState, useEffect } from "react";
import Button from './ui/Button';
import ThemeToggle from './ThemeToggle';
import { FaBars, FaTimes, FaUserCircle, FaChevronDown } from 'react-icons/fa';

// --- API ---
const fetchUserProfile = async (userId) => {
  if (!userId) return null;
  const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single();
  if (error) throw new Error(error.message);
  return data;
}

function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll logic for glass effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { data: profile } = useQuery({
    enabled: !!user,
    queryKey: ['profile', user?.id],
    queryFn: () => fetchUserProfile(user.id)
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Cars", to: "/cars" },
    { label: "Bikes", to: "/bikes" },
    { label: "Scooters", to: "/scooters" },
  ];

  if (profile?.role === 'host') {
    navItems.push({ label: "Host Dashboard", to: "/host/dashboard" });
  }
  if (profile?.role === 'admin') {
    navItems.push({ label: "Admin Console", to: "/admin/dashboard" });
  }

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-500 ease-in-out border-b ${scrolled
      ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-lg py-2'
      : 'bg-transparent border-transparent py-4'
      }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo - Animated Entry */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className={`relative transition-all duration-300 ${scrolled ? 'scale-90' : 'scale-100'}`}>
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
              <img src={logo} alt="RentalDrives" className="relative h-10 w-10 md:h-12 md:w-12 rounded-xl object-cover shadow-lg group-hover:rotate-6 transition-transform duration-500" />
            </div>
            <span className={`font-display font-bold text-xl tracking-tight transition-colors duration-300 ${scrolled ? 'text-slate-900 dark:text-white' : 'text-white' // Always visible
              }`}>
              Rental<span className="text-blue-600 dark:text-blue-400">Drives</span>
            </span>
          </NavLink>

          {/* Desktop Menu - Professional Nav */}
          <div className="hidden md:flex items-center gap-1 mx-6">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive
                    ? 'text-slate-900 dark:text-white bg-white/10 backdrop-blur-md shadow-sm'
                    : `text-slate-300 hover:text-white hover:bg-white/5`
                  } ${scrolled && !isActive ? '!text-slate-600 dark:!text-slate-400 hover:!bg-slate-100 dark:hover:!bg-slate-800' : ''}
                  ${scrolled && isActive ? '!bg-slate-100 !text-slate-900 dark:!bg-slate-800 dark:!text-white' : ''}
                  `
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Actions - Theme & Auth */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-3">
                <NavLink to="/profile" className="flex items-center gap-2 pl-2 pr-1 py-1 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 pl-2">Profile</span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    <FaUserCircle size={18} />
                  </div>
                </NavLink>
                <Button onClick={handleLogout} variant="ghost" size="sm" className={`transition-colors ${scrolled ? 'text-slate-500 hover:text-red-600' : 'text-white/80 hover:text-red-400'}`}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NavLink to="/login" className={`px-4 py-2 text-sm font-bold transition-colors ${scrolled ? 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white' : 'text-white/90 hover:text-white'}`}>
                  Log In
                </NavLink>
                <Button to="/signup" variant="accent" className="shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-95 transition-all">
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-xl transition-colors ${scrolled ? 'text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-white hover:bg-white/10'}`}
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`md:hidden fixed inset-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl transition-transform duration-500 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ top: '70px' }}>
        <div className="p-6 space-y-6 h-full overflow-y-auto">
          <div className="space-y-2">
            {navItems.map((item, idx) => (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-6 py-4 text-2xl font-display font-bold rounded-2xl transition-all duration-300 border border-transparent ${isActive
                    ? 'bg-slate-100 dark:bg-slate-900 text-blue-600 dark:text-blue-400 border-slate-200 dark:border-slate-800 shadow-sm'
                    : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:pl-8'
                  }`
                }
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                    <FaUserCircle size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">Active Session</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <Button onClick={handleLogout} className="w-full justify-center py-4 text-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/30">
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Button to="/login" variant="secondary" className="justify-center py-4" onClick={() => setIsMobileMenuOpen(false)}>Log In</Button>
                <Button to="/signup" variant="accent" className="justify-center py-4" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;