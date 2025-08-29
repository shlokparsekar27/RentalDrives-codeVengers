// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import Bikes from "./pages/Bikes";
import Scooters from "./pages/Scooters";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Profile from "./pages/Profile";
import VehicleDetail from './pages/VehicleDetail';
import HostDashboard from './pages/HostDashboard';
import AddVehicle from './pages/AddVehicle';
import EditVehicle from './pages/EditVehicle';
import AdminDashboard from './pages/AdminDashboard';
import HostBookings from "./pages/HostBookings"; // Import the new page

function App() {
  return (
    <Router>
      <Navbar />
      <main style={{ paddingBottom: '5rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/bikes" element={<Bikes />} />
          <Route path="/scooters" element={<Scooters />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/vehicle/:id" element={<VehicleDetail />} />
          <Route path="/host/dashboard" element={<HostDashboard />} />
          <Route path="/host/add-vehicle" element={<AddVehicle />} />
          <Route path="/host/edit-vehicle/:id" element={<EditVehicle />} />
          {/* NEW: Add the route for the host bookings page */}
          <Route path="/host/bookings" element={<HostBookings />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
