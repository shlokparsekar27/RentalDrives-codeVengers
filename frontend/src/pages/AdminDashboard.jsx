// src/pages/AdminDashboard.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaUser, FaTag, FaRupeeSign, FaInfoCircle, FaCheckCircle, FaExternalLinkAlt, FaShieldAlt, FaSyncAlt, FaFileContract, FaIdCard } from 'react-icons/fa';

// --- API Functions ---
const fetchPendingVehicles = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/vehicles/pending`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch pending vehicles. Ensure you are logged in as an admin.');
    return response.json();
};

const updateVehicleStatus = async ({ vehicleId, status }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/vehicles/${vehicleId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update vehicle status.');
    return response.json();
};

// UPDATED: This function now takes a docType to specify which URL to get
const getDocumentUrl = async (vehicleId, docType) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/vehicles/${vehicleId}/document-url?type=${docType}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Could not fetch document URL.");
    }
    const data = await response.json();
    return data.signedUrl;
};

const certifyVehicle = async (vehicleId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/vehicles/${vehicleId}/certify`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) throw new Error('Failed to certify vehicle.');
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

    const certifyMutation = useMutation({
        mutationFn: certifyVehicle,
        onSuccess: () => {
            alert('Vehicle has been certified successfully.');
            queryClient.invalidateQueries({ queryKey: ['pendingVehicles'] });
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    const handleUpdateStatus = (vehicleId, newStatus) => {
        if (window.confirm(`Are you sure you want to ${newStatus} this vehicle?`)) {
            statusMutation.mutate({ vehicleId, status: newStatus });
        }
    };

    // UPDATED: This handler now accepts a docType
    const handleViewDocument = async (vehicleId, docType) => {
        const newWindow = window.open('', '_blank');
        newWindow.document.write('Loading document, please wait...');
        try {
            const url = await getDocumentUrl(vehicleId, docType);
            newWindow.location.href = url;
        } catch (error) {
            newWindow.close();
            alert(`Error: ${error.message}`);
        }
    };

    const handleApproveAndCertify = (vehicleId) => {
        if (window.confirm('Are you sure you want to approve AND certify this vehicle? This action is final.')) {
            statusMutation.mutate({ vehicleId, status: 'approved' }, {
                onSuccess: () => {
                    certifyMutation.mutate(vehicleId);
                }
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-xl font-semibold text-gray-700">Loading Pending Approvals...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md max-w-md mx-auto">
                    <div className="flex">
                        <div className="py-1"><FaInfoCircle className="h-6 w-6 text-red-500 mr-4" /></div>
                        <div>
                            <p className="font-bold">Error Fetching Data</p>
                            <p className="text-sm">Could not retrieve pending approvals. Please ensure you have admin privileges and try again later.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-10 flex flex-col sm:flex-row justify-between items-center border-t-4 border-blue-600">
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                        <p className="mt-1 text-gray-500">Manage all platform approvals from one place.</p>
                    </div>
                    {/* UPDATED SECTION */}
                    <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/admin/verify-hosts"
                            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            <FaUser />
                            Review Host License
                        </Link>
                        <Link
                            to="/admin/verify-licenses"
                            className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            <FaIdCard />
                            Review Tourist License
                        </Link>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-6">Pending Vehicle Approvals</h2>

                {pendingVehicles && pendingVehicles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pendingVehicles.map((vehicle) => (
                            <div key={vehicle.id} className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:border-blue-500 border-2 border-transparent">
                                <div className="overflow-hidden relative">
                                    <img
                                        src={vehicle.image_urls?.[0] || 'https://via.placeholder.com/400x250.png?text=No+Image'}
                                        alt={`${vehicle.make} ${vehicle.model}`}
                                        className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {vehicle.is_certified === false && vehicle.status === 'pending' && (
                                        <div className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-bold py-1 px-3 rounded-full flex items-center gap-1">
                                            <FaSyncAlt /> Re-submission
                                        </div>
                                    )}
                                    <Link to={`/vehicle/${vehicle.id}`} className="absolute top-3 right-3 bg-black bg-opacity-50 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-opacity-75 transition-all">
                                        View Details
                                    </Link>
                                </div>
                                <div className="p-5 flex-grow flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-900">{vehicle.make} {vehicle.model} ({vehicle.year})</h3>

                                    <div className="mt-4 space-y-3 text-sm text-gray-600 border-t pt-4">
                                        <p className="flex items-center"><FaUser className="mr-3 text-gray-400" /> <strong>Host:</strong> <span className="ml-2 font-semibold text-gray-800">{vehicle.profiles?.full_name || 'N/A'}</span></p>
                                        <p className="flex items-center"><FaRupeeSign className="mr-3 text-gray-400" /> <strong>Price:</strong> <span className="ml-2 font-semibold text-gray-800">{vehicle.price_per_day}/day</span></p>
                                        <p className="flex items-center"><FaTag className="mr-3 text-gray-400" /> <strong>Type:</strong> <span className="ml-2 font-semibold text-gray-800">{vehicle.vehicle_type}</span></p>
                                    </div>

                                    <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => handleViewDocument(vehicle.id, 'rc')}
                                            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-200 transition-all"
                                        >
                                            <FaFileContract /> View RC
                                        </button>
                                        <button
                                            onClick={() => handleViewDocument(vehicle.id, 'insurance')}
                                            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-200 transition-all"
                                        >
                                            <FaFileContract /> View Insurance
                                        </button>
                                    </div>

                                    <div className="mt-auto pt-5 space-y-3">
                                        {!vehicle.is_certified && (
                                            <button
                                                onClick={() => handleApproveAndCertify(vehicle.id)}
                                                disabled={statusMutation.isPending || certifyMutation.isPending}
                                                className="w-full flex items-center justify-center gap-2 bg-blue-100 text-blue-800 font-bold py-2 px-4 rounded-lg hover:bg-blue-200 transition-all"
                                            >
                                                <FaShieldAlt /> Approve & Certify
                                            </button>
                                        )}
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUpdateStatus(vehicle.id, 'approved'); }}
                                                disabled={statusMutation.isPending}
                                                className="w-full flex items-center justify-center gap-2 bg-green-100 text-green-800 font-bold py-2 px-4 rounded-lg hover:bg-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <FaCheck /> Approve Only
                                            </button>
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUpdateStatus(vehicle.id, 'rejected'); }}
                                                disabled={statusMutation.isPending}
                                                className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-800 font-bold py-2 px-4 rounded-lg hover:bg-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <FaTimes /> Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-white p-12 rounded-xl shadow-md border-t-4 border-green-500">
                        <FaCheckCircle className="mx-auto h-16 w-16 text-green-500" />
                        <h3 className="mt-4 text-xl font-semibold text-gray-800">All Clear!</h3>
                        <p className="mt-2 text-gray-500">There are no vehicles currently pending approval.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
