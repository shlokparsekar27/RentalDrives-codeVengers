// src/pages/VehicleReviews.jsx
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaStar, FaRegStar, FaUser, FaArrowLeft, FaQuoteLeft } from 'react-icons/fa';
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

function VehicleReviews() {
    const { id } = useParams();

    const { data: vehicle, isLoading: isLoadingVehicle } = useQuery({
        queryKey: ['vehicleInfo', id],
        queryFn: () => fetchVehicleInfo(id),
    });

    const { data: reviews, isLoading: isLoadingReviews } = useQuery({
        queryKey: ['reviewsForVehicle', id],
        queryFn: () => fetchReviewsForVehicle(id),
    });

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

                    <Button to={`/vehicle/${id}`} variant="outline" className="gap-2">
                        <FaArrowLeft /> Back to Vehicle
                    </Button>
                </div>

                {/* Reviews List */}
                {reviews && reviews.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {reviews.map(review => (
                            <Card key={review.id} className="p-6 md:p-8 animate-fade-in-up hover:border-primary/30 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                                        <FaUser />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-foreground">{review.profiles?.full_name || 'Verified User'}</h4>
                                                <div className="flex text-yellow-400 text-sm mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i}>{i < review.rating ? <FaStar /> : <FaRegStar className="text-muted-foreground/30" />}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </span>
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
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-secondary/10 rounded-2xl border border-dashed border-border text-muted-foreground">
                        <FaRegStar className="mx-auto text-4xl mb-4 opacity-20" />
                        <p>No reviews yet. Be the first to rent and review!</p>
                    </div>
                )}

            </div>
        </div>
    );
}

export default VehicleReviews;
