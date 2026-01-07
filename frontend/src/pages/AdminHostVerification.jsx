// src/pages/AdminHostVerification.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { FaCheck, FaExternalLinkAlt, FaBriefcase, FaArrowLeft, FaCheckCircle, FaTimes } from 'react-icons/fa';
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

const rejectHost = async (hostId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/hosts/${hostId}/reject`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) throw new Error('Failed to reject host.');
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

    const rejectMutation = useMutation({
        mutationFn: rejectHost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingHosts'] });
            alert("Host rejected and removed from queue.");
        },
        onError: (error) => alert(`Rejection Error: ${error.message}`),
    });

    const handleViewDocument = (host) => {
        if (!host.business_document_url) {
            alert("No document URL found for this host.");
            return;
        }
        window.open(host.business_document_url, '_blank');
    };

    const handleReject = (hostId) => {
        if (window.confirm("Are you sure you want to REJECT this host application? This will require them to re-upload documents.")) {
            rejectMutation.mutate(hostId);
        }
    };

    if (isLoading) {
        // ... (skip down to footer replacement)


        return (
            <div className="min-h-screen bg-background pt-24 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-primary font-mono animate-pulse">SEARCHING FOR NEW PARTNERS...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-background pt-24 flex flex-col items-center justify-center text-center px-4">
                <div className="text-destructive text-6xl mb-4"><FaBriefcase /></div>
                <h2 className="text-2xl font-bold text-foreground">Connection Failed</h2>
                <p className="text-muted-foreground mt-2">Unable to retrieve host applications.</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="mt-6">Retry Connection</Button>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen pt-24 pb-20 font-sans transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

                {/* --- Header Section --- */}
                <div className="relative mb-12">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/5 to-transparent -z-10 rounded-2xl blur-3xl"></div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 uppercase tracking-widest text-[10px]">Admin Console</Badge>
                                <span className="text-muted-foreground text-xs font-mono">•</span>
                                <span className="text-muted-foreground text-xs font-semibold">Incoming Requests</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Host Verification</span>
                                <Badge variant="primary" className="text-sm py-1 px-2 h-auto rounded-full">{pendingHosts?.length || 0}</Badge>
                            </h1>
                            <p className="mt-2 text-muted-foreground max-w-2xl text-lg">
                                Review business credentials for new fleet partners to activate their accounts.
                            </p>
                        </div>
                        <Button to="/admin/dashboard" variant="ghost" className="shrink-0 gap-2 hover:bg-secondary/80">
                            <FaArrowLeft className="text-sm" /> Dashboard
                        </Button>
                    </div>
                </div>

                {/* --- Verification Queue --- */}
                {pendingHosts && pendingHosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {pendingHosts.map((host) => (
                            <Card
                                key={host.id}
                                noPadding
                                className="group relative overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 flex flex-col"
                            >
                                {/* Status Line */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>

                                <div className="p-6 pb-4">
                                    <div className="flex justify-between items-start mb-4 pl-2">
                                        <div className="relative">
                                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-2xl flex items-center justify-center text-xl font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/30 shadow-sm">
                                                {host.full_name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-card rounded-full flex items-center justify-center border border-border shadow-sm text-[10px] text-muted-foreground">
                                                <FaBriefcase />
                                            </div>
                                        </div>
                                        <Badge variant="warning" className="shadow-sm animate-pulse bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900/50">
                                            Action Required
                                        </Badge>
                                    </div>

                                    <div className="pl-2 mb-2">
                                        <h3 className="font-bold text-xl text-foreground mb-1 truncate leading-tight" title={host.full_name}>{host.full_name}</h3>
                                        <p className="text-xs font-mono text-muted-foreground truncate opacity-80" title={host.email}>{host.email}</p>
                                    </div>

                                    <div className="pl-2 flex gap-2 mt-3">
                                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider h-5 px-1.5">{host.role}</Badge>
                                    </div>
                                </div>

                                {/* Divider with perforated look */}
                                <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent my-1 relative">
                                    <div className="absolute left-0 -top-1 w-2 h-2 rounded-full bg-background -ml-1"></div>
                                    <div className="absolute right-0 -top-1 w-2 h-2 rounded-full bg-background -mr-1"></div>
                                </div>

                                <div className="p-4 pt-2 mt-auto space-y-3 bg-secondary/5">
                                    <Button
                                        variant="outline"
                                        fullWidth
                                        size="sm"
                                        onClick={() => handleViewDocument(host)}
                                        className="gap-2 bg-background hover:bg-secondary border-border group-hover:border-primary/30 text-xs font-semibold h-9"
                                    >
                                        <FaExternalLinkAlt className="text-muted-foreground group-hover:text-primary transition-colors" /> Review Document
                                    </Button>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleReject(host.id)}
                                            disabled={verifyMutation.isPending || rejectMutation.isPending}
                                            variant="outline"
                                            className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 h-10 hover:border-destructive/50"
                                        >
                                            <FaTimes />
                                        </Button>
                                        <Button
                                            onClick={() => verifyMutation.mutate(host.id)}
                                            disabled={verifyMutation.isPending || rejectMutation.isPending}
                                            variant="primary"
                                            className="flex-[3] gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 text-white border-0 h-10 font-bold tracking-wide"
                                        >
                                            {verifyMutation.isPending ? (
                                                <span className="animate-pulse">Verifying...</span>
                                            ) : (
                                                <>
                                                    <FaCheck className="text-lg" /> Approve
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up px-4 text-center">
                        <div className="w-24 h-24 bg-secondary/50 rounded-full flex items-center justify-center mb-6 ring-8 ring-secondary/20 relative">
                            <FaCheckCircle className="text-emerald-500/80 text-5xl" />
                            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">All Caught Up!</h3>
                        <p className="text-muted-foreground mt-2 max-w-md">
                            There are no pending host applications at the moment.
                            <br />New requests will appear here automatically.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminHostVerification;
