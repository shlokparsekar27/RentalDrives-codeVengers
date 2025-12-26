// src/pages/HostDashboard.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaCalendarCheck, FaChartLine, FaCar, FaEdit, FaTrash, FaEye, FaBolt, FaGasPump } from 'react-icons/fa';
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

function HostDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: myVehicles, isLoading: isLoadingVehicles, isError: isErrorVehicles } = useQuery({
    enabled: !!user,
    queryKey: ['myVehicles', user?.id],
    queryFn: fetchMyVehicles,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myVehicles'] });
    },
    onError: (error) => alert(`Error: ${error.message}`),
  });

  const handleDelete = (vehicleId) => {
    if (window.confirm('Are you sure you want to permanently delete this vehicle?')) {
      deleteMutation.mutate(vehicleId);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-24 transition-colors duration-300 font-sans">

      {/* 
        🚀 Command Center Header 
      */}
      <div className="bg-slate-900 dark:bg-black pt-20 pb-28 border-b border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-display font-bold text-white tracking-tight">Fleet Command</h1>
              <p className="text-slate-400 mt-2 font-light text-lg">Manage inventory, track performance, and optimize revenue.</p>
            </div>
            <div className="flex gap-3">
              <Button to="/host/bookings" variant="secondary" className="border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700">
                <FaCalendarCheck className="mr-2" /> Bookings Log
              </Button>
              <Button to="/host/add-vehicle" variant="primary" className="shadow-lg shadow-blue-900/20">
                <FaPlus className="mr-2" /> Add Asset
              </Button>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Active Assets</p>
                  <p className="text-3xl font-mono font-bold text-white">{myVehicles?.length || 0}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                  <FaCar size={20} />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Revenue</p>
                  <p className="text-3xl font-mono font-bold text-emerald-400">₹0.00</p>
                </div>
                <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <FaChartLine size={20} />
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Utilization</p>
                  <p className="text-3xl font-mono font-bold text-indigo-400">0%</p>
                </div>
                <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <FaEye size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 
        🚙 Vehicle Inventory Grid 
      */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 min-h-[500px]">
          <div className="flex justify-between items-center mb-8 border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Inventory List
            </h2>
            <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
              Live Data
            </span>
          </div>

          {isLoadingVehicles ? (
            <div className="text-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-800 dark:border-slate-700 dark:border-t-white rounded-full mx-auto mb-4"></div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Syncing Fleet Data...</p>
            </div>
          ) : isErrorVehicles ? (
            <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-6 rounded-xl text-center border border-red-100 dark:border-red-900/30">
              <p className="font-bold">System Error</p>
              <p className="text-sm">Could not retrieve vehicle data.</p>
            </div>
          ) : myVehicles && myVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              {myVehicles.map((vehicle) => (
                <div key={vehicle.id} className="group bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-2xl dark:hover:shadow-black/50 transition-all duration-300 transform hover:-translate-y-1">

                  {/* Image & Status Overlay */}
                  <div className="h-48 relative overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                      src={vehicle.image_urls?.[0]}
                      alt={vehicle.model}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-0 right-0 p-3">
                      {vehicle.status === 'approved' && <span className="bg-green-500 text-white text-[10px] font-bold uppercase px-2 py-1 rounded shadow-sm">Live</span>}
                      {vehicle.status === 'pending' && <span className="bg-amber-500 text-white text-[10px] font-bold uppercase px-2 py-1 rounded shadow-sm">Reviewing</span>}
                      {vehicle.status === 'rejected' && <span className="bg-red-500 text-white text-[10px] font-bold uppercase px-2 py-1 rounded shadow-sm">Rejected</span>}
                    </div>

                    {/* Fuel Tag */}
                    <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1">
                      {vehicle.fuel_type === 'Electric' ? <FaBolt className="text-emerald-400" /> : <FaGasPump className="text-amber-400" />}
                      {vehicle.fuel_type}
                    </div>
                  </div>

                  {/* Info Block */}
                  <div className="p-5">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg font-display truncate pr-2">{vehicle.make} {vehicle.model}</h3>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-lg">₹{vehicle.price_per_day}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mb-4">{vehicle.year} • {vehicle.transmission} • {vehicle.seating_capacity} Seats</p>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Button
                        to={`/host/edit-vehicle/${vehicle.id}`}
                        variant="secondary"
                        size="sm"
                        className="justify-center border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <FaEdit className="mr-2" /> Modify
                      </Button>
                      <Button
                        onClick={() => handleDelete(vehicle.id)}
                        variant="danger"
                        size="sm"
                        className="justify-center bg-transparent border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/30 font-medium"
                        disabled={deleteMutation.isPending}
                      >
                        <FaTrash className="mr-2" /> Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 text-slate-300 dark:text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <FaCar size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fleet is empty</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2 mb-6 text-sm">Add your first vehicle to start accepting bookings on the marketplace.</p>
              <Button to="/host/add-vehicle" variant="primary">Initialize Asset &rarr;</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HostDashboard;
