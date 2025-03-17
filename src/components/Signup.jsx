import "./Login.css";
import React, { useState } from "react";
import Logosvg from "../images/GreenListLogoSVG.svg";
import User from "../images/user.svg";
import Lock from "../images/lock.svg";
import axios from "axios";

function Signup({ setIsLoggedIn, switchToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // No componente Signup, quando o registro for bem-sucedido:
  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await axios.post("http://localhost:5000/api/users/register", {
        name: username, // Changed from name to username
        email,
        password
      });
      
      // Certifique-se de que o token e os dados do usuário estão sendo armazenados corretamente
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify({
        id: response.data.user._id,
        name: response.data.user.name,
        email: response.data.user.email
      }));
      
      setIsLoading(false);
      
      // Using destructured props instead of props.setIsLoggedIn
      setIsLoggedIn(true);
      
      // Force a page reload to ensure state is updated
      window.location.href = "/"; // Using href instead of reload for a cleaner navigation
    } catch (error) {
      setIsLoading(false);
      setError(error.response?.data?.message || "Erro ao criar conta");
    }
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
        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? "CARREGANDO..." : "CRIAR CONTA"}
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
