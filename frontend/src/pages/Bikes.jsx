// src/pages/Bikes.jsx
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createBooking } from '../api/bookings';
import { FaGasPump, FaUsers, FaBolt } from 'react-icons/fa'; // Using react-icons for better UI

// --- Data Fetching Functions ---
const fetchVehicles = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data.filter(vehicle => vehicle.vehicle_type === 'Bike' && vehicle.status === 'approved');
};

// --- NEW: Helper component for dynamically rendering fuel icons and colors ---
const FuelInfo = ({ fuelType }) => {
  switch (fuelType) {
    case 'Electric':
      return (
        <span className="flex items-center text-green-600">
          <FaBolt className="mr-1.5" /> Electric
        </span>
      );
    case 'Petrol':
    default:
      return (
        <span className="flex items-center text-yellow-600">
          <FaGasPump className="mr-1.5" /> Petrol
        </span>
      );
  }
};

function Bikes() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [fuelFilter, setFuelFilter] = useState('');

  const { data: vehicles, isLoading, isError, error } = useQuery({
    queryKey: ['bikes'],
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
      const startDate = new Date().toISOString();
      const endDate = new Date(new Date().setDate(new Date().getDate() + 2)).toISOString();
      const totalPrice = vehicle.price_per_day * 2;
      bookingMutation.mutate({ vehicle, user, startDate, endDate, totalPrice });
    }
  };

  const filteredVehicles = vehicles?.filter(vehicle => {
    const matchesSearch = `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFuel = fuelFilter ? vehicle.fuel_type === fuelFilter : true;
    return matchesSearch && matchesFuel;
  });

  if (isLoading) {
    return <div className="text-center p-10 font-bold text-xl">Loading Available Bikes...</div>;
  }

  if (isError) {
    return <div className="text-center p-10 text-red-500"><h2>Error: {error.message}</h2></div>;
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-gray-900 mb-4 tracking-tight">
          Find Your Perfect Bike
        </h2>
        <p className="text-center text-gray-600 mb-10 text-lg">Explore Goa's scenic routes on one of our quality bikes.</p>

        {/* --- Search and Filter Bar --- */}
        <div className="bg-white p-4 rounded-xl shadow-lg mb-10 flex flex-col md:flex-row gap-4 items-center sticky top-24 z-50">
          <input
            type="text"
            placeholder="Search by make or model (e.g., 'Royal Enfield')"
            className="w-full md:flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex w-full md:w-auto gap-4">
            <select value={fuelFilter} onChange={(e) => setFuelFilter(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
              <option value="">All Fuel Types</option>
              <option value="Petrol">Petrol</option>
              <option value="Electric">Electric</option>
            </select>
          </div>
        </div>

        {/* --- Vehicle Grid --- */}
        {filteredVehicles && filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <Link to={`/vehicle/${vehicle.id}`} className="block overflow-hidden">
                  <img
                    src={vehicle.image_urls?.[0] || 'https://via.placeholder.com/400x250.png?text=No+Image'}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                </Link>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-gray-900 truncate">{vehicle.make} {vehicle.model}</h3>
                  <div className="flex items-center text-gray-600 mt-2 text-md font-medium">
                    {/* REPLACED: Using the new FuelInfo component */}
                    <FuelInfo fuelType={vehicle.fuel_type} />
                    <span className="mx-2">|</span>
                    <span className="flex items-center"><FaUsers className="mr-1.5" /> {vehicle.seating_capacity} Seat(s)</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600 mt-4">
                    ₹{vehicle.price_per_day}<span className="text-base font-medium text-gray-500">/day</span>
                  </p>
                  <div className="mt-auto pt-6">
                    <button
                      onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleBooking(vehicle);
                      }}
                      disabled={bookingMutation.isPending}
                      className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all disabled:bg-gray-400 transform hover:scale-105"
                    >
                      {bookingMutation.isPending ? 'Booking...' : 'Book Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl font-semibold text-gray-700">No bikes match your criteria.</p>
            <p className="text-gray-500 mt-2">Please try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Bikes;