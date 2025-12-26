// src/pages/VehicleReviews.jsx
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaStar, FaRegStar, FaUserCircle } from 'react-icons/fa';
import Button from '../Components/ui/Button';

// --- API Functions ---
// Fetches just the vehicle's name for the page header
const fetchVehicleInfo = async (vehicleId) => {
    const { data, error } = await supabase
        .from('vehicles')
        .select('make, model')
        .eq('id', vehicleId)
        .single();
    if (error) throw new Error(error.message);
    return data;
};

// Fetches all reviews for a specific vehicle
const fetchReviewsForVehicle = async (vehicleId) => {
    const { data, error } = await supabase
        .from('reviews')
        .select(`*, profiles ( full_name )`)
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false }); // Show newest first
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

    const isLoading = isLoadingVehicle || isLoadingReviews;

    if (isLoading) {
        return <div className="min-h-screen pt-32 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 font-medium text-lg">Loading Reviews...</div>;
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-3xl mx-auto">
                    {/* --- Improved Responsive Header --- */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        {/* The title section */}
                        <div className="text-center sm:text-left">
                            <h1 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">
                                Reviews for <span className="text-blue-600 dark:text-blue-400">{vehicle?.make} {vehicle?.model}</span>
                            </h1>
                            <p className="mt-2 text-slate-600 dark:text-slate-400">See what other renters have to say.</p>
                        </div>

                        {/* The back button */}
                        <Button to={`/vehicle/${id}`} variant="outline">
                            &larr; Back to Details
                        </Button>
                    </div>

                    {reviews && reviews.length > 0 ? (
                        <div className="space-y-6">
                            {reviews.map(review => (
                                <div key={review.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-md border border-slate-100 dark:border-slate-800 transition-colors">
                                    <div className="flex items-center mb-4">
                                        <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-2 mr-4">
                                            <FaUserCircle size={32} className="text-slate-400 dark:text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white">{review.profiles?.full_name || 'Anonymous'}</p>
                                            <div className="flex items-center text-sm text-yellow-500">
                                                {[...Array(5)].map((_, i) => i < review.rating ? <FaStar key={i} /> : <FaRegStar key={i} className="text-slate-300 dark:text-slate-600" />)}
                                                <span className="ml-2 text-slate-600 dark:text-slate-400 font-semibold">{review.rating}/5</span>
                                            </div>
                                        </div>
                                    </div>
                                    {review.comment && <p className="text-slate-700 dark:text-slate-300 italic">"{review.comment}"</p>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 text-center transition-colors">
                            <p className="text-slate-600 dark:text-slate-400">No reviews yet for this vehicle.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VehicleReviews;
