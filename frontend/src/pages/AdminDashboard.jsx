// src/pages/AdminDashboard.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaUser, FaTag, FaRupeeSign, FaInfoCircle, FaCheckCircle, FaIdCard, FaFileContract, FaShieldAlt, FaSyncAlt, FaChartPie, FaCarSide, FaEye } from 'react-icons/fa';
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
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch values: ${response.statusText}`);
    }
    return response.json();
};

const fetchTotalApprovedVehicles = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/vehicles/approved`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) return []; // Fail silently for stats
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

    const { data: pendingVehicles, isLoading, isError, error } = useQuery({
        queryKey: ['pendingVehicles'],
        queryFn: fetchPendingVehicles,
    });

    const { data: approvedVehicles } = useQuery({
        queryKey: ['approvedVehicles'],
        queryFn: fetchTotalApprovedVehicles,
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
                INITIALIZING COMMAND CENTER...
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background pt-24">
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-8 rounded-xl max-w-md mx-auto text-center">
                    <FaInfoCircle className="h-8 w-8 mx-auto mb-4" />
                    <h3 className="font-bold text-lg">Admin Access Denied</h3>
                    <p className="text-sm mt-2">{error?.message || "Credentials validation failed. Please re-authenticate."}</p>
                    <p className="text-xs text-muted-foreground mt-4">Server Time: {new Date().toLocaleTimeString()}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen font-sans pb-24 pt-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

                {/* Header Board */}
                <div className="bg-card border border-border rounded-2xl p-6 md:p-8 mb-10 shadow-lg shadow-black/5 dark:shadow-none relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="flex flex-col md:flex-row justify-between items-center relative z-10 gap-6">
                        <div className="text-center md:text-left">
                            <Badge variant="outline" className="mb-2 border-primary/20 text-primary bg-primary/5">Admin Level Access</Badge>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Command Center</h1>
                            <p className="mt-2 text-muted-foreground flex items-center gap-2 justify-center md:justify-start">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                System Operational
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Button to="/admin/verify-hosts" variant="primary" className="shadow-lg shadow-primary/20">
                                <FaUser className="mr-2" /> Verify Hosts
                            </Button>
                            <Button to="/admin/verify-licenses" variant="outline" className="bg-background">
                                <FaIdCard className="mr-2" /> Verify Drivers
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Dashboard Stats Row (Mock Data for Visual Depth) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30"><FaSyncAlt /></div>
                        <div>
                            <p className="text-xs text-muted-foreground font-bold uppercase">Pending</p>
                            <p className="text-2xl font-bold font-mono pl-[1px]">{pendingVehicles?.length || 0}</p>
                        </div>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border flex items-center gap-4 opacity-70">
                        <div className="p-3 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30"><FaCarSide /></div>
                        <div>
                            <p className="text-xs text-muted-foreground font-bold uppercase">Fleet Size</p>
                            <p className="text-2xl font-bold font-mono pl-[1px]s">{approvedVehicles?.length || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border pt-8">
                    <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3">
                        <FaShieldAlt className="text-primary" />
                        Verification Queue
                    </h2>

                    {pendingVehicles && pendingVehicles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {pendingVehicles.map((vehicle) => (
                                <Card key={vehicle.id} hover noPadding className="overflow-hidden flex flex-col h-full border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5">
                                    {/* Image Area */}
                                    <div className="relative h-60 w-full bg-secondary border-b border-border group">
                                        <img
                                            src={vehicle.image_urls?.[0]}
                                            alt={`${vehicle.make} ${vehicle.model}`}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60"></div>

                                        {vehicle.is_certified === false && vehicle.status === 'pending' && (
                                            <div className="absolute top-3 left-3">
                                                <Badge variant="warning" className="shadow-sm backdrop-blur-md bg-amber-500 text-white border-none flex items-center gap-1">
                                                    <FaSyncAlt className="text-[10px]" /> Re-Check
                                                </Badge>
                                            </div>
                                        )}

                                        <div className="absolute bottom-3 left-4 right-4">
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <h3 className="text-foreground font-bold text-lg leading-tight shadow-black drop-shadow-sm">{vehicle.make} {vehicle.model}</h3>
                                                    <p className="text-foreground/80 text-xs font-mono font-semibold">{vehicle.year} • {vehicle.registration_number}</p>
                                                </div>
                                                <Link
                                                    to={`/vehicle/${vehicle.id}`}
                                                    className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-foreground text-xs font-bold py-1.5 px-3 rounded-lg transition-colors border border-white/20 flex items-center gap-1"
                                                >
                                                    <FaEye /> View
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex-grow flex flex-col">

                                        <div className="bg-secondary/30 rounded-lg p-3 mb-5 border border-border/50 space-y-2">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground font-semibold">OWNER</span>
                                                <span className="font-bold text-foreground text-right truncate max-w-[120px]">{vehicle.profiles?.full_name || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-muted-foreground font-semibold">ASKING RATE</span>
                                                <span className="font-mono font-bold text-foreground">₹{vehicle.price_per_day}/day</span>
                                            </div>
                                        </div>

                                        {/* Documents */}
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <button
                                                onClick={() => handleViewDocument(vehicle.id, 'rc')}
                                                className="flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold bg-secondary hover:bg-primary/10 hover:text-primary hover:border-primary/20 text-muted-foreground rounded-lg transition-all border border-transparent"
                                            >
                                                <FaFileContract /> Check RC
                                            </button>
                                            <button
                                                onClick={() => handleViewDocument(vehicle.id, 'insurance')}
                                                className="flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-bold bg-secondary hover:bg-primary/10 hover:text-primary hover:border-primary/20 text-muted-foreground rounded-lg transition-all border border-transparent"
                                            >
                                                <FaShieldAlt /> Check Ins.
                                            </button>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-auto space-y-3 pt-4 border-t border-border border-dashed">
                                            {!vehicle.is_certified && (
                                                <Button
                                                    onClick={() => handleApproveAndCertify(vehicle.id)}
                                                    disabled={statusMutation.isPending || certifyMutation.isPending}
                                                    fullWidth
                                                    variant="primary"
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 border-none"
                                                >
                                                    <FaShieldAlt className="mr-2" /> Approve & Certify
                                                </Button>
                                            )}
                                            <div className="grid grid-cols-2 gap-3">
                                                <Button
                                                    onClick={(e) => { e.preventDefault(); handleUpdateStatus(vehicle.id, 'approved'); }}
                                                    disabled={statusMutation.isPending}
                                                    variant="outline"
                                                    className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-bold"
                                                >
                                                    <FaCheck className="mr-1" /> Approve
                                                </Button>
                                                <Button
                                                    onClick={(e) => { e.preventDefault(); handleUpdateStatus(vehicle.id, 'rejected'); }}
                                                    disabled={statusMutation.isPending}
                                                    variant="outline"
                                                    className="border-destructive/30 text-destructive hover:bg-destructive/10 font-bold"
                                                >
                                                    <FaTimes className="mr-1" /> Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gradient-to-b from-card to-secondary/20 border border-border border-dashed rounded-2xl p-16 text-center flex flex-col items-center animate-fade-in">
                            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-full flex items-center justify-center mb-6 ring-8 ring-emerald-50/50 dark:ring-emerald-900/10">
                                <FaCheckCircle size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-foreground">All Clear</h3>
                            <p className="mt-2 text-muted-foreground max-w-sm text-lg">
                                Zero pending approvals. The system is up to date.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
