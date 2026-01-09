// src/pages/VehicleReviews.jsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { FaStar, FaRegStar, FaUser, FaArrowLeft, FaQuoteLeft, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';

// --- API Functions ---
const fetchVehicleInfo = async (vehicleId) => {
    const { data, error } = await supabase
        .from('vehicles')
        .select('make, model, image_urls')
        .eq('id', vehicleId)
        .single();
    if (error) throw new Error(error.message);
    return data;
};

const fetchReviewsForVehicle = async (vehicleId) => {
    const { data, error } = await supabase
        .from('reviews')
        .select(`*, profiles ( full_name )`)
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
};

const createReview = async ({ booking_id, vehicle_id, rating, comment }) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ booking_id, vehicle_id, rating, comment }),
    });
    if (!response.ok) throw new Error('Failed to post review');
    return response.json();
};

const updateReview = async ({ reviewId, rating, comment }) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ rating, comment }),
    });
    if (!response.ok) throw new Error('Failed to update review');
    return response.json();
};

const deleteReview = async (reviewId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) throw new Error('Failed to delete review');
    return response.json();
};

// --- Modal Component ---
function ReviewModal({ vehicleName, existingReview, onClose, onSubmit }) {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [comment, setComment] = useState(existingReview?.comment || '');

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl animate-fade-in-up">
                <div className="p-6 border-b border-border">
                    <h3 className="text-xl font-bold">{existingReview ? 'Edit Review' : 'Rate Your Trip'}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{vehicleName}</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSubmit({ rating, comment }); }} className="p-6 space-y-6">
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button type="button" key={star} onClick={() => setRating(star)} className="text-3xl focus:outline-none transition-transform hover:scale-110">
                                {star <= rating ? <FaStar className="text-amber-400" /> : <FaRegStar className="text-muted-foreground" />}
                            </button>
                        ))}
                    </div>
                    <textarea
                        className="w-full p-3 bg-secondary rounded-lg border border-input focus:ring-2 focus:ring-primary outline-none min-h-[100px]"
                        placeholder="Share your experience..."
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                    />
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={onClose} size="sm">Back</Button>
                        <Button type="submit" variant="primary" size="sm" disabled={rating === 0}>Submit</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}

function VehicleReviews() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const bookingId = searchParams.get('booking_id');
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingReview, setEditingReview] = useState(null);

    const { data: vehicle, isLoading: isLoadingVehicle } = useQuery({
        queryKey: ['vehicleInfo', id],
        queryFn: () => fetchVehicleInfo(id),
    });

    const { data: reviews, isLoading: isLoadingReviews } = useQuery({
        queryKey: ['reviewsForVehicle', id],
        queryFn: () => fetchReviewsForVehicle(id),
    });

    // Auto-open modal if booking_id is present and user hasn't reviewed yet?
    // Let's just render a button for better UX control
    useEffect(() => {
        if (bookingId && !isLoadingReviews && reviews) {
            const hasReviewed = reviews.some(r => r.user_id === user?.id);
            if (!hasReviewed) {
                setEditingReview(null);
                setModalOpen(true);
            }
        }
    }, [bookingId, isLoadingReviews, reviews, user]);


    const createMutation = useMutation({
        mutationFn: createReview,
        onSuccess: () => { queryClient.invalidateQueries(['reviewsForVehicle', id]); setModalOpen(false); alert("Review posted!"); }
    });

    const updateMutation = useMutation({
        mutationFn: updateReview,
        onSuccess: () => { queryClient.invalidateQueries(['reviewsForVehicle', id]); setModalOpen(false); alert("Review updated!"); }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteReview,
        onSuccess: () => { queryClient.invalidateQueries(['reviewsForVehicle', id]); alert("Review deleted."); }
    });

    const handleSubmit = ({ rating, comment }) => {
        if (editingReview) {
            updateMutation.mutate({ reviewId: editingReview.id, rating, comment });
        } else {
            if (!bookingId) return alert("Booking ID missing.");
            createMutation.mutate({ booking_id: bookingId, vehicle_id: id, rating, comment });
        }
    };

    if (isLoadingVehicle || isLoadingReviews) {
        return <div className="min-h-screen pt-24 text-center font-mono animate-pulse text-muted-foreground">LOADING REVIEWS...</div>;
    }

    const averageRating = reviews?.length
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className="bg-background min-h-screen pt-24 pb-20 font-sans">
            <div className="container mx-auto px-4 max-w-4xl">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-border pb-8">
                    <div className="flex items-center gap-6">
                        {vehicle?.image_urls?.[0] && (
                            <img src={vehicle.image_urls[0]} alt="Vehicle" className="w-24 h-24 object-cover rounded-xl border border-border shadow-sm hidden sm:block" />
                        )}
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                    {vehicle?.make} {vehicle?.model}
                                </h1>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="flex items-center text-yellow-500 font-bold">
                                    <FaStar className="mr-1" /> {averageRating}
                                </span>
                                <span>•</span>
                                <span>{reviews?.length || 0} Reviews</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        {bookingId && !reviews?.some(r => r.user_id === user?.id) && (
                            <Button onClick={() => { setEditingReview(null); setModalOpen(true); }} variant="primary" className="shadow-lg shadow-primary/20">
                                <FaPlus className="mr-2" /> Write Review
                            </Button>
                        )}
                        <Button to={`/vehicle/${id}`} variant="outline" className="gap-2">
                            <FaArrowLeft /> Back to Vehicle
                        </Button>
                    </div>
                </div>

                {/* Reviews List */}
                {reviews && reviews.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {reviews.map(review => {
                            const isMyReview = user && review.user_id === user.id;
                            return (
                                <Card key={review.id} className={`p-6 md:p-8 animate-fade-in-up transition-colors ${isMyReview ? 'border-primary/50 bg-primary/5' : 'hover:border-primary/30'}`}>
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                                            <FaUser />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-bold text-foreground">
                                                        {review.profiles?.full_name || 'Verified User'}
                                                        {isMyReview && <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">You</span>}
                                                    </h4>
                                                    <div className="flex text-yellow-400 text-sm mt-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i}>{i < review.rating ? <FaStar /> : <FaRegStar className="text-muted-foreground/30" />}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs text-muted-foreground font-mono block mb-1">
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                    </span>
                                                    {isMyReview && (
                                                        <div className="flex gap-2 justify-end">
                                                            <button onClick={() => { setEditingReview(review); setModalOpen(true); }} className="text-muted-foreground hover:text-primary transition-colors"><FaEdit size={14} /></button>
                                                            <button onClick={() => { if (confirm("Delete your review?")) deleteMutation.mutate(review.id); }} className="text-muted-foreground hover:text-destructive transition-colors"><FaTrash size={14} /></button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {review.comment && (
                                                <div className="relative mt-4 bg-secondary/20 p-4 rounded-xl">
                                                    <FaQuoteLeft className="absolute top-2 left-2 text-primary/10 text-2xl" />
                                                    <p className="text-muted-foreground italic relative z-10 pl-2">"{review.comment}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-secondary/10 rounded-2xl border border-dashed border-border text-muted-foreground">
                        <FaRegStar className="mx-auto text-4xl mb-4 opacity-20" />
                        <p>No reviews yet. Be the first to rent and review!</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <ReviewModal
                    vehicleName={`${vehicle?.make} ${vehicle?.model}`}
                    existingReview={editingReview}
                    onClose={() => setModalOpen(false)}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
}

export default VehicleReviews;
