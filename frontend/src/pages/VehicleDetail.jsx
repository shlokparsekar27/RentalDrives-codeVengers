import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaGasPump, FaCogs, FaChair, FaCalendarAlt, FaShieldAlt, FaStar, FaChevronRight, FaMapMarkerAlt, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Badge from '../Components/ui/Badge';
import Card from '../Components/ui/Card';

// --- API Fetch ---
const fetchVehicle = async (id) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles/${id}`);
  if (!response.ok) throw new Error('Vehicle not found');
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

  if (isLoading) return <div className="min-h-screen pt-32 text-center font-mono animate-pulse text-muted-foreground">LOADING ASSET DATA...</div>;
  if (isError) return <div className="min-h-screen pt-32 text-center text-destructive">Asset unavailable or removed.</div>;

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
    <div className="bg-background min-h-screen pb-32 pt-24 font-sans">

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 lg:px-8 mb-6">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <FaChevronRight size={10} />
          <Link to="/cars" className="hover:text-primary transition-colors">Fleet</Link>
          <FaChevronRight size={10} />
          <span className="text-foreground">{vehicle.make} {vehicle.model}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* LEFT COLUMN: Visuals & Specs (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-8">

            {/* Hero Image Group */}
            <div className="space-y-4">
              <div className="aspect-[16/9] w-full bg-secondary rounded-2xl overflow-hidden border border-border relative group shadow-sm">
                <img
                  src={vehicle.image_urls?.[0]}
                  alt={vehicle.model}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {vehicle.is_certified && <Badge variant="success" className="bg-white/90 backdrop-blur-md shadow-sm">Verified Chassis</Badge>}
                  {vehicle.fuel_type === 'Electric' && <Badge variant="success" className="bg-white/90 backdrop-blur-md shadow-sm">EV / Green</Badge>}
                </div>
              </div>
              {/* Thumbnails (If strictly needed, placeholders for now to keep it minimal) */}
            </div>

            {/* Quick Specs Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SpecCard icon={FaGasPump} label="Fuel Type" value={vehicle.fuel_type} />
              <SpecCard icon={FaCogs} label="Gearbox" value={vehicle.transmission} />
              <SpecCard icon={FaChair} label="Capacity" value={`${vehicle.seating_capacity} Persons`} />
              <SpecCard icon={FaShieldAlt} label="Insurance" value="Comprehensive" />
            </div>

            {/* Description */}
            <div className="border-t border-border pt-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                About this Vehicle
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {vehicle.description || `Experience the power of the ${vehicle.year} ${vehicle.make} ${vehicle.model}. maintained to the highest standards by our verified host. Perfect for Goa's ${vehicle.vehicle_type === 'Scooter' ? 'narrow streets' : 'coastal highways'}.`}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {['Bluetooth', 'Rear Camera', 'Air Conditioning', 'Fastag'].map(feature => (
                  <span key={feature} className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full border border-border">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Host Info */}
            <Card className="flex items-center gap-4 bg-secondary/30">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {vehicle.profiles?.full_name?.charAt(0) || 'H'}
              </div>
              <div>
                <h4 className="font-bold text-foreground">Hosted by {vehicle.profiles?.full_name || 'Verified Partner'}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <FaCheckCircle className="text-emerald-500" />
                  <span>Identity Verified</span>
                  <span>•</span>
                  <span>Response time: &lt; 1 hr</span>
                </div>
              </div>
            </Card>

          </div>

          {/* RIGHT COLUMN: Sticky Booking Widget (lg:col-span-4) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <Card className="shadow-lg border-primary/10 overflow-hidden relative">
                {/* Header */}
                <div className="bg-secondary/50 p-6 border-b border-border">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Daily Rate</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-foreground font-mono-numbers">₹{vehicle.price_per_day}</span>
                        <span className="text-sm text-muted-foreground">/day</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2 py-1 rounded text-xs font-bold">
                      <FaStar /> 4.9 (28)
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase">Pickup</label>
                        <div className="relative">
                          <FaCalendarAlt className="absolute left-3 top-3 text-muted-foreground" />
                          <input
                            type="date"
                            className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-md text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase">Dropoff</label>
                        <div className="relative">
                          <FaCalendarAlt className="absolute left-3 top-3 text-muted-foreground" />
                          <input
                            type="date"
                            className="w-full pl-9 pr-3 py-2 bg-background border border-input rounded-md text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-all"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate || new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                    </div>

                    {totalCost > 0 && (
                      <div className="pt-4 border-t border-border space-y-2 animate-accordion-down">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>₹{vehicle.price_per_day} x {days} days</span>
                          <span className="font-mono-numbers">₹{totalCost.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Platform Fee (2%)</span>
                          <span className="font-mono-numbers">₹{(totalCost * 0.02).toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border border-dashed">
                          <span>Total</span>
                          <span className="font-mono-numbers">₹{(totalCost * 1.02).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    disabled={!startDate || !endDate || totalCost <= 0}
                    onClick={handleBookingHelper}
                    className="shadow-xl shadow-primary/20 font-bold"
                  >
                    {!startDate ? 'Select Dates' : 'Proceed to Checkout'}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <FaShieldAlt className="text-emerald-500" />
                    <span>Secure transaction via Razorpay</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>

        </div>
      </div>

      {/* MOBILE: Sticky Bottom Bar (Financial Grade) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border z-40 safe-area-pb">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Est.</p>
            <p className="text-xl font-bold font-mono-numbers text-foreground">
              {totalCost > 0 ? `₹${(totalCost * 1.02).toLocaleString()}` : `₹${vehicle.price_per_day}/day`}
            </p>
          </div>
          <Button
            onClick={totalCost > 0 ? handleBookingHelper : () => window.scrollTo({ top: 0, behavior: 'smooth' })}
            variant="primary"
            size="lg"
            className="px-8 shadow-lg shadow-primary/20"
          >
            {totalCost > 0 ? 'Reserve' : 'Check Avail'}
          </Button>
        </div>
      </div>

    </div>
  );
};

// Helper for specs used in the page
const SpecCard = ({ icon: Icon, label, value }) => (
  <div className="p-4 bg-secondary/20 border border-border rounded-xl flex flex-col items-center text-center hover:bg-secondary/40 transition-colors">
    <Icon className="text-2xl text-primary mb-2 opacity-80" />
    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{label}</span>
    <span className="text-sm font-semibold text-foreground line-clamp-1">{value}</span>
  </div>
);

export default VehicleDetail;
