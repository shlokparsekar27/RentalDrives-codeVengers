// src/pages/Contact.jsx
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaWhatsapp } from 'react-icons/fa';
import Button from '../Components/ui/Button';

function Contact() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300 font-sans">

      {/* 
        Header Section 
      */}
      <div className="bg-white dark:bg-black pt-20 pb-24 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 dark:text-white tracking-tight mb-6">
            We're here to help.
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Have a question about a booking, or interested in becoming a host? Our team is available 24/7 to assist you.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Contact Info Cards */}
          <div className="md:col-span-1 space-y-4">
            {/* Key Info Card */}
            <div className="bg-slate-900 dark:bg-slate-900 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[60px] opacity-20 -mr-10 -mt-10"></div>
              <h3 className="text-xl font-bold font-display mb-6">Contact Channels</h3>

              <div className="space-y-6 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <FaPhone />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Support Line</p>
                    <p className="font-mono font-bold">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-green-400 flex-shrink-0">
                    <FaWhatsapp />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">WhatsApp</p>
                    <p className="font-mono font-bold">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-purple-400 flex-shrink-0">
                    <FaEnvelope />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Email</p>
                    <p className="font-bold underline decoration-slate-700 underline-offset-4">support@rentaldrives.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 pt-4 border-t border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-orange-400 flex-shrink-0">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Headquarters</p>
                    <p className="text-sm text-slate-300">RentalDrives Inc, Patto Plaza,<br />Panjim, Goa 403001</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-8 h-full">
              <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-6">Send us a message</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Full Name</label>
                    <input type="text" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Email Address</label>
                    <input type="email" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all" placeholder="john@example.com" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Subject</label>
                  <select className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all">
                    <option>General Inquiry</option>
                    <option>Booking Support</option>
                    <option>Host Partnership</option>
                    <option>Report an Issue</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Message</label>
                  <textarea rows="5" className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all" placeholder="How can we help you today?"></textarea>
                </div>

                <Button className="w-full md:w-auto py-3 px-8 text-lg font-bold shadow-lg shadow-blue-500/20">
                  <FaPaperPlane className="mr-2" /> Send Message
                </Button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Contact;