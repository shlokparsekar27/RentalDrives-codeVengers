// src/pages/BookingSummary.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { createBooking, openRazorpayCheckout } from '../api/bookings';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';
import { FaLock, FaCalendarAlt, FaCarSide, FaShieldAlt, FaCcVisa, FaCcMastercard, FaCcAmex, FaCreditCard } from 'react-icons/fa';

const BookingSummary = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Safety redirect if no state
    if (!state || !state.vehicle) {
        setTimeout(() => navigate('/cars'), 0);
        return null;
    }

    const { vehicle, startDate, endDate, totalPrice, addPickup, addDropoff } = state;

    // Recalculate breakdown to ensure accuracy
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const rentalCost = days * vehicle.price_per_day;
    const pickupCost = (addPickup && vehicle.pickup_available) ? Number(vehicle.pickup_charge) : 0;
    const dropoffCost = (addDropoff && vehicle.dropoff_available) ? Number(vehicle.dropoff_charge) : 0;

    const subtotal = rentalCost + pickupCost + dropoffCost;
    const platformFee = subtotal * 0.02;
    const finalTotal = subtotal + platformFee;

    const bookingMutation = useMutation({
        mutationFn: createBooking,
        onSuccess: async (data) => {
            // Payment Flow - passing correct arguments to matching api/bookings.js signature
            await openRazorpayCheckout({
                data,
                vehicle,
                user,
                navigate
            });
        },
        onError: (error) => {
            alert('Booking Initiation Failed: ' + error.message);
        }
    });

    const handleConfirmBooking = () => {
        bookingMutation.mutate({
            vehicle, // Pass full object
            user,
            startDate,
            endDate,
            totalPrice: finalTotal
        });
    };

    return (
        <div className="bg-background min-h-screen pt-28 pb-20 font-sans">
            <div className="container mx-auto px-4 max-w-5xl">

                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Secure Checkout</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FaLock className="text-emerald-500" />
                        <span>256-bit SSL Encrypted Transaction</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* LEFT: Order Summary items */}
                    <div className="md:col-span-7 space-y-6">
                        <Card className="overflow-hidden">
                            <div className="bg-secondary/50 p-4 border-b border-border flex justify-between items-center">
                                <h3 className="font-semibold text-foreground flex items-center gap-2">
                                    <FaCarSide className="text-primary" /> Rental Details
                                </h3>
                                <Badge variant="neutral">Pending Payment</Badge>
                            </div>
                            <div className="p-6">
                                <div className="flex gap-4">
                                    <div className="w-24 h-24 bg-secondary rounded-lg overflow-hidden border border-border shrink-0">
                                        <img src={vehicle.image_urls?.[0]} className="w-full h-full object-cover" alt="Vehicle" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-foreground mb-1">{vehicle.make} {vehicle.model}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary">{vehicle.is_certified ? 'Verified Partner' : 'Standard Partner'}</Badge>
                                            <Badge variant="secondary">{vehicle.transmission}</Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-secondary/20 rounded-lg border border-border">
                                        <p className="text-xs text-muted-foreground font-bold uppercase mb-1 flex items-center gap-1"><FaCalendarAlt /> Pickup</p>
                                        <p className="font-mono text-sm text-foreground">{startDate}</p>
                                    </div>
                                    <div className="p-3 bg-secondary/20 rounded-lg border border-border">
                                        <p className="text-xs text-muted-foreground font-bold uppercase mb-1 flex items-center gap-1"><FaCalendarAlt /> Dropoff</p>
                                        <p className="font-mono text-sm text-foreground">{endDate}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="bg-secondary/20 p-4 rounded-lg border border-border flex gap-3 text-sm text-muted-foreground">
                            <FaShieldAlt className="mt-0.5 shrink-0 text-emerald-500" />
                            <p>
                                <strong>Secure Booking.</strong> This booking includes basic insurance coverage.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT: Invoice / Payment */}
                    <div className="md:col-span-5">
                        <Card className="sticky top-28 shadow-xl border-primary/20">
                            <div className="p-6 bg-secondary/30 border-b border-border">
                                <h3 className="font-bold text-lg text-foreground mb-1">Payment Summary</h3>
                                <p className="text-xs text-muted-foreground">Complete your payment to confirm booking.</p>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="bg-secondary/20 rounded-xl p-4 border border-border/50 space-y-3 animate-fade-in-up">
                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span className="font-medium">Rental (₹{vehicle.price_per_day} x {days} days)</span>
                                        <span className="font-mono-numbers">₹{rentalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>

                                    {pickupCost > 0 && (
                                        <div className="flex justify-between text-sm text-muted-foreground animate-fade-in">
                                            <span className="font-medium">Pickup Fee</span>
                                            <span className="font-mono-numbers">₹{pickupCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    )}

                                    {dropoffCost > 0 && (
                                        <div className="flex justify-between text-sm text-muted-foreground animate-fade-in">
                                            <span className="font-medium">Drop-off Fee</span>
                                            <span className="font-mono-numbers">₹{dropoffCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-sm text-muted-foreground">
                                        <span className="font-medium">Platform Fee (2%)</span>
                                        <span className="font-mono-numbers">₹{platformFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold text-foreground pt-3 border-t border-border border-dashed">
                                        <span>Total</span>
                                        <span className="font-mono-numbers text-primary">₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                                <div className="text-xs text-center text-muted-foreground pt-2">
                                    Secure SSL Encrypted Transaction
                                </div>

                                <Button
                                    onClick={handleConfirmBooking}
                                    isLoading={bookingMutation.isPending}
                                    variant="primary"
                                    fullWidth
                                    size="lg"
                                    className="mt-6 text-base shadow-lg shadow-primary/25"
                                >
                                    {bookingMutation.isPending ? 'Processing Securely...' : 'Pay & Confirm'}
                                </Button>

                                <div className="mt-4 flex justify-center gap-4 text-muted-foreground/60">
                                    {/* Real Payment Icons */}
                                    <FaCcVisa className="text-2xl hover:text-[#1A1F71] transition-colors" />
                                    <FaCcMastercard className="text-2xl hover:text-[#EB001B] transition-colors" />
                                    <FaCcAmex className="text-2xl hover:text-[#006FCF] transition-colors" />
                                    <FaCreditCard className="text-2xl hover:text-foreground transition-colors" />
                                </div>
                                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wider mt-2">
                                    Powered by Razorpay
                                </p>
                            </div>
                        </Card>
                    </div>

                </div>
            </div >
        </div >
    );
};

export default BookingSummary;