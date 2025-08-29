// src/pages/HostBookings.jsx
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
// FIXED: Import useSearchParams to manage state in the URL
import { Link, useSearchParams } from 'react-router-dom';

// --- API Functions ---
const fetchMyVehicleBookings = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/hosts/my-bookings`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch bookings for your vehicles');
    return response.json();
};

// Helper to get color classes for status badges
const getStatusClasses = (status) => {
    switch (status) {
        case 'confirmed':
            return 'bg-green-100 text-green-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

function HostBookings() {
    const { user } = useAuth();
    // FIXED: useSearchParams will manage our filter state
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Read the 'status' from the URL, defaulting to 'all' if not present
    const statusFilter = searchParams.get('status') || 'all';

    const { data: bookings, isLoading, isError } = useQuery({
        enabled: !!user,
        queryKey: ['myVehicleBookings', user?.id],
        queryFn: fetchMyVehicleBookings,
    });

    const filteredBookings = useMemo(() => {
        if (!bookings) return [];
        if (statusFilter === 'all') {
            return bookings;
        }
        return bookings.filter(booking => booking.status === statusFilter);
    }, [bookings, statusFilter]);

    // FIXED: New handler to update the URL when a filter button is clicked
    const handleFilterChange = (newStatus) => {
        setSearchParams({ status: newStatus });
    };

    if (isLoading) {
        return <div className="text-center p-10 font-bold text-xl">Loading Your Bookings...</div>;
    }

    if (isError) {
        return <div className="text-center p-10 text-red-600"><h2>Error fetching your bookings.</h2></div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
                    <div>
                        <h2 className="text-4xl font-extrabold text-gray-900">Bookings Received</h2>
                        <p className="mt-1 text-gray-600">Here are all the bookings made on your vehicles.</p>
                    </div>
                    <Link to="/host/dashboard" className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all text-center">
                        &larr; Back to Dashboard
                    </Link>
                </div>

                {/* --- Filter Buttons --- */}
                <div className="mb-6 flex justify-center sm:justify-start space-x-2">
                    {/* FIXED: Buttons now call the new handler */}
                    <button 
                        onClick={() => handleFilterChange('all')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${statusFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                        All
                    </button>
                    <button 
                        onClick={() => handleFilterChange('confirmed')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${statusFilter === 'confirmed' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                        Confirmed
                    </button>
                    <button 
                        onClick={() => handleFilterChange('cancelled')}
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${statusFilter === 'cancelled' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                        Cancelled
                    </button>
                </div>

                {filteredBookings && filteredBookings.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            {filteredBookings.map(booking => (
                                <li key={booking.id}>
                                    <Link to={`/vehicle/${booking.vehicle_id}`} className="block p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                            <div className="flex-grow text-center sm:text-left">
                                                <p className="font-bold text-lg text-gray-900">{booking.vehicles.make} {booking.vehicles.model}</p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Booked by: <span className="font-medium">{booking.profiles.full_name}</span>
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Dates: <span className="font-medium">{new Date(booking.start_date).toLocaleDateString()}</span> to <span className="font-medium">{new Date(booking.end_date).toLocaleDateString()}</span>
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Total Price: <span className="font-medium">₹{booking.total_price}</span>
                                                </p>
                                            </div>
                                            <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${getStatusClasses(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="bg-white text-center p-12 rounded-xl shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800">No Bookings Found</h3>
                        <p className="mt-2 text-gray-500">There are no bookings that match the current filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HostBookings;
