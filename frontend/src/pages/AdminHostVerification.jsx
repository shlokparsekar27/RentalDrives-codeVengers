// src/pages/AdminHostVerification.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { FaCheck, FaExternalLinkAlt, FaBriefcase, FaArrowLeft } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';

// --- API Functions for Admin Verification ---
const fetchPendingHosts = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/hosts/pending`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch pending hosts.');
    return response.json();
};

const verifyHost = async (hostId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/hosts/${hostId}/verify`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) throw new Error('Failed to verify host.');
    return response.json();
};

const getDocumentUrl = async (hostId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/hosts/${hostId}/document-url`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Could not fetch document URL.");
    }
    const data = await response.json();
    return data.signedUrl;
};

function AdminHostVerification() {
    const queryClient = useQueryClient();

    const { data: pendingHosts, isLoading, isError } = useQuery({
        queryKey: ['pendingHosts'],
        queryFn: fetchPendingHosts,
    });

    const verifyMutation = useMutation({
        mutationFn: verifyHost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingHosts'] });
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    const handleViewDocument = (host) => {
        if (!host.business_document_url) {
            alert("No document URL found for this host.");
            return;
        }
        window.open(host.business_document_url, '_blank');
    };

    if (isLoading) return <div className="min-h-screen pt-24 text-center font-mono animate-pulse text-muted-foreground">SCANNING HOST APPLICATIONS...</div>;
    if (isError) return <div className="min-h-screen pt-24 text-center text-destructive">UNABLE TO CONNECT TO ADMIN SERVER.</div>;

    return (
        <div className="bg-background min-h-screen pt-24 pb-20 font-sans">
            <div className="container mx-auto px-4 max-w-5xl">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-10">
                    <div>
                        <Badge variant="outline" className="mb-2">Admin Console</Badge>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Host Verification</h1>
                        <p className="mt-1 text-muted-foreground">Review business documents for new fleet partners.</p>
                    </div>
                    <Button to="/admin/dashboard" variant="outline" size="sm" className="gap-2">
                        <FaArrowLeft /> Back to Dashboard
                    </Button>
                </div>

                {pendingHosts && pendingHosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingHosts.map((host) => (
                            <Card key={host.id} className="p-6 flex flex-col hover:border-primary/50 transition-colors animate-fade-in-up">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-xl font-bold text-muted-foreground">
                                        {host.full_name?.charAt(0)}
                                    </div>
                                    <Badge variant="warning">Action Required</Badge>
                                </div>

                                <h3 className="font-bold text-lg text-foreground">{host.full_name}</h3>
                                <p className="text-sm text-muted-foreground mb-4 truncate">{host.email}</p>

                                {/* DEBUG INFO - Remove after fixing */}
                                <div className="mb-4 p-2 bg-secondary/50 rounded text-[10px] font-mono break-all text-muted-foreground">
                                    Pending Doc: {host.business_document_url || 'NULL'}
                                </div>

                                <div className="mt-auto space-y-3">
                                    <Button
                                        variant="secondary"
                                        fullWidth
                                        onClick={() => handleViewDocument(host)}
                                        className="gap-2 border border-border"
                                    >
                                        <FaExternalLinkAlt /> Business Docs
                                    </Button>
                                    <Button
                                        variant="primary"
                                        fullWidth
                                        onClick={() => verifyMutation.mutate(host.id)}
                                        disabled={verifyMutation.isPending}
                                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 text-white"
                                    >
                                        {verifyMutation.isPending ? 'Verifying...' : <><FaCheck /> Approve Partner</>}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="bg-secondary/10 border border-border border-dashed rounded-xl p-16 text-center flex flex-col items-center max-w-lg mx-auto">
                        <div className="w-16 h-16 bg-secondary text-muted-foreground rounded-full flex items-center justify-center mb-6">
                            <FaBriefcase size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">Queue Empty</h3>
                        <p className="mt-2 text-muted-foreground">All host applications have been processed.</p>
                        <Button to="/admin/dashboard" variant="outline" className="mt-8">Return to Dashboard</Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminHostVerification;
