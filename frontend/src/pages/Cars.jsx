// src/pages/Cars.jsx
import "./Vehicles.css";
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth

// --- Data Fetching Functions ---
const fetchVehicles = async () => {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('status', 'approved')
    .eq('vehicle_type', 'Car');

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


function Cars() {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get the current user

  const { data: vehicles, isLoading, isError, error } = useQuery({
    queryKey: ['cars'],
    queryFn: fetchVehicles,
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

  const handleBooking = (vehicle) => {
    if (!user) {
      navigate('/login');
    } else {
      // Stop the link navigation when the button is clicked
      event.stopPropagation(); 
      event.preventDefault();
      bookingMutation.mutate({ vehicle, user });
    }
  };

  if (isLoading) { /* ... loading state ... */ }
  if (isError) { /* ... error state ... */ }

  return (
    <div className="vehicles-container">
      <h2>Available Cars 🚗</h2>
      {vehicles && vehicles.length > 0 ? (
        <ul className="vehicle-list">
          {vehicles.map((vehicle) => (
            <Link to={`/vehicle/${vehicle.id}`} key={vehicle.id} className="vehicle-card-link">
              <li className="vehicle-card">
                <img
                  src={vehicle.image_urls?.[0] || 'https://via.placeholder.com/300x180.png?text=No+Image'}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="vehicle-image"
                />
                <div className="vehicle-info">
                  <strong>{vehicle.make} {vehicle.model}</strong>
                  <span>₹{vehicle.price_per_day}/day</span>
                  <span>{vehicle.fuel_type} | Seats: {vehicle.seating_capacity}</span>
                </div>
                <button 
                  className="book-btn" 
                  onClick={(event) => handleBooking(vehicle, event)}
                  disabled={bookingMutation.isPending}
                >
                  {bookingMutation.isPending ? 'Booking...' : 'Book Now'}
                </button>
              </li>
            </Link>
          ))}
        </ul>
      ) : (
        <p>No cars are available at the moment. Please check back later!</p>
      )}
    </div>
  );
}

export default Cars;