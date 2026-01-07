// src/pages/VehicleDetail.jsx
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaGasPump, FaCogs, FaChair, FaCalendarAlt, FaShieldAlt, FaStar, FaChevronRight, FaMapMarkerAlt, FaCheckCircle, FaInfoCircle, FaCarSide, FaLeaf, FaRoad } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Badge from '../Components/ui/Badge';
import Card from '../Components/ui/Card';

// --- API Fetch ---
const fetchVehicle = async (id) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles/${id}`);
  if (!response.ok) throw new Error('Vehicle not found');
  return response.json();
};

const fetchVehicleBookings = async (id) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles/${id}/bookings`);
  if (!response.ok) throw new Error('Failed to fetch bookings');
  return response.json();
};

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Booking State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Query
  const { data: vehicle, isLoading, isError } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => fetchVehicle(id),
  });

  const { data: existingBookings } = useQuery({
    queryKey: ['vehicleBookings', id],
    queryFn: () => fetchVehicleBookings(id),
    enabled: !!id,
  });

  if (isLoading) return <div className="min-h-[100dvh] pt-32 text-center font-mono animate-pulse text-muted-foreground flex items-center justify-center">INITIALIZING ASSET DATA...</div>;
  if (isError) return <div className="min-h-[100dvh] pt-32 text-center text-destructive flex items-center justify-center">Asset unavailable or has been delisted.</div>;

  // --- Financial Logic ---
  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays * vehicle.price_per_day : 0;
  };

  const totalCost = calculateTotal();
  const days = totalCost / vehicle.price_per_day;

  // --- Availability Logic ---
  const checkAvailability = () => {
    if (!startDate || !endDate || !existingBookings) return true;
    const userStart = new Date(startDate);
    const userEnd = new Date(endDate);

    // Check if start date is before end date
    if (userStart > userEnd) return false;

    return !existingBookings.some(booking => {
      const bookingStart = new Date(booking.start_date);
      const bookingEnd = new Date(booking.end_date);
      return (userStart <= bookingEnd && userEnd >= bookingStart);
    });
  };

  const isAvailable = checkAvailability();
  const dateError = startDate && endDate && new Date(startDate) > new Date(endDate); // Basic validation

  // --- Ratings & Trips Calculation ---
  const reviews = vehicle.reviews || [];
  const validReviews = reviews.filter(r => r.rating > 0);
  const avgRating = validReviews.length > 0 ? (validReviews.reduce((sum, r) => sum + r.rating, 0) / validReviews.length).toFixed(1) : null;
  const tripsCount = vehicle.bookings_count || 0; // Assuming backend returns bookings_count or we calculate from array if available. If not, default to 0.

  const handleBookingHelper = () => {
    if (!user) {
      navigate('/login', { state: { from: `/vehicle/${id}` } });
      return;
    }
    navigate('/booking-summary', {
      state: {
        vehicle,
        startDate,
        endDate,
        totalPrice: totalCost
      }
    });
  };

  return (
    <div className="bg-background min-h-[100dvh] pb-32 pt-20 md:pt-24 font-sans selection:bg-primary/20">

      {/* Breadcrumbs - Hidden on small mobile to save space, visible on sm+ */}
      <div className="container mx-auto px-4 lg:px-8 mb-6 hidden sm:block animate-fade-in">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider backdrop-blur-sm p-2 rounded-lg inline-flex">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <FaChevronRight size={10} className="opacity-50" />
          <Link to="/cars" className="hover:text-primary transition-colors">Fleet</Link>
          <FaChevronRight size={10} className="opacity-50" />
          <span className="text-foreground font-bold">{vehicle.make} {vehicle.model}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* LEFT COLUMN: Visuals & Specs (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-8 animate-fade-in-up">

            {/* Immersive Hero Image */}
            <div className="relative aspect-[16/10] sm:aspect-[21/9] w-full bg-secondary rounded-3xl overflow-hidden border border-border shadow-2xl shadow-black/5 group">
              <img
                src={vehicle.image_urls?.[0]}
                alt={vehicle.model}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />

              {/* Image Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {vehicle.is_certified && (
                  <Badge variant="success" className="bg-emerald-500/90 text-white border-0 backdrop-blur-md shadow-lg flex items-center gap-1.5 px-3 py-1.5">
                    <FaCheckCircle className="text-white" /> Verified Listing
                  </Badge>
                )}
                {vehicle.fuel_type === 'Electric' && (
                  <Badge variant="success" className="bg-blue-500/90 text-white border-0 backdrop-blur-md shadow-lg flex items-center gap-1.5 px-3 py-1.5">
                    <FaLeaf /> Zero Emissions
                  </Badge>
                )}
              </div>

              {/* Mobile Title Overlay (Only visible on smallest screens inside image) */}
              <div className="absolute bottom-5 left-5 right-5 text-white lg:hidden">
                <h1 className="text-3xl font-bold leading-none shadow-black drop-shadow-md">{vehicle.make} {vehicle.model}</h1>
                <p className="text-white/80 font-mono text-sm mt-1">{vehicle.year} Edition</p>
              </div>
            </div>

            {/* Desktop Title Header */}
            <div className="hidden lg:flex justify-between items-end border-b border-border pb-6">
              <div>
                <h1 className="text-4xl font-bold text-foreground tracking-tight">{vehicle.make} {vehicle.model}</h1>
                <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-sm bg-secondary/50 px-2 py-0.5 rounded text-foreground font-medium"><FaCarSide size={12} /> {vehicle.year}</span>
                  <span className="text-xs">•</span>
                  <span className="flex items-center gap-1.5 text-sm bg-secondary/50 px-2 py-0.5 rounded text-foreground font-medium"><FaRoad size={12} /> Unlimited KMs</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Pricing</p>
                <p className="text-3xl font-bold font-mono-numbers text-primary">₹{vehicle.price_per_day}<span className="text-lg text-muted-foreground font-sans font-medium"> / day</span></p>
              </div>
            </div>

            {/* Premium Spec Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SpecCard icon={FaGasPump} label="Fuel Source" value={vehicle.fuel_type} />
              <SpecCard icon={FaCogs} label="Transmission" value={vehicle.transmission} />
              <SpecCard icon={FaChair} label="Seating" value={`${vehicle.seating_capacity} Adults`} />
              <SpecCard icon={FaCalendarAlt} label="Model Year" value={vehicle.year} />
            </div>

            {/* Content Tabs / Description */}
            <div className="bg-card rounded-2xl p-6 md:p-8 border border-border shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaInfoCircle className="text-primary" /> Vehicle Overview
              </h3>
              <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                {vehicle.description || `Experience the ultimate freedom of Goa with this pristine ${vehicle.year} ${vehicle.make} ${vehicle.model}. Meticulously maintained and serviced by our certified host, this vehicle offers the perfect blend of performance and comfort for coastal drives.`}
              </p>
            </div>

            {/* Host Card */}
            <div className="flex items-center justify-between p-6 rounded-2xl border border-border bg-gradient-to-r from-secondary/50 to-transparent">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
                    {vehicle.profiles?.full_name?.charAt(0) || 'H'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[10px] p-1 rounded-full border-2 border-background">
                    <FaCheckCircle />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Vehicle Hosted By</p>
                  <h4 className="font-bold text-lg text-foreground">{vehicle.profiles?.full_name || 'Verified Partner'}</h4>
                  {avgRating ? (
                    <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-0.5"><FaStar className="mb-0.5" /> {avgRating} Host Rating ({reviews.length} reviews)</p>
                  ) : (
                    <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-0.5"><FaCheckCircle className="mb-0.5" /> Verified Host</p>
                  )}
                </div>
              </div>
              <Button to={`/users/${vehicle.profiles?.id}`} variant="outline" size="sm" className="hidden sm:flex">View Profile</Button>
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Booking Widget (lg:col-span-4) */}
          <div className="lg:col-span-4 hidden lg:block animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <div className="sticky top-[100px]">
              <Card className="shadow-2xl shadow-primary/5 border border-primary/10 overflow-hidden relative backdrop-blur-sm bg-card/90">
                {/* Header */}
                <div className="bg-gradient-to-br from-primary/5 to-transparent p-6 border-b border-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Rate</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-foreground font-mono-numbers tracking-tight">₹{vehicle.price_per_day}</span>
                        <span className="text-sm text-muted-foreground font-medium">/ day</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      {avgRating ? (
                        <div className="flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm mb-1">
                          <FaStar className="text-[10px]" /> {avgRating}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-primary text-white px-2 py-1 rounded-md text-xs font-bold shadow-sm mb-1">
                          No Rating
                        </div>
                      )}

                      <span className="text-[10px] text-muted-foreground underline decoration-dotted">{tripsCount > 0 ? `${tripsCount} Trips` : 'No trips yet'}</span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                  {/* Date Inputs */}
                  <div className="space-y-4 bg-secondary/30 p-4 rounded-xl border border-border/50">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="relative group cursor-pointer" onClick={(e) => e.currentTarget.querySelector('input').showPicker()}>
                        <label className="absolute -top-2.5 left-3 bg-card px-1 text-[10px] font-bold text-primary uppercase tracking-wider z-10 transition-colors group-focus-within:text-foreground pointer-events-none">Pickup Date</label>
                        <input
                          type="date"
                          className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:[color-scheme:dark] cursor-pointer"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="relative group cursor-pointer" onClick={(e) => e.currentTarget.querySelector('input').showPicker()}>
                        <label className="absolute -top-2.5 left-3 bg-card px-1 text-[10px] font-bold text-primary uppercase tracking-wider z-10 transition-colors group-focus-within:text-foreground pointer-events-none">Drop-off Date</label>
                        <input
                          type="date"
                          className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all dark:[color-scheme:dark] cursor-pointer"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          min={startDate || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Accordion */}
                  {totalCost > 0 ? (
                    <div className="bg-secondary/20 rounded-xl p-4 border border-border/50 space-y-3 animate-fade-in-up">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span className="font-medium">₹{vehicle.price_per_day} x {days} days</span>
                        <span className="font-mono-numbers">₹{totalCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span className="font-medium">Platform Fee (2%)</span>
                        <span className="font-mono-numbers">₹{(totalCost * 0.02).toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-foreground pt-3 border-t border-border border-dashed">
                        <span>Total</span>
                        <span className="font-mono-numbers text-primary">₹{(totalCost * 1.02).toLocaleString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-xs text-muted-foreground italic py-2 opacity-60">
                      Select dates to see price breakdown
                    </div>
                  )}

                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    disabled={!startDate || !endDate || totalCost <= 0 || !isAvailable || dateError}
                    onClick={handleBookingHelper}
                    className={`shadow-xl shadow-primary/20 font-bold h-12 text-base transition-transform active:scale-[0.98] ${!isAvailable ? 'opacity-50 cursor-not-allowed bg-destructive hover:bg-destructive' : ''}`}
                  >
                    {!startDate
                      ? 'Check Availability'
                      : !isAvailable
                        ? 'Vehicle Not Available'
                        : 'Review Booking'}
                  </Button>

                  <div className="flex flex-col gap-2 pt-2">
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase text-muted-foreground tracking-wider opacity-70">
                      <FaShieldAlt className="text-emerald-500" /> Secure SSL Payment
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground/60 leading-tight">
                      You won't be charged yet. Free cancellation up to 24h before trip.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

        </div>
      </div>

      {/* MOBILE: Sticky Bottom Bar (Financial Grade with Safe Area) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 pb-safe bg-background/95 backdrop-blur-xl border-t border-border z-50 shadow-[0_-5px_30px_rgba(0,0,0,0.1)] transition-transform duration-300">

        {/* Date Selection for Mobile (Collapsible logic) */}
        <div className="grid grid-cols-2 gap-3 mb-3 animate-fade-in">
          <div className="relative group cursor-pointer" onClick={(e) => e.currentTarget.querySelector('input').showPicker()}>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 ml-1 pointer-events-none">Pickup Date</p>
            <input type="date" className="w-full p-2.5 bg-secondary rounded-xl text-xs font-bold border-none focus:ring-1 focus:ring-primary dark:[color-scheme:dark] cursor-pointer" value={startDate} onChange={e => setStartDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="relative group cursor-pointer" onClick={(e) => e.currentTarget.querySelector('input').showPicker()}>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1 ml-1 pointer-events-none">Drop-off Date</p>
            <input type="date" className="w-full p-2.5 bg-secondary rounded-xl text-xs font-bold border-none focus:ring-1 focus:ring-primary dark:[color-scheme:dark] cursor-pointer" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            {totalCost > 0 && (
              isAvailable ? (
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5 animate-pulse">Available</p>
              ) : (
                <p className="text-[10px] font-bold text-destructive uppercase tracking-wider mb-0.5">Not Available</p>
              )
            )}
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono-numbers text-foreground truncate">
                {totalCost > 0 ? `₹${(totalCost * 1.02).toLocaleString()}` : `₹${vehicle.price_per_day}`}
              </span>
              <span className="text-xs text-muted-foreground font-medium truncate">
                {totalCost > 0 ? 'total' : '/ day'}
              </span>
            </div>
          </div>
          <Button
            onClick={totalCost > 0 && isAvailable ? handleBookingHelper : () => { }}
            variant="primary"
            size="lg"
            className={`px-6 shadow-xl shadow-primary/25 flex-1 h-12 text-base font-bold ${!isAvailable ? 'opacity-50 cursor-not-allowed bg-destructive hover:bg-destructive' : ''}`}
            disabled={!startDate || !endDate || !isAvailable || dateError}
          >
            {totalCost > 0
              ? (!isAvailable ? 'Not Available' : 'Book Now')
              : 'Select Dates'}
          </Button>
        </div>
      </div>

    </div>
  );
};

// Helper for specs used in the page
const SpecCard = ({ icon: Icon, label, value, highlight }) => (
  <div className={`p-4 md:p-5 rounded-2xl flex flex-col items-start transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${highlight ? 'bg-primary/5 border border-primary/20' : 'bg-card border border-border hover:border-primary/30'}`}>
    <div className={`p-2.5 rounded-xl mb-3 ${highlight ? 'bg-primary/10 text-primary' : 'bg-secondary text-foreground'}`}>
      <Icon className="text-lg" />
    </div>
    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 opacity-80">{label}</span>
    <span className={`text-sm md:text-base font-bold truncate w-full ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</span>
  </div>
);

export default VehicleDetail;
