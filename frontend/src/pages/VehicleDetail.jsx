// src/pages/VehicleDetail.jsx
import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FaGasPump, FaUsers, FaBolt, FaStar, FaRegStar, FaMapMarkerAlt, FaShippingFast, FaCheckCircle, FaExclamationCircle, FaShieldAlt } from 'react-icons/fa';
import { GiGearStickPattern } from 'react-icons/gi';
import { BsCalendar, BsTagFill } from 'react-icons/bs';
import TermsPopup from '../Components/TermsPopup';

// --- Data Fetching ---
const fetchVehicleById = async (vehicleId) => {
  const { data, error } = await supabase
    .from('vehicles')
    .select(`
      *, 
      is_certified, 
      profiles ( full_name, address, is_verified ),
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


// --- Helper Components ---
const FuelInfo = ({ fuelType }) => {
  switch (fuelType) {
    case 'Electric':
      return <FaBolt size={24} className="text-green-600" />;
    case 'Diesel':
      return <FaGasPump size={24} className="text-red-600" />;
    case 'Petrol':
    default:
      return <FaGasPump size={24} className="text-yellow-600" />;
  }
};

const SpecItem = ({ icon, label, value }) => (
  <div className="bg-gray-100 p-4 rounded-lg flex items-center">
    <div className="text-blue-600 mr-4">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-bold text-gray-800">{value}</p>
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

  const [useCustomPickup, setUseCustomPickup] = useState(false);
  const [pickupLocation, setPickupLocation] = useState('');
  const [useCustomDropoff, setUseCustomDropoff] = useState(false);
  const [dropoffLocation, setDropoffLocation] = useState('');

  const [showTerms, setShowTerms] = useState(false);

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

      setDateConflictError(isConflict ? 'The selected dates are unavailable. Please choose a different range.' : '');
    } else {
      setDateConflictError('');
    }
  }, [startDate, endDate, bookedDates]);

  const reviewCount = vehicle?.reviews?.length || 0;
  const averageRating = reviewCount > 0
    ? vehicle.reviews.reduce((acc, review) => acc + review.rating, 0) / reviewCount
    : 0;

  const totalPrice = useMemo(() => {
    if (startDate && endDate && vehicle) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) return 0;

      const diffTime = end.getTime() - start.getTime();
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 0) {
        diffDays = 1;
      }

      let total = diffDays * vehicle.price_per_day;

      if (useCustomPickup && vehicle.pickup_available) {
        total += vehicle.pickup_charge;
      }
      if (useCustomDropoff && vehicle.dropoff_available) {
        total += vehicle.dropoff_charge;
      }

      return total;
    }
    return 0;
  }, [startDate, endDate, vehicle, useCustomPickup, useCustomDropoff]);

  const handleBooking = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!startDate || !endDate || totalPrice <= 0) {
      alert('Please select a valid date range.');
      return;
    }
    if (dateConflictError) {
      alert(dateConflictError);
      return;
    }
    if (useCustomPickup && !pickupLocation.trim()) {
      alert('Please enter a custom pickup location.');
      return;
    }
    if (useCustomDropoff && !dropoffLocation.trim()) {
      alert('Please enter a custom drop-off location.');
      return;
    }
    setShowTerms(true);
  };

  const confirmBooking = () => {
    setShowTerms(false);
    navigate("/booking-summary", {
    state: {
      vehicle,
      startDate,
      endDate,
      totalPrice,
      pickupLocation: useCustomPickup ? pickupLocation : null,
      dropoffLocation: useCustomDropoff ? dropoffLocation : null
    },
    });
  };

  if (isLoading) return <div className="text-center p-10 font-bold text-xl">Loading...</div>;
  if (isError) return <div className="text-center p-10 text-red-500"><h2>Error: {error.message}</h2></div>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          <div className="lg:col-span-3">
            <div className="mb-8 shadow-2xl rounded-2xl overflow-hidden">
              <img src={vehicle.image_urls?.[0]} alt={`${vehicle.make} ${vehicle.model}`} className="w-full h-auto object-cover" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <SpecItem icon={<BsCalendar size={24} />} label="Year" value={vehicle.year} />
              <SpecItem icon={<FaUsers size={24} />} label="Seats" value={vehicle.seating_capacity} />
              <SpecItem icon={<GiGearStickPattern size={24} />} label="Transmission" value={vehicle.transmission} />
              <SpecItem icon={<BsTagFill size={24} />} label="Type" value={vehicle.vehicle_type} />
              <SpecItem icon={<FuelInfo fuelType={vehicle.fuel_type} />} label="Fuel" value={vehicle.fuel_type} />
            </div>

            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Pickup & Drop-off</h3>
              <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-gray-500 mr-4 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Default Location</p>
                    <p className="text-gray-600">{vehicle.profiles?.address || 'Address not provided by host.'}</p>
                  </div>
                </div>

                {vehicle.pickup_available && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center">
                      <input type="checkbox" id="useCustomPickup" checked={useCustomPickup} onChange={(e) => setUseCustomPickup(e.target.checked)} className="h-5 w-5 text-blue-600 border-gray-300 rounded" />
                      <label htmlFor="useCustomPickup" className="ml-3 font-medium text-gray-800">Custom Pickup Location (Charge: ₹{vehicle.pickup_charge})</label>
                    </div>
                    {useCustomPickup && (
                      <div className="mt-2 pl-8">
                        <input type="text" value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value)} placeholder="Enter custom pickup address" className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                        <p className="text-xs text-gray-500 mt-1">Additional charges may apply based on distance.</p>
                      </div>
                    )}
                  </div>
                )}

                {vehicle.dropoff_available && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center">
                      <input type="checkbox" id="useCustomDropoff" checked={useCustomDropoff} onChange={(e) => setUseCustomDropoff(e.target.checked)} className="h-5 w-5 text-blue-600 border-gray-300 rounded" />
                      <label htmlFor="useCustomDropoff" className="ml-3 font-medium text-gray-800">Custom Drop-off Location (Charge: ₹{vehicle.dropoff_charge})</label>
                    </div>
                    {useCustomDropoff && (
                      <div className="mt-2 pl-8">
                        <input type="text" value={dropoffLocation} onChange={(e) => setDropoffLocation(e.target.value)} placeholder="Enter custom drop-off address" className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                        <p className="text-xs text-gray-500 mt-1">Additional charges may apply based on distance.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-extrabold text-gray-900">{vehicle.make} {vehicle.model}</h1>
                    {/* --- NEW: Certified Badge --- */}
                    {vehicle.is_certified && (
                        <span className="flex items-center text-blue-600 font-semibold bg-blue-100 px-2.5 py-1 rounded-full text-sm">
                            <FaShieldAlt className="mr-1.5" /> Certified
                        </span>
                    )}
                </div>
              <div className="mt-2 text-md text-gray-600">
                <div className="flex items-center">
                  <span>Hosted by <span className="font-semibold text-blue-600">{vehicle.profiles?.full_name}</span></span>
                  {vehicle.profiles?.is_verified && <span className="ml-2 flex items-center text-green-600 font-semibold bg-green-100 px-2 py-0.5 rounded-full text-xs"><FaCheckCircle className="mr-1" /> Verified</span>}
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {reviewCount > 0 ? (
                  <>
                    <div className="flex items-center text-yellow-500">{[...Array(5)].map((_, i) => i < Math.round(averageRating) ? <FaStar key={i} /> : <FaRegStar key={i} />)}</div>
                    <span className="ml-2 text-gray-600 font-semibold">{averageRating.toFixed(1)}</span>
                    <Link to={`/vehicle/${id}/reviews`} className="ml-3 text-blue-600 hover:underline text-sm font-medium">({reviewCount} reviews)</Link>
                  </>
                ) : (<p className="text-sm text-gray-500">No reviews yet.</p>)}
              </div>

              <p className="text-2xl font-bold text-blue-600 mt-4">₹{vehicle.price_per_day} <span className="text-base font-medium text-gray-500">/day</span></p>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Your Dates</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input type="date" id="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                  </div>
                  <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">End Date</label>
                    <input type="date" id="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate || new Date().toISOString().split("T")[0]} className="mt-1 w-full p-2 border border-gray-300 rounded-md" />
                  </div>
                </div>
                {dateConflictError && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-start"><FaExclamationCircle className="mr-2 mt-1 flex-shrink-0" /><p className="text-sm font-semibold">{dateConflictError}</p></div>}
              </div>

              {totalPrice > 0 && (
                <div className="mt-6 bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-gray-600">Total Price:</p>
                  <p className="text-2xl font-bold text-blue-700">₹{totalPrice}</p>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={!startDate || !endDate || totalPrice <= 0 || !!dateConflictError}
                className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Review Booking
              </button>

              {showTerms && (
              <TermsPopup
                onAccept={confirmBooking}
                onDecline={() => setShowTerms(false)} 
              />
            )}

            </div>
          </div>
        </div>

        <div className="mt-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">Availability</h3>
          {isLoadingBookedDates ? (<p>Loading calendar...</p>) : bookedDates && bookedDates.length > 0 ? (
            <div className="bg-white p-6 rounded-xl shadow-md">
              <p className="font-semibold mb-3">This vehicle is already booked on:</p>
              <ul className="space-y-2">{bookedDates.map((b, i) => (<li key={i} className="p-2 bg-red-50 text-red-800 rounded-md">From <strong>{new Date(b.start_date).toLocaleDateString()}</strong> to <strong>{new Date(b.end_date).toLocaleDateString()}</strong></li>))}</ul>
            </div>
          ) : (<div className="bg-green-50 text-green-800 p-6 rounded-xl shadow-md"><p className="font-semibold">This vehicle is currently available!</p></div>)}
        </div>
      </div>
    </div>
  );
}

export default VehicleDetail;
