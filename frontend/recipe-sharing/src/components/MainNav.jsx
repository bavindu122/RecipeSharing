import React, { useState } from "react";
import { NavBar } from "./NavBar";
import { Footer } from "./Footer";
import { Outlet, useNavigate } from "react-router-dom";
import { Modal } from "./Modal";
import { useAuth } from "../context/AuthContext";

export const MainNav = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleLogin(data) {
    // data shape: { token, userId, userName, email? }
    login(data);
    setModalOpen(false);
    navigate("/profile", { replace: true });
  }

  function handleRegister(data) {
    login(data);
    setModalOpen(false);
    navigate("/profile", { replace: true });
  }

  return (
    <>
      <NavBar openModal={() => setModalOpen(true)} />
      <Outlet />
      <Footer />

      {modalOpen && (
        <Modal
          onClose={() => setModalOpen(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}
    </>
  );
};
