// src/pages/AdminHostVerification.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaExternalLinkAlt, FaUserCheck, FaArrowLeft, FaIdCard, FaClock } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Badge from '../Components/ui/Badge';

// --- API Functions ---
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
            // alert('Host identity verified successfully.'); // Removed for smoother UX
            queryClient.invalidateQueries({ queryKey: ['pendingHosts'] });
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    const handleViewDocument = async (hostId) => {
        const newWindow = window.open('', '_blank');
        newWindow.document.write('Retrieving secure identity document...');
        try {
            const url = await getDocumentUrl(hostId);
            newWindow.location.href = url;
        } catch (error) {
            newWindow.close();
            alert(`Error: ${error.message}`);
        }
    };

    if (isLoading) return <div className="min-h-screen pt-32 text-center text-slate-500 font-mono bg-slate-50 dark:bg-[#020617] animate-pulse">LOADING SECURE QUEUE...</div>;
    if (isError) return <div className="min-h-screen pt-32 text-center text-red-500 font-bold bg-slate-50 dark:bg-[#020617]">SYSTEM ERROR: Access Denied.</div>;

    return (
        <div className="bg-slate-50 dark:bg-[#020617] min-h-screen pb-24 font-sans transition-colors duration-500">

            {/* Header */}
            <div className="bg-slate-900 dark:bg-black pt-20 pb-28 border-b border-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <Link to="/admin" className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-2 mb-4 transition-colors uppercase tracking-widest">
                                <FaArrowLeft /> Return to Console
                            </Link>
                            <h1 className="text-3xl md:text-4xl font-display font-bold text-white flex items-center gap-4">
                                Identity Verification
                                <span className="text-sm bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full font-mono">
                                    Queue: {pendingHosts?.length || 0}
                                </span>
                            </h1>
                            <p className="text-slate-400 mt-2 max-w-lg text-lg">
                                Review government-issued ID proofs for pending host accounts.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[500px] animate-fade-in-up">
                    <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-black/20 flex justify-between items-center backdrop-blur-sm">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                            Live Request Feed
                        </span>
                        <div className="font-mono text-xs text-slate-400">{new Date().toLocaleDateString()}</div>
                    </div>

                    {pendingHosts && pendingHosts.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {pendingHosts.map((host) => (
                                <div key={host.id} className="p-6 md:p-8 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">

                                        {/* Avatar / Icon */}
                                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-inner group-hover:scale-105 transition-transform duration-300">
                                            <FaUserCheck size={28} />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">{host.full_name}</h3>
                                                <Badge variant="warning" className="text-[10px] px-2 py-0.5">PENDING REVIEW</Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">{host.email}</span>
                                                <span className="flex items-center gap-1.5 text-xs"><FaClock size={12} /> Awaiting Action</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                                            <button
                                                onClick={() => handleViewDocument(host.id)}
                                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm"
                                            >
                                                <FaIdCard /> View ID Proof
                                            </button>
                                            <Button
                                                onClick={() => verifyMutation.mutate(host.id)}
                                                disabled={verifyMutation.isPending}
                                                size="sm"
                                                className="w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white border-none shadow-lg shadow-green-600/20 py-3 px-6 h-auto text-sm"
                                            >
                                                <FaCheck className="mr-2" /> Approve Identity
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[500px] opacity-50">
                            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
                                <FaCheck className="text-green-500 text-4xl" />
                            </div>
                            <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">All Caught Up</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">No pending identity verification requests.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminHostVerification;
