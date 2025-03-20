import "./Login.css";
import React, { useState } from "react";
import Logosvg from "../images/GreenListLogoSVG.svg";
import User from "../images/user.svg";
import api from "../api";

function ForgotPassword({ switchToLogin }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/api/users/forgot-password", { email });
      setMessage(
        response.data.message ||
          "E-mail de recuperação enviado. Verifique sua caixa de entrada."
      );
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setError(
        error.response?.data?.message || "Erro ao processar a solicitação"
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-logo">
        {/* Logo */}
        <img src={Logosvg} alt="Logo" className="logo-image" />
      </div>
      <form onSubmit={handleForgotPassword} className="login-form">
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        <h2 className="form-title">Recuperação de Senha</h2>
        <p className="form-description">
          Digite seu e-mail para receber um link de recuperação de senha.
        </p>
        <div className="input-group">
          <div className="input-wrapper">
            <img src={User} alt="User icon" className="input-icon" />
            <input
              type="email"
              placeholder="E-MAIL"
              className="login-input with-icon"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? "ENVIANDO..." : "ENVIAR LINK DE RECUPERAÇÃO"}
        </button>
        <a
          href="#"
          className="forgot-password"
          onClick={(e) => {
            e.preventDefault();
            switchToLogin();
          }}
        >
          Voltar para o login
        </a>
      </form>
    </div>
  );
}

export default ForgotPassword;
