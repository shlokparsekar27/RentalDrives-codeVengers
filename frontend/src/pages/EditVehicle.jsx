// src/pages/EditVehicle.jsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { FaFileAlt, FaExternalLinkAlt, FaSave, FaArrowLeft, FaCar, FaMotorcycle, FaBicycle, FaCog, FaMoneyBillWave, FaShieldAlt } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';

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
        setFormData(prevData => ({ ...prevData, [name]: type === 'checkbox' ? checked : value }));
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

    if (isLoading || !formData) return <div className="text-center p-10 font-mono text-muted-foreground animate-pulse pt-32">LOADING VEHICLE DATA...</div>;
    if (isError) return <div className="text-center p-10 text-destructive pt-32">ERROR LOADING DATA.</div>;

    return (
        <div className="bg-background min-h-screen pt-24 pb-20 font-sans">
            <div className="container mx-auto px-4 max-w-4xl">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-8">
                    <div>
                        <Badge variant="warning" className="mb-2">Maintenance Mode</Badge>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Vehicle</h1>
                        <p className="mt-1 text-muted-foreground">Modify details for <span className="font-bold text-foreground">{vehicle?.make} {vehicle?.model}</span></p>
                    </div>
                    <Button to="/host/dashboard" variant="outline" size="sm" className="gap-2">
                        <FaArrowLeft /> Cancel & Return
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COL: Specs */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 1. Core Specs */}
                        <Card className="p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-foreground">
                                <FaCog className="text-primary" /> Specifications
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Make</label>
                                    <input name="make" value={formData.make} onChange={handleChange} required className="w-full p-3 bg-secondary rounded-lg border border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Model</label>
                                    <input name="model" value={formData.model} onChange={handleChange} required className="w-full p-3 bg-secondary rounded-lg border border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Year</label>
                                    <input type="number" name="year" value={formData.year} onChange={handleChange} required className="w-full p-3 bg-secondary rounded-lg border border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Plate No (Fixed)</label>
                                    <input value={formData.license_plate} disabled className="w-full p-3 bg-secondary/50 rounded-lg border border-border text-muted-foreground cursor-not-allowed font-mono uppercase" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Type</label>
                                    <select name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} className="w-full p-3 bg-secondary rounded-lg border border-transparent focus:bg-background focus:border-primary outline-none">
                                        <option value="Car">Car</option>
                                        <option value="Bike">Bike</option>
                                        <option value="Scooter">Scooter</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Gearbox</label>
                                    <select name="transmission" value={formData.transmission} onChange={handleChange} className="w-full p-3 bg-secondary rounded-lg border border-transparent focus:bg-background focus:border-primary outline-none">
                                        <option value="Manual">Manual</option>
                                        <option value="Automatic">Automatic</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Fuel</label>
                                    <select name="fuel_type" value={formData.fuel_type} onChange={handleChange} className="w-full p-3 bg-secondary rounded-lg border border-transparent focus:bg-background focus:border-primary outline-none">
                                        <option value="Petrol">Petrol</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Electric">Electric</option>
                                    </select>
                                </div>
                            </div>
                        </Card>

                        {/* 2. Pricing & Logistics */}
                        <Card className="p-6">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-foreground">
                                <FaMoneyBillWave className="text-emerald-500" /> Pricing & Logistics
                            </h3>
                            <div className="mb-6 space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Daily Rate (₹)</label>
                                <input type="number" name="price_per_day" value={formData.price_per_day} onChange={handleChange} required className="w-full p-3 bg-secondary rounded-lg border border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-mono text-xl" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 bg-secondary/20 rounded-lg border border-border">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="font-bold text-sm">Pickup</label>
                                        <input type="checkbox" name="pickup_available" checked={formData.pickup_available} onChange={handleChange} className="w-5 h-5 accent-primary" />
                                    </div>
                                    {formData.pickup_available && (
                                        <input type="number" name="pickup_charge" value={formData.pickup_charge} onChange={handleChange} className="w-full p-2 bg-background rounded text-sm outline-none border border-border focus:border-primary" placeholder="Charge" />
                                    )}
                                </div>
                                <div className="p-4 bg-secondary/20 rounded-lg border border-border">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="font-bold text-sm">Drop-off</label>
                                        <input type="checkbox" name="dropoff_available" checked={formData.dropoff_available} onChange={handleChange} className="w-5 h-5 accent-primary" />
                                    </div>
                                    {formData.dropoff_available && (
                                        <input type="number" name="dropoff_charge" value={formData.dropoff_charge} onChange={handleChange} className="w-full p-2 bg-background rounded text-sm outline-none border border-border focus:border-primary" placeholder="Charge" />
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* RIGHT COL: Docs & Save */}
                    <div className="space-y-6">
                        <Card className="p-6 sticky top-28">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-foreground">
                                <FaShieldAlt className="text-blue-500" /> Docs Update
                            </h3>

                            <div className="space-y-6">
                                {/* RC */}
                                <div className="border border-dashed border-border rounded-xl p-4 bg-secondary/10">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold uppercase">RC Doc</span>
                                        {formData.rc_document_url && (
                                            <button type="button" onClick={() => handleViewDocument('rc')} className="text-xs text-primary hover:underline flex items-center gap-1"><FaExternalLinkAlt /> View</button>
                                        )}
                                    </div>
                                    <input type="file" onChange={(e) => handleFileChange(e, setNewRcFile)} className="block w-full text-xs text-muted-foreground file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
                                    {newRcFile && <p className="text-xs text-emerald-500 mt-1 font-bold">New file selected</p>}
                                </div>

                                {/* Insurance */}
                                <div className="border border-dashed border-border rounded-xl p-4 bg-secondary/10">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold uppercase">Insurance</span>
                                        {formData.insurance_document_url && (
                                            <button type="button" onClick={() => handleViewDocument('insurance')} className="text-xs text-primary hover:underline flex items-center gap-1"><FaExternalLinkAlt /> View</button>
                                        )}
                                    </div>
                                    <input type="file" onChange={(e) => handleFileChange(e, setNewInsuranceFile)} className="block w-full text-xs text-muted-foreground file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90" />
                                    {newInsuranceFile && <p className="text-xs text-emerald-500 mt-1 font-bold">New file selected</p>}
                                </div>
                            </div>

                            <div className="border-t border-border mt-6 pt-6">
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="primary"
                                    size="lg"
                                    isLoading={mutation.isPending}
                                    className="shadow-xl"
                                >
                                    {mutation.isPending ? 'Saving...' : <><FaSave className="mr-2" /> Save Changes</>}
                                </Button>
                                <p className="text-xs text-muted-foreground mt-3 text-center">
                                    Submitting changes will require re-verification by admin.
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