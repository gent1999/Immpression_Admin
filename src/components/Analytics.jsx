import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import ScreenTemplate from "./Template/ScreenTemplate";
import { useAuth } from "@/context/authContext";
import { getAnalytics, getWebAnalytics } from "@/api/API";
import "@/styles/analytics.css";

const SOURCE_COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444","#3b82f6","#8b5cf6","#ec4899","#14b8a6"];

function WebStatCard({ icon, label, value, sub, subLabel }) {
  return (
    <div className="an-web-stat-card">
      <span className="an-web-stat-icon">{icon}</span>
      <div>
        <p className="an-web-stat-label">{label}</p>
        <p className="an-web-stat-value">{value ?? "—"}</p>
        {sub !== undefined && (
          <p className="an-web-stat-sub">{sub} <span>{subLabel}</span></p>
        )}
      </div>
    </div>
  );
}

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

const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n ?? 0));
const fmtDuration = (s) => { const m = Math.floor(s / 60); const sec = s % 60; return m > 0 ? `${m}m ${sec}s` : `${sec}s`; };

function Analytics() {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [webData, setWebData] = useState(null);
  const [webLoading, setWebLoading] = useState(true);
  const [webError, setWebError] = useState("");

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
    return () => { cancelled = true; };
  }, [authState?.token, navigate]);

  useEffect(() => {
    if (!authState?.token) return;
    let cancelled = false;
    (async () => {
      setWebLoading(true);
      const res = await getWebAnalytics(authState.token);
      if (!cancelled) {
        if (res.success) setWebData(res.data);
        else setWebError(res.error || "Failed to load web analytics.");
        setWebLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [authState?.token]);

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

        {/* ─── Web Traffic (GA4) ─── */}
        <section className="an-web-section">
          <div className="an-web-header">
            <h2 className="an-panel-title">Web Traffic · immpression.art</h2>
            <span className="an-web-badge">Google Analytics · Last 30 days</span>
          </div>

          {webLoading && (
            <div className="an-web-state">
              <div className="loading-spinner" />
              <p>Loading web analytics...</p>
            </div>
          )}

          {webError && !webLoading && (
            <div className="an-web-state an-web-error">
              <p>⚠️ {webError}</p>
              {webError.includes("not configured") && (
                <p className="an-web-error-hint">
                  Add <code>GA4_PROPERTY_ID</code> and <code>GA4_SERVICE_ACCOUNT_JSON</code> to your backend environment variables to enable this section.
                </p>
              )}
            </div>
          )}

          {webData && !webLoading && (
            <>
              {/* Stat cards */}
              <div className="an-web-stats">
                <WebStatCard icon="👤" label="Users" value={fmt(webData.last30Days.users)} sub={fmt(webData.last7Days.users)} subLabel="last 7d" />
                <WebStatCard icon="🔁" label="Sessions" value={fmt(webData.last30Days.sessions)} sub={fmt(webData.last7Days.sessions)} subLabel="last 7d" />
                <WebStatCard icon="📄" label="Page Views" value={fmt(webData.last30Days.pageViews)} sub={fmt(webData.last7Days.pageViews)} subLabel="last 7d" />
                <WebStatCard icon="↩️" label="Bounce Rate" value={`${webData.last30Days.bounceRate}%`} />
                <WebStatCard icon="⏱" label="Avg. Session" value={fmtDuration(webData.last30Days.avgSessionDuration)} />
              </div>

              {/* Daily chart */}
              <div className="an-web-chart-wrap">
                <p className="an-web-chart-label">Daily Page Views &amp; Users</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={webData.daily} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="wPV" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="wU" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                    <Area type="monotone" dataKey="pageViews" name="Page Views" stroke="#6366f1" strokeWidth={2} fill="url(#wPV)" dot={false} />
                    <Area type="monotone" dataKey="users" name="Users" stroke="#10b981" strokeWidth={2} fill="url(#wU)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Bottom row: top pages + sources */}
              <div className="an-web-bottom">
                <div className="an-web-card">
                  <p className="an-web-chart-label">Top Pages</p>
                  <table className="an-table">
                    <thead><tr><th>Page</th><th>Views</th><th>Users</th></tr></thead>
                    <tbody>
                      {webData.topPages.map((p) => (
                        <tr key={p.path}>
                          <td className="an-cell-secondary" title={p.path} style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.path}</td>
                          <td className="an-cell-primary">{p.pageViews.toLocaleString()}</td>
                          <td className="an-cell-secondary">{p.users.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="an-web-card">
                  <p className="an-web-chart-label">Traffic Sources</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={webData.sources} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="channel" tick={{ fontSize: 11 }} width={88} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} formatter={(v) => [v.toLocaleString(), "Sessions"]} />
                      <Bar dataKey="sessions" radius={[0, 4, 4, 0]}>
                        {webData.sources.map((_, i) => <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="an-web-sources-legend">
                    {webData.sources.map((s, i) => (
                      <div key={s.channel} className="an-web-source-row">
                        <span className="an-web-source-dot" style={{ background: SOURCE_COLORS[i % SOURCE_COLORS.length] }} />
                        <span className="an-web-source-name">{s.channel}</span>
                        <span className="an-web-source-pct">{s.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

      </div>
    </ScreenTemplate>
  );
}

export default Analytics;
