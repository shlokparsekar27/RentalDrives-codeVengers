// src/pages/Contact.jsx
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaWhatsapp } from 'react-icons/fa';
import Button from '../Components/ui/Button';

function Contact() {
  return (
    <div className="bg-slate-50 dark:bg-[#020617] min-h-screen transition-colors duration-500 font-sans">

      {/* 
        Header Section 
      */}
      <div className="relative bg-slate-900 dark:bg-black min-h-[50vh] flex items-center overflow-hidden">
        {/* Abstract Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[140px] animate-blob pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[140px] animate-blob animation-delay-2000 pointer-events-none"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white tracking-tight mb-6">
            We're here to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">help.</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
            Have a question about a booking, or interested in becoming a host? Our dedicated support team is available 24/7.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20 pb-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6 animate-fade-in-up stagger-1">
            {/* Key Info Card */}
            <div className="glass-card bg-slate-900 dark:bg-slate-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-slate-700">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full blur-[80px] opacity-20 -mr-10 -mt-10"></div>

              <h3 className="text-xl font-bold font-display mb-8">Direct Channels</h3>

              <div className="space-y-8 relative z-10">
                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-blue-400 flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
                    <FaPhone size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Support Line</p>
                    <p className="font-mono font-bold text-lg">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-green-400 flex-shrink-0 group-hover:bg-green-600 group-hover:text-white transition-all duration-300 shadow-inner">
                    <FaWhatsapp size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">WhatsApp</p>
                    <p className="font-mono font-bold text-lg">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-purple-400 flex-shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-inner">
                    <FaEnvelope size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email</p>
                    <p className="font-bold text-sm underline decoration-slate-700 underline-offset-4 hover:text-purple-400 transition-colors cursor-pointer">support@rentaldrives.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-5 pt-6 border-t border-slate-800 group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-orange-400 flex-shrink-0 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 shadow-inner">
                    <FaMapMarkerAlt size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Headquarters</p>
                    <p className="text-sm text-slate-300 leading-relaxed">RentalDrives Inc, Patto Plaza,<br />Panjim, Goa 403001</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 animate-fade-in-up stagger-2">
            <div className="glass bg-white dark:bg-slate-900/50 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 h-full">
              <h3 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-2">Send us a message</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8">We usually respond within 2 hours.</p>

              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-500 tracking-wider ml-1">Full Name</label>
                    <input
                      type="text"
                      className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-medium transition-all placeholder-slate-400"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-500 tracking-wider ml-1">Email Address</label>
                    <input
                      type="email"
                      className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-medium transition-all placeholder-slate-400"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-500 tracking-wider ml-1">Subject</label>
                  <div className="relative">
                    <select className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-medium transition-all appearance-none cursor-pointer">
                      <option>General Inquiry</option>
                      <option>Booking Support</option>
                      <option>Host Partnership</option>
                      <option>Report an Issue</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      ▼
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-500 tracking-wider ml-1">Message</label>
                  <textarea
                    rows="5"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white font-medium transition-all placeholder-slate-400 resize-none"
                    placeholder="How can we help you today?"
                  ></textarea>
                </div>

                <Button className="w-full md:w-auto py-4 px-10 text-lg font-bold shadow-xl shadow-blue-600/20 rounded-xl" size="lg">
                  <FaPaperPlane className="mr-3" /> Send Message
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