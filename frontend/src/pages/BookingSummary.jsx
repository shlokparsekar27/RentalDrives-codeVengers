import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { createBooking, openRazorpayCheckout } from '../api/bookings';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';
import { FaLock, FaCalendarAlt, FaCarSide, FaMapMarkerAlt, FaShieldAlt } from 'react-icons/fa';

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

    const { vehicle, startDate, endDate, totalPrice } = state;
    const platformFee = totalPrice * 0.02;
    const finalTotal = totalPrice + platformFee;

    const bookingMutation = useMutation({
        mutationFn: createBooking,
        onSuccess: async (booking) => {
            // Payment Flow
            await openRazorpayCheckout(booking, user, {
                onSuccess: () => {
                    queryClient.invalidateQueries(['bookings']);
                    navigate('/profile'); // Or success page
                },
                onError: (err) => {
                    alert('Payment Failed: ' + err.message);
                }
            });
        },
        onError: (error) => {
            alert('Booking Initiation Failed: ' + error.message);
        }
    });

    const handleConfirmBooking = () => {
        bookingMutation.mutate({
            vehicleId: vehicle.id,
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
                                        <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3">Vehicle ID: {vehicle.id.slice(0, 8)}</p>
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

                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/20 flex gap-3 text-sm text-blue-800 dark:text-blue-300">
                            <FaShieldAlt className="mt-0.5 shrink-0" />
                            <p>
                                <strong>Free Cancellation</strong> up to 24 hours before pickup.
                                This booking includes basic insurance coverage. Secure your ride now.
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
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Base Rate (₹{vehicle.price_per_day} x Days)</span>
                                    <span className="font-mono-numbers text-foreground">₹{totalPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Platform Fee & Taxes</span>
                                    <span className="font-mono-numbers text-foreground">₹{platformFee.toFixed(0)}</span>
                                </div>
                                <div className="border-t border-border mt-4 pt-4 flex justify-between items-center">
                                    <span className="font-bold text-lg text-foreground">Total Payable</span>
                                    <span className="font-bold text-2xl text-primary font-mono-numbers">₹{finalTotal.toLocaleString()}</span>
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

                                <div className="mt-4 flex justify-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all">
                                    {/* Placeholder Payment Icons */}
                                    <div className="h-6 w-10 bg-slate-300 rounded dark:bg-slate-700"></div>
                                    <div className="h-6 w-10 bg-slate-300 rounded dark:bg-slate-700"></div>
                                    <div className="h-6 w-10 bg-slate-300 rounded dark:bg-slate-700"></div>
                                </div>
                                <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wider mt-2">
                                    Powered by Razorpay
                                </p>
                            </div>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BookingSummary;