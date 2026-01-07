// src/pages/AdminLicenseVerification.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { FaCheck, FaExternalLinkAlt, FaIdCard, FaUserCheck, FaArrowLeft, FaTimes, FaShieldAlt } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';

// --- API Functions for Admin License Verification ---
const fetchPendingTourists = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tourists/pending-license`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch pending tourists.');
    return response.json();
};

const verifyLicense = async (touristId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tourists/${touristId}/verify-license`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) throw new Error('Failed to verify license.');
    return response.json();
};

const rejectLicense = async (touristId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tourists/${touristId}/reject-license`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) throw new Error('Failed to reject license.');
    return response.json();
};


function AdminLicenseVerification() {
    const queryClient = useQueryClient();

    const { data: pendingTourists, isLoading, isError } = useQuery({
        queryKey: ['pendingTourists'],
        queryFn: fetchPendingTourists,
    });

    const verifyMutation = useMutation({
        mutationFn: verifyLicense,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingTourists'] });
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    const rejectMutation = useMutation({
        mutationFn: rejectLicense,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingTourists'] });
            alert("License rejected and removed from queue.");
        },
        onError: (error) => alert(`Rejection Error: ${error.message}`),
    });

    const handleViewDocument = (tourist) => {
        if (!tourist.license_document_url) {
            alert("No license document URL found for this user.");
            return;
        }
        window.open(tourist.license_document_url, '_blank');
    };

    const handleReject = (touristId) => {
        if (window.confirm("Are you sure you want to REJECT this license? This will require the user to re-upload.")) {
            rejectMutation.mutate(touristId);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background pt-24 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-primary font-mono animate-pulse">FETCHING PENDING LICENSES...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-background pt-24 flex flex-col items-center justify-center text-center px-4">
                <div className="text-destructive text-6xl mb-4"><FaIdCard /></div>
                <h2 className="text-2xl font-bold text-foreground">Connection Failed</h2>
                <p className="text-muted-foreground mt-2">Unable to retrieve license applications.</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="mt-6">Retry Connection</Button>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen pt-24 pb-20 font-sans transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

                {/* --- Header Section --- */}
                <div className="relative mb-12">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 uppercase tracking-widest text-[10px]">Admin Console</Badge>
                                <span className="text-muted-foreground text-xs font-mono">•</span>
                                <Badge variant="secondary" className="flex items-center gap-1 text-[10px]"><FaShieldAlt size={10} /> Security Check</Badge>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                                License Verification
                                <Badge variant="primary" className="text-sm py-1 px-2 h-auto rounded-full">{pendingTourists?.length || 0}</Badge>
                            </h1>
                            <p className="mt-2 text-muted-foreground max-w-2xl text-lg">
                                Validate government-issued driving licenses for tourists and users.
                            </p>
                        </div>
                        <Button to="/admin/dashboard" variant="ghost" className="shrink-0 gap-2 hover:bg-secondary/80">
                            <FaArrowLeft className="text-sm" /> Dashboard
                        </Button>
                    </div>
                </div>

                {/* --- Content Grid --- */}
                {pendingTourists && pendingTourists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {pendingTourists.map((tourist) => (
                            <Card
                                key={tourist.id}
                                noPadding
                                className="group relative overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 flex flex-col h-full"
                            >
                                {/* Status Indicator */}
                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-400 to-amber-600 group-hover:w-1.5 transition-all"></div>

                                <div className="p-6 pb-4">
                                    <div className="flex justify-between items-start mb-4 pl-2">
                                        <div className="relative">
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl flex items-center justify-center text-xl font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/30 shadow-sm">
                                                {tourist.full_name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-card rounded-full flex items-center justify-center border border-border shadow-sm text-[10px] text-muted-foreground">
                                                <FaUserCheck />
                                            </div>
                                        </div>
                                        <Badge variant="warning" className="shadow-sm animate-pulse bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900/50">
                                            Pending
                                        </Badge>
                                    </div>

                                    <div className="pl-2 mb-2">
                                        <h3 className="font-bold text-xl text-foreground mb-1 truncate leading-tight" title={tourist.full_name}>{tourist.full_name}</h3>
                                        <p className="text-xs font-mono text-muted-foreground truncate opacity-80" title={tourist.email}>{tourist.email}</p>
                                    </div>

                                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider h-5 px-1.5">{tourist.role}</Badge>
                                </div>

                                {/* Actions Area */}
                                <div className="mt-auto bg-secondary/10 border-t border-border p-4 space-y-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => handleViewDocument(tourist)}
                                        className="w-full text-xs font-semibold h-9 border border-border/50 hover:bg-background shadow-sm"
                                    >
                                        <FaExternalLinkAlt className="mr-2 opacity-70" /> View License ID
                                    </Button>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleReject(tourist.id)}
                                            disabled={verifyMutation.isPending || rejectMutation.isPending}
                                            variant="outline"
                                            className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 h-10 hover:border-destructive/50"
                                        >
                                            <FaTimes />
                                        </Button>
                                        <Button
                                            onClick={() => verifyMutation.mutate(tourist.id)}
                                            disabled={verifyMutation.isPending || rejectMutation.isPending}
                                            variant="primary"
                                            className="flex-[3] bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 text-white h-10 border-none font-bold tracking-wide"
                                        >
                                            <FaCheck className="mr-2" /> Approve
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up px-4 text-center">
                        <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6 ring-8 ring-primary/5 text-primary relative">
                            <FaIdCard size={40} />
                            <div className="absolute top-0 right-0 w-6 h-6 bg-emerald-500 rounded-full border-4 border-background"></div>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">Queue Empty</h3>
                        <p className="mt-3 text-muted-foreground text-lg max-w-md">
                            There are no license verifications pending at this time.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminLicenseVerification;