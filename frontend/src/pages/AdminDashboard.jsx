// src/pages/AdminDashboard.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import "./Vehicles.css"; // Reuse vehicle styles

// --- API Functions ---
const fetchPendingVehicles = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/vehicles/pending`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch pending vehicles.');
    return response.json();
};

const updateVehicleStatus = async ({ vehicleId, status }) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/vehicles/${vehicleId}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update vehicle status.');
    return response.json();
};


function AdminDashboard() {
    const queryClient = useQueryClient();

    const { data: pendingVehicles, isLoading, isError } = useQuery({
        queryKey: ['pendingVehicles'],
        queryFn: fetchPendingVehicles,
    });

    const statusMutation = useMutation({
        mutationFn: updateVehicleStatus,
        onSuccess: () => {
            alert('Vehicle status updated.');
            // Refetch the pending vehicles list to remove the one we just actioned
            queryClient.invalidateQueries({ queryKey: ['pendingVehicles'] });
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    const handleUpdateStatus = (vehicleId, newStatus) => {
        statusMutation.mutate({ vehicleId, status: newStatus });
    };

    if (isLoading) return <h2>Loading pending approvals...</h2>;
    if (isError) return <h2>Error fetching data. Ensure you are an admin.</h2>;

    return (
        <div className="vehicles-container">
            <h2>Admin Dashboard</h2>
            <h3>Pending Vehicle Approvals</h3>
            {pendingVehicles && pendingVehicles.length > 0 ? (
                <ul className="vehicle-list">
                    {pendingVehicles.map((vehicle) => (
                        <li key={vehicle.id} className="vehicle-card">
                            <img
                                src={vehicle.image_urls?.[0] || 'https://via.placeholder.com/300x180.png?text=No+Image'}
                                alt={`${vehicle.make} ${vehicle.model}`}
                                className="vehicle-image"
                            />
                            <div className="vehicle-info">
                                <strong>{vehicle.make} {vehicle.model}</strong>
                                <span>Host ID: {vehicle.host_id}</span>
                                <span>Price: ₹{vehicle.price_per_day}/day</span>
                            </div>
                            <div className="host-actions">
                                <button className="approve-btn" onClick={() => handleUpdateStatus(vehicle.id, 'approved')}>Approve</button>
                                <button className="reject-btn" onClick={() => handleUpdateStatus(vehicle.id, 'rejected')}>Reject</button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No vehicles are currently pending approval.</p>
            )}
        </div>
    );
}

export default AdminDashboard;