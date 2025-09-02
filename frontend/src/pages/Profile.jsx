// src/pages/Profile.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { FaUser, FaEnvelope, FaUserTag, FaStar, FaRegStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

// --- Review Modal Component ---
function ReviewModal({ booking, review, onClose, onSubmit }) {
    const [rating, setRating] = useState(review?.rating || 0);
    const [comment, setComment] = useState(review?.comment || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Please select a rating.');
            return;
        }
        onSubmit({ rating, comment });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">
                    {review ? 'Edit Your Review' : 'Write a Review'}
                </h2>
                <p className="text-gray-600 mb-6">For your booking of the {booking.vehicles.make} {booking.vehicles.model}</p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Your Rating</label>
                        <div className="flex space-x-2 text-3xl text-yellow-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button type="button" key={star} onClick={() => setRating(star)} className="focus:outline-none">
                                    {star <= rating ? <FaStar /> : <FaRegStar />}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="comment" className="block text-gray-700 font-semibold mb-2">Your Comments</label>
                        <textarea
                            id="comment"
                            rows="4"
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="How was your experience?"
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Submit Review
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

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

// REMOVED upgradeToHost and downgradeToTourist functions

const cancelBooking = async (bookingId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel booking');
    }
    return response.json();
};

const createReview = async ({ booking, rating, comment }) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({
            booking_id: booking.id,
            vehicle_id: booking.vehicle_id,
            rating,
            comment,
        }),
    });
    if (!response.ok) throw new Error('Failed to create review.');
    return response.json();
};

const updateReview = async ({ reviewId, rating, comment }) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ rating, comment }),
    });
    if (!response.ok) throw new Error('Failed to update review.');
    return response.json();
};

const deleteReview = async (reviewId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) throw new Error('Failed to delete review.');
};


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
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [currentReviewData, setCurrentReviewData] = useState({ booking: null, review: null });

    const { data: profile, isLoading: isLoadingProfile } = useQuery({
        enabled: !!user?.id,
        queryKey: ['profile', user?.id],
        queryFn: () => fetchUserProfile(user.id),
    });

    const { data: bookings, isLoading: isLoadingBookings } = useQuery({
        enabled: !!user?.id && profile?.role !== 'admin',
        queryKey: ['bookings', user?.id],
        queryFn: () => fetchUserBookings(user.id),
    });

    // REMOVED upgradeMutation and downgradeMutation
    
    const cancelBookingMutation = useMutation({
        mutationFn: cancelBooking,
        onSuccess: () => {
            alert('Booking cancelled successfully.');
            queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] });
        },
        onError: (error) => {
            alert(`Error: ${error.message}`);
        },
    });

    const createReviewMutation = useMutation({
        mutationFn: createReview,
        onSuccess: () => {
            alert('Review submitted successfully!');
            queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] });
            setReviewModalOpen(false);
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    const updateReviewMutation = useMutation({
        mutationFn: updateReview,
        onSuccess: () => {
            alert('Review updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] });
            setReviewModalOpen(false);
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    const deleteReviewMutation = useMutation({
        mutationFn: deleteReview,
        onSuccess: () => {
            alert('Review deleted successfully!');
            queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] });
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    const handleCancelBooking = (bookingId) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            cancelBookingMutation.mutate(bookingId);
        }
    };

    const handleCreateReview = (booking) => {
        setCurrentReviewData({ booking, review: null });
        setReviewModalOpen(true);
    };

    const handleEditReview = (booking, review) => {
        setCurrentReviewData({ booking, review });
        setReviewModalOpen(true);
    };

    const handleDeleteReview = (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            deleteReviewMutation.mutate(reviewId);
        }
    };

    const handleReviewSubmit = ({ rating, comment }) => {
        if (currentReviewData.review) {
            updateReviewMutation.mutate({ reviewId: currentReviewData.review.id, rating, comment });
        } else {
            createReviewMutation.mutate({ booking: currentReviewData.booking, rating, comment });
        }
    };

    if (isLoadingProfile || isLoadingBookings) {
        return <div className="text-center p-10 font-bold text-xl">Loading Profile...</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            {isReviewModalOpen && (
                <ReviewModal
                    booking={currentReviewData.booking}
                    review={currentReviewData.review}
                    onClose={() => setReviewModalOpen(false)}
                    onSubmit={handleReviewSubmit}
                />
            )}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Your Profile</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Details</h2>
                            <div className="space-y-4">
                                <div className="flex items-center"><FaUser className="mr-3 text-gray-500" /> <span className="text-gray-700">{profile?.full_name}</span></div>
                                <div className="flex items-center"><FaEnvelope className="mr-3 text-gray-500" /> <span className="text-gray-700">{user?.email}</span></div>
                                <div className="flex items-center"><FaUserTag className="mr-3 text-gray-500" /> <span className="capitalize font-semibold text-blue-600">{profile?.role}</span></div>
                            </div>
                        </div>
                        {/* REMOVED the entire Role Management card div */}
                    </div>
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">My Bookings</h2>
                            {bookings && bookings.length > 0 ? (
                                <ul className="space-y-6">
                                    {bookings.map(booking => {
                                        const existingReview = booking.vehicles.reviews?.find(r => r.booking_id === booking.id);
                                        return (
                                            <li key={booking.id} className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                                <img src={booking.vehicles.image_urls?.[0] || 'https://via.placeholder.com/150'} alt="Vehicle" className="w-32 h-20 object-cover rounded-md flex-shrink-0" />
                                                <div className="flex-grow text-center sm:text-left">
                                                    <Link to={`/vehicle/${booking.vehicle_id}`} className="font-bold text-lg text-gray-800 hover:text-blue-600">{booking.vehicles.make} {booking.vehicles.model}</Link>
                                                    <p className={`text-sm font-semibold mt-1 capitalize ${getStatusClasses(booking.status)} inline-block px-2 py-0.5 rounded-full`}>{booking.status}</p>
                                                    {existingReview && (
                                                        <div className="flex items-center mt-2 justify-center sm:justify-start">
                                                            <span className="text-yellow-500 flex items-center">{[...Array(5)].map((_, i) => i < existingReview.rating ? <FaStar key={i} /> : <FaRegStar key={i} />)}</span>
                                                            <span className="text-sm ml-2 text-gray-600">Your Rating: {existingReview.rating}/5</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-shrink-0 gap-2 self-center sm:self-auto">
                                                    {booking.status === 'confirmed' && ( <button onClick={() => handleCancelBooking(booking.id)} disabled={cancelBookingMutation.isPending} className="bg-red-500 text-white text-xs font-semibold py-1 px-3 rounded-full hover:bg-red-600 transition-colors disabled:bg-gray-400">Cancel</button> )}
                                                    {booking.status !== 'cancelled' && (
                                                        existingReview ? (
                                                            <>
                                                                <button onClick={() => handleEditReview(booking, existingReview)} className="bg-gray-200 text-gray-700 text-xs font-semibold py-1 px-3 rounded-full hover:bg-gray-300">Edit</button>
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

