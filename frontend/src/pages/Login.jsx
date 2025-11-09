import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // ---------------- SEND OTP ----------------
  const handleSendOtp = async () => {
    try {
      if (!phone) return alert("Please enter your phone number");
      setIsLoading(true);

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      alert("OTP sent successfully!");
      setIsOtpSent(true);
    } catch (error) {
      console.error("Send OTP error:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- VERIFY OTP (LOGIN) ----------------
  const handleVerifyOtp = async () => {
    try {
      if (!otp) return alert("Please enter the OTP");
      setIsLoading(true);

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, token: otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid or expired OTP");

      // ✅ Save Supabase session (for persistence)
      const { error } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      if (error) throw error;

     //await supabase.auth.refreshSession();



      // ✅ Fetch the user profile
      const profileRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${data.session?.access_token}` },
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        console.log("User logged in:", profileData);
      }

      alert("Login successful! Welcome back 👋");
      navigate("/"); // redirect to homepage
    } catch (error) {
      console.error("Login verification error:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login to RentalDrives</h2>

        {/* Phone Input */}
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Enter phone number (+91...)"
          className="w-full border p-3 rounded-lg mb-4"
          disabled={isOtpSent}
        />

        {/* OTP Input */}
        {isOtpSent && (
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            className="w-full border p-3 rounded-lg mb-4"
          />
        )}

        {/* Buttons */}
        {!isOtpSent ? (
          <button
            onClick={handleSendOtp}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            {isLoading ? "Sending..." : "Send OTP"}
          </button>
        ) : (
          <button
            onClick={handleVerifyOtp}
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>
        )}
      </div>
    </div>
  );
}

export default Login;
