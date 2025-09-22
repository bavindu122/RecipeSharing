import React, { useState, useEffect } from "react";
import axios from "axios";

export const Modal = ({ onClose, onLogin, onRegister }) => {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [regData, setRegData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const [loginErrors, setLoginErrors] = useState({});
  const [regErrors, setRegErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) onClose?.();
  };

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE || "http://localhost:5000",
  });

  const submitLogin = async (e) => {
    e.preventDefault();
    // client-side validation
    const normalized = {
      ...loginData,
      email: loginData.email.trim().toLowerCase(),
    };
    const errs = validateLogin(normalized);
    setLoginErrors(errs);
    setTouched({ ...touched, login: true });
    if (Object.keys(errs).length) return;

    setLoading(true);
    setServerError("");
    try {
      const response = await api.post("/user/login", normalized);
      console.log("Login successful:", response.data);
      onLogin?.(response.data);
      onClose?.();
    } catch (error) {
      console.error("Error during login:", error);
      const msg =
        error?.response?.data?.message || error.message || "Login failed";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async (e) => {
    e.preventDefault();
    const errs = validateRegister(regData);
    setRegErrors(errs);
    setTouched({ ...touched, register: true });
    if (Object.keys(errs).length) return;

    setLoading(true);
    setServerError("");
    try {
      const { name, email, password } = regData; // confirmPassword excluded
      const payload = { userName: name, email, password };
      const response = await api.post("/user/register", payload);
      console.log("Registration successful:", response.data);
      onRegister?.(response.data);
      // optionally switch to login
      setMode("login");
      setLoginData((prev) => ({ ...prev, email: regData.email }));
    } catch (error) {
      console.error("Error during registration:", error);
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "Registration failed";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Basic validators
  const isEmail = (v) => /\S+@\S+\.\S+/.test(v);

  const validateLogin = (data) => {
    const errs = {};
    if (!data.email) errs.email = "Email is required";
    else if (!isEmail(data.email)) errs.email = "Enter a valid email";
    if (!data.password) errs.password = "Password is required";
    else if (data.password.length < 6)
      errs.password = "Password must be at least 6 characters";
    return errs;
  };

  const validateRegister = (data) => {
    const errs = {};
    if (!data.name) errs.name = "Full name is required";
    if (!data.email) errs.email = "Email is required";
    else if (!isEmail(data.email)) errs.email = "Enter a valid email";
    if (!data.password) errs.password = "Password is required";
    else if (data.password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (!data.confirmPassword)
      errs.confirmPassword = "Please confirm your password";
    else if (data.password !== data.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  // live-validate when fields change
  useEffect(() => {
    if (mode === "login") setLoginErrors(validateLogin(loginData));
    else setRegErrors(validateRegister(regData));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginData, regData, mode]);

  return (
    <div className="modal-root">
      <div className="modal-overlay" onClick={handleOverlayClick} />

      <div className="modal-panel" role="dialog" aria-modal="true">
        <button
          className="modal-close"
          onClick={() => onClose?.()}
          aria-label="Close"
        >
          ×
        </button>

        <div className="modal-switch">
          <button
            className={`switch-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={`switch-btn ${mode === "register" ? "active" : ""}`}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        {serverError && (
          <div className="server-error" role="alert">
            {serverError}
          </div>
        )}

        {mode === "login" ? (
          <form className="modal-form" onSubmit={submitLogin}>
            <label className="form-label">
              Email
              <input
                type="email"
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
                required
                aria-invalid={!!loginErrors.email}
              />
              {touched.login && loginErrors.email && (
                <span className="field-error">{loginErrors.email}</span>
              )}
            </label>

            <label className="form-label">
              Password
              <input
                type="password"
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                required
                aria-invalid={!!loginErrors.password}
              />
              {touched.login && loginErrors.password && (
                <span className="field-error">{loginErrors.password}</span>
              )}
            </label>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setMode("register")}
              >
                Create account
              </button>
            </div>
          </form>
        ) : (
          <form className="modal-form" onSubmit={submitRegister}>
            <label className="form-label">
              Name
              <input
                type="text"
                value={regData.name}
                onChange={(e) =>
                  setRegData({ ...regData, name: e.target.value })
                }
                required
                aria-invalid={!!regErrors.name}
              />
              {touched.register && regErrors.name && (
                <span className="field-error">{regErrors.name}</span>
              )}
            </label>

            <label className="form-label">
              Email
              <input
                type="email"
                value={regData.email}
                onChange={(e) =>
                  setRegData({ ...regData, email: e.target.value })
                }
                required
                aria-invalid={!!regErrors.email}
              />
              {touched.register && regErrors.email && (
                <span className="field-error">{regErrors.email}</span>
              )}
            </label>

            <label className="form-label">
              Password
              <input
                type="password"
                value={regData.password}
                onChange={(e) =>
                  setRegData({ ...regData, password: e.target.value })
                }
                required
                aria-invalid={!!regErrors.password}
              />
              {touched.register && regErrors.password && (
                <span className="field-error">{regErrors.password}</span>
              )}
            </label>
            <label className="form-label">
              Confirm Password
              <input
                type="password"
                value={regData.confirmPassword}
                onChange={(e) =>
                  setRegData({ ...regData, confirmPassword: e.target.value })
                }
                required
                aria-invalid={!!regErrors.confirmPassword}
              />
              {touched.register && regErrors.confirmPassword && (
                <span className="field-error">{regErrors.confirmPassword}</span>
              )}
            </label>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create account"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setMode("login")}
              >
                Back to login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
