// src/pages/Signup.jsx
import { useState } from "react";
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaCheck, FaArrowRight, FaCar, FaUserAstronaut } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Badge from '../Components/ui/Badge';

// --- API ---
const signUpUser = async ({ email, password, fullName, role }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role: role }
    }
  });
  if (error) throw error;
  return data;
};

// --- Sub-components ---
const FeatureItem = ({ text }) => (
  <div className="flex items-center gap-4 text-slate-300">
    <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
      <FaCheck size={12} />
    </div>
    <span className="font-medium text-lg">{text}</span>
  </div>
);

const RoleCard = ({ active, onClick, icon: Icon, title, desc }) => (
  <div
    onClick={onClick}
    className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 ${active
        ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-500 ring-1 ring-blue-500 relative z-10'
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
      }`}
  >
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${active ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
      <Icon />
    </div>
    <div className="flex-1">
      <h4 className={`font-bold text-sm ${active ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>{title}</h4>
      <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
    </div>
    {active && <div className="text-blue-500"><FaCheck /></div>}
  </div>
);

function Signup() {
  const [formData, setFormData] = useState({ email: '', password: '', fullName: '', role: 'tourist' });
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: signUpUser,
    onSuccess: () => { alert("Account created! Welcome to the future of rentals."); navigate('/'); },
    onError: (e) => alert(`Registration failed: ${e.message}`)
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] flex transition-colors duration-500 font-sans">

      {/* Interaction Side - Left on Signup */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative overflow-y-auto">
        <div className="w-full max-w-lg animate-fade-in-up space-y-8">

          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-display font-bold text-slate-900 dark:text-white mb-2">Create Account</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">Join the world's most trusted rental community.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Role Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">I want to...</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <RoleCard
                  active={formData.role === 'tourist'}
                  onClick={() => setFormData({ ...formData, role: 'tourist' })}
                  icon={FaUserAstronaut}
                  title="Rent a Vehicle"
                  desc="Browse & book instantly"
                />
                <RoleCard
                  active={formData.role === 'host'}
                  onClick={() => setFormData({ ...formData, role: 'host' })}
                  icon={FaCar}
                  title="Become a Host"
                  desc="Earn from your car"
                />
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
                  <input type="text" required value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="input-field w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" placeholder="e.g. Alex Morgan" />
                </div>
              </div>
              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" placeholder="name@example.com" />
                </div>
              </div>
              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
                  <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-field w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all" placeholder="Min. 8 characters" minLength={8} />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center mt-0.5">
                  <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="peer sr-only" />
                  <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
                  <FaCheck className="absolute top-0.5 left-0.5 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400 leading-snug">
                  I agree to the <Link to="/terms" className="text-blue-600 font-bold hover:underline">Terms of Service</Link> and acknowledge the Privacy Policy.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full justify-center py-4 text-lg shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-95 transition-all"
              disabled={!agreed || mutation.isPending}
              isLoading={mutation.isPending}
            >
              {mutation.isPending ? 'Creating Account...' : 'Get Started Now'} <FaArrowRight className="ml-2" />
            </Button>
          </form>

          <div className="text-center">
            <p className="text-slate-500 dark:text-slate-400">
              Already a member? <Link to="/login" className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 underline decoration-slate-200 dark:decoration-slate-700 underline-offset-4">Sign in</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Brand Side - Right on Signup */}
      <div className="hidden lg:flex w-[45%] bg-slate-950 relative overflow-hidden items-center p-12">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1549563319-3c72b535d4b8?q=80&w=3387&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-900/40"></div>

        {/* Content */}
        <div className="relative z-10 max-w-md">
          <Badge variant="brand" className="mb-8 bg-blue-600 border-none text-white px-4 py-1.5 text-xs tracking-widest">JOIN THE REVOLUTION</Badge>
          <h2 className="text-5xl font-display font-bold text-white mb-8 leading-tight">
            Your journey <br /> starts <span className="text-blue-500">here.</span>
          </h2>
          <div className="space-y-6">
            <FeatureItem text="Verified Hosts Only" />
            <FeatureItem text="Zero Hidden Fees" />
            <FeatureItem text="24/7 Roadside Assist" />
            <FeatureItem text="Secure Payments" />
          </div>
        </div>
      </div>

    </div>
  );
}

export default Signup;
