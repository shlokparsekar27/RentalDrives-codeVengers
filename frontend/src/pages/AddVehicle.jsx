// src/pages/AddVehicle.jsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FaUpload } from 'react-icons/fa'; // Using an icon for the upload button

// This function now handles image upload first, then sends the URL to your backend
const createVehicle = async ({ formData, imageFile }) => {
    let imageUrls = [];

    // 1. If an image is selected, upload it to Supabase Storage
    if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('vehicle-images') // The bucket we created
            .upload(filePath, imageFile);

        if (uploadError) {
            throw new Error(`Image Upload Failed: ${uploadError.message}`);
        }

        // 2. Get the public URL of the uploaded image
        const { data: urlData } = supabase.storage
            .from('vehicle-images')
            .getPublicUrl(filePath);
        
        imageUrls.push(urlData.publicUrl);
    }

    // 3. Prepare the final vehicle data including the image URL
    const vehicleData = {
        ...formData,
        image_urls: imageUrls,
    };

    // 4. Send the complete data to your backend API
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(vehicleData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create vehicle');
    }
    return response.json();
};

function AddVehicle() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        make: '', model: '', year: '', license_plate: '',
        price_per_day: '', vehicle_type: 'Car', transmission: 'Manual',
        fuel_type: 'Petrol', seating_capacity: '',
    });
    const [imageFile, setImageFile] = useState(null); // NEW: State for the image file
    const [imagePreview, setImagePreview] = useState(''); // NEW: State for image preview

    const mutation = useMutation({
        mutationFn: createVehicle,
        onSuccess: () => {
            alert('Vehicle listed successfully! It is now pending admin approval.');
            queryClient.invalidateQueries({ queryKey: ['myVehicles'] });
            navigate('/host/dashboard');
        },
        onError: (error) => {
            alert(`Error: ${error.message}`);
        }
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // NEW: Handler for the file input
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!imageFile) {
            alert('Please upload an image for the vehicle.');
            return;
        }
        // Pass both form data and the image file to the mutation
        mutation.mutate({ formData, imageFile });
    };
    
    const labelClass = "block text-sm font-medium text-gray-700 mb-1";
    const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">List a New Vehicle</h2>
                    <p className="mt-2 text-gray-600">Fill in the details and upload an image of your vehicle.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* --- NEW: Image Upload Section --- */}
                    <div>
                        <label className={labelClass}>Vehicle Image</label>
                        <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Vehicle preview" className="mx-auto h-48 w-auto rounded-lg" />
                                ) : (
                                    <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                                )}
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" required />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* --- Rest of the form --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Fields remain the same as before */}
                        <div>
                            <label htmlFor="make" className={labelClass}>Make</label>
                            <input type="text" name="make" id="make" value={formData.make} onChange={handleChange} required className={inputClass} placeholder="e.g., Maruti" />
                        </div>
                        <div>
                            <label htmlFor="model" className={labelClass}>Model</label>
                            <input type="text" name="model" id="model" value={formData.model} onChange={handleChange} required className={inputClass} placeholder="e.g., Swift" />
                        </div>
                        {/* ... other input fields ... */}
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

                    <div>
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all disabled:bg-gray-400" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Submitting...' : 'Submit for Approval'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddVehicle;