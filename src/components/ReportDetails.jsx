import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import { useAuth } from "@/context/authContext";
import {
  getReportById,
  updateReportStatus,
  warnReportedUser,
  suspendReportedUser,
  banReportedUser,
  removeReportedContent,
  dismissReport,
} from "../api/API";
import "@styles/reportdetails.css";

const formatTimeRemaining = (deadline) => {
  if (!deadline) return "—";
  const diff = new Date(deadline) - new Date();
  if (diff <= 0) return "OVERDUE";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

export default function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authState } = useAuth();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState(null);

  const [showActionForm, setShowActionForm] = useState(null);
  const [warnMessage, setWarnMessage] = useState("");
  const [suspendDays, setSuspendDays] = useState(7);
  const [suspendMessage, setSuspendMessage] = useState("");
  const [banReason, setBanReason] = useState("");
  const [dismissReason, setDismissReason] = useState("");

  const notify = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 5000);
  };

  const loadReport = async () => {
    if (!authState?.token) { navigate("/login"); return; }
    try {
      const response = await getReportById(id, authState.token);
      setReport(response.data?.report || response.data);
    } catch (e) {
      notify("error", e.message || "Failed to load report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, [authState?.token, id]); // eslint-disable-line

  const handleAction = async (action) => {
    setActionLoading(true);
    setNotice(null);
    try {
      let response;
      switch (action) {
        case "review":   response = await updateReportStatus(id, "under_review", authState.token); break;
        case "warn":     response = await warnReportedUser(id, warnMessage, authState.token); setWarnMessage(""); break;
        case "suspend":  response = await suspendReportedUser(id, suspendDays, suspendMessage, authState.token); setSuspendMessage(""); break;
        case "ban":      response = await banReportedUser(id, banReason, authState.token); setBanReason(""); break;
        case "remove":   response = await removeReportedContent(id, authState.token); break;
        case "dismiss":  response = await dismissReport(id, dismissReason, authState.token); setDismissReason(""); break;
        default: throw new Error("Unknown action");
      }
      notify("success", response.message || "Action completed.");
      setShowActionForm(null);
      await loadReport();
    } catch (e) {
      notify("error", e.message || "Action failed. Try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading)
    return <ScreenTemplate><div className="rd-center">Loading…</div></ScreenTemplate>;
  if (!report)
    return <ScreenTemplate><div className="rd-center">Report not found.</div></ScreenTemplate>;

  const timeRemaining = formatTimeRemaining(report.slaDeadline);
  const isOverdue = timeRemaining === "OVERDUE";
  const status = report.status || "pending";
  const badgeClass = isOverdue ? "rd-badge--overdue" : `rd-badge--${status}`;
  const reportType = report.targetType || "image";
  const reportedUser = report.targetUserId || {};
  const reporter = report.reporterUserId || {};
  const reportedImage = report.targetImageId || {};
  const isDone = status === "resolved" || status === "dismissed";
  const hasImage = reportType === "image" &&
    (report.contentSnapshot?.imageLink || reportedImage?.imageLink);

  return (
    <ScreenTemplate>
      <div className="rd-page">

        {/* ─── Breadcrumb ─── */}
        <div className="rd-breadcrumb">
          <button className="rd-back" onClick={() => navigate(-1)}>← Reports</button>
          <span className="rd-breadcrumb-sep">/</span>
          <span className="rd-breadcrumb-current">
            {report.reason?.replace(/_/g, " ")}
          </span>
        </div>

        {/* ─── Notice ─── */}
        {notice && (
          <div className={`rd-notice rd-notice--${notice.type}`}>{notice.text}</div>
        )}

        {/* ─── Layout ─── */}
        <div className="rd-layout">

          {/* LEFT — image or placeholder */}
          <div className="rd-left-col">
            {hasImage ? (
              <img
                className="rd-content-img"
                src={report.contentSnapshot?.imageLink || reportedImage?.imageLink}
                alt="Reported content"
              />
            ) : (
              <div className="rd-no-image">
                {reportType === "user" ? "User Report" : "No Image"}
              </div>
            )}

            {/* SLA */}
            <div className={`rd-sla-box ${isOverdue ? "rd-sla-box--overdue" : "rd-sla-box--ok"}`}>
              <div className={`rd-sla-value ${isOverdue ? "rd-sla-value--overdue" : "rd-sla-value--ok"}`}>
                {timeRemaining}
              </div>
              <div className="rd-sla-label">
                {isOverdue ? "Action required immediately" : "SLA time remaining"}
              </div>
            </div>
          </div>

          {/* RIGHT — all info + actions */}
          <div className="rd-right-col">

            {/* Identity block */}
            <div>
              <div className="rd-type-label">{reportType === "image" ? "Image Report" : "User Report"}</div>
              <h1 className="rd-title">{report.reason?.replace(/_/g, " ")}</h1>
              <p className="rd-submitted">
                Reported by {reporter.name || "Unknown"} &nbsp;·&nbsp;{" "}
                {new Date(report.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              </p>
              <div className="rd-status-row">
                <span className={`rd-badge ${badgeClass}`}>
                  {isOverdue ? "Overdue" : status.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <div className="rd-divider" />

            {/* Specs */}
            <div className="rd-specs">
              <div className="rd-spec">
                <span className="rd-spec-label">Reported</span>
                <span className="rd-spec-value">
                  {reportType === "image"
                    ? (reportedImage?.name || report.contentSnapshot?.imageName || "Deleted Image")
                    : (reportedUser?.name || report.contentSnapshot?.userName || "Unknown User")}
                </span>
              </div>
              <div className="rd-spec">
                <span className="rd-spec-label">Reporter</span>
                <span className="rd-spec-value">{reporter.name || "—"}</span>
              </div>
              <div className="rd-spec">
                <span className="rd-spec-label">Reporter Email</span>
                <span className="rd-spec-value">{reporter.email || "—"}</span>
              </div>
              <div className="rd-spec">
                <span className="rd-spec-label">SLA At Risk</span>
                <span className="rd-spec-value">{report.slaAtRisk ? "Yes" : "No"}</span>
              </div>
              {reportType === "user" && (
                <>
                  <div className="rd-spec">
                    <span className="rd-spec-label">User Email</span>
                    <span className="rd-spec-value">{reportedUser.email || "—"}</span>
                  </div>
                  <div className="rd-spec">
                    <span className="rd-spec-label">Account Status</span>
                    <span className="rd-spec-value">{reportedUser.moderationStatus || "active"}</span>
                  </div>
                </>
              )}
              <div className="rd-spec rd-spec--full">
                <span className="rd-spec-label">Report ID</span>
                <span className="rd-spec-value rd-spec-value--mono">{report._id}</span>
              </div>
            </div>

            {/* Description */}
            {report.description && (
              <>
                <div className="rd-divider" />
                <p className="rd-description">{report.description}</p>
              </>
            )}

            <div className="rd-divider" />

            {/* Actions */}
            <div className="rd-actions">
              {isDone ? (
                <div className="rd-resolved-note">
                  This report has been <strong>{status}</strong>.
                  {report.resolutionAction && (
                    <> Resolution: <strong>{report.resolutionAction.replace(/_/g, " ")}</strong>.</>
                  )}
                </div>
              ) : (
                <>
                  {!showActionForm && (
                    <>
                      {status === "pending" && (
                        <button className="rd-btn rd-btn--review" onClick={() => handleAction("review")} disabled={actionLoading}>
                          Mark as Under Review
                        </button>
                      )}
                      <div className="rd-btn-grid">
                        <button className="rd-btn rd-btn--warn"    onClick={() => setShowActionForm("warn")}    disabled={actionLoading}>Warn User</button>
                        <button className="rd-btn rd-btn--suspend" onClick={() => setShowActionForm("suspend")} disabled={actionLoading}>Suspend User</button>
                        <button className="rd-btn rd-btn--ban"     onClick={() => setShowActionForm("ban")}     disabled={actionLoading}>Ban User</button>
                        {reportType === "image" && (
                          <button className="rd-btn rd-btn--remove" onClick={() => setShowActionForm("remove")} disabled={actionLoading}>Remove Content</button>
                        )}
                      </div>
                      <button className="rd-btn rd-btn--dismiss" onClick={() => setShowActionForm("dismiss")} disabled={actionLoading}>
                        Dismiss Report
                      </button>
                    </>
                  )}

                  {showActionForm === "warn" && (
                    <div className="rd-form">
                      <span className="rd-spec-label">Warning Message</span>
                      <textarea rows={3} placeholder="Enter warning message for the user…" value={warnMessage} onChange={(e) => setWarnMessage(e.target.value)} />
                      <div className="rd-form-row">
                        <button className="rd-btn rd-btn--confirm" onClick={() => handleAction("warn")} disabled={actionLoading || !warnMessage.trim()}>Send Warning</button>
                        <button className="rd-btn rd-btn--ghost"   onClick={() => setShowActionForm(null)}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {showActionForm === "suspend" && (
                    <div className="rd-form">
                      <span className="rd-spec-label">Duration (days)</span>
                      <input type="number" value={suspendDays} min={1} max={365} onChange={(e) => setSuspendDays(Number(e.target.value))} />
                      <span className="rd-spec-label">Reason</span>
                      <textarea rows={3} placeholder="Suspension reason…" value={suspendMessage} onChange={(e) => setSuspendMessage(e.target.value)} />
                      <div className="rd-form-row">
                        <button className="rd-btn rd-btn--confirm" onClick={() => handleAction("suspend")} disabled={actionLoading || !suspendMessage.trim()}>Suspend {suspendDays}d</button>
                        <button className="rd-btn rd-btn--ghost"   onClick={() => setShowActionForm(null)}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {showActionForm === "ban" && (
                    <div className="rd-form">
                      <span className="rd-spec-label">Ban Reason</span>
                      <textarea rows={3} placeholder="Enter reason for permanent ban…" value={banReason} onChange={(e) => setBanReason(e.target.value)} />
                      <div className="rd-form-row">
                        <button className="rd-btn rd-btn--ban"   onClick={() => handleAction("ban")} disabled={actionLoading || !banReason.trim()}>Permanently Ban</button>
                        <button className="rd-btn rd-btn--ghost" onClick={() => setShowActionForm(null)}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {showActionForm === "remove" && (
                    <div className="rd-form">
                      <span className="rd-spec-label">Remove Content</span>
                      <p className="rd-form-note">This will permanently delete the reported image.</p>
                      <div className="rd-form-row">
                        <button className="rd-btn rd-btn--remove" onClick={() => handleAction("remove")} disabled={actionLoading}>Confirm Remove</button>
                        <button className="rd-btn rd-btn--ghost"  onClick={() => setShowActionForm(null)}>Cancel</button>
                      </div>
                    </div>
                  )}

                  {showActionForm === "dismiss" && (
                    <div className="rd-form">
                      <span className="rd-spec-label">Dismiss Reason</span>
                      <textarea rows={3} placeholder="Enter reason for dismissing this report…" value={dismissReason} onChange={(e) => setDismissReason(e.target.value)} />
                      <div className="rd-form-row">
                        <button className="rd-btn rd-btn--dismiss" onClick={() => handleAction("dismiss")} disabled={actionLoading || !dismissReason.trim()}>Dismiss Report</button>
                        <button className="rd-btn rd-btn--ghost"   onClick={() => setShowActionForm(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Resolution history */}
            {report.resolutionAction && (
              <>
                <div className="rd-divider" />
                <div className="rd-specs">
                  <div className="rd-spec rd-spec--full">
                    <span className="rd-spec-label">Action Taken</span>
                    <span className="rd-spec-value" style={{ textTransform: "capitalize" }}>{report.resolutionAction.replace(/_/g, " ")}</span>
                  </div>
                  <div className="rd-spec rd-spec--full">
                    <span className="rd-spec-label">Resolution Notes</span>
                    <span className="rd-spec-value">{report.resolutionNotes || "—"}</span>
                  </div>
                  <div className="rd-spec">
                    <span className="rd-spec-label">Resolved By</span>
                    <span className="rd-spec-value">{report.resolvedByAdminId?.name || report.resolvedByAdminId || "—"}</span>
                  </div>
                  <div className="rd-spec">
                    <span className="rd-spec-label">Resolved At</span>
                    <span className="rd-spec-value">
                      {report.resolvedAt
                        ? new Date(report.resolvedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                        : "—"}
                    </span>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </ScreenTemplate>
  );
}
