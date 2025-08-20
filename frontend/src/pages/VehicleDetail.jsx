// src/pages/VehicleDetail.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './VehicleDetail.css'; // We will create this CSS file

// --- Data Fetching and Mutation Functions ---
const fetchVehicleById = async (vehicleId) => {
  const { data, error } = await supabase
    .from('vehicles')
    .select(`
      *,
      reviews ( * )
    `)
    .eq('id', vehicleId)
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const createBooking = async ({ vehicle, user }) => {
  const bookingDetails = {
    vehicle_id: vehicle.id,
    user_id: user.id,
    start_date: new Date().toISOString(),
    end_date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    total_price: vehicle.price_per_day * 2,
    status: 'confirmed'
  };
  const { data, error } = await supabase.from('bookings').insert(bookingDetails).select();
  if (error) throw new Error(error.message);
  return data;
};

function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: vehicle, isLoading, isError, error } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => fetchVehicleById(id),
  });

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
    } else {
      bookingMutation.mutate({ vehicle, user });
    }
  };

  if (isLoading) {
    return <div className="detail-container"><h2>Loading Vehicle Details...</h2></div>;
  }

  if (isError) {
    return <div className="detail-container"><h2>Error: {error.message}</h2></div>;
  }

  return (
    <div className="detail-container">
      <div className="detail-header">
        <h1>{vehicle.make} {vehicle.model}</h1>
        <span className="detail-price">₹{vehicle.price_per_day}/day</span>
      </div>

      <div className="detail-gallery">
        <img
          src={vehicle.image_urls?.[0] || 'https://via.placeholder.com/800x500.png?text=No+Image'}
          alt={`${vehicle.make} ${vehicle.model}`}
          className="main-image"
        />
      </div>

      <div className="detail-specs">
        <h3>Key Details</h3>
        <ul>
          <li><strong>Year:</strong> {vehicle.year}</li>
          <li><strong>Type:</strong> {vehicle.vehicle_type}</li>
          <li><strong>Transmission:</strong> {vehicle.transmission}</li>
          <li><strong>Fuel:</strong> {vehicle.fuel_type}</li>
          <li><strong>Seats:</strong> {vehicle.seating_capacity}</li>
        </ul>
      </div>

      <div className="detail-booking-section">
          <button
            className="book-btn-large"
            onClick={handleBooking}
            disabled={bookingMutation.isPending}
          >
            {bookingMutation.isPending ? 'Booking...' : 'Book Now'}
          </button>
        </div>

      {/* --- REVIEWS SECTION --- */}
      <div className="detail-reviews">
        <h3>User Reviews</h3>
        {vehicle.reviews && vehicle.reviews.length > 0 ? (
          <ul className="review-list">
            {vehicle.reviews.map(review => (
              <li key={review.id} className="review-card">
                <strong>Rating: {review.rating}/5</strong>
                <p>"{review.comment}"</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No reviews yet for this vehicle.</p>
        )}
      </div>
    </div>
  );
}

export default VehicleDetail;