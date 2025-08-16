import { NavLink } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/car.jpg";   // ✅ Importing the logo

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="Rental Drives Logo" className="logo"/>
      </div>
      <div className="navbar-links">
        <NavLink to="/" end className="nav-link">
          Home
        </NavLink>
        <NavLink to="/cars" className="nav-link">
          Cars
        </NavLink>
        <NavLink to="/bikes" className="nav-link">
          Bikes
        </NavLink>
        <NavLink to="/scooters" className="nav-link">
          Scooters
        </NavLink>
        <NavLink to="/contact" className="nav-link">
          Contact
        </NavLink>
      </div>
      <div className="navbar-auth">
        <NavLink to="/login" className="login-btn">Login</NavLink>
        <NavLink to="/signup" className="signup-btn">Sign Up</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
