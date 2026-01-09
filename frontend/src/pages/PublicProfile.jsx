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

    const StatusBadge = ({ isVerified }) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isVerified ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20' : 'bg-secondary text-muted-foreground border border-border'}`}>
            {isVerified ? <><FaCheckCircle size={10} /> Verified</> : 'Unverified'}
        </span>
    );

    return (
        <div className="bg-background min-h-[100dvh] pt-20 md:pt-24 pb-20 font-sans">
            <div className="container mx-auto px-4 lg:px-8 max-w-4xl">

                <Button variant="ghost" className="mb-6 pl-0 gap-2 hover:bg-transparent hover:text-primary" onClick={() => navigate(-1)}>
                    &larr; Back
                </Button>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-6 md:mb-8 animate-fade-in-up">
                    <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-4xl border border-primary/20 flex-shrink-0 shadow-xl shadow-primary/5 uppercase">
                            {profile.full_name?.charAt(0) || <FaUser />}
                        </div>
                        <div className="flex-grow space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">{profile.full_name}</h1>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="font-mono uppercase text-xs font-bold border border-border px-2 py-0.5 rounded bg-secondary/50 text-muted-foreground">{profile.role || 'Member'}</span>
                                <StatusBadge isVerified={profile.is_verified} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content: Overview Grid */}
                <div className="grid grid-cols-1 gap-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    <Card className="p-0 overflow-hidden border border-border/60 shadow-sm">
                        <div className="p-4 md:p-6 border-b border-border/60 bg-secondary/20">
                            <h3 className="font-bold text-lg flex items-center gap-2"><FaShieldAlt className="text-primary" /> Public Profile</h3>
                        </div>

                        <div className="p-0 divide-y divide-border/60">
                            <div className="grid grid-cols-1 md:grid-cols-3 p-4 md:p-6 gap-2 md:gap-0 hover:bg-secondary/10 transition-colors">
                                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Full Name</span>
                                <span className="md:col-span-2 font-medium text-base text-foreground break-words">{profile.full_name}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 p-4 md:p-6 gap-2 md:gap-0 hover:bg-secondary/10 transition-colors">
                                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Account Role</span>
                                <span className="md:col-span-2 font-medium text-base text-foreground capitalize">{profile.role || 'User'}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 p-4 md:p-6 gap-2 md:gap-0 hover:bg-secondary/10 transition-colors">
                                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Verification Status</span>
                                <span className="md:col-span-2 flex items-center">
                                    <StatusBadge isVerified={profile.is_verified} />
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 p-4 md:p-6 gap-2 md:gap-0 hover:bg-secondary/10 transition-colors">
                                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Primary Phone</span>
                                <span className="md:col-span-2 font-medium text-base text-foreground font-mono">{profile.phone_primary || '-'}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 p-4 md:p-6 gap-2 md:gap-0 hover:bg-secondary/10 transition-colors">
                                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Secondary Phone</span>
                                <span className="md:col-span-2 font-medium text-base text-foreground font-mono">{profile.phone_secondary || '-'}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 p-4 md:p-6 gap-2 md:gap-0 hover:bg-secondary/10 transition-colors">
                                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Address</span>
                                <span className="md:col-span-2 font-medium text-base text-foreground break-words">{profile.address || '-'}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
