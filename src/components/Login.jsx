import "./Login.css";
import React, { useState } from "react";
import Logosvg from "../images/GreenListLogoSVG.svg";
import User from "../images/user.svg";
import Lock from "../images/lock.svg";
import Fundo from "../images/GreenListNewFundo.svg";
import api from "../api";
import ForgotPassword from "./ForgotPassword";
import Signup from "./Signup";

function Login({ setIsLoggedIn, switchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // No componente Login, quando o login for bem-sucedido:
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/api/users/login", {
        email,
        password,
      });

      // Store user data and token in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: response.data._id,
          name: response.data.name,
          email: response.data.email,
        })
      );

      setIsLoading(false);

      // Update the parent component's state
      setIsLoggedIn(true);

      // Force a page reload to ensure state is updated
      window.location.href = "/";
    } catch (error) {
      setIsLoading(false);
      setError(error.response?.data?.message || "Erro ao fazer login");
    }
  };

  if (showForgotPassword) {
    return (
      <ForgotPassword switchToLogin={() => setShowForgotPassword(false)} />
    );
  }

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
              placeholder="E-MAIL"
              className="login-input with-icon"
              style={{ animationDelay: "1.8s" }}
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
              style={{ animationDelay: "2.0s" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? "CARREGANDO..." : "LOGIN"}
        </button>
        <div className="links-container">
          <a
            href="#"
            className="forgot-password"
            onClick={(e) => {
              e.preventDefault();
              setShowForgotPassword(true);
            }}
          >
            Esqueci minha senha
          </a>
          <a
            href="#"
            className="forgot-password"
            onClick={(e) => {
              e.preventDefault();
              switchToSignup();
            }}
          >
            Não tem uma conta? Cadastre-se
          </a>
        </div>
      </form>
    </div>
  );
}

export default Login;
