// src/api/bookings.js
import { supabase } from '../supabaseClient';

// MODIFIED: Function now accepts and sends dropoff_location
export const createBooking = async ({ vehicle, user, startDate, endDate, totalPrice, dropoffLocation }) => {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings`, {
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

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create booking');
  }

  return response.json();
};