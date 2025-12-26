// src/pages/EditVehicle.jsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaFileAlt, FaExternalLinkAlt, FaArrowLeft, FaCheckCircle, FaImages, FaSave } from 'react-icons/fa';
import Button from '../Components/ui/Button';

// --- API Functions ---
const fetchVehicleById = async (vehicleId) => {
    const { data, error } = await supabase.from('vehicles').select('*').eq('id', vehicleId).single();
    if (error) throw new Error('Failed to fetch vehicle data.');
    return data;
};

const getCertificationUrlForHost = async (vehicleId, docType) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/hosts/my-vehicles/${vehicleId}/certification-url?type=${docType}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Could not fetch document URL.");
    }
    const data = await response.json();
    return data.signedUrl;
};

const updateVehicle = async ({ vehicleId, formData, newRcFile, newInsuranceFile }) => {
    const { data: { session } } = await supabase.auth.getSession();
    let updatedFormData = { ...formData };

    if (newRcFile) {
        const rcExt = newRcFile.name.split('.').pop();
        const rcFileName = `rc-${vehicleId}-${Date.now()}.${rcExt}`;
        const { error } = await supabase.storage.from('vehicle-certifications').upload(rcFileName, newRcFile);
        if (error) throw new Error(`RC upload failed: ${error.message}`);
        const { data } = supabase.storage.from('vehicle-certifications').getPublicUrl(rcFileName);
        updatedFormData.rc_document_url = data.publicUrl;
    }

    if (newInsuranceFile) {
        const insExt = newInsuranceFile.name.split('.').pop();
        const insFileName = `ins-${vehicleId}-${Date.now()}.${insExt}`;
        const { error } = await supabase.storage.from('vehicle-certifications').upload(insFileName, newInsuranceFile);
        if (error) throw new Error(`Insurance upload failed: ${error.message}`);
        const { data } = supabase.storage.from('vehicle-certifications').getPublicUrl(insFileName);
        updatedFormData.insurance_document_url = data.publicUrl;
    }

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify(updatedFormData),
    });
    if (!response.ok) throw new Error('Failed to update vehicle.');
    return response.json();
};

function EditVehicle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Form State
    const [formData, setFormData] = useState(null);
    const [newRcFile, setNewRcFile] = useState(null);
    const [newInsuranceFile, setNewInsuranceFile] = useState(null);

    const { data: vehicle, isLoading, isError } = useQuery({
        queryKey: ['vehicle', id],
        queryFn: () => fetchVehicleById(id),
    });

    useEffect(() => {
        if (vehicle) {
            setFormData({
                make: vehicle.make || '',
                model: vehicle.model || '',
                year: vehicle.year || '',
                license_plate: vehicle.license_plate || '',
                price_per_day: vehicle.price_per_day || '',
                vehicle_type: vehicle.vehicle_type || 'Car',
                transmission: vehicle.transmission || 'Manual',
                fuel_type: vehicle.fuel_type || 'Petrol',
                seating_capacity: vehicle.seating_capacity || '',
                pickup_available: vehicle.pickup_available || false,
                dropoff_available: vehicle.dropoff_available || false,
                pickup_charge: vehicle.pickup_charge || 0,
                dropoff_charge: vehicle.dropoff_charge || 0,
                rc_document_url: vehicle.rc_document_url || null,
                insurance_document_url: vehicle.insurance_document_url || null,
            });
        }
    }, [vehicle]);

    const mutation = useMutation({
        mutationFn: updateVehicle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myVehicles'] });
            queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
            alert('Vehicle updated successfully!');
            navigate('/host/dashboard');
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleFileChange = (e, setter) => {
        if (e.target.files && e.target.files[0]) setter(e.target.files[0]);
    };

    const handleViewDocument = async (docType) => {
        const newWindow = window.open('', '_blank');
        newWindow.document.write('Fetching secure document...');
        try {
            const url = await getCertificationUrlForHost(id, docType);
            newWindow.location.href = url;
        } catch (error) {
            newWindow.close();
            alert(error.message);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { license_plate, ...dataToUpdate } = formData;
        mutation.mutate({ vehicleId: id, formData: dataToUpdate, newRcFile, newInsuranceFile });
    };

    // Styling
    const sectionTitle = "text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2";
    const labelClass = "block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5";
    const inputClass = "w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white text-slate-900 dark:text-white font-medium transition placeholder-slate-400 disabled:opacity-60 disabled:cursor-not-allowed";

    const UploadBox = ({ label, file, onChange, currentUrl, onViewCurrent }) => (
        <div className="group">
            <div className="flex justify-between items-end mb-1.5">
                <label className={labelClass}>{label}</label>
                {currentUrl && (
                    <button type="button" onClick={onViewCurrent} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                        <FaExternalLinkAlt /> View Current
                    </button>
                )}
            </div>
            <label className={`relative flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${file ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-900'}`}>
                <div className="text-center p-4">
                    <div className={`mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2 ${file ? 'bg-green-100 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors'}`}>
                        {file ? <FaCheckCircle size={16} /> : <FaFileAlt size={16} />}
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{file ? file.name : 'Replace Document'}</p>
                </div>
                <input type="file" className="hidden" onChange={onChange} accept="image/*,.pdf" />
            </label>
        </div>
    );

    if (isLoading || !formData) return <div className="min-h-screen pt-32 text-center text-slate-500 font-bold bg-slate-50 dark:bg-slate-950">LOADING ASSET CONFIG...</div>;
    if (isError) return <div className="min-h-screen pt-32 text-center text-red-500 font-bold bg-slate-50 dark:bg-slate-950">Error: Could not load asset.</div>;

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-24 font-sans transition-colors duration-300">

            {/* Header */}
            <div className="bg-slate-900 dark:bg-black pt-20 pb-24 border-b border-slate-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <Link to="/host/dashboard" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-white mb-6 transition-colors">
                            <FaArrowLeft className="mr-2" /> Discard & Return
                        </Link>
                        <h1 className="text-3xl md:text-4xl font-display font-bold text-white">Modify Asset: {vehicle.make} {vehicle.model}</h1>
                        <p className="text-slate-400 mt-2 text-lg">Update details, pricing, or compliance documents.</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Column: Form Fields */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* 1. Basic Info */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
                                <h3 className={sectionTitle}>Core Identity</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div><label className={labelClass}>Make</label><input name="make" value={formData.make} onChange={handleChange} required className={inputClass} /></div>
                                    <div><label className={labelClass}>Model</label><input name="model" value={formData.model} onChange={handleChange} required className={inputClass} /></div>
                                    <div><label className={labelClass}>Year</label><input type="number" name="year" value={formData.year} onChange={handleChange} required className={inputClass} /></div>
                                    <div>
                                        <label className={labelClass}>License Plate <span className="text-[10px] text-red-500 ml-1">(LOCKED)</span></label>
                                        <input name="license_plate" value={formData.license_plate} disabled className={inputClass} />
                                    </div>
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
                                            <input type="number" name="price_per_day" value={formData.price_per_day} onChange={handleChange} required className={`${inputClass} pl-8`} />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-5">
                                    <div><label className={labelClass}>Seats</label><input type="number" name="seating_capacity" value={formData.seating_capacity} onChange={handleChange} required className={inputClass} /></div>
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

                        {/* Right Column: Documents */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-6 sticky top-24">
                                <h3 className={sectionTitle}>Compliance</h3>
                                <div className="space-y-6">
                                    <UploadBox
                                        label="Registration Cert (RC)"
                                        file={newRcFile}
                                        onChange={(e) => handleFileChange(e, setNewRcFile)}
                                        currentUrl={formData.rc_document_url}
                                        onViewCurrent={() => handleViewDocument('rc')}
                                    />
                                    <UploadBox
                                        label="Insurance Policy"
                                        file={newInsuranceFile}
                                        onChange={(e) => handleFileChange(e, setNewInsuranceFile)}
                                        currentUrl={formData.insurance_document_url}
                                        onViewCurrent={() => handleViewDocument('insurance')}
                                    />
                                </div>
                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <Button
                                        type="submit"
                                        className="w-full justify-center py-4 font-bold text-lg shadow-xl shadow-blue-500/20"
                                        size="lg"
                                        disabled={mutation.isPending}
                                        isLoading={mutation.isPending}
                                    >
                                        {mutation.isPending ? 'Saving...' : 'Save Updates'}
                                    </Button>
                                    <p className="text-[10px] text-center text-slate-400 mt-3">Changing documents may require re-verification.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditVehicle;