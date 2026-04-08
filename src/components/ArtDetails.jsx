import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import { getArtwork, approveArtwork, deleteArtwork } from "../api/API";
import "@styles/artdetails.css";
import { useAuth } from "@/context/authContext";

const fmt = (n) =>
  typeof n === "number" && Number.isFinite(n) ? n.toLocaleString() : "—";

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
        console.error(e?.message || e);
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
    try {
      await approveArtwork(id, authState.token);
      setArt((prev) => ({ ...prev, stage: "approved" }));
      notify("success", "Artwork approved and live on the marketplace.");
    } catch {
      notify("error", "Failed to approve. Try again.");
    }
  };

  const handleReject = async () => {
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
      setRejectionMessage("");
      notify("success", "Artwork rejected.");
    } catch {
      notify("error", "Failed to reject. Try again.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Permanently delete this artwork?")) return;
    try {
      await deleteArtwork(id, authState.token);
      navigate("/review-art");
    } catch {
      notify("error", "Failed to delete.");
    }
  };

  if (loading)
    return <ScreenTemplate><div className="artd-center">Loading…</div></ScreenTemplate>;
  if (!art)
    return <ScreenTemplate><div className="artd-center">Artwork not found.</div></ScreenTemplate>;

  const stage = (art.stage || "").toLowerCase();
  const stageLabel = stage === "review" ? "Pending Review" : stage === "approved" ? "Approved" : "Rejected";

  return (
    <ScreenTemplate>
      <div className="artd-page">

        {/* ─── Breadcrumb ─── */}
        <div className="artd-breadcrumb">
          <button className="artd-back" onClick={() => navigate(-1)}>← Artwork Review</button>
          <span className="artd-breadcrumb-sep">/</span>
          <span className="artd-breadcrumb-current">{art.name}</span>
        </div>

        {/* ─── Notice ─── */}
        {actionStatus && (
          <div className={`artd-notice artd-notice--${actionStatus.type}`}>
            {actionStatus.msg}
          </div>
        )}

        {/* ─── Main layout ─── */}
        <div className="artd-layout">

          {/* LEFT — artwork image */}
          <div className="artd-image-col">
            <img className="artd-image" src={art.imageLink} alt={art.name} />
          </div>

          {/* RIGHT — all info + actions */}
          <div className="artd-info-col">

            {/* Title block */}
            <div className="artd-title-block">
              <div className="artd-category">{art.category || "Uncategorized"}</div>
              <h1 className="artd-title">{art.name}</h1>
              <p className="artd-artist">by {art.artistName}</p>
              <div className="artd-price-row">
                <span className="artd-price">${fmt(art.price)}</span>
                <span className={`artd-status artd-status--${stage}`}>{stageLabel}</span>
              </div>
            </div>

            <div className="artd-divider" />

            {/* Description */}
            {art.description && (
              <>
                <p className="artd-description">{art.description}</p>
                <div className="artd-divider" />
              </>
            )}

            {/* Specs grid */}
            <div className="artd-specs">
              <div className="artd-spec">
                <span className="artd-spec-label">Views</span>
                <span className="artd-spec-value">{fmt(art.views)}</span>
              </div>
              <div className="artd-spec">
                <span className="artd-spec-label">Sold Status</span>
                <span className="artd-spec-value">{(art.soldStatus || "Unsold").charAt(0).toUpperCase() + (art.soldStatus || "unsold").slice(1)}</span>
              </div>
              <div className="artd-spec">
                <span className="artd-spec-label">Dimensions</span>
                <span className="artd-spec-value">{dims}</span>
              </div>
              <div className="artd-spec">
                <span className="artd-spec-label">Weight</span>
                <span className="artd-spec-value">{art.weight ? `${art.weight} lbs` : "—"}</span>
              </div>
              <div className="artd-spec">
                <span className="artd-spec-label">Signed</span>
                <span className="artd-spec-value">{art.isSigned ? "Yes" : "No"}</span>
              </div>
              <div className="artd-spec">
                <span className="artd-spec-label">Framed</span>
                <span className="artd-spec-value">{art.isFramed ? "Yes" : "No"}</span>
              </div>
              <div className="artd-spec">
                <span className="artd-spec-label">Uploaded</span>
                <span className="artd-spec-value">{new Date(art.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
              </div>
              {art.reviewedByEmail && (
                <div className="artd-spec">
                  <span className="artd-spec-label">Reviewed By</span>
                  <span className="artd-spec-value">{art.reviewedByEmail}</span>
                </div>
              )}
            </div>

            {art.rejectionMessage && (
              <div className="artd-rejection-note">
                <span className="artd-spec-label">Rejection Reason</span>
                <p>{art.rejectionMessage}</p>
              </div>
            )}

            <div className="artd-divider" />

            {/* Actions */}
            <div className="artd-actions">
              {stage === "review" && (
                <>
                  <button className="artd-btn artd-btn--approve" onClick={handleApprove}>
                    Approve
                  </button>
                  {!showRejectBox ? (
                    <button className="artd-btn artd-btn--reject" onClick={() => setShowRejectBox(true)}>
                      Reject
                    </button>
                  ) : (
                    <div className="artd-reject-box">
                      <textarea
                        placeholder="Reason for rejection (optional — sent to artist)"
                        value={rejectionMessage}
                        onChange={(e) => setRejectionMessage(e.target.value)}
                        rows={3}
                      />
                      <div className="artd-reject-row">
                        <button className="artd-btn artd-btn--reject" onClick={handleReject}>Confirm Reject</button>
                        <button className="artd-btn artd-btn--ghost" onClick={() => setShowRejectBox(false)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </>
              )}
              <button className="artd-delete-link" onClick={handleDelete}>
                Delete artwork
              </button>
            </div>

          </div>
        </div>

      </div>
    </ScreenTemplate>
  );
}
