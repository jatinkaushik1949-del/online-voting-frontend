import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function Results() {
  const navigate = useNavigate();
  const API = "https://online-voting-system-full-3.onrender.com";

  const [loading, setLoading] = useState(true);
  const [savingElection, setSavingElection] = useState(false);
  const [resettingElection, setResettingElection] = useState(false);
  const [results, setResults] = useState([]);
  const [voters, setVoters] = useState([]);
  const [showVoters, setShowVoters] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");
  const [electionForm, setElectionForm] = useState({
    title: "National General Election 2026",
    status: "live",
  });

  useEffect(() => {
  loadDashboard();

  const interval = setInterval(() => {
    loadDashboard(false);
  }, 5000);

  return () => clearInterval(interval);
}, []);

  const loadDashboard = async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      const [electionRes, votersRes, resultsRes] = await Promise.all([
        fetch(`${API}/api/election`),
        fetch(`${API}/api/voters`),
        fetch(`${API}/api/results`),
      ]);

      const electionData = await electionRes.json();
      const votersData = await votersRes.json();
      const resultsData = await resultsRes.json();

      if (electionData.success && electionData.election) {
        setElectionForm({
          title: electionData.election.title || "National General Election 2026",
          status: electionData.election.status || "live",
        });
      }

      if (votersData.success && Array.isArray(votersData.voters)) {
        setVoters(votersData.voters);
      } else {
        setVoters([]);
      }

      if (resultsData.success && Array.isArray(resultsData.results)) {
        setResults(resultsData.results);
      } else {
        setResults([]);
      }

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Dashboard load error:", error);
      if (showLoader) alert("Failed to load admin dashboard");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const updateElection = async (newStatus = null) => {
    if (!electionForm.title.trim()) {
      alert("Please enter election title");
      return;
    }

    setSavingElection(true);

    try {
      const res = await fetch(`${API}/api/admin/election`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: electionForm.title.trim(),
          status: newStatus || electionForm.status,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setElectionForm({
          title: data.election.title,
          status: data.election.status,
        });
        alert("Election updated successfully");
        loadDashboard(false);
      } else {
        alert(data.message || "Election update failed");
      }
    } catch (error) {
      console.error("Election update error:", error);
      alert("Server error");
    } finally {
      setSavingElection(false);
    }
  };

  const handleResetElection = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to reset the election? This will remove all votes and reset all voters."
    );

    if (!confirmed) return;

    setResettingElection(true);

    try {
      const res = await fetch(`${API}/api/admin/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (data.success) {
        alert("Election reset successfully");
        loadDashboard(false);
      } else {
        alert(data.message || "Reset failed");
      }
    } catch (error) {
      console.error("Reset error:", error);
      alert("Server error");
    } finally {
      setResettingElection(false);
    }
  };

  const totalVotes = useMemo(
    () => results.reduce((sum, item) => sum + Number(item.votes || 0), 0),
    [results]
  );

  const totalVoters = voters.length;

  const votedCount = useMemo(
    () => voters.filter((voter) => voter.hasVoted).length,
    [voters]
  );

  const pendingCount = totalVoters - votedCount;

  const turnout = useMemo(() => {
    if (!totalVoters) return 0;
    return ((votedCount / totalVoters) * 100).toFixed(1);
  }, [votedCount, totalVoters]);

  const winner = useMemo(() => {
    if (!results.length) return null;
    return [...results].sort((a, b) => b.votes - a.votes)[0];
  }, [results]);

  const filteredVoters = useMemo(() => {
    if (!searchTerm.trim()) return voters;
    const term = searchTerm.toLowerCase();

    return voters.filter(
      (voter) =>
        voter.name?.toLowerCase().includes(term) ||
        voter.email?.toLowerCase().includes(term) ||
        voter.voterId?.toLowerCase().includes(term) ||
        voter.votedParty?.toLowerCase().includes(term)
    );
  }, [voters, searchTerm]);

  const getPercentage = (votes) => {
    if (!totalVotes) return 0;
    return ((votes / totalVotes) * 100).toFixed(1);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/");
  };

  const downloadCSV = () => {
    const voterRows = voters.map((voter) => ({
      type: "VOTER",
      name: voter.name || "",
      email: voter.email || "",
      voterId: voter.voterId || "",
      voteStatus: voter.hasVoted ? "Voted" : "Pending",
      selectedParty: voter.votedParty || "",
      party: "",
      votes: "",
    }));

    const resultRows = results.map((item) => ({
      type: "RESULT",
      name: "",
      email: "",
      voterId: "",
      voteStatus: "",
      selectedParty: "",
      party: item.party || "",
      votes: item.votes || 0,
    }));

    const allRows = [...voterRows, ...resultRows];

    const headers = [
      "type",
      "name",
      "email",
      "voterId",
      "voteStatus",
      "selectedParty",
      "party",
      "votes",
    ];

    const csv = [
      headers.join(","),
      ...allRows.map((row) =>
        headers
          .map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "election_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusColor =
    electionForm.status === "live"
      ? "#16a34a"
      : electionForm.status === "closed"
      ? "#dc2626"
      : "#d97706";

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.heading}>Election Results</h1>
            <p style={styles.subHeading}>
              Admin dashboard and live election control panel
            </p>
          </div>

          <div style={styles.rightHeader}>
            <span
              style={{
                ...styles.statusPill,
                background: `${statusColor}20`,
                color: statusColor,
              }}
            >
              {electionForm.status.toUpperCase()}
            </span>
            <span style={styles.updatedText}>Updated: {lastUpdated || "—"}</span>
          </div>
        </div>

        <div style={styles.buttonRow}>
          <button style={styles.homeButton} onClick={() => navigate("/")}>
            Home
          </button>
          <button style={styles.refreshButton} onClick={() => loadDashboard()}>
            Refresh
          </button>
          <button style={styles.downloadButton} onClick={downloadCSV}>
            Download Data
          </button>
          <button
            style={styles.resetButton}
            onClick={handleResetElection}
            disabled={resettingElection}
          >
            {resettingElection ? "Resetting..." : "Reset Election"}
          </button>
          <button style={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>

        {loading ? (
          <p style={styles.loading}>Loading dashboard...</p>
        ) : (
          <>
            <div style={styles.summaryGrid}>
              <div style={styles.summaryCard}>
                <h3 style={styles.cardTitle}>Status</h3>
                <p style={{ ...styles.cardValue, color: statusColor }}>
                  {electionForm.status.toUpperCase()}
                </p>
              </div>

              <div style={styles.summaryCard}>
                <h3 style={styles.cardTitle}>Voters</h3>
                <p style={styles.cardValue}>{totalVoters}</p>
              </div>

              <div style={styles.summaryCard}>
                <h3 style={styles.cardTitle}>Votes Cast</h3>
                <p style={styles.cardValue}>{votedCount}</p>
              </div>

              <div style={styles.summaryCard}>
                <h3 style={styles.cardTitle}>Turnout</h3>
                <p style={styles.cardValue}>{turnout}%</p>
              </div>

              <div style={styles.summaryCard}>
                <h3 style={styles.cardTitle}>Leading Party</h3>
                <p style={styles.cardValue}>{winner ? winner.party : "N/A"}</p>
              </div>
            </div>

            <div style={styles.controlBox}>
              <div style={styles.controlTop}>
                <div style={styles.titleInputWrap}>
                  <label style={styles.label}>Election Title</label>
                  <input
                    style={styles.input}
                    type="text"
                    value={electionForm.title}
                    onChange={(e) =>
                      setElectionForm({ ...electionForm, title: e.target.value })
                    }
                    placeholder="Enter election title"
                  />
                </div>

                <div style={styles.controlButtons}>
                  <button
                    style={styles.saveBtn}
                    onClick={() => updateElection()}
                    disabled={savingElection}
                  >
                    {savingElection ? "Saving..." : "Save Title"}
                  </button>

                  <button
                    style={styles.liveBtn}
                    onClick={() => updateElection("live")}
                    disabled={savingElection}
                  >
                    Live
                  </button>

                  <button
                    style={styles.closeBtn}
                    onClick={() => updateElection("closed")}
                    disabled={savingElection}
                  >
                    Close
                  </button>

                  <button
                    style={styles.draftBtn}
                    onClick={() => updateElection("draft")}
                    disabled={savingElection}
                  >
                    Draft
                  </button>
                </div>
              </div>
            </div>

            <div style={styles.mainGrid}>
              <div style={styles.resultsPanel}>
                <div style={styles.panelHeader}>
                  <h2 style={styles.sectionTitle}>Live Results</h2>
                  <span style={styles.miniInfo}>
                    Total Votes: {totalVotes} | Pending: {pendingCount}
                  </span>
                </div>

                <div style={styles.resultsScroll}>
                  {results.length > 0 ? (
                    results.map((item, index) => (
                      <div key={index} style={styles.partyCard}>
                        <div style={styles.partyTop}>
                          <h2 style={styles.partyName}>{item.party}</h2>
                          <span style={styles.voteCount}>{item.votes} votes</span>
                        </div>

                        <div style={styles.progressBarBackground}>
                          <div
                            style={{
                              ...styles.progressBarFill,
                              width: `${getPercentage(item.votes)}%`,
                            }}
                          />
                        </div>

                        <p style={styles.percentageText}>
                          {getPercentage(item.votes)}% of total votes
                        </p>
                      </div>
                    ))
                  ) : (
                    <p style={styles.noData}>No votes available yet.</p>
                  )}

                  {winner && (
                    <div style={styles.winnerBox}>
                      🏆 Winner: <strong>{winner.party}</strong> with{" "}
                      <strong>{winner.votes}</strong> votes
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.voterPanel}>
                <div style={styles.voterTop}>
                  <h2 style={styles.sectionTitle}>Registered Voters</h2>
                  <button
                    style={styles.toggleBtn}
                    onClick={() => setShowVoters(!showVoters)}
                  >
                    {showVoters ? "Hide" : "Show"}
                  </button>
                </div>

                <input
                  style={styles.searchInput}
                  type="text"
                  placeholder="Search name, email, ID, party"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {showVoters && (
                  <div style={styles.tableWrap}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Name</th>
                          <th style={styles.th}>Status</th>
                          <th style={styles.th}>Party</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredVoters.length > 0 ? (
                          filteredVoters.map((voter, index) => (
                            <tr key={index}>
                              <td style={styles.td}>
                                <div style={styles.nameCell}>
                                  <strong>{voter.name}</strong>
                                  <span style={styles.emailSmall}>
                                    {voter.email}
                                  </span>
                                </div>
                              </td>
                              <td style={styles.td}>
                                <span
                                  style={{
                                    ...styles.smallStatus,
                                    background: voter.hasVoted
                                      ? "#dcfce7"
                                      : "#fee2e2",
                                    color: voter.hasVoted ? "#166534" : "#991b1b",
                                  }}
                                >
                                  {voter.hasVoted ? "Voted" : "Pending"}
                                </span>
                              </td>
                              <td style={styles.td}>{voter.votedParty || "-"}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td style={styles.td} colSpan="3">
                              No matching voters found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #1e293b, #334155)",
    padding: "20px 12px",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: "1250px",
    margin: "0 auto",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "22px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "14px",
  },
  heading: {
    marginBottom: "8px",
    color: "#0f172a",
    fontSize: "34px",
  },
  subHeading: {
    color: "#475569",
    fontSize: "17px",
  },
  rightHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "8px",
  },
  statusPill: {
    padding: "8px 14px",
    borderRadius: "999px",
    fontWeight: "bold",
    fontSize: "14px",
  },
  updatedText: {
    color: "#64748b",
    fontSize: "14px",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },
  homeButton: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "11px 18px",
    borderRadius: "10px",
    fontSize: "15px",
    cursor: "pointer",
  },
  refreshButton: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "11px 18px",
    borderRadius: "10px",
    fontSize: "15px",
    cursor: "pointer",
  },
  downloadButton: {
    background: "#7c3aed",
    color: "#fff",
    border: "none",
    padding: "11px 18px",
    borderRadius: "10px",
    fontSize: "15px",
    cursor: "pointer",
  },
  resetButton: {
    background: "#ea580c",
    color: "#fff",
    border: "none",
    padding: "11px 18px",
    borderRadius: "10px",
    fontSize: "15px",
    cursor: "pointer",
  },
  logoutButton: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "11px 18px",
    borderRadius: "10px",
    fontSize: "15px",
    cursor: "pointer",
  },
  loading: {
    textAlign: "center",
    fontSize: "20px",
    color: "#334155",
    marginTop: "30px",
  },
  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginBottom: "16px",
  },
  summaryCard: {
    background: "#f8fafc",
    borderRadius: "16px",
    padding: "16px",
    textAlign: "center",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  },
  cardTitle: {
    marginBottom: "8px",
    color: "#475569",
    fontSize: "16px",
  },
  cardValue: {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#0f172a",
    margin: 0,
  },
  controlBox: {
    background: "#f8fafc",
    borderRadius: "16px",
    padding: "18px",
    marginBottom: "16px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  },
  controlTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "end",
    flexWrap: "wrap",
  },
  titleInputWrap: {
    flex: 1,
    minWidth: "280px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#334155",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "15px",
    boxSizing: "border-box",
  },
  controlButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  saveBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "12px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  liveBtn: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "12px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  closeBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "12px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  draftBtn: {
    background: "#d97706",
    color: "#fff",
    border: "none",
    padding: "12px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: "16px",
  },
  resultsPanel: {
    background: "#f8fafc",
    borderRadius: "16px",
    padding: "18px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
    minHeight: "520px",
    display: "flex",
    flexDirection: "column",
  },
  voterPanel: {
    background: "#f8fafc",
    borderRadius: "16px",
    padding: "18px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
    minHeight: "520px",
    display: "flex",
    flexDirection: "column",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "10px",
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: "10px",
    color: "#0f172a",
    fontSize: "24px",
  },
  miniInfo: {
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "bold",
  },
  resultsScroll: {
    overflowY: "auto",
    paddingRight: "4px",
  },
  partyCard: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "16px",
    marginBottom: "14px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  },
  partyTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    flexWrap: "wrap",
    gap: "8px",
  },
  partyName: {
    margin: 0,
    color: "#0f172a",
    fontSize: "22px",
  },
  voteCount: {
    background: "#dbeafe",
    color: "#1d4ed8",
    padding: "8px 14px",
    borderRadius: "999px",
    fontWeight: "bold",
    fontSize: "14px",
  },
  progressBarBackground: {
    width: "100%",
    height: "14px",
    background: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, #22c55e, #16a34a)",
    borderRadius: "999px",
    transition: "width 0.5s ease",
  },
  percentageText: {
    marginTop: "10px",
    color: "#475569",
    fontWeight: "bold",
  },
  winnerBox: {
    marginTop: "10px",
    background: "#fef3c7",
    color: "#92400e",
    padding: "16px",
    borderRadius: "14px",
    textAlign: "center",
    fontSize: "18px",
    fontWeight: "bold",
  },
  noData: {
    textAlign: "center",
    color: "#475569",
    fontSize: "17px",
    marginTop: "20px",
  },
  voterTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  searchInput: {
    padding: "10px 12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    marginBottom: "10px",
  },
  toggleBtn: {
    background: "#0ea5e9",
    color: "#fff",
    border: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  tableWrap: {
    overflow: "auto",
    flex: 1,
    borderRadius: "12px",
    background: "#fff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    background: "#e2e8f0",
    color: "#0f172a",
    fontSize: "14px",
    position: "sticky",
    top: 0,
  },
  td: {
    padding: "12px",
    borderTop: "1px solid #e2e8f0",
    color: "#334155",
    fontSize: "14px",
    verticalAlign: "top",
  },
  nameCell: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  emailSmall: {
    color: "#64748b",
    fontSize: "12px",
  },
  smallStatus: {
    padding: "6px 10px",
    borderRadius: "999px",
    fontWeight: "bold",
    fontSize: "12px",
  },
};

export default Results;