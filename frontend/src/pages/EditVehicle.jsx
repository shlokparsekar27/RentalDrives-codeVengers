// src/pages/EditVehicle.jsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
// import "../styles/Auth.css"; // No longer needed

// --- API Functions ---
const fetchVehicleById = async (vehicleId) => {
    // This can be a direct Supabase call or through your backend
    const { data, error } = await supabase.from('vehicles').select('*').eq('id', vehicleId).single();
    if (error) throw new Error('Failed to fetch vehicle data.');
    return data;
};

const updateVehicle = async ({ vehicleId, formData }) => {
    const { data: { session } } = await supabase.auth.getSession();
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
    });
    if (!response.ok) throw new Error('Failed to update vehicle.');
    return response.json();
};

function EditVehicle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState(null);

    const { data: vehicle, isLoading, isError } = useQuery({
        queryKey: ['vehicle', id],
        queryFn: () => fetchVehicleById(id),
    });

    useEffect(() => {
        if (vehicle) {
            setFormData({
                make: vehicle.make,
                model: vehicle.model,
                year: vehicle.year,
                license_plate: vehicle.license_plate,
                price_per_day: vehicle.price_per_day,
                vehicle_type: vehicle.vehicle_type,
                transmission: vehicle.transmission,
                fuel_type: vehicle.fuel_type,
                seating_capacity: vehicle.seating_capacity,
            });
        }
    }, [vehicle]);

    const mutation = useMutation({
        mutationFn: updateVehicle,
        onSuccess: () => {
            alert('Vehicle updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['myVehicles'] });
            queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
            navigate('/host/dashboard');
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate({ vehicleId: id, formData });
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Make */}
                        <div>
                            <label htmlFor="make" className={labelClass}>Make</label>
                            <input type="text" name="make" id="make" value={formData.make} onChange={handleChange} required className={inputClass} />
                        </div>
                        
                        {/* Model */}
                        <div>
                            <label htmlFor="model" className={labelClass}>Model</label>
                            <input type="text" name="model" id="model" value={formData.model} onChange={handleChange} required className={inputClass} />
                        </div>

                        {/* Year */}
                        <div>
                            <label htmlFor="year" className={labelClass}>Year</label>
                            <input type="number" name="year" id="year" value={formData.year} onChange={handleChange} required className={inputClass} />
                        </div>

                        {/* License Plate */}
                        <div>
                            <label htmlFor="license_plate" className={labelClass}>License Plate</label>
                            <input type="text" name="license_plate" id="license_plate" value={formData.license_plate} onChange={handleChange} required className={inputClass} />
                        </div>

                        {/* Price Per Day */}
                        <div>
                            <label htmlFor="price_per_day" className={labelClass}>Price Per Day (₹)</label>
                            <input type="number" name="price_per_day" id="price_per_day" value={formData.price_per_day} onChange={handleChange} required className={inputClass} />
                        </div>

                        {/* Seating Capacity */}
                        <div>
                            <label htmlFor="seating_capacity" className={labelClass}>Seating Capacity</label>
                            <input type="number" name="seating_capacity" id="seating_capacity" value={formData.seating_capacity} onChange={handleChange} required className={inputClass} />
                        </div>

                        {/* Vehicle Type */}
                        <div>
                            <label htmlFor="vehicle_type" className={labelClass}>Vehicle Type</label>
                            <select name="vehicle_type" id="vehicle_type" value={formData.vehicle_type} onChange={handleChange} className={inputClass}>
                                <option value="Car">Car</option>
                                <option value="Bike">Bike</option>
                                <option value="Scooter">Scooter</option>
                            </select>
                        </div>

                        {/* Transmission */}
                        <div>
                            <label htmlFor="transmission" className={labelClass}>Transmission</label>
                            <select name="transmission" id="transmission" value={formData.transmission} onChange={handleChange} className={inputClass}>
                                <option value="Manual">Manual</option>
                                <option value="Automatic">Automatic</option>
                            </select>
                        </div>
                    </div>

                    {/* Fuel Type (Full Width) */}
                    <div>
                        <label htmlFor="fuel_type" className={labelClass}>Fuel Type</label>
                        <select name="fuel_type" id="fuel_type" value={formData.fuel_type} onChange={handleChange} className={inputClass}>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Electric">Electric</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all disabled:bg-gray-400" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditVehicle;
