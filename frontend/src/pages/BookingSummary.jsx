// src/pages/BookingSummary.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { createBooking, openRazorpayCheckout } from '../api/bookings';
import { FaMapMarkerAlt, FaCalendarAlt, FaShieldAlt, FaLock, FaCreditCard, FaCheck, FaArrowLeft, FaReceipt, FaCcVisa, FaCcMastercard, FaCcAmex } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';

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
            queryClient.invalidateQueries({ queryKey: ['bookedDates', vehicle.id] });
            queryClient.invalidateQueries({ queryKey: ['bookings', user.id] });
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
        if (!user) return navigate('/login');
        bookingMutation.mutate({
            vehicle,
            user,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString(),
            totalPrice,
            pickupLocation,
            dropoffLocation,
        });
    };

    if (!vehicle) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
                <Card className="max-w-md w-full text-center py-12 border-dashed border-2">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <FaReceipt size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Invoice Generated</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">Please select a vehicle to start a new transaction.</p>
                    <Button to="/cars" variant="primary">Access Inventory</Button>
                </Card>
            </div>
        );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = Math.max(1, Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)));
    const rentalCost = diffDays * vehicle.price_per_day;

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen py-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300 font-sans">
            <div className="max-w-6xl mx-auto">

                {/* 
                  🧾 Header Section 
                */}
                <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <button onClick={() => navigate(-1)} className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 mb-2">
                            <FaArrowLeft /> BACK TO DETAILS
                        </button>
                        <h1 className="text-3xl lg:text-4xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Checkout Securely.</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Complete your transaction with verified SSL encryption.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 px-4 py-2 rounded-lg">
                        <FaLock className="text-green-600 dark:text-green-500 text-sm" />
                        <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">256-Bit SSL Secured</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* 
                      Left Column: Order Summary (7/12)
                    */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Vehicle Ticket Stub */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg flex flex-col md:flex-row">
                            <div className="w-full md:w-64 h-48 md:h-auto bg-slate-100 dark:bg-slate-800 relative">
                                <img
                                    src={vehicle.image_urls?.[0]}
                                    alt={vehicle.model}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4 md:hidden">
                                    <h3 className="text-white font-bold text-lg">{vehicle.make} {vehicle.model}</h3>
                                </div>
                            </div>
                            <div className="p-6 md:p-8 flex-grow flex flex-col justify-center">
                                <div className="hidden md:block mb-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 uppercase">{vehicle.vehicle_type}</span>
                                        {vehicle.is_certified && <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded uppercase flex items-center gap-1"><FaCheck size={10} /> Certified</span>}
                                    </div>
                                    <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">{vehicle.make} {vehicle.model}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Provided by <span className="font-semibold text-slate-900 dark:text-white">{vehicle.profiles?.full_name}</span></p>
                                </div>

                                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Pickup</p>
                                        <div className="flex items-start gap-2">
                                            <FaMapMarkerAlt className="text-blue-500 mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{pickupLocation || 'Host Location'}</p>
                                                <p className="text-xs text-slate-500">{new Date(startDate).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Drop-off</p>
                                        <div className="flex items-start gap-2">
                                            <FaMapMarkerAlt className="text-orange-500 mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{dropoffLocation || 'Host Location'}</p>
                                                <p className="text-xs text-slate-500">{new Date(endDate).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Assurance Box */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
                                    <FaShieldAlt />
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Insurance Included</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Basic coverage for accidental damage is included in your base rental price.</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
                                    <FaCheck />
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Flexible Cancellation</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Full refund available if cancelled within 24 hours of booking confirmation.</p>
                            </div>
                        </div>

                    </div>

                    {/* 
                      Right Column: Payment Invoice (5/12)
                    */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden relative">
                                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                                <div className="p-6">
                                    <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white mb-6">Payment Summary</h3>

                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                            <span>Tier Rate ({diffDays} Days)</span>
                                            <span className="font-mono">₹{rentalCost.toLocaleString()}</span>
                                        </div>

                                        {(vehicle.pickup_charge > 0 || vehicle.dropoff_charge > 0) && (
                                            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                                <span>Logistics Fees</span>
                                                <span className="font-mono">
                                                    ₹{((pickupLocation ? vehicle.pickup_charge : 0) + (dropoffLocation ? vehicle.dropoff_charge : 0)).toLocaleString()}
                                                </span>
                                            </div>
                                        )}

                                        {/* Discount Row - Hidden if 0 for cleaner look */}
                                        {/* <div className="flex justify-between text-sm text-green-600 ...">...</div> */}

                                        <div className="my-6 border-t border-dashed border-slate-300 dark:border-slate-700"></div>

                                        <div className="flex justify-between items-end">
                                            <div className="text-sm text-slate-500">Total Payable</div>
                                            <div className="text-3xl font-bold font-display text-slate-900 dark:text-white">₹{totalPrice.toLocaleString()}</div>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <Button
                                            onClick={handleConfirmBooking}
                                            isLoading={bookingMutation.isPending}
                                            disabled={bookingMutation.isPending}
                                            className="w-full py-4 text-lg font-bold shadow-xl shadow-blue-500/20"
                                            size="lg"
                                        >
                                            {bookingMutation.isPending ? 'Processing...' : 'Confirm & Pay'}
                                        </Button>
                                    </div>

                                    <div className="mt-6 flex justify-center gap-4 text-slate-300 dark:text-slate-600 text-2xl transition-all duration-500 hover:text-slate-400 dark:hover:text-slate-500">
                                        <FaCcVisa />
                                        <FaCcMastercard />
                                        <FaCcAmex />
                                    </div>
                                    <p className="text-center text-[10px] text-slate-400 mt-2 uppercase tracking-wide">Encrypted Transaction</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default BookingSummary;