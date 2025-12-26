// src/pages/AddVehicle.jsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { FaUpload, FaFileAlt, FaCar, FaArrowLeft, FaCheckCircle, FaCloudUploadAlt, FaImages } from 'react-icons/fa';
import Button from '../Components/ui/Button';

// --- API Function ---
const createVehicle = async ({ formData, imageFile, rcFile, insuranceFile }) => {
    // 1. Upload Vehicle Image
    const imageExt = imageFile.name.split('.').pop();
    const imageFileName = `${Date.now()}.${imageExt}`;
    const { error: imageUploadError } = await supabase.storage.from('vehicle-images').upload(imageFileName, imageFile);
    if (imageUploadError) throw new Error(`Image Upload Failed: ${imageUploadError.message}`);
    const { data: imageUrlData } = supabase.storage.from('vehicle-images').getPublicUrl(imageFileName);

    // 2. Upload RC Document
    const rcExt = rcFile.name.split('.').pop();
    const rcFileName = `rc-${Date.now()}.${rcExt}`;
    const { error: rcUploadError } = await supabase.storage.from('vehicle-certifications').upload(rcFileName, rcFile);
    if (rcUploadError) throw new Error(`RC Upload Failed: ${rcUploadError.message}`);
    const { data: rcUrlData } = supabase.storage.from('vehicle-certifications').getPublicUrl(rcFileName);

    // 3. Upload Insurance Document
    const insuranceExt = insuranceFile.name.split('.').pop();
    const insuranceFileName = `ins-${Date.now()}.${insuranceExt}`;
    const { error: insuranceUploadError } = await supabase.storage.from('vehicle-certifications').upload(insuranceFileName, insuranceFile);
    if (insuranceUploadError) throw new Error(`Insurance Upload Failed: ${insuranceUploadError.message}`);
    const { data: insuranceUrlData } = supabase.storage.from('vehicle-certifications').getPublicUrl(insuranceFileName);

    // 4. Prepare data
    const vehicleData = {
        ...formData,
        image_urls: [imageUrlData.publicUrl],
        rc_document_url: rcUrlData.publicUrl,
        insurance_document_url: insuranceUrlData.publicUrl,
        certification_url: rcUrlData.publicUrl,
    };

    // 5. Backend Call
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify(vehicleData),
    });

    if (!response.ok) throw new Error((await response.json()).error || 'Failed to create vehicle');
    return response.json();
};

function AddVehicle() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        make: '', model: '', year: '', license_plate: '',
        price_per_day: '', vehicle_type: 'Car', transmission: 'Manual',
        fuel_type: 'Petrol', seating_capacity: '',
        pickup_available: false, dropoff_available: false,
        pickup_charge: 0, dropoff_charge: 0,
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [rcFile, setRcFile] = useState(null);
    const [insuranceFile, setInsuranceFile] = useState(null);

    const mutation = useMutation({
        mutationFn: createVehicle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myVehicles'] });
            navigate('/host/dashboard');
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleFileChange = (e, setter, previewSetter = null) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setter(file);
            if (previewSetter) previewSetter(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!imageFile || !rcFile || !insuranceFile) {
            alert('Please check that you have uploaded the Vehicle Image, RC, and Insurance documents.');
            return;
        }
        mutation.mutate({ formData, imageFile, rcFile, insuranceFile });
    };

    // Styling Helpers
    const sectionTitle = "text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2";
    const labelClass = "block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5";
    const inputClass = "w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-slate-900 dark:text-white font-medium transition placeholder-slate-400";

    // File Upload Component Helper
    const UploadBox = ({ label, file, onChange, icon: Icon, preview }) => (
        <div className="group">
            <label className={labelClass}>{label}</label>
            <label className={`relative flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${file
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10'
                : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}>
                {preview ? (
                    <div className="absolute inset-0 p-2 overflow-hidden">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg shadow-sm" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Change Photo</span>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-6 space-y-3">
                        <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${file
                            ? 'bg-emerald-100 text-emerald-600 scale-110'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-500 group-hover:scale-110'
                            }`}>
                            {file ? <FaCheckCircle size={24} /> : <Icon size={24} />}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{file ? 'File Attached' : 'Click to Upload'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{file ? file.name : 'SVG, PNG, JPG or PDF'}</p>
                        </div>
                    </div>
                )}
                <input type="file" className="hidden" onChange={onChange} accept="image/*,.pdf" />
            </label>
        </div>
    );

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-24 font-sans transition-colors duration-300">

            {/* Header */}
            <div className="bg-slate-900 dark:bg-black pt-20 pb-28 border-b border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:32px_32px] pointer-events-none"></div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-4xl mx-auto">
                        <Link to="/host/dashboard" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-white mb-6 transition-colors tracking-widest uppercase">
                            <FaArrowLeft className="mr-2" /> Return to Fleet
                        </Link>
                        <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">Add New Asset</h1>
                        <p className="text-slate-400 mt-2 text-lg max-w-2xl font-light">Register a new vehicle to your fleet. All fields are required for verification.</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: Form Fields (2/3) */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* 1. Basic Info */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
                                <h3 className={sectionTitle}>Vehicle Identity</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div><label className={labelClass}>Make</label><input name="make" value={formData.make} onChange={handleChange} required className={inputClass} placeholder="e.g. Hyundai" /></div>
                                    <div><label className={labelClass}>Model</label><input name="model" value={formData.model} onChange={handleChange} required className={inputClass} placeholder="e.g. Creta" /></div>
                                    <div><label className={labelClass}>Year</label><input type="number" name="year" value={formData.year} onChange={handleChange} required className={inputClass} placeholder="2024" /></div>
                                    <div><label className={labelClass}>License Plate</label><input name="license_plate" value={formData.license_plate} onChange={handleChange} required className={inputClass} placeholder="GA-XX-XXXX" /></div>
                                </div>
                            </div>

                            {/* 2. Specs & Pricing */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
                                <h3 className={sectionTitle}>Specifications & Pricing</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                    <div>
                                        <label className={labelClass}>Category</label>
                                        <select name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} className={inputClass}>
                                            <option value="Car">Car</option>
                                            <option value="Bike">Bike</option>
                                            <option value="Scooter">Scooter</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Base Price / Day</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3.5 text-slate-400 font-bold">₹</span>
                                            <input type="number" name="price_per_day" value={formData.price_per_day} onChange={handleChange} required className={`${inputClass} pl-8`} placeholder="0000" />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-5">
                                    <div>
                                        <label className={labelClass}>Seats</label>
                                        <input type="number" name="seating_capacity" value={formData.seating_capacity} onChange={handleChange} required className={inputClass} placeholder="4" />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Gearbox</label>
                                        <select name="transmission" value={formData.transmission} onChange={handleChange} className={inputClass}>
                                            <option value="Manual">Manual</option>
                                            <option value="Automatic">Automatic</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Fuel</label>
                                        <select name="fuel_type" value={formData.fuel_type} onChange={handleChange} className={inputClass}>
                                            <option value="Petrol">Petrol</option>
                                            <option value="Diesel">Diesel</option>
                                            <option value="Electric">Electric</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Logistics */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
                                <h3 className={sectionTitle}>Logistics</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <input type="checkbox" name="pickup_available" id="pickup_available" checked={formData.pickup_available} onChange={handleChange} className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900" />
                                            <label htmlFor="pickup_available" className="text-sm font-bold text-slate-700 dark:text-slate-300">Enable Pickup Service</label>
                                        </div>
                                        {formData.pickup_available && (
                                            <div className="w-32">
                                                <input type="number" name="pickup_charge" value={formData.pickup_charge} onChange={handleChange} className={`${inputClass} py-2 text-right`} placeholder="Fee (₹)" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <input type="checkbox" name="dropoff_available" id="dropoff_available" checked={formData.dropoff_available} onChange={handleChange} className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900" />
                                            <label htmlFor="dropoff_available" className="text-sm font-bold text-slate-700 dark:text-slate-300">Enable Drop-off Service</label>
                                        </div>
                                        {formData.dropoff_available && (
                                            <div className="w-32">
                                                <input type="number" name="dropoff_charge" value={formData.dropoff_charge} onChange={handleChange} className={`${inputClass} py-2 text-right`} placeholder="Fee (₹)" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Documents (1/3) */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 sticky top-24">
                                <h3 className={sectionTitle}>Documentation</h3>
                                <div className="space-y-6">
                                    <UploadBox label="Main Photo" file={imageFile} onChange={(e) => handleFileChange(e, setImageFile, setImagePreview)} icon={FaImages} preview={imagePreview} />
                                    <UploadBox label="Registration Cert (RC)" file={rcFile} onChange={(e) => handleFileChange(e, setRcFile)} icon={FaFileAlt} />
                                    <UploadBox label="Insurance Policy" file={insuranceFile} onChange={(e) => handleFileChange(e, setInsuranceFile)} icon={FaFileAlt} />
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <Button
                                        type="submit"
                                        className="w-full justify-center py-4 font-bold text-lg shadow-xl shadow-blue-500/20"
                                        size="lg"
                                        disabled={mutation.isPending}
                                        isLoading={mutation.isPending}
                                    >
                                        {mutation.isPending ? 'Uploading Asset...' : 'Submit Asset'}
                                    </Button>
                                    <p className="text-[10px] text-center text-slate-400 mt-3">By submitting, you certify that these documents are authentic.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddVehicle;