// src/pages/VerifyOtp.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaKey, FaUser, FaPhone } from "react-icons/fa";

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
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, token: otp, full_name: fullName, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OTP verification failed");

      localStorage.setItem("supabaseSession", JSON.stringify(data.session));
      localStorage.setItem("backendToken", data.token);

      alert("OTP verified! Welcome to RentalDrives.");
      navigate("/"); // homepage
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputBaseClass = "w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Verify OTP</h2>
          <p className="mt-2 text-gray-600">Enter the OTP sent to <strong>{phone}</strong></p>
        </div>

        <form className="space-y-6" onSubmit={handleVerifyOtp}>
          {/* Full Name (disabled) */}
          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={fullName} disabled className={inputBaseClass + " bg-gray-100 cursor-not-allowed"} />
          </div>

          {/* Phone Number (disabled) */}
          <div className="relative">
            <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="tel" value={phone} disabled className={inputBaseClass + " bg-gray-100 cursor-not-allowed"} />
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
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VerifyOtp;
