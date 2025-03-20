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
        password,
      });

      console.log("Resposta do login (completa):", response);
      console.log("Resposta do login (data):", response.data);
      
      // Usar os dados extraídos pelo interceptor, se disponíveis
      if (response.data.extractedUserData && response.data.extractedToken) {
        const userData = response.data.extractedUserData;
        const token = response.data.extractedToken;
        
        console.log("Dados do usuário extraídos:", userData);
        
        // Store user data and token in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        
        setIsLoading(false);
        
        // Update the parent component's state
        setIsLoggedIn(true);
        return;
      }
      
      // Caso o interceptor não tenha conseguido extrair os dados, tentar extrair aqui
      // Vamos inspecionar a estrutura exata da resposta
      let userId = null;
      let userName = null;
      let userEmail = null;
      let token = null;
  
      // Verificar diferentes possíveis estruturas da resposta
      if (response.data.user && response.data.user._id) {
        // Estrutura esperada: { user: { _id, name, email }, token }
        userId = response.data.user._id;
        userName = response.data.user.name;
        userEmail = response.data.user.email;
        token = response.data.token;
      } else if (response.data._id) {
        // Estrutura alternativa: { _id, name, email, token }
        userId = response.data._id;
        userName = response.data.name;
        userEmail = response.data.email;
        token = response.data.token;
      } else if (response.data.id) {
        // Outra estrutura possível: { id, name, email, token }
        userId = response.data.id;
        userName = response.data.name;
        userEmail = response.data.email;
        token = response.data.token;
      }
  
      if (!userId || !token) {
        console.error("Estrutura da resposta não reconhecida:", response.data);
        setError(
          "Erro: Não foi possível extrair os dados do usuário da resposta"
        );
        setIsLoading(false);
        return;
      }
  
      const userData = {
        id: userId,
        name: userName || "Usuário",
        email: userEmail || email,
      };
  
      console.log("Dados do usuário a serem armazenados:", userData);
  
      // Store user data and token in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
  
      setIsLoading(false);
  
      // Update the parent component's state
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Erro completo:", error);
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
      </form>
    </div>
  );
}

export default Login;
