// src/pages/AddVehicle.jsx
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import "../styles/Auth.css"; // Reuse auth form styles

// Function to call the backend to create a vehicle
const createVehicle = async (vehicleData) => {
    // 1. Get the current session which contains the access token
    const { data: { session } } = await supabase.auth.getSession();

    // 2. Make the request to your backend
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vehicles`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 3. Include the token in the 'Authorization' header
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
        make: '',
        model: '',
        year: '',
        license_plate: '',
        price_per_day: '',
        vehicle_type: 'Car',
        transmission: 'Manual',
        fuel_type: 'Petrol',
        seating_capacity: '',
    });

    const mutation = useMutation({
        mutationFn: createVehicle,
        onSuccess: () => {
            alert('Vehicle listed successfully! It is now pending admin approval.');
            queryClient.invalidateQueries({ queryKey: ['myVehicles'] }); // Refetch host's vehicles
            navigate('/host/dashboard');
        },
        onError: (error) => {
            alert(`Error: ${error.message}`);
        }
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    return (
        <div className="auth-container">
            <h2>List a New Vehicle</h2>
            <form className="auth-form" onSubmit={handleSubmit}>
                {/* Add form inputs for each field */}
                <label>Make</label>
                <input type="text" name="make" value={formData.make} onChange={handleChange} required />

                <label>Model</label>
                <input type="text" name="model" value={formData.model} onChange={handleChange} required />

                <label>Year</label>
                <input type="number" name="year" value={formData.year} onChange={handleChange} required />

                <label>License Plate</label>
                <input type="text" name="license_plate" value={formData.license_plate} onChange={handleChange} required />

                <label>Price Per Day (₹)</label>
                <input type="number" name="price_per_day" value={formData.price_per_day} onChange={handleChange} required />

                <label>Seating Capacity</label>
                <input type="number" name="seating_capacity" value={formData.seating_capacity} onChange={handleChange} required />

                <label>Vehicle Type</label>
                <select name="vehicle_type" value={formData.vehicle_type} onChange={handleChange}>
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Scooter">Scooter</option>
                </select>

                <label>Transmission</label>
                <select name="transmission" value={formData.transmission} onChange={handleChange}>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                </select>

                <label>Fuel Type</label>
                <select name="fuel_type" value={formData.fuel_type} onChange={handleChange}>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                </select>

                <button type="submit" className="auth-btn" disabled={mutation.isPending}>
                    {mutation.isPending ? 'Submitting...' : 'Submit for Approval'}
                </button>
            </form>
        </div>
    );
}

export default AddVehicle;