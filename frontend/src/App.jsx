// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import Bikes from "./pages/Bikes";
import Scooters from "./pages/Scooters";
import Auth from "./pages/Auth"; // Unified Auth Page

import About from "./pages/About";
import Contact from "./pages/Contact";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import EditProfile from "./pages/EditProfile";
import VehicleDetail from './pages/VehicleDetail';
import HostDashboard from './pages/HostDashboard';
import AddVehicle from './pages/AddVehicle';
import EditVehicle from './pages/EditVehicle';
import AdminDashboard from './pages/AdminDashboard';
import HostBookings from "./pages/HostBookings";
import VehicleReviews from './pages/VehicleReviews';
import AdminHostVerification from './pages/AdminHostVerification';
import AdminLicenseVerification from './pages/AdminLicenseVerification';
import BookingSummary from "./pages/BookingSummary";
import FAQ from "./pages/FAQ";
import TermsOfService from "./pages/TermsofService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import BookingDetails from "./pages/BookingDetails";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./Components/ScrollToTop";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <main style={{ paddingBottom: '5rem' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/bikes" element={<Bikes />} />
          <Route path="/scooters" element={<Scooters />} />

          {/* Auth Routes - All point to the Unified Auth Page */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />

          {/* Legacy/Specific Routes */}


          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/users/:id" element={<PublicProfile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/vehicle/:id" element={<VehicleDetail />} />
          <Route path="/host/dashboard" element={<HostDashboard />} />
          <Route path="/host/add-vehicle" element={<AddVehicle />} />
          <Route path="/host/edit-vehicle/:id" element={<EditVehicle />} />
          <Route path="/host/bookings" element={<HostBookings />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/vehicle/:id/reviews" element={<VehicleReviews />} />
          <Route path="/admin/verify-hosts" element={<AdminHostVerification />} />
          <Route path="/admin/verify-licenses" element={<AdminLicenseVerification />} />
          <Route path="/booking-summary" element={<BookingSummary />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/booking/:id" element={<BookingDetails />} />

          {/* Catch-all Route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
