// src/pages/VerifyOtp.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaKey, FaUser, FaPhone } from "react-icons/fa";
import { supabase } from "../supabaseClient";

function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { state } = useLocation();
  const { phone, fullName, role } = state || {};

  if (!phone) navigate("/signup");

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1️⃣ Verify OTP with backend
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, token: otp, full_name: fullName, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OTP verification failed");

       // ✅ 2. Save session using Supabase (same as Login.jsx)
      const { error } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
      if (error) throw error;

      // 3️⃣ Fetch user profile (or create it if missing)
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .single();

    if (!existingProfile) {
  const { error: insertError } = await supabase.from("profiles").insert([
    {
      id: data.user.id,
      full_name: fullName || "",
      role: role || "tourist",
      phone_primary: phone || "",
    },
  ]);

  if (insertError) {
    console.error("Profile insert error:", insertError);
    alert("Failed to save full name in profile. Please try again.");
  } else {
    console.log("✅ Profile inserted successfully with full_name:", fullName);
  }
}


      // 4️⃣ Fetch profile using your existing endpoint
      const profileRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${data.session?.access_token}` },
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        console.log("Profile loaded:", profileData);
      }

      // 5️⃣ Show success message and redirect
      alert("Signup successful! Welcome to RentalDrives.");
      navigate("/"); // redirect to homepage

      // 6️⃣ Navbar will automatically update via AuthContext
    } catch (error) {
      console.error("Verification error:", error);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputBaseClass =
    "w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Verify OTP</h2>
          <p className="mt-2 text-gray-600">
            Enter the OTP sent to <strong>{phone}</strong>
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleVerifyOtp}>
          {/* Full Name (disabled) */}
          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={fullName}
              disabled
              className={inputBaseClass + " bg-gray-100 cursor-not-allowed"}
            />
          </div>

          {/* Phone Number (disabled) */}
          <div className="relative">
            <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              value={phone}
              disabled
              className={inputBaseClass + " bg-gray-100 cursor-not-allowed"}
            />
          </div>

          {/* OTP Input */}
          <div className="relative">
            <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className={inputBaseClass}
            />
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VerifyOtp;
