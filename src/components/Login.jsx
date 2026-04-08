import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../api/API";
import logo from "@assets/Immpression_Logo_Transparent.png";
import ImmpressionLogo from "@assets/Immpression.png";
import { useAuth } from "@/context/authContext";
import "@styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, msg, setMsg } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginAdmin(email, password);
      login(response.token, response.email);
      navigate("/home");
    } catch (err) {
      setMsg({ type: "error", message: err.message });
    }
  };

  return (
    <div className="lg-page">
      {/* ─── Left brand panel ─── */}
      <div className="lg-brand">
        <div className="lg-brand-top">
          <img src={logo} alt="Immpression" className="lg-brand-logo" />
          <img src={ImmpressionLogo} alt="Immpression" className="lg-brand-wordmark" />
          <p className="lg-brand-tagline">
            Internal admin dashboard for managing artworks, users, orders, and platform operations.
          </p>
        </div>
        <span className="lg-brand-bottom">Immpression &copy; {new Date().getFullYear()}</span>
      </div>

      {/* ─── Right form panel ─── */}
      <div className="lg-form-panel">
        <div className="lg-form-box">
          <div className="lg-form-heading">
            <h1 className="lg-form-title">Admin Login</h1>
            <p className="lg-form-subtitle">Sign in to access the dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="lg-fields">
            <div className="lg-field">
              <label className="lg-label" htmlFor="lg-email">Email</label>
              <input
                id="lg-email"
                type="email"
                className="lg-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="lg-field">
              <label className="lg-label" htmlFor="lg-password">Password</label>
              <input
                id="lg-password"
                type="password"
                className="lg-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {msg && (
              <div className={msg.type === "error" ? "lg-error" : "lg-success"}>
                {msg.message}
              </div>
            )}

            <button type="submit" className="lg-submit">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
