import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";

function Login() {
  const navigate = useNavigate();
  const { theme, cycleTheme } = useContext(ThemeContext);

  const [activeTab, setActiveTab] = useState("voter");
  const [email, setEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [userLoading, setUserLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [electionConfig, setElectionConfig] = useState({
    title: "National General Election 2026",
    status: "live",
    createdAt: "",
  });

  const API = "https://online-voting-system-full-3.onrender.com";

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchElection();
  }, []);

  const fetchElection = async () => {
    try {
      const res = await fetch(`${API}/api/election`);
      const data = await res.json();

      if (data.success) {
        setElectionConfig(data.election);
      }
    } catch (error) {
      console.error("Election fetch error:", error);
    }
  };

  const handleUserLogin = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      alert("Please enter email");
      return;
    }

    setUserLoading(true);

    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("loggedInUser", email.trim().toLowerCase());
        localStorage.removeItem("adminLoggedIn");
        localStorage.setItem("sessionStartTime", Date.now().toString());
        alert("Voter login successful");
        navigate("/guidelines");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("User login error:", error);
      alert("Server error");
    } finally {
      setUserLoading(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    if (!adminPassword.trim()) {
      alert("Please enter admin password");
      return;
    }

    setAdminLoading(true);

    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: adminPassword.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.removeItem("loggedInUser");
        alert("Admin login successful");
        navigate("/results");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      alert("Server error");
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className={`page login-page theme-${theme}`}>
      <div className="login-bg-orb orb-1" />
      <div className="login-bg-orb orb-2" />
      <div className="login-bg-orb orb-3" />

      <div className="login-theme-switch">
        <button className="btn btn-secondary" onClick={cycleTheme}>
          Change Theme
        </button>
      </div>

      <div className="login-center-wrap">
        <div className="login-card-clean glass-card">
          <div className="login-header-clean">
            <div className="portal-badge">Election Portal</div>
            <h1>Online Voting System</h1>
            <p>Secure digital voting access for voters and administrators</p>
          </div>

          <div className="login-top-status">
            <div className="status-mini-card">
              <span>Live Date</span>
              <strong>{currentTime.toLocaleDateString()}</strong>
            </div>

            <div className="status-mini-card">
              <span>Live Time</span>
              <strong>{currentTime.toLocaleTimeString()}</strong>
            </div>

            <div className="status-mini-card">
              <span>Election Session</span>
              <strong>{electionConfig.title}</strong>
            </div>

            <div className="status-mini-card">
              <span>Session Status</span>
              <strong className={`session-text ${electionConfig.status}`}>
                {electionConfig.status === "live"
                  ? "Election Live"
                  : electionConfig.status === "closed"
                  ? "Election Closed"
                  : "Draft Mode"}
              </strong>
            </div>
          </div>

          <div className="login-tab-switch">
            <button
              className={`login-tab-btn ${activeTab === "voter" ? "active" : ""}`}
              onClick={() => setActiveTab("voter")}
              type="button"
            >
              Voter Login
            </button>
            <button
              className={`login-tab-btn ${activeTab === "admin" ? "active" : ""}`}
              onClick={() => setActiveTab("admin")}
              type="button"
            >
              Admin Login
            </button>
          </div>

          {activeTab === "voter" ? (
            <div className="auth-block clean-auth-block">
              <h2>Voter Access</h2>
              <p>Enter your registered email to continue.</p>

              <form onSubmit={handleUserLogin}>
                <label>Email Address</label>
                <input
                  className="input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button
                  className="btn btn-primary full-width"
                  type="submit"
                  disabled={userLoading}
                >
                  {userLoading ? "Please wait..." : "Continue as Voter"}
                </button>
              </form>

              <div className="auth-link-row">
                <Link to="/register">New voter? Register here</Link>
              </div>
            </div>
          ) : (
            <div className="auth-block clean-auth-block">
              <h2>Admin Access</h2>
              <p>Authorized personnel can manage election controls and results.</p>

              <form onSubmit={handleAdminLogin}>
                <label>Admin Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Enter admin password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />

                <button
                  className="btn btn-dark full-width"
                  type="submit"
                  disabled={adminLoading}
                >
                  {adminLoading ? "Please wait..." : "Continue as Admin"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;