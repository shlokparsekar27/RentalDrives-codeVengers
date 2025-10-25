// src/pages/PhoneAuth.jsx
import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

function PhoneAuth() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("enterPhone"); // enterPhone | verifyOtp | completeProfile
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("tourist");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Send OTP
  const sendOtp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (error) alert(error.message);
    else setStep("verifyOtp");
  };

  // Step 2: Verify OTP
  const verifyOtp = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });
    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      const { session } = data;
      if (!session) return alert("No session returned!");

      // Sync with backend
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/profiles/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ full_name: fullName, role }),
      });

      if (res.ok) {
        alert("Login successful!");
        navigate("/");
      } else {
        alert("Failed to sync profile");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md space-y-6">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          {step === "enterPhone" ? "Sign in with Phone" : "Verify OTP"}
        </h2>

        {step === "enterPhone" && (
          <>
            <input
              type="tel"
              placeholder="Enter phone (e.g. +91XXXXXXXXXX)"
              className="w-full border p-3 rounded-md"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {step === "verifyOtp" && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              className="w-full border p-3 rounded-md"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <input
              type="text"
              placeholder="Full name"
              className="w-full border p-3 rounded-md"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <select
              className="w-full border p-3 rounded-md"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="tourist">Tourist</option>
              <option value="host">Host</option>
            </select>
            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default PhoneAuth;
