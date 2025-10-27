// File: backend/index.js - FINAL VERSION WITH BOOKING VALIDATION

import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import Razorpay from "razorpay";
import crypto from "crypto";
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";
import invoiceRoutes from "./routes/invoice.js";



const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/invoice", invoiceRoutes);


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const WHATSAPP_API_URL = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in your .env file!");
}

// ================== AUTH TOKEN MIDDLEWARE ==================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // make sure JWT_SECRET is in .env
    req.user = decoded; // attach user info to request
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

//<--------------- Function to send WhatsApp messages---------->s
async function sendWhatsAppMessage(to, message, recipientType = "user" ,filePath , bookingId) {

  console.log("\n============================");
  console.log(`📩 Preparing WhatsApp for ${recipientType.toUpperCase()}`);
  console.log(`👉 Recipient number: ${to}`);
  console.log(`👉 Message content:\n${message}`);
  console.log("============================\n");
   if (filePath) console.log(`👉 With attachment: ${filePath}`);
  
  try {
    const res = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: message },
      }),
    });

    const data = await res.json();
    // console.log(`📩 WhatsApp API response for ${recipientType}:`, data);
    if (!res.ok) {
      console.error(`❌ WhatsApp API error for ${recipientType}:`, data);
      return false;
    }
    // console.log(`✅ WhatsApp sent successfully to ${recipientType}:`, data);
    
    // 2️⃣ If invoice PDF exists, upload & send
    if (filePath) {
       console.log("📂 Uploading PDF from path:", filePath);

     const formData = new FormData();
      formData.append("file", fs.createReadStream(filePath)); // ✅ only file
      formData.append("type", "application/pdf"); // ✅ tell WhatsApp it's a document
      formData.append("messaging_product", "whatsapp");

  

      const uploadRes = await fetch(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/media`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` ,
          ...formData.getHeaders()   // ✅ required for multipart boundary
           },
          body: formData,
        }
      );

      const uploadData = await uploadRes.json();
       console.log("📂 Upload response:", JSON.stringify(uploadData, null, 2));
if (!uploadRes.ok || !uploadData.id) {
        console.error("❌ Error uploading invoice:", uploadData);
        return false;
      }
       console.log("✅ Media uploaded with ID:", uploadData.id);

       const docRes=await fetch(WHATSAPP_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "document",
          document: {
            id: uploadData.id,
            caption: "📄 Your Rental Invoice",
           filename: `invoice-${bookingId || Date.now()}.pdf`,
          },
        }),
      });
      const docData = await docRes.json();
       console.log("📤 Document send response:", JSON.stringify(docData, null, 2));
     // console.log("📤 Upload response:", uploadData);
         console.log("📩 Document message response:", docData);
      if (!docRes.ok) {
        console.error("❌ Error sending PDF:", docData);
        return false;
    }
    console.log("✅ PDF invoice sent successfully!");
  }

    console.log(`✅ WhatsApp sent successfully to ${recipientType}`);
    return true;
  } catch (err) {
    console.error(`❌ WhatsApp error for ${recipientType}:`, err);
    return false;
  }
}

async function notifyBooking(userData, hostData, vehicle, booking, invoicePath) {
  try {
    // Generate hybrid invoice number: INV-YYYY-XXXX
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${booking.id.slice(0, 4)}`; // first 4 chars of UUID as sequence

    // Extract only the date part
    const startDate = booking.start_date.split("T")[0];
    const endDate = booking.end_date.split("T")[0];

    // WhatsApp message to user
    const userMessage = `✅ Booking Confirmed!
Invoice No: ${invoiceNumber}
Vehicle: ${vehicle.make} ${vehicle.model}
From: ${startDate} To: ${endDate}
Amount: ₹${booking.total_price}`;

const hostMessage = `📢 New Booking!
 Customer: ${userData.full_name} 
 Vehicle: ${vehicle.make} ${vehicle.model} 
 From: ${startDate} To: ${endDate};`;

    // Check if invoice exists
    if (!fs.existsSync(invoicePath)) {
      console.error("❌ Invoice PDF not found at:", invoicePath);
      return false;
    }

    // Send WhatsApp message to user only
    await sendWhatsAppMessage(
      userData.phone_primary,
      userMessage,
      "user",
      invoicePath,
      invoiceNumber
    );

      await sendWhatsAppMessage(
      hostData.phone_primary,
      hostMessage,
      "host" // 🚫 no invoice attached for host
    );
   



    console.log("✅ WhatsApp notification sent to user with hybrid invoice number");

    // Delete invoice after sending
    fs.unlink(invoicePath, (err) => {
      if (err) console.error("❌ Error deleting invoice:", err);
      else console.log("🗑️ Deleted invoice file:", invoicePath);
    });

  } catch (err) {
    console.error("❌ WhatsApp notify failed:", err);
  }
}


// <--------------- Function to generate invoice PDF ----------->

async function generateInvoice(booking, userData, hostData, vehicle) {
  return new Promise(async (resolve, reject) => {
    try {
      // ---------------- Generate hybrid invoice number ----------------
      let invoiceNo = booking.invoice_no;
      if (!invoiceNo) {
        // Fetch last booking with invoice_no like INV-YYYY-XXXX
        const { data: lastBooking } = await supabase
          .from("bookings")
          .select("invoice_no")
          .like("invoice_no", `INV-${new Date().getFullYear()}-%`)
          .order("invoice_no", { ascending: false })
          .limit(1)
          .single();

        if (!lastBooking?.invoice_no) {
          invoiceNo = `INV-${new Date().getFullYear()}-0001`;
        } else {
          const lastNumber = parseInt(lastBooking.invoice_no.split("-")[2]);
          const newNumber = String(lastNumber + 1).padStart(4, "0");
          invoiceNo = `INV-${new Date().getFullYear()}-${newNumber}`;
        }

        // Save the new invoice number back to booking
        const { error: invoiceUpdateError } = await supabase
          .from("bookings")
          .update({ invoice_no: invoiceNo })
          .eq("id", booking.id);

        if (invoiceUpdateError) console.error("❌ Failed to save invoice_no:", invoiceUpdateError);
      }

      const invoicePath = `./invoices/invoice-${invoiceNo}.pdf`;


      // Ensure invoices folder exists
      if (!fs.existsSync("./invoices")) fs.mkdirSync("./invoices");

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(invoicePath);
      doc.pipe(stream);

      // ===== HEADER =====
      doc.fontSize(20).font("Helvetica-Bold").text("Rental Drives", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(12).font("Helvetica").text("Official Vehicle Rental Marketplace", { align: "center" });
      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);

      // ===== INVOICE TITLE =====
      doc.fontSize(16).font("Helvetica-Bold").text("INVOICE", { align: "center" });
      doc.moveDown(1);

      // ===== Invoice Info =====
      doc.fontSize(12).font("Helvetica");
      doc.text(`Invoice No: ${invoiceNo}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      doc.moveDown(1);

      // ===== BILL TO =====
      doc.fontSize(14).font("Helvetica-Bold").text("Billed To:");
      doc.fontSize(12).font("Helvetica");
      doc.text(`${userData.full_name}`);
      doc.text(`Phone: ${userData.phone_primary}`);
      doc.moveDown(1);

      // ===== HOST =====
      doc.fontSize(14).font("Helvetica-Bold").text("Host:");
      doc.fontSize(12).font("Helvetica");
      doc.text(`${hostData.full_name}`);
      doc.text(`Phone: ${hostData.phone_primary}`);
      doc.moveDown(1);

      // ===== BOOKING SUMMARY (Table Style) =====
      doc.fontSize(14).font("Helvetica-Bold").text("Booking Summary");
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const itemX = 50, fromX = 200, toX = 300, amountX = 450;

      doc.fontSize(12).font("Helvetica-Bold");
      doc.text("Vehicle", itemX, tableTop);
      doc.text("From", fromX, tableTop);
      doc.text("To", toX, tableTop);
      doc.text("Amount (₹)", amountX, tableTop);

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      doc.font("Helvetica").fontSize(12);
      doc.text(`${vehicle.make} ${vehicle.model}`, itemX, tableTop + 25);
      doc.text(`${booking.start_date.split("T")[0]}`, fromX, tableTop + 25);
      doc.text(`${booking.end_date.split("T")[0]}`, toX, tableTop + 25);
      doc.text(`${booking.total_price}`, amountX, tableTop + 25);

      doc.moveTo(50, tableTop + 60).lineTo(550, tableTop + 60).stroke();
      doc.font("Helvetica-Bold").text("TOTAL:", toX, tableTop + 70);
      doc.text(`₹${booking.total_price}`, amountX, tableTop + 70);

      doc.moveDown(3);

      // ===== FOOTER =====
      doc.fontSize(10).font("Helvetica-Oblique").fillColor("gray");
      doc.text(
        "This invoice is system generated by Rental Drives.\n" +
        "We act as a marketplace connecting renters and hosts.\n" +
        "Please contact the host for vehicle-related issues.",
        { align: "center" }
      );

      doc.end();
      stream.on("finish", () => resolve(invoicePath));
      stream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
}

//<---------------------whatsapp function ends here ----------------->

// --- API Endpoints ---

// ======== AUTHENTICATION ENDPOINTS ========

/*  use for login/signup style 
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
*/
// ================== AUTH FLOW (PHONE + OTP) ==================

// ---------------- SEND OTP ----------------
// ================== SEND OTP ==================
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) return res.status(400).json({ error: "Phone number is required" });
    if (!phone.startsWith("+")) return res.status(400).json({ error: "Phone must include country code (+91...)" });

    const { data, error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
      console.error("Send OTP error:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ message: "OTP sent successfully", data });
  } catch (err) {
    console.error("Send OTP unexpected error:", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, token } = req.body;

    if (!phone || !token) return res.status(400).json({ error: "Phone and OTP are required" });

    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    });

    if (error) {
      console.error("Verify OTP error:", error);
      return res.status(400).json({ error: "Invalid OTP or expired" });
    }

    res.status(200).json({ message: "Signup complete", user: data.user , session: data.session });
  } catch (err) {
    console.error("Verify OTP unexpected error:", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
});


// ---------------- GET CURRENT USER PROFILE ----------------
app.get("/api/users/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Profile not found." });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ... existing code ...
// --- 1. UPDATE the existing user profile update endpoint ---
// Find: app.put('/api/users/me', ...)
// Add 'license_document_url' to the list of fields that can be updated.

app.put('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.sub;
    // ADD license_document_url to this line
    const { full_name, address, phone_primary, phone_secondary, license_document_url } = req.body;

    const updates = {};
    if (full_name) updates.full_name = full_name;
    if (address) updates.address = address;
    if (phone_primary) updates.phone_primary = phone_primary;
    if (phone_secondary) updates.phone_secondary = phone_secondary;
    // ADD this line
    if (license_document_url) updates.license_document_url = license_document_url;


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
// ... existing code ...

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

// UPDATE a vehicle
app.put('/api/vehicles/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // --- CORRECTED LOGIC ---
        // Always reset status to 'pending' on any update by a host.
        // This ensures all changes are re-verified by an admin.
        updates.status = 'pending';
        updates.is_certified = false;
        // --- END CORRECTION ---

        const { data, error } = await supabase
            .from('vehicles')
            .update(updates)
            .eq('id', id)
            .eq('host_id', req.user.sub) // Ensure only the owner can edit
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

/// backend/index.js

// CREATE a new booking - UPDATED WITH CORRECT VALIDATION
app.post('/api/bookings/create-order', authenticateToken, async (req, res) => {
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
    // --- End of new check ---

    //<--------------------------------------- booking start ------------------------------------------>

    //insert booking as pending

    // ADDED: dropoff_location to the insert object
    const bookingData = {
        user_id: req.user.sub,
        vehicle_id,
        start_date,
        end_date,
        total_price,
        status: 'pending',
        dropoff_location: dropoff_location || null // Save location or null if not provided
    };

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select()
      .single();

        if (bookingError) throw bookingError;

    // 2 Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(total_price * 100), // INR in paise
      currency: "INR",
      receipt: booking.id,
    });

    // 3 Insert payment record (pending)
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert([
        {
          booking_id: booking.id,
          amount: total_price,
          currency: "INR",
          status: "pending",
          payment_gateway: "razorpay",
          razorpay_order_id: order.id,
        },
      ])
      .select()
      .single();

      if (paymentError) throw paymentError;

    res.json({ booking, order });
  } catch (err) {
    console.error("Error creating booking order:", err);
    res.status(500).json({ error: "Failed to create booking order" });
  }

});


// --- Verify Payment ---
app.post("/api/payments/verify", async (req, res) => {

  try {
    // console.log("🔎 Full request body:", req.body);
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Debug log request
    /* console.log("Verify API called with:", {
       bookingId,
       razorpay_order_id,
       razorpay_payment_id,
       razorpay_signature,
     });   */

    //  Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    //console.log("Expected Signature:", expectedSignature);
    // console.log("Received Signature:", razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Signature mismatch!");
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Update payment row by booking_id
    const { data: updatedPayment, error: paymentUpdateError } = await supabase
      .from("payments")
      .update({
        razorpay_payment_id,
        razorpay_order_id, // optional: re-save for reference
        status: "paid",
      })
      .eq("booking_id", bookingId)
      .select();

    if (paymentUpdateError) {
      console.error("❌ Payment update error:", paymentUpdateError);
      return res.status(500).json({ error: "Failed to update payment" });
    }

    // console.log("✅ Payment updated:", updatedPayment);

    //  Update booking status
    const { data: updatedBooking, error: bookingUpdateError } = await supabase
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", bookingId)
      .select();

    if (bookingUpdateError) {
      console.error("❌ Booking update error:", bookingUpdateError);
      return res.status(500).json({ error: "Failed to update booking" });
    }

    //console.log("✅ Booking updated:", updatedBooking);

    // ✅ Fetch booking with user + host details
    //  console.log("🔎 Booking ID received in verify API:", bookingId);

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(`
    *,
    vehicles (
      *,
      profiles (*)
    ),
    profiles (*)
  `)
      .eq("id", bookingId)
      .single();

  //  console.log("📌 Booking data fetched:", JSON.stringify(booking, null, 2));

    if (error) {
      console.error("❌ Supabase error while fetching booking:", error);
      return res.status(500).json({ success: false, message: "Error fetching booking" });
    }

    if (!booking) {
      console.error("❌ No booking found in DB for bookingId:", bookingId);
      return res.status(404).json({ success: false, message: "Booking not found in DB" });

    }


     const vehicle = booking.vehicles;
    const userPhone = booking?.profiles?.phone_primary;
    const hostPhone = booking?.vehicles?.profiles?.phone_primary;
    const userProfile = booking.profiles;
    const hostProfile = booking.vehicles?.profiles;

   // console.log("📌 User phone:", userPhone);
   // console.log("📌 Host phone:", hostPhone);

    // ✅ Send WhatsApp confirmation
    // ✅ Send WhatsApp notifications

    // ✅ Generate invoice PDF first
    const invoicePath = await generateInvoice(booking, userProfile, hostProfile, vehicle);
     // ✅ Send WhatsApp notifications
    await notifyBooking(userProfile, hostProfile, vehicle, booking, invoicePath);

    return res.json({ success: true, message: "Payment verified + WhatsApp sent" });
  } catch (err) {
    console.error("❌ verifyPayment error:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
});


//<----------- payment failure endpoint --------------->

app.post("/api/payments/fail", async (req, res) => {
  try {
    const { booking_id, razorpay_order_id } = req.body;
    // console.log("⚠️ Payment failure called with:", { booking_id, razorpay_order_id });

    // Update payments table
    const { data: failedPayment, error: paymentFailError } = await supabase
      .from("payments")
      .update({ status: "failed" })
      .eq("razorpay_order_id", razorpay_order_id)
      .select();

    if (paymentFailError) {
      console.error("❌ Failed to update payments:", paymentFailError);
      return res.status(500).json({ error: "Payment update failed" });
    }
    // console.log("✅ Payment marked as failed:", failedPayment);

    // Update booking table
    const { data: cancelledBooking, error: bookingFailError } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", booking_id)
      .select();

    if (bookingFailError) {
      console.error("❌ Failed to update booking:", bookingFailError);
      return res.status(500).json({ error: "Booking update failed" });
    }
    // console.log("✅ Booking cancelled:", cancelledBooking);

    res.json({ success: true, msg: "Payment failed & booking cancelled" });
  } catch (err) {
    console.error("🔥 Error in fail route:", err);
    res.status(500).json({ success: false, msg: "Error updating failed payment" });
  }
});

//<--------------- end of booking -------------------------------------------------------->

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

// --- Cancel Booking + Refund ---
// PATCH Cancel Booking
app.patch('/api/bookings/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch booking with payment info
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*, payments(*)")
      .eq("id", id)
      .eq("user_id", req.user.sub)
      .single();

    if (bookingError || !booking) {
      return res.status(404).json({ error: "Booking not found or unauthorized" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ error: "Booking already cancelled" });
    }

    // Cancellation policy
    const now = new Date();
    const startTime = new Date(booking.start_date);
    const hoursBeforeStart = (startTime - now) / (1000 * 60 * 60);

    let refundPercent = 0;
    if (hoursBeforeStart > 24) refundPercent = 1;
    else if (hoursBeforeStart >= 6) refundPercent = 0.5;
    else refundPercent = 0;

    const refundAmount = Math.floor(booking.total_price * refundPercent);

    // Update booking to cancelled
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);

    // No refund case
    if (refundAmount === 0) {
      await supabase.from("payments")
        .update({
          refund_status: "failed",
          refund_reason: "No refund eligible (within 6 hours)"
        })
        .eq("booking_id", id);

      return res.json({ success: true, message: "Booking cancelled (no refund eligible)" });
    }

    // Refund initiated
    const payment = booking.payments?.[0];
    if (!payment || !payment.razorpay_payment_id) {
      return res.status(400).json({ error: "Payment not found for refund" });
    }

    // Call Razorpay Refund API
    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${payment.razorpay_payment_id}/refund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization":
            "Basic " +
            Buffer.from(
              `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
            ).toString("base64"),
        },
        body: JSON.stringify({ amount: refundAmount * 100 }),
      }
    );

    const refundData = await response.json();

   /* // Mark as INITIATED
    await supabase.from("payments").update({
      refund_status: "initiated",
      refund_amount: refundAmount,
      refund_id: refundData?.id || null,
      refunded_at: null,
    }).eq("booking_id", id);
*/
    // ✅ MVP → Directly mark refund as completed
    await supabase.from("payments").update({
      refund_status: "completed",
      refund_amount: refundAmount,
      refund_id: refundData?.id || null,
      initiated_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    }).eq("booking_id", id);

    
    return res.json({
      success: true,
      message: `Booking cancelled, refund of ₹${refundAmount} initiated`,
      refund: { status: "initiated", ...refundData }
    });

  } catch (error) {
    console.error("❌ Cancel API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post("/api/bookings/:id/refund-processed", async (req, res) => {
  const { id } = req.params;

  try {
    await supabase.from("payments").update({
      refund_status: "processed",
      refunded_at: new Date().toISOString(),
    }).eq("booking_id", id);

    res.json({ success: true, message: "Refund marked as processed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update refund status" });
  }
});
// POST /api/bookings/:id/refund-completed
app.post("/api/bookings/:id/refund-completed", async (req, res) => {
  const { id } = req.params;

  try {
    // Update payment as completed
    await supabase.from("payments").update({
      refund_status: "completed",
      refunded_at: new Date().toISOString(), // timestamp for completion
    }).eq("booking_id", id);

    res.json({ success: true, message: "Refund marked as completed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update refund status" });
  }
});
app.get('/api/booking/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('bookings')
    .select(`*, vehicles(*), profiles(*)`)
    .eq('id', id)
    .single();


  if (error) return res.status(404).json({ error: "Booking not found" });
  res.json(data);
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
    // ... inside app.get('/api/admin/vehicles/pending', ...)
    const { data, error } = await supabase
      .from('vehicles')
      // UPDATED: Added certification_url and is_certified
      .select(`*, certification_url, is_certified, profiles ( full_name )`)
      .eq('status', 'pending');
    //...

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

// NEW: Generate a temporary, secure URL for a vehicle certification
app.get('/api/admin/vehicles/:vehicleId/certification-url', authenticateToken, async (req, res) => {
  try {
    if (req.user.user_metadata.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { vehicleId } = req.params;

    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select('certification_url')
      .eq('id', vehicleId)
      .single();

    if (vehicleError || !vehicle || !vehicle.certification_url) {
      return res.status(404).json({ error: 'Certification document not found for this vehicle.' });
    }

    const filePath = new URL(vehicle.certification_url).pathname.split('/vehicle-certifications/')[1];
    
    // Create a signed URL valid for 5 minutes
    const { data, error: urlError } = await supabase.storage
      .from('vehicle-certifications')
      .createSignedUrl(filePath, 300);

    if (urlError) throw urlError;

    res.status(200).json({ signedUrl: data.signedUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NEW: Mark a vehicle as certified
app.patch('/api/admin/vehicles/:id/certify', authenticateToken, async (req, res) => {
  try {
    if (req.user.user_metadata.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    const { id } = req.params;
    const { data, error } = await supabase
      .from('vehicles')
      .update({ is_certified: true })
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

// GET secure URL for a vehicle document (RC or Insurance)
app.get('/api/admin/vehicles/:vehicleId/document-url', authenticateToken, async (req, res) => {
    try {
        if (req.user.user_metadata.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied.' });
        }
        const { vehicleId } = req.params;
        const { type } = req.query; // Expecting ?type=rc or ?type=insurance

        if (!type || (type !== 'rc' && type !== 'insurance')) {
            return res.status(400).json({ error: 'A document type of "rc" or "insurance" is required.' });
        }

        const documentColumn = type === 'rc' ? 'rc_document_url' : 'insurance_document_url';

        const { data: vehicle, error: vehicleError } = await supabase
            .from('vehicles')
            .select(documentColumn)
            .eq('id', vehicleId)
            .single();

        if (vehicleError || !vehicle || !vehicle[documentColumn]) {
            return res.status(404).json({ error: `${type.toUpperCase()} document not found for this vehicle.` });
        }

        const filePath = new URL(vehicle[documentColumn]).pathname.split('/vehicle-certifications/')[1];
        
        const { data, error } = await supabase.storage
            .from('vehicle-certifications')
            .createSignedUrl(filePath, 300); // Valid for 5 minutes

        if (error) throw error;
        res.status(200).json({ signedUrl: data.signedUrl });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// NEW: GET all tourists that have submitted a license but are not yet verified
app.get('/api/admin/tourists/pending-license', authenticateToken, async (req, res) => {
  try {
    if (req.user.user_metadata.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'tourist')
      .eq('is_license_verified', false)
      .not('license_document_url', 'is', null); // Only get tourists who have uploaded a license

    if (error) throw error;
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NEW: UPDATE a tourist's profile to set is_license_verified to true
app.patch('/api/admin/tourists/:id/verify-license', authenticateToken, async (req, res) => {
  try {
    if (req.user.user_metadata.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const { id } = req.params;
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_license_verified: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Tourist not found.' });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// NEW: Generate a temporary, secure URL for an admin to view a tourist's license
app.get('/api/admin/tourists/:touristId/license-url', authenticateToken, async (req, res) => {
  try {
    if (req.user.user_metadata.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { touristId } = req.params;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('license_document_url')
      .eq('id', touristId)
      .single();

    if (profileError || !profile || !profile.license_document_url) {
      return res.status(404).json({ error: 'License document not found for this tourist.' });
    }

    const filePath = new URL(profile.license_document_url).pathname.split('/tourist-licenses/')[1];
    
    const { data, error: urlError } = await supabase.storage
      .from('tourist-licenses')
      .createSignedUrl(filePath, 300); // URL is valid for 5 minutes

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
                vehicles ( make, model, vehicle_type ),
                profiles ( full_name )
            `)
      .in('vehicle_id', vehicleIds)
      .order('created_at', { ascending: false }); // <-- ADD THIS LINE to sort

    if (bookingsError) throw bookingsError;

    res.status(200).json(bookings);

  } catch (error) {
    console.error('Error fetching host bookings:', error);
    res.status(500).json({ error: error.message });
  }
});

//
//
// NEW: A more robust endpoint to get specific vehicle documents for a host
app.get('/api/hosts/my-vehicles/:vehicleId/certification-url', authenticateToken, async (req, res) => {
  try {
    // 1. Role check is good, but can be combined with the vehicle ownership check.
    const { vehicleId } = req.params;
    const hostId = req.user.sub;
    
    // 2. GET THE DOCUMENT TYPE FROM THE QUERY STRING
    const { type } = req.query; // This is the new line that reads "?type=rc" or "?type=insurance"

    // 3. VALIDATE THE TYPE
    if (!type || (type !== 'rc' && type !== 'insurance')) {
      return res.status(400).json({ error: 'A valid document type query parameter (?type=rc or ?type=insurance) is required.' });
    }

    // 4. CHOOSE THE CORRECT DATABASE COLUMN TO READ
    const documentColumn = type === 'rc' ? 'rc_document_url' : 'insurance_document_url';

    // 5. SECURITY CHECK & DYNAMICALLY SELECT THE CORRECT COLUMN
    const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select(`${documentColumn}, host_id`) // <-- CHANGED: Selects the correct column dynamically
        .eq('id', vehicleId)
        .eq('host_id', hostId) // <-- CHANGED: More efficient security check
        .single();

    if (vehicleError || !vehicle) {
        return res.status(404).json({ error: 'Vehicle not found or you do not have permission.' });
    }
    
    // 6. GET THE URL FROM THE CORRECT PROPERTY
    const documentUrl = vehicle[documentColumn]; // <-- CHANGED: Accesses the correct property

    if (!documentUrl) {
        return res.status(404).json({ error: 'Document not found for this vehicle.' });
    }

    // 7. Generate the signed URL (this part is the same and correct)
    const filePath = new URL(documentUrl).pathname.split('/vehicle-certifications/')[1];
    const { data, error: urlError } = await supabase.storage
        .from('vehicle-certifications')
        .createSignedUrl(filePath, 300);

    if (urlError) throw urlError;

    res.status(200).json({ signedUrl: data.signedUrl });

  } catch (error) {
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