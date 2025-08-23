// src/pages/Signup.jsx
import { useState } from "react";
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock } from 'react-icons/fa';

// The function that calls the backend
const signUpUser = async ({ email, password, fullName }) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, full_name: fullName }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to sign up');
  }

  return response.json();
};


function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: signUpUser,
    onSuccess: () => {
      alert("Signup successful! Please check your email to verify your account. If you don't see it, check your spam folder.");
      navigate('/login'); // Redirect to login page after signup
    },
    onError: (error) => {
      alert(`Error signing up: ${error.message}`);
    }
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate({ email, password, fullName });
  };
  
  const inputBaseClass = "w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Create Your Account</h2>
          <p className="mt-2 text-gray-600">Join RentalDrives to start your adventure</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Full Name Input */}
          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Full name" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required 
              className={inputBaseClass}
            />
          </div>

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
              minLength="6" // Good practice to enforce a minimum password length
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
                  <span>Creating Account...</span>
                </>
              ) : (
                'Sign Up'
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;