// src/pages/AddVehicle.jsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaFileAlt, FaCar, FaMotorcycle, FaBicycle, FaCheckCircle, FaChevronRight, FaTimes } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';

// --- API Logic ---
const createVehicle = async ({ formData, imageFile, rcFile, insuranceFile }) => {
    // 1. Upload Vehicle Image
    const imageExt = imageFile.name.split('.').pop();
    const imageFileName = `${Date.now()}.${imageExt}`;
    const { error: imageUploadError } = await supabase.storage
        .from('vehicle-images')
        .upload(imageFileName, imageFile);
    if (imageUploadError) throw new Error(`Image Upload Failed: ${imageUploadError.message}`);
    const { data: imageUrlData } = supabase.storage.from('vehicle-images').getPublicUrl(imageFileName);

    // 2. Upload RC Document
    const rcExt = rcFile.name.split('.').pop();
    const rcFileName = `rc-${Date.now()}.${rcExt}`;
    const { error: rcUploadError } = await supabase.storage
        .from('vehicle-certifications')
        .upload(rcFileName, rcFile);
    if (rcUploadError) throw new Error(`RC Upload Failed: ${rcUploadError.message}`);
    const { data: rcUrlData } = supabase.storage.from('vehicle-certifications').getPublicUrl(rcFileName);

    // 3. Upload Insurance Document
    const insuranceExt = insuranceFile.name.split('.').pop();
    const insuranceFileName = `ins-${Date.now()}.${insuranceExt}`;
    const { error: insuranceUploadError } = await supabase.storage
        .from('vehicle-certifications') // Using the same bucket
        .upload(insuranceFileName, insuranceFile);
    if (insuranceUploadError) throw new Error(`Insurance Upload Failed: ${insuranceUploadError.message}`);
    const { data: insuranceUrlData } = supabase.storage.from('vehicle-certifications').getPublicUrl(insuranceFileName);

    // 4. API Packet
    const vehicleData = {
        ...formData,
        price_per_day: Number(formData.price_per_day) || 0,
        seating_capacity: Number(formData.seating_capacity) || 0,
        pickup_charge: Number(formData.pickup_charge) || 0,
        dropoff_charge: Number(formData.dropoff_charge) || 0,
        year: Number(formData.year) || new Date().getFullYear(),
        image_urls: [imageUrlData.publicUrl],
        rc_document_url: rcUrlData.publicUrl,
        insurance_document_url: insuranceUrlData.publicUrl,
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
    const [step, setStep] = useState(1);

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
        let newValue = type === 'checkbox' ? checked : value;

        if (['price_per_day', 'seating_capacity', 'pickup_charge', 'dropoff_charge'].includes(name)) {
            if (newValue === '') {
                // Allow empty string to let user clear the input
            } else {
                if (newValue < 0) newValue = 0;
                // Enforce integer
                newValue = Math.floor(Number(newValue));
            }
        }

        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleFileChange = (e, setter, previewSetter) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setter(file);
            if (previewSetter) previewSetter(URL.createObjectURL(file));
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const validateStep1 = () => {
        if (!formData.make || !formData.model || !formData.year || !formData.license_plate || !formData.seating_capacity) {
            alert("Please fill in all vehicle specifications.");
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.price_per_day) {
            alert("Please enter the daily rate.");
            return false;
        }
        return true;
    };

    const handleNextStep1 = () => {
        if (validateStep1()) nextStep();
    };

    const handleNextStep2 = () => {
        if (validateStep2()) nextStep();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!imageFile || !rcFile || !insuranceFile) {
            alert('Please upload all required documents (Photo, RC, and Insurance).');
            return;
        }
        mutation.mutate({ formData, imageFile, rcFile, insuranceFile });
    };

    const renderStepper = () => (
        <div className="flex justify-between mb-8 max-w-sm mx-auto">
            {[1, 2, 3].map(i => (
                <div key={i} className={`flex items-center ${i < 3 ? 'w-full' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${step >= i ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-muted text-muted-foreground'}`}>
                        {step > i ? <FaCheckCircle /> : i}
                    </div>
                    {i < 3 && <div className={`h-1 w-full mx-2 rounded ${step > i ? 'bg-primary' : 'bg-secondary'}`} />}
                </div>
            ))}
        </div>
    );

    return (
        <div className="bg-background min-h-screen pt-24 pb-20 font-sans">
            <div className="container mx-auto px-4 max-w-2xl">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">List New Vehicle</h1>
                </div>

                {renderStepper()}

                <form onSubmit={handleSubmit}>

                    {/* STEP 1: Basic Stats */}
                    {step === 1 && (
                        <Card className="p-6 md:p-8 animate-fade-in-up">
                            <h3 className="text-xl font-bold mb-6">Vehicle Specs</h3>

                            {/* Type Selector */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                {['Car', 'Bike', 'Scooter'].map(type => (
                                    <div key={type}
                                        onClick={() => setFormData({ ...formData, vehicle_type: type })}
                                        className={`cursor-pointer border rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all ${formData.vehicle_type === type ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-secondary'}`}>
                                        {type === 'Car' && <FaCar size={24} />}
                                        {type === 'Bike' && <FaMotorcycle size={24} />}
                                        {type === 'Scooter' && <FaBicycle size={24} />}
                                        <span className="text-sm font-bold">{type}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Make *</label>
                                    <input name="make" value={formData.make} onChange={handleChange} className="w-full p-3 bg-secondary rounded-lg border border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="e.g. Toyota" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Model *</label>
                                    <input name="model" value={formData.model} onChange={handleChange} className="w-full p-3 bg-secondary rounded-lg border border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="e.g. Fortuner" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Year *</label>
                                    <input type="number" name="year" value={formData.year} onChange={handleChange} className="w-full p-3 bg-secondary rounded-lg border border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="2024" required />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Plate No *</label>
                                    <input name="license_plate" value={formData.license_plate} onChange={handleChange} className="w-full p-3 bg-secondary rounded-lg border border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-mono uppercase" placeholder="GA-XX-XX-XXXX" required />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Transmission</label>
                                    <select name="transmission" value={formData.transmission} onChange={handleChange} className="w-full p-3 bg-secondary rounded-lg border border-transparent focus:bg-background focus:border-primary outline-none cursor-pointer">
                                        <option value="Manual">Manual</option>
                                        <option value="Automatic">Automatic</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Fuel</label>
                                    <select name="fuel_type" value={formData.fuel_type} onChange={handleChange} className="w-full p-3 bg-secondary rounded-lg border border-transparent focus:bg-background focus:border-primary outline-none cursor-pointer">
                                        <option value="Petrol">Petrol</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Electric">Electric</option>
                                    </select>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Seating Capacity *</label>
                                    <input type="number" min="0" name="seating_capacity" value={formData.seating_capacity} onChange={handleChange} className="w-full p-3 bg-secondary rounded-lg border border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="e.g. 5" required />
                                </div>
                            </div>

                            <Button fullWidth onClick={handleNextStep1} variant="primary" className="mt-8">Next Step <FaChevronRight /></Button>
                        </Card>
                    )}

                    {/* STEP 2: Pricing & Logistics */}
                    {step === 2 && (
                        <Card className="p-6 md:p-8 animate-fade-in-up">
                            <h3 className="text-xl font-bold mb-6">Pricing & Logistics</h3>

                            <div className="mb-6 space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Daily Rate (₹) *</label>
                                <input type="number" min="0" name="price_per_day" value={formData.price_per_day} onChange={handleChange} className="w-full p-3 bg-secondary rounded-lg border border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-xl font-mono" placeholder="2500" required />
                            </div>

                            <div className="space-y-4 border-t border-border pt-6">
                                <div className="flex items-center justify-between">
                                    <label className="font-bold text-sm">Pickup Service</label>
                                    <input type="checkbox" name="pickup_available" checked={formData.pickup_available} onChange={handleChange} className="w-5 h-5 accent-primary" />
                                </div>
                                {formData.pickup_available && (
                                    <input type="number" min="0" name="pickup_charge" value={formData.pickup_charge} onChange={handleChange} className="w-full p-2 bg-secondary/50 rounded text-sm outline-none border border-border focus:border-primary" placeholder="Charge Amount" />
                                )}
                            </div>

                            <div className="space-y-4 border-t border-border pt-4 mt-4">
                                <div className="flex items-center justify-between">
                                    <label className="font-bold text-sm">Drop-off Service</label>
                                    <input type="checkbox" name="dropoff_available" checked={formData.dropoff_available} onChange={handleChange} className="w-5 h-5 accent-primary" />
                                </div>
                                {formData.dropoff_available && (
                                    <input type="number" min="0" name="dropoff_charge" value={formData.dropoff_charge} onChange={handleChange} className="w-full p-2 bg-secondary/50 rounded text-sm outline-none border border-border focus:border-primary" placeholder="Charge Amount" />
                                )}
                            </div>

                            <div className="flex gap-4 mt-8">
                                <Button fullWidth onClick={prevStep} className="bg-secondary hover:bg-secondary/80 text-black dark:text-white font-bold">Back</Button>
                                <Button fullWidth onClick={handleNextStep2} variant="primary">Next Step <FaChevronRight /></Button>
                            </div>
                        </Card>
                    )}

                    {/* STEP 3: Verification Docs */}
                    {step === 3 && (
                        <Card className="p-6 md:p-8 animate-fade-in-up">
                            <h3 className="text-xl font-bold mb-6">Verification Docs</h3>

                            <div className="space-y-6">
                                {/* Photo */}
                                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-secondary/20 transition-colors relative group">
                                    {imageFile ? (
                                        <div className="relative inline-block">
                                            <img src={imagePreview} className="h-32 mx-auto rounded-lg object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => { setImageFile(null); setImagePreview(''); }}
                                                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-md hover:bg-destructive/90 transition-all"
                                                title="Remove Photo"
                                            >
                                                <FaTimes size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-muted-foreground pointer-events-none">
                                            <FaCar className="mx-auto text-3xl mb-2 opacity-50" />
                                            <span className="text-xs font-bold uppercase">Vehicle Photo *</span>
                                        </div>
                                    )}
                                    {!imageFile && (
                                        <input type="file" onChange={(e) => handleFileChange(e, setImageFile, setImagePreview)} className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 mt-4" required />
                                    )}
                                </div>

                                {/* RC */}
                                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-secondary/20 transition-colors relative">
                                    {rcFile ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                                                <FaCheckCircle size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-foreground truncate max-w-[200px]">{rcFile.name}</p>
                                                <span className="text-xs text-emerald-600 font-semibold">RC Uploaded</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setRcFile(null)}
                                                className="ml-2 text-destructive hover:bg-destructive/10 p-2 rounded-full transition-colors"
                                                title="Remove File"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-muted-foreground pointer-events-none">
                                                <FaFileAlt className="mx-auto text-3xl mb-2 opacity-50" />
                                                <span className="text-xs font-bold uppercase">Registration Certificate (RC) *</span>
                                            </div>
                                            <input type="file" onChange={(e) => handleFileChange(e, setRcFile)} className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 mt-4" required />
                                        </>
                                    )}
                                </div>

                                {/* Insurance */}
                                <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:bg-secondary/20 transition-colors relative">
                                    {insuranceFile ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                                                <FaCheckCircle size={20} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-foreground truncate max-w-[200px]">{insuranceFile.name}</p>
                                                <span className="text-xs text-emerald-600 font-semibold">Insurance Uploaded</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setInsuranceFile(null)}
                                                className="ml-2 text-destructive hover:bg-destructive/10 p-2 rounded-full transition-colors"
                                                title="Remove File"
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-muted-foreground pointer-events-none">
                                                <FaFileAlt className="mx-auto text-3xl mb-2 opacity-50" />
                                                <span className="text-xs font-bold uppercase">Insurance Policy *</span>
                                            </div>
                                            <input type="file" onChange={(e) => handleFileChange(e, setInsuranceFile)} className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 mt-4" required />
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <Button fullWidth onClick={prevStep} className="bg-secondary hover:bg-secondary/80 text-black dark:text-white font-bold">Back</Button>
                                <Button fullWidth type="submit" variant="primary" disabled={mutation.isPending}>
                                    {mutation.isPending ? 'Uploading...' : 'Submit Listing'}
                                </Button>
                            </div>
                        </Card>
                    )}

                </form>

            </div>
        </div>
    );
}

export default AddVehicle;