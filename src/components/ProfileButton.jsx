import { useState, useRef, useEffect } from "react";
import ProfilePopup from "./ProfilePopup.jsx";

// ═══════════════════════════════════════════════════════════════
// ProfileButton — persistent account / accessibility entry point
// (wishlist package 03). Rendered ONCE at the app root (main.jsx),
// fixed top-right, so it appears on every screen: Landing, quiz,
// results, and all marketing pages. Landing's own controls sit
// bottom-right / top-left, so top-right is collision-free there.
//
// Brand line-icon (person), no emoji (README §6). Sits below the
// pricing modal (z 10000) so that overlay still covers it.
// ═══════════════════════════════════════════════════════════════

export default function ProfileButton() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // Close when clicking anywhere outside the button + popup.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("touchstart", onDown, { passive: true });
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "fixed",
        top: 18,
        right: 20,
        zIndex: 900,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 10,
        fontFamily: "'Manrope', sans-serif",
      }}
    >
      <button
        type="button"
        aria-label="Account and settings"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          border: "1px solid " + (open ? "rgba(226,181,107,0.55)" : "rgba(243,237,225,0.16)"),
          background: open ? "rgba(226,181,107,0.14)" : "rgba(13,17,25,0.72)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          transition: "all 0.2s",
          padding: 0,
        }}
      >
        <svg
          width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke={open ? "#e2b56b" : "rgba(243,237,225,0.82)"}
          strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
        </svg>
      </button>

      {open && <ProfilePopup onClose={() => setOpen(false)} />}
    </div>
  );
}
