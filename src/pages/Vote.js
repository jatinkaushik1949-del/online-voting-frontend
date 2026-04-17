import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../config";

function Vote() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser =
      JSON.parse(localStorage.getItem("voter")) ||
      JSON.parse(localStorage.getItem("user"));

    if (!savedUser) {
      alert("Please login first");
      window.location.href = "/";
      return;
    }

    if (savedUser.hasVoted) {
      alert("You have already voted");
      window.location.href = "/results";
      return;
    }

    setUser(savedUser);
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await axios.get(`${API}/api/candidates`);

      if (res.data.success) {
        setCandidates(res.data.candidates || []);
      } else {
        setCandidates([]);
      }
    } catch (error) {
      console.log("Fetch candidates error:", error);
      alert("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedCandidate) {
      alert("Please select a candidate");
      return;
    }

    if (!user) return;

    try {
      setSubmitting(true);

      const res = await axios.post(`${API}/api/vote`, {
        email: user.email,
        candidateId: selectedCandidate,
      });

      if (res.data.success) {
        alert(res.data.message);

        const updatedUser = { ...user, hasVoted: true };
        localStorage.setItem("voter", JSON.stringify(updatedUser));
        localStorage.setItem("user", JSON.stringify(updatedUser));

        window.location.href = "/results";
      } else {
        alert(res.data.message || "Vote failed");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Vote failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h2 style={styles.heading}>Loading candidates...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.heading}>Cast Your Vote</h1>
        <p style={styles.subHeading}>
          Select one candidate carefully. You can vote only once.
        </p>

        {candidates.length === 0 ? (
          <div style={styles.emptyBox}>
            No candidates available for this election.
          </div>
        ) : (
          <div style={styles.grid}>
            {candidates.map((candidate) => (
              <label
                key={candidate._id}
                style={{
                  ...styles.card,
                  border:
                    selectedCandidate === candidate._id
                      ? "2px solid #2563eb"
                      : "1px solid #e2e8f0",
                  boxShadow:
                    selectedCandidate === candidate._id
                      ? "0 8px 20px rgba(37,99,235,0.18)"
                      : "0 4px 12px rgba(0,0,0,0.06)",
                }}
              >
                <input
                  type="radio"
                  name="candidate"
                  value={candidate._id}
                  checked={selectedCandidate === candidate._id}
                  onChange={(e) => setSelectedCandidate(e.target.value)}
                  style={styles.radio}
                />

                <div style={styles.mediaRow}>
                  <img
                    src={
                      candidate.photoUrl ||
                      candidate.symbolUrl ||
                      "https://via.placeholder.com/110?text=Candidate"
                    }
                    alt={candidate.candidateName}
                    style={styles.image}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/110?text=Candidate";
                    }}
                  />
                </div>

                <h2 style={styles.name}>{candidate.candidateName}</h2>
                <p style={styles.party}>{candidate.partyName}</p>

                {candidate.description ? (
                  <p style={styles.description}>{candidate.description}</p>
                ) : (
                  <p style={styles.description}>No description available.</p>
                )}
              </label>
            ))}
          </div>
        )}

        <div style={styles.actionRow}>
          <button
            style={styles.backButton}
            onClick={() => (window.location.href = "/")}
          >
            Back Home
          </button>

          <button
            style={styles.voteButton}
            onClick={handleVote}
            disabled={submitting || candidates.length === 0}
          >
            {submitting ? "Submitting..." : "Submit Vote"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #1e293b, #334155)",
    padding: "24px 12px",
    fontFamily: "Arial, sans-serif",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "24px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  heading: {
    marginTop: 0,
    marginBottom: "8px",
    fontSize: "36px",
    color: "#0f172a",
    textAlign: "center",
  },
  subHeading: {
    textAlign: "center",
    color: "#475569",
    fontSize: "17px",
    marginBottom: "24px",
  },
  emptyBox: {
    background: "#f8fafc",
    borderRadius: "16px",
    padding: "24px",
    textAlign: "center",
    color: "#475569",
    fontSize: "18px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "18px",
  },
  card: {
    position: "relative",
    background: "#ffffff",
    borderRadius: "18px",
    padding: "18px",
    cursor: "pointer",
    transition: "0.25s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  radio: {
    position: "absolute",
    top: "16px",
    right: "16px",
    transform: "scale(1.2)",
  },
  mediaRow: {
    marginTop: "8px",
    marginBottom: "14px",
  },
  image: {
    width: "110px",
    height: "110px",
    objectFit: "cover",
    borderRadius: "16px",
    border: "1px solid #cbd5e1",
    background: "#fff",
  },
  name: {
    margin: "0 0 8px 0",
    fontSize: "24px",
    color: "#0f172a",
    textAlign: "center",
  },
  party: {
    margin: "0 0 8px 0",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#2563eb",
    textAlign: "center",
  },
  description: {
    margin: 0,
    fontSize: "14px",
    color: "#64748b",
    textAlign: "center",
    lineHeight: "1.5",
  },
  actionRow: {
    display: "flex",
    justifyContent: "center",
    gap: "14px",
    flexWrap: "wrap",
    marginTop: "28px",
  },
  backButton: {
    background: "#64748b",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "10px",
    fontSize: "15px",
    cursor: "pointer",
  },
  voteButton: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "12px 20px",
    borderRadius: "10px",
    fontSize: "15px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default Vote;