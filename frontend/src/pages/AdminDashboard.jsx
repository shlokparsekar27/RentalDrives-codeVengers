// src/pages/AdminDashboard.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
// import "./Vehicles.css"; // No longer needed

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
        onSuccess: (data) => {
            alert(`Vehicle has been ${data.status}.`);
            queryClient.invalidateQueries({ queryKey: ['pendingVehicles'] });
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    const handleUpdateStatus = (vehicleId, newStatus) => {
        statusMutation.mutate({ vehicleId, status: newStatus });
    };

    if (isLoading) {
        return <div className="text-center p-10 font-bold text-xl">Loading Pending Approvals...</div>;
    }

    if (isError) {
        return <div className="text-center p-10 text-red-600"><h2>Error fetching data. Ensure you have admin privileges.</h2></div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-10">
                    <h2 className="text-4xl font-extrabold text-gray-900">Admin Dashboard</h2>
                    <p className="mt-2 text-lg text-gray-600">Manage pending vehicle approvals.</p>
                </div>
                
                {pendingVehicles && pendingVehicles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pendingVehicles.map((vehicle) => (
                            <div key={vehicle.id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
                                <img
                                    src={vehicle.image_urls?.[0] || 'https://via.placeholder.com/400x250.png?text=No+Image'}
                                    alt={`${vehicle.make} ${vehicle.model}`}
                                    className="w-full h-52 object-cover"
                                />
                                <div className="p-6 flex-grow flex flex-col">
                                    <h3 className="text-2xl font-bold text-gray-800">{vehicle.make} {vehicle.model}</h3>
                                    <p className="text-gray-500 text-sm mt-1">Year: {vehicle.year}</p>
                                    
                                    <div className="mt-4 border-t border-gray-200 pt-4 space-y-2 text-gray-700">
                                        <p><strong>Host ID:</strong> <span className="font-mono text-xs">{vehicle.host_id}</span></p>
                                        <p><strong>Price:</strong> ₹{vehicle.price_per_day}/day</p>
                                        <p><strong>Type:</strong> {vehicle.vehicle_type}</p>
                                    </div>
                                    
                                    <div className="mt-auto pt-6 grid grid-cols-2 gap-4">
                                        <button 
                                            onClick={() => handleUpdateStatus(vehicle.id, 'approved')}
                                            disabled={statusMutation.isPending}
                                            className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-all disabled:bg-gray-400"
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStatus(vehicle.id, 'rejected')}
                                            disabled={statusMutation.isPending}
                                            className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-all disabled:bg-gray-400"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-white p-12 rounded-xl shadow-md">
                        <h3 className="text-xl font-semibold text-gray-800">All Clear!</h3>
                        <p className="mt-2 text-gray-500">There are no vehicles currently pending approval.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;