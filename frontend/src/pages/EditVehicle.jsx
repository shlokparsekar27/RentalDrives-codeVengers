// src/pages/EditVehicle.jsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { FaFileAlt, FaExternalLinkAlt } from 'react-icons/fa';

// --- API Functions ---
const fetchVehicleById = async (vehicleId) => {
    const { data, error } = await supabase.from('vehicles').select('*').eq('id', vehicleId).single();
    if (error) throw new Error('Failed to fetch vehicle data.');
    return data;
};

// --- THIS IS THE CORRECTED FUNCTION ---
// It now properly accepts 'docType' and uses it in the fetch URL.
const getCertificationUrlForHost = async (vehicleId, docType) => {
    const { data: { session } } = await supabase.auth.getSession();
    // The `?type=${docType}` part tells the backend which document to fetch.
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
        const { error: uploadError } = await supabase.storage.from('vehicle-certifications').upload(rcFileName, newRcFile);
        if (uploadError) throw new Error(`RC upload failed: ${uploadError.message}`);
        const { data: urlData } = supabase.storage.from('vehicle-certifications').getPublicUrl(rcFileName);
        updatedFormData.rc_document_url = urlData.publicUrl;
    }

    if (newInsuranceFile) {
        const insExt = newInsuranceFile.name.split('.').pop();
        const insFileName = `ins-${vehicleId}-${Date.now()}.${insExt}`;
        const { error: uploadError } = await supabase.storage.from('vehicle-certifications').upload(insFileName, newInsuranceFile);
        if (uploadError) throw new Error(`Insurance upload failed: ${uploadError.message}`);
        const { data: urlData } = supabase.storage.from('vehicle-certifications').getPublicUrl(insFileName);
        updatedFormData.insurance_document_url = urlData.publicUrl;
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
            alert('Vehicle updated successfully! It is now pending admin re-approval.');
            queryClient.invalidateQueries({ queryKey: ['myVehicles'] });
            queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
            navigate('/host/dashboard');
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: type === 'checkbox' ? checked : value }));
    };
    
    const handleRcChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setNewRcFile(e.target.files[0]);
        }
    };
    
    const handleInsuranceChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setNewInsuranceFile(e.target.files[0]);
        }
    };

    const handleViewDocument = async (docType) => {
        const newWindow = window.open('', '_blank');
        newWindow.document.write('Loading document, please wait...');
        try {
            const secureUrl = await getCertificationUrlForHost(id, docType);
            newWindow.location.href = secureUrl;
        } catch (error) {
            newWindow.close();
            alert(`Could not load document: ${error.message}`);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const { license_plate, ...dataToUpdate } = formData;
        mutation.mutate({ vehicleId: id, formData: dataToUpdate, newRcFile, newInsuranceFile });
    };

    const labelClass = "block text-sm font-medium text-gray-700 mb-1";
    const inputClass = "w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

    if (isLoading || !formData) {
        return <div className="text-center p-10 font-bold text-xl">Loading Vehicle Data...</div>;
    }
    if (isError) {
        return <div className="text-center p-10 text-red-600"><h2>Error loading vehicle data.</h2></div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">Edit Vehicle Details</h2>
                    <p className="mt-2 text-gray-600">Update the information for your vehicle below.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* RC Document Section */}
                    <div>
                         <label className={labelClass}>Vehicle RC (Registration Certificate)</label>
                         {formData.rc_document_url && (
                            <div className="mb-2">
                                <button type="button" onClick={() => handleViewDocument('rc')} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                    <FaExternalLinkAlt /> View Current RC
                                </button>
                            </div>
                         )}
                         <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <FaFileAlt className={`mx-auto h-12 w-12 ${newRcFile ? 'text-green-500' : 'text-gray-400'}`} />
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="rc-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                        <span>Upload new RC</span>
                                        <input id="rc-upload" name="rc-upload" type="file" className="sr-only" onChange={handleRcChange} accept="image/*,.pdf" />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500">{newRcFile ? `Selected: ${newRcFile.name}` : 'Replace the current document'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Insurance Document Section */}
                    <div>
                         <label className={labelClass}>Vehicle Insurance Document</label>
                         {formData.insurance_document_url && (
                            <div className="mb-2">
                                <button type="button" onClick={() => handleViewDocument('insurance')} className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                    <FaExternalLinkAlt /> View Current Insurance
                                </button>
                            </div>
                         )}
                         <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <FaFileAlt className={`mx-auto h-12 w-12 ${newInsuranceFile ? 'text-green-500' : 'text-gray-400'}`} />
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="insurance-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                        <span>Upload new insurance</span>
                                        <input id="insurance-upload" name="insurance-upload" type="file" className="sr-only" onChange={handleInsuranceChange} accept="image/*,.pdf" />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500">{newInsuranceFile ? `Selected: ${newInsuranceFile.name}` : 'Replace the current document'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Other Vehicle Details... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label htmlFor="make" className={labelClass}>Make</label><input type="text" name="make" id="make" value={formData.make} onChange={handleChange} required className={inputClass} /></div>
                        <div><label htmlFor="model" className={labelClass}>Model</label><input type="text" name="model" id="model" value={formData.model} onChange={handleChange} required className={inputClass} /></div>
                        <div><label htmlFor="year" className={labelClass}>Year</label><input type="number" name="year" id="year" value={formData.year} onChange={handleChange} required className={inputClass} /></div>
                        <div><label htmlFor="license_plate" className={labelClass}>License Plate (Cannot be changed)</label><input type="text" name="license_plate" id="license_plate" value={formData.license_plate} required className={`${inputClass} bg-gray-100 cursor-not-allowed`} disabled /></div>
                        <div><label htmlFor="price_per_day" className={labelClass}>Price Per Day (₹)</label><input type="number" name="price_per_day" id="price_per_day" value={formData.price_per_day} onChange={handleChange} required className={inputClass} /></div>
                        <div><label htmlFor="seating_capacity" className={labelClass}>Seating Capacity</label><input type="number" name="seating_capacity" id="seating_capacity" value={formData.seating_capacity} onChange={handleChange} required className={inputClass} /></div>
                        <div><label htmlFor="vehicle_type" className={labelClass}>Vehicle Type</label><select name="vehicle_type" id="vehicle_type" value={formData.vehicle_type} onChange={handleChange} className={inputClass}><option value="Car">Car</option><option value="Bike">Bike</option><option value="Scooter">Scooter</option></select></div>
                        <div><label htmlFor="transmission" className={labelClass}>Transmission</label><select name="transmission" id="transmission" value={formData.transmission} onChange={handleChange} className={inputClass}><option value="Manual">Manual</option><option value="Automatic">Automatic</option></select></div>
                    </div>
                    <div><label htmlFor="fuel_type" className={labelClass}>Fuel Type</label><select name="fuel_type" id="fuel_type" value={formData.fuel_type} onChange={handleChange} className={inputClass}><option value="Petrol">Petrol</option><option value="Diesel">Diesel</option><option value="Electric">Electric</option></select></div>
                    
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
                            {mutation.isPending ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditVehicle;