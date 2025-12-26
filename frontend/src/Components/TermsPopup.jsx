// src/Components/TermsPopup.jsx
import { useState } from "react";
import { FaShieldAlt, FaCheck, FaTimes } from 'react-icons/fa';
import Button from './ui/Button';

export default function TermsPopup({ onAccept, onDecline }) {
  const [open, setOpen] = useState(true);
  const [agreed, setAgreed] = useState(false);

  const handleAccept = () => {
    if (!agreed) return;
    setOpen(false);
    if (onAccept) onAccept();
  };

  const handleDecline = () => {
    setOpen(false);
    if (onDecline) onDecline();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"></div>

      {/* Modal Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-950 px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <FaShieldAlt />
          </div>
          <div>
            <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white leading-tight">Platform Rules</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Please review before proceeding</p>
          </div>
        </div>

        {/* Scrollable Terms Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar text-sm space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-4">
            <p className="font-bold text-blue-800 dark:text-blue-300 text-xs uppercase tracking-wider mb-2">Key Disclaimer</p>
            <p className="text-blue-900/80 dark:text-blue-200/80">
              RentalDrives is a marketplace connecting you with independent hosts. We do not own vehicles and are not liable for road incidents.
            </p>
          </div>

          <ul className="space-y-3 list-disc pl-4 marker:text-slate-400">
            <li><strong>Verification:</strong> You must present a valid original driving license to the host upon pickup.</li>
            <li><strong>Inspection:</strong> Inspect the vehicle thoroughly before accepting the keys. You are responsible for any new damage.</li>
            <li><strong>Safety:</strong> Obey all traffic laws. Helmets/Seatbelts are mandatory.</li>
            <li><strong>Returns:</strong> Return the vehicle on time to avoid penalty charges.</li>
            <li><strong>Payments:</strong> Marketplace fees are non-refundable once a booking is confirmed by the host.</li>
          </ul>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 mt-auto">

          {/* Checkbox */}
          <label className="flex items-start gap-3 mb-6 cursor-pointer group">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded transition-colors peer-checked:bg-blue-600 peer-checked:border-blue-600"></div>
              <FaCheck className="absolute top-1 left-1 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400 select-none group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
              I accept the <span className="underline decoration-slate-300 underline-offset-2">Terms of Service</span> and Host Rules.
            </span>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleDecline}
              className="flex justify-center items-center px-4 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Decline
            </button>
            <Button
              onClick={handleAccept}
              disabled={!agreed}
              className={`justify-center w-full ${!agreed ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Confirm & Continue
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}