import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import bjpLogo from "../assets/bjp.png";
import congressLogo from "../assets/congress.png";
import bspLogo from "../assets/bsp.png";
import inldLogo from "../assets/inld.png";

function Vote() {
  const navigate = useNavigate();
  const [selectedParty, setSelectedParty] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

const API = "https://online-voting-system-full-3.onrender.com";

  const parties = [
    {
      name: "BJP",
      logo: bjpLogo,
      fullName: "Bharatiya Janata Party",
      accent: "#f97316",
    },
    {
      name: "CONGRESS",
      logo: congressLogo,
      fullName: "Indian National Congress",
      accent: "#2563eb",
    },
    {
      name: "BSP",
      logo: bspLogo,
      fullName: "Bahujan Samaj Party",
      accent: "#2563eb",
    },
    {
      name: "INLD",
      logo: inldLogo,
      fullName: "Indian National Lok Dal",
      accent: "#16a34a",
    },
  ];

  const handleVote = async () => {
    const email = localStorage.getItem("loggedInUser");

    if (!email) {
      alert("Please login first");
      navigate("/");
      return;
    }

    if (!selectedParty) {
      alert("Please select a party");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          party: selectedParty,
        }),
      });

      const data = await res.json();

      if (data.success) {
  setShowSuccess(true);

  setTimeout(() => {
    setShowSuccess(false);
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("sessionStartTime");
    navigate("/");
  }, 1800);
}else {
        alert(data.message || "Vote failed");
      }
    } catch (error) {
      console.error("Vote error:", error);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("sessionStartTime");
    navigate("/");
  };

  return (
    <>
      <style>
        {`
          @keyframes floatUpDown {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
            100% { transform: translateY(0px); }
          }

          @keyframes pulseGlow {
            0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.35); }
            70% { box-shadow: 0 0 0 14px rgba(34, 197, 94, 0); }
            100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
          }

          @keyframes spinLoader {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes fadeInScale {
            0% { opacity: 0; transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1); }
          }

          .vote-card-hover:hover {
            transform: translateY(-8px) scale(1.01);
            box-shadow: 0 18px 35px rgba(0,0,0,0.28);
          }

          .vote-logo-float {
            animation: floatUpDown 2.8s ease-in-out infinite;
          }

          .vote-selected {
            animation: pulseGlow 1.5s infinite;
          }

          .vote-spinner {
            width: 22px;
            height: 22px;
            border: 3px solid rgba(255,255,255,0.25);
            border-top: 3px solid #fff;
            border-radius: 50%;
            animation: spinLoader 0.8s linear infinite;
          }

          @keyframes voteSuccessPop {
            0% { opacity: 0; transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1); }
          }

          .vote-success-pop {
            animation: voteSuccessPop 0.35s ease;
          }
        `}
      </style>

      <div style={styles.page}>
        {showSuccess && (
          <div style={styles.overlay}>
            <div className="vote-success-pop" style={styles.successBox}>
              <div style={styles.successIcon}>✅</div>
              <h2 style={styles.successTitle}>Vote Submitted Successfully</h2>
              <p style={styles.successText}>Your vote has been recorded safely.</p>
            </div>
          </div>
        )}

        <div style={styles.container}>
          <div style={styles.topBar}>
            <div>
              <h1 style={styles.mainTitle}>Online Voting System</h1>
              <p style={styles.subTitle}>National General Election 2026</p>
            </div>

            <div style={styles.topButtons}>
              <button style={styles.themeBtn} onClick={() => navigate("/")}>
                Home
              </button>
              <button style={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>

          <div style={styles.headerBox}>
            <div>
              <h2 style={styles.heading}>National General Election</h2>
              <p style={styles.description}>
                Select one party carefully. One voter can cast only one vote.
              </p>
            </div>
            <div style={styles.liveBox}>Election Live</div>
          </div>

          <div style={styles.grid}>
            {parties.map((party, index) => {
              const isSelected = selectedParty === party.name;

              return (
                <div
                  key={index}
                  onClick={() => setSelectedParty(party.name)}
                  className={`vote-card-hover ${isSelected ? "vote-selected" : ""}`}
                  style={{
                    ...styles.card,
                    border: isSelected
                      ? `2px solid ${party.accent}`
                      : "1px solid rgba(255,255,255,0.08)",
                    boxShadow: isSelected
                      ? `0 0 0 2px ${party.accent}33, 0 0 30px ${party.accent}22`
                      : "0 8px 18px rgba(0,0,0,0.18)",
                  }}
                >
                  <div style={styles.partyTag}>{party.name}</div>

                  <div
                    className="vote-logo-float"
                    style={{
                      ...styles.logoWrap,
                      boxShadow: isSelected
                        ? `0 0 24px ${party.accent}55`
                        : "0 10px 20px rgba(0,0,0,0.18)",
                    }}
                  >
                    <img src={party.logo} alt={party.name} style={styles.logo} />
                  </div>

                  <h3 style={styles.partyName}>{party.name}</h3>
                  <p style={styles.fullName}>{party.fullName}</p>

                  <button
                    style={{
                      ...styles.selectBtn,
                      background: isSelected ? "#15803d" : party.accent,
                    }}
                    type="button"
                  >
                    {isSelected ? "Selected" : "Press to Select"}
                  </button>
                </div>
              );
            })}
          </div>

          <div style={styles.bottomRow}>
            <button
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.9 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onClick={handleVote}
              disabled={loading}
            >
              {loading ? (
                <span style={styles.loadingWrap}>
                  <span className="vote-spinner"></span>
                  Submitting...
                </span>
              ) : (
                "Submit Vote"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #020617, #0f172a, #1d4ed8)",
    padding: "24px",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  mainTitle: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
  },
  subTitle: {
    margin: "6px 0 0",
    opacity: 0.8,
  },
  topButtons: {
    display: "flex",
    gap: "12px",
  },
  themeBtn: {
    background: "#e5e7eb",
    color: "#111827",
    border: "none",
    padding: "12px 18px",
    borderRadius: "16px",
    cursor: "pointer",
    fontWeight: "600",
  },
  logoutBtn: {
    background: "#991b1b",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "16px",
    cursor: "pointer",
    fontWeight: "600",
  },
  headerBox: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: "28px",
    padding: "28px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "28px",
  },
  heading: {
    margin: 0,
    fontSize: "52px",
    fontWeight: "800",
    lineHeight: 1.05,
  },
  description: {
    marginTop: "14px",
    fontSize: "18px",
    opacity: 0.85,
  },
  liveBox: {
    background: "rgba(34,197,94,0.15)",
    color: "#22c55e",
    padding: "16px 22px",
    borderRadius: "20px",
    fontWeight: "700",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "rgba(15,23,42,0.88)",
    borderRadius: "28px",
    padding: "22px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.28s ease",
  },
  partyTag: {
    display: "inline-block",
    background: "rgba(255,255,255,0.08)",
    padding: "8px 16px",
    borderRadius: "999px",
    fontWeight: "700",
    marginBottom: "18px",
  },
  logoWrap: {
    width: "130px",
    height: "130px",
    borderRadius: "50%",
    margin: "0 auto 18px",
    background: "rgba(255,255,255,0.04)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  logo: {
    width: "92px",
    height: "92px",
    objectFit: "contain",
  },
  partyName: {
    fontSize: "30px",
    margin: "0 0 10px",
  },
  fullName: {
    opacity: 0.8,
    minHeight: "44px",
  },
  selectBtn: {
    color: "#fff",
    border: "none",
    padding: "14px 22px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: "700",
    marginTop: "14px",
  },
  bottomRow: {
    display: "flex",
    justifyContent: "center",
    marginTop: "32px",
  },
  submitBtn: {
    background: "#1d4ed8",
    color: "#fff",
    border: "none",
    padding: "18px 42px",
    borderRadius: "20px",
    fontSize: "24px",
    fontWeight: "700",
    minWidth: "280px",
  },
  loadingWrap: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(2, 6, 23, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "20px",
  },
  successBox: {
    background: "#ffffff",
    color: "#0f172a",
    padding: "34px 28px",
    borderRadius: "24px",
    textAlign: "center",
    maxWidth: "420px",
    width: "100%",
    boxShadow: "0 24px 50px rgba(0,0,0,0.28)",
  },
  successIcon: {
    fontSize: "54px",
    marginBottom: "10px",
  },
  successTitle: {
    margin: "0 0 10px",
    fontSize: "28px",
    fontWeight: "800",
  },
  successText: {
    margin: 0,
    color: "#475569",
    fontSize: "16px",
  },
};

export default Vote;