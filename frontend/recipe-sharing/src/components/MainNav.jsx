import React, { useState } from "react";
import { NavBar } from "./NavBar";
import { Footer } from "./Footer";
import { Outlet } from "react-router-dom";
import { Modal } from "./Modal";

export const MainNav = () => {
  const [modalOpen, setModalOpen] = useState(false);

  function handleLogin(data) {
    console.log("Login:", data);
    setModalOpen(false);
  }

  function handleRegister(data) {
    console.log("Register:", data);
    setModalOpen(false);
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
