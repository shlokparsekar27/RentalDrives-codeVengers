// src/pages/Bikes.jsx
import { useState } from "react";
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGasPump, FaUsers, FaBolt, FaUserCircle, FaSearch, FaFilter, FaMotorcycle } from 'react-icons/fa';
import { GiGearStickPattern } from 'react-icons/gi';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';

// --- Data Fetching ---
const fetchVehicles = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles`);
  if (!response.ok) throw new Error('Network response was not ok');
  const data = await response.json();
  return data.filter(vehicle => vehicle.vehicle_type === 'Bike' && vehicle.status === 'approved');
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
    <Badge variant={variant} className="flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wider backdrop-blur-sm bg-opacity-80">
      {icon} {fuelType}
    </Badge>
  );
};

function Bikes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [fuelFilter, setFuelFilter] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: vehicles, isLoading, isError, error } = useQuery({
    queryKey: ['bikes'],
    queryFn: fetchVehicles,
  });

  const filteredVehicles = vehicles?.filter(vehicle => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(term) ||
      (vehicle.profiles?.full_name || '').toLowerCase().includes(term);

    const matchesFuel = fuelFilter ? vehicle.fuel_type === fuelFilter : true;
    return matchesSearch && matchesFuel;
  });

  if (isLoading) return <div className="min-h-[100dvh] pt-32 text-center font-mono animate-pulse text-muted-foreground flex items-center justify-center">LOADING FLEET DATA...</div>;
  if (isError) return <div className="min-h-[100dvh] pt-32 text-center text-destructive flex items-center justify-center">UNABLE TO CONNECT TO FLEET SERVER.</div>;

  return (
    <div className="bg-background min-h-[100dvh] font-sans pb-24 pt-20 md:pt-24 relative overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-96 bg-primary/5 rounded-bl-[100px] blur-3xl pointer-events-none -z-10"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header - Compact on mobile */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 animate-fade-in-up">
          <div>
            <Badge variant="outline" className="mb-2 border-primary/20 text-primary bg-primary/5">Two-Wheeler Fleet</Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              Select Your Bike
            </h1>
          </div>
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden flex items-center gap-2 text-sm font-bold text-primary p-3 bg-secondary rounded-xl w-full justify-center touch-target"
          >
            <FaFilter /> {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Search & Filter Bar - Sticky */}
        <div className={`
            bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl p-4 shadow-xl shadow-black/5 mb-8 sticky top-[70px] z-30 transition-all duration-300 animate-fade-in
            ${isFilterOpen ? 'block' : 'hidden md:block'}
        `}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <FaSearch className="absolute left-4 top-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search bike model or host..."
                className="w-full pl-11 pr-4 py-3 bg-secondary/50 text-foreground rounded-xl border border-transparent focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative md:min-w-[160px]">
              <select
                value={fuelFilter}
                onChange={(e) => setFuelFilter(e.target.value)}
                className="w-full appearance-none pl-4 pr-10 py-3 bg-secondary/50 text-foreground rounded-xl border border-transparent focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none cursor-pointer text-base transition-all"
              >
                <option value="">Any Fuel</option>
                <option value="Petrol">Petrol</option>
                <option value="Electric">Electric</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs font-bold">▼</div>
            </div>
          </div>
        </div>

        {/* Grid */}
        {filteredVehicles && filteredVehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-fade-in-up">
            {filteredVehicles.map((vehicle, idx) => (
              <div key={vehicle.id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-fade-in-up fill-mode-backwards">
                <Link to={`/vehicle/${vehicle.id}`} className="group block h-full">
                  <Card hover noPadding className="h-full flex flex-col overflow-hidden border-border/60 transition-all duration-500 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 bg-card">

                    {/* Image */}
                    <div className="relative h-56 md:h-64 overflow-hidden bg-secondary">
                      <img
                        src={vehicle.image_urls?.[0]}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity"></div>

                      <div className="absolute bottom-5 left-5 text-white z-10 w-full pr-10">
                        <h3 className="text-2xl font-bold tracking-tight leading-none shadow-black drop-shadow-md">{vehicle.make} {vehicle.model}</h3>
                        <div className="flex items-center gap-2 text-xs font-medium text-white/90 mt-2">
                          <FaUserCircle className="text-primary" />
                          <span>Hosted by {vehicle.profiles?.full_name?.split(' ')[0] || 'Verified Host'}</span>
                        </div>
                      </div>

                      <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur-md text-foreground px-3 py-1.5 rounded-lg text-sm font-mono font-bold shadow-lg border border-white/20">
                        ₹{vehicle.price_per_day}<span className="text-[10px] font-sans font-normal opacity-70">/day</span>
                      </div>

                      <div className="absolute top-4 left-4">
                        <FuelBadge fuelType={vehicle.fuel_type} />
                      </div>
                    </div>

                    {/* Specs */}
                    <div className="p-5 flex-grow bg-card flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col items-center justify-center p-2 bg-secondary/30 rounded-lg min-w-[60px]">
                          <GiGearStickPattern className="text-muted-foreground mb-1" />
                          <span className="text-[10px] font-bold uppercase text-foreground">{vehicle.transmission.slice(0, 4)}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 bg-secondary/30 rounded-lg min-w-[60px]">
                          <FaUsers className="text-muted-foreground mb-1" />
                          <span className="text-[10px] font-bold uppercase text-foreground">{vehicle.seating_capacity} Seats</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 bg-secondary/30 rounded-lg min-w-[60px]">
                          <FaGasPump className="text-muted-foreground mb-1" />
                          <span className="text-[10px] font-bold uppercase text-foreground">{vehicle.fuel_type}</span>
                        </div>
                      </div>

                      <Button variant="primary" fullWidth className="group-hover:translate-y-[-2px] transition-transform shadow-lg shadow-primary/20 font-bold h-12">
                        Check Availability
                      </Button>
                    </div>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border border-dashed border-border rounded-3xl bg-secondary/20 flex flex-col items-center animate-fade-in">
            <div className="bg-background p-4 rounded-full mb-4 ring-1 ring-border">
              <FaMotorcycle className="text-3xl text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No bikes found</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">We are adding more motorcycles to our fleet soon. Try clearing filters.</p>
            <Button variant="outline" className="mt-6 font-bold" onClick={() => { setSearchTerm(''); setFuelFilter(''); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Bikes;
