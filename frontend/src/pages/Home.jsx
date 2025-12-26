// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';
import { FaShieldAlt, FaCar, FaMotorcycle, FaSearch, FaStar, FaUserCheck, FaArrowRight, FaBolt, FaLeaf, FaKey, FaHeadset } from 'react-icons/fa';
import { GiScooter, GiSteeringWheel } from 'react-icons/gi';

// --- Components ---

const StatPill = ({ icon: Icon, value, label }) => (
  <div className="flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-default">
    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
      <Icon size={16} />
    </div>
    <div>
      <div className="text-xl font-bold text-white font-mono leading-none">{value}</div>
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</div>
    </div>
  </div>
);

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
  <div
    className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-500 group animate-fade-in-up"
    style={{ animationDelay: delay }}
  >
    <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg shadow-slate-200/50 dark:shadow-black/50 mb-6">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">{desc}</p>
  </div>
);

const CategoryCard = ({ to, icon: Icon, title, subtitle, bgImage, color }) => (
  <Link to={to} className="group relative block h-[400px] w-full overflow-hidden rounded-3xl">
    <div className="absolute inset-0 bg-slate-900">
      <img src={bgImage} alt={title} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700 ease-in-out" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
    </div>

    <div className="absolute bottom-0 left-0 w-full p-8 md:p-10 z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
      <div className={`w-14 h-14 ${color} backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:-translate-y-2 transition-transform duration-500`}>
        <Icon size={28} />
      </div>
      <h3 className="text-3xl font-display font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 max-w-xs">{subtitle}</p>

      <div className="mt-6 flex items-center gap-2 text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
        Explore Inventory <FaArrowRight />
      </div>
    </div>
  </Link>
);

function Home() {
  const [scrolled, setScrolled] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-white dark:bg-[#020617] min-h-screen font-sans transition-colors duration-500 overflow-x-hidden">

      {/* 
        ------------------------------------
        🌌 CINEMATIC HERO 
        ------------------------------------
      */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950">

        {/* Animated Background Layers */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=3483&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/80 to-transparent"></div>
        </div>

        {/* Floating Blobs (Atmosphere) */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20">
          <div className="max-w-4xl">

            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in-up">
              <FaShieldAlt className="text-blue-400" /> Premium Fleet
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-8xl font-display font-bold text-white leading-[1.1] md:leading-[1] mb-8 tracking-tight animate-fade-in-up stagger-1">
              Drive the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-shimmer bg-[length:200%_auto]">Extraordinary.</span>
            </h1>

            <p className="text-lg md:text-2xl text-slate-300 max-w-2xl mb-12 font-light leading-relaxed animate-fade-in-up stagger-2">
              Experience Goa's finest collection of cars, bikes, and scooters. Verified hosts, transparent pricing, and instant booking.
            </p>

            {/* Quick Benefits (Not Fake Stats) */}
            <div className="flex flex-wrap gap-4 mb-12 animate-fade-in-up stagger-3">
              <StatPill icon={FaShieldAlt} value="100%" label="Verified Hosts" />
              <StatPill icon={FaBolt} value="Instant" label="Booking" />
              <StatPill icon={FaHeadset} value="24/7" label="Support" />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up stagger-4">
              <Button to="/cars" variant="primary" className="h-16 px-10 text-xl shadow-2xl shadow-blue-600/30 rounded-full">
                Find Your Vehicle <FaArrowRight className="ml-3" />
              </Button>
              <Button to="/scooters" variant="secondary" className="h-16 px-10 text-xl border-white/20 text-white hover:bg-white/10 rounded-full bg-transparent backdrop-blur-sm">
                Rent Two-Wheeler
              </Button>
            </div>

          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce">
          <span className="text-[10px] uppercase tracking-widest text-white">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </section>

      {/* 
        ------------------------------------
        🏎️ IMMERSIVE CATEGORIES
        ------------------------------------
      */}
      <section className="py-32 bg-slate-50 dark:bg-[#020617] relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-4">Choose your companion</h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl">From rugged SUVs for the ghats to breezy scooters for the coast, we have it all.</p>
            </div>
            <Button to="/cars" variant="ghost" className="hidden md:flex">View Full Fleet &rarr;</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CategoryCard
              to="/cars"
              title="Super Cars & SUVs"
              subtitle="Command the road with premium comfort and power."
              icon={FaCar}
              bgImage="https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=3000&auto=format&fit=crop"
              color="bg-blue-600/90"
            />
            <CategoryCard
              to="/bikes"
              title="Cruiser Bikes"
              subtitle="Experience the wind in your hair with iconic motorcycles."
              icon={FaMotorcycle}
              bgImage="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=3000&auto=format&fit=crop"
              color="bg-orange-600/90"
            />
            <CategoryCard
              to="/scooters"
              title="City Scooters"
              subtitle="Zip through traffic and park anywhere with ease."
              icon={GiScooter}
              bgImage="https://images.unsplash.com/photo-1621994640093-41bb333e7920?q=80&w=3000&auto=format&fit=crop"
              color="bg-teal-600/90"
            />
          </div>
        </div>
      </section>

      {/* 
        ------------------------------------
        ✨ FEATURES (Parallax Style)
        ------------------------------------
      */}
      <section className="py-32 bg-white dark:bg-slate-900 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-slate-100 dark:bg-slate-800/30 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Badge variant="brand" className="mb-6">THE RENTALDRIVES STANDARD</Badge>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6">Uncompromising Quality.</h2>
            <p className="text-xl text-slate-500 dark:text-slate-400">We don't just list vehicles; we curate experiences. Every details is vetted for your peace of mind.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={FaShieldAlt}
              title="Verified Hosts"
              desc="Every host undergoes a rigorous 3-step identity verification process."
              delay="0ms"
            />
            <FeatureCard
              icon={FaBolt}
              title="Instant Booking"
              desc="No waiting for approvals. Book instantly and get moving."
              delay="100ms"
            />
            <FeatureCard
              icon={FaKey}
              title="Keyless Entry"
              desc="Select vehicles support smart unlocking via our mobile app."
              delay="200ms"
            />
            <FeatureCard
              icon={FaLeaf}
              title="Green Fleet"
              desc="Browse our growing collection of EV cars and scooters."
              delay="300ms"
            />
          </div>
        </div>
      </section>

      {/* 
        ------------------------------------
        🚀 HOST CTA (Dark Mode Contrast)
        ------------------------------------
      */}
      <section className="py-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-[3rem] overflow-hidden bg-slate-900">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493238792015-1a419acdc924?q=80&w=3534&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>

            <div className="relative z-10 p-12 md:p-24 max-w-3xl">
              <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">Turn your idle car <br /> into <span className="text-blue-500">active income.</span></h2>
              <p className="text-xl text-slate-300 mb-10 leading-relaxed">
                Join thousands of hosts earning up to ₹50,000/month. We handle the insurance, payments, and verification. You just hand over the keys.
              </p>
              <Button to="/signup" variant="primary" className="h-14 px-8 text-lg bg-white text-slate-900 hover:bg-slate-100 shadow-none border-none">
                Become a Host
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer for Footer */}
      <div className="h-24"></div>

    </div>
  );
}

export default Home;