// src/pages/HostDashboard.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
// Old CSS imports are no longer needed

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

const fetchMyVehicleBookings = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/hosts/my-bookings`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch bookings for your vehicles');
    return response.json();
}

// Helper to get color classes for status badges
const getStatusClasses = (status) => {
    switch (status) {
        case 'approved':
        case 'confirmed':
            return 'bg-green-100 text-green-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'rejected':
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
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

  const { data: bookings, isLoading: isLoadingBookings, isError: isErrorBookings } = useQuery({
      enabled: !!user,
      queryKey: ['myVehicleBookings', user?.id],
      queryFn: fetchMyVehicleBookings,
  });

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

  if (isLoadingVehicles || isLoadingBookings) {
    return <div className="text-center p-10 font-bold text-xl">Loading Dashboard...</div>;
  }

  if (isErrorVehicles || isErrorBookings) {
    return <div className="text-center p-10 text-red-600"><h2>Error fetching your data.</h2></div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-extrabold text-gray-900">Host Dashboard</h2>
            <p className="mt-1 text-gray-600">Manage your vehicle listings and view incoming bookings.</p>
          </div>
          <Link to="/host/add-vehicle" className="mt-4 sm:mt-0 w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all text-center">
            + Add New Vehicle
          </Link>
        </div>

        {/* --- Your Vehicle Listings Section --- */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Vehicle Listings</h3>
          {myVehicles && myVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {myVehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
                  <img
                    src={vehicle.image_urls?.[0] || 'https://via.placeholder.com/400x250.png?text=No+Image'}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    className="w-full h-52 object-cover"
                  />
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex justify-between items-start">
                        <h4 className="text-xl font-bold text-gray-900">{vehicle.make} {vehicle.model}</h4>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusClasses(vehicle.status)}`}>
                            {vehicle.status}
                        </span>
                    </div>
                    <p className="text-lg font-semibold text-blue-600 mt-2">₹{vehicle.price_per_day}/day</p>
                    <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
                      <button onClick={() => navigate(`/host/edit-vehicle/${vehicle.id}`)} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm">Edit</button>
                      <button onClick={() => handleDelete(vehicle.id)} disabled={deleteMutation.isPending} className="bg-red-100 text-red-700 font-semibold py-2 px-4 rounded-lg hover:bg-red-200 transition-colors text-sm disabled:opacity-50">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white text-center p-8 rounded-xl shadow-sm">
                <p className="text-gray-600">You have not listed any vehicles yet.</p>
            </div>
          )}
        </div>

        {/* --- Bookings Received Section --- */}
        <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Bookings on Your Vehicles</h3>
            {bookings && bookings.length > 0 ? (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {bookings.map(booking => (
                          <li key={booking.id} className="p-6 flex flex-col sm:flex-row justify-between items-center">
                              <div className="mb-4 sm:mb-0">
                                  <p className="font-bold text-lg text-gray-900">{booking.vehicle_make} {booking.vehicle_model}</p>
                                  <p className="text-sm text-gray-600">Booked by: {booking.tourist_name}</p>
                                  <p className="text-sm text-gray-600">Dates: {new Date(booking.start_date).toLocaleDateString()} to {new Date(booking.end_date).toLocaleDateString()}</p>
                              </div>
                              <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${getStatusClasses(booking.status)}`}>
                                  {booking.status}
                              </span>
                          </li>
                      ))}
                    </ul>
                </div>
            ) : (
                <div className="bg-white text-center p-8 rounded-xl shadow-sm">
                    <p className="text-gray-600">You have not received any bookings on your vehicles yet.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default HostDashboard;