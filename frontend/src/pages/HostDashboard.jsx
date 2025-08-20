// src/pages/HostDashboard.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // MODIFIED
import { Link, useNavigate } from 'react-router-dom'; // MODIFIED
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import "./Vehicles.css";

// MODIFIED: This function is now handled by our backend
const fetchMyVehicles = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/hosts/my-vehicles`, {
    headers: { 'Authorization': `Bearer ${session.access_token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch your vehicles');
  return response.json();
};

// NEW: Function to delete a vehicle via the backend
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
  const navigate = useNavigate(); // For the edit button
  const queryClient = useQueryClient(); // For invalidating cache on delete

  const { data: myVehicles, isLoading, isError, refetch } = useQuery({ // Added refetch
    enabled: !!user,
    queryKey: ['myVehicles', user?.id],
    queryFn: fetchMyVehicles,
  });

  // NEW: Mutation for deleting a vehicle
  const deleteMutation = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
        alert('Vehicle deleted successfully.');
        queryClient.invalidateQueries({ queryKey: ['myVehicles'] }); // Refetch the list
    },
    onError: (error) => alert(`Error: ${error.message}`),
  });

  const handleDelete = (vehicleId) => {
      if (window.confirm('Are you sure you want to permanently delete this vehicle?')) {
          deleteMutation.mutate(vehicleId);
      }
  };


  if (isLoading) { /* ... */ }
  if (isError) { /* ... */ }

  return (
    <div className="vehicles-container">
      <div className="dashboard-header">
        <h2>Host Dashboard</h2>
        <Link to="/host/add-vehicle" className="add-vehicle-btn">
            + Add New Vehicle
        </Link>
      </div>
      <h3>Your Vehicle Listings</h3>
      {myVehicles && myVehicles.length > 0 ? (
        <ul className="vehicle-list">
          {myVehicles.map((vehicle) => (
            <li key={vehicle.id} className="vehicle-card">
              <img
                src={vehicle.image_urls?.[0] || 'https://via.placeholder.com/300x180.png?text=No+Image'}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="vehicle-image"
              />
              <div className="vehicle-info">
                <strong>{vehicle.make} {vehicle.model}</strong>
                <span>Status: <span className={`status-${vehicle.status}`}>{vehicle.status}</span></span>
                <span>₹{vehicle.price_per_day}/day</span>
              </div>
              {/* --- NEW: Action Buttons --- */}
              <div className="host-actions">
                <button className="edit-btn" onClick={() => navigate(`/host/edit-vehicle/${vehicle.id}`)}>Edit</button>
                <button className="delete-btn" onClick={() => handleDelete(vehicle.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>You have not listed any vehicles yet.</p>
      )}
    </div>
  );
}

export default HostDashboard;