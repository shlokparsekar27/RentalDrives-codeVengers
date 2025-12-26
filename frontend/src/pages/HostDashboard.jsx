// src/pages/HostDashboard.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaCalendarCheck, FaChartLine, FaCar, FaEdit, FaTrash, FaEye, FaBolt, FaGasPump, FaKey } from 'react-icons/fa';
import Button from '../Components/ui/Button';

// --- API ---
const fetchMyVehicles = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/hosts/my-vehicles`, {
    headers: { 'Authorization': `Bearer ${session.access_token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch fleet');
  return response.json();
};

const deleteVehicle = async (vehicleId) => {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles/${vehicleId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${session.access_token}` },
  });
  if (!response.ok) throw new Error('Delete failed');
};

function HostDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: vehicles, isLoading } = useQuery({
    enabled: !!user,
    queryKey: ['myVehicles', user?.id],
    queryFn: fetchMyVehicles,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myVehicles'] }),
    onError: (e) => alert(e.message),
  });

  const handleDelete = (id) => {
    if (window.confirm('Delete this vehicle permanently?')) deleteMutation.mutate(id);
  };

  return (
    <div className="bg-slate-50 dark:bg-[#020617] min-h-screen pb-24 font-sans transition-colors duration-500">

      {/* 
        Command Center Header 
      */}
      <div className="relative pt-28 pb-32 overflow-hidden bg-slate-900 border-b border-slate-800">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:32px_32px]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">Fleet Command</h1>
              <p className="text-lg text-slate-400 font-light">Overview of your active assets and performance.</p>
            </div>
            <div className="flex gap-4">
              <Button to="/host/bookings" variant="secondary" className="border-slate-700 bg-slate-800/50 backdrop-blur-md text-slate-300 hover:bg-slate-700 hover:text-white">
                <FaCalendarCheck className="mr-2" /> Bookings
              </Button>
              <Button to="/host/add-vehicle" className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 border-none">
                <FaPlus className="mr-2" /> Add Vehicle
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
            <div className="bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><FaCar size={20} /></div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Assets</span>
              </div>
              <div className="text-4xl font-mono font-bold text-white">{vehicles?.length || 0}</div>
              <div className="text-sm text-slate-400 mt-1">Vehicles Listed</div>
            </div>

            {/* Placeholder for future real stats */}
            <div className="bg-slate-800/20 border border-white/5 rounded-2xl p-6 flex flex-col justify-center items-center text-center opacity-50">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Analytics</span>
              <p className="text-sm text-slate-400">Detailed performance metrics coming soon.</p>
            </div>
            <div className="bg-slate-800/20 border border-white/5 rounded-2xl p-6 flex flex-col justify-center items-center text-center opacity-50">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Availability</span>
              <p className="text-sm text-slate-400">Real-time fleet tracking coming soon.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 
        Inventory Grid 
      */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 min-h-[600px] animate-fade-in-up stagger-1">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">Your Inventory</h2>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live System
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 text-center font-mono text-slate-400 animate-pulse">SYNCING DATA...</div>
          ) : vehicles?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vehicles.map((v) => (
                <div key={v.id} className="group bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-colors duration-300">
                  {/* Image Header */}
                  <div className="h-48 relative overflow-hidden bg-slate-200 dark:bg-slate-900">
                    <img src={v.image_urls?.[0]} alt={v.model} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm ${v.status === 'approved' ? 'bg-emerald-500 text-white' :
                        v.status === 'pending' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                        {v.status}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white flex items-center gap-1">
                      {v.fuel_type === 'Electric' ? <FaBolt className="text-emerald-400" /> : <FaGasPump className="text-amber-400" />} {v.fuel_type}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-900 dark:text-white truncate pr-2">{v.make} {v.model}</h3>
                      <span className="font-mono text-slate-900 dark:text-white">₹{v.price_per_day}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mb-6">{v.year} • {v.transmission}</p>

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                      <Button to={`/host/edit-vehicle/${v.id}`} variant="ghost" size="sm" className="justify-center border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800">
                        <FaEdit className="mr-2" /> Edit
                      </Button>
                      <Button onClick={() => handleDelete(v.id)} variant="ghost" size="sm" className="justify-center border border-slate-300 dark:border-slate-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-200">
                        <FaTrash className="mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <FaCar size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Vehicles Listed</h3>
              <Button to="/host/add-vehicle" className="mt-4">List Your First Car</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HostDashboard;
