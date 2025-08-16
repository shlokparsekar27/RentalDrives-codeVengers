import "../styles/Auth.css";

function Signup() {
  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      <form className="auth-form">
        <label>Full Name</label>
        <input type="text" placeholder="Enter your full name" required />

        <label>Phone Number</label>
        <input type="tel" placeholder="Enter phone number" required />

        <label>Email Address</label>
        <input type="email" placeholder="Enter email" required />

        <label>Password</label>
        <input type="password" placeholder="Enter password" required />

        <label>State</label>
        <input type="text" placeholder="Enter your state" required />

        <label>Country</label>
        <select required>
          <option value="">Select Country</option>
          <option>India</option>
          <option>USA</option>
          <option>UK</option>
          <option>Canada</option>
          <option>Australia</option>
        </select>

        <button type="submit" className="auth-btn">Sign Up</button>
      </form>

      <div className="auth-footer">
        Already have an account? <a href="/login">Login here</a>
      </div>
    </div>
  );
}

export default Signup;
