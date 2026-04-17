import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "https://online-voting-system-full-1.onrender.com";

function Vote() {
  const [selectedParty, setSelectedParty] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (!savedUser) {
      alert("Please login first");
      window.location.href = "/";
      return;
    }

    if (savedUser.hasVoted) {
      alert("You have already voted");
    }

    setUser(savedUser);
  }, []);

  const handleVote = async () => {
    if (!selectedParty) {
      alert("Please select a party");
      return;
    }

    if (!user) return;

    try {
      const res = await axios.post(`${API}/api/vote`, {
        userId: user.id,
        party: selectedParty
      });

      alert(res.data.message);

      const updatedUser = { ...user, hasVoted: true };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      window.location.href = "/results";
    } catch (error) {
      alert(error.response?.data?.message || "Vote failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Vote Page</h2>

      <div>
        <input
          type="radio"
          name="party"
          value="CONGRESS"
          onChange={(e) => setSelectedParty(e.target.value)}
        />
        CONGRESS
      </div>

      <div>
        <input
          type="radio"
          name="party"
          value="BJP"
          onChange={(e) => setSelectedParty(e.target.value)}
        />
        BJP
      </div>

      <div>
        <input
          type="radio"
          name="party"
          value="BSP"
          onChange={(e) => setSelectedParty(e.target.value)}
        />
        BSP
      </div>

      <div>
        <input
          type="radio"
          name="party"
          value="INLD"
          onChange={(e) => setSelectedParty(e.target.value)}
        />
        INLD
      </div>

      <br />
      <button onClick={handleVote}>Submit Vote</button>
    </div>
  );
}

export default Vote;