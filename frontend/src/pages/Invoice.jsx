import { useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { FaPrint, FaDownload } from 'react-icons/fa';
import Button from '../Components/ui/Button';

// Fetch Booking Details Reused
const fetchBookingDetails = async (bookingId, session) => {
    if (!bookingId || !session) return null;
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/booking/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch invoice details');
    return response.json();
};

const Invoice = () => {
    const { id } = useParams();
    const { session } = useAuth();

    const { data: booking, isLoading, isError } = useQuery({
        queryKey: ['invoice', id],
        queryFn: () => fetchBookingDetails(id, session),
        enabled: !!id && !!session,
    });

    if (isLoading) return <div className="h-screen flex items-center justify-center">Generating Invoice...</div>;
    if (isError) return <div className="h-screen flex items-center justify-center text-destructive">Failed to load invoice.</div>;

    const subtotal = booking.total_price;
    const total = subtotal;

    return (
        <div className="bg-white text-black min-h-screen font-sans flex items-center justify-center p-4">
            {/* A4 Invoice Container - Compacted */}
            <div className="w-full max-w-2xl bg-white border border-gray-200 shadow-xl p-8 print:shadow-none print:border-0 print:w-full print:max-w-none print:m-0 relative" id="invoice">

                {/* Status Watermark */}
                <div className={`absolute top-8 right-8 text-xl font-black uppercase tracking-[0.2em] border-2 px-3 py-1 rotate-[-12deg] opacity-20 select-none ${booking.status === 'cancelled' ? 'text-red-600 border-red-600' :
                        booking.status === 'confirmed' ? 'text-green-600 border-green-600' :
                            'text-gray-400 border-gray-400'
                    }`}>
                    {booking.status}
                </div>

                {/* Header */}
                <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight uppercase">Invoice</h1>
                        <p className="text-gray-500 mt-0.5 font-mono text-xs">#{booking.id?.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-lg font-bold">RentalDrives</h2>
                        <p className="text-gray-500 text-xs">123 Mobility Lane</p>
                        <p className="text-gray-500 text-xs">Tech City, India 400001</p>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-8 mb-6">
                    <div>
                        <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Billed To</h3>
                        <p className="font-bold text-sm">{booking.profiles?.full_name}</p>
                        <p className="text-gray-600 text-xs">{booking.profiles?.email}</p>
                        <p className="text-gray-600 text-xs">{booking.profiles?.phone_number}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Invoice Details</h3>
                        <div className="space-y-0.5">
                            <p className="text-xs"><span className="text-gray-500">Date Issued:</span> <span className="font-medium">{new Date().toLocaleDateString()}</span></p>
                            <p className="text-xs"><span className="text-gray-500">Trip Start:</span> <span className="font-medium">{new Date(booking.start_date).toLocaleDateString()}</span></p>
                            <p className="text-xs"><span className="text-gray-500">Trip End:</span> <span className="font-medium">{new Date(booking.end_date).toLocaleDateString()}</span></p>
                        </div>
                    </div>
                </div>

                {/* Vehicle Section */}
                <div className="mb-6 p-4 bg-gray-50 rounded border border-gray-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-base font-bold">{booking.vehicles?.make} {booking.vehicles?.model}</p>
                            <p className="text-xs text-gray-500">{booking.vehicles?.year} • {booking.vehicles?.fuel_type} • {booking.vehicles?.transmission}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-mono text-xs bg-gray-200 px-2 py-0.5 rounded">Reg: {booking.vehicles?.license_plate}</p>
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <table className="w-full mb-6">
                    <thead>
                        <tr className="border-b border-gray-100 text-left">
                            <th className="py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Description</th>
                            <th className="py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="py-2 text-xs font-medium">Vehicle Rental Charge</td>
                            <td className="py-2 text-xs font-bold text-right font-mono">₹{(total / 1.18).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td className="py-2 text-xs font-medium">Platform Fee & Taxes (18%)</td>
                            <td className="py-2 text-xs font-bold text-right font-mono">₹{(total - (total / 1.18)).toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end border-t border-gray-200 pt-4">
                    <div className="w-1/2 space-y-1">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-mono">₹{(total / 1.18).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Taxes</span>
                            <span className="font-mono">₹{(total - (total / 1.18)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-blue-600 border-t border-gray-200 pt-2 mt-2">
                            <span>Total</span>
                            <span className="font-mono">₹{total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-4 border-t border-gray-100 text-center text-gray-400 text-[10px]">
                    <p>Thank you for choosing RentalDrives. Computer-generated invoice.</p>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
