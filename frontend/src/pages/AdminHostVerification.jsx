// src/pages/AdminHostVerification.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { FaCheck, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';

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

// NEW: Function to get the secure, temporary URL for a document
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
            alert('Host has been verified successfully.');
            queryClient.invalidateQueries({ queryKey: ['pendingHosts'] });
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    // NEW: Handler for viewing the document
    const handleViewDocument = async (hostId) => {
        try {
            const url = await getDocumentUrl(hostId);
            window.open(url, '_blank');
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    if (isLoading) {
        return <div className="text-center p-10 font-bold text-xl">Loading Pending Verifications...</div>;
    }

    if (isError) {
        return <div className="text-center p-10 text-red-600"><h2>Error fetching data. Ensure you have admin privileges.</h2></div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
                    <div>
                        <h2 className="text-4xl font-extrabold text-gray-900">Host Verification</h2>
                        <p className="mt-1 text-gray-600">Review and approve new host document submissions.</p>
                    </div>
                    <Link to="/admin/dashboard" className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all text-center">
                        &larr; Back to Dashboard
                    </Link>
                </div>
                
                {pendingHosts && pendingHosts.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            {pendingHosts.map((host) => (
                                <li key={host.id} className="p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div className="flex-grow text-center sm:text-left">
                                            <p className="font-bold text-lg text-gray-900">{host.full_name}</p>
                                            <p className="text-sm text-gray-600 mt-1">{host.email}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {/* UPDATED: This is now a button with an onClick handler */}
                                            <button 
                                                onClick={() => handleViewDocument(host.id)}
                                                className="flex items-center gap-2 bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                                            >
                                                <FaExternalLinkAlt />
                                                View Document
                                            </button>
                                            <button 
                                                onClick={() => verifyMutation.mutate(host.id)}
                                                disabled={verifyMutation.isPending}
                                                className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-all disabled:bg-gray-400"
                                            >
                                                <FaCheck />
                                                Approve
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <div className="text-center bg-white p-12 rounded-xl shadow-md">
                        <h3 className="text-xl font-semibold text-gray-800">All Clear!</h3>
                        <p className="mt-2 text-gray-500">There are no hosts pending verification.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminHostVerification;

