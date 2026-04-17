import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../config";

function Results() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [savingElection, setSavingElection] = useState(false);
  const [resettingElection, setResettingElection] = useState(false);
  const [approvingEmail, setApprovingEmail] = useState("");
  const [addingCandidate, setAddingCandidate] = useState(false);
  const [deletingCandidateId, setDeletingCandidateId] = useState("");

  const [results, setResults] = useState([]);
  const [voters, setVoters] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [showVoters, setShowVoters] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const [electionForm, setElectionForm] = useState({
    title: "National General Election 2026",
    status: "live",
  });

  const [candidateForm, setCandidateForm] = useState({
    candidateName: "",
    partyName: "",
    symbolUrl: "",
    photoUrl: "",
    description: "",
  });

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const maskAadhaar = (aadhaar) => {
    if (!aadhaar) return "N/A";
    const str = String(aadhaar);
    if (str.length < 4) return "XXXX-XXXX-" + str;
    return "XXXX-XXXX-" + str.slice(-4);
  };

  const loadDashboard = async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      const [electionRes, votersRes, resultsRes, candidatesRes] =
        await Promise.all([
          fetch(`${API}/api/election`),
          fetch(`${API}/api/voters`),
          fetch(`${API}/api/results`),
          fetch(`${API}/api/candidates`),
        ]);

      if (!electionRes.ok) {
        throw new Error(`/api/election failed: ${electionRes.status}`);
      }
      if (!votersRes.ok) {
        throw new Error(`/api/voters failed: ${votersRes.status}`);
      }
      if (!resultsRes.ok) {
        throw new Error(`/api/results failed: ${resultsRes.status}`);
      }
      if (!candidatesRes.ok) {
        throw new Error(`/api/candidates failed: ${candidatesRes.status}`);
      }

      const electionData = await electionRes.json();
      const votersData = await votersRes.json();
      const resultsData = await resultsRes.json();
      const candidatesData = await candidatesRes.json();

      if (electionData.success && electionData.election) {
        setElectionForm({
          title: electionData.election.title || "National General Election 2026",
          status: electionData.election.status || "live",
        });
      }

      setVoters(
        votersData.success && Array.isArray(votersData.voters)
          ? votersData.voters
          : []
      );

      setResults(
        Array.isArray(resultsData)
          ? resultsData
          : resultsData.success && Array.isArray(resultsData.results)
          ? resultsData.results
          : []
      );

      setCandidates(
        candidatesData.success && Array.isArray(candidatesData.candidates)
          ? candidatesData.candidates
          : []
      );

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Admin dashboard load error:", error);
      if (showLoader) {
        alert(`Failed to load admin dashboard: ${error.message}`);
      }
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
      "Are you sure you want to reset the election?"
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

  const approveUser = async (email) => {
    try {
      setApprovingEmail(email);

      const res = await fetch(`${API}/api/admin/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        alert("User approved successfully");
        loadDashboard(false);
      } else {
        alert(data.message || "Approval failed");
      }
    } catch (err) {
      console.error("Approve error:", err);
      alert("Error approving user");
    } finally {
      setApprovingEmail("");
    }
  };

  const handleCandidateChange = (e) => {
    setCandidateForm({
      ...candidateForm,
      [e.target.name]: e.target.value,
    });
  };

  const addCandidate = async (e) => {
    e.preventDefault();

    if (!candidateForm.candidateName.trim() || !candidateForm.partyName.trim()) {
      alert("Candidate name and party name are required");
      return;
    }

    setAddingCandidate(true);

    try {
      const res = await fetch(`${API}/api/admin/candidates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidateName: candidateForm.candidateName.trim(),
          partyName: candidateForm.partyName.trim(),
          symbolUrl: candidateForm.symbolUrl.trim(),
          photoUrl: candidateForm.photoUrl.trim(),
          description: candidateForm.description.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Candidate added successfully");
        setCandidateForm({
          candidateName: "",
          partyName: "",
          symbolUrl: "",
          photoUrl: "",
          description: "",
        });
        loadDashboard(false);
      } else {
        alert(data.message || "Candidate add failed");
      }
    } catch (error) {
      console.error("Add candidate error:", error);
      alert("Server error");
    } finally {
      setAddingCandidate(false);
    }
  };

  const deleteCandidate = async (candidateId) => {
    const confirmed = window.confirm("Delete this candidate?");
    if (!confirmed) return;

    setDeletingCandidateId(candidateId);

    try {
      const res = await fetch(`${API}/api/admin/candidates/${candidateId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        alert("Candidate deleted successfully");
        loadDashboard(false);
      } else {
        alert(data.message || "Delete failed");
      }
    } catch (error) {
      console.error("Delete candidate error:", error);
      alert("Server error");
    } finally {
      setDeletingCandidateId("");
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
        voter.votedParty?.toLowerCase().includes(term) ||
        voter.mobile?.toLowerCase().includes(term)
    );
  }, [voters, searchTerm]);

  const pendingUsers = useMemo(
    () => voters.filter((voter) => voter.emailVerified && !voter.isApproved),
    [voters]
  );

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
      mobile: voter.mobile || "",
      aadhaar: maskAadhaar(voter.aadhaar),
      emailVerified: voter.emailVerified ? "Yes" : "No",
      approved: voter.isApproved ? "Yes" : "No",
      voteStatus: voter.hasVoted ? "Voted" : "Pending",
      selectedParty: voter.votedParty || "",
      candidateName: "",
      party: "",
      votes: "",
    }));

    const resultRows = results.map((item) => ({
      type: "RESULT",
      name: "",
      email: "",
      voterId: "",
      mobile: "",
      aadhaar: "",
      emailVerified: "",
      approved: "",
      voteStatus: "",
      selectedParty: "",
      candidateName: item.candidateName || "",
      party: item.partyName || "",
      votes: item.votes || 0,
    }));

    const candidateRows = candidates.map((candidate) => ({
      type: "CANDIDATE",
      name: "",
      email: "",
      voterId: "",
      mobile: "",
      aadhaar: "",
      emailVerified: "",
      approved: "",
      voteStatus: "",
      selectedParty: "",
      candidateName: candidate.candidateName || "",
      party: candidate.partyName || "",
      votes: "",
    }));

    const allRows = [...voterRows, ...resultRows, ...candidateRows];

    const headers = [
      "type",
      "name",
      "email",
      "voterId",
      "mobile",
      "aadhaar",
      "emailVerified",
      "approved",
      "voteStatus",
      "selectedParty",
      "candidateName",
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

        {pendingUsers.length > 0 && (
          <div style={styles.pendingSection}>
            <div style={styles.pendingHeader}>
              <h2 style={styles.pendingTitle}>Pending Approvals</h2>
              <span style={styles.pendingCount}>
                {pendingUsers.length} Pending
              </span>
            </div>

            <div style={styles.pendingGrid}>
              {pendingUsers.map((user, index) => (
                <div key={user.email || index} style={styles.pendingCard}>
                  <div style={styles.pendingTop}>
                    <div style={styles.pendingUserText}>
                      <h3 style={styles.pendingName}>
                        {user.name || "Unnamed User"}
                      </h3>
                      <p style={styles.pendingEmail}>{user.email || "No email"}</p>
                    </div>
                    <span style={styles.pendingBadge}>Pending</span>
                  </div>

                  <div style={styles.pendingInfoGrid}>
                    <div style={styles.pendingInfoItem}>
                      <span style={styles.pendingLabel}>Voter ID</span>
                      <strong style={styles.pendingValue}>
                        {user.voterId || "N/A"}
                      </strong>
                    </div>

                    <div style={styles.pendingInfoItem}>
                      <span style={styles.pendingLabel}>Mobile</span>
                      <strong style={styles.pendingValue}>
                        {user.mobile || "N/A"}
                      </strong>
                    </div>

                    <div style={styles.pendingInfoItem}>
                      <span style={styles.pendingLabel}>Aadhaar</span>
                      <strong style={styles.pendingValue}>
                        {maskAadhaar(user.aadhaar)}
                      </strong>
                    </div>

                    <div style={styles.pendingInfoItem}>
                      <span style={styles.pendingLabel}>Email Verified</span>
                      <strong style={styles.pendingValue}>
                        {user.emailVerified ? "Yes" : "No"}
                      </strong>
                    </div>
                  </div>

                  <div style={styles.pendingActionRow}>
                    <button
                      style={{
                        ...styles.approveButton,
                        opacity: approvingEmail === user.email ? 0.7 : 1,
                        cursor:
                          approvingEmail === user.email ? "not-allowed" : "pointer",
                      }}
                      onClick={() => approveUser(user.email)}
                      disabled={approvingEmail === user.email}
                    >
                      {approvingEmail === user.email ? "Approving..." : "Approve User"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                <h3 style={styles.cardTitle}>Leading Candidate</h3>
                <p style={styles.cardValue}>
                  {winner ? winner.candidateName : "N/A"}
                </p>
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

            <div style={styles.candidateSection}>
              <div style={styles.candidateSectionHeader}>
                <h2 style={styles.pendingTitle}>Manage Candidates</h2>
                <span style={styles.pendingCount}>
                  {candidates.length} Candidates
                </span>
              </div>

              <div style={styles.candidateManageGrid}>
                <div style={styles.candidateFormCard}>
                  <h3 style={styles.formTitle}>Add Candidate</h3>

                  <form onSubmit={addCandidate}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Candidate Name</label>
                      <input
                        style={styles.input}
                        type="text"
                        name="candidateName"
                        value={candidateForm.candidateName}
                        onChange={handleCandidateChange}
                        placeholder="Enter candidate name"
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Party Name</label>
                      <input
                        style={styles.input}
                        type="text"
                        name="partyName"
                        value={candidateForm.partyName}
                        onChange={handleCandidateChange}
                        placeholder="Enter party name"
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Symbol Image URL</label>
                      <input
                        style={styles.input}
                        type="text"
                        name="symbolUrl"
                        value={candidateForm.symbolUrl}
                        onChange={handleCandidateChange}
                        placeholder="Paste symbol image URL"
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Photo URL</label>
                      <input
                        style={styles.input}
                        type="text"
                        name="photoUrl"
                        value={candidateForm.photoUrl}
                        onChange={handleCandidateChange}
                        placeholder="Paste candidate photo URL"
                      />
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Description</label>
                      <textarea
                        style={styles.textarea}
                        name="description"
                        value={candidateForm.description}
                        onChange={handleCandidateChange}
                        placeholder="Enter short description"
                      />
                    </div>

                    <button
                      type="submit"
                      style={styles.addCandidateBtn}
                      disabled={addingCandidate}
                    >
                      {addingCandidate ? "Adding..." : "Add Candidate"}
                    </button>
                  </form>
                </div>

                <div style={styles.candidateListCard}>
                  <div style={styles.panelHeader}>
                    <h2 style={styles.sectionTitle}>Candidate List</h2>
                    <span style={styles.miniInfo}>
                      Active: {candidates.length}
                    </span>
                  </div>

                  <div style={styles.candidateListWrap}>
                    {candidates.length > 0 ? (
                      candidates.map((candidate) => (
                        <div
                          key={candidate._id}
                          style={styles.candidateItemCard}
                        >
                          <div style={styles.candidateItemTop}>
                            <div style={styles.candidateMediaWrap}>
                              <img
                                src={
                                  candidate.photoUrl ||
                                  candidate.symbolUrl ||
                                  "https://via.placeholder.com/80?text=Image"
                                }
                                alt={candidate.candidateName}
                                style={styles.candidateImage}
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/80?text=Image";
                                }}
                              />
                            </div>

                            <div style={styles.candidateTextWrap}>
                              <h3 style={styles.candidateItemName}>
                                {candidate.candidateName}
                              </h3>
                              <p style={styles.candidateItemParty}>
                                {candidate.partyName}
                              </p>
                              {candidate.description ? (
                                <p style={styles.candidateItemDesc}>
                                  {candidate.description}
                                </p>
                              ) : null}
                            </div>
                          </div>

                          <div style={styles.candidateActionRow}>
                            <button
                              style={{
                                ...styles.deleteCandidateBtn,
                                opacity:
                                  deletingCandidateId === candidate._id ? 0.7 : 1,
                              }}
                              onClick={() => deleteCandidate(candidate._id)}
                              disabled={deletingCandidateId === candidate._id}
                            >
                              {deletingCandidateId === candidate._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={styles.noData}>No candidates added yet.</p>
                    )}
                  </div>
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
  results.map((item, index) => {
    const matchedCandidate = candidates.find(
      (candidate) =>
        candidate.candidateName === item.candidateName &&
        candidate.partyName === item.partyName
    );

    const imageSrc =
      matchedCandidate?.photoUrl ||
      matchedCandidate?.symbolUrl ||
      "https://via.placeholder.com/80?text=Candidate";

    return (
      <div key={index} style={styles.partyCard}>
        <div style={styles.resultCardTop}>
          <div style={styles.resultImageWrap}>
            <img
              src={imageSrc}
              alt={item.candidateName}
              style={styles.resultCandidateImage}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/80?text=Candidate";
              }}
            />
          </div>

          <div style={styles.resultCandidateRow}>
            <div style={styles.resultCandidateText}>
              <h2 style={styles.partyName}>{item.candidateName}</h2>
              <p style={styles.resultPartyText}>{item.partyName}</p>
            </div>

            <span style={styles.voteCount}>{item.votes} votes</span>
          </div>
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
    );
  })
) : (
  <p style={styles.noData}>No votes available yet.</p>
)}
                  {winner && (
  <div style={styles.winnerBox}>
    🏆 Winner: <strong>{winner.candidateName}</strong> from{" "}
    <strong>{winner.partyName}</strong> with <strong>{winner.votes}</strong> votes
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
                  placeholder="Search name, email, ID, party, mobile"
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
                                  <span style={styles.emailSmall}>
                                    {voter.mobile || "No mobile"}
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
  resultCardTop: {
  display: "flex",
  gap: "14px",
  alignItems: "center",
  marginBottom: "12px",
  flexWrap: "wrap",
},
resultCandidateRow: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flex: 1,
  minWidth: "220px",
  flexWrap: "wrap",
  gap: "8px",
},
resultImageWrap: {
  flexShrink: 0,
},
resultCandidateImage: {
  width: "72px",
  height: "72px",
  borderRadius: "14px",
  objectFit: "cover",
  border: "1px solid #cbd5e1",
  background: "#fff",
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
  pendingSection: {
    background: "#f8fafc",
    borderRadius: "18px",
    padding: "20px",
    marginBottom: "18px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  },
  pendingHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  pendingTitle: {
    margin: 0,
    fontSize: "28px",
    color: "#0f172a",
  },
  pendingCount: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "8px 14px",
    borderRadius: "999px",
    fontWeight: "bold",
    fontSize: "14px",
  },
  pendingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "16px",
    alignItems: "stretch",
  },
  pendingCard: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "220px",
  },
  pendingTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "10px",
    marginBottom: "14px",
  },
  pendingUserText: {
    flex: 1,
    minWidth: 0,
  },
  pendingName: {
    margin: "0 0 6px 0",
    fontSize: "20px",
    color: "#0f172a",
    lineHeight: "1.3",
    wordBreak: "break-word",
  },
  pendingEmail: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
    wordBreak: "break-word",
    lineHeight: "1.4",
  },
  pendingBadge: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "6px 10px",
    borderRadius: "999px",
    fontWeight: "bold",
    fontSize: "12px",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  pendingInfoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginBottom: "16px",
  },
  pendingInfoItem: {
    background: "#f8fafc",
    borderRadius: "12px",
    padding: "10px",
    minWidth: 0,
  },
  pendingLabel: {
    display: "block",
    fontSize: "12px",
    color: "#64748b",
    marginBottom: "5px",
    fontWeight: "bold",
  },
  pendingValue: {
    fontSize: "14px",
    color: "#0f172a",
    wordBreak: "break-word",
    lineHeight: "1.4",
  },
  pendingActionRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "auto",
  },
  approveButton: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "11px 16px",
    borderRadius: "10px",
    fontWeight: "bold",
    fontSize: "14px",
    minWidth: "130px",
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