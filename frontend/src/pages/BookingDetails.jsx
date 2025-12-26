import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function BookingDetail() {
  const params = useParams();
  const id = params.id || params.bookingId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isCancelled, setIsCancelled] = useState(false);

  // -----------------------------
  // Fetch booking from backend
  // -----------------------------
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
      data?.payments?.[0]?.refund_status !== "completed" && isCancelled ? 10000 : false, // ⏱️ Poll every 10s only after cancellation and stops polling once hits completed (alternate to supabase live subscription)
  });

  // -----------------------------
  // Cancel Booking Handler
  // -----------------------------
  const handleCancelBooking = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/${id}/cancel`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    alert(data.message);

    setIsCancelled(true); // start polling for refund updates
    await queryClient.invalidateQueries(["booking", id]);
  };

  // -----------------------------
  // UI Rendering
  // -----------------------------
  if (!id) return <p className="text-center mt-10">Invalid booking ID</p>;
  if (isLoading) return <p className="text-center mt-10">Loading booking...</p>;
  if (isError) return <p className="text-center text-red-600">Error: {error.message}</p>;
  if (!booking) return <p className="text-center mt-10">No booking found</p>;

  const refund = booking.payments?.[0] || {};
  const refundStatus = refund.refund_status || "not_requested";
  const steps = ["Initiated", "Processed", "Completed"];
  const stepIndex =
    refundStatus === "initiated"
      ? 0
      : refundStatus === "processed"
      ? 1
      : refundStatus === "completed"
      ? 2
      : -1;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline">
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-6">Booking Details</h2>

      {/* Booking Info */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Booking Info</h3>
        <p><b>Vehicle:</b> {booking.vehicles?.make || "N/A"} {booking.vehicles?.model || ""}</p>
        <p><b>Type:</b> {booking.vehicles?.type || "N/A"}</p>
        <p><b>Rental Dates:</b> {new Date(booking.start_date).toLocaleDateString()} → {new Date(booking.end_date).toLocaleDateString()}</p>
        <p><b>Dropoff Location:</b> {booking.dropoff_location}</p>
        <p><b>Booking Created:</b> {new Date(booking.created_at).toLocaleString()}</p>
        <p>
          <b>Status:</b>{" "}
          <span
            className={`px-2 py-1 rounded text-sm ${
              booking.status === "confirmed"
                ? "bg-green-200 text-green-800"
                : booking.status === "cancelled"
                ? "bg-yellow-200 text-yellow-800"
                : "bg-red-200 text-red-800"
            }`}
          >
            {booking.status}
          </span>
        </p>
      </div>

      {/* Payment Info */}
      <div className="mb-6 border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
        <p><b>Total Paid:</b> ₹{booking.total_price}</p>
        <p><b>Invoice No:</b> {booking.invoice_no}</p>
      </div>

      {/* Invoice Download */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">Invoice</h3>
        {booking.invoice_no ? (
          <a
            href={`${import.meta.env.VITE_API_BASE_URL}/api/invoice/${booking.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Download Invoice
          </a>
        ) : (
          <p className="text-gray-500">Invoice not available</p>
        )}
      </div>

      {/* Refund Stepper */}
      {booking.status === "cancelled" && (
        <div className="border-t pt-4 mt-6">
          <h3 className="text-lg font-semibold mb-2">Refund Status</h3>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              let stepTime = "";
              if (step.toLowerCase() === "initiated" && refund.refund_status === "initiated") {
                stepTime = refund.created_at ? new Date(refund.created_at).toLocaleString() : "";
              } else if (step.toLowerCase() === "processed" && refund.refund_status === "processed") {
                stepTime = refund.refunded_at ? new Date(refund.refunded_at).toLocaleString() : "";
              } else if (step.toLowerCase() === "completed" && refund.refund_status === "completed") {
                stepTime = refund.refunded_at ? new Date(refund.refunded_at).toLocaleString() : "";
              }

              const isActive = index <= stepIndex;

              return (
                <div key={step} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-white ${
                      isActive ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className={`mt-2 text-sm ${isActive ? "text-green-700" : "text-gray-400"}`}>
                    {step}
                  </span>
                  {stepTime && <span className="text-xs text-gray-500 mt-1">{stepTime}</span>}
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 ${isActive ? "bg-green-500" : "bg-gray-300"} mt-2`} />
                  )}
                </div>
              );
            })}
          </div>
          {refund.refund_amount && (
            <p className="mt-2 text-sm text-gray-600">
              Refund Amount: ₹{refund.refund_amount} ({refundStatus})
            </p>
          )}
        </div>
      )}

      {/* Cancel Booking Button */}
      {booking.status === "confirmed" && (
        <button
          onClick={handleCancelBooking}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Cancel Booking
        </button>
      )}
    </div>
  );
}
