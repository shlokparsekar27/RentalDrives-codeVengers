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
import Profile from "./pages/Profile"; // Import the new Profile page
import VehicleDetail from './pages/VehicleDetail'; // Import the new page
import HostDashboard from './pages/HostDashboard'; // Import the new page
import AddVehicle from './pages/AddVehicle'; // Import the new page
import EditVehicle from './pages/EditVehicle'; // NEW: Import EditVehicle
import AdminDashboard from './pages/AdminDashboard'; // NEW: Import AdminDashboard


function App() {
  return (
    <Router>
      <Navbar />
      <main style={{ paddingBottom: '5rem' }}> {/* Added to prevent footer overlap */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/bikes" element={<Bikes />} />
          <Route path="/scooters" element={<Scooters />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile />} /> {/* Add the new route */}
          <Route path="/vehicle/:id" element={<VehicleDetail />} /> {/* Add this new route */}
          <Route path="/host/dashboard" element={<HostDashboard />} /> {/* Add this new route */}
          <Route path="/host/add-vehicle" element={<AddVehicle />} /> {/* Add this new route */}
          <Route path="/host/edit-vehicle/:id" element={<EditVehicle />} /> {/* NEW: Add this route */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} /> {/* NEW: Add this route */}
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;