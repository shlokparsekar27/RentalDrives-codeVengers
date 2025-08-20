// src/pages/Profile.jsx
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import "../styles/Profile.css";

// --- Data Fetching and Mutation Functions ---
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

// --- Role Change Mutations ---
const upgradeToHost = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me/upgrade-to-host`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    }
  });
  if (!response.ok) {
    throw new Error('Failed to upgrade to host');
  }
  return response.json();
}

const downgradeToTourist = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me/downgrade-to-tourist`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
    }
  });
  if (!response.ok) {
    throw new Error('Failed to downgrade to tourist');
  }
  return response.json();
}

// --- Review Mutations ---
const createReview = async ({ booking, rating, comment }) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
            booking_id: booking.id,
            vehicle_id: booking.vehicles.id,
            rating,
            comment,
        }),
    });
    if (!response.ok) throw new Error('Failed to create review');
    return response.json();
};

const updateReview = async ({ reviewId, rating, comment }) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ rating, comment }),
    });
    if (!response.ok) throw new Error('Failed to update review');
    return response.json();
}

const deleteReview = async (reviewId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) throw new Error('Failed to delete review');
}

// --- NEW: Booking Cancellation Mutation ---
const cancelBooking = async (bookingId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH', // Using PATCH as it's an update operation
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
        },
    });
    if (!response.ok) {
        throw new Error('Failed to cancel booking');
    }
    return response.json();
}


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

    // --- Role Change Mutations ---
    const upgradeMutation = useMutation({
        mutationFn: upgradeToHost,
        onSuccess: () => {
            alert('You have been upgraded to a Host!');
            queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    const downgradeMutation = useMutation({
        mutationFn: downgradeToTourist,
        onSuccess: () => {
            alert('You have been downgraded to a Tourist.');
            queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    // --- Review Mutations ---
    const reviewMutation = useMutation({
        mutationFn: createReview,
        onSuccess: () => {
            alert('Thank you for your review!');
            refetchBookings();
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    const updateReviewMutation = useMutation({
        mutationFn: updateReview,
        onSuccess: () => {
            alert('Review updated!');
            refetchBookings();
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    const deleteReviewMutation = useMutation({
        mutationFn: deleteReview,
        onSuccess: () => {
            alert('Review deleted.');
            refetchBookings();
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    // --- NEW: Booking Cancellation Mutation Hook ---
    const cancelBookingMutation = useMutation({
        mutationFn: cancelBooking,
        onSuccess: () => {
            alert('Booking successfully cancelled.');
            refetchBookings(); // Refetch bookings to update the status in the UI
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });


    // --- Event Handlers ---
    const handleCreateReview = (booking) => {
        const rating = prompt("Please enter a rating (1-5):");
        if (!rating || isNaN(rating) || rating < 1 || rating > 5) return alert("Invalid rating.");
        const comment = prompt("Please leave a comment:");
        if (comment) reviewMutation.mutate({ booking, rating: parseInt(rating), comment });
    };

    const handleEditReview = (review) => {
        const newRating = prompt("Enter a new rating (1-5):", review.rating);
        if (!newRating || isNaN(newRating) || newRating < 1 || newRating > 5) return alert("Invalid rating.");
        const newComment = prompt("Enter a new comment:", review.comment);
        if (newComment) updateReviewMutation.mutate({ reviewId: review.id, rating: parseInt(newRating), comment: newComment });
    };

    const handleDeleteReview = (reviewId) => {
        if (confirm("Are you sure you want to delete this review?")) {
            deleteReviewMutation.mutate(reviewId);
        }
    };
    
    // --- NEW: Cancel Booking Handler ---
    const handleCancelBooking = (bookingId) => {
        if (confirm("Are you sure you want to cancel this booking?")) {
            cancelBookingMutation.mutate(bookingId);
        }
    }


    if (isLoadingProfile || isLoadingBookings) {
        return <div className="profile-container"><h2>Loading Profile...</h2></div>;
    }

    return (
        <div className="profile-container">
            <h2>Your Profile</h2>
            <div className="profile-details card">
                <p><strong>Full Name:</strong> {profile?.full_name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> {profile?.role}</p>
            </div>

            <div className="role-actions">
                {profile?.role === 'tourist' && (
                    <button className="upgrade-btn" onClick={() => upgradeMutation.mutate()}>
                        Become a Host
                    </button>
                )}
                {profile?.role === 'host' && (
                    <button className="downgrade-btn" onClick={() => downgradeMutation.mutate()}>
                        Switch to Tourist Account
                    </button>
                )}
            </div>

            <div className="bookings-section">
                <h2>My Bookings</h2>
                {bookings && bookings.length > 0 ? (
                    <ul className="booking-list">
                        {bookings.map(booking => {
                            const existingReview = booking.reviews && booking.reviews[0];
                            return (
                                <li key={booking.id} className="booking-card card">
                                    <img src={booking.vehicles.image_urls?.[0] || 'https://via.placeholder.com/150'} alt="Vehicle" />
                                    <div className="booking-info">
                                        <strong>{booking.vehicles.make} {booking.vehicles.model}</strong>
                                        <p>Status: <span className={`status-${booking.status}`}>{booking.status}</span></p>
                                        {existingReview && <div><p>Your Rating: {existingReview.rating}/5</p></div>}
                                    </div>
                                    <div className="booking-actions">
                                        {/* --- NEW: Conditional Button Logic --- */}
                                        {booking.status === 'confirmed' && (
                                            <button className="cancel-btn" onClick={() => handleCancelBooking(booking.id)}>
                                                Cancel Booking
                                            </button>
                                        )}

                                        {booking.status !== 'cancelled' && (
                                            existingReview ? (
                                                <>
                                                    <button className="edit-btn" onClick={() => handleEditReview(existingReview)}>Edit Review</button>
                                                    <button className="delete-btn" onClick={() => handleDeleteReview(existingReview.id)}>Delete Review</button>
                                                </>
                                            ) : (
                                                <button className="review-btn" onClick={() => handleCreateReview(booking)}>Leave a Review</button>
                                            )
                                        )}
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                ) : (
                    <p>You have not made any bookings yet.</p>
                )}
            </div>
        </div>
    );
}

export default Profile;