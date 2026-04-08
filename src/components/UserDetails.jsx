import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import { getUserDetails, deleteUser } from "../api/API";
import { useAuth } from "@/context/authContext";
import "@styles/userdetails.css";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authState } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (!authState?.token) { navigate("/login"); return; }
      try {
        const userData = await getUserDetails(id, authState.token);
        setUser(userData);
      } catch (e) {
        console.error("Error fetching user details:", e?.message || e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, authState?.token, navigate]);

  const joinedDate = useMemo(
    () =>
      user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "—",
    [user]
  );

  const notify = (type, msg) => {
    setActionStatus({ type, msg });
    setTimeout(() => setActionStatus(null), 4000);
  };

  const handleDeleteUser = async () => {
    if (!authState?.token) return;
    if (!window.confirm("Permanently delete this user?")) return;
    try {
      await deleteUser(id, authState.token);
      navigate("/user-base");
    } catch (e) {
      console.error("Error deleting user:", e?.message || e);
      notify("error", "Failed to delete user. Try again.");
    }
  };

  const stripeLinked = Boolean(user?.stripeAccountId);
  const verified = Boolean(user?.isVerified);

  if (loading)
    return <ScreenTemplate><div className="ud-center">Loading…</div></ScreenTemplate>;
  if (!user)
    return <ScreenTemplate><div className="ud-center">User not found.</div></ScreenTemplate>;

  return (
    <ScreenTemplate>
      <div className="ud-page">

        {/* ─── Breadcrumb ─── */}
        <div className="ud-breadcrumb">
          <button className="ud-back" onClick={() => navigate(-1)}>← User Base</button>
          <span className="ud-breadcrumb-sep">/</span>
          <span className="ud-breadcrumb-current">{user.name}</span>
        </div>

        {/* ─── Notice ─── */}
        {actionStatus && (
          <div className={`ud-notice ud-notice--${actionStatus.type}`}>
            {actionStatus.msg}
          </div>
        )}

        {/* ─── Main layout ─── */}
        <div className="ud-layout">

          {/* LEFT — avatar */}
          <div className="ud-avatar-col">
            <img
              className="ud-avatar"
              src={user.profilePictureLink || "https://via.placeholder.com/400?text=No+Photo"}
              alt={user.name}
            />
          </div>

          {/* RIGHT — all info + actions */}
          <div className="ud-info-col">

            {/* Identity block */}
            <div>
              <div className="ud-account-type">{user.accountType || "User"}</div>
              <h1 className="ud-name">{user.name}</h1>
              <p className="ud-email">{user.email}</p>
              <div className="ud-status-row">
                <span className={`ud-badge ud-badge--${verified ? "verified" : "unverified"}`}>
                  {verified ? "Verified" : "Unverified"}
                </span>
                {stripeLinked && (
                  <span className="ud-badge ud-badge--stripe">Stripe Linked</span>
                )}
              </div>
            </div>

            <div className="ud-divider" />

            {/* Overview specs */}
            <div className="ud-specs">
              <div className="ud-spec">
                <span className="ud-spec-label">Joined</span>
                <span className="ud-spec-value">{joinedDate}</span>
              </div>
              <div className="ud-spec">
                <span className="ud-spec-label">Views</span>
                <span className="ud-spec-value">{typeof user.views === "number" ? user.views.toLocaleString() : "—"}</span>
              </div>
              <div className="ud-spec">
                <span className="ud-spec-label">Artist Type</span>
                <span className="ud-spec-value">{user.artistType || "—"}</span>
              </div>
              <div className="ud-spec">
                <span className="ud-spec-label">Categories</span>
                <span className="ud-spec-value">
                  {Array.isArray(user.artCategories) && user.artCategories.length
                    ? user.artCategories.join(", ")
                    : "—"}
                </span>
              </div>
              <div className="ud-spec">
                <span className="ud-spec-label">User ID</span>
                <span className="ud-spec-value ud-spec-value--mono">{user._id}</span>
              </div>
              <div className="ud-spec">
                <span className="ud-spec-label">Stripe Onboarding</span>
                <span className="ud-spec-value">
                  {stripeLinked
                    ? user.stripeOnboardingCompleted
                      ? "Completed"
                      : "Incomplete"
                    : "—"}
                </span>
              </div>
            </div>

            {/* Stripe account ID */}
            {stripeLinked && (
              <>
                <div className="ud-divider" />
                <div className="ud-stripe-row">
                  <div className="ud-spec-label">Stripe Account ID</div>
                  <div className="ud-stripe-val">
                    <span className="ud-spec-value ud-spec-value--mono">{user.stripeAccountId}</span>
                    <button
                      className="ud-copy-btn"
                      onClick={() => navigator.clipboard.writeText(user.stripeAccountId)}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Bio */}
            {user.bio && (
              <>
                <div className="ud-divider" />
                <p className="ud-bio">{user.bio}</p>
              </>
            )}

            <div className="ud-divider" />

            {/* Actions */}
            <div className="ud-actions">
              <button className="ud-btn ud-btn--delete" onClick={handleDeleteUser}>
                Delete user
              </button>
            </div>

          </div>
        </div>

      </div>
    </ScreenTemplate>
  );
}
