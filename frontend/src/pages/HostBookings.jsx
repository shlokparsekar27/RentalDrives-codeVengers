// src/pages/HostBookings.jsx
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCar, FaMotorcycle, FaBicycle, FaClock, FaSearch, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaUserCircle } from 'react-icons/fa';
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
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState('');

    // Active Tab Logic
    const activeTab = searchParams.get('tab') || 'latest';

    const { data: allBookings, isLoading, isError } = useQuery({
        enabled: !!user && !!session,
        queryKey: ['myVehicleBookings', user?.id],
        queryFn: () => fetchMyVehicleBookings(session),
    });

    const filteredBookings = useMemo(() => {
        if (!allBookings) return [];
        const term = searchTerm.toLowerCase();

        const searched = allBookings.filter(booking =>
            `${booking.vehicles.make} ${booking.vehicles.model}`.toLowerCase().includes(term) ||
            booking.profiles.full_name.toLowerCase().includes(term)
        );

        switch (activeTab) {
            case 'latest': return searched.slice(0, 15);
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
        { key: 'latest', label: 'Recent', icon: <FaClock /> },
        { key: 'Car', label: 'Cars', icon: <FaCar /> },
        { key: 'Bike', label: 'Bikes', icon: <FaMotorcycle /> },
        { key: 'Scooter', label: 'Scooters', icon: <FaBicycle /> },
        { key: 'confirmed', label: 'Active', icon: <FaCheckCircle /> },
        { key: 'cancelled', label: 'Voided', icon: <FaTimesCircle /> }
    ];

    if (isLoading) return <div className="min-h-screen pt-32 text-center font-mono animate-pulse text-muted-foreground">LOADING HOST DATA...</div>;
    if (isError) return <div className="min-h-screen pt-32 text-center text-destructive">UNABLE TO CONNECT TO HOST SERVER.</div>;

    return (
        <div className="bg-background min-h-screen pt-24 pb-20 font-sans">
            <div className="container mx-auto px-4 lg:px-8 max-w-7xl">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-8">
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

                        {/* Search */}
                        <div className="relative w-full md:w-64">
                            <FaSearch className="absolute left-3 top-2.5 text-muted-foreground text-xs" />
                            <input
                                type="text"
                                placeholder="Search guest or vehicle..."
                                className="w-full pl-8 pr-4 py-2 bg-secondary rounded-lg text-sm border border-transparent focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </Card>

                {/* Data Grid */}
                {filteredBookings.length > 0 ? (
                    <div className="grid gap-4">
                        {/* Desktop Header Row */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            <div className="col-span-4">Vehicle / Guest</div>
                            <div className="col-span-3">Schedule</div>
                            <div className="col-span-3 text-right">Revenue</div>
                            <div className="col-span-2 text-right">Status</div>
                        </div>

                        {filteredBookings.map(booking => (
                            <Card key={booking.id} className="p-0 overflow-hidden hover:border-primary/30 transition-colors group">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center">

                                    {/* Vehicle & Guest Info */}
                                    <div className="col-span-1 md:col-span-4 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-secondary rounded-lg overflow-hidden shrink-0 border border-border">
                                            <img src={booking.vehicles.image_urls?.[0]} className="w-full h-full object-cover" alt="Vehicle" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-foreground text-sm">{booking.vehicles.make} {booking.vehicles.model}</h4>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                <FaUserCircle className="text-primary/60" />
                                                <span>{booking.profiles.full_name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="col-span-1 md:col-span-3 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 text-xs font-mono font-medium text-foreground">
                                            <FaCalendarAlt className="text-muted-foreground" />
                                            {booking.start_date} <span className="text-muted-foreground">→</span> {booking.end_date}
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="col-span-1 md:col-span-3 md:text-right">
                                        <span className="font-mono-numbers font-bold text-base text-emerald-600 dark:text-emerald-400">
                                            ₹{booking.total_price.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="col-span-1 md:col-span-2 flex justify-end">
                                        <StatusBadge status={booking.status} />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 border-2 border-dashed border-border rounded-xl bg-secondary/5">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4 text-muted-foreground">
                            <FaClock size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">No bookings found</h3>
                        <p className="text-muted-foreground text-sm mt-1">Adjust filters or wait for new reservation requests.</p>
                        <Button variant="outline" className="mt-4" onClick={() => { setSearchTerm(''); handleTabChange('latest'); }}>
                            Reset Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HostBookings;
