// src/api/bookings.js
import { supabase } from '../supabaseClient';

// MODIFIED: Function now accepts booking details as arguments
export const createBooking = async ({ vehicle, user, startDate, endDate, totalPrice }) => {
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
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to create booking');
  }

  return response.json();
};