// src/pages/Scooters.jsx
import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGasPump, FaUsers, FaBolt, FaUserCircle, FaSearch, FaFilter } from 'react-icons/fa';
import { GiGearStickPattern } from 'react-icons/gi';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';

// --- Data Fetching ---
const fetchVehicles = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles`);
  if (!response.ok) throw new Error('Network response was not ok');
  const data = await response.json();
  return data.filter(vehicle => vehicle.vehicle_type === 'Scooter' && vehicle.status === 'approved');
};

const FuelBadge = ({ fuelType }) => {
  let variant = 'neutral';
  let icon = <FaGasPump className="mr-1" />;
  if (fuelType === 'Electric') {
    variant = 'success';
    icon = <FaBolt className="mr-1" />;
  } else if (fuelType === 'Diesel') {
    variant = 'destructive';
  }
  return (
    <Badge variant={variant} className="flex items-center px-2 py-0.5">
      {icon} {fuelType}
    </Badge>
  );
};

function Scooters() {
  const [searchTerm, setSearchTerm] = useState('');
  const [fuelFilter, setFuelFilter] = useState('');
  const [transmissionFilter, setTransmissionFilter] = useState('');

  const { data: vehicles, isLoading, isError, error } = useQuery({
    queryKey: ['scooters'],
    queryFn: fetchVehicles,
  });

  const filteredVehicles = vehicles?.filter(vehicle => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(term) ||
      (vehicle.profiles?.full_name || '').toLowerCase().includes(term);

    const matchesFuel = fuelFilter ? vehicle.fuel_type === fuelFilter : true;
    const matchesTransmission = transmissionFilter ? vehicle.transmission === transmissionFilter : true;
    return matchesSearch && matchesFuel && matchesTransmission;
  });

  if (isLoading) return <div className="min-h-screen pt-32 text-center font-mono animate-pulse text-muted-foreground">SYNCING FLEET DATA...</div>;
  if (isError) return <div className="min-h-screen pt-32 text-center text-destructive">UNABLE TO CONNECT TO FLEET SERVER.</div>;

  return (
    <div className="bg-background min-h-screen font-sans pb-24 pt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="outline" className="mb-4">Urban Mobility</Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
            City Scooters
          </h1>
          <p className="text-muted-foreground text-lg">
            Zip around Goa's narrow streets with ease. Perfect for quick hops.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm mb-12 sticky top-20 z-30 transition-shadow duration-300 hover:shadow-md">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-3 top-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search scooter model or host..."
                className="w-full pl-10 pr-4 py-3 bg-secondary text-foreground rounded-xl border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <div className="relative min-w-[140px]">
                <select
                  value={fuelFilter}
                  onChange={(e) => setFuelFilter(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-3 bg-secondary text-foreground rounded-xl border-transparent focus:bg-background outline-none cursor-pointer"
                >
                  <option value="">Any Fuel</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Electric">Electric</option>
                </select>
                <FaFilter className="absolute right-3 top-3.5 text-muted-foreground pointer-events-none" size={12} />
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        {filteredVehicles && filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVehicles.map((vehicle) => (
              <Link to={`/vehicle/${vehicle.id}`} key={vehicle.id} className="group">
                <Card hover noPadding className="h-full flex flex-col overflow-hidden border-border/50 transition-all duration-500 hover:border-primary/30">

                  {/* Image */}
                  <div className="relative h-64 overflow-hidden bg-secondary">
                    <img
                      src={vehicle.image_urls?.[0]}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold tracking-tight">{vehicle.make} {vehicle.model}</h3>
                      <div className="flex items-center gap-2 text-xs text-white/80 mt-1">
                        <FaUserCircle /> {vehicle.profiles?.full_name || 'Verified Host'}
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-black px-3 py-1.5 rounded-lg text-sm font-mono font-bold shadow-lg">
                      ₹{vehicle.price_per_day}
                    </div>
                  </div>

                  {/* Specs */}
                  <div className="p-5 flex-grow bg-card">
                    <div className="flex justify-between items-center mb-4">
                      <FuelBadge fuelType={vehicle.fuel_type} />
                      <div className="flex gap-3 text-xs font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1"><FaUsers /> {vehicle.seating_capacity}</span>
                        <span className="flex items-center gap-1"><GiGearStickPattern /> {vehicle.transmission}</span>
                      </div>
                    </div>

                    <Button variant="primary" fullWidth className="group-hover:bg-primary/90 transition-all">
                      Book Now
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-dashed border-border rounded-3xl bg-secondary/20">
            <h3 className="text-xl font-bold text-foreground">No scooters found</h3>
            <p className="text-muted-foreground mt-2">Adjust filters to find available rides.</p>
            <Button variant="outline" className="mt-6" onClick={() => { setSearchTerm(''); setFuelFilter(''); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Scooters;
