// src/pages/HostDashboard.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

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

// REMOVED: fetchMyVehicleBookings is no longer needed here

// Helper to get color classes for status badges
const getStatusClasses = (status) => {
    switch (status) {
        case 'approved': return 'bg-green-100 text-green-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'rejected': return 'bg-red-100 text-red-800';
        case 'archived': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
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

  // REMOVED: The useQuery for bookings is gone from this page

  const deleteMutation = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
        alert('Vehicle deleted successfully.');
        queryClient.invalidateQueries({ queryKey: ['myVehicles'] });
    },
    onError: (error) => alert(`Error: ${error.message}`),
  });

  const handleDelete = (vehicleId) => {
      if (window.confirm('Are you sure you want to permanently delete this vehicle?')) {
          deleteMutation.mutate(vehicleId);
      }
  };

  if (isLoadingVehicles) {
    return <div className="text-center p-10 font-bold text-xl">Loading Dashboard...</div>;
  }

  if (isErrorVehicles) {
    return <div className="text-center p-10 text-red-600"><h2>Error fetching your data.</h2></div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900">Host Dashboard</h2>
            <p className="mt-1 text-gray-600">Manage your vehicle listings.</p>
          </div>
          {/* FIXED: Added a new button to view bookings */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
            <Link to="/host/bookings" className="w-full sm:w-auto bg-white text-blue-600 border border-blue-600 font-bold py-3 px-6 rounded-lg hover:bg-blue-50 transition-all text-center">
              View Bookings
            </Link>
            <Link to="/host/add-vehicle" className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all text-center">
              + Add New Vehicle
            </Link>
          </div>
        </div>

        {/* --- Your Vehicle Listings Section --- */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Vehicle Listings</h3>
          {myVehicles && myVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {myVehicles.map((vehicle) => (
                <Link to={`/vehicle/${vehicle.id}`} key={vehicle.id} className="block bg-white rounded-xl shadow-md overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                  <div className="overflow-hidden">
                    <img
                      src={vehicle.image_urls?.[0] || 'https://via.placeholder.com/400x250.png?text=No+Image'}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start">
                        <h4 className="text-xl font-bold text-gray-900">{vehicle.make} {vehicle.model}</h4>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusClasses(vehicle.status)}`}>
                            {vehicle.status}
                        </span>
                    </div>
                    <p className="text-lg font-semibold text-blue-600 mt-2">₹{vehicle.price_per_day}/day</p>
                    <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          navigate(`/host/edit-vehicle/${vehicle.id}`);
                        }} 
                        className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                          Edit
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDelete(vehicle.id);
                        }} 
                        disabled={deleteMutation.isPending} 
                        className="bg-red-100 text-red-700 font-semibold py-2 px-4 rounded-lg hover:bg-red-200 transition-colors text-sm disabled:opacity-50">
                          Delete
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white text-center p-8 rounded-xl shadow-sm">
                <p className="text-gray-600">You have not listed any vehicles yet.</p>
            </div>
          )}
        </div>

        {/* REMOVED: The bookings section is now on its own page */}
      </div>
    </div>
  );
}

export default HostDashboard;
