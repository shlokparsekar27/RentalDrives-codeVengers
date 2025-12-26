// src/pages/Login.jsx
import { useState } from "react";
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaArrowRight, FaShieldAlt } from 'react-icons/fa';
import Button from '../Components/ui/Button';

// --- API ---
const signInUser = async ({ email, password }) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to login');
  }
  const data = await response.json();
  const { error } = await supabase.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
  if (error) throw error;
  return data;
};

// --- Page ---
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: signInUser,
    onSuccess: () => navigate('/'),
    onError: (error) => alert(error.message.includes('Invalid') ? 'Invalid credentials' : error.message)
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] flex font-sans transition-colors duration-500">

      {/* 
        Marketing Panel (Desktop) with Parallax Glow
      */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
        {/* Animated Background Layers */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=3483&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay scale-110 animate-shimmer"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-slate-900/90 to-blue-900/20"></div>

        {/* Floating Blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px] animate-blob"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>

        <div className="relative z-10 max-w-xl p-12">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center mb-10 shadow-2xl">
            <FaShieldAlt className="text-3xl text-blue-400" />
          </div>
          <h1 className="text-6xl font-display font-bold text-white mb-6 leading-tight tracking-tight">
            Secure <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Mobility.</span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-md">
            Join the premium network of verified hosts and travelers. Experience seamless vehicle rentals with bank-grade security.
          </p>
        </div>
      </div>

      {/* 
        Login Interaction Area 
      */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative">
        <div className="w-full max-w-md animate-fade-in-up">

          <div className="mb-10">
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Welcome back</h2>
            <p className="text-slate-500 dark:text-slate-400">Please verify your identity to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">

              {/* Email Field with Floating Label feel */}
              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1 transition-colors group-focus-within:text-blue-500">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 transition-colors group-focus-within:text-blue-500">
                    <FaEnvelope />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1 transition-colors group-focus-within:text-blue-500">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 transition-colors group-focus-within:text-blue-500">
                    <FaLock />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">Remember device</span>
              </label>
              <a href="#" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">Forgot Password?</a>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full justify-center py-4 text-lg shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-95 transition-all"
              isLoading={mutation.isPending}
            >
              {mutation.isPending ? 'Verifying...' : 'Sign In Securely'} <FaArrowRight className="ml-2" />
            </Button>
          </form>

          <div className="mt-12 text-center border-t border-slate-100 dark:border-slate-800 pt-8">
            <p className="text-slate-500 dark:text-slate-400">
              New to RentalDrives?{' '}
              <Link to="/signup" className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors underline decoration-slate-200 dark:decoration-slate-700 underline-offset-4">
                Create an account
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Login;