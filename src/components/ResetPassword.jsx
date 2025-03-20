import "./Login.css";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Logosvg from "../images/GreenListLogoSVG.svg";
import Lock from "../images/lock.svg";
import api from "../api";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se o token é válido
    const verifyToken = async () => {
      try {
        // Opcional: verificar a validade do token no backend
        // await api.get(`/api/users/verify-token/${token}`);
      } catch (error) {
        setIsTokenValid(false);
        setError(
          "Token inválido ou expirado. Solicite um novo link de recuperação."
        );
      }
    };

    if (token) {
      verifyToken();
    } else {
      setIsTokenValid(false);
      setError("Token não fornecido. Solicite um novo link de recuperação.");
    }
  }, [token]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await api.post("/api/users/reset-password", {
        token,
        password,
      });

      setMessage(response.data.message || "Senha redefinida com sucesso!");
      setIsLoading(false);

      // Redirecionar para a página de login após 3 segundos
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      setIsLoading(false);
      setError(error.response?.data?.message || "Erro ao redefinir a senha");
    }
  };

  if (!isTokenValid) {
    return (
      <div className="login-container">
        <div className="login-logo">
          <img src={Logosvg} alt="Logo" className="logo-image" />
        </div>
        <div className="login-form">
          <div className="error-message">{error}</div>
          <a href="/forgot-password" className="login-button">
            Solicitar novo link
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-logo">
        <img src={Logosvg} alt="Logo" className="logo-image" />
      </div>
      <form onSubmit={handleResetPassword} className="login-form">
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        <h2 className="form-title">Redefinir Senha</h2>
        <p className="form-description">Digite sua nova senha abaixo.</p>
        <div className="input-group">
          <div className="input-wrapper">
            <img src={Lock} alt="Lock icon" className="input-icon" />
            <input
              type="password"
              placeholder="NOVA SENHA"
              className="login-input with-icon"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        </div>
        <div className="input-group">
          <div className="input-wrapper">
            <img src={Lock} alt="Lock icon" className="input-icon" />
            <input
              type="password"
              placeholder="CONFIRMAR NOVA SENHA"
              className="login-input with-icon"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        </div>
        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? "PROCESSANDO..." : "REDEFINIR SENHA"}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
