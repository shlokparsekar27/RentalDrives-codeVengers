import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { FaTimes, FaCar, FaCalendarAlt, FaUserCircle, FaMoneyBillWave, FaInfoCircle, FaCheckCircle, FaTimesCircle, FaClock, FaGasPump, FaCogs, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import Button from './ui/Button';
import Card from './ui/Card';
import Badge from './ui/Badge';


const fetchBookingDetails = async (bookingId, session) => {
    if (!bookingId || !session) return null;
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/booking/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch booking details');
    return response.json();
};

const updateBookingStatus = async ({ bookingId, status, session }) => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ status }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update booking status to ${status}`);
    }
    return response.json();
};

const cancelBooking = async ({ bookingId, session, requestRefund }) => {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ requestRefund }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to cancel booking");
    }
    return response.json();
};

const StatusBadge = ({ status }) => {
    let variant = 'neutral';
    if (status === 'confirmed') variant = 'success';
    if (status === 'cancelled' || status === 'rejected') variant = 'destructive';
    if (status === 'completed') variant = 'primary';
    if (status === 'pending') variant = 'warning';
    return (
        <Badge variant={variant} className="flex items-center gap-1 uppercase text-[10px] tracking-wider px-2 py-0.5">
            {status === 'confirmed' && <FaCheckCircle size={10} />}
            {status === 'cancelled' && <FaTimesCircle size={10} />}
            {status === 'rejected' && <FaTimesCircle size={10} />}
            {status === 'pending' && <FaClock size={10} />}
            {status}
        </Badge>
    );
};

function BookingDetailsModal({ bookingId, isOpen, onClose }) {
    const { session } = useAuth();
    const queryClient = useQueryClient();
    const [showConfirmCancel, setShowConfirmCancel] = useState(false);
    const [showConfirmReject, setShowConfirmReject] = useState(false);
    const [showConfirmComplete, setShowConfirmComplete] = useState(false);
    const [showRefundPrompt, setShowRefundPrompt] = useState(false); // New state for refund Prompt

    const { data: booking, isLoading, isError, error } = useQuery({
        queryKey: ['bookingDetails', bookingId],
        queryFn: () => fetchBookingDetails(bookingId, session),
        enabled: isOpen && !!bookingId && !!session,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const updateStatusMutation = useMutation({
        mutationFn: updateBookingStatus,
        onSuccess: () => {
            queryClient.invalidateQueries(['bookingDetails', bookingId]);
            queryClient.invalidateQueries(['myVehicleBookings']);
            queryClient.invalidateQueries(['profile']);
            onClose();
        },
        onError: (err) => {
            console.error("Failed to update booking status:", err.message);
            alert(`Error: ${err.message}`);
        },
    });

    const cancelBookingMutation = useMutation({
        mutationFn: cancelBooking,
        onSuccess: (data) => {
            queryClient.invalidateQueries(['bookingDetails', bookingId]);
            queryClient.invalidateQueries(['profile']);
            queryClient.invalidateQueries(['bookings']);
            onClose();
            alert(data.message || "Booking cancelled successfully.");
        },
        onError: (err) => {
            console.error("Failed to cancel booking:", err.message);
            alert(`Error: ${err.message}`);
        }
    });

    const handleStatusUpdate = (status, requestRefund = true) => {
        if (status === 'cancelled') {
            // Logic to check date for refund prompt
            const now = new Date();
            const start = new Date(booking.start_date);
            // "Before or on the day of pickup" logic
            // Strict check: Is now <= start date?
            // Since start_date from DB might be just date or simplified ISO, let's treat it carefully.
            // If today is 9th and pickup is 10th -> Before.
            // If today is 9th and pickup is 9th -> On.
            // So if now <= start (checking date parts or full timestamp), ask.
            // Backend logic was: now <= startTime -> Full Refund.

            // If we are already in the "Refund Prompt" step (passed via argument? No, controlled by state)
            // We need to intercept the initial "Cancel" call.

            // Wait, this function is called by the "Yes" button in "Are you sure?".
            // Or we can modify the flow.
            cancelBookingMutation.mutate({ bookingId, session, requestRefund });
        } else {
            updateStatusMutation.mutate({ bookingId, status, session });
        }
    };

    const handleInitialCancelClick = () => {
        // Step 1: User Confirmed "Are you sure?"
        // Step 2: Check logic
        // Check logic
        const now = new Date();
        now.setHours(0, 0, 0, 0); // Normalize to midnight

        const start = new Date(booking.start_date);
        start.setHours(0, 0, 0, 0); // Normalize to midnight

        // Check if eligible for choice (Before/On Pickup)
        // If we are BEFORE the pickup time, we show the prompt.
        if (now <= start) {
            setShowConfirmCancel(false); // Close first modal
            setShowRefundPrompt(true);   // Open refund prompt
        } else {
            // After pickup -> Proceed directly (50% refund logic on backend, no prompt)
            handleStatusUpdate('cancelled', true);
            setShowConfirmCancel(false);
        }
    };

    if (!isOpen) return null;

    const vehicle = booking?.vehicles;
    const guest = booking?.profiles;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-background shadow-2xl rounded-2xl border border-border flex flex-col">
                <div className="sticky top-0 bg-background/95 backdrop-blur z-10 p-4 border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-bold text-foreground">Booking Details</h2>
                    <button
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground hover:bg-secondary p-2 rounded-full transition-colors"
                    >
                        <FaTimes size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <FaClock className="animate-spin text-3xl mb-4 text-primary" />
                            <p>Loading booking details...</p>
                        </div>
                    )}

                    {isError && (
                        <div className="text-center py-12 text-destructive bg-destructive/5 rounded-xl border border-destructive/20">
                            <FaTimesCircle className="text-4xl mx-auto mb-4" />
                            <p>Error: {error?.message || 'Failed to load booking details.'}</p>
                        </div>
                    )}

                    {booking && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Vehicle Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2">
                                    <FaCar /> Vehicle Information
                                </h3>
                                <div className="group relative w-full h-48 bg-secondary rounded-xl overflow-hidden border border-border shadow-sm">
                                    <img src={vehicle?.image_urls?.[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Vehicle" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                        <div className="text-white">
                                            <p className="font-bold text-lg leading-none">{vehicle?.make} {vehicle?.model}</p>
                                            <p className="text-xs opacity-80 mt-1">{vehicle?.year} Edition</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-secondary/30 p-2.5 rounded-lg border border-border/50 flex items-center gap-3">
                                        <FaGasPump className="text-primary text-lg" />
                                        <div>
                                            <p className="text-[10px] uppercase text-muted-foreground font-bold">Fuel</p>
                                            <p className="text-sm font-semibold">{vehicle?.fuel_type}</p>
                                        </div>
                                    </div>
                                    <div className="bg-secondary/30 p-2.5 rounded-lg border border-border/50 flex items-center gap-3">
                                        <FaCogs className="text-primary text-lg" />
                                        <div>
                                            <p className="text-[10px] uppercase text-muted-foreground font-bold">Trans</p>
                                            <p className="text-sm font-semibold">{vehicle?.transmission}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Booking & Guest Info */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2 mb-4">
                                        <FaInfoCircle /> Booking Overview
                                    </h3>
                                    <Card className="bg-secondary/10 border-border/60 p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-muted-foreground">Status</p>
                                            <StatusBadge status={booking.status} />
                                        </div>
                                        {/* Removed Booking ID display as requested */}
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-muted-foreground">Total Price</p>
                                            <p className="font-mono-numbers font-bold text-lg text-primary">₹{booking.total_price?.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                            <p className="text-sm font-medium text-muted-foreground">Duration</p>
                                            <div className="text-right">
                                                <p className="text-sm font-bold flex items-center gap-1 justify-end"><FaCalendarAlt className="text-xs text-muted-foreground" /> {new Date(booking.start_date).toLocaleDateString()}</p>
                                                <p className="text-xs text-muted-foreground">to {new Date(booking.end_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </Card>

                                    {/* Invoice Download */}
                                    {(booking.status === 'confirmed' || booking.status === 'completed' || booking.status === 'cancelled') ? (
                                        <div className="mt-4 pt-4 border-t border-border border-dashed">
                                            <Button variant="outline" size="sm" onClick={() => window.open(`/invoice/${booking.id}`, '_blank')} className="w-full gap-2">
                                                <FaMoneyBillWave /> Download Invoice
                                            </Button>
                                        </div>
                                    ) : null}
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 border-b border-border pb-2 mb-4">
                                        <FaUserCircle /> Guest Information
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl uppercase">
                                            {guest?.full_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{guest?.full_name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Refund Status Section */}
                    {booking && booking.status === 'cancelled' && booking.payments?.[0]?.refund_amount > 0 && (
                        <div className="mb-4 p-6 bg-secondary/30 rounded-xl border border-border">
                            <h3 className="font-bold flex items-center gap-2 mb-6 text-sm uppercase tracking-wider text-muted-foreground"><FaMoneyBillWave className="text-emerald-500" /> Refund Status</h3>
                            <div className="relative flex justify-between items-center w-full px-4">
                                <div className="absolute top-2 left-0 right-0 h-0.5 bg-border -z-10 mx-6"></div>
                                {["Initiated", "Processed", "Completed"].map((step, index) => {
                                    const refundStatus = booking.payments?.[0]?.refund_status?.toLowerCase();
                                    const stepIndex = ["initiated", "processed", "completed"].indexOf(refundStatus) ?? -1;
                                    const isActive = index <= stepIndex;
                                    return (
                                        <div key={step} className="flex flex-col items-center bg-background px-2 z-10">
                                            <div className={`w-4 h-4 rounded-full mb-2 border-2 ${isActive ? 'bg-emerald-500 border-emerald-500' : 'bg-background border-muted'}`}></div>
                                            <span className={`text-[10px] font-bold uppercase ${isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>{step}</span>
                                        </div>
                                    )
                                })}
                            </div>
                            {booking.payments?.[0]?.refund_amount && (
                                <div className="text-center mt-6 space-y-3">
                                    <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded text-xs font-bold border border-emerald-500/20">
                                        Refund Amount: ₹{booking.payments[0].refund_amount}
                                    </span>

                                    {/* Dev Tool for Localhost Testing */}
                                    {booking.payments?.[0]?.refund_status === 'initiated' && (
                                        <div className="pt-2 border-t border-dashed border-border/50">
                                            <p className="text-[10px] text-muted-foreground mb-2">Dev Console: Simulate Bank</p>
                                            <div className="flex justify-center gap-2">
                                                <Button
                                                    variant="outline" size="sm" className="h-6 text-[10px]"
                                                    onClick={async () => {
                                                        const paymentId = booking.payments[0].razorpay_payment_id;
                                                        const refundId = booking.payments[0].refund_id;
                                                        if (!paymentId || !refundId) return alert("Missing Payment/Refund IDs");

                                                        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/webhooks/razorpay`, {
                                                            method: 'POST',
                                                            headers: {
                                                                'Content-Type': 'application/json',
                                                                'x-razorpay-signature': 'simulated_dev_signature' // Backend needs to bypass sig check for this specific string or we mock it differently. 
                                                                // Actually, we can't easily bypass signature verification securely on backend without changing backend code.
                                                                // Alternative: Create a specific /api/test/simulate-refund endpoint.
                                                            },
                                                            body: JSON.stringify({
                                                                event: "refund.processed",
                                                                payload: { refund: { entity: { id: refundId, payment_id: paymentId, status: "processed", amount: booking.payments[0].refund_amount * 100 } } }
                                                            })
                                                        });
                                                        queryClient.invalidateQueries(['bookingDetails', bookingId]);
                                                    }}
                                                >
                                                    Simulate Processing
                                                </Button>
                                                <Button
                                                    variant="outline" size="sm" className="h-6 text-[10px]"
                                                    onClick={async () => {
                                                        const paymentId = booking.payments[0].razorpay_payment_id;
                                                        const refundId = booking.payments[0].refund_id;
                                                        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/webhooks/razorpay-simulate`, { // Using specific simul endpoint
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ refundId, paymentId, status: "completed" })
                                                        });
                                                        queryClient.invalidateQueries(['bookingDetails', bookingId]);
                                                    }}
                                                >
                                                    Simulate Completion
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {booking && (
                    <div className="p-4 border-t border-border bg-secondary/10 flex flex-col sm:flex-row justify-end gap-3 sticky bottom-0 rounded-b-2xl backdrop-blur-md">
                        {/* Actions for Pending Requests only */}
                        {booking.status === 'pending' && (
                            <>
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowConfirmReject(true)}
                                    disabled={updateStatusMutation.isLoading}
                                    className="w-full sm:w-auto"
                                >
                                    {updateStatusMutation.isLoading ? 'Rejecting...' : 'Reject Request'}
                                </Button>
                                <Button
                                    variant="success"
                                    onClick={() => handleStatusUpdate('confirmed')}
                                    disabled={updateStatusMutation.isLoading}
                                    className="w-full sm:w-auto shadow-lg shadow-emerald-500/20"
                                >
                                    {updateStatusMutation.isLoading ? 'Confirming...' : 'Confirm Request'}
                                </Button>
                            </>
                        )}

                        {booking.status === 'confirmed' && (
                            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full">
                                <div className="text-center sm:text-right flex-grow mr-4">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Booking is <span className="font-bold text-success uppercase">Confirmed</span>.
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowConfirmCancel(true)}
                                    disabled={cancelBookingMutation.isLoading}
                                    className="w-full sm:w-auto"
                                >
                                    {cancelBookingMutation.isLoading ? 'Cancelling...' : 'Cancel Booking'}
                                </Button>
                            </div>
                        )}

                        {(booking.status === 'cancelled' || booking.status === 'rejected' || booking.status === 'completed') && (
                            <div className="w-full text-center sm:text-right">
                                <p className="text-sm font-medium text-muted-foreground">
                                    This booking is <span className="font-bold text-foreground lowercase">{booking.status}</span>.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Confirmation Modals (Nested) */}
                {(showConfirmCancel || showConfirmReject || showConfirmComplete) && (
                    <div className="absolute inset-0 z-[110] bg-background/95 backdrop-blur flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
                        <Card className="w-full max-w-sm p-6 text-center shadow-2xl border-primary/20 bg-background">
                            <h4 className="text-xl font-bold mb-3 text-foreground">Are you sure?</h4>
                            <p className="text-muted-foreground mb-6 leading-relaxed">
                                {showConfirmCancel && "Do you really want to cancel this booking? This action is irreversible."}
                                {showConfirmReject && "Do you really want to reject this request? The guest will be notified immediately."}
                                {showConfirmComplete && "Is this trip finished? Marking as committed releases payments."}
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" onClick={() => { setShowConfirmCancel(false); setShowConfirmReject(false); setShowConfirmComplete(false); }}>
                                    Back
                                </Button>

                                {showConfirmCancel && (
                                    <Button variant="destructive" onClick={handleInitialCancelClick} disabled={cancelBookingMutation.isLoading}>
                                        Yes, Cancel
                                    </Button>
                                )}
                                {showConfirmReject && (
                                    <Button variant="destructive" onClick={() => handleStatusUpdate('rejected')} disabled={updateStatusMutation.isLoading}>
                                        {updateStatusMutation.isLoading ? 'Processing...' : 'Yes, Reject'}
                                    </Button>
                                )}
                                {showConfirmComplete && (
                                    <Button variant="primary" onClick={() => handleStatusUpdate('completed')} disabled={updateStatusMutation.isLoading}>
                                        {updateStatusMutation.isLoading ? 'Processing...' : 'Yes, Complete'}
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {/* Refund Prompt Modal */}
            {showRefundPrompt && (
                <div className="absolute inset-0 z-[120] bg-background/95 backdrop-blur flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
                    <Card className="w-full max-w-sm p-6 text-center shadow-2xl border-emerald-500/20 bg-background text-foreground">
                        <div className="mb-4 text-emerald-500 mx-auto w-12 h-12 flex items-center justify-center bg-emerald-500/10 rounded-full">
                            <FaMoneyBillWave size={24} />
                        </div>
                        <h4 className="text-xl font-bold mb-3">Do you need a refund?</h4>
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                            You are cancelling before the pickup time. You are eligible for a refund.
                        </p>
                        <div className="flex flex-col gap-3">
                            <Button variant="success" onClick={() => handleStatusUpdate('cancelled', true)} disabled={cancelBookingMutation.isLoading} className="w-full">
                                {cancelBookingMutation.isLoading ? 'Processing...' : 'Yes, Process Refund'}
                            </Button>
                            <Button variant="outline" onClick={() => handleStatusUpdate('cancelled', false)} disabled={cancelBookingMutation.isLoading} className="w-full">
                                No, Cancel without Refund
                            </Button>
                            <Button variant="ghost" onClick={() => setShowRefundPrompt(false)} disabled={cancelBookingMutation.isLoading} className="w-full text-muted-foreground">
                                Go Back
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default BookingDetailsModal;
