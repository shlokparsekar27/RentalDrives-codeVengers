// src/pages/HostDashboard.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaCalendarAlt, FaEdit, FaTrash, FaCar, FaChartLine, FaWallet, FaExclamationCircle, FaShieldAlt, FaExternalLinkAlt, FaCheckCircle, FaClock } from 'react-icons/fa';
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

const VehicleStatusBadge = ({ status }) => {
  let variant = 'neutral';
  switch (status) {
    case 'approved': variant = 'success'; break;
    case 'pending': variant = 'warning'; break;
    case 'rejected': variant = 'destructive'; break;
    default: variant = 'neutral';
  }
  return <Badge variant={variant} className="uppercase tracking-wider text-[10px] shadow-sm">{status}</Badge>;
};

function HostDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  // derived stats
  const totalVehicles = myVehicles?.length || 0;
  const activeVehicles = myVehicles?.filter(v => v.status === 'approved').length || 0;
  const pendingVehicles = myVehicles?.filter(v => v.status === 'pending').length || 0;

  // Determine verification state
  const isVerified = profile?.is_verified; // Assuming 'is_verified' field exists on host profile
  const hasUploadedDoc = !!profile?.business_document_url;

  return (
    <div className="bg-background min-h-screen font-sans pb-24 pt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

        {/* Dashboard Header with Stats */}
        <div className="mb-12">

          {/* Status Alert for Unverified Hosts */}
          {!isVerified && (
            <div className="mb-8 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-500/20 rounded-full text-amber-600 dark:text-amber-400 mt-1">
                  {hasUploadedDoc ? <FaClock /> : <FaExclamationCircle />}
                </div>
                <div>
                  <h3 className="font-bold text-amber-700 dark:text-amber-400">
                    {hasUploadedDoc ? "Verification In Progress" : "Account Verification Required"}
                  </h3>
                  <p className="text-sm text-amber-700/80 dark:text-amber-400/80 mt-1">
                    {hasUploadedDoc
                      ? "Your document has been submitted and is under review by our admin team."
                      : "You must upload a business/identity document to publish vehicles."}
                  </p>
                </div>
              </div>
              {!hasUploadedDoc ? (
                <Button to="/profile" variant="outline" className="border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 whitespace-nowrap">
                  Go to Profile to Upload
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  {profile?.business_document_url && (
                    <a
                      href={profile.business_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-amber-700 dark:text-amber-400 underline decoration-amber-500/30 underline-offset-4 hover:decoration-amber-500 transition-all flex items-center gap-1"
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
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Fleet Dashboard</h1>
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
            {/* Mock Revenue Stat */}
            <Card className="p-5 border border-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between opacity-80" title="Available in Pro Tier">
              <div className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
                Revenue
                <FaWallet className="text-purple-500" />
              </div>
              <div className="text-xl font-bold font-mono-numbers text-muted-foreground">--</div>
            </Card>
          </div>
        </div>

        {/* Listings Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              My Vehicles
              <Badge variant="outline" className="ml-2 bg-secondary text-foreground">{totalVehicles}</Badge>
            </h3>
            {/* Filter/Sort could go here */}
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
          ) : myVehicles && myVehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {myVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                  className="group cursor-pointer h-full"
                >
                  <Card hover noPadding className="h-full flex flex-col overflow-hidden border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 group-hover:translate-y-[-4px]">
                    {/* Image Header */}
                    <div className="relative h-52 bg-secondary overflow-hidden">
                      <img
                        src={vehicle.image_urls?.[0]}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                      <div className="absolute top-3 left-3">
                        <VehicleStatusBadge status={vehicle.status} />
                      </div>

                      {!vehicle.is_certified && vehicle.status === 'approved' && (
                        <div className="absolute top-3 right-3" title="Certification Pending">
                          <Badge variant="secondary" className="bg-black/50 backdrop-blur-md text-white border-white/20 text-[10px]"><FaShieldAlt className="mr-1 text-gray-400" /> Not Certified</Badge>
                        </div>
                      )}

                      {vehicle.is_certified && (
                        <div className="absolute top-3 right-3" title="Certified Vehicle">
                          <Badge variant="success" className="bg-emerald-500/90 text-white border-none shadow-lg text-[10px]"><FaShieldAlt className="mr-1" /> Certified</Badge>
                        </div>
                      )}

                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="flex justify-between items-end">
                          <div>
                            <h4 className="text-xl font-bold leading-none tracking-tight drop-shadow-md">
                              {vehicle.make} {vehicle.model}
                            </h4>
                            <p className="text-xs text-white/70 font-mono mt-1 font-medium">{vehicle.year} • {vehicle.fuel_type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">₹{vehicle.price_per_day}<span className="text-[10px] font-normal opacity-70">/day</span></p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 flex-grow flex flex-col bg-card">
                      <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground mb-5">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground/60">Type</span>
                          <span className="font-semibold text-foreground">{vehicle.vehicle_type}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground/60">Reg. No</span>
                          <span className="font-semibold text-foreground">{vehicle.registration_number || "N/A"}</span>
                        </div>
                      </div>

                      <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-border border-dashed">
                        <Button
                          onClick={(e) => { e.stopPropagation(); navigate(`/host/edit-vehicle/${vehicle.id}`); }}
                          variant="secondary"
                          size="sm"
                          className="w-full text-xs font-bold"
                        >
                          <FaEdit className="mr-2" /> Edit
                        </Button>
                        <Button
                          onClick={(e) => { e.stopPropagation(); handleDelete(vehicle.id); }}
                          disabled={deleteMutation.isPending}
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive"
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
              <h3 className="text-xl font-bold text-foreground">Start Your Fleet</h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-sm">You haven't listed any vehicles yet. Add your first vehicle to start earning.</p>
              <Button to="/host/add-vehicle" variant="primary" size="lg" className="shadow-xl shadow-primary/20">
                <FaPlus className="mr-2" /> List First Vehicle
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HostDashboard;
