import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

function Navbar({
  title = "Online Voting System",
  subtitle = "Secure Government Election Portal",
  showLogout = true
}) {
  const navigate = useNavigate();
  const { cycleTheme } = useContext(ThemeContext);
  const [sessionTime, setSessionTime] = useState("00:00");

  const electionConfig =
    JSON.parse(localStorage.getItem("electionConfig")) || {
      status: "closed"
    };

  const loggedInUser = localStorage.getItem("loggedInUser");
  const adminLoggedIn = localStorage.getItem("adminLoggedIn") === "true";

  useEffect(() => {
    const loginStart = localStorage.getItem("sessionStartTime");
    if (!loginStart) return;

    const updateTimer = () => {
      const diff = Math.floor((Date.now() - Number(loginStart)) / 1000);
      const mins = String(Math.floor(diff / 60)).padStart(2, "0");
      const secs = String(diff % 60).padStart(2, "0");
      setSessionTime(`${mins}:${secs}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("sessionStartTime");
    navigate("/");
  };

  const userLabel = adminLoggedIn
    ? "Admin Session"
    : loggedInUser
    ? "Voter Session"
    : "No Session";

  return (
    <header className="topbar new-topbar">
      <div className="topbar-inner">
        <div>
          <h1 className="topbar-title">{title}</h1>
          <p className="topbar-subtitle">{subtitle}</p>
        </div>

        <div className="topbar-status-wrap">
          <div className="topbar-status">
            <span className={`status-dot ${electionConfig.status}`}></span>
            <span className="status-text">
              {electionConfig.status === "live"
                ? "Election Live"
                : electionConfig.status === "closed"
                ? "Election Closed"
                : "Draft Mode"}
            </span>
          </div>

          <div className="secure-session-pill">
            <span className="secure-lock">🔒</span>
            <span>{userLabel}</span>
            {(loggedInUser || adminLoggedIn) && <strong>{sessionTime}</strong>}
          </div>
        </div>

        <div className="topbar-actions">
          <button className="btn btn-secondary" onClick={cycleTheme}>
            Change Theme
          </button>

          {showLogout && (
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;