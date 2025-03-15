import "./Login.css";
import React from "react";
import Logo from "../images/GreenListLogoSVG.svg";
import User from "../images/user.svg";
import Lock from "../images/lock.svg";
import Fundo from "../images/GreenListFundo.svg";

function Login({ setIsLoggedIn }) {
  const handleLogin = (e) => {
    e.preventDefault();
    // Implement login logic here
    setIsLoggedIn(true);
  };

  return (
    <div className="login-container">
      <div className="login-logo">
        {/* Logo */}
        <img src={Logo} alt="Logo" className="logo-image" />
      </div>
      <form onSubmit={handleLogin} className="login-form">
        <div className="input-group">
          <div className="input-wrapper">
            <img src={User} alt="User icon" className="input-icon" />
            <input
              type="text"
              placeholder="USERNAME"
              className="login-input with-icon"
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
