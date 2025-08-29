
import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config(); // load .env variables into process.env


//import fetch from "node-fetch"; 
import { createClient } from "@supabase/supabase-js";
import path from "path";
import bodyParser from "body-parser";

// For __dirname in ES module
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// 🔹 Serve frontend files from "public" folder
app.use(express.static(path.join(__dirname, "public")));



// Supabase connection
const supabase = createClient(
  process.env.supabaseUrl,
  process.env.supabaseKey
);



const key_id = process.env.key_id;     // put your Razorpay test key
const key_secret = process.env.key_secret;       // put your Razorpay secret

const razorpay = new Razorpay({ key_id, key_secret });

// WhatsApp Cloud API
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

// -------------------- CREATE ORDER --------------------

app.post("/create-order", async (req, res) => {
  try {
    const { vehicle_id, user_id, host_id, start_date, end_date, amount } = req.body;

    if (!vehicle_id || !user_id || !host_id || !start_date || !end_date || !amount) {
      return res.status(400).json({ success: false, msg: "Missing required fields" });
    }

    // 1. Create booking (status pending)
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert([
        {
          vehicle_id,
          user_id,
          host_id,
          start_date,
          end_date,
          status: "pending",
           total_price: amount
        }
      ])
      .select()
      .single();

    if (bookingError) {
      console.error("Booking insert error:", bookingError);
      return res.status(500).json({ success: false, msg: "Booking creation failed" });
    }

    // 2. Create Razorpay order
    const options = {
      amount: amount * 100, // paise
      currency: "INR",
      receipt: booking.id, // link Razorpay order to booking
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
      booking_id: booking.id,
      amount,
      currency: "INR"
    });

  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ success: false, msg: "Error creating order" });
  }
});



// -------------------- VERIFY PAYMENT --------------------
app.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id, amount } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !booking_id || !amount) {
      return res.status(400).json({ success: false, msg: "Missing payment details" });
    }

    // 1. Verify signature
    //const crypto = require("crypto");
    const generated_signature = crypto
      .createHmac("sha256", key_secret)  // your Razorpay secret key
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, msg: "Invalid signature" });
    }

    console.log("✅ Signature verified, saving payment...");

    // 2. Insert payment record
    const { data: payment, error: payError } = await supabase
      .from("payments")
      .insert([
        {
          booking_id,
          razorpay_payment_id,
          amount,
          status: "paid"
        }
      ])
      .select()
      .single();

    if (payError) {
      console.error("Supabase payment insert error:", payError);
      return res.status(500).json({ success: false, msg: "Payment insert failed" });
    }

    // 3. Update booking as confirmed
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", booking_id)
      .select()
      .single();

    if (bookingError) {
      console.error("Supabase booking update error:", bookingError);
      return res.status(500).json({ success: false, msg: "Booking update failed" });
    }


    //-------------fetch data to send message ------------

// Fetch user, host, vehicle info
const { data: userData } = await supabase
  .from("users")
  .select("name, phone")
  .eq("id", booking.user_id)
  .single();

const { data: hostData } = await supabase
  .from("hosts")
  .select("name, phone")
  .eq("id", booking.host_id)
  .single();

const { data: vehicleData } = await supabase
  .from("vehicles")
  .select("name, location, price_per_day")
  .eq("id", booking.vehicle_id)
  .single();


  //----------- message template -------------------
  /*const userMessage = `✅ Booking Confirmed!
Vehicle: ${vehicleData.name}
Location: ${vehicleData.location}
From: ${booking.start_date} To: ${booking.end_date}
Amount: ₹${booking.total_price}`;

const hostMessage = `📢 New Booking!
Customer: ${userData.name}
Vehicle: ${vehicleData.name}
Location: ${vehicleData.location}
From: ${booking.start_date} To: ${booking.end_date}`;

*/
// -------------------- SEND WHATSAPP --------------------
async function sendWhatsapp(to, message, recipientType = "user") {
  console.log(`\n📩 Sending WhatsApp to ${recipientType}:`, to);
  console.log(`Message content:\n${message}\n`);

  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to,

        type: "text",
        text: { body: message },
      }),
    });

    console.log(`WhatsApp API response status: ${res.status}`);

    const data = await res.json();
    console.log(`WhatsApp API response body:`, data);

    if (!res.ok) {
      console.error(`❌ Failed to send WhatsApp to ${recipientType}:`, data);
    } else {
      console.log(`✅ WhatsApp sent successfully to ${recipientType}`);
    }
  } catch (error) {
    console.error(`🚨 Error sending WhatsApp to ${recipientType}:`, error);
  }
}

async function notifyBooking(userData, hostData, vehicle, booking) {
  try{// user message
  const userMessage = `✅ Booking Confirmed!
Vehicle: ${vehicle.name}
Location: ${vehicle.location}
From: ${booking.start_date} To: ${booking.end_date}
Amount: ₹${booking.total_price}`;

  // host message
  const hostMessage = `📢 New Booking!
Customer: ${userData.name}
Vehicle: ${vehicle.name}
Location: ${vehicle.location}
From: ${booking.start_date} To: ${booking.end_date}`;

 
    // send in parallel
  await Promise.all([
    sendWhatsapp(userData.phone, userMessage, "user"),
    sendWhatsapp(hostData.phone, hostMessage, "host")
  ]);
  console.log("✅ WhatsApp notifications sent");
   } catch (err) {
    console.error("❌ WhatsApp notify failed:", err);
    // optional: later we can insert into Supabase notifications_log table
  }

}

// Send to user
notifyBooking(userData, hostData, vehicleData, booking)


  
    res.json({ success: true, msg: "Payment verified & booking confirmed", booking, payment });
  

  } catch (err) {
    console.error("Error verifying payment:", err);
    res.status(500).json({ success: false, msg: "Error verifying payment" });
  }
});





// start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
