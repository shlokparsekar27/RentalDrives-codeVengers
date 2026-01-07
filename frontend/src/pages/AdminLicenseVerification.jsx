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

    if (isLoading) return <div className="min-h-screen pt-24 text-center font-mono animate-pulse text-muted-foreground">SCANNING PENDING LICENSES...</div>;
    if (isError) return <div className="min-h-screen pt-24 text-center text-destructive">UNABLE TO CONNECT TO VERIFICATION SERVER.</div>;

    return (
        <div className="bg-background min-h-screen pt-24 pb-20 font-sans">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">Admin Console</Badge>
                            <Badge variant="secondary" className="flex items-center gap-1"><FaShieldAlt size={10} /> Security Level 1</Badge>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">License Verification</h1>
                        <p className="mt-2 text-muted-foreground text-lg">Review and validate government-issued driving licenses.</p>
                    </div>
                    <Button to="/admin/dashboard" variant="outline" size="sm" className="gap-2 shrink-0">
                        <FaArrowLeft /> Dashboard
                    </Button>
                </div>

                {/* Content Grid */}
                {pendingTourists && pendingTourists.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingTourists.map((tourist) => (
                            <Card key={tourist.id} className="group relative flex flex-col overflow-hidden border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">

                                {/* Status Indicator */}
                                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center text-2xl font-bold text-foreground border border-border shadow-sm">
                                            {tourist.full_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <Badge variant="warning" className="shadow-sm animate-pulse">Pending Review</Badge>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="font-bold text-xl text-foreground mb-1">{tourist.full_name}</h3>
                                        <p className="text-sm font-mono text-muted-foreground truncate" title={tourist.email}>{tourist.email}</p>
                                        <div className="mt-3 flex gap-2">
                                            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{tourist.role}</Badge>
                                            <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground">ID: {tourist.id.slice(0, 6)}</Badge>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleViewDocument(tourist)}
                                            className="w-full text-xs font-semibold h-10 border border-border hover:bg-secondary/80"
                                        >
                                            <FaExternalLinkAlt className="mr-2 opacity-70" /> View ID
                                        </Button>
                                        <div className="text-xs text-muted-foreground flex items-center justify-center italic">
                                            Check valid dates
                                        </div>
                                    </div>
                                </div>

                                {/* Action Footer */}
                                <div className="mt-auto p-4 bg-secondary/30 border-t border-border flex gap-3">
                                    <Button
                                        onClick={() => handleReject(tourist.id)}
                                        disabled={verifyMutation.isPending || rejectMutation.isPending}
                                        variant="outline"
                                        className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 h-11"
                                    >
                                        <FaTimes className="mr-2" /> Reject
                                    </Button>
                                    <Button
                                        onClick={() => verifyMutation.mutate(tourist.id)}
                                        disabled={verifyMutation.isPending || rejectMutation.isPending}
                                        variant="primary"
                                        className="flex-[2] bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 text-white h-11 border-none"
                                    >
                                        <FaCheck className="mr-2" /> Approve
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="bg-secondary/5 border-2 border-dashed border-border rounded-2xl p-16 md:p-24 text-center flex flex-col items-center max-w-xl mx-auto animate-fade-in-up">
                        <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6 text-primary ring-8 ring-primary/5">
                            <FaIdCard size={40} />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">All Clear</h3>
                        <p className="mt-3 text-muted-foreground text-lg">
                            The verification queue is currently empty.
                        </p>
                        <p className="text-sm text-muted-foreground/60 mt-1">Great job keeping up with the requests!</p>
                        <Button to="/admin/dashboard" variant="outline" className="mt-8 border-primary/20 hover:bg-primary/5">Return to Command Center</Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminLicenseVerification;