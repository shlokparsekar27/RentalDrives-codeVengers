// src/Components/Navbar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import logo from "../assets/car.jpg"; // Your existing logo
import { useState } from "react";

// Function to fetch the user's profile remains the same
const fetchUserProfile = async (userId) => {
    if (!userId) return null;
    const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (error) throw new Error(error.message);
    return data;
}

function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    enabled: !!user,
    queryKey: ['profile', user?.id],
    queryFn: () => fetchUserProfile(user.id)
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/Signup');
  };

  // --- Dynamically build the navigation items based on the new structure ---
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
  
  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  return (
    <nav className="bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <div className="flex-shrink-0">
            <NavLink to="/">
              <img src={logo} alt="Rental Drives Logo" className="h-12 w-auto" />
            </NavLink>
          </div>

          {/* Desktop Menu Links */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Auth Buttons for Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <NavLink to="/profile" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Profile
                </NavLink>
                <button onClick={handleLogout} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/signup" className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Login
                </NavLink>
                <NavLink to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                  Sign Up
                </NavLink>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            {/* Auth links in mobile menu */}
            <div className="border-t border-gray-700 pt-4 mt-4">
              {user ? (
                <div className="space-y-1">
                    <NavLink to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Profile</NavLink>
                    <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Logout</button>
                </div>
              ) : (
                <div className="space-y-1">
                    <NavLink to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Login</NavLink>
                    <NavLink to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Sign Up</NavLink>
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