import "./Login.css";
import React, { useState } from "react";
import Logosvg from "../images/GreenListLogoSVG.svg";
import User from "../images/user.svg";
import Lock from "../images/lock.svg";

function Signup({ setIsLoggedIn, switchToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();

    // Validate inputs
    if (!username) {
      setError("Por favor, digite seu nome de usuário");
      return;
    }

    if (!email) {
      setError("Por favor, digite seu e-mail");
      return;
    }

    if (!password) {
      setError("Por favor, digite sua senha");
      return;
    }

    if (!confirmPassword) {
      setError("Por favor, confirme sua senha");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, digite um e-mail válido");
      return;
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    // In a real app, you would send this data to your backend
    // For demo purposes, let's just simulate a successful signup
    setError("");
    setIsLoggedIn(true);
  };

  return (
    <div className="login-container">
      <div className="login-logo">
        {/* Logo */}
        <img src={Logosvg} alt="Logo" className="logo-image" />
      </div>
      <form onSubmit={handleSignup} className="login-form">
        {error && <div className="error-message">{error}</div>}
        <div className="input-group">
          <div className="input-wrapper">
            <img src={User} alt="User icon" className="input-icon" />
            <input
              type="text"
              placeholder="NOME DE USUÁRIO"
              className="login-input with-icon"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>
        <div className="input-group">
          <div className="input-wrapper">
            <img src={User} alt="User icon" className="input-icon" />
            <input
              type="email"
              placeholder="E-MAIL"
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
              placeholder="SENHA"
              className="login-input with-icon"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <div className="input-group">
          <div className="input-wrapper">
            <img src={Lock} alt="Lock icon" className="input-icon" />
            <input
              type="password"
              placeholder="CONFIRMAR SENHA"
              className="login-input with-icon"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="login-button">
          CRIAR CONTA
        </button>
        <a href="#" className="forgot-password" onClick={(e) => {
          e.preventDefault();
          switchToLogin();
        }}>
          Já tem uma conta? Faça login
        </a>
      </form>
    </div>
  );
}

export default Signup;
