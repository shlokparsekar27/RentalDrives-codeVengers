// src/pages/VehicleReviews.jsx
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaStar, FaRegStar, FaUserCircle } from 'react-icons/fa';

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
        return <div className="text-center p-10 font-bold text-xl">Loading Reviews...</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-3xl mx-auto">
                    {/* --- NEW: Improved Responsive Header --- */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        {/* The title section */}
                        <div className="text-center sm:text-left">
                            <h1 className="text-3xl font-extrabold text-gray-900">
                                Reviews for {vehicle?.make} {vehicle?.model}
                            </h1>
                            <p className="mt-2 text-gray-600">See what other renters have to say.</p>
                        </div>

                        {/* The back button */}
                        <Link 
                            to={`/vehicle/${id}`} 
                            className="w-full sm:w-auto flex-shrink-0 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg border-2 border-blue-600  hover:bg-blue-700 transition-all text-center"
                        >
                            &larr; Back to Details
                        </Link>
                    </div>

                    {reviews && reviews.length > 0 ? (
                        <div className="space-y-6">
                            {reviews.map(review => (
                                <div key={review.id} className="bg-white p-6 rounded-xl shadow-md">
                                    <div className="flex items-center mb-4">
                                        <FaUserCircle size={40} className="text-gray-400 mr-4" />
                                        <div>
                                            <p className="font-bold text-gray-800">{review.profiles?.full_name || 'Anonymous'}</p>
                                            <div className="flex items-center text-sm text-yellow-500">
                                                {[...Array(5)].map((_, i) => i < review.rating ? <FaStar key={i} /> : <FaRegStar key={i} />)}
                                                <span className="ml-2 text-gray-600 font-semibold">{review.rating}/5</span>
                                            </div>
                                        </div>
                                    </div>
                                    {review.comment && <p className="text-gray-700 italic">"{review.comment}"</p>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
                            <p className="text-gray-600">No reviews yet for this vehicle.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VehicleReviews;
