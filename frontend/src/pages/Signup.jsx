// src/pages/Signup.jsx
import { useState } from "react";
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaCar, FaUserAlt, FaCheck, FaArrowRight } from 'react-icons/fa';
import Button from '../Components/ui/Button';

// API Function
const signUpUser = async ({ email, password, fullName, role }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      }
    }
  });

  if (error) {
    throw error;
  }

  return data;
};

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('tourist');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: signUpUser,
    onSuccess: () => {
      alert("Signup successful! Welcome to RentalDrives.");
      navigate('/');
    },
    onError: (error) => {
      alert(`Error signing up: ${error.message}`);
    }
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate({ email, password, fullName, role });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-row-reverse transition-colors duration-300">

      {/* 
        🖼️ Right Side: Brand Image / Marketing 
      */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1549563319-3c72b535d4b8?q=80&w=3387&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-slate-900 via-slate-900/80 to-transparent"></div>
        <div className="relative z-10 p-16 text-white max-w-xl">
          <div className="mb-8 p-3 bg-white/10 backdrop-blur-md rounded-xl inline-block border border-white/20">
            <img src="/car.jpg" className="w-8 h-8 rounded-full" alt="Logo" />
          </div>
          <h1 className="text-5xl font-display font-bold mb-8 leading-tight">Start your journey today.</h1>
          <ul className="space-y-6 text-lg text-slate-300">
            <li className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><FaCheck size={14} /></div>
              <span className="font-medium">Best prices market-wide</span>
            </li>
            <li className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><FaCheck size={14} /></div>
              <span className="font-medium">Verified hosts & vehicles</span>
            </li>
            <li className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><FaCheck size={14} /></div>
              <span className="font-medium">24/7 Roadside support included</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 
        📝 Left Side: Signup Form 
      */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-950">
        <div className="max-w-md w-full">
          <div className="text-center lg:text-left mb-8">
            <Link to="/" className="inline-block lg:hidden text-2xl font-display font-bold text-slate-900 dark:text-white mb-8">RentalDrives</Link>
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mt-4">Create an account</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Get started for free. No credit card required.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Role Toggle */}
            <div className="p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex mb-6">
              <button
                type="button"
                onClick={() => setRole('tourist')}
                className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-bold transition-all ${role === 'tourist' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <FaUserAlt className="mr-2" /> I want to Rent
              </button>
              <button
                type="button"
                onClick={() => setRole('host')}
                className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-bold transition-all ${role === 'host' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <FaCar className="mr-2" /> I want to Host
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><FaUser /></div>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all placeholder-slate-400 text-slate-900 dark:text-white font-medium" placeholder="John Doe" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><FaEnvelope /></div>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all placeholder-slate-400 text-slate-900 dark:text-white font-medium" placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><FaLock /></div>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all placeholder-slate-400 text-slate-900 dark:text-white font-medium" placeholder="••••••••" minLength="6" />
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">Must be at least 6 characters.</p>
            </div>

            <div className="flex items-start mt-2">
              <div className="flex items-center h-5">
                <input id="terms" type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="focus:ring-slate-900 dark:focus:ring-slate-400 h-4 w-4 text-slate-900 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 rounded" />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-slate-500 dark:text-slate-400 font-medium">
                  I agree to the <Link to="/terms" className="font-bold text-slate-900 dark:text-white hover:underline">Terms of Service</Link> and Privacy Policy.
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full py-3.5 justify-center text-base font-bold shadow-lg shadow-blue-500/20 mt-4"
              size="lg"
              disabled={!agreedToTerms || mutation.isPending}
              isLoading={mutation.isPending}
            >
              Create Account <FaArrowRight className="ml-2 group-hover:translate-x-1" />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
