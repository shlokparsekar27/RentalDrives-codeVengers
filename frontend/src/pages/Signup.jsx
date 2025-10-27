// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaPhone, FaCar, FaWalking } from 'react-icons/fa';

function Signup() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("tourist");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) return alert("Please agree to the Terms of Service.");
    setIsLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, full_name: fullName, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");

      alert("OTP sent successfully!");
      navigate("/VerifyOtp", { state: { phone, fullName, role } });
      console.log("From Signup:", { phone, fullName, role });


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
          <h2 className="text-3xl font-extrabold text-gray-900">Create Your Account</h2>
          <p className="mt-2 text-gray-600">Join RentalDrives to start your adventure</p>
        </div>

        <form className="space-y-6" onSubmit={handleSendOtp}>
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I want to:</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('tourist')}
                className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                  role === 'tourist' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                <FaWalking className={`h-6 w-6 mb-2 ${role === 'tourist' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="font-semibold">Rent a Vehicle</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('host')}
                className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                  role === 'host' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                <FaCar className={`h-6 w-6 mb-2 ${role === 'host' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="font-semibold">List a Vehicle</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className={inputBaseClass}
            />
          </div>

          {/* Phone Number */}
          <div className="relative">
            <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className={inputBaseClass}
            />
          </div>

          {/* Terms of Service */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-500">
                I agree to the{' '}
                <a href="/terms" target="_blank" className="font-medium text-blue-600 hover:underline">
                  Terms of Service
                </a>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading || !agreedToTerms}
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending OTP..." : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
