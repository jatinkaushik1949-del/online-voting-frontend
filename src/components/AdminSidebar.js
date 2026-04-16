import React from "react";

function AdminSidebar({ activeTab, setActiveTab }) {
  const items = [
    { key: "dashboard", label: "Dashboard" },
    { key: "election", label: "Election Control" },
    { key: "results", label: "Results" },
    { key: "voters", label: "Voter Activity" },
    { key: "security", label: "Security" }
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="admin-brand-badge">EC</div>
        <div>
          <h3>Election Admin</h3>
          <p>Control Panel</p>
        </div>
      </div>

      <div className="admin-menu">
        {items.map((item) => (
          <button
            key={item.key}
            className={`admin-menu-item ${activeTab === item.key ? "active" : ""}`}
            onClick={() => setActiveTab(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

export default AdminSidebar;