// src/pages/AddVehicle.jsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaFileAlt } from 'react-icons/fa';

// --- UPDATED: createVehicle now handles three file uploads ---
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
        .from('vehicle-certifications') // Using the same bucket for simplicity
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


    // 4. Prepare data for the API
    const vehicleData = {
        ...formData,
        image_urls: [imageUrlData.publicUrl],
        rc_document_url: rcUrlData.publicUrl, // NEW
        insurance_document_url: insuranceUrlData.publicUrl, // NEW
        certification_url: rcUrlData.publicUrl, // Keep this for backward compatibility or general use
    };
    
    // 5. Call the backend API to create the vehicle record
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
    const [rcFile, setRcFile] = useState(null); // NEW state for RC
    const [insuranceFile, setInsuranceFile] = useState(null); // NEW state for Insurance

    const mutation = useMutation({
        mutationFn: createVehicle,
        onSuccess: () => {
            alert('Vehicle listed successfully! It is now pending admin approval.');
            queryClient.invalidateQueries({ queryKey: ['myVehicles'] });
            navigate('/host/dashboard');
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRcChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setRcFile(e.target.files[0]);
        }
    };
    
    const handleInsuranceChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setInsuranceFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // UPDATED: Check for all three files
        if (!imageFile || !rcFile || !insuranceFile) {
            alert('Please upload a vehicle image, RC document, and insurance document.');
            return;
        }
        mutation.mutate({ formData, imageFile, rcFile, insuranceFile });
    };
    
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";
    const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">List a New Vehicle</h2>
                    <p className="mt-2 text-gray-600">Fill in the details and upload documents for your vehicle.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Vehicle Image Upload */}
                    <div>
                        <label className={labelClass}>Vehicle Image (Include all sides & interior)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {imagePreview ? (<img src={imagePreview} alt="Preview" className="mx-auto h-48 w-auto rounded-lg" />) : (<FaUpload className="mx-auto h-12 w-12 text-gray-400" />)}
                                <div className="flex text-sm text-gray-600"><label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"><span>Upload a file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" required /></label><p className="pl-1">or drag and drop</p></div>
                                <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                            </div>
                        </div>
                    </div>

                    {/* --- NEW: RC Document Upload --- */}
                    <div>
                         <label className={labelClass}>Vehicle RC (Registration Certificate)</label>
                         <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <FaFileAlt className={`mx-auto h-12 w-12 ${rcFile ? 'text-green-500' : 'text-gray-400'}`} />
                                <div className="flex text-sm text-gray-600"><label htmlFor="rc-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"><span>Upload RC document</span><input id="rc-upload" name="rc-upload" type="file" className="sr-only" onChange={handleRcChange} accept="image/*,.pdf" required /></label></div>
                                <p className="text-xs text-gray-500">{rcFile ? `Selected: ${rcFile.name}` : 'PNG, JPG, PDF up to 10MB'}</p>
                            </div>
                        </div>
                    </div>

                    {/* --- NEW: Insurance Document Upload --- */}
                    <div>
                         <label className={labelClass}>Vehicle Insurance Document</label>
                         <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <FaFileAlt className={`mx-auto h-12 w-12 ${insuranceFile ? 'text-green-500' : 'text-gray-400'}`} />
                                <div className="flex text-sm text-gray-600"><label htmlFor="insurance-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"><span>Upload insurance</span><input id="insurance-upload" name="insurance-upload" type="file" className="sr-only" onChange={handleInsuranceChange} accept="image/*,.pdf" required /></label></div>
                                <p className="text-xs text-gray-500">{insuranceFile ? `Selected: ${insuranceFile.name}` : 'PNG, JPG, PDF up to 10MB'}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Vehicle Details Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="make" className={labelClass}>Make</label>
                            <input type="text" name="make" id="make" value={formData.make} onChange={handleChange} required className={inputClass} placeholder="e.g., Maruti" />
                        </div>
                        <div>
                            <label htmlFor="model" className={labelClass}>Model</label>
                            <input type="text" name="model" id="model" value={formData.model} onChange={handleChange} required className={inputClass} placeholder="e.g., Swift" />
                        </div>
                         <div>
                            <label htmlFor="year" className={labelClass}>Year</label>
                            <input type="number" name="year" id="year" value={formData.year} onChange={handleChange} required className={inputClass} placeholder="e.g., 2023" />
                        </div>
                        <div>
                            <label htmlFor="license_plate" className={labelClass}>License Plate</label>
                            <input type="text" name="license_plate" id="license_plate" value={formData.license_plate} onChange={handleChange} required className={inputClass} placeholder="e.g., GA01AB1234" />
                        </div>
                        <div>
                            <label htmlFor="price_per_day" className={labelClass}>Price Per Day (₹)</label>
                            <input type="number" name="price_per_day" id="price_per_day" value={formData.price_per_day} onChange={handleChange} required className={inputClass} placeholder="e.g., 2500" />
                        </div>
                        <div>
                            <label htmlFor="seating_capacity" className={labelClass}>Seating Capacity</label>
                            <input type="number" name="seating_capacity" id="seating_capacity" value={formData.seating_capacity} onChange={handleChange} required className={inputClass} placeholder="e.g., 5" />
                        </div>
                        <div>
                            <label htmlFor="vehicle_type" className={labelClass}>Vehicle Type</label>
                            <select name="vehicle_type" id="vehicle_type" value={formData.vehicle_type} onChange={handleChange} className={inputClass}>
                                <option value="Car">Car</option>
                                <option value="Bike">Bike</option>
                                <option value="Scooter">Scooter</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="transmission" className={labelClass}>Transmission</label>
                            <select name="transmission" id="transmission" value={formData.transmission} onChange={handleChange} className={inputClass}>
                                <option value="Manual">Manual</option>
                                <option value="Automatic">Automatic</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="fuel_type" className={labelClass}>Fuel Type</label>
                        <select name="fuel_type" id="fuel_type" value={formData.fuel_type} onChange={handleChange} className={inputClass}>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Electric">Electric</option>
                        </select>
                    </div>

                    {/* Delivery Options Section */}
                    <div className="space-y-4 rounded-lg bg-gray-50 p-4 border">
                        <div className="flex items-center">
                            <input type="checkbox" name="pickup_available" id="pickup_available" checked={formData.pickup_available} onChange={handleChange} className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <label htmlFor="pickup_available" className="ml-3 block font-medium text-gray-800">Offer vehicle pickup?</label>
                        </div>
                        {formData.pickup_available && (
                            <div className="pl-8">
                                <label htmlFor="pickup_charge" className={labelClass}>Pickup Service Charge (₹)</label>
                                <input type="number" name="pickup_charge" id="pickup_charge" value={formData.pickup_charge} onChange={handleChange} className={inputClass} placeholder="e.g., 300" />
                            </div>
                        )}
                        <div className="flex items-center">
                            <input type="checkbox" name="dropoff_available" id="dropoff_available" checked={formData.dropoff_available} onChange={handleChange} className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <label htmlFor="dropoff_available" className="ml-3 block font-medium text-gray-800">Offer vehicle drop-off?</label>
                        </div>
                        {formData.dropoff_available && (
                            <div className="pl-8">
                                <label htmlFor="dropoff_charge" className={labelClass}>Drop-off Service Charge (₹)</label>
                                <input type="number" name="dropoff_charge" id="dropoff_charge" value={formData.dropoff_charge} onChange={handleChange} className={inputClass} placeholder="e.g., 300" />
                            </div>
                        )}
                    </div>

                    <div>
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Submitting...' : 'Submit for Approval'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddVehicle;