// src/pages/Login.jsx
import { useState } from "react";
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
import Button from '../Components/ui/Button';

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

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: signInUser,
    onSuccess: () => {
      navigate('/');
    },
    onError: (error) => {
      const message = error.message.includes('Invalid login credentials')
        ? 'Invalid email or password. Please try again.'
        : `Error: ${error.message}`;
      alert(message);
    }
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex transition-colors duration-300">
      {/* 
        🖼️ Left Side: Brand Image / Marketing 
        Hidden on mobile, visible on lg screens
      */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=3483&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-900/80 to-transparent"></div>
        <div className="relative z-10 p-16 text-white max-w-xl">
          <div className="mb-8 p-3 bg-white/10 backdrop-blur-md rounded-xl inline-block border border-white/20">
            <img src="/car.jpg" className="w-8 h-8 rounded-full" alt="Logo" />
          </div>
          <h1 className="text-5xl font-display font-bold mb-6 leading-tight">Explore Goa,<br />Uninterrupted.</h1>
          <p className="text-xl text-slate-300 leading-relaxed font-light">
            Join the community of verified hosts and travelers. Experience the freedom of the road with zero hidden fees.
          </p>
        </div>
      </div>

      {/* 
        📝 Right Side: Login Form 
      */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-950">
        <div className="max-w-md w-full">
          <div className="text-center lg:text-left mb-10">
            <Link to="/" className="inline-block lg:hidden text-2xl font-display font-bold text-slate-900 dark:text-white mb-8">RentalDrives</Link>
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mt-4">Welcome back</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">Enter your access credentials to continue.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FaEnvelope />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all placeholder-slate-400 text-slate-900 dark:text-white font-medium"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FaLock />
                </div>
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-slate-900 dark:focus:ring-white outline-none transition-all placeholder-slate-400 text-slate-900 dark:text-white font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-slate-900" />
                <span className="ml-2 text-sm text-slate-600 dark:text-slate-400 font-medium">Remember me</span>
              </label>
              <a href="#" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">Forgot password?</a>
            </div>

            <Button
              type="submit"
              className="w-full py-3.5 justify-center text-base font-bold shadow-lg shadow-blue-500/20"
              size="lg"
              isLoading={mutation.isPending}
            >
              {mutation.isPending ? 'Authenticating...' : 'Sign In'} <FaArrowRight className="ml-2 group-hover:translate-x-1" />
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400 font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;