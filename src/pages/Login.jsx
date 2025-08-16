import "../styles/Auth.css";

function Login() {
  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form className="auth-form">
        <label>Email or Phone</label>
        <input type="text" placeholder="Enter email or phone" required />

        <label>Password</label>
        <input type="password" placeholder="Enter password" required />

        <button type="submit" className="auth-btn">Login</button>
      </form>

      <div className="auth-footer">
        Don't have an account? <a href="/signup">Sign up here</a>
      </div>
    </div>
  );
}

export default Login;
