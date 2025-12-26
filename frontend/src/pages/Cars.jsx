// src/pages/Cars.jsx
import { useState, useMemo } from "react";
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBolt, FaGasPump, FaUsers, FaSearch, FaMapMarkedAlt, FaList, FaFilter, FaStar, FaLeaf, FaCarSide, FaChevronDown } from 'react-icons/fa';
import { GiGearStickPattern, GiSteeringWheel } from 'react-icons/gi';
import MapComponent from '../Components/MapComponent';

// --- API ---
const fetchVehicles = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles`);
  if (!response.ok) throw new Error('Network response was not ok');
  const data = await response.json();
  return data.filter(vehicle => vehicle.vehicle_type === 'Car' && vehicle.status === 'approved');
};

// --- Sub-Components ---
const FuelBadge = ({ type }) => {
  const styles = {
    Electric: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    Diesel: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    Petrol: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  };
  const Icons = { Electric: FaBolt, Diesel: FaGasPump, Petrol: FaGasPump };
  const Icon = Icons[type] || FaGasPump;

  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${styles[type] || styles.Petrol}`}>
      <Icon size={10} /> {type}
    </span>
  );
};

const FilterPill = ({ label, active, onClick, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 active-press ${active
        ? 'bg-slate-900 text-white shadow-lg dark:bg-white dark:text-slate-900 scale-105'
        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800'
      }`}
  >
    {Icon && <Icon className={active ? '' : 'text-slate-400'} />}
    {label}
  </button>
);

// --- Main Page ---
function Cars() {
  const [searchTerm, setSearchTerm] = useState('');
  const [fuelFilter, setFuelFilter] = useState('');
  const [transmissionFilter, setTransmissionFilter] = useState('');
  const [showMap, setShowMap] = useState(false);

  const { data: vehicles, isLoading, isError } = useQuery({
    queryKey: ['cars'],
    queryFn: fetchVehicles,
  });

  const filteredVehicles = useMemo(() => vehicles?.filter(vehicle => {
    const matchesSearch = `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFuel = fuelFilter ? vehicle.fuel_type === fuelFilter : true;
    const matchesTransmission = transmissionFilter ? vehicle.transmission === transmissionFilter : true;
    return matchesSearch && matchesFuel && matchesTransmission;
  }), [vehicles, searchTerm, fuelFilter, transmissionFilter]);

  if (isLoading) return <div className="min-h-screen pt-40 text-center font-display font-bold text-slate-500 animate-pulse">SYNCING FLEET DATA...</div>;
  if (isError) return <div className="min-h-screen pt-40 text-center font-display font-bold text-red-500">SYSTEM ERROR: RETRY</div>;

  return (
    <div className="bg-slate-50 dark:bg-[#020617] min-h-screen font-sans transition-colors duration-500 pb-24">

      {/* 
        Header Section with Abstract Glow 
      */}
      <div className="relative pt-28 pb-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none animate-blob"></div>
        <div className="container-responsive relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full mb-2 animate-fade-in-up">
                Premium Collection
              </span>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 dark:text-white leading-[1.1] animate-fade-in-up stagger-1">
                Find your perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Drive.</span>
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-lg animate-fade-in-up stagger-2">
                Browse {filteredVehicles?.length || 0} verified cars available for instant booking in Goa.
              </p>
            </div>

            {/* View Toggle */}
            <div className="animate-fade-in-up stagger-3 hidden lg:block">
              <div className="p-1 bg-slate-200 dark:bg-slate-800 rounded-full flex gap-1">
                <button onClick={() => setShowMap(false)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!showMap ? 'bg-white shadow-md text-slate-900 dark:bg-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}`}>
                  <FaList className="inline mr-2" /> List
                </button>
                <button onClick={() => setShowMap(true)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${showMap ? 'bg-white shadow-md text-slate-900 dark:bg-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'}`}>
                  <FaMapMarkedAlt className="inline mr-2" /> Map
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 
        Sticky Control Bar 
      */}
      <div className="sticky top-20 z-30 transition-all duration-300 pointer-events-none">
        <div className="container-responsive pointer-events-auto">
          <div className="glass rounded-2xl p-4 flex flex-col lg:flex-row gap-4 items-center justify-between animate-scale-in">

            {/* Search */}
            <div className="relative w-full lg:w-96 group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by model (e.g. Swift, Thar)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-xl py-3 pl-11 pr-4 font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Rapid Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 w-full lg:w-auto scrollbar-hide">
              <FilterPill label="All" active={!transmissionFilter} onClick={() => setTransmissionFilter('')} />
              <FilterPill label="Automatic" icon={GiGearStickPattern} active={transmissionFilter === 'Automatic'} onClick={() => setTransmissionFilter('Automatic')} />
              <FilterPill label="Manual" icon={GiSteeringWheel} active={transmissionFilter === 'Manual'} onClick={() => setTransmissionFilter('Manual')} />
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-2 self-center hidden sm:block"></div>
              <FilterPill label="Petrol" active={fuelFilter === 'Petrol'} onClick={() => setFuelFilter(fuelFilter === 'Petrol' ? '' : 'Petrol')} />
              <FilterPill label="Diesel" active={fuelFilter === 'Diesel'} onClick={() => setFuelFilter(fuelFilter === 'Diesel' ? '' : 'Diesel')} />
              <FilterPill label="Electric" icon={FaLeaf} active={fuelFilter === 'Electric'} onClick={() => setFuelFilter(fuelFilter === 'Electric' ? '' : 'Electric')} />
            </div>

          </div>
        </div>
      </div>

      {/* 
        Main Content Grid 
      */}
      <div className="container-responsive mt-8">
        <div className="flex gap-8 relative">

          {/* List View */}
          <div className={`flex-1 transition-all duration-500 ease-in-out ${showMap ? 'lg:w-[55%]' : 'w-full'}`}>

            {filteredVehicles && filteredVehicles.length > 0 ? (
              <div className={`grid grid-cols-1 ${showMap ? 'xl:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3'} gap-8`}>
                {filteredVehicles.map((vehicle, index) => (
                  <Link to={`/vehicle/${vehicle.id}`} key={vehicle.id} className="group h-full perspective-1000">
                    <div
                      className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full flex flex-col relative animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Image Window */}
                      <div className="relative aspect-[4/3] overflow-hidden bg-slate-200 dark:bg-slate-800">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>
                        <img
                          src={vehicle.image_urls?.[0]}
                          alt={vehicle.model}
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                        />

                        {/* Floating Price Tag */}
                        <div className="absolute top-4 right-4 z-20 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
                          <div className="flex flex-col items-end leading-none">
                            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">₹{vehicle.price_per_day}</span>
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Per Day</span>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                          <FuelBadge type={vehicle.fuel_type} />
                          {vehicle.is_certified && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                              Verified
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 flex flex-col flex-grow relative bg-white dark:bg-slate-900">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {vehicle.make} {vehicle.model}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              Hosted by {vehicle.profiles?.full_name}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                            <FaStar className="text-amber-400 text-xs" />
                            <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300">4.9</span>
                          </div>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 gap-3 mt-4 mb-6">
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                            <GiGearStickPattern className="text-slate-400 text-sm" /> {vehicle.transmission}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                            <FaUsers className="text-slate-400 text-sm" /> {vehicle.seating_capacity} Seats
                          </div>
                        </div>

                        {/* Action Footer */}
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">Instant Book</span>
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            <FaCarSide />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-400">
                  <FaSearch size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No matches found</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>

          {/* Sticky Map - Desktop */}
          <div className={`hidden lg:block transition-all duration-500 ease-in-out ${showMap ? 'w-[45%] opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-20 overflow-hidden'}`}>
            <div className="sticky top-40 h-[calc(100vh-160px)] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
              {showMap && <MapComponent vehicles={filteredVehicles} />}
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Map Toggle FAB */}
      <div className="lg:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-40 animate-fade-in-up">
        <button
          onClick={() => setShowMap(!showMap)}
          className="glass px-6 py-3 rounded-full font-bold text-slate-900 dark:text-white shadow-2xl flex items-center gap-2 active:scale-95 transition-transform"
        >
          {showMap ? <FaList /> : <FaMapMarkedAlt />}
          {showMap ? 'Show List' : 'Show Map'}
        </button>
      </div>

      {/* Mobile Map Overlay */}
      {showMap && (
        <div className="lg:hidden fixed inset-0 z-30 pt-20 bg-slate-50 dark:bg-slate-950 animate-fade-in-up">
          <MapComponent vehicles={filteredVehicles} />
        </div>
      )}

    </div>
  );
}

export default Cars;