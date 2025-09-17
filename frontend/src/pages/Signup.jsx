// src/pages/Signup.jsx
import { useState } from "react";
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaCar, FaWalking } from 'react-icons/fa';

// UPDATED: This function now calls Supabase directly from the frontend.
// This is what allows for the automatic login session to be created.
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
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: signUpUser,
    onSuccess: () => {
      alert("Signup successful! Please check your email to verify your account.");
      // UPDATED: Navigate to the homepage, as the user is now logged in.
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
  
  const inputBaseClass = "w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Create Your Account</h2>
          <p className="mt-2 text-gray-600">Join RentalDrives to start your adventure</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I want to:</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('tourist')}
                className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                  role === 'tourist' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                <FaWalking className={`h-6 w-6 mb-2 ${role === 'tourist' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="font-semibold">Rent a Vehicle</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('host')}
                className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                  role === 'host' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}
              >
                <FaCar className={`h-6 w-6 mb-2 ${role === 'host' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="font-semibold">List a Vehicle</span>
              </button>
            </div>
          </div>

          {/* Form Inputs remain the same... */}
          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={inputBaseClass}/>
          </div>
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputBaseClass}/>
          </div>
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputBaseClass} minLength="6"/>
          </div>

          {/* NEW: Terms of Service Checkbox */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-500">
                I agree to the{' '}
                <Link to="/terms" target="_blank" className="font-medium text-blue-600 hover:underline">
                  Terms of Service
                </Link>
              </label>
            </div>
          </div>
          
          {/* Submit Button */}
          <div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed" 
              // UPDATED: Button is disabled if terms are not agreed to
              disabled={mutation.isPending || !agreedToTerms}
            >
              {mutation.isPending ? 'Creating Account...' : 'Sign Up'}
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

