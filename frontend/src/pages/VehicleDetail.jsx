// src/pages/VehicleDetail.jsx
import { useState, useMemo } from 'react'; // NEW: Import useState and useMemo
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './VehicleDetail.css';
import { createBooking } from '../api/bookings'; // Ensure createBooking is imported

// --- Data Fetching ---
const fetchVehicleById = async (vehicleId) => {
  // This can also be moved to a central API file later
  const { data, error } = await supabase
    .from('vehicles')
    .select(`*, reviews ( * )`)
    .eq('id', vehicleId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};


function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- NEW: State for date selection ---
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: vehicle, isLoading, isError, error } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => fetchVehicleById(id),
  });

  // --- NEW: Price calculation logic ---
  const totalPrice = useMemo(() => {
    if (startDate && endDate && vehicle) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) return 0; // Invalid date range
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays * vehicle.price_per_day;
    }
    return 0;
  }, [startDate, endDate, vehicle]);

  const bookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      alert('Booking successful!');
      navigate('/profile');
    },
    onError: (error) => {
      alert(`Booking failed: ${error.message}`);
    }
  });

  const handleBooking = () => {
    if (!user) {
      navigate('/login');
    } else if (!startDate || !endDate || totalPrice <= 0) {
      alert('Please select a valid date range.');
    } else {
      // MODIFIED: Pass all details to the mutation
      bookingMutation.mutate({
        vehicle,
        user,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        totalPrice
      });
    }
  };

  if (isLoading) { /* ... loading ... */ }
  if (isError) { /* ... error ... */ }

  return (
    <div className="detail-container">
      <div className="detail-header">
        <h1>{vehicle?.make} {vehicle?.model}</h1>
        <span className="detail-price">₹{vehicle?.price_per_day}/day</span>
      </div>

      <div className="detail-gallery">
        <img
          src={vehicle?.image_urls?.[0] || 'https://via.placeholder.com/800x500.png?text=No+Image'}
          alt={`${vehicle?.make} ${vehicle?.model}`}
          className="main-image"
        />
      </div>

      <div className="detail-specs">
        <h3>Key Details</h3>
        {/* ... list items ... */}
      </div>

      {/* --- NEW: Date Picker and Booking Section --- */}
      <div className="booking-widget">
        <h3>Select Your Dates</h3>
        <div className="date-picker">
          <div className="date-input">
            <label htmlFor="start-date">Start Date</label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]} // Prevent selecting past dates
            />
          </div>
          <div className="date-input">
            <label htmlFor="end-date">End Date</label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split("T")[0]} // Prevent end date before start date
            />
          </div>
        </div>

        {totalPrice > 0 && (
          <div className="price-display">
            Total Price: <strong>₹{totalPrice}</strong>
          </div>
        )}

        <button
          className="book-btn-large"
          onClick={handleBooking}
          disabled={bookingMutation.isPending || !startDate || !endDate}
        >
          {bookingMutation.isPending ? 'Booking...' : 'Book Now'}
        </button>
      </div>

      {/* --- REVIEWS SECTION --- */}
      <div className="detail-reviews">
        {/* ... reviews section ... */}
      </div>
    </div>
  );
}

export default VehicleDetail;