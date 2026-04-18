import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../config";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!location.state?.email) {
      const savedPendingEmail = localStorage.getItem("pendingVerifyEmail");
      if (savedPendingEmail) {
        setEmail(savedPendingEmail);
      }
    } else {
      localStorage.setItem("pendingVerifyEmail", location.state.email);
    }
  }, [location.state]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email.trim() || !otp.trim()) {
      alert("Please enter OTP");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setVerified(true);
        setMessage(
          data.message || "Email verified successfully. Wait for admin approval."
        );
        localStorage.removeItem("pendingVerifyEmail");
      } else {
        alert(data.message || "Verification failed");
      }
    } catch (error) {
      console.error("Verify email error:", error);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email.trim()) {
      alert("Email missing");
      return;
    }

    setResending(true);

    try {
      const res = await fetch(`${API}/api/resend-otp`, {
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
        alert(data.message || "OTP resent successfully");
      } else {
        alert(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      alert("Server error");
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Verify Email</h1>
        <p style={styles.subText}>Enter the OTP sent to your email address</p>

        {!verified ? (
          <form onSubmit={handleVerify} style={styles.form}>
            <input
              style={{ ...styles.input, background: "#f8fafc" }}
              type="email"
              value={email}
              readOnly
            />

            <input
              style={styles.input}
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            <button
              type="button"
              style={styles.secondaryButton}
              onClick={handleResendOtp}
              disabled={resending}
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>

            <button
              type="button"
              style={styles.backButton}
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </form>
        ) : (
          <div style={styles.successBox}>
            <p style={styles.successText}>{message}</p>

            <div style={styles.buttonRow}>
              <button style={styles.button} onClick={() => navigate("/")}>
                Back to Login
              </button>

              <button style={styles.secondaryButton} onClick={() => navigate("/")}>
                Go to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #1d4ed8)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "30px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  heading: {
    textAlign: "center",
    marginBottom: "10px",
  },
  subText: {
    textAlign: "center",
    color: "#555",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  input: {
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
  },
  secondaryButton: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
  },
  backButton: {
    background: "#64748b",
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
  },
  successBox: {
    textAlign: "center",
  },
  successText: {
    fontSize: "18px",
    color: "#0f172a",
    marginBottom: "20px",
    lineHeight: "1.6",
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
};

export default VerifyEmail;