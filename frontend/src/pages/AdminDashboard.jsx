// src/pages/AdminDashboard.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaUser, FaTag, FaRupeeSign, FaInfoCircle, FaCheckCircle, FaIdCard, FaFileContract, FaShieldAlt, FaSyncAlt } from 'react-icons/fa';
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
            <div className="flex justify-center items-center min-h-screen bg-background pt-24 font-mono text-primary animate-pulse">
                LOADING DATA STREAM...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background pt-24">
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-8 rounded-xl max-w-md mx-auto text-center">
                    <FaInfoCircle className="h-8 w-8 mx-auto mb-4" />
                    <h3 className="font-bold text-lg">Access Denied / Error</h3>
                    <p className="text-sm mt-2">Could not retrieve secure data. Please verification credentials.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen font-sans pb-24 pt-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="bg-card border border-border rounded-xl p-8 mb-10 flex flex-col md:flex-row justify-between items-center shadow-sm">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Command Center</h1>
                        <p className="mt-1 text-muted-foreground">Admin oversight for vehicle approvals and KYC.</p>
                    </div>
                    <div className="mt-6 md:mt-0 flex flex-wrap justify-center gap-4">
                        <Button to="/admin/verify-hosts" variant="primary" className="shadow-lg shadow-primary/20">
                            <FaUser className="mr-2" /> Verify Hosts
                        </Button>
                        <Button to="/admin/verify-licenses" variant="secondary">
                            <FaIdCard className="mr-2" /> Verify Tourists
                        </Button>
                    </div>
                </div>

                <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-primary rounded-full"></span>
                    Pending Vehicle Approvals
                </h2>

                {pendingVehicles && pendingVehicles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {pendingVehicles.map((vehicle) => (
                            <Card key={vehicle.id} hover className="overflow-hidden flex flex-col h-full border-primary/20 bg-gradient-to-b from-card to-secondary/30">
                                {/* Image Area */}
                                <div className="relative h-56 w-full bg-secondary border-b border-border">
                                    <img
                                        src={vehicle.image_urls?.[0]}
                                        alt={`${vehicle.make} ${vehicle.model}`}
                                        className="w-full h-full object-cover"
                                    />
                                    {vehicle.is_certified === false && vehicle.status === 'pending' && (
                                        <div className="absolute top-3 left-3">
                                            <Badge variant="warning" className="shadow-sm backdrop-blur-md bg-amber-500/90 text-white border-none">
                                                <FaSyncAlt className="mr-1" /> Re-submission
                                            </Badge>
                                        </div>
                                    )}
                                    <Link
                                        to={`/vehicle/${vehicle.id}`}
                                        className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold py-1 px-3 rounded-full hover:bg-black/80 transition-all border border-white/10"
                                    >
                                        Inspect
                                    </Link>
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                        <h3 className="text-white font-bold text-lg truncate">{vehicle.make} {vehicle.model}</h3>
                                        <p className="text-white/80 text-xs font-mono">{vehicle.year} • {vehicle.vehicle_type}</p>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-grow flex flex-col">
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between items-center text-sm border-b border-border pb-2 border-dashed">
                                            <span className="text-muted-foreground flex items-center gap-2"><FaUser size={12} /> Host</span>
                                            <span className="font-medium text-foreground">{vehicle.profiles?.full_name || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm border-b border-border pb-2 border-dashed">
                                            <span className="text-muted-foreground flex items-center gap-2"><FaRupeeSign size={12} /> Rate</span>
                                            <span className="font-mono-numbers font-medium text-foreground">₹{vehicle.price_per_day}/day</span>
                                        </div>
                                    </div>

                                    {/* Documents */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <button
                                            onClick={() => handleViewDocument(vehicle.id, 'rc')}
                                            className="flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors border border-border"
                                        >
                                            <FaFileContract /> RC
                                        </button>
                                        <button
                                            onClick={() => handleViewDocument(vehicle.id, 'insurance')}
                                            className="flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-colors border border-border"
                                        >
                                            <FaShieldAlt /> Ins.
                                        </button>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-auto space-y-3">
                                        {!vehicle.is_certified && (
                                            <Button
                                                onClick={() => handleApproveAndCertify(vehicle.id)}
                                                disabled={statusMutation.isPending || certifyMutation.isPending}
                                                fullWidth
                                                variant="primary"
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                                            >
                                                <FaShieldAlt className="mr-2" /> Approve & Certify
                                            </Button>
                                        )}
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                onClick={(e) => { e.preventDefault(); handleUpdateStatus(vehicle.id, 'approved'); }}
                                                disabled={statusMutation.isPending}
                                                variant="outline"
                                                className="border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                            >
                                                <FaCheck /> Approve
                                            </Button>
                                            <Button
                                                onClick={(e) => { e.preventDefault(); handleUpdateStatus(vehicle.id, 'rejected'); }}
                                                disabled={statusMutation.isPending}
                                                variant="outline"
                                                className="border-destructive/50 text-destructive hover:bg-destructive/10"
                                            >
                                                <FaTimes /> Reject
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-xl p-12 text-center flex flex-col items-center animate-fade-in-up">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                            <FaCheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">All Clear</h3>
                        <p className="mt-2 text-muted-foreground max-w-sm">
                            There are no vehicles pending approval. The fleet is fully operational.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
