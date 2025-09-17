// src/pages/Cars.jsx
import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGasPump, FaUsers, FaBolt, FaUserCircle } from 'react-icons/fa';
import { GiGearStickPattern } from 'react-icons/gi';

// --- Data Fetching Functions ---
const fetchVehicles = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data.filter(vehicle => vehicle.vehicle_type === 'Car' && vehicle.status === 'approved');
};

// --- Helper component for dynamically rendering fuel icons and colors ---
const FuelInfo = ({ fuelType }) => {
  switch (fuelType) {
    case 'Electric':
      return (
        <span className="flex items-center text-green-600">
          <FaBolt className="mr-1.5" /> Electric
        </span>
      );
    case 'Diesel':
      return (
        <span className="flex items-center text-red-600">
          <FaGasPump className="mr-1.5" /> Diesel
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


function Cars() {
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [fuelFilter, setFuelFilter] = useState('');
  const [transmissionFilter, setTransmissionFilter] = useState('');

  const { data: vehicles, isLoading, isError, error } = useQuery({
    queryKey: ['cars'],
    queryFn: fetchVehicles,
  });

  const filteredVehicles = vehicles?.filter(vehicle => {
    // UPDATED: Search now includes the host's name
    const matchesSearch = 
      `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFuel = fuelFilter ? vehicle.fuel_type === fuelFilter : true;
    const matchesTransmission = transmissionFilter ? vehicle.transmission === transmissionFilter : true;
    return matchesSearch && matchesFuel && matchesTransmission;
  });

  if (isLoading) {
    return <div className="text-center p-10 font-bold text-xl">Loading Available Cars...</div>;
  }

  if (isError) {
    return <div className="text-center p-10 text-red-500"><h2>Error: {error.message}</h2></div>;
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-gray-900 mb-4 tracking-tight">
          Find Your Perfect Car
        </h2>
        <p className="text-center text-gray-600 mb-10 text-lg">Browse our curated selection of approved rental cars in Goa.</p>

        {/* --- Search and Filter Bar --- */}
        <div className="bg-white p-4 rounded-xl shadow-lg mb-10 flex flex-col md:flex-row gap-4 items-center sticky top-24 z-50">
          <input
            type="text"
            // UPDATED: Placeholder text is more descriptive
            placeholder="Search by vehicle or host name (e.g., 'Maruti' or 'John Doe')"
            className="w-full md:flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex w-full md:w-auto gap-4">
            <select value={fuelFilter} onChange={(e) => setFuelFilter(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
              <option value="">All Fuel Types</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
            </select>
            <select value={transmissionFilter} onChange={(e) => setTransmissionFilter(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50">
              <option value="">All Transmissions</option>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </select>
          </div>
        </div>

        {/* --- Vehicle Grid --- */}
        {filteredVehicles && filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {filteredVehicles.map((vehicle) => (
              <Link to={`/vehicle/${vehicle.id}`} key={vehicle.id} className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                <div className="overflow-hidden">
                  <img
                    src={vehicle.image_urls?.[0] || 'https://via.placeholder.com/400x250.png?text=No+Image'}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold text-gray-900 truncate">{vehicle.make} {vehicle.model}</h3>
                  
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <FaUserCircle className="mr-2" />
                    <span>Host : {vehicle.profiles?.full_name || 'A verified host'}</span>
                  </div>

                  <div className="flex items-center text-gray-600 mt-3 text-md font-medium space-x-4">
                    <FuelInfo fuelType={vehicle.fuel_type} />
                    <span className="flex items-center"><FaUsers className="mr-1.5" /> {vehicle.seating_capacity} Seats</span>
                    <span className="flex items-center"><GiGearStickPattern className="mr-1.5" /> {vehicle.transmission}</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600 mt-4">
                    ₹{vehicle.price_per_day}<span className="text-base font-medium text-gray-500">/day</span>
                  </p>
                  <div className="mt-auto pt-6">
                    <div
                      className="w-full text-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all transform hover:scale-105"
                    >
                      View Details
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl font-semibold text-gray-700">No cars match your criteria.</p>
            <p className="text-gray-500 mt-2">Please try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cars;