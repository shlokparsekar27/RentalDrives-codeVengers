// src/pages/HostBookings.jsx
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCar, FaMotorcycle, FaClock, FaSearch, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaFilter, FaCalendarAlt, FaUser } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';

// --- API Functions ---
const fetchMyVehicleBookings = async (session) => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/hosts/my-bookings`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch bookings for your vehicles');
    return response.json();
};

const getStatusBadge = (status) => {
    switch (status) {
        case 'confirmed': return <Badge variant="success">Confirmed</Badge>;
        case 'cancelled': return <Badge variant="error">Cancelled</Badge>;
        case 'completed': return <Badge variant="brand">Completed</Badge>;
        default: return <Badge variant="neutral">{status}</Badge>;
    }
};

function HostBookings() {
    const { user, session } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');

    const activeTab = searchParams.get('tab') || 'latest';

    const { data: allBookings, isLoading, isError } = useQuery({
        enabled: !!user && !!session,
        queryKey: ['myVehicleBookings', user?.id],
        queryFn: () => fetchMyVehicleBookings(session),
    });

    const filteredBookings = useMemo(() => {
        if (!allBookings) return [];
        const searched = allBookings.filter(booking => {
            const vehicleName = `${booking.vehicles.make} ${booking.vehicles.model}`.toLowerCase();
            const touristName = booking.profiles.full_name.toLowerCase();
            const searchLower = searchTerm.toLowerCase();
            return vehicleName.includes(searchLower) || touristName.includes(searchLower);
        });

        switch (activeTab) {
            case 'latest': return searched.slice(0, 50); // Show more by default
            case 'Car':
            case 'Bike':
            case 'Scooter': return searched.filter(b => b.vehicles.vehicle_type === activeTab);
            case 'confirmed': return searched.filter(b => b.status === 'confirmed');
            case 'cancelled': return searched.filter(b => b.status === 'cancelled');
            default: return searched;
        }
    }, [allBookings, searchTerm, activeTab]);

    const handleTabChange = (tab) => setSearchParams({ tab });

    const tabs = [
        { key: 'latest', label: 'All Activity' },
        { key: 'confirmed', label: 'Active/Confirmed' },
        { key: 'cancelled', label: 'Cancelled' },
        { key: 'Car', label: 'Cars Only' },
        { key: 'Bike', label: 'Bikes Only' },
    ];

    if (isLoading) return <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pt-32 text-center text-slate-500 font-mono">LOADING DATA...</div>;
    if (isError) return <div className="p-20 text-center text-red-500 bg-slate-50 dark:bg-slate-950 font-bold">SYSTEM ERROR: Could not fetch records.</div>;

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-24 transition-colors duration-300 font-sans">

            {/* 
              📅 Bookings Header 
            */}
            <div className="bg-slate-900 dark:bg-black pt-20 pb-28 border-b border-slate-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <Link to="/host/dashboard" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                                <FaArrowLeft />
                            </Link>
                            <div>
                                <h1 className="text-3xl font-display font-bold text-white">Booking Registry</h1>
                                <p className="text-slate-400 mt-1">Track reservations and guest details.</p>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="w-full md:w-auto relative group">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by Guest or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-80 pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16">

                {/* 
                  🗂️ Tabs Navigation 
                */}
                <div className="flex overflow-x-auto pb-4 mb-2 gap-2 scrollbar-hide">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={`
                                white-space-nowrap px-5 py-2.5 rounded-lg text-sm font-bold transition-all border
                                ${activeTab === tab.key
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/40'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* 
                  📜 Booking List 
                */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[500px]">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/30">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Records ({filteredBookings.length})
                        </span>
                        <div className="flex gap-2">
                            <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                            <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                        </div>
                    </div>

                    {filteredBookings && filteredBookings.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredBookings.map(booking => (
                                <div key={booking.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">

                                        {/* Status Indicator Strip */}
                                        <div className={`w-1.5 self-stretch rounded-full flex-shrink-0 ${booking.status === 'confirmed' ? 'bg-green-500' :
                                                booking.status === 'cancelled' ? 'bg-red-500' :
                                                    booking.status === 'completed' ? 'bg-blue-500' : 'bg-slate-300'
                                            }`}></div>

                                        {/* Vehicle Info */}
                                        <div className="flex-1 min-w-[200px]">
                                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono mb-1 uppercase tracking-wide">
                                                {booking.vehicles.vehicle_type === 'Car' ? <FaCar className="text-blue-500" /> : <FaMotorcycle className="text-orange-500" />}
                                                <span>{booking.vehicles.registration_number}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {booking.vehicles.make} {booking.vehicles.model}
                                            </h3>
                                        </div>

                                        {/* Guest Info */}
                                        <div className="flex-1 min-w-[200px]">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-500 dark:text-slate-300 font-bold">
                                                    <FaUser size={10} />
                                                </div>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{booking.profiles.full_name}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 pl-8 truncate">{booking.profiles.email || 'No email provided'}</p>
                                        </div>

                                        {/* Dates */}
                                        <div className="flex-1 min-w-[200px]">
                                            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium text-sm">
                                                <FaCalendarAlt className="text-slate-400" />
                                                {new Date(booking.start_date).toLocaleDateString()}
                                                <span className="text-slate-400 mx-1">→</span>
                                                {new Date(booking.end_date).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 pl-6 mt-1">
                                                {Math.ceil(Math.abs(new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24))} Days Duration
                                            </div>
                                        </div>

                                        {/* Price & Status */}
                                        <div className="flex flex-col items-end gap-2 min-w-[140px]">
                                            <span className="font-mono text-xl font-bold text-slate-900 dark:text-white">₹{booking.total_price}</span>
                                            {getStatusBadge(booking.status)}
                                        </div>

                                    </div>

                                    {/* Expanded Actions (Optional: could add collapsable details here) */}
                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 opacity-0 h-0 overflow-hidden group-hover:opacity-100 group-hover:h-auto transition-all duration-300">
                                        <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Contact Guest</Button>
                                        <Button variant="outline" size="sm" className="text-xs h-8">View Details</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 dark:bg-slate-950/30">
                            <div className="w-16 h-16 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center mb-4 shadow-sm rotate-3">
                                <FaClock className="text-slate-400" size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No active records</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs text-center mt-2">There are no bookings matching your current filter criteria.</p>
                            <button onClick={() => { setSearchTerm(''); handleTabChange('latest'); }} className="mt-6 text-sm font-bold text-blue-600 hover:underline">Clear Filters</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HostBookings;
