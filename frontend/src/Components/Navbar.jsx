// src/Components/Navbar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useQuery } from '@tanstack/react-query'; // Import useQuery
import { supabase } from '../supabaseClient'; // Import supabase
import "./Navbar.css";
import logo from "../assets/car.jpg";

// Function to fetch the user's profile
const fetchUserProfile = async (userId) => {
    if (!userId) return null;
    const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single();
    if (error) throw new Error(error.message);
    return data;
}

function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Fetch the user's profile to check their role
  const { data: profile } = useQuery({
    enabled: !!user, // Only run if the user is logged in
    queryKey: ['profile', user?.id],
    queryFn: () => fetchUserProfile(user.id)
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="Rental Drives Logo" className="logo" />
      </div>
      <div className="navbar-links">
        <NavLink to="/" end className="nav-link">Home</NavLink>
        <NavLink to="/cars" className="nav-link">Cars</NavLink>
        <NavLink to="/bikes" className="nav-link">Bikes</NavLink>
        <NavLink to="/scooters" className="nav-link">Scooters</NavLink>
        
        {/* Conditionally render the Host Dashboard link */}
        {profile?.role === 'host' && (
            <NavLink to="/host/dashboard" className="nav-link">Host Dashboard</NavLink>
        )}
      </div>
      <div className="navbar-auth">
        {user ? (
          <>
            <NavLink to="/profile" className="login-btn">Profile</NavLink>
            <button onClick={handleLogout} className="signup-btn">Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="login-btn">Login</NavLink>
            <NavLink to="/signup" className="signup-btn">Sign Up</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;