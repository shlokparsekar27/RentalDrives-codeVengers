// src/pages/Profile.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { FaUser, FaEnvelope, FaStar, FaRegStar, FaEdit, FaCheckCircle, FaMapMarkerAlt, FaPhone, FaHistory, FaIdCard, FaCar, FaShieldAlt, FaKey, FaCog, FaCamera } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';

// --- Edit Profile Modal Component ---
function EditProfileModal({ profile, onClose, onSubmit }) {
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [address, setAddress] = useState(profile?.address || '');
    const [phonePrimary, setPhonePrimary] = useState(profile?.phone_primary || '');
    const [phoneSecondary, setPhoneSecondary] = useState(profile?.phone_secondary || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ full_name: fullName, address, phone_primary: phonePrimary, phone_secondary: phoneSecondary });
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-2xl w-full max-w-md animate-enter border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Edit Profile</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-500"><FaTimesWrapper /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <InputGroup label="Full Name" value={fullName} onChange={setFullName} placeholder="e.g. John Doe" />
                    <InputGroup label="Primary Phone" value={phonePrimary} onChange={setPhonePrimary} placeholder="+91 98765 43210" type="tel" />
                    <InputGroup label="Secondary Phone (Opt)" value={phoneSecondary} onChange={setPhoneSecondary} placeholder="+91..." type="tel" />
                    <TextAreaGroup label="Address" value={address} onChange={setAddress} placeholder="Enter your full address" />

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
                        <Button type="submit" variant="primary" className="flex-1">Save Profile</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const FaTimesWrapper = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
);

const InputGroup = ({ label, value, onChange, type = "text", placeholder }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
        <input
            type={type}
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all text-slate-900 dark:text-white font-medium placeholder-slate-400"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required
            placeholder={placeholder}
        />
    </div>
);

const TextAreaGroup = ({ label, value, onChange, placeholder }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
        <textarea
            rows="3"
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all text-slate-900 dark:text-white font-medium placeholder-slate-400"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
        />
    </div>
);

// --- Review Modal Component (Simplified Structure) ---
function ReviewModal({ booking, review, onClose, onSubmit }) {
    const [rating, setRating] = useState(review?.rating || 0);
    const [comment, setComment] = useState(review?.comment || '');

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800">
                <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-2">{review ? 'Edit Review' : 'Rate Experience'}</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{booking.vehicles.make} {booking.vehicles.model}</p>
                <div className="space-y-6">
                    <div className="flex justify-center gap-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button key={star} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                                {star <= rating ? <FaStar className="text-amber-400 text-3xl" /> : <FaRegStar className="text-slate-300 dark:text-slate-700 text-3xl" />}
                            </button>
                        ))}
                    </div>
                    <TextAreaGroup label="Your Feedback" value={comment} onChange={setComment} placeholder="How was the ride?" />
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
                        <Button onClick={() => onSubmit({ rating, comment })} disabled={rating === 0} variant="primary" className="flex-1">Submit</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- API Functions (Unchanged Logic, just placement) ---
const fetchUserProfile = async (userId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me`, { headers: { 'Authorization': `Bearer ${session.access_token}` } });
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
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
};

const uploadHostDocument = async ({ file, userId }) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('host-documents').upload(fileName, file);
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from('host-documents').getPublicUrl(fileName);
    return updateUserProfile({ business_document_url: data.publicUrl });
};

const uploadLicenseDocument = async ({ file, userId }) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-license-${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('tourist-licenses').upload(fileName, file);
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from('tourist-licenses').getPublicUrl(fileName);
    return updateUserProfile({ license_document_url: data.publicUrl });
};

const fetchUserBookings = async (userId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/my-bookings`, { headers: { 'Authorization': `Bearer ${session.access_token}` } });
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
};

// ... other API stubs for brevity, assuming they exist or are imported.
// Since I cannot import them if they are not defined, I will redefine small wrappers here to be safe
const cancelBooking = async (bookingId) => {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${bookingId}/cancel`, { method: 'PATCH', headers: { 'Authorization': `Bearer ${session.access_token}` } });
};
const createReview = async ({ booking, rating, comment }) => {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ booking_id: booking.id, vehicle_id: booking.vehicle_id, rating, comment }),
    });
};
const updateReview = async ({ reviewId, rating, comment }) => {
    const { data: { session } } = await supabase.auth.getSession();
    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ rating, comment }),
    });
};


function Profile() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isReviewModalOpen, setReviewModalOpen] = useState(false);
    const [currentReviewData, setCurrentReviewData] = useState({ booking: null, review: null });
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [documentFile, setDocumentFile] = useState(null);
    const [licenseFile, setLicenseFile] = useState(null);

    const { data: profile, isLoading: isLoadingProfile } = useQuery({
        enabled: !!user?.id,
        queryKey: ['profile', user?.id],
        queryFn: () => fetchUserProfile(user.id),
    });

    const { data: bookings, isLoading: isLoadingBookings } = useQuery({
        enabled: !!user?.id && !!profile && profile.role !== 'admin',
        queryKey: ['bookings', user?.id],
        queryFn: () => fetchUserBookings(user.id),
    });

    // Mutations
    const updateProfileMutation = useMutation({ mutationFn: updateUserProfile, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['profile', user?.id] }); setEditModalOpen(false); } });
    const documentUploadMutation = useMutation({ mutationFn: uploadHostDocument, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['profile', user?.id] }); setDocumentFile(null); } });
    const licenseUploadMutation = useMutation({ mutationFn: uploadLicenseDocument, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['profile', user?.id] }); setLicenseFile(null); } });
    const cancelBookingMutation = useMutation({ mutationFn: cancelBooking, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] }) });
    const reviewMutation = useMutation({ mutationFn: createReview, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] }); setReviewModalOpen(false); } });
    const updateReviewMutationFn = useMutation({ mutationFn: updateReview, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bookings', user?.id] }); setReviewModalOpen(false); } });

    const handleReviewSubmit = ({ rating, comment }) => {
        if (currentReviewData.review) {
            updateReviewMutationFn.mutate({ reviewId: currentReviewData.review.id, rating, comment });
        } else {
            reviewMutation.mutate({ booking: currentReviewData.booking, rating, comment });
        }
    };

    if (isLoadingProfile) return <div className="min-h-screen bg-white dark:bg-slate-950 pt-32 text-center font-bold text-slate-500">Loading Profile...</div>;

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-24 transition-colors duration-300 font-sans">
            {isReviewModalOpen && <ReviewModal booking={currentReviewData.booking} review={currentReviewData.review} onClose={() => setReviewModalOpen(false)} onSubmit={handleReviewSubmit} />}
            {isEditModalOpen && <EditProfileModal profile={profile} onClose={() => setEditModalOpen(false)} onSubmit={(data) => updateProfileMutation.mutate(data)} />}

            {/* 
              🆔 Identity Header - Passport Style
             */}
            <div className="bg-slate-900 dark:bg-black pt-20 pb-24 border-b border-slate-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                        <div className="relative group">
                            <div className="w-28 h-28 rounded-full bg-slate-800 border-4 border-slate-700 overflow-hidden flex items-center justify-center text-slate-500 text-4xl shadow-2xl">
                                <FaUser />
                            </div>
                            <button onClick={() => setEditModalOpen(true)} className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-slate-900 hover:bg-blue-500 transition-colors">
                                <FaCamera size={12} />
                            </button>
                        </div>

                        <div className="text-center md:text-left flex-grow">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                <h1 className="text-3xl font-display font-bold text-white">{profile?.full_name || 'Anonymous User'}</h1>
                                {profile?.is_verified && <FaCheckCircle className="text-blue-500" title="Verified ID" />}
                            </div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-400 font-medium">
                                <span className="flex items-center gap-1.5"><FaEnvelope className="text-slate-500" /> {user?.email}</span>
                                <span className="hidden md:inline text-slate-700">|</span>
                                <span className="flex items-center gap-1.5 uppercase tracking-wide text-xs font-bold bg-slate-800 px-2 py-0.5 rounded text-slate-300">{profile?.role} Account</span>
                            </div>
                        </div>

                        <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                            <FaCog className="mr-2" /> Settings
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* 
                      Left Column: Identity & Verification (4/12)
                     */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Contact Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2"><FaUser /> Personal Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <FaMapMarkerAlt className="text-slate-400 mt-1" />
                                    <div>
                                        <p className="text-slate-900 dark:text-white font-medium text-sm">{profile?.address || 'No address provided'}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Primary Address</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <FaPhone className="text-slate-400 mt-1" />
                                    <div>
                                        <p className="text-slate-900 dark:text-white font-medium text-sm">{profile?.phone_primary || 'No phone verified'}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Mobile Number</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Verification Status Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2"><FaShieldAlt /> Verification Level</h3>

                            {/* Host Logic */}
                            {profile?.role === 'host' && (
                                <div className="space-y-4">
                                    <div className={`p-4 rounded-lg border ${profile?.is_verified ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-sm text-slate-900 dark:text-white">Business ID</span>
                                            {profile?.is_verified ? <Badge variant="success">Verified</Badge> : profile?.business_document_url ? <Badge variant="warning">Pending</Badge> : <Badge variant="neutral">Unverified</Badge>}
                                        </div>
                                        {!profile?.is_verified && !profile?.business_document_url && (
                                            <div className="mt-3">
                                                <label className="block w-full text-center py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded text-xs font-bold text-slate-500 cursor-pointer hover:border-slate-400 hover:text-slate-600 transition-colors">
                                                    <input type="file" className="hidden" onChange={(e) => documentUploadMutation.mutate({ file: e.target.files[0], userId: user.id })} />
                                                    {documentUploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tourist Logic */}
                            {profile?.role !== 'host' && (
                                <div className="space-y-4">
                                    <div className={`p-4 rounded-lg border ${profile?.is_license_verified ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-bold text-sm text-slate-900 dark:text-white">Driving License</span>
                                            {profile?.is_license_verified ? <Badge variant="success">Verified</Badge> : profile?.license_document_url ? <Badge variant="warning">Pending</Badge> : <Badge variant="neutral">Unverified</Badge>}
                                        </div>
                                        {!profile?.is_license_verified && (
                                            <div className="mt-3">
                                                {profile?.license_document_url ? (
                                                    <p className="text-xs text-slate-500">Document under review.</p>
                                                ) : (
                                                    <label className="block w-full text-center py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded text-xs font-bold text-slate-500 cursor-pointer hover:border-slate-400 hover:text-slate-600 transition-colors">
                                                        <input type="file" className="hidden" onChange={(e) => licenseUploadMutation.mutate({ file: e.target.files[0], userId: user.id })} />
                                                        {licenseUploadMutation.isPending ? 'Uploading...' : 'Upload License Front'}
                                                    </label>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 
                      Right Column: Booking Activity (8/12)
                    */}
                    <div className="lg:col-span-8">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 min-h-[500px]">
                            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-6 flex items-center justify-between">
                                <span>Recent Activity</span>
                                <span className="text-xs font-sans font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500">
                                    {bookings?.length || 0} Trips
                                </span>
                            </h2>

                            <div className="space-y-4">
                                {isLoadingBookings ? (
                                    <div className="text-center py-12 text-slate-400">Loading activity...</div>
                                ) : bookings && bookings.length > 0 ? (
                                    bookings.map(booking => (
                                        <div key={booking.id} className="group relative bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 p-4 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-md">
                                            <div className="flex gap-5">
                                                <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img src={booking.vehicles.image_urls?.[0]} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="Vehicle" />
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 dark:text-white">{booking.vehicles.make} {booking.vehicles.model}</h4>
                                                            <p className="text-xs font-mono text-slate-500 mt-1">
                                                                {new Date(booking.start_date).toLocaleDateString()} → {new Date(booking.end_date).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <Badge variant={booking.status === 'confirmed' ? 'success' : booking.status === 'cancelled' ? 'error' : 'neutral'}>{booking.status}</Badge>
                                                    </div>

                                                    <div className="mt-4 flex items-center justify-between">
                                                        <span className="font-mono font-bold text-slate-900 dark:text-white">₹{booking.total_price}</span>
                                                        <div className="flex gap-3">
                                                            {booking.status === 'confirmed' && (
                                                                <button onClick={() => { if (window.confirm('Cancel?')) cancelBookingMutation.mutate(booking.id) }} className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors">Cancel</button>
                                                            )}
                                                            {booking.status === 'completed' || booking.status === 'confirmed' ? (
                                                                <button onClick={() => { setCurrentReviewData({ booking }); setReviewModalOpen(true); }} className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors">
                                                                    Write Review
                                                                </button>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                                            <FaKey />
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">No trips history found.</p>
                                        <Button to="/cars" variant="link" className="mt-2 text-blue-600">Start your first adventure &rarr;</Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Profile;