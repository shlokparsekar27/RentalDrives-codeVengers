// File: backend/index.js - FINAL VERSION WITH BOOKING VALIDATION

import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import jwt from 'jsonwebtoken';

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in your .env file!");
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- API Endpoints ---

// ======== AUTHENTICATION ENDPOINTS ========

// User Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    // UPDATED: Now reads the 'role' from the request body
    const { email, password, full_name, role } = req.body; 

    // A small security check to ensure the role is valid
    const userRole = (role === 'host' || role === 'tourist') ? role : 'tourist';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role: userRole, // UPDATED: Uses the role sent from the frontend
        }
      }
    });

    if (error) throw error;

    res.status(201).json({ message: `User created successfully as a ${userRole}.`, user: data.user });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Step 1: Authenticate the user with Supabase Auth
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (loginError) throw loginError;

        // Step 2: Fetch the user's profile to get our custom role
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', loginData.user.id)
            .single();

        if (profileError) throw profileError;

        // Step 3: Combine the session (with token) and the profile data for the response
        const response = {
            session: loginData.session,
            profile: profileData
        };

        res.status(200).json(response);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET the profile of the currently logged-in user
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Profile not found.' });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATED: Can now update full_name and/or the address
app.put('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { full_name, address } = req.body; 

    const updates = {};
    if (full_name) {
      updates.full_name = full_name;
    }
    if (address) {
      updates.address = address;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No update data provided.' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Profile not found.' });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ======== VEHICLE ENDPOINTS ========

// GET all vehicles from the live database - UPDATED
app.get('/api/vehicles', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      // FIXED: Join with profiles table to get the host's full_name
      .select(`*, profiles ( full_name )`);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET a single vehicle by its ID from the live database - UPDATED
app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('vehicles')
      // FIXED: Join with profiles for host name AND for reviewer names
      .select(`
          *,
          profiles ( full_name ),
          reviews ( *, profiles ( full_name ) )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NEW: Endpoint to get booked dates for a vehicle
app.get('/api/vehicles/:id/booked-dates', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('bookings')
      .select('start_date, end_date')
      .eq('vehicle_id', id)
      .eq('status', 'confirmed');

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE a new vehicle (Protected, for hosts only)
app.post('/api/vehicles', authenticateToken, async (req, res) => {
  try {
    if (req.user.user_metadata.role !== 'host') {
      return res.status(403).json({ error: 'Only hosts can create vehicles.' });
    }
    const vehicleToInsert = {
      host_id: req.user.sub,
      ...req.body
    };
    const { data, error } = await supabase
      .from('vehicles')
      .insert([vehicleToInsert])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE a vehicle (Protected, for owner only)
app.put('/api/vehicles/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .eq('host_id', req.user.sub)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Vehicle not found or you do not have permission to update it.' });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a vehicle (Protected, for owner only)
app.delete('/api/vehicles/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id)
        .eq('host_id', req.user.sub)
        .select()
        .single();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Vehicle not found or you do not have permission to delete it.' });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // NEW: GET a user's public profile by their ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, role, is_verified') // Only select public, safe data
      .eq('id', id)
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NEW: GET all approved vehicles for a specific host
app.get('/api/hosts/:id/vehicles', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('host_id', id)
      .eq('status', 'approved');

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ======== BOOKING ENDPOINTS (Protected) ========

// backend/index.js

// backend/index.js

// CREATE a new booking - UPDATED WITH DROPOFF LOCATION
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    // ADDED: dropoff_location to the destructuring
    const { vehicle_id, start_date, end_date, total_price, dropoff_location } = req.body;
    if (!vehicle_id || !start_date || !end_date || !total_price) {
      return res.status(400).json({ error: 'Missing required booking information.' });
    }

    // --- Overlap check remains the same ---
    const { data: overlappingBookings, error: overlapError } = await supabase
      .from('bookings')
      .select('id')
      .eq('vehicle_id', vehicle_id)
      .eq('status', 'confirmed')
      .lte('start_date', end_date)
      .gte('end_date', start_date);

    if (overlapError) throw overlapError;

    if (overlappingBookings && overlappingBookings.length > 0) {
      return res.status(409).json({ error: 'This vehicle is already booked for the selected dates. Please choose a different date range.' });
    }

    // --- End of check ---

    // ADDED: dropoff_location to the insert object
    const bookingData = {
        user_id: req.user.sub,
        vehicle_id,
        start_date,
        end_date,
        total_price,
        status: 'confirmed',
        dropoff_location: dropoff_location || null // Save location or null if not provided
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ all of the current user's bookings
app.get('/api/bookings/my-bookings', authenticateToken, async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicles ( *, reviews ( * ) )
        `)
        .eq('user_id', req.user.sub);
  
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// UPDATE a booking's status to 'cancelled'
app.patch('/api/bookings/:id/cancel', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('user_id', req.user.sub) // Security: Ensures only the owner can cancel
        .select()
        .single();
  
      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Booking not found or you do not have permission to cancel it.' });

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// ======== ADMIN ENDPOINTS (Protected) ========

// GET a list of all users
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    // 1. Security: Check if the user is an admin
    if (req.user.user_metadata.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    // 2. Fetch all profiles from the database
    const { data, error } = await supabase
      .from('profiles')
      .select('*');

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all vehicles pending approval
app.get('/api/admin/vehicles/pending', authenticateToken, async (req, res) => {
  try {
    if (req.user.user_metadata.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    // This query now joins with the profiles table to get the host's name
    const { data, error } = await supabase
      .from('vehicles')
      .select(`*, profiles ( full_name )`) 
      .eq('status', 'pending');

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all vehicles that are approved
app.get('/api/admin/vehicles/approved', authenticateToken, async (req, res) => {
  try {
    // 1. Security: Check if the user is an admin
    if (req.user.user_metadata.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    // 2. Fetch approved vehicles from the database
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('status', 'approved');

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all vehicles that are rejected
app.get('/api/admin/vehicles/rejected', authenticateToken, async (req, res) => {
  try {
    // 1. Security: Check if the user is an admin
    if (req.user.user_metadata.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    // 2. Fetch rejected vehicles from the database
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('status', 'rejected');

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve or Reject a vehicle
app.patch('/api/admin/vehicles/:id/status', authenticateToken, async (req, res) => {
  try {
    // 1. Security: Check if the user is an admin
    if (req.user.user_metadata.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { id } = req.params;
    const { status } = req.body;

    // 2. Validate the new status
    if (status !== 'approved' && status !== 'rejected') {
      return res.status(400).json({ error: "Invalid status. Must be 'approved' or 'rejected'." });
    }

    // 3. Update the vehicle's status in the database
    const { data, error } = await supabase
      .from('vehicles')
      .update({ status: status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Vehicle not found.' });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET a list of all bookings
app.get('/api/admin/bookings', authenticateToken, async (req, res) => {
  try {
    // 1. Security: Check if the user is an admin
    if (req.user.user_metadata.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    // 2. Fetch all bookings with user and vehicle details
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles ( full_name ),
        vehicles ( make, model, license_plate )
      `);

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE any review (for moderation)
app.delete('/api/admin/reviews/:id', authenticateToken, async (req, res) => {
  try {
    // 1. Security: Check if the user is an admin
    if (req.user.user_metadata.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { id } = req.params;

    // 2. Delete the specified review from the database
    const { data, error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Review not found.' });

    res.status(204).send(); // Success, no content to return
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ... at the end of the ADMIN ENDPOINTS section in backend/index.js

// NEW: GET all hosts that have submitted a document but are not yet verified
app.get('/api/admin/hosts/pending', authenticateToken, async (req, res) => {
  try {
    if (req.user.user_metadata.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'host')
      .eq('is_verified', false)
      .not('business_document_url', 'is', null); // Only get hosts who have uploaded something

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NEW: UPDATE a host's profile to set is_verified to true
app.patch('/api/admin/hosts/:id/verify', authenticateToken, async (req, res) => {
  try {
    if (req.user.user_metadata.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { id } = req.params;
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Host not found.' });
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ... at the end of the ADMIN ENDPOINTS section

// NEW: Generate a temporary, secure URL for an admin to view a private document
app.get('/api/admin/hosts/:hostId/document-url', authenticateToken, async (req, res) => {
  try {
    if (req.user.user_metadata.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { hostId } = req.params;

    // First, get the file path from the host's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('business_document_url')
      .eq('id', hostId)
      .single();

    if (profileError || !profile || !profile.business_document_url) {
      return res.status(404).json({ error: 'Document URL not found for this host.' });
    }

    // Extract the file path from the full URL
    const filePath = new URL(profile.business_document_url).pathname.split('/host-documents/')[1];

    // Create a signed URL that is valid for 5 minutes (300 seconds)
    const { data, error: urlError } = await supabase.storage
      .from('host-documents')
      .createSignedUrl(filePath, 300);

    if (urlError) throw urlError;

    res.status(200).json({ signedUrl: data.signedUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ======== HOST ENDPOINTS (Protected) ========

// backend/index.js

// GET all vehicles for the currently logged-in host
app.get('/api/hosts/my-vehicles', authenticateToken, async (req, res) => {
    try {
      if (req.user.user_metadata.role !== 'host') {
        return res.status(403).json({ error: 'Access denied. Host role required.' });
      }
  
      // Corrected line:
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('host_id', req.user.sub);
  
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// backend/index.js

// GET all bookings made on a host's vehicles
app.get('/api/hosts/my-bookings', authenticateToken, async (req, res) => {
    try {
        if (req.user.user_metadata.role !== 'host') {
            return res.status(403).json({ error: 'Access denied. Host role required.' });
        }
        const hostId = req.user.sub;

        // Step 1: Find all vehicles that belong to the current host
        const { data: hostVehicles, error: vehiclesError } = await supabase
            .from('vehicles')
            .select('id')
            .eq('host_id', hostId);

        if (vehiclesError) throw vehiclesError;

        if (!hostVehicles || hostVehicles.length === 0) {
            return res.status(200).json([]);
        }

        const vehicleIds = hostVehicles.map(v => v.id);

        // Step 2: Find all bookings that match the host's vehicle IDs
        const { data: bookings, error: bookingsError } = await supabase
            .from('bookings')
            .select(`
                *,
                vehicles ( make, model ),
                profiles ( full_name )
            `)
            .in('vehicle_id', vehicleIds);

        if (bookingsError) throw bookingsError;

        res.status(200).json(bookings);

    } catch (error) {
        console.error('Error fetching host bookings:', error);
        res.status(500).json({ error: error.message });
    }
});

// ======== REVIEW ENDPOINTS (Protected) ========

// CREATE a new review
app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { booking_id, vehicle_id, rating, comment } = req.body;
    if (!booking_id || !rating || !vehicle_id) {
      return res.status(400).json({ error: 'Booking ID, vehicle ID, and rating are required.' });
    }

    // In a real app, you would add logic here to verify that the user
    // actually completed this booking before allowing a review.
    // For now, we'll keep it simple.

    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        user_id: req.user.sub,
        booking_id,
        vehicle_id,
        rating,
        comment
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE a review
app.put('/api/reviews/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const { data, error } = await supabase
        .from('reviews')
        .update({ rating, comment })
        .eq('id', id)
        .eq('user_id', req.user.sub) // Security: Ensures only the owner can update
        .select()
        .single();
  
      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Review not found or you do not have permission to edit it.' });

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// DELETE a review
app.delete('/api/reviews/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id)
            .eq('user_id', req.user.sub) // Security: Ensures only the owner can delete
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Review not found or you do not have permission to delete it.' });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Server Start ---
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});