import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import { Pagination } from "./Pagination";
import { useAuth } from "@/context/authContext";
import { useDebounce } from "@/hooks/useDebounce";
import { getAllReports, getReportsStats } from "../api/API";

import "@styles/reports.css";

const formatTimeRemaining = (deadline) => {
  if (!deadline) return "—";
  const diff = new Date(deadline) - new Date();
  if (diff <= 0) return "OVERDUE";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

function Reports() {
  const DEFAULT_PAGE = 1;
  const DEFAULT_PAGE_SIZE = 20;
  const DELAY_TIME = 500;

  const navigate = useNavigate();
  const { authState } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(DEFAULT_PAGE);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce({ value: query, delay: DELAY_TIME });

  const [stats, setStats] = useState({
    total: 0, pending: 0, underReview: 0, resolved: 0, dismissed: 0, overdue: 0,
  });

  useEffect(() => { setPage(1); }, [debouncedQuery, statusFilter, typeFilter]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!authState?.token) return;
      const response = await getReportsStats(authState.token);
      if (response.success && response.data) {
        const d = response.data;
        setStats({
          total: (d.byStatus?.pending || 0) + (d.byStatus?.underReview || 0) +
                 (d.byStatus?.resolved || 0) + (d.byStatus?.dismissed || 0),
          pending:     d.byStatus?.pending    || 0,
          underReview: d.byStatus?.underReview || 0,
          resolved:    d.byStatus?.resolved   || 0,
          dismissed:   d.byStatus?.dismissed  || 0,
          overdue:     d.sla?.breached        || 0,
        });
      }
    };
    fetchStats();
  }, [authState?.token]);

  useEffect(() => {
    const fetchData = async () => {
      if (!authState?.token) { navigate("/login"); return; }
      setLoading(true);
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (typeFilter)   filters.type   = typeFilter;
      const response = await getAllReports(authState.token, page, pageSize, filters);
      const reportData = Array.isArray(response.data?.reports) ? response.data.reports : [];
      setReports(reportData);
      setTotalPages(response.data?.pagination?.totalPages || 1);
      setLoading(false);
    };
    fetchData();
  }, [authState?.token, page, pageSize, debouncedQuery, statusFilter, typeFilter, navigate]);

  const handlePageChange = (value) => {
    if (value < 1 || value > totalPages) return;
    setPage(value);
  };

  const filteredReports = useMemo(() => {
    const arr = Array.isArray(reports) ? reports : [];
    if (!debouncedQuery) return arr;
    const lower = debouncedQuery.toLowerCase();
    return arr.filter((r) =>
      r._id?.toLowerCase().includes(lower) || r.reason?.toLowerCase().includes(lower)
    );
  }, [reports, debouncedQuery]);

  const statCards = [
    { label: "All",          value: stats.total,       filter: "" },
    { label: "Pending",      value: stats.pending,     filter: "pending" },
    { label: "Under Review", value: stats.underReview, filter: "under_review" },
    { label: "Resolved",     value: stats.resolved,    filter: "resolved" },
    { label: "Dismissed",    value: stats.dismissed,   filter: "dismissed" },
  ];

  return (
    <ScreenTemplate>
      <div className="rp-page">

        {/* ─── Panel ─── */}
        <div className="top-panel-container">
          <div className="admin-header">
            <h1>Reports</h1>
          </div>

          <div className="panel">
            <div className="stats-container">
              {statCards.map((s) => (
                <div
                  key={s.filter}
                  className={`stat-item ${statusFilter === s.filter ? "active" : ""}`}
                  onClick={() => setStatusFilter(s.filter)}
                >
                  <div className="stat-content">
                    <div className="stat-value">{s.value.toLocaleString()}</div>
                    <div className="stat-title">{s.label}</div>
                  </div>
                </div>
              ))}
              {stats.overdue > 0 && (
                <div className="stat-item rp-overdue-stat">
                  <div className="stat-content">
                    <div className="stat-value">{stats.overdue}</div>
                    <div className="stat-title">Overdue</div>
                  </div>
                </div>
              )}
            </div>

            <div className="search-view-container">
              <input
                type="text"
                className="searchInput"
                placeholder="Search by ID or reason…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="selectPageSize">
                <label>Type:</label>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="">All</option>
                  <option value="image">Image</option>
                  <option value="user">User</option>
                </select>
              </div>
              <div className="selectPageSize">
                <label>Per page:</label>
                <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Content ─── */}
        <div className="rp-content">
          {loading ? (
            <div className="rp-loading">
              <div className="rp-spinner"></div>
              <p>Loading reports…</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="rp-empty">
              <p>No reports found.</p>
            </div>
          ) : (
            <div className="rp-table-wrap">
              <table className="rp-table">
                <thead>
                  <tr>
                    <th>SLA</th>
                    <th>Type</th>
                    <th>Reason</th>
                    <th>Reporter</th>
                    <th>Reported</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((report) => {
                    const timeRemaining = formatTimeRemaining(report.slaDeadline);
                    const isOverdue = timeRemaining === "OVERDUE";
                    const status = report.status || "pending";

                    return (
                      <tr
                        key={report._id || report.id}
                        onClick={() => navigate(`/report/${report._id || report.id}`)}
                        className={isOverdue ? "rp-row--overdue" : ""}
                      >
                        <td>
                          <span className={`rp-sla ${isOverdue ? "rp-sla--overdue" : ""}`}>
                            {timeRemaining}
                          </span>
                        </td>
                        <td>
                          <span className="rp-type">
                            {report.targetType === "image" ? "Image" : "User"}
                          </span>
                        </td>
                        <td className="rp-reason">
                          {report.reason?.replace(/_/g, " ")}
                        </td>
                        <td>{report.reporterUserId?.name || "Unknown"}</td>
                        <td>
                          {report.targetType === "image"
                            ? (report.targetImageId?.name || report.contentSnapshot?.imageName || "Deleted Image")
                            : (report.targetUserId?.name || report.contentSnapshot?.userName || "Unknown User")}
                        </td>
                        <td>
                          <span className={`rp-status rp-status--${status}`}>
                            {status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="rp-date">
                          {new Date(report.createdAt).toLocaleDateString("en-US", {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {filteredReports.length > 0 && (
            <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
          )}
        </div>

      </div>
    </ScreenTemplate>
  );
}

export default Reports;
