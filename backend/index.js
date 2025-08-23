// File: backend/index.js - CONNECTED TO SUPABASE

import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config'; // Loads the .env file
import jwt from 'jsonwebtoken';

// --- Basic Setup ---
const app = express();
app.use(cors());
app.use(express.json());

// --- Supabase Connection ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in your .env file!");
}

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (token == null) return res.sendStatus(401); // if there isn't any token

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // if token is no longer valid
    req.user = user; // Add the decoded user payload to the request object
    next(); // Proceed to the next step
  });
};

// --- API Endpoints ---

// ======== AUTHENTICATION ENDPOINTS ========

// User Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, full_name } = req.body; // 'role' is no longer read from the body

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          role: 'tourist', // Always sign up new users as a tourist
        }
      }
    });

    if (error) throw error;

    res.status(201).json({ message: 'User created successfully as a tourist.', user: data.user });

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

// Upgrade a user's role from 'tourist' to 'host'
app.put('/api/users/me/upgrade-to-host', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;

    // 1. Update the user's role in the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'host' })
      .eq('id', userId)
      .select()
      .single();

    if (profileError) throw profileError;
    if (!profileData) return res.status(404).json({ error: 'User not found.' });
    
    // 2. ALSO update the user's metadata in the main Auth system
    const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: { role: 'host' } }
    )

    if(authError) throw authError;

    res.status(200).json({ message: 'User successfully upgraded to host.', profile: profileData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Downgrade a user's role from 'host' to 'tourist'
app.put('/api/users/me/downgrade-to-tourist', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;

    // Step 1: Deactivate all of the host's active vehicle listings
    await supabase
      .from('vehicles')
      .update({ status: 'archived' })
      .eq('host_id', userId)
      .in('status', ['pending', 'approved']);
    
    // Step 2: Update the user's role in the profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'tourist' })
      .eq('id', userId)
      .select()
      .single();

    if (profileError) throw profileError;

    // Step 3: Update the user's metadata in the main Auth system
    await supabase.auth.admin.updateUserById(
        userId,
        { user_metadata: { role: 'tourist' } }
    );

    res.status(200).json({ message: 'User successfully downgraded to tourist.', profile: profileData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ======== VEHICLE ENDPOINTS ========

// GET all vehicles from the live database
app.get('/api/vehicles', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*');

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET a single vehicle by its ID from the live database
app.get('/api/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('vehicles')
      .select(`
          *,
          reviews ( * )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE a new vehicle (Protected, for hosts only)
app.post('/api/vehicles', authenticateToken, async (req, res) => {
  try {
    // This log shows us the token content
    console.log('User from token:', req.user);

    // 1. Check if the user is a host
    if (req.user.user_metadata.role !== 'host') {
      return res.status(403).json({ error: 'Only hosts can create vehicles.' });
    }

    // 2. Prepare the data for insertion
    const vehicleToInsert = {
      host_id: req.user.sub, // Get the user ID from the token's 'sub' field
      ...req.body // Add all the other details from the request body
    };

    // THIS IS THE NEW DEBUG LINE
    console.log('--- Data being sent to Supabase: ---', vehicleToInsert);

    // 3. Insert the new vehicle into the database
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
      .eq('host_id', req.user.sub) // Security: Ensures only the owner can update
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
        .eq('host_id', req.user.sub) // Security: Ensures only the owner can delete
        .select()
        .single();
  
      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Vehicle not found or you do not have permission to delete it.' });
  
      res.status(204).send(); // 204 No Content for successful delete
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// ======== BOOKING ENDPOINTS (Protected) ========

// CREATE a new booking
app.post('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const { vehicle_id, start_date, end_date, total_price } = req.body;
    if (!vehicle_id || !start_date || !end_date || !total_price) {
      return res.status(400).json({ error: 'Missing required booking information.' });
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        user_id: req.user.sub, // Get user ID from the token
        vehicle_id,
        start_date,
        end_date,
        total_price,
        status: 'confirmed' // Default to confirmed for now
      }])
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
          vehicles ( make, model, image_urls )
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
    // 1. Security: Check if the user is an admin
    if (req.user.user_metadata.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    // 2. Fetch pending vehicles from the database
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
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

// ======== HOST ENDPOINTS (Protected) ========

// backend/index.js

// GET all vehicles for the currently logged-in host
app.get('/api/hosts/my-vehicles', authenticateToken, async (req, res) => {
    try {
      if (req.user.user_metadata.role !== 'host') {
        return res.status(403).json({ error: 'Access denied. Host role required.' });
      }
  
      // --- THIS LINE IS THE FIX ---
      // It was 'of await', now it is '= await'
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

// GET all bookings made on a host's vehicles
app.get('/api/hosts/my-bookings', authenticateToken, async (req, res) => {
    try {
        if (req.user.user_metadata.role !== 'host') {
            return res.status(403).json({ error: 'Access denied. Host role required.' });
        }
        const hostId = req.user.sub;

        // NEW: Call the database function we just created
        const { data, error } = await supabase
            .rpc('get_bookings_for_host', { host_id_input: hostId });

        if (error) throw error;

        // The data is already flat, but we need to format it to match what the frontend expects
        const formattedData = data.map(item => ({
            ...item,
            vehicles: {
                make: item.vehicle_make,
                model: item.vehicle_model
            },
            profiles: {
                full_name: item.tourist_name,
                email: item.tourist_email
            }
        }));

        res.status(200).json(formattedData);

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