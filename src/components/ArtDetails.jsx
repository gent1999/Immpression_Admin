import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import { getArtwork, approveArtwork, deleteArtwork } from "../api/API";
import "@styles/artdetails.css";
import { useAuth } from "@/context/authContext";

const fmt = (n) =>
  typeof n === "number" && Number.isFinite(n) ? n.toLocaleString() : "—";

function stagePill(stage) {
  const s = String(stage || "").toLowerCase();
  return s === "approved" ? "pill approved" : s === "rejected" ? "pill rejected" : "pill review";
}

export default function ArtDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authState } = useAuth();

  const [art, setArt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [actionStatus, setActionStatus] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (!authState?.token) { navigate("/login"); return; }
      try {
        const artwork = await getArtwork(id, authState.token);
        setArt(artwork);
      } catch (e) {
        console.error("Error fetching artwork:", e?.message || e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, authState?.token, navigate]);

  const dims = useMemo(() => {
    const d = art?.dimensions || {};
    const h = fmt(d.height), w = fmt(d.width), l = fmt(d.length);
    if (h === "—" && w === "—") return "—";
    return l !== "—" ? `${h}" × ${w}" × ${l}"` : `${h}" × ${w}"`;
  }, [art]);

  const notify = (type, msg) => {
    setActionStatus({ type, msg });
    setTimeout(() => setActionStatus(null), 4000);
  };

  const handleApprove = async () => {
    if (!authState?.token) return;
    try {
      await approveArtwork(id, authState.token);
      setArt((prev) => ({ ...prev, stage: "approved" }));
      notify("success", "Artwork approved.");
    } catch {
      notify("error", "Failed to approve.");
    }
  };

  const handleReject = async () => {
    if (!authState?.token) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/art/${id}/reject`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${authState.token}` },
          body: JSON.stringify({ rejectionMessage }),
        }
      );
      if (!res.ok) throw new Error();
      setArt((prev) => ({ ...prev, stage: "rejected" }));
      setShowRejectBox(false);
      notify("success", "Artwork rejected.");
    } catch {
      notify("error", "Failed to reject.");
    }
  };

  const handleDelete = async () => {
    if (!authState?.token) return;
    if (!window.confirm("Delete this artwork? This cannot be undone.")) return;
    try {
      await deleteArtwork(id, authState.token);
      navigate("/review-art");
    } catch {
      notify("error", "Failed to delete.");
    }
  };

  if (loading)
    return <ScreenTemplate><div className="pad">Loading artwork…</div></ScreenTemplate>;
  if (!art)
    return <ScreenTemplate><div className="pad">Artwork not found.</div></ScreenTemplate>;

  const stageLabel = art.stage === "review" ? "Pending" : (art.stage || "").charAt(0).toUpperCase() + (art.stage || "").slice(1);

  return (
    <ScreenTemplate>
      <div className="artd-page">

        {/* ─── Header ─── */}
        <div className="artd-header">
          <div className="left">
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
            <div className="titling">
              <h1 className="artd-title">{art.name}</h1>
              <p className="sub">
                by <strong>{art.artistName}</strong> · Uploaded{" "}
                {new Date(art.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </p>
            </div>
          </div>
          <span className={stagePill(art.stage)}>{stageLabel}</span>
        </div>

        {/* ─── Inline notification ─── */}
        {actionStatus && (
          <div className={`artd-notice artd-notice--${actionStatus.type}`}>
            {actionStatus.msg}
          </div>
        )}

        {/* ─── Two columns ─── */}
        <div className="artd-grid-2">

          {/* LEFT */}
          <div className="col">
            <div className="card">
              <img className="artd-image" src={art.imageLink} alt={art.name} />
            </div>

            <div className="card">
              <div className="card-head"><h3>Details</h3></div>
              <div className="card-body">
                <dl className="kv">
                  <dt>Category</dt>
                  <dd>{art.category || "—"}</dd>
                  <dt>Views</dt>
                  <dd>{fmt(art.views)}</dd>
                  <dt>Sold Status</dt>
                  <dd>{(art.soldStatus || "unsold").charAt(0).toUpperCase() + (art.soldStatus || "unsold").slice(1)}</dd>
                  <dt>Dimensions</dt>
                  <dd>{dims}</dd>
                  <dt>Weight</dt>
                  <dd>{art.weight ? `${art.weight} lbs` : "—"}</dd>
                  <dt>Signed</dt>
                  <dd>{art.isSigned ? "Yes" : "No"}</dd>
                  <dt>Framed</dt>
                  <dd>{art.isFramed ? "Yes" : "No"}</dd>
                </dl>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="col">

            <div className="card">
              <div className="card-head"><h3>Overview</h3></div>
              <div className="card-body">
                <dl className="kv">
                  <dt>Price</dt>
                  <dd>${fmt(art.price)}</dd>
                  {art.description && (
                    <>
                      <dt>Description</dt>
                      <dd className="wrap">{art.description}</dd>
                    </>
                  )}
                </dl>
              </div>
            </div>

            {(art.reviewedByEmail || art.rejectionMessage) && (
              <div className="card">
                <div className="card-head"><h3>Review Info</h3></div>
                <div className="card-body">
                  <dl className="kv">
                    {art.reviewedByEmail && (
                      <>
                        <dt>Reviewed By</dt>
                        <dd className="wrap">{art.reviewedByEmail}</dd>
                        <dt>Reviewed At</dt>
                        <dd>{art.reviewedAt ? new Date(art.reviewedAt).toLocaleString() : "—"}</dd>
                      </>
                    )}
                    {art.rejectionMessage && (
                      <>
                        <dt>Reason</dt>
                        <dd className="wrap">{art.rejectionMessage}</dd>
                      </>
                    )}
                  </dl>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-head"><h3>Actions</h3></div>
              <div className="card-body actions">
                {art.stage === "review" && (
                  <>
                    <button className="btn approve" onClick={handleApprove}>Approve</button>
                    {!showRejectBox ? (
                      <button className="btn reject" onClick={() => setShowRejectBox(true)}>Reject</button>
                    ) : (
                      <div className="reject-box">
                        <textarea
                          placeholder="Reason for rejection (optional)"
                          value={rejectionMessage}
                          onChange={(e) => setRejectionMessage(e.target.value)}
                          rows={3}
                        />
                        <button className="btn reject" onClick={handleReject}>Confirm Reject</button>
                        <button className="btn neutral" onClick={() => setShowRejectBox(false)}>Cancel</button>
                      </div>
                    )}
                  </>
                )}
                <button className="btn neutral" onClick={handleDelete}>Delete Artwork</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </ScreenTemplate>
  );
}
