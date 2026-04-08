import React from "react";
import "@styles/toppanel.css";

export default function UserTopPanel({
  totalUsers,
  totalLinked,
  totalUnlinked,
  onShowAllUsers,
  onFilterLinked,
  onFilterUnlinked,
  onSearch,
  activeFilter,
}) {
  const statCards = [
    { label: "All Users",       value: totalUsers,      filter: "all",        onClick: onShowAllUsers },
    { label: "Stripe Linked",   value: totalLinked,     filter: "linked",     onClick: onFilterLinked },
    { label: "Not Linked",      value: totalUnlinked,   filter: "unlinked",   onClick: onFilterUnlinked },
  ];

  return (
    <div className="top-panel-container">
      <div className="admin-header">
        <h1>User Base</h1>
      </div>

      <div className="panel">
        <div className="stats-container">
          {statCards.map((s) => (
            <div
              key={s.filter}
              className={`stat-item ${activeFilter === s.filter ? "active" : ""}`}
              onClick={s.onClick}
            >
              <div className="stat-content">
                <div className="stat-value">{(s.value || 0).toLocaleString()}</div>
                <div className="stat-title">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="search-view-container">
          <input
            type="text"
            className="searchInput"
            placeholder="Search by name or email…"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
