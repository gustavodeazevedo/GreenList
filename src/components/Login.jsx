import "./Login.css";
import React, { useState } from "react";
import Logosvg from "../images/GreenListLogoSVG.svg";
import User from "../images/user.svg";
import Lock from "../images/lock.svg";
import Fundo from "../images/GreenListFundo.svg";

function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // Validate inputs
    if (!email && !password) {
      setError("Por favor, digite seu e-mail e senha");
      return;
    }

    if (!email) {
      setError("Por favor, entre com seu e-mail");
      return;
    }

    if (!password) {
      setError("Por favor , digite sua senha");
      return;
    }

    // Simple validation - in a real app, you would check against a database
    // For demo purposes, let's use a simple check
    if (email === "user@example.com" && password === "password") {
      // Successful login
      setError("");
      setIsLoggedIn(true);
    } else {
      setError("E-mail ou senha incorretos");
    }
  };

  return (
    <div className="login-container">
      <div className="login-logo">
        {/* Logo */}
        <img src={Logosvg} alt="Logo" className="logo-image" />
      </div>
      <form onSubmit={handleLogin} className="login-form">
        {error && <div className="error-message">{error}</div>}
        <div className="input-group">
          <div className="input-wrapper">
            <img src={User} alt="User icon" className="input-icon" />
            <input
              type="text"
              placeholder="USERNAME"
              className="login-input with-icon"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className="input-group">
          <div className="input-wrapper">
            <img src={Lock} alt="Lock icon" className="input-icon" />
            <input
              type="password"
              placeholder="PASSWORD"
              className="login-input with-icon"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="login-button">
          LOGIN
        </button>
        <a href="#" className="forgot-password">
          Forgot password?
        </a>
      </form>
    </div>
  );
}

export default Login;
