// src/pages/Profile.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { FaUser, FaEnvelope, FaStar, FaRegStar, FaEdit, FaCheckCircle, FaIdCard, FaCar, FaCalendarAlt, FaCog, FaSignOutAlt, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';
import BookingDetailsModal from '../Components/BookingDetailsModal';

// --- API Functions ---
const fetchUserProfile = async (userId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
};

const updateUserProfile = async (profileData) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify(profileData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update profile');
    return data;
};

const uploadDocument = async ({ file, userId, bucket, profileKey }) => {
    if (!file) throw new Error("No file selected.");
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return updateUserProfile({ [profileKey]: data.publicUrl });
};

const fetchUserBookings = async (userId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/my-bookings`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
};

const cancelBooking = async (bookingId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) throw new Error('Cancellation failed');
    return response.json();
};



const createReview = async ({ booking, rating, comment }) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ booking_id: booking.id, vehicle_id: booking.vehicle_id, rating, comment }),
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


// --- Sub-Components ---


function ReviewModal({ booking, review, onClose, onSubmit }) {
    const [rating, setRating] = useState(review?.rating || 0);
    const [comment, setComment] = useState(review?.comment || '');

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-2xl animate-fade-in-up">
                <div className="p-6 border-b border-border">
                    <h3 className="text-xl font-bold">{review ? 'Edit Review' : 'Rate Your Trip'}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{booking.vehicles.make} {booking.vehicles.model}</p>
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

// --- Main Component ---
function Profile() {
    const { user, signOut } = useAuth();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // UI State
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [currentReviewData, setCurrentReviewData] = useState({ booking: null, review: null });

    const [docFile, setDocFile] = useState(null);
    const [licenseFile, setLicenseFile] = useState(null);

    const [isUpdatingLicense, setIsUpdatingLicense] = useState(false);
    const [isUpdatingHostDoc, setIsUpdatingHostDoc] = useState(false);

    // Booking Modal State
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);


    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterFuel, setFilterFuel] = useState('all');
    const [filterGear, setFilterGear] = useState('all');

    // Queries
    const { data: profile, isLoading } = useQuery({
        enabled: !!user?.id,
        queryKey: ['profile', user?.id],
        queryFn: () => fetchUserProfile(user.id),
    });

    const { data: bookings } = useQuery({
        enabled: !!user?.id && !!profile && profile.role !== 'admin',
        queryKey: ['bookings', user?.id],
        queryFn: () => fetchUserBookings(user.id),
    });

    // Mutations


    const docUploadMutation = useMutation({
        mutationFn: (vars) => uploadDocument(vars),
        onSuccess: () => { alert("Document uploaded."); queryClient.invalidateQueries(['profile']); setDocFile(null); setLicenseFile(null); }
    });

    const cancelMutation = useMutation({
        mutationFn: cancelBooking,
        onSuccess: () => queryClient.invalidateQueries(['bookings'])
    });

    const createReviewMutation = useMutation({
        mutationFn: createReview,
        onSuccess: () => { queryClient.invalidateQueries(['bookings']); setReviewModalOpen(false); alert("Review submitted."); }
    });

    const updateReviewMutation = useMutation({
        mutationFn: updateReview,
        onSuccess: () => { queryClient.invalidateQueries(['bookings']); setReviewModalOpen(false); alert("Review updated."); }
    });

    const handleReviewSubmit = ({ rating, comment }) => {
        if (currentReviewData.review) {
            updateReviewMutation.mutate({ reviewId: currentReviewData.review.id, rating, comment });
        } else {
            createReviewMutation.mutate({ booking: currentReviewData.booking, rating, comment });
        }
    };

    const handleCancelBooking = (id) => {
        if (confirm("Cancel this booking?")) cancelMutation.mutate(id);
    }

    const performLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const handleSignOut = () => {
        setShowLogoutConfirm(true);
    };

    if (isLoading) return <div className="min-h-[100dvh] pt-24 text-center font-mono animate-pulse text-muted-foreground">SYNCING PROFILE...</div>;

    const StatusBadge = ({ status }) => {
        let variant = 'neutral';
        if (status === 'confirmed') variant = 'success';
        if (status === 'cancelled') variant = 'destructive';
        if (status === 'completed') variant = 'primary';
        return <Badge variant={variant} className="uppercase text-[10px] tracking-wider">{status}</Badge>;
    };

    return (
        <div className="bg-background min-h-[100dvh] pt-20 md:pt-24 pb-20 font-sans">
            <div className="container mx-auto px-4 lg:px-8 max-w-6xl">

                {/* Mobile Header: Compact */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-8">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl border border-primary/20 flex-shrink-0 uppercase">
                            {(profile?.full_name || user?.user_metadata?.full_name)?.charAt(0) || <FaUser />}
                        </div>
                        <div className="flex-grow">
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground capitalize">{profile?.full_name || user?.user_metadata?.full_name || 'Valued Member'}</h1>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><FaEnvelope size={12} /> {user?.email}</span>
                                <span className="hidden md:inline w-1 h-1 bg-muted-foreground rounded-full"></span>
                                <span className="flex items-center gap-1 font-mono uppercase text-xs border border-border px-1 rounded">{profile?.role || user?.user_metadata?.role || 'User'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - Stacked on Mobile */}
                    <div className="flex gap-2 w-full md:w-auto">
                        {profile?.role === 'host' && <Button to="/host/dashboard" variant="primary" size="sm" className="flex-1 md:flex-none">Host Dashboard</Button>}
                        {profile?.role === 'admin' && <Button to="/admin/dashboard" variant="primary" size="sm" className="flex-1 md:flex-none">Admin Dashboard</Button>}
                        <Button onClick={handleSignOut} variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10 flex-1 md:flex-none">
                            <FaSignOutAlt className="md:hidden mr-1" />
                            Sign Out
                        </Button>
                    </div>
                </div>

                {/* Scrollable Tabs */}
                <div className="flex gap-6 border-b border-border mb-8 overflow-x-auto no-scrollbar tap-highlight-transparent">
                    {['overview', 'bookings', 'identity'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-sm font-semibold capitalize transition-all border-b-2 whitespace-nowrap px-1 ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* TAB: OVERVIEW */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 gap-6 animate-fade-in-up">
                        <Card className="p-0 overflow-hidden border border-border/60 shadow-sm">
                            <div className="p-6 border-b border-border/60 bg-secondary/20 flex justify-between items-center">
                                <h3 className="font-bold text-lg flex items-center gap-2"><FaUser className="text-primary" /> Personal Details</h3>
                                <Button variant="ghost" size="sm" onClick={() => navigate('/edit-profile')}><FaEdit /> Edit</Button>
                            </div>

                            <div className="p-0 divide-y divide-border/60">
                                <div className="grid grid-cols-1 md:grid-cols-3 p-6 gap-4 md:gap-0 hover:bg-secondary/10 transition-colors">
                                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Full Name</span>
                                    <span className="md:col-span-2 font-medium text-base text-foreground">{profile?.full_name || '-'}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 p-6 gap-4 md:gap-0 hover:bg-secondary/10 transition-colors">
                                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Primary Phone</span>
                                    <span className="md:col-span-2 font-medium text-base text-foreground font-mono">{profile?.phone_primary || '-'}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 p-6 gap-4 md:gap-0 hover:bg-secondary/10 transition-colors">
                                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Secondary Phone</span>
                                    <span className="md:col-span-2 font-medium text-base text-foreground font-mono">{profile?.phone_secondary || '-'}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 p-6 gap-4 md:gap-0 hover:bg-secondary/10 transition-colors">
                                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Address</span>
                                    <span className="md:col-span-2 font-medium text-base text-foreground">{profile?.address || '-'}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* TAB: BOOKINGS */}
                {activeTab === 'bookings' && (
                    <div className="space-y-6 animate-fade-in-up">
                        {/* Filter Toolbar */}
                        <Card className="p-4 bg-secondary/10 border-border/60">
                            <div className="flex flex-col gap-4">
                                {/* Search */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by vehicle name..."
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                    <span className="absolute left-3 top-2.5 text-muted-foreground"><FaCar /></span>
                                </div>

                                {/* Filters Row */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <select className="px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        value={filterType} onChange={e => setFilterType(e.target.value)}>
                                        <option value="all">All Types</option>
                                        <option value="Car">Cars</option>
                                        <option value="Bike">Bikes</option>
                                        <option value="Scooter">Scooters</option>
                                    </select>
                                    <select className="px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                        <option value="all">All Status</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="completed">Completed</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                    <select className="px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        value={filterGear} onChange={e => setFilterGear(e.target.value)}>
                                        <option value="all">All Transmissions</option>
                                        <option value="Automatic">Automatic</option>
                                        <option value="Manual">Manual</option>
                                    </select>
                                    <select className="px-3 py-2 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                        value={filterFuel} onChange={e => setFilterFuel(e.target.value)}>
                                        <option value="all">All Fuel</option>
                                        <option value="Petrol">Petrol</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Electric">Electric</option>
                                    </select>
                                </div>
                            </div>
                        </Card>

                        {/* List */}
                        {bookings?.filter(b => {
                            const v = b.vehicles || {};
                            const s = searchTerm.toLowerCase();
                            const matchesSearch = (v.make + ' ' + v.model).toLowerCase().includes(s);
                            const matchesType = filterType === 'all' || v.vehicle_type === filterType;
                            const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
                            const matchesFuel = filterFuel === 'all' || v.fuel_type === filterFuel;
                            const matchesGear = filterGear === 'all' || v.transmission === filterGear;
                            return matchesSearch && matchesType && matchesStatus && matchesFuel && matchesGear && b.status !== 'pending';
                        }).length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                                <p className="mb-4 text-muted-foreground">No bookings found matching filters.</p>
                                <Button to="/cars" variant="primary">Find a Ride</Button>
                            </div>
                        ) : (
                            bookings?.filter(b => {
                                const v = b.vehicles || {};
                                const s = searchTerm.toLowerCase();
                                const matchesSearch = (v.make + ' ' + v.model).toLowerCase().includes(s);
                                const matchesType = filterType === 'all' || v.vehicle_type === filterType;
                                const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
                                const matchesFuel = filterFuel === 'all' || v.fuel_type === filterFuel;
                                const matchesGear = filterGear === 'all' || v.transmission === filterGear;
                                return matchesSearch && matchesType && matchesStatus && matchesFuel && matchesGear && b.status !== 'pending';
                            }).map(booking => {
                                const vehicle = booking.vehicles || {};
                                return (
                                    <Card key={booking.id} className="p-0 overflow-hidden hover:border-primary/40 transition-colors">
                                        <div className="flex flex-col md:flex-row">
                                            <div className="w-full md:w-48 bg-secondary h-48 md:h-auto">
                                                <img src={vehicle.image_urls?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000'} className="w-full h-full object-cover" alt="Vehicle" />
                                            </div>
                                            <div className="p-6 flex-grow flex flex-col justify-between gap-6">
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <StatusBadge status={booking.status} />
                                                        </div>
                                                        <div className="font-mono-numbers font-bold text-lg md:text-xl">₹{(booking.total_price || 0).toLocaleString()}</div>
                                                    </div>
                                                    <h3 className="font-bold text-lg">{vehicle.make || 'Vehicle'} {vehicle.model}</h3>
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1"><FaCalendarAlt /> {booking.start_date ? new Date(booking.start_date).toLocaleDateString() : 'N/A'}</span>
                                                        <span className="hidden sm:inline">→</span>
                                                        <span className="flex items-center gap-1"><FaCalendarAlt /> {booking.end_date ? new Date(booking.end_date).toLocaleDateString() : 'N/A'}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 justify-end pt-4 border-t border-border border-dashed">

                                                    <Button variant="secondary" size="sm" to={`/vehicle/${booking.vehicle_id}/reviews?booking_id=${booking.id}`} className="w-full sm:w-auto">
                                                        <FaStar className="mr-1" /> Review
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => { setSelectedBookingId(booking.id); setIsBookingModalOpen(true); }} className="w-full sm:w-auto">
                                                        <FaInfoCircle className="mr-1" /> Details
                                                    </Button>
                                                    <Button variant="ghost" size="sm" to={booking.vehicle_id ? `/vehicle/${booking.vehicle_id}` : '#'} className="w-full sm:w-auto">View Vehicle</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                )
                            })
                        )}
                    </div>
                )}

                {/* TAB: IDENTITY */}
                {activeTab === 'identity' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                        <Card className="p-6">
                            <h3 className="font-bold flex items-center gap-2 mb-4"><FaIdCard className="text-primary" /> Tourist License</h3>
                            <p className="text-sm text-muted-foreground mb-6">Upload your government issued driving license.</p>
                            {profile?.license_document_url && !isUpdatingLicense ? (
                                <div className="bg-emerald-500/10 text-emerald-600 p-4 rounded-lg flex items-center justify-between">
                                    <span className="flex items-center gap-2"><FaCheckCircle /> Uploaded</span>
                                    <Button size="sm" variant="outline" onClick={() => setIsUpdatingLicense(true)} className="h-8 border-foreground/20 text-foreground hover:bg-foreground/10 dark:text-yellow-500 dark:border-white/20">Update</Button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <input type="file" className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" onChange={e => setLicenseFile(e.target.files[0])} />
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => {
                                            docUploadMutation.mutate({ file: licenseFile, userId: user.id, bucket: 'tourist-licenses', profileKey: 'license_document_url' });
                                            setIsUpdatingLicense(false);
                                        }} disabled={!licenseFile} className="flex-1">Upload License</Button>
                                        {isUpdatingLicense && <Button size="sm" variant="ghost" onClick={() => setIsUpdatingLicense(false)}>Cancel</Button>}
                                    </div>
                                </div>
                            )}
                        </Card>
                        {profile?.role === 'host' && (
                            <Card className="p-6 border-primary/20 bg-primary/5">
                                <h3 className="font-bold flex items-center gap-2 mb-4"><FaCar className="text-primary" /> Host Business Doc</h3>
                                <p className="text-sm text-muted-foreground mb-6">Required to list vehicles.</p>
                                {profile?.business_document_url && !isUpdatingHostDoc ? (
                                    <div className="bg-emerald-500/10 text-emerald-600 p-4 rounded-lg flex items-center justify-between">
                                        <span className="flex items-center gap-2"><FaCheckCircle /> Uploaded</span>
                                        <Button size="sm" variant="outline" onClick={() => setIsUpdatingHostDoc(true)} className="h-8 border-foreground/20 text-black hover:bg-foreground/10 dark:text-yellow-500 dark:border-white/20">Update</Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <input type="file" className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" onChange={e => setDocFile(e.target.files[0])} />
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => {
                                                docUploadMutation.mutate({ file: docFile, userId: user.id, bucket: 'host-documents', profileKey: 'business_document_url' });
                                                setIsUpdatingHostDoc(false);
                                            }} disabled={!docFile} className="flex-1">Upload Document</Button>
                                            {isUpdatingHostDoc && <Button size="sm" variant="ghost" onClick={() => setIsUpdatingHostDoc(false)}>Cancel</Button>}
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}
                    </div>
                )}
            </div>


            {isReviewModalOpen && <ReviewModal booking={currentReviewData.booking} review={currentReviewData.review} onClose={() => setReviewModalOpen(false)} onSubmit={handleReviewSubmit} />}

            {selectedBookingId && (
                <BookingDetailsModal
                    bookingId={selectedBookingId}
                    isOpen={isBookingModalOpen}
                    onClose={() => { setIsBookingModalOpen(false); setSelectedBookingId(null); }}
                />
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-sm p-6 text-center shadow-2xl border-destructive/20 bg-background">
                        <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                            <FaSignOutAlt size={20} />
                        </div>
                        <h4 className="text-xl font-bold mb-2 text-foreground">Sign Out?</h4>
                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to log out of your account?
                        </p>
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setShowLogoutConfirm(false)} className="flex-1">
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={performLogout} className="flex-1">
                                Yes, Sign Out
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default Profile;