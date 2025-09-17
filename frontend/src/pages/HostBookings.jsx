// src/pages/HostBookings.jsx
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FaCar, FaMotorcycle, FaBicycle, FaClock, FaSearch, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

// --- API Functions ---
const fetchMyVehicleBookings = async (session) => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/hosts/my-bookings`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch bookings for your vehicles');
    return response.json();
};

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
    const { user, session } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');

    // Get the active tab from URL, default to 'latest'
    const activeTab = searchParams.get('tab') || 'latest';

    const { data: allBookings, isLoading, isError } = useQuery({
        enabled: !!user && !!session,
        queryKey: ['myVehicleBookings', user?.id],
        queryFn: () => fetchMyVehicleBookings(session),
    });

    // Memoized filtering logic
    const filteredBookings = useMemo(() => {
        if (!allBookings) return [];

        // 1. Filter by the search term first
        const searched = allBookings.filter(booking => {
            const vehicleName = `${booking.vehicles.make} ${booking.vehicles.model}`.toLowerCase();
            const touristName = booking.profiles.full_name.toLowerCase();
            const searchLower = searchTerm.toLowerCase();
            return vehicleName.includes(searchLower) || touristName.includes(searchLower);
        });

        // 2. Then, filter by the active tab
        switch (activeTab) {
            case 'latest':
                return searched.slice(0, 10); // Show only the top 10 latest
            case 'Car':
            case 'Bike':
            case 'Scooter':
                return searched.filter(b => b.vehicles.vehicle_type === activeTab);
            // NEW: Added cases for status filtering
            case 'confirmed':
                return searched.filter(b => b.status === 'confirmed');
            case 'cancelled':
                return searched.filter(b => b.status === 'cancelled');
            default:
                return searched;
        }
    }, [allBookings, searchTerm, activeTab]);

    const handleTabChange = (tab) => {
        setSearchParams({ tab });
    };

    // NEW: Added Confirmed and Cancelled to the tabs array
    const tabs = [
        { key: 'latest', label: 'Latest Bookings', icon: <FaClock /> },
        { key: 'Car', label: 'Cars', icon: <FaCar /> },
        { key: 'Bike', label: 'Bikes', icon: <FaMotorcycle /> },
        { key: 'Scooter', label: 'Scooters', icon: <FaBicycle /> },
        { key: 'confirmed', label: 'Confirmed', icon: <FaCheckCircle /> },
        { key: 'cancelled', label: 'Cancelled', icon: <FaTimesCircle /> }
    ];

    if (isLoading) return <div className="text-center p-10 font-bold text-xl">Loading Your Bookings...</div>;
    if (isError) return <div className="text-center p-10 text-red-600"><h2>Error fetching your bookings.</h2></div>;

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                    <div>
                        <h2 className="text-4xl font-extrabold text-gray-900">Bookings Received</h2>
                        <p className="mt-1 text-gray-600">Review and manage all bookings for your vehicles.</p>
                    </div>
                    <Link to="/host/dashboard" className="w-full mt-4 sm:mt-0 sm:w-auto bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all text-center">
                        &larr; Back to Dashboard
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="mb-6 relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by vehicle or tourist name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="mb-8 flex flex-wrap justify-between items-center gap-2 border-b border-gray-200 pb-4">
                    {/* Left-aligned tabs */}
                    <div className="flex flex-wrap items-center gap-2">
                        {tabs.slice(0, 4).map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => handleTabChange(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    {/* Right-aligned tabs */}
                    <div className="flex flex-wrap items-center gap-2">
                        {tabs.slice(4).map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => handleTabChange(tab.key)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredBookings && filteredBookings.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            {filteredBookings.map(booking => (
                                <li key={booking.id}>
                                    <div className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                            <div className="flex-grow text-center sm:text-left">
                                                <p className="font-bold text-lg text-gray-900">{booking.vehicles.make} {booking.vehicles.model}</p>
                                                <p className="text-sm text-gray-600 mt-1">Booked by: <span className="font-medium">{booking.profiles.full_name}</span></p>
                                                <p className="text-sm text-gray-600">Dates: <span className="font-medium">{new Date(booking.start_date).toLocaleDateString()}</span> to <span className="font-medium">{new Date(booking.end_date).toLocaleDateString()}</span></p>
                                                <p className="text-sm text-gray-600">Total Price: <span className="font-medium">₹{booking.total_price}</span></p>
                                            </div>
                                            <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${getStatusClasses(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="bg-white text-center p-12 rounded-xl shadow-sm">
                        <h3 className="text-xl font-semibold text-gray-800">No Bookings Found</h3>
                        <p className="mt-2 text-gray-500">There are no bookings that match the current filters or search term.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HostBookings;

