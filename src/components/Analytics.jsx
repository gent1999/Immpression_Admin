import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import { useAuth } from "@/context/authContext";
import { getAnalytics } from "@/api/API";
import "@/styles/analytics.css";

const fmtCents = (c) =>
  `$${((c || 0) / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

function Analytics() {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authState?.token) {
      navigate("/login");
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await getAnalytics(authState.token);
      if (!cancelled && res.success) setData(res.data);
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [authState?.token, navigate]);

  if (loading) {
    return (
      <ScreenTemplate>
        <div className="an-loading">
          <div className="loading-spinner" />
          <p>Loading analytics...</p>
        </div>
      </ScreenTemplate>
    );
  }

  if (!data) {
    return (
      <ScreenTemplate>
        <div className="an-loading">
          <p>Unable to load analytics. Please try again.</p>
        </div>
      </ScreenTemplate>
    );
  }

  const { users: u, images: img, orders: o } = data;

  return (
    <ScreenTemplate>
      <div className="an-page">

        {/* ─── Page Header ─── */}
        <header className="an-header">
          <div>
            <h1 className="an-h1">Analytics</h1>
            <p className="an-subtitle">Platform overview and key metrics</p>
          </div>
        </header>

        {/* ─── Hero Metrics ─── */}
        <section className="an-hero">
          <div className="an-hero-metric">
            <span className="an-hero-value">{u.total.toLocaleString()}</span>
            <span className="an-hero-label">Users</span>
            <span className="an-hero-accent accent-blue" />
          </div>
          <div className="an-hero-divider" />
          <div className="an-hero-metric">
            <span className="an-hero-value">{img.total.toLocaleString()}</span>
            <span className="an-hero-label">Artworks</span>
            <span className="an-hero-accent accent-purple" />
          </div>
          <div className="an-hero-divider" />
          <div className="an-hero-metric">
            <span className="an-hero-value">{o.total.toLocaleString()}</span>
            <span className="an-hero-label">Orders</span>
            <span className="an-hero-accent accent-orange" />
          </div>
          <div className="an-hero-divider" />
          <div className="an-hero-metric">
            <span className="an-hero-value">{fmtCents(o.totalRevenueCents)}</span>
            <span className="an-hero-label">Revenue</span>
            <span className="an-hero-accent accent-green" />
          </div>
        </section>

        {/* ─── Breakdown Panels ─── */}
        <div className="an-panels">

          {/* Users */}
          <section className="an-panel">
            <h2 className="an-panel-title">Users</h2>
            <div className="an-row">
              <div className="an-metric">
                <span className="an-metric-value">{u.stripeLinked}</span>
                <span className="an-metric-label">Stripe Linked</span>
              </div>
              <div className="an-metric">
                <span className="an-metric-value">{u.stripeNotLinked}</span>
                <span className="an-metric-label">Not Linked</span>
              </div>
              <div className="an-metric">
                <span className="an-metric-value">{u.artists}</span>
                <span className="an-metric-label">Artists</span>
              </div>
              <div className="an-metric">
                <span className="an-metric-value">{u.artLovers}</span>
                <span className="an-metric-label">Art Lovers</span>
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="an-panel">
            <h2 className="an-panel-title">Content</h2>
            <div className="an-row">
              <div className="an-metric">
                <span className="an-metric-value">{img.pending}</span>
                <span className="an-metric-label">Pending</span>
              </div>
              <div className="an-metric">
                <span className="an-metric-value">{img.approved}</span>
                <span className="an-metric-label">Approved</span>
              </div>
              <div className="an-metric">
                <span className="an-metric-value">{img.rejected}</span>
                <span className="an-metric-label">Rejected</span>
              </div>
            </div>
          </section>

          {/* Orders */}
          <section className="an-panel">
            <h2 className="an-panel-title">Orders</h2>
            <div className="an-row">
              <div className="an-metric">
                <span className="an-metric-value">{o.paid}</span>
                <span className="an-metric-label">Paid</span>
              </div>
              <div className="an-metric">
                <span className="an-metric-value">{o.pending}</span>
                <span className="an-metric-label">Pending</span>
              </div>
              <div className="an-metric">
                <span className="an-metric-value">{o.failed}</span>
                <span className="an-metric-label">Failed</span>
              </div>
              <div className="an-metric">
                <span className="an-metric-value">{o.refunded}</span>
                <span className="an-metric-label">Refunded</span>
              </div>
            </div>
          </section>

        </div>

        {/* ─── Recent Activity ─── */}
        <div className="an-activity">

          <section className="an-activity-panel">
            <h2 className="an-panel-title">Recent Users</h2>
            {u.recent.length > 0 ? (
              <table className="an-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Type</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {u.recent.map((r) => (
                    <tr key={r._id} onClick={() => navigate(`/user/${r._id}`)}>
                      <td className="an-cell-primary">{r.name}</td>
                      <td className="an-cell-secondary">{r.email}</td>
                      <td>
                        <span className={`an-tag ${r.accountType === "artist" ? "tag-purple" : "tag-blue"}`}>
                          {r.accountType || "N/A"}
                        </span>
                      </td>
                      <td className="an-cell-secondary">{fmtDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="an-empty-state">
                <span className="an-empty-icon">👥</span>
                <p>No users have signed up yet.</p>
              </div>
            )}
          </section>

          <section className="an-activity-panel">
            <h2 className="an-panel-title">Recent Orders</h2>
            {o.recent.length > 0 ? (
              <table className="an-table">
                <thead>
                  <tr>
                    <th>Artwork</th>
                    <th>Artist</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {o.recent.map((r) => (
                    <tr key={r._id} onClick={() => navigate(`/order/${r._id}`)}>
                      <td className="an-cell-primary">{r.artName || "Untitled"}</td>
                      <td className="an-cell-secondary">{r.artistName || "Unknown"}</td>
                      <td className="an-cell-primary">{fmtCents(r.totalAmount)}</td>
                      <td>
                        <span className={`an-tag tag-${(r.status || "pending").toLowerCase()}`}>
                          {(r.status || "pending").toUpperCase()}
                        </span>
                      </td>
                      <td className="an-cell-secondary">{fmtDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="an-empty-state">
                <span className="an-empty-icon">📦</span>
                <p>No orders have been placed yet.</p>
              </div>
            )}
          </section>

        </div>
      </div>
    </ScreenTemplate>
  );
}

export default Analytics;
