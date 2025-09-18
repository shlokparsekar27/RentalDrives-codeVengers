// src/Components/TermsPopup.jsx
import { useState } from "react";

export default function TermsPopup({ onAccept, onDecline }) {
  const [open, setOpen] = useState(true);
  const [agreed, setAgreed] = useState(false);

  const handleAccept = () => {
    setOpen(false);
    if (onAccept) onAccept();
  };

  const handleDecline = () => {
    setOpen(false);
    if (onDecline) onDecline();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Terms & Conditions</h2>

        {/* Scrollable terms */}
        <div className="text-sm text-gray-700 space-y-3 max-h-56 overflow-y-auto mb-4">
          <p><strong>1. Marketplace Role:</strong> We only connect users with hosts. We do not own or manage vehicles.</p>
          <p><strong>2. User Responsibility:</strong> You must hold a valid driving license and check the vehicle before use.</p>
          <p><strong>3. Host Responsibility:</strong> Hosts are responsible for condition, insurance, and legality of vehicles.</p>
          <p><strong>4. Liability:</strong> We are not liable for accidents, breakdowns, fines, or disputes between host and user.</p>
          <p><strong>5. Payments & Refunds:</strong> Refunds depend on host’s policy. Marketplace fees are non-refundable.</p>
          <p><strong>6. Usage:</strong> Vehicle must not be used for unlawful purposes. Any fines are the user’s responsibility.</p>
          {/* --- RECOMMENDED ADDITION --- */}
          <p className="font-bold">By continuing, you acknowledge that RentalDrives is a platform, and you agree to use this service at your own risk.</p>
        </div>

        {/* Checkbox inside popup */}
        <div className="flex items-start space-x-2 mb-6">
          <input
            type="checkbox"
            id="agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="agree" className="text-sm text-gray-700">
            I have read and agree to the Terms & Conditions
          </label>
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleDecline}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            disabled={!agreed}
            className={`px-4 py-2 rounded-lg text-white ${
              agreed ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}