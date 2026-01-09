// src/pages/EditProfile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { FaUser, FaPhone, FaMapMarkerAlt, FaSave, FaArrowLeft, FaExclamationCircle } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';

// Fetch function
const fetchUserProfile = async (userId) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
};

// Update function
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

const EditProfile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        full_name: '',
        address: '',
        phone_primary: '',
        phone_secondary: ''
    });

    // Query
    const { data: profile, isLoading } = useQuery({
        enabled: !!user?.id,
        queryKey: ['profile', user?.id],
        queryFn: () => fetchUserProfile(user.id),
    });

    // Sync state
    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || user?.user_metadata?.full_name || '',
                address: profile.address || '',
                phone_primary: profile.phone_primary || '',
                phone_secondary: profile.phone_secondary || ''
            });
        }
    }, [profile]);

    // Mutation
    const updateMutation = useMutation({
        mutationFn: updateUserProfile,
        onSuccess: () => {
            queryClient.invalidateQueries(['profile']);
            alert("Profile updated successfully!");
            navigate('/profile');
        },
        onError: (error) => {
            alert(`Failed to save: ${error.message}`);
        }
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    if (isLoading) return <div className="min-h-screen pt-24 text-center font-mono animate-pulse">LOADING EDITOR...</div>;

    return (
        <div className="bg-background min-h-screen pt-24 pb-20 font-sans">
            <div className="container mx-auto px-4 max-w-2xl">

                <div className="mb-8">
                    <Button variant="ghost" onClick={() => navigate('/profile')} className="pl-0 gap-2 mb-4 hover:pl-2 transition-all">
                        <FaArrowLeft /> Back to Profile
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
                    <p className="text-muted-foreground mt-2">Update your personal information and contact details.</p>
                </div>

                <Card className="p-6 md:p-8 shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <FaUser className="text-primary" /> Full Name <span className="text-destructive">*</span>
                            </label>
                            <input
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="e.g. Rahul Sharma"
                                className="w-full p-3 bg-secondary/50 border border-transparent rounded-xl focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                                required
                            />
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                <FaMapMarkerAlt className="text-primary" /> Address
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Your full address..."
                                className="w-full p-3 bg-secondary/50 border border-transparent rounded-xl focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                            />
                        </div>

                        {/* Contact Info Group */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <FaPhone className="text-primary" /> Primary Phone <span className="text-destructive">*</span>
                                </label>
                                <input
                                    name="phone_primary"
                                    value={formData.phone_primary}
                                    onChange={handleChange}
                                    placeholder="+91..."
                                    className="w-full p-3 bg-secondary/50 border border-transparent rounded-xl focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-mono"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    <FaPhone className="text-primary opacity-50" /> Secondary Phone
                                </label>
                                <input
                                    name="phone_secondary"
                                    value={formData.phone_secondary}
                                    onChange={handleChange}
                                    placeholder="Optional"
                                    className="w-full p-3 bg-secondary/50 border border-transparent rounded-xl focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-mono"
                                />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border flex items-center justify-end gap-4">
                            <Button type="button" variant="ghost" onClick={() => navigate('/profile')}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" size="lg" disabled={updateMutation.isPending} className="shadow-lg shadow-primary/20">
                                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                {!updateMutation.isPending && <FaSave className="ml-2" />}
                            </Button>
                        </div>

                    </form>
                </Card>

            </div>
        </div>
    );
};

export default EditProfile;
