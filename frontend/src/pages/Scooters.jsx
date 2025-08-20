// src/pages/Scooters.jsx
import { useState } from 'react';
import "./Vehicles.css";
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createBooking } from '../api/bookings';

// --- Data Fetching Functions ---
const fetchVehicles = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  // Filter for scooters on the frontend
  return data.filter(vehicle => vehicle.vehicle_type === 'Scooter' && vehicle.status === 'approved');
};

function Scooters() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // --- State for search and filters ---
  const [searchTerm, setSearchTerm] = useState('');
  const [fuelFilter, setFuelFilter] = useState('');

  const { data: vehicles, isLoading, isError, error } = useQuery({
    queryKey: ['scooters'],
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
      bookingMutation.mutate({ vehicle, user });
    }
  };

  // --- Filtered vehicles logic ---
  const filteredVehicles = vehicles?.filter(vehicle => {
    const matchesSearch = `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFuel = fuelFilter ? vehicle.fuel_type === fuelFilter : true;
    return matchesSearch && matchesFuel;
  });

  if (isLoading) {
    return <div className="vehicles-container"><h2>Loading Scooters...</h2></div>;
  }

  if (isError) {
    return <div className="vehicles-container"><h2>Error: {error.message}</h2></div>;
  }

  return (
    <div className="vehicles-container">
      <h2>Available Scooters 🛵</h2>

      {/* --- Search and Filter Bar --- */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by make or model..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="filters">
          <select value={fuelFilter} onChange={(e) => setFuelFilter(e.target.value)}>
            <option value="">All Fuel Types</option>
            <option value="Petrol">Petrol</option>
            <option value="Electric">Electric</option>
          </select>
        </div>
      </div>

      {filteredVehicles && filteredVehicles.length > 0 ? (
        <ul className="vehicle-list">
          {filteredVehicles.map((vehicle) => (
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
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleBooking(vehicle);
                  }}
                  disabled={bookingMutation.isPending}
                >
                  {bookingMutation.isPending ? 'Booking...' : 'Book Now'}
                </button>
              </li>
            </Link>
          ))}
        </ul>
      ) : (
        <p>No scooters match your criteria. Please try different filters.</p>
      )}
    </div>
  );
}

export default Scooters;