// src/pages/Login.jsx
import { useState } from "react";
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import "../styles/Auth.css";

// The function that calls the backend for login
const signInUser = async ({ email, password }) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  const mutation = useMutation({
    mutationFn: signInUser,
    onSuccess: () => {
      // On successful login, redirect the user to the homepage
      navigate('/'); 
    },
    onError: (error) => {
      alert(`Error logging in: ${error.message}`);
    }
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
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
          {mutation.isPending ? 'Logging In...' : 'Login'}
        </button>
      </form>

      <div className="auth-footer">
        Don't have an account? <a href="/signup">Sign up here</a>
      </div>
    </div>
  );
}

export default Login;