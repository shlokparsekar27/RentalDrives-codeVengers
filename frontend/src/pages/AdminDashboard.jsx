// src/pages/AdminDashboard.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaUser, FaTag, FaRupeeSign, FaInfoCircle, FaCheckCircle, FaShieldAlt, FaSyncAlt, FaFileContract, FaIdCard, FaCarCrash, FaExternalLinkAlt, FaLock } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';

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

    const handleViewDocument = async (vehicleId, docType) => {
        const newWindow = window.open('', '_blank');
        newWindow.document.write('Loading secure document...');
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
            <div className="flex justify-center items-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-slate-500 dark:text-slate-400 font-mono font-bold tracking-widest">INITIALIZING...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 p-8 rounded-xl shadow-xl max-w-md mx-auto text-center">
                    <FaLock className="h-10 w-10 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold font-display uppercase tracking-wider mb-2">Security Breach</h2>
                    <p className="text-sm opacity-80">Unauthorized access attempt detected. Incident logged.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-24 transition-colors duration-300 font-sans">

            {/* 
              👮‍♂️ Security Header 
            */}
            <div className="bg-slate-900 dark:bg-black pt-20 pb-28 border-b border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="neutral" className="bg-slate-800 text-slate-400 border-slate-700 font-mono text-[10px]">ADMIN_ACCESS_LEVEL_1</Badge>
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className="text-[10px] uppercase text-green-500 font-bold tracking-wider">System Operational</span>
                                </div>
                            </div>
                            <h1 className="text-3xl font-display font-bold text-white tracking-tight">Mission Control</h1>
                            <p className="text-slate-400 mt-1 max-w-lg">Platform oversight, verification queues, and dispute resolution.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button to="/admin/verify-hosts" variant="secondary" className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white">
                                <FaUser className="mr-2 opacity-50" /> Verify Hosts
                            </Button>
                            <Button to="/admin/verify-licenses" variant="secondary" className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white">
                                <FaIdCard className="mr-2 opacity-50" /> Verify Drivers
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[600px]">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wide text-xs">
                            <FaSyncAlt className="text-blue-500" /> Pending Vehicle Approvals
                        </h2>
                        <span className="font-mono text-xs font-bold bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">
                            QUEUE: {pendingVehicles?.length || 0}
                        </span>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-950/50 h-full">
                        {pendingVehicles && pendingVehicles.length > 0 ? (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                {pendingVehicles.map((vehicle) => (
                                    <div key={vehicle.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col md:flex-row">

                                        {/* Image Section */}
                                        <div className="w-full md:w-48 h-48 md:h-auto relative bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                                            <img
                                                src={vehicle.image_urls?.[0] || 'https://via.placeholder.com/400x250.png?text=No+Image'}
                                                alt={`${vehicle.make} ${vehicle.model}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/10"></div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-5 flex-grow flex flex-col">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display uppercase tracking-tight">{vehicle.make} {vehicle.model}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 uppercase">{vehicle.vehicle_type}</span>
                                                        <span className="text-xs text-slate-400">•</span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">Host: {vehicle.profiles?.full_name}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">₹{vehicle.price_per_day}</div>
                                                </div>
                                            </div>

                                            {/* Doc Links */}
                                            <div className="flex gap-4 mb-5 text-xs font-medium border-t border-b border-slate-100 dark:border-slate-800 py-3">
                                                <button onClick={() => handleViewDocument(vehicle.id, 'rc')} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1.5 hover:underline">
                                                    <FaFileContract /> View RC Book <FaExternalLinkAlt size={10} />
                                                </button>
                                                <span className="content-['|'] text-slate-300"></span>
                                                <button onClick={() => handleViewDocument(vehicle.id, 'insurance')} className="text-purple-600 dark:text-purple-400 hover:text-purple-800 flex items-center gap-1.5 hover:underline">
                                                    <FaShieldAlt /> View Insurance <FaExternalLinkAlt size={10} />
                                                </button>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="mt-auto grid grid-cols-2 gap-3">
                                                <Button
                                                    onClick={() => handleUpdateStatus(vehicle.id, 'approved')}
                                                    size="sm"
                                                    variant="secondary"
                                                    className="justify-center text-green-700 bg-green-50 hover:bg-green-100 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30"
                                                    disabled={statusMutation.isPending}
                                                >
                                                    <FaCheck className="mr-1.5" /> Approve
                                                </Button>
                                                <Button
                                                    onClick={() => handleUpdateStatus(vehicle.id, 'rejected')}
                                                    size="sm"
                                                    variant="secondary"
                                                    className="justify-center text-red-700 bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
                                                    disabled={statusMutation.isPending}
                                                >
                                                    <FaTimes className="mr-1.5" /> Reject
                                                </Button>
                                                <Button
                                                    onClick={() => handleApproveAndCertify(vehicle.id)}
                                                    size="sm"
                                                    className="col-span-2 justify-center bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                                                    disabled={statusMutation.isPending || certifyMutation.isPending}
                                                >
                                                    <FaShieldAlt className="mr-1.5 opacity-80" /> Approve & Certify (Premium)
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-20 opacity-60">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                    <FaCheckCircle className="text-slate-300 dark:text-slate-600 text-3xl" />
                                </div>
                                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">All Clear</h3>
                                <p className="text-slate-500 dark:text-slate-400">Queue is empty. No actions required.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
