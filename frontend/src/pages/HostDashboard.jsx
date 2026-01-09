// src/pages/HostDashboard.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaCalendarAlt, FaEdit, FaTrash, FaCar, FaChartLine, FaWallet, FaExclamationCircle, FaShieldAlt, FaExternalLinkAlt, FaCheckCircle, FaClock, FaSearch, FaFilter } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';

// --- API Functions for Host ---
const fetchMyVehicles = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/hosts/my-vehicles`, {
    headers: { 'Authorization': `Bearer ${session.access_token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch your vehicles');
  return response.json();
};

const fetchHostProfile = async (userId) => {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me`, {
    headers: { 'Authorization': `Bearer ${session.access_token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch profile');
  return response.json();
};

const deleteVehicle = async (vehicleId) => {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles/${vehicleId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${session.access_token}` },
  });
  if (!response.ok) throw new Error('Failed to delete vehicle');
};

const fetchMyVehicleBookings = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/hosts/my-bookings`, {
    headers: { 'Authorization': `Bearer ${session.access_token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch bookings');
  return response.json();
};

const VehicleStatusBadge = ({ status }) => {
  let variant = 'neutral';
  let label = status;
  let className = "uppercase tracking-wider text-[10px] font-bold px-2 py-0.5";

  switch (status) {
    case 'approved':
      variant = 'success';
      className += " bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
      break;
    case 'pending':
      variant = 'warning';
      className += " bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
      break;
    case 'rejected':
      variant = 'destructive';
      className += " bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
      break;
    default:
      variant = 'neutral';
  }
  return <Badge variant="outline" className={className}>{label}</Badge>;
};

const formatRevenue = (amount) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)} K`;
  return `₹${amount.toLocaleString()}`;
};

function HostDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State for Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [transmissionFilter, setTransmissionFilter] = useState('all');
  const [fuelFilter, setFuelFilter] = useState('all');

  const { data: myVehicles, isLoading: vehiclesLoading, isError: vehiclesError } = useQuery({
    enabled: !!user,
    queryKey: ['myVehicles', user?.id],
    queryFn: fetchMyVehicles,
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    enabled: !!user,
    queryKey: ['hostProfile', user?.id],
    queryFn: () => fetchHostProfile(user.id),
  });

  const { data: bookings } = useQuery({
    enabled: !!user,
    queryKey: ['myVehicleBookings', user?.id],
    queryFn: fetchMyVehicleBookings,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myVehicles'] });
    },
    onError: (error) => alert(`Error: ${error.message}`),
  });

  const handleDelete = (vehicleId) => {
    if (window.confirm('Are you sure you want to permanently delete this vehicle? This cannot be undone.')) {
      deleteMutation.mutate(vehicleId);
    }
  };

  // Filter Logic
  const filteredVehicles = myVehicles?.filter(vehicle => {
    const matchesSearch = (vehicle.make + ' ' + vehicle.model).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.registration_number || vehicle.license_plate || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesType = typeFilter === 'all' || vehicle.vehicle_type === typeFilter;
    const matchesTrans = transmissionFilter === 'all' || vehicle.transmission === transmissionFilter;
    const matchesFuel = fuelFilter === 'all' || vehicle.fuel_type === fuelFilter;

    return matchesSearch && matchesStatus && matchesType && matchesTrans && matchesFuel;
  });

  // derived stats
  const totalVehicles = myVehicles?.length || 0;
  const activeVehicles = myVehicles?.filter(v => v.status === 'approved').length || 0;
  const pendingVehicles = myVehicles?.filter(v => v.status === 'pending').length || 0;

  // Determine verification state
  const isVerified = profile?.is_verified;
  const hasUploadedDoc = !!profile?.business_document_url;

  // Calculate Revenue
  const totalRevenue = bookings?.reduce((acc, booking) => {
    if (booking.status === 'confirmed' || booking.status === 'completed') {
      return acc + (Number(booking.total_price) || 0);
    }
    return acc;
  }, 0) || 0;

  return (
    <div className="bg-background min-h-screen font-sans pb-24 pt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

        {/* Dashboard Header with Stats */}
        <div className="mb-12">

          {/* Status Alert for Unverified Hosts */}
          {!isVerified && (
            <div className="mb-8 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-500/20 rounded-full text-amber-800 dark:text-amber-400 mt-1">
                  {hasUploadedDoc ? <FaClock /> : <FaExclamationCircle />}
                </div>
                <div>
                  <h3 className="font-bold text-amber-950 dark:text-amber-400">
                    {hasUploadedDoc ? "Verification In Progress" : "Account Verification Required"}
                  </h3>
                  <p className="text-sm text-amber-950 dark:text-amber-400/80 mt-1">
                    {hasUploadedDoc
                      ? "Your document has been submitted and is under review by our admin team."
                      : "You must upload a business/identity document to publish vehicles."}
                  </p>
                </div>
              </div>
              {!hasUploadedDoc ? (
                <Button to="/profile" variant="outline" className="border-amber-500/30 text-amber-900 dark:text-amber-400 hover:bg-amber-500/10 whitespace-nowrap">
                  Go to Profile to Upload
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  {profile?.business_document_url && (
                    <a
                      href={profile.business_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-amber-900 dark:text-amber-400 underline decoration-amber-500/30 underline-offset-4 hover:decoration-amber-500 transition-all flex items-center gap-1"
                    >
                      <FaExternalLinkAlt size={10} /> View Submitted Doc
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="primary">Host Portal</Badge>
                {isVerified && <Badge variant="success" className="bg-emerald-500/10 text-emerald-600 border-emerald-200"><FaCheckCircle className="mr-1" /> Verified Host</Badge>}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Dashboard</h1>
              <p className="mt-2 text-muted-foreground">Manage your assets and track performance.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button to="/host/bookings" variant="secondary" className="flex-1 md:flex-none">
                <FaCalendarAlt className="mr-2" /> Bookings
              </Button>
              <Button to="/host/add-vehicle" variant="primary" className="flex-1 md:flex-none shadow-lg shadow-primary/20">
                <FaPlus className="mr-2" /> List Vehicle
              </Button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up">
            <Card className="p-5 border border-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                Total Assets
                <FaCar className="text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-3xl font-bold font-mono-numbers">{totalVehicles}</div>
            </Card>
            <Card className="p-5 border border-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                Active
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="text-3xl font-bold font-mono-numbers text-emerald-600 dark:text-emerald-400">{activeVehicles}</div>
            </Card>
            <Card className="p-5 border border-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                Pending
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              </div>
              <div className="text-3xl font-bold font-mono-numbers text-amber-600 dark:text-amber-400">{pendingVehicles}</div>
            </Card>
            {/* Revenue Stat */}
            <Card className="p-5 border border-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                Revenue
                <FaWallet className="text-purple-500 opacity-80 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-3xl font-bold font-mono-numbers text-purple-600 dark:text-purple-400">
                {formatRevenue(totalRevenue)}
              </div>
            </Card>
          </div>
        </div>

        {/* Listings Section */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-border pb-6">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2 self-start md:self-auto">
              My Vehicles
              <Badge variant="outline" className="ml-2 bg-secondary text-foreground">{filteredVehicles?.length || 0}</Badge>
            </h3>

            {/* Search and Filters */}
            <div className="flex flex-col gap-3 w-full md:w-auto md:flex-row md:items-center">

              {/* Row 1 Mobile: Search */}
              <div className="relative w-full md:w-auto">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
                <input
                  type="text"
                  placeholder="Search vehicle..."
                  className="w-full md:w-64 pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Row 2: Status Filter (Full width on mobile) */}
              <div className="w-full md:w-auto">
                <div className="relative w-full md:w-auto">
                  <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
                  <select
                    className="w-full md:w-48 pl-9 pr-8 py-2 bg-card border border-border rounded-lg text-sm appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-[10px]">▼</div>
                </div>
              </div>

              {/* Row 3: Advanced Filters (Grid on mobile, Flex on desktop) */}
              <div className="grid grid-cols-3 gap-2 w-full md:flex md:w-auto md:gap-2">

                {/* Type */}
                <select
                  className="w-full px-2 py-2 bg-card border border-border rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer md:w-auto"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">Types</option>
                  <option value="Car">Car</option>
                  <option value="Bike">Bike</option>
                  <option value="Scooter">Scooter</option>
                </select>

                {/* Trans */}
                <select
                  className="w-full px-2 py-2 bg-card border border-border rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer md:w-auto"
                  value={transmissionFilter}
                  onChange={(e) => setTransmissionFilter(e.target.value)}
                >
                  <option value="all">Gear</option>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Auto</option>
                </select>

                {/* Fuel */}
                <select
                  className="w-full px-2 py-2 bg-card border border-border rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none cursor-pointer md:w-auto"
                  value={fuelFilter}
                  onChange={(e) => setFuelFilter(e.target.value)}
                >
                  <option value="all">Fuel</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>
            </div>
          </div>

          {vehiclesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-72 bg-secondary/50 rounded-xl"></div>)}
            </div>
          ) : vehiclesError ? (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-8 rounded-xl text-center">
              <FaExclamationCircle className="mx-auto text-3xl mb-4" />
              <p className="font-bold">Error syncing fleet data.</p>
              <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="mt-4 border-destructive/30 hover:bg-destructive/10">Retry Connection</Button>
            </div>
          ) : filteredVehicles && filteredVehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                  className="group cursor-pointer h-full"
                >
                  <Card hover noPadding className="h-full flex flex-col overflow-hidden border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 group-hover:translate-y-[-4px]">
                    {/* Clean Image Header */}
                    <div className="relative h-48 bg-secondary overflow-hidden">
                      <img
                        src={vehicle.image_urls?.[0]}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Only Price Overlay remains if desired, or kept clean. Let's keep it clean as requested. */}
                    </div>

                    {/* Content Body */}
                    <div className="p-5 flex-grow flex flex-col bg-card">

                      {/* Status & Certification Row */}
                      <div className="flex justify-between items-center mb-4">
                        <VehicleStatusBadge status={vehicle.status} />

                        {vehicle.is_certified ? (
                          <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 flex items-center gap-1">
                            <FaShieldAlt size={10} /> Certified
                          </Badge>
                        ) : vehicle.status === 'approved' && (
                          <Badge variant="outline" className="bg-secondary text-muted-foreground border-border text-[10px] uppercase tracking-wider font-bold px-2 py-0.5">
                            Not Certified
                          </Badge>
                        )}
                      </div>

                      {/* Title & Price Row */}
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-bold leading-tight text-foreground pr-2">
                          {vehicle.make} {vehicle.model}
                        </h4>
                        <div className="text-right whitespace-nowrap">
                          <span className="text-lg font-bold text-foreground">₹{vehicle.price_per_day}</span>
                          <span className="text-xs text-muted-foreground font-medium">/day</span>
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground mb-5 pt-3 border-t border-dashed border-border/60">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">Type</span>
                          <span className="font-semibold text-foreground">{vehicle.vehicle_type}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground/60 mb-0.5">Plate Number</span>
                          <span className="font-mono font-semibold text-foreground">{vehicle.registration_number || vehicle.license_plate || "N/A"}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-auto grid grid-cols-2 gap-3">
                        <Button
                          onClick={(e) => { e.stopPropagation(); navigate(`/host/edit-vehicle/${vehicle.id}`); }}
                          variant="secondary"
                          size="sm"
                          className="w-full text-xs font-bold h-9 hover:bg-secondary/80 border border-transparent hover:border-border"
                        >
                          <FaEdit className="mr-2" /> Edit
                        </Button>
                        <Button
                          onClick={(e) => { e.stopPropagation(); handleDelete(vehicle.id); }}
                          disabled={deleteMutation.isPending}
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs font-bold h-9 text-destructive bg-destructive/5 hover:bg-destructive/15 border border-destructive/10"
                        >
                          <FaTrash className="mr-2" /> Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-2xl p-12 md:p-24 text-center bg-secondary/5 transition-colors hover:bg-secondary/10 group">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary group-hover:scale-110 transition-transform duration-300">
                <FaCar size={32} />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                {searchTerm || statusFilter !== 'all' ? 'No vehicles found' : 'Start Your Fleet'}
              </h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-sm">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters to find what you are looking for.'
                  : "You haven't listed any vehicles yet. Add your first vehicle to start earning."}
              </p>
              <Button to="/host/add-vehicle" variant="primary" size="lg" className="shadow-xl shadow-primary/20">
                <FaPlus className="mr-2" /> {searchTerm || statusFilter !== 'all' ? 'Add New Vehicle' : 'List First Vehicle'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HostDashboard;
