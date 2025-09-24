import React, { useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import {
  FaUser,
  FaEnvelope,
  FaCalendarAlt,
  FaIdBadge,
  FaSignOutAlt,
  FaEdit,
} from "react-icons/fa";

export const UserProfile = () => {
  const { userId, userName, email, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setErr("");
      try {
        const { data } = await api.get(`/user/profile/${userId}`);
        if (isMounted) setProfile(data);
      } catch (e) {
        if (isMounted)
          setErr(e?.response?.data?.message || "Failed to load profile");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (userId) load();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const displayName = profile?.userName || userName || "User";
  const displayEmail = profile?.email || email || "";
  const joined = profile?.createdAt ? new Date(profile.createdAt) : null;

  const avatarUrl = useMemo(() => {
    if (profile?.avatar) return profile.avatar;
    const name = encodeURIComponent(displayName);
    return `https://ui-avatars.com/api/?name=${name}&background=111827&color=ffffff&bold=true&size=256`;
  }, [profile?.avatar, displayName]);

  return (
    <section className="min-h-[70vh] py-10">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-black via-[#0b0b0b] to-[#151515]">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(600px 200px at 10% 0%, rgba(37,99,235,0.12), transparent 60%)",
            }}
          />
          <div className="relative p-6 sm:p-8 md:p-10">
            <div className="flex flex-col items-center text-center gap-6 md:flex-row md:items-center md:justify-between md:text-left">
              {/* Avatar + basics */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  {loading ? (
                    <div className="h-24 w-24 rounded-full bg-white/10 animate-pulse" />
                  ) : (
                    <>
                      <img
                        src={avatarUrl}
                        alt={`${displayName} avatar`}
                        className="h-24 w-24 rounded-full object-cover ring-2 ring-[#2a6cf1]/50 shadow-lg"
                      />
                      <button
                        type="button"
                        className="absolute bottom-0 right-0 inline-flex items-center justify-center h-8 w-8 rounded-full bg-white text-black border border-black/10 hover:scale-105 transition"
                        title="Change photo"
                        disabled
                      >
                        <FaEdit className="text-sm" />
                      </button>
                    </>
                  )}
                </div>
                <div>
                  {loading ? (
                    <>
                      <div className="h-6 w-40 rounded bg-white/10 animate-pulse" />
                      <div className="mt-2 h-4 w-56 rounded bg-white/10 animate-pulse" />
                    </>
                  ) : (
                    <>
                      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                        {displayName}
                      </h1>
                      <p className="text-sm text-neutral-300/80">
                        {displayEmail}
                      </p>
                      {joined && (
                        <p className="mt-1 flex items-center justify-center md:justify-start gap-2 text-xs text-neutral-400">
                          <FaCalendarAlt className="text-neutral-500" />
                          Joined {joined.toLocaleDateString()}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
              {/* Actions */}
              <div className="flex w-full max-w-sm md:max-w-none md:w-auto items-center justify-center md:justify-end gap-3">
                <button
                  type="button"
                  title="Edit (coming soon)"
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 text-sm text-white hover:bg-white/10 transition"
                  disabled
                >
                  <FaEdit />
                  Edit Profile
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex h-10 items-center gap-2 rounded-md border border-white/10 bg-[#161616] px-4 text-sm text-white hover:bg-[#0f0f0f] hover:border-white/20 transition"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-black/60 p-5 h-full"
            >
              <div className="flex items-center gap-3 text-white mb-3">
                <div className="h-9 w-9 rounded-lg bg-white/10 flex items-center justify-center">
                  {i === 0 ? (
                    <FaUser className="text-[#2a6cf1]" />
                  ) : i === 1 ? (
                    <FaEnvelope className="text-[#2a6cf1]" />
                  ) : (
                    <FaIdBadge className="text-[#2a6cf1]" />
                  )}
                </div>
                <h2 className="font-semibold">
                  {i === 0 ? "Username" : i === 1 ? "Email" : "User ID"}
                </h2>
              </div>
              {loading ? (
                <div className="h-5 w-3/4 rounded bg-white/10 animate-pulse" />
              ) : i === 0 ? (
                <p className="text-neutral-300">{displayName}</p>
              ) : i === 1 ? (
                <p className="text-neutral-300">{displayEmail}</p>
              ) : (
                <p className="text-neutral-300 break-all">
                  {profile?._id || userId}
                </p>
              )}
            </div>
          ))}
        </div>

        {loading && (
          <p className="mt-6 text-center md:text-left text-neutral-400">
            Loading profile…
          </p>
        )}
        {err && (
          <p className="mt-6 text-center md:text-left text-red-400">
            Error: {err}
          </p>
        )}
      </div>
    </section>
  );
};
