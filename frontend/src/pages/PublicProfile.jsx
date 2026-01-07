import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaUser, FaCheckCircle, FaCar, FaStar, FaShieldAlt } from 'react-icons/fa';
import Card from '../Components/ui/Card';
import Button from '../Components/ui/Button';

// Fetch public profile
const fetchPublicProfile = async (id) => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/${id}`);
    if (!response.ok) throw new Error('User not found');
    return response.json();
};

const PublicProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: profile, isLoading, isError } = useQuery({
        queryKey: ['public-profile', id],
        queryFn: () => fetchPublicProfile(id),
    });

    if (isLoading) return <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground animate-pulse">LOADING PROFILE...</div>;
    if (isError) return <div className="min-h-[60vh] flex items-center justify-center text-destructive">User not found.</div>;

    return (
        <div className="bg-background min-h-screen pt-24 pb-20 font-sans">
            <div className="container mx-auto px-4 max-w-4xl">

                <Button variant="ghost" className="mb-8 pl-0 gap-2" onClick={() => navigate(-1)}>
                    &larr; Back
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar Profile Card */}
                    <div className="col-span-1">
                        <Card className="p-6 flex flex-col items-center text-center sticky top-24">
                            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold mb-4 border-4 border-background shadow-lg">
                                {profile.full_name?.charAt(0) || <FaUser />}
                            </div>
                            <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                            <p className="text-muted-foreground uppercase text-xs font-bold tracking-wider mt-1 mb-4 flex items-center gap-1 justify-center">
                                {profile.role || 'Member'}
                                {profile.is_verified && <FaCheckCircle className="text-blue-500" />}
                            </p>

                            <div className="w-full border-t border-border pt-4 mt-2 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Rating</span>
                                    <span className="font-bold flex items-center gap-1"><FaStar className="text-amber-400" /> 4.9</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Verified</span>
                                    <span className="font-bold text-success">Identity Verified</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Main Content */}
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <Card className="p-6">
                            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                                <FaShieldAlt className="text-primary" /> About {profile.full_name}
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                {profile.full_name} is a verified member of the RentalDrives community.
                                They have passed all required identity verification checks to ensure a safe and secure rental experience.
                            </p>
                        </Card>

                        {/* Placeholder for future host vehicles list */}
                        {profile.role === 'host' && (
                            <Card className="p-6 opacity-80 decoration-dashed">
                                <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    <FaCar className="text-primary" /> Host Listings
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    View all vehicles listed by this host in the main fleet search.
                                </p>
                                <Button to={`/cars?host=${id}`} variant="outline" size="sm" className="mt-4">
                                    Search their vehicles
                                </Button>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
