// src/pages/Profile.jsx
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { FaUser, FaEnvelope, FaUserTag, FaStar, FaRegStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// --- API Functions ---
const fetchUserProfile = async (userId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
};

const fetchUserBookings = async (userId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/my-bookings`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
};

const upgradeToHost = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me/upgrade-to-host`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${session.access_token}` }
  });
  if (!response.ok) throw new Error('Failed to become a host');
  return response.json();
}

const downgradeToTourist = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me/downgrade-to-tourist`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${session.access_token}` }
  });
  if (!response.ok) throw new Error('Failed to become a tourist');
  return response.json();
}

const createReview = async ({ booking, rating, comment }) => {
    // This function remains the same
};
const updateReview = async ({ reviewId, rating, comment }) => {
    // This function remains the same
};
const deleteReview = async (reviewId) => {
    // This function remains the same
};
const cancelBooking = async (bookingId) => {
    // This function remains the same
};


// Helper to get color classes for status badges
const getStatusClasses = (status) => {
    switch (status) {
        case 'confirmed':
            return 'bg-green-100 text-green-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};


function Profile() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: profile, isLoading: isLoadingProfile } = useQuery({
        enabled: !!user?.id,
        queryKey: ['profile', user?.id],
        queryFn: () => fetchUserProfile(user.id),
    });

    const { data: bookings, isLoading: isLoadingBookings, refetch: refetchBookings } = useQuery({
        enabled: !!user?.id,
        queryKey: ['bookings', user?.id],
        queryFn: () => fetchUserBookings(user.id),
    });

    const upgradeMutation = useMutation({
        mutationFn: upgradeToHost,
        onSuccess: () => {
            alert('You have become a Host!');
            queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    const downgradeMutation = useMutation({
        mutationFn: downgradeToTourist,
        onSuccess: () => {
            alert('You have become a Tourist.');
            queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });
    
    // ... other mutation hooks remain the same

    const handleCreateReview = (booking) => { /* ... handler remains the same ... */ };
    const handleEditReview = (review) => { /* ... handler remains the same ... */ };
    const handleDeleteReview = (reviewId) => { /* ... handler remains the same ... */ };
    const handleCancelBooking = (bookingId) => { /* ... handler remains the same ... */ };


    if (isLoadingProfile || isLoadingBookings) {
        return <div className="text-center p-10 font-bold text-xl">Loading Profile...</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Your Profile</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Profile Details & Role Management */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Profile Card */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Details</h2>
                            <div className="space-y-4">
                                <div className="flex items-center"><FaUser className="mr-3 text-gray-500" /> <span className="text-gray-700">{profile?.full_name}</span></div>
                                <div className="flex items-center"><FaEnvelope className="mr-3 text-gray-500" /> <span className="text-gray-700">{user?.email}</span></div>
                                <div className="flex items-center"><FaUserTag className="mr-3 text-gray-500" /> <span className="capitalize font-semibold text-blue-600">{profile?.role}</span></div>
                            </div>
                        </div>

                        {/* Role Management Card */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Role Management</h2>
                            {profile?.role === 'tourist' && (
                                <>
                                    <p className="text-gray-600 mb-4">Want to list your own vehicles? Become a host!</p>
                                    <button onClick={() => upgradeMutation.mutate()} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                                        Become a Host
                                    </button>
                                </>
                            )}
                            {profile?.role === 'host' && (
                                <>
                                    <p className="text-gray-600 mb-4">Switch back to a tourist account. Your vehicle listings will be archived.</p>
                                    <button onClick={() => downgradeMutation.mutate()} className="w-full bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors">
                                        Switch to Tourist
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Bookings */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Bookings</h2>
                            {bookings && bookings.length > 0 ? (
                                <ul className="space-y-6">
                                    {bookings.map(booking => {
                                        const existingReview = booking.reviews && booking.reviews[0];
                                        return (
                                            <li key={booking.id} className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4">
                                                <img src={booking.vehicles.image_urls?.[0] || 'https://via.placeholder.com/150'} alt="Vehicle" className="w-32 h-20 object-cover rounded-md flex-shrink-0" />
                                                <div className="flex-grow text-center sm:text-left">
                                                    <Link to={`/vehicle/${booking.vehicles.id}`} className="font-bold text-lg text-gray-800 hover:text-blue-600">{booking.vehicles.make} {booking.vehicles.model}</Link>
                                                    <p className={`text-sm font-semibold mt-1 capitalize ${getStatusClasses(booking.status)} inline-block px-2 py-0.5 rounded-full`}>{booking.status}</p>
                                                    {existingReview && (
                                                        <div className="flex items-center mt-2 justify-center sm:justify-start">
                                                            <span className="text-yellow-500 flex items-center">{[...Array(5)].map((_, i) => i < existingReview.rating ? <FaStar key={i} /> : <FaRegStar key={i} />)}</span>
                                                            <span className="text-sm ml-2 text-gray-600">Your Rating: {existingReview.rating}/5</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-shrink-0 gap-2">
                                                    {booking.status === 'confirmed' && (
                                                        <button onClick={() => handleCancelBooking(booking.id)} className="bg-red-500 text-white text-xs font-semibold py-1 px-3 rounded-full hover:bg-red-600 transition-colors">Cancel</button>
                                                    )}
                                                    {booking.status !== 'cancelled' && (
                                                        existingReview ? (
                                                            <>
                                                                <button onClick={() => handleEditReview(existingReview)} className="bg-gray-200 text-gray-700 text-xs font-semibold py-1 px-3 rounded-full hover:bg-gray-300">Edit Review</button>
                                                                <button onClick={() => handleDeleteReview(existingReview.id)} className="bg-gray-200 text-gray-700 text-xs font-semibold py-1 px-3 rounded-full hover:bg-gray-300">Delete</button>
                                                            </>
                                                        ) : (
                                                            <button onClick={() => handleCreateReview(booking)} className="bg-blue-500 text-white text-xs font-semibold py-1 px-3 rounded-full hover:bg-blue-600">Review</button>
                                                        )
                                                    )}
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-500 py-8">You have not made any bookings yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;