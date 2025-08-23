// src/pages/Login.jsx
import { useState } from "react";
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';

// The function that calls the backend for login
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
      // More specific error message for the user
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
  
  const inputBaseClass = "w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back!</h2>
          <p className="mt-2 text-gray-600">Sign in to continue to RentalDrives</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className={inputBaseClass}
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              className={inputBaseClass}
            />
          </div>

          {/* Submit Button */}
          <div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all disabled:bg-gray-400 flex items-center justify-center" 
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  <span>Logging In...</span>
                </>
              ) : (
                'Login'
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;