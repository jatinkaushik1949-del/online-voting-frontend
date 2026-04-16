import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import "./Guidelines.css";

function Guidelines() {
  const navigate = useNavigate();
  const { theme } = useContext(ThemeContext);
  const [agreed, setAgreed] = useState(false);

  const electionConfig = JSON.parse(localStorage.getItem("electionConfig")) || {
    title: "National General Election 2026",
    status: "closed"
  };

  const guidelines = useMemo(
    () => [
      {
        icon: "🗳️",
        title: "Vote carefully",
        text: "Once your vote is submitted, it cannot be changed again."
      },
      {
        icon: "🔐",
        title: "Only one vote is allowed",
        text: "Each voter can cast only one vote in the election."
      },
      {
        icon: "📡",
        title: "Election must be live",
        text: "Voting is allowed only when the election session is live."
      },
      {
        icon: "🛡️",
        title: "Results are admin controlled",
        text: "Detailed results and election control are visible only to admin."
      },
      {
        icon: "⏱️",
        title: "Keep your session active",
        text: "Avoid unnecessary refresh during the voting process."
      }
    ],
    []
  );

  const handleProceed = () => {
    if (!agreed) return;
    navigate("/vote");
  };

  return (
    <div className={`page theme-${theme}`}>
      <Navbar title="Voting Guidelines" subtitle={electionConfig.title} />

      <div className="guidelines-wrap">
        <div className="glass-card guidelines-card guide-animate">
          <div className="guidelines-header">
            <div className="guidelines-badge">Voter Instructions</div>
            <h1>Before You Vote</h1>
            <p>Please read and understand these instructions before proceeding to the ballot.</p>
          </div>

          <div className="guidelines-status-row centered-status-row">
            <div className="status-mini-card">
              <span>Election Status</span>
              <strong className={`session-text ${electionConfig.status}`}>
                {electionConfig.status === "live"
                  ? "Election Live"
                  : electionConfig.status === "closed"
                  ? "Election Closed"
                  : "Draft Mode"}
              </strong>
            </div>

            <div className="status-mini-card">
              <span>Voting Rule</span>
              <strong>One Person, One Vote</strong>
            </div>
          </div>

          <div className="guidelines-list">
            {guidelines.map((item, index) => (
              <div
                key={item.title}
                className="guideline-item guideline-fade-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="guideline-icon">{item.icon}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="guidelines-confirm">
            <label className="guidelines-checkbox premium-checkbox">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>I have read and understood all the voting guidelines.</span>
            </label>
          </div>

          <div className="guidelines-actions">
            <button className="btn btn-secondary" onClick={() => navigate("/")}>
              Back to Home
            </button>

            <button
              className={`btn btn-primary ${!agreed ? "btn-disabled-look" : ""}`}
              onClick={handleProceed}
              disabled={!agreed}
            >
              Proceed to Vote
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Guidelines;