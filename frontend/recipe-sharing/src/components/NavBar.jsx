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
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utils/api";

export const NavBar = ({ openModal }) => {
  const navigate = useNavigate?.() || (() => {});
  const { isAuthenticated, userName, email, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [searchParams] = useSearchParams();
  const [q, setQ] = useState(() => searchParams.get("q") || "");
  const searchRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
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

  // keep local q in sync with URL changes
  useEffect(() => {
    const current = searchParams.get("q") || "";
    if (current !== q) setQ(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // fetch suggestions when typing
  useEffect(() => {
    let active = true;
    const run = async () => {
      const term = q.trim();
      if (term.length < 2) {
        if (active) setSuggestions([]);
        return;
      }
      try {
        const { data } = await api.get(`/recipe`, {
          params: { q: term },
        });
        if (!active) return;
        const list = Array.isArray(data)
          ? data.slice(0, 8).map((r) => ({ id: r._id, title: r.title }))
          : [];
        setSuggestions(list);
        setShowSuggestions(true);
      } catch (e) {
        if (active) setSuggestions([]);
      }
    };
    const t = setTimeout(run, 200);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [q]);

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
          <a href="/my-recipes" className="nav-link">
            <FaBook /> <span>My Recipes</span>
          </a>
          <a href="/favorites" className="nav-link">
            <FaHeart /> <span>Favourites</span>
          </a>
          <a href="#" className="nav-link">
            <FaInfoCircle /> <span>About</span>
          </a>
        </nav>

        {/* Search bar */}
        <form
          ref={searchRef}
          className="hidden md:block relative mx-3 flex-1 max-w-sm"
          onSubmit={(e) => {
            e.preventDefault();
            const next = q.trim();
            if (next) {
              const sp = new URLSearchParams();
              sp.set("q", next);
              navigate(`/?${sp.toString()}#recipe-items`);
              // smooth scroll to results in case hash scrolling doesn't kick in
              setTimeout(() => {
                const el = document.getElementById("recipe-items");
                if (el)
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 0);
            } else {
              navigate(`/`);
            }
          }}
        >
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search recipes..."
            className="w-full rounded-lg bg-black/50 border border-white/10 px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            onFocus={() => {
              if ((suggestions || []).length > 0) setShowSuggestions(true);
            }}
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-500"
          >
            Search
          </button>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-white/10 bg-[#0f0f10] shadow-xl">
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  className="px-3 py-2 text-sm text-white/90 hover:bg-white/10 cursor-pointer"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setQ(s.title);
                    setShowSuggestions(false);
                    const sp = new URLSearchParams();
                    sp.set("q", s.title);
                    navigate(`/?${sp.toString()}#recipe-items`);
                    setTimeout(() => {
                      const el = document.getElementById("recipe-items");
                      if (el)
                        el.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                    }, 0);
                  }}
                >
                  {s.title}
                </div>
              ))}
            </div>
          )}
        </form>

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
