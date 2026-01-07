// src/pages/BookingDetails.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FaCheckCircle, FaClock, FaPrint, FaArrowLeft, FaReceipt, FaMoneyBillWave } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';

export default function BookingDetail() {
  const params = useParams();
  const id = params.id || params.bookingId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCancelled, setIsCancelled] = useState(false);

  // Fetch Logic
  const fetchBookingById = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/booking/${id}`);
    if (!res.ok) throw new Error("Booking not found");
    return res.json();
  };

  const { data: booking, isLoading, isError, error } = useQuery({
    queryKey: ["booking", id],
    queryFn: fetchBookingById,
    enabled: !!id,
    refetchInterval: (data) =>
      data?.payments?.[0]?.refund_status !== "completed" && isCancelled ? 10000 : false,
  });

  // Actions
  const handleCancelBooking = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${id}/cancel`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    alert(data.message);
    setIsCancelled(true);
    await queryClient.invalidateQueries(["booking", id]);
  };

  if (isLoading) return <div className="min-h-screen pt-32 text-center font-mono animate-pulse text-muted-foreground">LOADING RECEIPT...</div>;
  if (isError) return <div className="min-h-screen pt-32 text-center text-destructive">UNABLE TO RETRIEVE RECORD.</div>;
  if (!booking) return <div className="min-h-screen pt-32 text-center">Reference ID invalid.</div>;

  const refund = booking.payments?.[0] || {};
  const steps = ["Initiated", "Processed", "Completed"];
  // Simple refund logic index finding
  const stepIndex = ["initiated", "processed", "completed"].indexOf(refund.refund_status?.toLowerCase()) ?? -1;

  const StatusBadge = ({ status }) => {
    let variant = 'neutral';
    if (status === 'confirmed') variant = 'success';
    if (status === 'cancelled') variant = 'destructive';
    return <Badge variant={variant} className="uppercase tracking-widest">{status}</Badge>;
  };

  return (
    <div className="bg-background min-h-screen pt-24 pb-20 font-sans flex justify-center items-start">
      <Card className="w-full max-w-2xl bg-card border-none md:border md:border-border shadow-2xl relative overflow-hidden">

        {/* Decorative Top Border similar to a real receipt */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        <div className="p-8 md:p-12">

          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                <FaArrowLeft className="mr-2" /> Back
              </Button>
              <h1 className="text-3xl font-bold text-foreground">Booking Receipt</h1>
              <p className="text-sm text-muted-foreground font-mono mt-1 uppercase">ID: #{id}</p>
            </div>
            <div className="text-right">
              <StatusBadge status={booking.status} />
              <p className="text-xs text-muted-foreground mt-2">{new Date(booking.created_at).toLocaleString()}</p>
            </div>
          </div>

          {/* Main Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 border-b border-border pb-12 border-dashed">
            <div>
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Vehicle Details</h3>
              <div className="text-lg font-bold text-foreground">{booking.vehicles?.make} {booking.vehicles?.model}</div>
              <div className="text-sm text-muted-foreground">{booking.vehicles?.vehicle_type}</div>
              <div className="mt-4 text-sm">
                <span className="block text-muted-foreground">Pick-up</span>
                <span className="font-semibold text-foreground">{new Date(booking.start_date).toLocaleDateString()}</span>
              </div>
              <div className="mt-2 text-sm">
                <span className="block text-muted-foreground">Drop-off</span>
                <span className="font-semibold text-foreground">{new Date(booking.end_date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="md:text-right">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between md:justify-end gap-8">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="font-mono font-bold text-foreground">₹{booking.total_price}</span>
                </div>
                <div className="flex justify-between md:justify-end gap-8">
                  <span className="text-muted-foreground">Invoice No</span>
                  <span className="font-mono text-foreground">{booking.invoice_no || 'Processing...'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Section */}
          {booking.status === "cancelled" && (
            <div className="mb-12 p-6 bg-secondary/30 rounded-xl border border-border">
              <h3 className="font-bold flex items-center gap-2 mb-6"><FaMoneyBillWave className="text-emerald-500" /> Refund Status</h3>
              <div className="relative flex justify-between items-center w-full px-4">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -z-10 mx-6"></div>

                {steps.map((step, index) => {
                  const isActive = index <= stepIndex;
                  return (
                    <div key={step} className="flex flex-col items-center bg-background px-2 z-10">
                      <div className={`w-3 h-3 rounded-full mb-2 ${isActive ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-secondary-foreground/20'}`}></div>
                      <span className={`text-xs font-bold uppercase ${isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>{step}</span>
                    </div>
                  )
                })}
              </div>
              {refund.refund_amount && (
                <div className="text-center mt-6 p-2 bg-emerald-500/10 text-emerald-600 rounded text-sm font-bold">
                  Refund Amount: ₹{refund.refund_amount}
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex flex-col md:flex-row gap-4 justify-end">
            {booking.invoice_no && (
              <Button variant="outline" onClick={() => window.open(`${import.meta.env.VITE_API_BASE_URL}/api/invoice/${booking.id}`, '_blank')} className="gap-2">
                <FaReceipt /> Download Invoice
              </Button>
            )}
            {booking.status === "confirmed" && (
              <Button variant="destructive" onClick={handleCancelBooking}>
                Cancel Booking
              </Button>
            )}
          </div>

        </div>
      </Card>
    </div>
  );
}
