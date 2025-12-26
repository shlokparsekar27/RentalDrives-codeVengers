// src/pages/Scooters.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGasPump, FaUsers, FaBolt, FaUserCircle, FaSearch, FaFilter, FaStar, FaMapMarkedAlt, FaList, FaAngleDown } from 'react-icons/fa';
import { GiGearStickPattern } from 'react-icons/gi';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';
import Button from '../Components/ui/Button';
import MapComponent from '../Components/MapComponent';

// --- Data Fetching Functions ---
const fetchVehicles = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data.filter(vehicle => vehicle.vehicle_type === 'Scooter' && vehicle.status === 'approved');
};

const FuelIcon = ({ type }) => {
  switch (type) {
    case 'Electric': return <FaBolt className="text-emerald-500" />;
    case 'Petrol': return <FaGasPump className="text-amber-500" />;
    default: return <FaGasPump className="text-amber-500" />;
  }
};

function Scooters() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [fuelFilter, setFuelFilter] = useState('');
  const [showMap, setShowMap] = useState(false);

  const { data: vehicles, isLoading, isError, error } = useQuery({
    queryKey: ['scooters'],
    queryFn: fetchVehicles,
  });

  const filteredVehicles = vehicles?.filter(vehicle => {
    const matchesSearch = `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFuel = fuelFilter ? vehicle.fuel_type === fuelFilter : true;
    return matchesSearch && matchesFuel;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 pt-32 text-center text-slate-500 font-medium">
        Loading Inventory...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 pt-32 text-center text-red-500 font-bold">
        Error loading scooters. Please try again.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen pt-12 pb-24 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* 
           Header Section - Professional Layout 
        */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              Scooters
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
              {filteredVehicles?.length || 0} city-friendly scooters available for booking.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            {/* Search Bar - High Contrast */}
            <div className="relative flex-grow sm:w-80 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by model (e.g. Activa)..."
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 placeholder-slate-500 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all shadow-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Desktop Map Toggle */}
            <button
              onClick={() => setShowMap(!showMap)}
              className="hidden lg:flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg hover:opacity-90 font-bold transition-all shadow-sm"
            >
              {showMap ? <><FaList /> List</> : <><FaMapMarkedAlt /> Map</>}
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8 relative">

          {/* Sidebar Filters */}
          <div className={`w-full lg:w-64 flex-shrink-0 lg:block ${showMap ? 'hidden xl:block' : ''}`}>
            <div className="lg:sticky lg:top-24 space-y-8">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <FaFilter className="text-slate-900 dark:text-white" />
                  <span className="font-bold text-slate-900 dark:text-white">Filters</span>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Fuel Type</label>
                    <div className="relative">
                      <select
                        value={fuelFilter}
                        onChange={(e) => setFuelFilter(e.target.value)}
                        className="w-full appearance-none p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
                      >
                        <option value="">All Fuel Types</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Electric">Electric</option>
                      </select>
                      <FaAngleDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="flex gap-6">

              {/* List View */}
              <div className={`flex-1 transition-all duration-300 ${showMap ? 'lg:w-[55%]' : 'w-full'}`}>

                {/* Mobile Inline Map */}
                {showMap && (
                  <div className="lg:hidden h-[400px] mb-8 rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 relative z-0">
                    <MapComponent vehicles={filteredVehicles} />
                  </div>
                )}

                {filteredVehicles && filteredVehicles.length > 0 ? (
                  <div className={`grid grid-cols-1 ${showMap ? 'lg:grid-cols-1 xl:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3'} gap-6`}>
                    {filteredVehicles.map((vehicle) => (
                      <Link to={`/vehicle/${vehicle.id}`} key={vehicle.id} className="group block h-full">
                        <Card className="h-full flex flex-col border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:shadow-black/40 transition-all duration-300" padding="p-0">

                          {/* Image Area - Clean */}
                          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800">
                            <img
                              src={vehicle.image_urls?.[0] || 'https://via.placeholder.com/400x250.png?text=No+Image'}
                              alt={`${vehicle.make} ${vehicle.model}`}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />

                            {/* Top Badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
                              {vehicle.is_certified && (
                                <span className="px-2.5 py-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-[10px] font-bold uppercase tracking-wide text-slate-900 dark:text-white rounded shadow-sm border border-slate-200 dark:border-slate-700">Verified</span>
                              )}
                              {vehicle.fuel_type === 'Electric' && (
                                <span className="px-2.5 py-1 bg-emerald-500/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wide text-white rounded shadow-sm">Electric</span>
                              )}
                            </div>

                            {/* Rating Badge */}
                            <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-900 dark:text-white shadow-sm flex items-center border border-slate-200 dark:border-slate-700">
                              <FaStar className="text-amber-400 mr-1.5" /> 4.8
                            </div>
                          </div>

                          {/* Content Area */}
                          <div className="p-5 flex flex-col flex-grow">
                            <div className="mb-4">
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight font-display">
                                {vehicle.make} {vehicle.model}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hosted by {vehicle.profiles?.full_name}</p>
                            </div>

                            {/* Specs Row */}
                            <div className="flex items-center gap-4 mb-5 text-slate-600 dark:text-slate-400 text-xs font-medium">
                              <div className="flex items-center gap-1.5">
                                <FuelIcon type={vehicle.fuel_type} /> {vehicle.fuel_type}
                              </div>
                              <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                              <div className="flex items-center gap-1.5">
                                <FaUsers className="text-slate-400 text-sm" /> {vehicle.seating_capacity} Seat(s)
                              </div>
                            </div>

                            <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                              <div>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">₹{vehicle.price_per_day}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">/ day</span>
                              </div>
                              <span className="text-blue-600 dark:text-blue-400 text-sm font-bold group-hover:underline">View Details</span>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-16 text-center">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400 shadow-sm">
                      <FaSearch size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">No scooters found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">We couldn't find any matches for your current filters.</p>
                    <button
                      onClick={() => { setSearchTerm(''); setFuelFilter(''); }}
                      className="mt-6 text-blue-600 font-bold text-sm hover:underline"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop Sticky Map */}
              {showMap && (
                <div className="hidden lg:block w-[45%] flex-shrink-0">
                  <div className="sticky top-24 h-[calc(100vh-140px)] rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
                    <MapComponent vehicles={filteredVehicles} />
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Floating Toggle for Mobile */}
      <div className="lg:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-2xl hover:scale-105 transition-transform font-bold"
        >
          {showMap ? <><FaList /> List View</> : <><FaMapMarkedAlt /> Map View</>}
        </button>
      </div>
    </div>
  );
}

export default Scooters;
