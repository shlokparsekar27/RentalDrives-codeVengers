// src/pages/HostDashboard.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaCalendarAlt, FaEdit, FaTrash, FaCar } from 'react-icons/fa';
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
  return <Badge variant={variant} className="uppercase tracking-wider text-[10px]">{status}</Badge>;
};

function HostDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: myVehicles, isLoading, isError } = useQuery({
    enabled: !!user,
    queryKey: ['myVehicles', user?.id],
    queryFn: fetchMyVehicles,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      // Optimistic update or refetch
      queryClient.invalidateQueries({ queryKey: ['myVehicles'] });
    },
    onError: (error) => alert(`Error: ${error.message}`),
  });

  const handleDelete = (vehicleId) => {
    if (window.confirm('Are you sure you want to permanently delete this vehicle? This cannot be undone.')) {
      deleteMutation.mutate(vehicleId);
    }
  };

  return (
    <div className="bg-background min-h-screen font-sans py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-border pb-8 gap-6">
          <div>
            <Badge variant="outline" className="mb-2">Host Portal</Badge>
            <h2 className="text-4xl font-bold tracking-tight text-foreground">Fleet Management</h2>
            <p className="mt-2 text-muted-foreground text-lg">Track performance and manage your assets.</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Button to="/host/bookings" variant="secondary" className="flex-1 md:flex-none">
              <FaCalendarAlt className="mr-2" /> Bookings
            </Button>
            <Button to="/host/add-vehicle" variant="primary" className="flex-1 md:flex-none shadow-lg shadow-primary/25">
              <FaPlus className="mr-2" /> Add Vehicle
            </Button>
          </div>
        </div>

        {/* Listings Section */}
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <FaCar className="text-primary" /> Active Assets
          </h3>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-secondary/50 rounded-xl"></div>)}
            </div>
          ) : isError ? (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive p-8 rounded-xl text-center">
              <p className="font-bold">Error syncing fleet data.</p>
              <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="mt-4 border-destructive/30 hover:bg-destructive/10">Retry Connection</Button>
            </div>
          ) : myVehicles && myVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {myVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                  className="group cursor-pointer"
                >
                  <Card hover noPadding className="h-full flex flex-col overflow-hidden border-border/60 bg-card transition-all duration-300 hover:border-primary/50">
                    {/* Image Header */}
                    <div className="relative h-48 bg-secondary overflow-hidden">
                      <img
                        src={vehicle.image_urls?.[0]}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <VehicleStatusBadge status={vehicle.status} />
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono font-bold text-foreground">
                        ₹{vehicle.price_per_day}/d
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 flex-grow flex flex-col">
                      <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {vehicle.make} {vehicle.model}
                      </h4>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
                        {vehicle.year} • {vehicle.fuel_type} • {vehicle.transmission}
                      </p>

                      <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-border border-dashed">
                        <Button
                          onClick={(e) => { e.stopPropagation(); navigate(`/host/edit-vehicle/${vehicle.id}`); }}
                          variant="secondary"
                          size="sm"
                          className="bg-secondary/50 hover:bg-secondary"
                        >
                          <FaEdit className="mr-2" /> Edit
                        </Button>
                        <Button
                          onClick={(e) => { e.stopPropagation(); handleDelete(vehicle.id); }}
                          disabled={deleteMutation.isPending}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
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
            <div className="border-2 border-dashed border-border rounded-xl p-16 text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                <FaCar size={24} />
              </div>
              <h3 className="text-lg font-bold text-foreground">No Vehicles Listed</h3>
              <p className="text-muted-foreground mb-6">Start earning by adding your first vehicle to the fleet.</p>
              <Button to="/host/add-vehicle" variant="primary">Add Your First Vehicle</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HostDashboard;
