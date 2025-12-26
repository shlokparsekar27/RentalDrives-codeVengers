// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import { FaShieldAlt, FaCar, FaMotorcycle, FaSearch, FaStar, FaUserCheck, FaArrowRight } from 'react-icons/fa';
import { GiScooter } from 'react-icons/gi';

function Home() {
  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen transition-colors duration-300 font-sans">
      {/* 
        ------------------------------------
        🦸‍♂️ HERO SECTION - Redesigned for Authority
        ------------------------------------
      */}
      <section className="relative pt-32 pb-40 overflow-hidden bg-slate-50 dark:bg-black border-b border-slate-200 dark:border-slate-800">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">

            {/* Trust Pill - Minimalist */}
            <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-1.5 shadow-sm mb-8 animate-enter opacity-0">
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Verified Marketplace</span>
            </div>

            {/* Main Heading - Solid, Heavy, Professional */}
            <h1 className="text-6xl sm:text-7xl font-display font-bold text-slate-900 dark:text-white tracking-tight leading-[1.05] mb-8 animate-enter opacity-0 text-balance" style={{ animationDelay: '0.1s' }}>
              The standard for <br className="hidden sm:block" /> vehicle rentals in Goa.
            </h1>

            {/* Subheading - High Clarity */}
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-enter opacity-0 text-balance" style={{ animationDelay: '0.2s' }}>
              Book premium cars, bikes, and scooters directly from verified local owners. Transparent pricing, instant insurance coverage, and 24/7 support.
            </p>

            {/* CTA Group - Action Oriented */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-enter opacity-0" style={{ animationDelay: '0.3s' }}>
              <Button to="/cars" variant="primary" size="lg" className="h-14 px-8 text-lg w-full sm:w-auto shadow-xl shadow-blue-600/10">
                Start Booking
                <FaArrowRight className="ml-2 text-sm" />
              </Button>
              <Button to="/about" variant="outline" size="lg" className="h-14 px-8 text-lg w-full sm:w-auto bg-white dark:bg-transparent">
                How it works
              </Button>
            </div>

            {/* Social Proof Line */}
            <div className="mt-12 flex items-center justify-center gap-6 text-slate-400 dark:text-slate-500 text-sm font-medium animate-enter opacity-0" style={{ animationDelay: '0.4s' }}>
              <span className="flex items-center gap-2"><FaUserCheck /> 5,000+ Verified Users</span>
              <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
              <span className="flex items-center gap-2"><FaShieldAlt /> ₹10L Insurance Cover</span>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ------------------------------------
        🔍 CATEGORY GRID - Functional & Clean
        ------------------------------------
      */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Cars */}
          <Link to="/cars" className="group">
            <Card hover className="h-full border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <FaCar size={24} />
                </div>
                <FaArrowRight className="text-slate-300 group-hover:text-blue-600 transition-colors -rotate-45 group-hover:rotate-0 duration-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Cars & SUVs</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Comfortable hatchbacks, sedans to luxury SUVs for family trips.</p>
            </Card>
          </Link>

          {/* Card 2: Bikes */}
          <Link to="/bikes" className="group">
            <Card hover className="h-full border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
                  <FaMotorcycle size={24} />
                </div>
                <FaArrowRight className="text-slate-300 group-hover:text-teal-600 transition-colors -rotate-45 group-hover:rotate-0 duration-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Motorcycles</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Royal Enfields and sports bikes for the ultimate road trip.</p>
            </Card>
          </Link>

          {/* Card 3: Scooters */}
          <Link to="/scooters" className="group">
            <Card hover className="h-full border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                  <GiScooter size={28} />
                </div>
                <FaArrowRight className="text-slate-300 group-hover:text-amber-600 transition-colors -rotate-45 group-hover:rotate-0 duration-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Scooters</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Efficient and iconic scooters to zip through narrow lanes.</p>
            </Card>
          </Link>
        </div>
      </div>

      {/* 
        ------------------------------------
        🛡️ VALUE PROPOSITION - Trust & Safety
        ------------------------------------
      */}
      <section className="py-32 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">The RentalDrives Standard</h2>
              <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white">Safety and transparency built into every booking.</h3>
            </div>
            <Button to="/about" variant="ghost" className="hidden md:flex">Read our full safety policy &rarr;</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-12">
            <div>
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                <FaUserCheck size={20} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Identity Verification</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">Every host and renter must pass a government ID check before they can transact. This creates a circle of trust.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                <FaShieldAlt size={20} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">Secure Escrow Payments</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">We hold your payment securely until the vehicle is handed over. No cash risks, no last-minute price hikes.</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/50 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                <FaSearch size={20} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-3">24/7 Roadside Support</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">In the rare event of a breakdown, our network of local mechanics is available 24/7 to get you back on the road.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ------------------------------------
        📊 STATS / FOOTER CTA
        ------------------------------------
      */}
      <section className="py-24 bg-slate-50 dark:bg-black border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4">Ready to start your journey?</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xl mx-auto">Join thousands of travelers who have explored Goa on their own terms.</p>
          <Button to="/cars" variant="primary" size="lg" className="h-12 px-8">Browse Inventory</Button>
        </div>
      </section>
    </div>
  );
}

export default Home;