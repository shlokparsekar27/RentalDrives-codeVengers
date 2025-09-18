// src/api/bookings.js
import { supabase } from '../supabaseClient';

// MODIFIED: Function now accepts and sends dropoff_location
export const createBooking = async ({ vehicle, user, startDate, endDate, totalPrice, dropoffLocation }) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not logged in");

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      vehicle_id: vehicle.id,
      start_date: startDate,
      end_date: endDate,
      total_price: totalPrice,
      dropoff_location: dropoffLocation, // ADDED
    }),
  });

  if (!response.ok) throw new Error("Failed to create booking");
  return response.json(); // { booking, order }
};

// --- Razorpay Script Loader ---
const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// --- Razorpay Checkout ---
export const openRazorpayCheckout = async ({ data, vehicle, user, navigate }) => {
  const res = await loadRazorpay();
  if (!res) {
    alert('Razorpay SDK failed to load. Are you online?');
    return;
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: data.booking.total_price * 100,
    currency: data.order.currency || "INR",
    name: `${vehicle.make} ${vehicle.model}`,
    description: 'Vehicle Booking Payment',
    order_id: data.order.id,
    handler: async function (response) {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: data.booking.id,
          ...response,
        }),
      });
      alert('✅ Payment successful! Booking confirmed.');
      navigate('/profile');
    },
    prefill: {
      name: user?.user_metadata?.full_name || user?.email || 'Guest',
      email: user?.email || '',
      contact: user?.phone || '',
    },
    theme: { color: '#2563EB' },
  };

  const paymentObject = new window.Razorpay(options);

  // Payment failure handler
  paymentObject.on("payment.failed", async function (response) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/payments/fail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: data.booking.id,
          razorpay_order_id: response.error.metadata.order_id,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Failed to update backend:", err);
        alert("Error updating failed payment.");
        return;
      }

      alert("❌ Payment failed! Booking cancelled.");
      navigate("/profile");
    } catch (err) {
      console.error("❌ Network error updating failure:", err);
      alert("Could not update failure status.");
    }
  });

  paymentObject.open();
};