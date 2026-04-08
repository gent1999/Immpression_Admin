import React, { useState } from "react";
import "@styles/toppanel.css";

export default function OrdersTopPanel({
  totalOrders = 0,
  completedOrders = 0,
  pendingOrders = 0,
  cancelledOrders = 0,
  onShowAllOrders,
  onFilterCompleted,
  onFilterPending,
  onFilterCancelled,
  onSearch,
  pageSize,
  handlePageSizeChange,
}) {
  const [activeFilter, setActiveFilter] = useState("all");

  const handleFilterClick = (filterType, callback) => {
    setActiveFilter(filterType);
    callback();
  };

  const statCards = [
    { label: "All Orders",  value: totalOrders,     filter: "all",       onClick: () => handleFilterClick("all",       onShowAllOrders) },
    { label: "Completed",   value: completedOrders, filter: "completed", onClick: () => handleFilterClick("completed", onFilterCompleted) },
    { label: "Pending",     value: pendingOrders,   filter: "pending",   onClick: () => handleFilterClick("pending",   onFilterPending) },
    { label: "Cancelled",   value: cancelledOrders, filter: "cancelled", onClick: () => handleFilterClick("cancelled", onFilterCancelled) },
  ];

  return (
    <div className="top-panel-container">
      <div className="admin-header">
        <h1>Orders</h1>
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
                <div className="stat-value">{s.value.toLocaleString()}</div>
                <div className="stat-title">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="search-view-container">
          <input
            type="text"
            className="searchInput"
            placeholder="Search by order ID or customer…"
            onChange={(e) => onSearch(e.target.value)}
          />
          <div className="selectPageSize">
            <label>Per page:</label>
            <select value={pageSize} onChange={handlePageSizeChange}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
