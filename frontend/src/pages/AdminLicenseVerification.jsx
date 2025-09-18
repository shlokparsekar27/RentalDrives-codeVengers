// src/pages/AdminLicenseVerification.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { FaCheck, FaExternalLinkAlt, FaIdCard } from 'react-icons/fa';

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

const getLicenseUrl = async (touristId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/tourists/${touristId}/license-url`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Could not fetch license URL.");
    }
    const data = await response.json();
    return data.signedUrl;
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
            alert('License has been verified successfully.');
            queryClient.invalidateQueries({ queryKey: ['pendingTourists'] });
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    const handleViewDocument = async (touristId) => {
        try {
            const url = await getLicenseUrl(touristId);
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
                        <h2 className="text-4xl font-extrabold text-gray-900">License Verification</h2>
                        <p className="mt-1 text-gray-600">Review and approve new tourist license submissions.</p>
                    </div>
                    <Link to="/admin/dashboard" className="w-full mt-4 sm:mt-0 sm:w-auto bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all text-center">
                        &larr; Back to Dashboard
                    </Link>
                </div>
                
                {pendingTourists && pendingTourists.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            {pendingTourists.map((tourist) => (
                                <li key={tourist.id} className="p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                        <div className="flex-grow text-center sm:text-left">
                                            <p className="font-bold text-lg text-gray-900">{tourist.full_name}</p>
                                            <p className="text-sm text-gray-600 mt-1">{tourist.email}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={() => handleViewDocument(tourist.id)}
                                                className="flex items-center gap-2 bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                                            >
                                                <FaExternalLinkAlt />
                                                View License
                                            </button>
                                            <button 
                                                onClick={() => verifyMutation.mutate(tourist.id)}
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
                        <FaIdCard className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-xl font-semibold text-gray-800">All Clear!</h3>
                        <p className="mt-2 text-gray-500">There are no tourist licenses pending verification.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminLicenseVerification;