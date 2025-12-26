// src/pages/VehicleDetail.jsx
import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FaGasPump, FaUsers, FaBolt, FaStar, FaRegStar, FaMapMarkerAlt, FaCheckCircle, FaShieldAlt, FaCalendarAlt, FaUser, FaInfoCircle, FaLock } from 'react-icons/fa';
import { GiGearStickPattern } from 'react-icons/gi';
import { BsCalendar, BsTagFill } from 'react-icons/bs';
import Button from '../Components/ui/Button';
import Badge from '../Components/ui/Badge';
import Card from '../Components/ui/Card';
import TermsPopup from '../Components/TermsPopup';

// --- Data Fetching ---
const fetchVehicleById = async (vehicleId) => {
  const { data, error } = await supabase
    .from('vehicles')
    .select(`
      *, 
      is_certified, 
      profiles ( full_name, address, is_verified, role ),
      reviews ( *, profiles ( full_name ) )
    `)
    .eq('id', vehicleId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

const fetchBookedDates = async (vehicleId) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles/${vehicleId}/booked-dates`);
  if (!response.ok) {
    throw new Error('Could not fetch booked dates.');
  }
  return response.json();
};

const SpecItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
    <div className="text-slate-400 dark:text-slate-500 text-xl">{icon}</div>
    <div>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{label}</p>
      <p className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5">{value}</p>
    </div>
  </div>
);

function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateConflictError, setDateConflictError] = useState('');
  const [showTerms, setShowTerms] = useState(false);

  // Custom location state
  const [useCustomPickup, setUseCustomPickup] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');
  const [useCustomDropoff, setUseCustomDropoff] = useState(false);
  const [dropoffLocation, setDropoffLocation] = useState('');

  const { data: vehicle, isLoading, isError, error } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => fetchVehicleById(id),
  });

  const { data: bookedDates, isLoading: isLoadingBookedDates } = useQuery({
    queryKey: ['bookedDates', id],
    queryFn: () => fetchBookedDates(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (startDate && endDate && bookedDates) {
      const selectedStart = new Date(startDate);
      const selectedEnd = new Date(endDate);
      selectedStart.setHours(0, 0, 0, 0);
      selectedEnd.setHours(0, 0, 0, 0);

      const isConflict = bookedDates.some(booking => {
        const bookedStart = new Date(booking.start_date);
        const bookedEnd = new Date(booking.end_date);
        bookedStart.setHours(0, 0, 0, 0);
        bookedEnd.setHours(0, 0, 0, 0);
        return selectedStart <= bookedEnd && selectedEnd >= bookedStart;
      });

      setDateConflictError(isConflict ? 'Unavailable for selected dates.' : '');
    } else {
      setDateConflictError('');
    }
  }, [startDate, endDate, bookedDates]);

  const totalPrice = useMemo(() => {
    if (startDate && endDate && vehicle) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) return 0;
      const diffDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

      let total = diffDays * vehicle.price_per_day;
      if (useCustomPickup && vehicle.pickup_available) total += vehicle.pickup_charge;
      if (useCustomDropoff && vehicle.dropoff_available) total += vehicle.dropoff_charge;
      return total;
    }
    return 0;
  }, [startDate, endDate, vehicle, useCustomPickup, useCustomDropoff]);

  const handleBooking = () => {
    if (!user) return navigate('/login');
    if (!startDate || !endDate || totalPrice <= 0) return alert('Please select a valid date range.');
    if (dateConflictError) return alert(dateConflictError);
    if (useCustomPickup && !pickupLocation.trim()) return alert('Please enter a custom pickup location.');
    if (useCustomDropoff && !dropoffLocation.trim()) return alert('Please enter a custom drop-off location.');
    setShowTerms(true);
  };

  const confirmBooking = () => {
    setShowTerms(false);
    navigate("/booking-summary", {
      state: { vehicle, startDate, endDate, totalPrice, pickupLocation, dropoffLocation },
    });
  };

  if (isLoading) return <div className="min-h-screen pt-32 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 font-medium">Loading details...</div>;
  if (isError) return <div className="min-h-screen pt-32 text-center text-red-500 bg-slate-50 dark:bg-slate-950 font-medium">Error: {error.message}</div>;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-24 transition-colors duration-300">

      {/* 
         🖼️ Hero Gallery (Immersive)
      */}
      <div className="h-[50vh] min-h-[400px] w-full bg-slate-900 relative">
        <img
          src={vehicle.image_urls?.[0]}
          alt={vehicle.model}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90" />

        <div className="absolute bottom-0 left-0 w-full p-6 md:pb-12 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2 mb-4">
              {vehicle.is_certified && (
                <Badge variant="success" className="bg-green-500 text-white border-none"><FaShieldAlt className="mr-1.5" /> Certified</Badge>
              )}
              {vehicle.fuel_type === 'Electric' && (
                <Badge variant="info" className="bg-blue-500 text-white border-none"><FaBolt className="mr-1.5" /> Electric</Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-2 shadow-sm">
              {vehicle.make} {vehicle.model}
            </h1>
            <div className="flex items-center text-slate-300 text-sm md:text-base font-medium">
              <FaMapMarkerAlt className="mr-2" />
              {vehicle.profiles?.address || "Goa, India"}
              <span className="mx-3 text-slate-500">•</span>
              <span className="text-white">Professional Host</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 block">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* 
               📝 Left Column: Details (Width 8/12)
            */}
          <div className="lg:col-span-8 space-y-8">

            {/* Specs Grid */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-xs">Vehicle Specifications</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <SpecItem icon={<BsCalendar />} label="Year" value={vehicle.year} />
                <SpecItem icon={<FaUsers />} label="Capacity" value={`${vehicle.seating_capacity} Seats`} />
                <SpecItem icon={<GiGearStickPattern />} label="Transmission" value={vehicle.transmission} />
                <SpecItem icon={<BsTagFill />} label="Category" value={vehicle.vehicle_type} />
                <SpecItem icon={<FaGasPump />} label="Fuel Type" value={vehicle.fuel_type} />
                <SpecItem icon={<FaCheckCircle />} label="Condition" value="Excellent" />
              </div>
            </div>

            {/* Description / Host Info */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-xs">About this Vehicle</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                This {vehicle.make} {vehicle.model} is maintained to the highest standards. Perfect for navigating Goa's scenic roads.
                Includes comprehensive insurance and 24/7 roadside assistance support.
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
                  <FaUser className="text-xl" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Hosted by {vehicle.profiles?.full_name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {vehicle.profiles?.is_verified && (
                      <span className="inline-flex items-center text-green-600 dark:text-green-500 text-xs font-bold uppercase tracking-wide">
                        <FaCheckCircle className="mr-1.5" /> Identity Verified
                      </span>
                    )}
                    <span className="text-slate-300 dark:text-slate-600 text-xs">•</span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">Member since 2024</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Logistics */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-xs">Pickup & Locations</h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">Base Location</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-slate-400" />
                    {vehicle.profiles?.address || "Address provided after booking"}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {vehicle.pickup_available && (
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={useCustomPickup} onChange={(e) => setUseCustomPickup(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300" />
                        <span className="text-slate-700 dark:text-slate-300 font-semibold text-sm">Request Custom Pickup (+₹{vehicle.pickup_charge})</span>
                      </label>
                      {useCustomPickup && (
                        <input type="text" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} placeholder="Enter pickup address, e.g. Airport" className="mt-3 w-full text-sm p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" />
                      )}
                    </div>
                  )}

                  {vehicle.dropoff_available && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={useCustomDropoff} onChange={(e) => setUseCustomDropoff(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300" />
                        <span className="text-slate-700 dark:text-slate-300 font-semibold text-sm">Request Custom Drop-off (+₹{vehicle.dropoff_charge})</span>
                      </label>
                      {useCustomDropoff && (
                        <input type="text" value={dropoffLocation} onChange={(e) => setDropoffLocation(e.target.value)} placeholder="Enter drop-off address" className="mt-3 w-full text-sm p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* 
               💰 Right Column: Sticky Booking Widget (Width 4/12)
            */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">

              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-slate-800 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-bold text-slate-900 dark:text-white font-display">₹{vehicle.price_per_day}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-sm font-medium"> / day</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold text-sm">
                      <FaStar className="text-amber-500" /> 4.8
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Date Inputs - Financial Style */}
                  <div className="grid grid-cols-2 gap-0 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <div className="p-3 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Check-in</label>
                      <input type="date" min={new Date().toISOString().split("T")[0]} value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full text-sm font-medium bg-transparent border-none p-0 text-slate-900 dark:text-white focus:ring-0" />
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900">
                      <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Check-out</label>
                      <input type="date" min={startDate || new Date().toISOString().split("T")[0]} value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full text-sm font-medium bg-transparent border-none p-0 text-slate-900 dark:text-white focus:ring-0" />
                    </div>
                  </div>

                  {dateConflictError && (
                    <div className="flex items-center text-red-600 dark:text-red-400 text-xs font-semibold bg-red-50 dark:bg-red-900/10 p-3 rounded-lg">
                      <FaInfoCircle className="mr-2" /> {dateConflictError}
                    </div>
                  )}

                  {/* Invoice Breakdown */}
                  {totalPrice > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                        <span>₹{vehicle.price_per_day} x {(totalPrice - (useCustomPickup ? vehicle.pickup_charge : 0) - (useCustomDropoff ? vehicle.dropoff_charge : 0)) / vehicle.price_per_day} days</span>
                        <span>₹{totalPrice - (useCustomPickup ? vehicle.pickup_charge : 0) - (useCustomDropoff ? vehicle.dropoff_charge : 0)}</span>
                      </div>
                      {useCustomPickup && (
                        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                          <span>Pickup Service</span>
                          <span>₹{vehicle.pickup_charge}</span>
                        </div>
                      )}
                      {useCustomDropoff && (
                        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                          <span>Drop-off Service</span>
                          <span>₹{vehicle.dropoff_charge}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-green-600 dark:text-green-500 font-medium">
                        <span>Platform Fee</span>
                        <span>₹0 (Waived)</span>
                      </div>
                      <div className="pt-3 mt-1 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <span className="font-bold text-slate-900 dark:text-white">Total</span>
                        <span className="font-bold text-lg text-slate-900 dark:text-white">₹{totalPrice}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleBooking}
                    disabled={!startDate || !endDate || totalPrice <= 0 || !!dateConflictError}
                    className="w-full h-12 text-base font-bold shadow-lg shadow-blue-600/20"
                    size="lg"
                    variant="primary"
                  >
                    Reserve
                  </Button>

                  <div className="flex justify-center text-xs text-slate-400 dark:text-slate-500 font-medium items-center gap-1.5">
                    <FaLock className="text-slate-300" /> Secure SSL Encryption
                  </div>
                </div>
              </div>

              {/* Trust Box */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                    <FaShieldAlt />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">RentalDrives Guarantee</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Every booking includes free cancellation up to 24 hours before pickup. Your payment is protected until you get the keys.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {showTerms && <TermsPopup onAccept={confirmBooking} onDecline={() => setShowTerms(false)} />}
    </div>
  );
}

export default VehicleDetail;
