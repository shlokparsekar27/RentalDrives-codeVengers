// src/pages/Profile.jsx
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import "../styles/Profile.css";

// --- Data Fetching and Mutation Functions ---
const fetchUserProfile = async (userId) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) throw new Error(error.message);
    return data;
};

const fetchUserBookings = async (userId) => {
    // CORRECTED: Now fetches reviews linked to each booking
    const { data, error } = await supabase.from('bookings').select('*, vehicles(*), reviews(*)').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

// --- Role Change Mutations ---
const upgradeToHost = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me/upgrade-to-tourist`, {
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
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me/downgrade-to-host`, {
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

const createReview = async ({ booking, rating, comment }) => {
    const { data, error } = await supabase.from('reviews').insert([{
        booking_id: booking.id,
        vehicle_id: booking.vehicles.id,
        user_id: booking.user_id,
        rating,
        comment,
    }]).select();
    if (error) throw new Error(error.message);
    return data;
};

const updateReview = async ({ reviewId, rating, comment }) => {
    const { data, error } = await supabase.from('reviews').update({ rating, comment }).eq('id', reviewId).select();
    if (error) throw new Error(error.message);
    return data;
}

const deleteReview = async (reviewId) => {
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
    if (error) throw new Error(error.message);
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

    const upgradeMutation = useMutation({
        mutationFn: upgradeToHost,
        onSuccess: () => {
            alert('You have been upgraded to a Host!');
            queryClient.invalidateQueries({ queryKey: ['profile', user?.id] }); // Refetch profile
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    const downgradeMutation = useMutation({
        mutationFn: downgradeToTourist,
        onSuccess: () => {
            alert('You have been downgraded to a Tourist.');
            queryClient.invalidateQueries({ queryKey: ['profile', user?.id] }); // Refetch profile
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    const reviewMutation = useMutation({
        mutationFn: createReview,
        onSuccess: () => {
            alert('Thank you for your review!');
            refetchBookings(); // Refetch bookings to show the new review state
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
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


            {/* --- Role Change Buttons --- */}
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
                                        {existingReview ? (
                                            <>
                                                <button className="edit-btn" onClick={() => handleEditReview(existingReview)}>Edit Review</button>
                                                <button className="delete-btn" onClick={() => handleDeleteReview(existingReview.id)}>Delete Review</button>
                                            </>
                                        ) : (
                                            <button className="review-btn" onClick={() => handleCreateReview(booking)}>Leave a Review</button>
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