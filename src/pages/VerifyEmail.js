import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../config";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email.trim() || !otp.trim()) {
      alert("Please enter email and OTP");
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
        alert("Email verified successfully. Wait for admin approval.");
        navigate("/");
      } else {
        alert(data.message || "Verification failed");
      }
    } catch (error) {
  console.error("Verify email error:", error);
  alert(error.message || "Server error");
} finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      alert("Enter email first");
      return;
    }

    setResending(true);

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
    alert("Email verified successfully. Wait for admin approval.");
    navigate("/");
  } else {
    alert(data.message || "Verification failed");
  }
} catch (error) {
  console.error("Verify email error:", error);
  alert("Server error");
}

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Verify Email</h1>
        <p style={styles.subText}>Enter the OTP sent to your email</p>

        <form onSubmit={handleVerify} style={styles.form}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            style={styles.input}
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            maxLength="6"
          />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Verify Email"}
          </button>
        </form>

        <button
          style={styles.resendBtn}
          onClick={handleResend}
          disabled={resending}
        >
          {resending ? "Resending..." : "Resend OTP"}
        </button>
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
    maxWidth: "450px",
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
  resendBtn: {
    width: "100%",
    marginTop: "14px",
    background: "#e5e7eb",
    color: "#111827",
    border: "none",
    padding: "14px",
    borderRadius: "10px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default VerifyEmail;