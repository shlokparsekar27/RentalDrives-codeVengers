// src/pages/AdminHostVerification.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaExternalLinkAlt, FaUserCheck, FaArrowLeft, FaIdCard } from 'react-icons/fa';
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
            alert('Host identity verified successfully.');
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

    if (isLoading) return <div className="min-h-screen pt-32 text-center text-slate-500 font-mono">LOADING QUEUE...</div>;
    if (isError) return <div className="min-h-screen pt-32 text-center text-red-500 font-bold">SYSTEM ERROR: Access Denied.</div>;

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-24 font-sans transition-colors duration-300">

            {/* Header */}
            <div className="bg-slate-900 dark:bg-black pt-20 pb-28 border-b border-slate-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <Link to="/admin" className="text-xs font-bold text-slate-500 hover:text-white flex items-center gap-1 mb-2 transition-colors">
                                <FaArrowLeft /> RETURN TO CONSOLE
                            </Link>
                            <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
                                Identity Verification <Badge variant="neutral" className="bg-slate-800 text-slate-400 border-slate-700">QUEUE: {pendingHosts?.length || 0}</Badge>
                            </h1>
                            <p className="text-slate-400 mt-1 max-w-lg">Review government-issued ID proofs for new host accounts.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[500px]">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Request List</span>
                    </div>

                    {pendingHosts && pendingHosts.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {pendingHosts.map((host) => (
                                <div key={host.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">

                                        {/* Avatar / Icon */}
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                                            <FaUserCheck size={20} />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-grow">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{host.full_name}</h3>
                                            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                <span className="font-mono">{host.email}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                <span className="text-[10px] uppercase font-bold bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded">Pending Review</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                                            <button
                                                onClick={() => handleViewDocument(host.id)}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-white dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <FaIdCard /> View ID Proof
                                            </button>
                                            <Button
                                                onClick={() => verifyMutation.mutate(host.id)}
                                                disabled={verifyMutation.isPending}
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 text-white border-transparent shadow-lg shadow-green-900/20"
                                            >
                                                <FaCheck className="mr-2" /> Approve Identity
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-96 opacity-60">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                <FaCheck className="text-green-500 text-3xl" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">All Caught Up</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">No pending identity verification requests.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AdminHostVerification;
