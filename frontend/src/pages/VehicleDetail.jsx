// src/pages/VehicleDetail.jsx
import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { createBooking ,openRazorpayCheckout } from '../api/bookings';
import { FaGasPump, FaUsers, FaBolt, FaStar, FaRegStar, FaUserCircle } from 'react-icons/fa';
import { GiGearStickPattern } from 'react-icons/gi';
import { BsCalendar, BsTagFill } from 'react-icons/bs';
import TermsPopup from '../Components/TermsPopup';


// --- Data Fetching ---
// UPDATED: This query now only fetches the rating from reviews to keep it fast.
const fetchVehicleById = async (vehicleId) => {
  const { data, error } = await supabase
    .from('vehicles')
    .select(`*, profiles ( full_name ), reviews ( rating )`) // Only fetch the rating
    .eq('id', vehicleId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// This function to fetch booked dates remains the same.
const fetchBookedDates = async (vehicleId) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles/${vehicleId}/booked-dates`);
  if (!response.ok) {
    throw new Error('Could not fetch booked dates.');
  }
  return response.json();
};


// --- Helper Components ---
const FuelInfo = ({ fuelType, className = '' }) => {
  // This component now only returns the icon with its specific color.
  // The color class here will override the default blue from SpecItem.
  switch (fuelType) {
    case 'Electric':
      return <FaBolt className={`text-green-600 ${className}`} size={24} />;
    case 'Diesel':
      return <FaGasPump className={`text-red-600 ${className}`} size={24} />;
    case 'Petrol':
    default:
      return <FaGasPump className={`text-yellow-600 ${className}`} size={24} />;
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

  const [showTerms, setShowTerms] = useState(false);
  // const [pendingBooking, setPendingBooking] = useState(null);

  const { data: vehicle, isLoading, isError, error } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => fetchVehicleById(id),
  });

  // MOVED a few lines down: Calculate review average and count AFTER vehicle data is fetched.
  const reviewCount = vehicle?.reviews?.length || 0;
  const averageRating = reviewCount > 0
      ? vehicle.reviews.reduce((acc, review) => acc + review.rating, 0) / reviewCount
      : 0;

  const { data: bookedDates, isLoading: isLoadingBookedDates } = useQuery({
    queryKey: ['bookedDates', id],
    queryFn: () => fetchBookedDates(id),
    enabled: !!id,
  });


  const totalPrice = useMemo(() => {
    if (startDate && endDate && vehicle) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) return 0;
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays * vehicle.price_per_day;
    }
    return 0;
  }, [startDate, endDate, vehicle]);

   
const bookingMutation = useMutation({
  mutationFn: createBooking,
  onSuccess: (data) => {
    openRazorpayCheckout({ data, vehicle, user, navigate });
  },
  onError: (err) => {
    alert(`Booking failed: ${err.message}`);
  },
});

  const handleBooking = async () => {
  if (!user) {
    navigate('/login');
    return;
  }

  if (!startDate || !endDate || totalPrice <= 0) {
    alert("Please select valid dates.");
    return;
  }
  setShowTerms(true);
  };
/*  setPendingBooking({
      vehicle,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      totalPrice,
    });
    setShowTerms(true);
  };
  */
    const confirmBooking = () => {
    setShowTerms(false);
    bookingMutation.mutate({
      vehicle,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      totalPrice,
    });
  };

 
    

  if (isLoading) {
    return <div className="text-center p-10 font-bold text-xl">Loading Vehicle Details...</div>;
  }

  if (isError) {
    return <div className="text-center p-10 text-red-500"><h2>Error: {error.message}</h2></div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          
          <div className="lg:col-span-3">
            <div className="mb-8 shadow-2xl rounded-2xl overflow-hidden">
              <img
                src={vehicle.image_urls?.[0] || 'https://via.placeholder.com/800x500.png?text=No+Image'}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-auto object-cover"
              />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <SpecItem icon={<BsCalendar size={24} />} label="Year" value={vehicle.year} />
                <SpecItem icon={<FaUsers size={24} />} label="Seats" value={vehicle.seating_capacity} />
                <SpecItem icon={<GiGearStickPattern size={24} />} label="Transmission" value={vehicle.transmission} />
                <SpecItem icon={<BsTagFill size={24} />} label="Type" value={vehicle.vehicle_type} />
                <SpecItem icon={<FuelInfo fuelType={vehicle.fuel_type} />} label="Fuel" value={vehicle.fuel_type} />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-24 bg-white p-6 rounded-2xl shadow-lg">
              <h1 className="text-3xl font-extrabold text-gray-900">{vehicle.make} {vehicle.model}</h1>
              <p className="text-md text-gray-600 mt-1">Hosted by <span className="font-semibold text-blue-600">{vehicle.profiles?.full_name || 'A verified host'}</span></p>

              <div className="mt-4 flex items-center">
                {reviewCount > 0 ? (
                  <>
                    <div className="flex items-center text-yellow-500">
                      {[...Array(5)].map((_, i) => i < Math.round(averageRating) ? <FaStar key={i} /> : <FaRegStar key={i} />)}
                    </div>
                    <span className="ml-2 text-gray-600 font-semibold">{averageRating.toFixed(1)}</span>
                    <Link to={`/vehicle/${id}/reviews`} className="ml-3 text-blue-600 hover:underline text-sm font-medium">
                      ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No reviews yet.</p>
                )}
              </div>

              <p className="text-2xl font-bold text-blue-600 mt-4">
                ₹{vehicle.price_per_day} <span className="text-base font-medium text-gray-500">/day</span>
              </p>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Select Your Dates</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input type="date" id="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                  </div>
                  <div>
                    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">End Date</label>
                    <input type="date" id="end-date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate || new Date().toISOString().split("T")[0]} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                  </div>
                </div>
              </div>

              {totalPrice > 0 && (
                <div className="mt-6 bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-gray-600">Total Price:</p>
                  <p className="text-2xl font-bold text-blue-700">₹{totalPrice}</p>
                </div>
              )}

             <button
              onClick={handleBooking}
              disabled={bookingMutation.isPending || !startDate || !endDate || totalPrice <= 0}
              className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all disabled:bg-gray-400"
            >
              {bookingMutation.isPending ? 'Booking...' : 'Book Now'}
            </button>

             {/* ✅ Show popup if required */}
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
            {isLoadingBookedDates ? (
                <p className="text-gray-600">Loading availability calendar...</p>
            ) : bookedDates && bookedDates.length > 0 ? (
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <p className="font-semibold text-gray-800 mb-3">This vehicle is already booked on the following dates:</p>
                    <ul className="space-y-2">
                        {bookedDates.map((booking, index) => (
                            <li key={index} className="p-2 bg-red-50 text-red-800 rounded-md">
                                From <span className="font-semibold">{new Date(booking.start_date).toLocaleDateString()}</span> to <span className="font-semibold">{new Date(booking.end_date).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div className="bg-green-50 text-green-800 p-6 rounded-xl shadow-md">
                    <p className="font-semibold">This vehicle is currently available for all dates!</p>
                </div>
            )}
        </div>

        {/* REMOVED: The full reviews section is now on a separate page */}
      </div>
    </div>
  );
}

export default VehicleDetail;

