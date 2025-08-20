// src/pages/Signup.jsx
import { useState } from "react";
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import "../styles/Auth.css";

// The function that calls the backend
const signUpUser = async ({ email, password, fullName }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'tourist' // All new users are tourists, as we decided
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

  const mutation = useMutation({
    mutationFn: signUpUser,
    onSuccess: () => {
      alert("Signup successful! Please check your email to confirm your account.");
    },
    onError: (error) => {
      alert(`Error signing up: ${error.message}`);
    }
  });

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent the form from reloading the page
    mutation.mutate({ email, password, fullName });
  };

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input 
          type="text" 
          placeholder="Enter your full name" 
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required 
        />

        <label>Email Address</label>
        <input 
          type="email" 
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />

        <label>Password</label>
        <input 
          type="password" 
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />

        <button type="submit" className="auth-btn" disabled={mutation.isPending}>
          {mutation.isPending ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account? <a href="/login">Login here</a>
      </div>
    </div>
  );
}

export default Signup;