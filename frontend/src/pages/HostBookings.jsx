// src/pages/HostBookings.jsx
import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCar, FaMotorcycle, FaBicycle, FaClock, FaSearch, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaUserCircle, FaInfoCircle, FaStar } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';
import BookingDetailsModal from '../Components/BookingDetailsModal';

// --- API Functions ---
const fetchMyVehicleBookings = async (session) => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/hosts/my-bookings`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch bookings for your vehicles');
    return response.json();
};

const StatusBadge = ({ status }) => {
    let variant = 'neutral';
    if (status === 'confirmed') variant = 'success';
    if (status === 'cancelled') variant = 'destructive';
    if (status === 'completed') variant = 'primary';
    return (
        <Badge variant={variant} className="flex items-center gap-1 uppercase text-[10px] tracking-wider px-2 py-0.5">
            {status === 'confirmed' && <FaCheckCircle size={10} />}
            {status === 'cancelled' && <FaTimesCircle size={10} />}
            {status}
        </Badge>
    );
};

function HostBookings() {
    const { user, session } = useAuth();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    // State for BookingDetailsModal
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterFuel, setFilterFuel] = useState('all');
    const [filterGear, setFilterGear] = useState('all');

    // Active Tab Logic
    const activeTab = searchParams.get('tab') || 'bookings'; // Default to 'bookings'

    const { data: allBookings, isLoading, isError } = useQuery({
        enabled: !!user && !!session,
        queryKey: ['myVehicleBookings', user?.id],
        queryFn: () => fetchMyVehicleBookings(session),
    });

    const filteredBookings = useMemo(() => {
        if (!allBookings) return [];
        const term = searchTerm.toLowerCase();

        return allBookings.filter(booking => {
            const vehicle = booking.vehicles || {};
            const guest = booking.profiles || {};

            const matchesSearch = (
                `${vehicle.make || ''} ${vehicle.model || ''}`.toLowerCase().includes(term) ||
                guest.full_name?.toLowerCase().includes(term)
            );
            const matchesType = filterType === 'all' || vehicle.vehicle_type === filterType;
            const matchesStatus = (filterStatus === 'all' ? booking.status !== 'pending' : booking.status === filterStatus) && booking.status !== 'pending';
            const matchesFuel = filterFuel === 'all' || vehicle.fuel_type === filterFuel;
            const matchesGear = filterGear === 'all' || vehicle.transmission === filterGear;

            return matchesSearch && matchesType && matchesStatus && matchesFuel && matchesGear;
        });
    }, [allBookings, searchTerm, filterType, filterStatus, filterFuel, filterGear]);

    const handleTabChange = (tab) => setSearchParams({ tab });

    const tabs = [
        { key: 'bookings', label: 'All Bookings', icon: <FaClock /> },
        // { key: 'Car', label: 'Cars', icon: <FaCar /> }, // These specific type tabs are now handled by filters
        // { key: 'Bike', label: 'Bikes', icon: <FaMotorcycle /> },
        // { key: 'Scooter', label: 'Scooters', icon: <FaBicycle /> },
        // { key: 'confirmed', label: 'Active', icon: <FaCheckCircle /> },
        // { key: 'cancelled', label: 'Voided', icon: <FaTimesCircle /> }
    ];

    const handleOpenBookingModal = (bookingId) => {
        setSelectedBookingId(bookingId);
        setIsBookingModalOpen(true);
    };

    const handleCloseBookingModal = () => {
        setIsBookingModalOpen(false);
        setSelectedBookingId(null);
    };

    if (isLoading) return <div className="min-h-screen pt-32 text-center font-mono animate-pulse text-muted-foreground">LOADING HOST DATA...</div>;
    if (isError) return <div className="min-h-screen pt-32 text-center text-destructive">UNABLE TO CONNECT TO HOST SERVER.</div>;

    return (
        <div className="bg-background min-h-screen pt-24 pb-20 font-sans">
            <div className="container mx-auto px-4 lg:px-8 max-w-7xl">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <Badge variant="outline" className="mb-2">Host Portal</Badge>
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Booking Management</h1>
                        <p className="text-muted-foreground mt-1">Track revenue and manage fleet schedules.</p>
                    </div>
                    <Button to="/host/dashboard" variant="outline" size="sm">
                        &larr; Return to Overview
                    </Button>
                </div>

                {/* Toolbar */}
                <Card className="p-4 mb-8 bg-card border-border/60 sticky top-20 z-10 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">

                        {/* Tabs */}
                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => handleTabChange(tab.key)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${activeTab === tab.key
                                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25'
                                        : 'bg-secondary text-muted-foreground border-transparent hover:bg-secondary/80'
                                        }`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Data Grid */}
                {/* TAB: BOOKINGS */}
                {activeTab === 'bookings' && (
                    <div className="space-y-6 animate-fade-in-up">
                        {/* Filter Toolbar */}
                        <Card className="p-4 bg-secondary/10 border-border/60">
                            <div className="flex flex-col gap-4">
                                {/* Search */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by vehicle or guest name..."
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                    <span className="absolute left-3 top-2.5 text-muted-foreground"><FaSearch /></span>
                                </div>

                                {/* Filters Row */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <select className="px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        value={filterType} onChange={e => setFilterType(e.target.value)}>
                                        <option value="all">All Types</option>
                                        <option value="Car">Cars</option>
                                        <option value="Bike">Bikes</option>
                                        <option value="Scooter">Scooters</option>
                                    </select>
                                    <select className="px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                        <option value="all">All Status</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="completed">Completed</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                    <select className="px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        value={filterGear} onChange={e => setFilterGear(e.target.value)}>
                                        <option value="all">All Transmissions</option>
                                        <option value="Automatic">Automatic</option>
                                        <option value="Manual">Manual</option>
                                    </select>
                                    <select className="px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        value={filterFuel} onChange={e => setFilterFuel(e.target.value)}>
                                        <option value="all">All Fuel</option>
                                        <option value="Petrol">Petrol</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Electric">Electric</option>
                                    </select>
                                </div>
                            </div>
                        </Card>

                        {/* List */}
                        {filteredBookings.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-border rounded-xl bg-secondary/5">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4 text-muted-foreground">
                                    <FaClock size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">No bookings found</h3>
                                <p className="text-muted-foreground text-sm mt-1">Adjust filters or wait for new reservation requests.</p>
                                <Button variant="outline" className="mt-4" onClick={() => { setSearchTerm(''); setFilterType('all'); setFilterStatus('all'); setFilterFuel('all'); setFilterGear('all'); }}>
                                    Reset Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {filteredBookings.map(booking => {
                                    const vehicle = booking.vehicles || {};
                                    const guest = booking.profiles || {};
                                    return (
                                        <Card key={booking.id} className="p-0 overflow-hidden hover:border-primary/40 transition-colors">
                                            <div className="flex flex-col md:flex-row">
                                                <div className="w-full md:w-48 bg-secondary h-48 md:h-auto">
                                                    <img src={vehicle.image_urls?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000'} className="w-full h-full object-cover" alt="Vehicle" />
                                                </div>
                                                <div className="p-6 flex-grow flex flex-col justify-between gap-6">
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <StatusBadge status={booking.status} />
                                                            </div>
                                                            <div className="font-mono-numbers font-bold text-lg md:text-xl">₹{(booking.total_price || 0).toLocaleString()}</div>
                                                        </div>
                                                        <h3 className="font-bold text-lg">{vehicle.make || 'Vehicle'} {vehicle.model}</h3>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                            <FaUserCircle className="text-primary/60" />
                                                            <span>Booked by: <span className="font-semibold text-foreground">{guest.full_name || 'Guest'}</span></span>
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1"><FaCalendarAlt /> {booking.start_date ? new Date(booking.start_date).toLocaleDateString() : 'N/A'}</span>
                                                            <span className="hidden sm:inline">→</span>
                                                            <span className="flex items-center gap-1"><FaCalendarAlt /> {booking.end_date ? new Date(booking.end_date).toLocaleDateString() : 'N/A'}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 justify-end pt-4 border-t border-border border-dashed">
                                                        <Button variant="ghost" size="sm" onClick={() => handleOpenBookingModal(booking.id)} className="w-full sm:w-auto">
                                                            <FaInfoCircle className="mr-1" /> Details
                                                        </Button>
                                                        {/* <Button variant="secondary" size="sm" to={`/vehicle/${booking.vehicle_id}/reviews?booking_id=${booking.id}`} className="w-full sm:w-auto">
                                                            <FaStar className="mr-1" /> Review
                                                        </Button> */}
                                                        <Button variant="ghost" size="sm" to={booking.vehicle_id ? `/vehicle/${booking.vehicle_id}` : '#'} className="w-full sm:w-auto">View Vehicle</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {selectedBookingId && (
                <BookingDetailsModal
                    bookingId={selectedBookingId}
                    isOpen={isBookingModalOpen}
                    onClose={handleCloseBookingModal}
                />
            )}
        </div>
    );
}

export default HostBookings;
