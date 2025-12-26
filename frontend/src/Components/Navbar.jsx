// src/Components/Navbar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import logo from "../assets/car.jpg";
import { useState } from "react";
import Button from './ui/Button';
import ThemeToggle from './ThemeToggle';
import { FaBars, FaTimes, FaUserCircle } from 'react-icons/fa';

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
    navItems.push({ label: "Admin Dashboard", to: "/admin/dashboard" });
  }

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 transition-colors duration-300 dark:bg-slate-950 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <NavLink to="/" className="flex items-center gap-2">
              <img src={logo} alt="Rental Drives" className="h-10 w-auto rounded-full border-2 border-slate-700" />
              <span className="text-white font-display font-bold text-xl tracking-tight hidden sm:block">RentalDrives</span>
            </NavLink>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                    ? 'bg-slate-800 text-white shadow-sm dark:bg-slate-800'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop Auth & Theme */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {user ? (
              <>
                <NavLink to="/profile" className="text-slate-300 hover:text-white transition-colors dark:text-slate-400 dark:hover:text-white">
                  <FaUserCircle size={24} />
                </NavLink>
                <Button onClick={handleLogout} variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800 dark:text-slate-400">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button to="/login" variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-800 dark:text-slate-400">
                  Login
                </Button>
                <Button to="/signup" variant="accent" size="sm">
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button - Includes small theme toggle next to menu? No, keep it inside menu or top right */}
          <div className="md:hidden flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 dark:bg-slate-950">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="border-t border-slate-700 pt-4 mt-4 space-y-3">
              {user ? (
                <>
                  <NavLink to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white">
                    <FaUserCircle /> Profile
                  </NavLink>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white font-medium">
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button to="/login" variant="secondary" className="w-full justify-center" onClick={() => setIsMobileMenuOpen(false)}>Login</Button>
                  <Button to="/signup" variant="accent" className="w-full justify-center" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;