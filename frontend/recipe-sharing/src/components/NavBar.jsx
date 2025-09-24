import React, { useEffect, useMemo, useRef, useState } from "react";
import { assets } from "../assets/assets";
import {
  FaHome,
  FaBook,
  FaHeart,
  FaInfoCircle,
  FaSignInAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const NavBar = ({ openModal }) => {
  const navigate = useNavigate?.() || (() => {});
  const { isAuthenticated, userName, email, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const avatarUrl = useMemo(() => {
    const base = userName || email?.split("@")[0] || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      base
    )}&background=111827&color=ffffff&bold=true&size=64`;
  }, [userName, email]);

  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  return (
    <header className="navbar">
      <div className="nav-inner">
        <a href="#" className="brand" aria-label="Yumy2You Home">
          <img
            src={assets.logox}
            alt="Yumy2You Logo"
            className="logo"
            width={120}
            height={28}
          />
        </a>

        <nav className="nav-links" aria-label="Primary">
          <a href="/" className="nav-link">
            <FaHome /> <span>Home</span>
          </a>
          <a href="#" className="nav-link">
            <FaBook /> <span>My Recipes</span>
          </a>
          <a href="#" className="nav-link">
            <FaHeart /> <span>Favourites</span>
          </a>
          <a href="#" className="nav-link">
            <FaInfoCircle /> <span>About</span>
          </a>
        </nav>

        <div className="nav-actions relative" ref={menuRef}>
          {!isAuthenticated ? (
            <button
              className="btn btn-secondary btn-login"
              onClick={() => openModal && openModal()}
            >
              <FaSignInAlt /> <span>Login</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setMenuOpen((s) => !s)}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-2 py-1 hover:bg-black/70 transition"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="relative inline-block">
                  <img
                    src={avatarUrl}
                    alt="User avatar"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <span className="absolute -right-0 -bottom-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0b0b0b]" />
                </span>
                <span className="hidden sm:inline text-sm text-white/90 font-medium">
                  {userName || email}
                </span>
              </button>
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-12 w-48 rounded-lg border border-white/10 bg-[#0f0f10] shadow-xl overflow-hidden"
                >
                  <button
                    role="menuitem"
                    className="w-full text-left px-4 py-2 text-sm text-white/90 hover:bg-white/10"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                  >
                    Profile
                  </button>
                  <div className="h-px bg-white/10" />
                  <button
                    role="menuitem"
                    className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-white/10"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                      navigate("/");
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
