import "./Login.css";
import React, { useState } from "react";
import Logosvg from "../images/GreenListLogoSVG.svg";
import User from "../images/user.svg";
import Lock from "../images/lock.svg";
import Fundo from "../images/GreenListFundo.svg";
import api from "../api";

function Login({ setIsLoggedIn, switchToSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // No componente Login, quando o login for bem-sucedido:
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await api.post("/api/users/login", {
        email,
        password
      });
      
      // Store user data and token in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify({
        id: response.data.user._id,
        name: response.data.user.name,
        email: response.data.user.email
      }));
      
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
        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? "CARREGANDO..." : "LOGIN"}
        </button>
        <a href="#" className="forgot-password" onClick={(e) => {
          e.preventDefault();
          switchToSignup();
        }}>
          Não tem uma conta? Cadastre-se
        </a>
      </form>
    </div>
  );
}

export default Login;
