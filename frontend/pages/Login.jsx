import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../backend/services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response = await API.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password: password,
      });

      console.log("LOGIN SUCCESS:", response.data);

      // Save JWT token
      localStorage.setItem("token", response.data.token);

      // Save user information
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      setMessage("Login successful!");

      // Go to Dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      console.error(
        "SERVER RESPONSE:",
        error.response?.data
      );

      setMessage(
        error.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-container">

        {/* ================= LEFT BRANDING ================= */}
        <div className="login-brand">

          <div className="brand-logo">
            <div className="brand-logo-icon">
              🌱
            </div>

            <h1>Smart Farming</h1>
          </div>

          <div className="brand-content">

            <h2>
              Smart Farming.
              <br />
              <span>Better Harvest.</span>
            </h2>

            <p>
              AI-powered tools to monitor your crops,
              environment and farm health.
            </p>

            <div className="farming-features">

              <div className="farming-feature">
                <div className="farming-feature-icon">
                  🌱
                </div>
                <span>AI Crop Health Monitoring</span>
              </div>

              <div className="farming-feature">
                <div className="farming-feature-icon">
                  💧
                </div>
                <span>Smart Irrigation</span>
              </div>

              <div className="farming-feature">
                <div className="farming-feature-icon">
                  🌡️
                </div>
                <span>Environment Monitoring</span>
              </div>

              <div className="farming-feature">
                <div className="farming-feature-icon">
                  🤖
                </div>
                <span>AI-Powered Analysis</span>
              </div>

            </div>

          </div>

        </div>


        {/* ================= LOGIN SECTION ================= */}
        <div className="login-form-section">

          <div className="login-card">

            <div className="login-welcome">

              <h2>
                Welcome Back 👋
              </h2>

              <p>
                Login to access your Smart Farming dashboard.
              </p>

            </div>


            <form
              className="login-form"
              onSubmit={handleLogin}
            >

              {/* EMAIL */}
              <div className="form-group">

                <label htmlFor="email">
                  Email Address
                </label>

                <div className="input-wrapper">

                  <input
                    id="email"
                    type="email"
                    value={email}
                    placeholder="farmer@example.com"
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    required
                  />

                </div>

              </div>


              {/* PASSWORD */}
              <div className="form-group">

                <label htmlFor="password">
                  Password
                </label>

                <div className="input-wrapper">

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    placeholder="Enter your password"
                    onChange={(e) =>
                      setPassword(e.target.value)
                    }
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>

                </div>

              </div>


              {/* OPTIONS */}
              <div className="login-options">

                <label className="remember-me">

                  <input
                    type="checkbox"
                  />

                  <span>
                    Remember me
                  </span>

                </label>

                <Link
                  to="/forgot-password"
                  className="forgot-password"
                >
                  Forgot password?
                </Link>

              </div>


              {/* ERROR / SUCCESS */}
              {message && (
                <div
                  className={
                    message.toLowerCase().includes("success")
                      ? "login-success"
                      : "login-error"
                  }
                >
                  {message}
                </div>
              )}


              {/* LOGIN BUTTON */}
              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading
                  ? "Logging in..."
                  : "LOGIN →"}
              </button>

            </form>


            {/* REGISTER */}
            <div className="register-section">

              <span>
                Don't have an account?
              </span>

              <Link
                to="/register"
                className="register-link"
              >
                Create Account
              </Link>

            </div>


            {/* SECURITY */}
            <div className="security-note">
              🔒 Your farm data is securely protected
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;