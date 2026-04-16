import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    voterId: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const API = "https://online-voting-system-full-3.onrender.com";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const { name, email, voterId, password } = formData;

    if (!name.trim() || !email.trim() || !voterId.trim()) {
      alert("Please fill name, email and voter ID");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          voterId: voterId.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Registration successful");
        navigate("/");
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
  console.error("Register error:", error);
  alert("Server error: " + error.message);
}
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Voter Registration</h1>
        <p style={styles.subText}>Create your voter account</p>

        <form onSubmit={handleRegister} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            style={styles.input}
            type="text"
            name="voterId"
            placeholder="Voter ID"
            value={formData.voterId}
            onChange={handleChange}
          />

          <input
            style={styles.input}
            type="password"
            name="password"
            placeholder="Password (optional)"
            value={formData.password}
            onChange={handleChange}
          />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Please wait..." : "Register"}
          </button>
        </form>

        <p style={styles.linkText}>
          Already registered? <Link to="/">Login here</Link>
        </p>
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
  linkText: {
    textAlign: "center",
    marginTop: "18px",
  },
};

export default Register;