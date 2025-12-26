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
                                <Badge variant="neutral" className="bg-slate-800 text-slate-400 border-slate-700 font-mono text-[10px]">ACCESS: ADMINISTRATOR</Badge>
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
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                            <th className="p-4 pl-6">Vehicle</th>
                                            <th className="p-4">Host Details</th>
                                            <th className="p-4">Documents</th>
                                            <th className="p-4 text-right">Rate</th>
                                            <th className="p-4 pr-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {pendingVehicles.map((vehicle) => (
                                            <tr key={vehicle.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="p-4 pl-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-12 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                                                            <img
                                                                src={vehicle.image_urls?.[0]}
                                                                alt={vehicle.model}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 dark:text-white text-sm">{vehicle.make} {vehicle.model}</div>
                                                            <Badge variant="neutral" className="mt-1 text-[9px] border-none bg-slate-100 dark:bg-slate-800">{vehicle.vehicle_type}</Badge>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{vehicle.profiles?.full_name}</div>
                                                    <div className="text-xs text-slate-500">ID: {vehicle.host_id.slice(0, 8)}...</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleViewDocument(vehicle.id, 'rc')} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                                            RC <FaExternalLinkAlt size={8} />
                                                        </button>
                                                        <span className="text-slate-300">|</span>
                                                        <button onClick={() => handleViewDocument(vehicle.id, 'insurance')} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                                                            INS <FaExternalLinkAlt size={8} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="font-mono font-bold text-slate-900 dark:text-white">₹{vehicle.price_per_day}</div>
                                                </td>
                                                <td className="p-4 pr-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            onClick={() => handleUpdateStatus(vehicle.id, 'approved')}
                                                            size="sm"
                                                            variant="secondary"
                                                            className="h-8 px-3 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30"
                                                            disabled={statusMutation.isPending}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleUpdateStatus(vehicle.id, 'rejected')}
                                                            size="sm"
                                                            variant="secondary"
                                                            className="h-8 px-3 text-red-700 bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30"
                                                            disabled={statusMutation.isPending}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
