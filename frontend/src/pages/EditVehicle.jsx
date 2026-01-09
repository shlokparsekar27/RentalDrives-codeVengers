// src/pages/EditVehicle.jsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { FaExternalLinkAlt, FaSave, FaArrowLeft, FaCar, FaMotorcycle, FaBicycle, FaCog, FaMoneyBillWave, FaShieldAlt } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';

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
        let newValue = type === 'checkbox' ? checked : value;

        if (['price_per_day', 'pickup_charge', 'dropoff_charge'].includes(name)) {
            if (newValue < 0) newValue = 0;
        }

        setFormData(prevData => ({ ...prevData, [name]: newValue }));
    };

    const handleFileChange = (e, setter) => {
        if (e.target.files && e.target.files[0]) {
            setter(e.target.files[0]);
        }
    };

    const handleViewDocument = async (docType) => {
        const newWindow = window.open('', '_blank');
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

    if (isLoading || !formData) return <div className="text-center p-10 font-mono text-muted-foreground animate-pulse pt-32">Data Loading...</div>;
    if (isError) return <div className="text-center p-10 text-destructive pt-32">Error loading data.</div>;

    const inputClasses = "w-full px-3 py-2 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm";
    const labelClasses = "block text-xs font-semibold uppercase text-muted-foreground mb-1.5 tracking-wide";
    const sectionTitleClasses = "font-bold text-lg mb-4 flex items-center gap-2 text-foreground";

    return (
        <div className="bg-background min-h-screen pt-28 pb-24 text-foreground font-sans">
            <div className="container mx-auto px-4 max-w-5xl">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Vehicle</h1>
                        <p className="text-sm text-muted-foreground">Update details for <span className="font-semibold text-foreground">{vehicle?.make} {vehicle?.model}</span></p>
                    </div>
                    <Button to="/host/dashboard" variant="outline" size="sm" className="h-9 px-4 text-xs font-bold border-border">
                        <FaArrowLeft className="mr-2" /> Return
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Specs & Pricing */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Specs Card */}
                        <Card className="p-6 border border-border shadow-sm bg-card rounded-lg">
                            <h3 className={sectionTitleClasses}>
                                <FaCog className="text-primary" /> Vehicle Details
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                                <div>
                                    <label className={labelClasses}>Make</label>
                                    <input name="make" value={formData.make} onChange={handleChange} required className={inputClasses} placeholder="Toyota" />
                                </div>
                                <div>
                                    <label className={labelClasses}>Model</label>
                                    <input name="model" value={formData.model} onChange={handleChange} required className={inputClasses} placeholder="Camry" />
                                </div>
                                <div>
                                    <label className={labelClasses}>Year</label>
                                    <input type="number" name="year" value={formData.year} onChange={handleChange} required className={inputClasses} placeholder="2023" />
                                </div>
                                <div>
                                    <label className={labelClasses}>Plate Number</label>
                                    <input value={formData.license_plate} disabled className={`${inputClasses} bg-muted opacity-70 cursor-not-allowed`} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                <div>
                                    <label className={labelClasses}>Type</label>
                                    <select name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} className={inputClasses}>
                                        <option value="Car">Car</option>
                                        <option value="Bike">Bike</option>
                                        <option value="Scooter">Scooter</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClasses}>Gearbox</label>
                                    <select name="transmission" value={formData.transmission} onChange={handleChange} className={inputClasses}>
                                        <option value="Manual">Manual</option>
                                        <option value="Automatic">Automatic</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClasses}>Fuel</label>
                                    <select name="fuel_type" value={formData.fuel_type} onChange={handleChange} className={inputClasses}>
                                        <option value="Petrol">Petrol</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Electric">Electric</option>
                                    </select>
                                </div>
                            </div>
                        </Card>

                        {/* Pricing & Logistics Card */}
                        <Card className="p-6 border border-border shadow-sm bg-card rounded-lg">
                            <h3 className={sectionTitleClasses}>
                                <FaMoneyBillWave className="text-emerald-500" /> Pricing & Logistics
                            </h3>

                            <div className="mb-6 max-w-xs">
                                <label className={labelClasses}>Daily Rate (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">₹</span>
                                    <input type="number" min="0" name="price_per_day" value={formData.price_per_day} onChange={handleChange} required className={`${inputClasses} pl-7 font-semibold`} placeholder="0" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Pickup Service */}
                                <div className="p-4 rounded-md border border-border bg-secondary/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-semibold flex items-center justify-between w-full cursor-pointer select-none">
                                            <span>Pickup Service</span>
                                            <input type="checkbox" name="pickup_available" checked={formData.pickup_available} onChange={handleChange} className="w-4 h-4 text-primary rounded border-border focus:ring-primary/20" />
                                        </label>
                                    </div>
                                    {formData.pickup_available && (
                                        <div className="animate-fade-in pl-6">
                                            <input type="number" min="0" name="pickup_charge" value={formData.pickup_charge} onChange={handleChange} className={inputClasses} placeholder="Charge (₹)" />
                                            <p className="text-[10px] text-muted-foreground mt-1">Extra fee for pickup</p>
                                        </div>
                                    )}
                                </div>

                                {/* Drop-off Service */}
                                <div className="p-4 rounded-md border border-border bg-secondary/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-semibold flex items-center justify-between w-full cursor-pointer select-none">
                                            <span>Drop-off Service</span>
                                            <input type="checkbox" name="dropoff_available" checked={formData.dropoff_available} onChange={handleChange} className="w-4 h-4 text-primary rounded border-border focus:ring-primary/20" />
                                        </label>
                                    </div>
                                    {formData.dropoff_available && (
                                        <div className="animate-fade-in pl-6">
                                            <input type="number" min="0" name="dropoff_charge" value={formData.dropoff_charge} onChange={handleChange} className={inputClasses} placeholder="Charge (₹)" />
                                            <p className="text-[10px] text-muted-foreground mt-1">Extra fee for drop-off</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Docs & Actions */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="p-6 sticky top-28 border border-border shadow-sm bg-card rounded-lg">
                            <h3 className={sectionTitleClasses}>
                                <FaShieldAlt className="text-blue-500" /> Documents
                            </h3>

                            <div className="space-y-4">
                                {/* RC */}
                                <div className="p-3 border border-dashed border-border rounded-md bg-secondary/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold uppercase text-muted-foreground">RC Document</span>
                                        {formData.rc_document_url && (
                                            <button type="button" onClick={() => handleViewDocument('rc')} className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"><FaExternalLinkAlt size={10} /> View</button>
                                        )}
                                    </div>
                                    <input type="file" onChange={(e) => handleFileChange(e, setNewRcFile)} className="block w-full text-xs text-muted-foreground file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
                                    {newRcFile && <p className="text-xs text-emerald-600 mt-2 font-medium">● New file selected</p>}
                                </div>

                                {/* Insurance */}
                                <div className="p-3 border border-dashed border-border rounded-md bg-secondary/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold uppercase text-muted-foreground">Insurance</span>
                                        {formData.insurance_document_url && (
                                            <button type="button" onClick={() => handleViewDocument('insurance')} className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"><FaExternalLinkAlt size={10} /> View</button>
                                        )}
                                    </div>
                                    <input type="file" onChange={(e) => handleFileChange(e, setNewInsuranceFile)} className="block w-full text-xs text-muted-foreground file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" />
                                    {newInsuranceFile && <p className="text-xs text-emerald-600 mt-2 font-medium">● New file selected</p>}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="border-t border-border mt-6 pt-6 space-y-3">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={mutation.isPending}
                                    className="w-full font-bold h-10 text-sm shadow-sm"
                                >
                                    {mutation.isPending ? 'Saving...' : <><FaSave className="mr-2" /> Save Changes</>}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => navigate('/host/dashboard')}
                                    variant="ghost"
                                    className="w-full h-10 text-sm text-muted-foreground hover:text-foreground"
                                >
                                    Cancel
                                </Button>
                                <p className="text-[10px] text-muted-foreground text-center mt-2">
                                    <span className="font-bold text-amber-500">Note:</span> Saving changes will revert status to <strong>Pending</strong>.
                                </p>
                            </div>
                        </Card>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default EditVehicle;