// src/pages/VehicleReviews.jsx
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { FaStar, FaRegStar, FaUser, FaQuoteLeft, FaArrowLeft, FaFilter, FaCar } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Badge from '../Components/ui/Badge';

// --- API Functions ---
const fetchVehicleInfo = async (vehicleId) => {
    const { data, error } = await supabase.from('vehicles').select('make, model, image_urls').eq('id', vehicleId).single();
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

    const isLoading = isLoadingVehicle || isLoadingReviews;

    // Calculate Average Rating
    const averageRating = reviews?.length
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : "N/A";

    if (isLoading) return <div className="min-h-screen pt-32 text-center text-slate-500 font-mono bg-slate-50 dark:bg-[#020617] animate-pulse">LOADING FEEDBACK...</div>;

    return (
        <div className="bg-slate-50 dark:bg-[#020617] min-h-screen font-sans transition-colors duration-500 pb-24">

            {/* Cinematic Header */}
            <div className="relative bg-slate-900 dark:bg-black pt-24 pb-32 border-b border-slate-800 overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-blob"></div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-fade-in-up">
                    <div className="max-w-5xl mx-auto">
                        <Link to={`/vehicle/${id}`} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white flex items-center gap-2 mb-6 transition-colors group">
                            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Return to Vehicle
                        </Link>

                        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-display font-bold text-white flex items-center gap-4 mb-2">
                                    {vehicle?.make} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{vehicle?.model}</span>
                                </h1>
                                <p className="text-slate-400 text-lg">Detailed feedback from verified renters.</p>
                            </div>

                            <div className="flex items-center gap-6 bg-slate-800/50 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-700">
                                <div>
                                    <div className="text-3xl font-display font-bold text-white leading-none">{averageRating}</div>
                                    <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mt-1">Avg Rating</div>
                                </div>
                                <div className="h-8 w-px bg-slate-700"></div>
                                <div>
                                    <div className="text-3xl font-display font-bold text-white leading-none">{reviews?.length || 0}</div>
                                    <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mt-1">Reviews</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
                <div className="max-w-5xl mx-auto space-y-6">

                    {reviews && reviews.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {reviews.map((review, idx) => (
                                <div
                                    key={review.id}
                                    className="glass-card bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-8 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-500 group animate-fade-in-up"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >

                                    {/* User Column */}
                                    <div className="flex md:flex-col items-center md:items-start gap-4 md:w-56 flex-shrink-0">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-slate-400 group-hover:from-blue-500 group-hover:to-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                            <FaUser size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{review.profiles?.full_name || 'Verified Renter'}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="success" className="text-[10px] px-2 py-0.5">VERIFIED</Badge>
                                                <span className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Column */}
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-1 text-amber-400 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar key={i} size={18} className={i < review.rating ? "drop-shadow-md" : "text-slate-200 dark:text-slate-800"} />
                                            ))}
                                            <span className="ml-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                                {review.rating >= 5 ? 'Exceptional' : review.rating >= 4 ? 'Excellent' : review.rating >= 3 ? 'Average' : 'Below Average'}
                                            </span>
                                        </div>

                                        <div className="relative">
                                            <FaQuoteLeft className="absolute -top-2 -left-6 text-slate-200 dark:text-slate-800 text-3xl opacity-50" />
                                            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed relative z-10 font-light">
                                                "{review.comment}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass bg-white dark:bg-slate-900 rounded-3xl p-24 text-center border border-slate-200 dark:border-slate-800 animate-fade-in-up">
                            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300 dark:text-slate-600">
                                <FaQuoteLeft size={40} />
                            </div>
                            <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-3">No Reviews Yet</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-lg">
                                Be the first to share your experience with this {vehicle?.make} {vehicle?.model}.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VehicleReviews;
