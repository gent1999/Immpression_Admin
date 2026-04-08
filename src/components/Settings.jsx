import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/authContext";
import { getAdminSettings, saveAdminSettings, getExportUrl } from "../api/API";
import ScreenTemplate from "./Template/ScreenTemplate";
import "@/styles/settings.css";

const EXPORT_TYPES = [
  {
    key: "users",
    name: "Users",
    desc: "All registered users including name, email, role, and Stripe status.",
  },
  {
    key: "artworks",
    name: "Artworks",
    desc: "All artworks with title, artist, price, category, and approval stage.",
  },
  {
    key: "orders",
    name: "Orders",
    desc: "All orders with buyer, seller, artwork, amount, and status.",
  },
];

function Settings() {
  const { authState } = useAuth();
  const token = authState?.token;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null); // { type: "success"|"error", msg }

  // Notification toggles
  const [notifNewSignup, setNotifNewSignup] = useState(false);
  const [notifNewArtwork, setNotifNewArtwork] = useState(false);
  const [notifNewReport, setNotifNewReport] = useState(false);

  // Email recipient list
  const [emails, setEmails] = useState([]);
  const [emailInput, setEmailInput] = useState("");

  const noticeTimer = useRef(null);

  function showNotice(type, msg) {
    setNotice({ type, msg });
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 5000);
  }

  useEffect(() => {
    return () => clearTimeout(noticeTimer.current);
  }, []);

  useEffect(() => {
    if (!token) return;
    getAdminSettings(token)
      .then((data) => {
        if (data?.data) {
          const s = data.data;
          setNotifNewSignup(s.notifications?.newSignup ?? false);
          setNotifNewArtwork(s.notifications?.newPendingArtwork ?? false);
          setNotifNewReport(s.notifications?.newReport ?? false);
          setEmails(s.notificationEmails ?? []);
        }
      })
      .catch(() => showNotice("error", "Failed to load settings."))
      .finally(() => setLoading(false));
  }, [token]);

  function addEmail() {
    const val = emailInput.trim().toLowerCase();
    if (!val) return;
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    if (!valid) { showNotice("error", "Enter a valid email address."); return; }
    if (emails.includes(val)) { showNotice("error", "That email is already in the list."); return; }
    setEmails((prev) => [...prev, val]);
    setEmailInput("");
  }

  function removeEmail(email) {
    setEmails((prev) => prev.filter((e) => e !== email));
  }

  function handleEmailKeyDown(e) {
    if (e.key === "Enter") { e.preventDefault(); addEmail(); }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveAdminSettings(token, {
        notifications: {
          newSignup: notifNewSignup,
          newPendingArtwork: notifNewArtwork,
          newReport: notifNewReport,
        },
        notificationEmails: emails,
      });
      showNotice("success", "Settings saved.");
    } catch {
      showNotice("error", "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ScreenTemplate>
        <div className="st-page">
          <p style={{ color: "#64748b", fontSize: 14 }}>Loading settings...</p>
        </div>
      </ScreenTemplate>
    );
  }

  return (
    <ScreenTemplate>
    <div className="st-page">
      <h1 className="st-title">Settings</h1>

      {notice && (
        <div className={`st-notice st-notice--${notice.type}`}>{notice.msg}</div>
      )}

      {/* ─── Email Notifications ─── */}
      <div className="st-section">
        <div className="st-section-header">
          <p className="st-section-title">Email Notifications</p>
          <p className="st-section-subtitle">
            Choose which events trigger an email to your admin addresses.
          </p>
        </div>
        <div className="st-section-body">
          <div className="st-toggle-row">
            <div className="st-toggle-label">
              <span className="st-toggle-name">New Sign Up</span>
              <span className="st-toggle-desc">Email when a new user creates an account.</span>
            </div>
            <label className="st-switch">
              <input
                type="checkbox"
                checked={notifNewSignup}
                onChange={(e) => setNotifNewSignup(e.target.checked)}
              />
              <span className="st-switch-track" />
            </label>
          </div>

          <div className="st-toggle-row">
            <div className="st-toggle-label">
              <span className="st-toggle-name">New Pending Artwork</span>
              <span className="st-toggle-desc">Email when an artist submits artwork for review.</span>
            </div>
            <label className="st-switch">
              <input
                type="checkbox"
                checked={notifNewArtwork}
                onChange={(e) => setNotifNewArtwork(e.target.checked)}
              />
              <span className="st-switch-track" />
            </label>
          </div>

          <div className="st-toggle-row">
            <div className="st-toggle-label">
              <span className="st-toggle-name">New Report</span>
              <span className="st-toggle-desc">Email when a user submits a content report.</span>
            </div>
            <label className="st-switch">
              <input
                type="checkbox"
                checked={notifNewReport}
                onChange={(e) => setNotifNewReport(e.target.checked)}
              />
              <span className="st-switch-track" />
            </label>
          </div>

          {/* Recipient email list */}
          <div className="st-email-section">
            <div>
              <p className="st-email-label">Recipient Addresses</p>
              <p className="st-email-sublabel">
                Notifications will be sent to all addresses below.
              </p>
            </div>

            <div className="st-email-chips">
              {emails.length === 0 && (
                <span className="st-email-empty">No addresses added yet.</span>
              )}
              {emails.map((email) => (
                <div key={email} className="st-email-chip">
                  {email}
                  <button
                    className="st-chip-remove"
                    onClick={() => removeEmail(email)}
                    aria-label={`Remove ${email}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="st-email-add">
              <input
                type="email"
                className="st-email-input"
                placeholder="admin@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleEmailKeyDown}
              />
              <button className="st-btn-add" onClick={addEmail}>
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Save ─── */}
      <div className="st-save-row">
        <button className="st-btn-save" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* ─── Export Data ─── */}
      <div className="st-section">
        <div className="st-section-header">
          <p className="st-section-title">Export Data</p>
          <p className="st-section-subtitle">
            Download a CSV snapshot of your platform data.
          </p>
        </div>
        <div className="st-section-body">
          <div className="st-export-grid">
            {EXPORT_TYPES.map(({ key, name, desc }) => (
              <div key={key} className="st-export-card">
                <span className="st-export-card-name">{name}</span>
                <span className="st-export-card-desc">{desc}</span>
                <a
                  href={getExportUrl(key, token)}
                  download
                  className="st-btn-export"
                >
                  Download CSV
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </ScreenTemplate>
  );
}

export default Settings;
