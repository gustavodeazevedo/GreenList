import "./Login.css";
import React, { useState, useEffect } from "react";
import Logosvg from "../images/GreenListLogoSVG.svg";
import User from "../images/user.svg";
import api from "../api";
import {
  checkEmailCooldown,
  recordEmailRequest,
  executeWithRetry,
} from "../utils/requestUtils";

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

    // Verificar cooldown para evitar múltiplas solicitações
    const cooldownCheck = checkEmailCooldown(email, 60000); // 1 minuto de cooldown
    if (cooldownCheck.inCooldown) {
      setIsLoading(false);
      setError(
        `Aguarde ${cooldownCheck.remainingSeconds} segundos antes de tentar novamente.`
      );
      return;
    }

    try {
      // Usar executeWithRetry para lidar com falhas temporárias
      const response = await executeWithRetry(
        async () => await api.post("/api/users/forgot-password", { email }),
        {
          maxRetries: 3,
          initialDelayMs: 1000,
          maxDelayMs: 5000,
          retryAllErrors: false, // Apenas retry em erros de rate limit
        }
      );

      // Registrar a solicitação para controle de cooldown
      recordEmailRequest(email);

      setMessage(
        response.data.message ||
          "E-mail de recuperação enviado. Verifique sua caixa de entrada."
      );
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);

      // Handle rate limiting error specifically
      if (error.response?.status === 429) {
        setError(
          error.response?.data?.message ||
            "Muitas solicitações. Por favor, aguarde alguns minutos antes de tentar novamente."
        );
      } else if (error.response?.status === 403) {
        // Erro específico do SendGrid
        setError(
          "Erro no serviço de email. Por favor, entre em contato com o suporte."
        );
        console.error("SendGrid error:", error.response?.data);
      } else {
        setError(
          error.response?.data?.message || "Erro ao processar a solicitação"
        );
      }

      // Log error for debugging
      console.error("Password reset request error:", error.response || error);
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
