// src/pages/BookingSummary.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { createBooking, openRazorpayCheckout } from '../api/bookings';
import { FaMapMarkerAlt, FaCalendarAlt, FaCar, FaMoneyBillWave, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';

function BookingSummary() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // Safely destructure state from the location object
    const { vehicle, startDate, endDate, totalPrice, pickupLocation, dropoffLocation } = location.state || {};

    const bookingMutation = useMutation({
        mutationFn: createBooking,
        onSuccess: (data) => {
            
            
            // --- UPDATED: Invalidate all relevant queries ---
            // 1. Refresh the booked dates for this specific vehicle
            queryClient.invalidateQueries({ queryKey: ['bookedDates', vehicle.id] });
            
            // 2. Refresh the current user's list of bookings (for their profile page)
            queryClient.invalidateQueries({ queryKey: ['bookings', user.id] });

            // 3. Refresh the host's list of received bookings
            if (vehicle.host_id) {
                 queryClient.invalidateQueries({ queryKey: ['myVehicleBookings', vehicle.host_id] });
            }
            
          openRazorpayCheckout({ data, vehicle, user, navigate });
        },
        onError: (error) => {
            alert(`Booking failed: ${error.message}`);
        },
    });
     const handleConfirmBooking = () => {
  if (!user) {
    navigate('/PhoneAuth');
    return;
  }


  bookingMutation.mutate({
    vehicle,
    user,
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(endDate).toISOString(),
    totalPrice,
    pickupLocation, // Pass pickupLocation to the mutation
    dropoffLocation,
  });
};

   

    // If for any reason the page is loaded directly without state, redirect
    if (!vehicle) {
        return (
            <div className="text-center p-10">
                <h2 className="text-2xl font-bold">Booking details not found.</h2>
                <p className="mt-2 text-gray-600">Please select a vehicle and dates first.</p>
                <button onClick={() => navigate('/cars')} className="mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
                    Find a Vehicle
                </button>
            </div>
        );
    }
    
    // Calculate number of days for display
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) diffDays = 1;
    const rentalCost = diffDays * vehicle.price_per_day;


    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">Confirm Your Booking</h1>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
                    {/* Left Side: Vehicle & Booking Details */}
                    <div className="p-8">
                        <img
                            src={vehicle.image_urls?.[0] || 'https://via.placeholder.com/400x250.png?text=No+Image'}
                            alt={`${vehicle.make} ${vehicle.model}`}
                            className="w-full h-56 object-cover rounded-lg mb-6"
                        />
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-bold text-gray-800">{vehicle.make} {vehicle.model}</h2>
                            {vehicle.is_certified && (
                                <span className="flex items-center text-blue-600 font-semibold bg-blue-100 px-2.5 py-1 rounded-full text-sm">
                                    <FaShieldAlt className="mr-1.5" /> Certified
                                </span>
                            )}
                        </div>
                        <div className="flex items-center mt-1">
                            <p className="text-gray-500">Hosted by {vehicle.profiles?.full_name}</p>
                            {vehicle.profiles?.is_verified && (
                                <span className="ml-2 flex items-center text-green-600 font-semibold bg-green-100 px-2 py-0.5 rounded-full text-xs">
                                    <FaCheckCircle className="mr-1" /> Verified
                                </span>
                            )}
                        </div>

                        <div className="mt-6 space-y-4 text-gray-700">
                            <div className="flex items-center">
                                <FaCalendarAlt className="mr-3 text-blue-500" />
                                <span>{new Date(startDate).toDateString()} to {new Date(endDate).toDateString()}</span>
                            </div>
                             <div className="flex items-start">
                                <FaMapMarkerAlt className="mr-3 mt-1 text-blue-500 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">Pickup Location:</p>
                                    <p>{pickupLocation || vehicle.profiles?.address}</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <FaMapMarkerAlt className="mr-3 mt-1 text-blue-500 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">Drop-off Location:</p>
                                    <p>{dropoffLocation || vehicle.profiles?.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Right Side: Price Breakdown */}
                    <div className="p-8 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-200 flex flex-col">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                            <FaMoneyBillWave className="mr-3 text-green-500"/>
                            Price Details
                        </h3>
                        <div className="space-y-3 flex-grow">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Rental Cost ({diffDays} {diffDays > 1 ? 'days' : 'day'})</span>
                                <span className="font-medium">₹{rentalCost.toLocaleString()}</span>
                            </div>
                            {pickupLocation && vehicle.pickup_charge > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Custom Pickup Fee</span>
                                    <span className="font-medium">₹{vehicle.pickup_charge.toLocaleString()}</span>
                                </div>
                            )}
                             {dropoffLocation && vehicle.dropoff_charge > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Custom Drop-off Fee</span>
                                    <span className="font-medium">₹{vehicle.dropoff_charge.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                        <div className="border-t border-gray-300 mt-6 pt-4">
                             <div className="flex justify-between items-center text-xl font-bold">
                                <span>Total Amount</span>
                                <span className="text-blue-600">₹{totalPrice.toLocaleString()}</span>
                            </div>
                        </div>

                         <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button onClick={() => navigate(-1)} className="w-full bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-all">
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmBooking}
                                disabled={bookingMutation.isPending || !startDate || !endDate || totalPrice <= 0}
                                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-all disabled:bg-gray-400"
                            >
                                {bookingMutation.isPending ? 'Processing...' : 'Proceed to Pay'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BookingSummary;