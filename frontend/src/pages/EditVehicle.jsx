// src/pages/EditVehicle.jsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import "../styles/Auth.css"; // Reuse auth form styles

// --- API Functions ---
const fetchVehicleById = async (vehicleId) => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles/${vehicleId}`);
    if (!response.ok) throw new Error('Failed to fetch vehicle data.');
    return response.json();
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
    const { id } = useParams(); // Get vehicle ID from URL
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState(null);

    // Fetch the vehicle's current data
    const { data: vehicle, isLoading, isError } = useQuery({
        queryKey: ['vehicle', id],
        queryFn: () => fetchVehicleById(id),
    });

    // Pre-populate the form once data is fetched
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

    if (isLoading || !formData) return <h2>Loading...</h2>;
    if (isError) return <h2>Error loading vehicle data.</h2>;

    return (
        <div className="auth-container">
            <h2>Edit Vehicle</h2>
            <form className="auth-form" onSubmit={handleSubmit}>
                <label>Make</label>
                <input type="text" name="make" value={formData.make} onChange={handleChange} required />

                <label>Model</label>
                <input type="text" name="model" value={formData.model} onChange={handleChange} required />

                <label>Year</label>
                <input type="number" name="year" value={formData.year} onChange={handleChange} required />

                {/* ... Add all other form inputs just like in AddVehicle.jsx ... */}
                {/* For brevity, showing just a few. The structure is identical. */}
                
                <label>Price Per Day (₹)</label>
                <input type="number" name="price_per_day" value={formData.price_per_day} onChange={handleChange} required />

                <label>Seating Capacity</label>
                <input type="number" name="seating_capacity" value={formData.seating_capacity} onChange={handleChange} required />

                {/* ... Add selects for vehicle_type, transmission, fuel_type ... */}

                <button type="submit" className="auth-btn" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
}

export default EditVehicle;