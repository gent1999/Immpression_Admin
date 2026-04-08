import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line, Legend,
} from "recharts";
import ScreenTemplate from "./Template/ScreenTemplate";
import { useAuth } from "@/context/authContext";
import { getAnalytics, getWebAnalytics, getSearchConsoleAnalytics } from "@/api/API";
import "@/styles/analytics.css";

const SOURCE_COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444","#3b82f6","#8b5cf6","#ec4899","#14b8a6"];

const fmtCents = (c) =>
  `$${((c || 0) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n ?? 0));
const fmtDuration = (s) => { const m = Math.floor(s / 60); const sec = s % 60; return m > 0 ? `${m}m ${sec}s` : `${sec}s`; };

function StatCard({ icon, label, value, sub, subLabel, accent }) {
  return (
    <div className={`an-stat-card ${accent ? `an-stat-card--${accent}` : ""}`}>
      <div className="an-stat-card-icon">{icon}</div>
      <div className="an-stat-card-body">
        <p className="an-stat-card-label">{label}</p>
        <p className="an-stat-card-value">{value ?? "—"}</p>
        {sub !== undefined && (
          <p className="an-stat-card-sub">{sub} <span>{subLabel}</span></p>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, badge, children }) {
  return (
    <div className="an-section-header">
      <div className="an-section-header-left">
        <h2 className="an-section-title">{title}</h2>
        {badge && <span className="an-section-badge">{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function Analytics() {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [webData, setWebData] = useState(null);
  const [webLoading, setWebLoading] = useState(true);
  const [webError, setWebError] = useState("");
  const [gscData, setGscData] = useState(null);
  const [gscLoading, setGscLoading] = useState(true);
  const [gscError, setGscError] = useState("");
  const [webTab, setWebTab] = useState("traffic");

  useEffect(() => {
    if (!authState?.token) { navigate("/login"); return; }
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
      const res = await getWebAnalytics(authState.token);
      if (!cancelled) {
        if (res.success) setWebData(res.data);
        else setWebError(res.error || "Failed to load web analytics.");
        setWebLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [authState?.token]);

  useEffect(() => {
    if (!authState?.token) return;
    let cancelled = false;
    (async () => {
      const res = await getSearchConsoleAnalytics(authState.token);
      if (!cancelled) {
        if (res.success) setGscData(res.data);
        else setGscError(res.error || "Failed to load Search Console data.");
        setGscLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [authState?.token]);

  if (loading) {
    return (
      <ScreenTemplate>
        <div className="an-loading"><div className="loading-spinner" /><p>Loading analytics...</p></div>
      </ScreenTemplate>
    );
  }

  if (!data) {
    return (
      <ScreenTemplate>
        <div className="an-loading"><p>Unable to load analytics. Please try again.</p></div>
      </ScreenTemplate>
    );
  }

  const { users: u, images: img, orders: o } = data;

  return (
    <ScreenTemplate>
      <div className="an-page">

        {/* ─── Header ─── */}
        <header className="an-header">
          <h1 className="an-h1">Analytics</h1>
          <p className="an-subtitle">Platform and web performance overview</p>
        </header>

        {/* ══════════════════════════════════
            PLATFORM SECTION
        ══════════════════════════════════ */}
        <div className="an-section-label">Platform</div>

        {/* KPI row */}
        <div className="an-kpi-row">
          <div className="an-kpi">
            <span className="an-kpi-value">{u.total.toLocaleString()}</span>
            <span className="an-kpi-label">Total Users</span>
            <span className="an-kpi-bar an-kpi-bar--blue" />
          </div>
          <div className="an-kpi-divider" />
          <div className="an-kpi">
            <span className="an-kpi-value">{img.approved.toLocaleString()}</span>
            <span className="an-kpi-label">Live Artworks</span>
            <span className="an-kpi-bar an-kpi-bar--purple" />
          </div>
          <div className="an-kpi-divider" />
          <div className="an-kpi">
            <span className="an-kpi-value">{o.total.toLocaleString()}</span>
            <span className="an-kpi-label">Total Orders</span>
            <span className="an-kpi-bar an-kpi-bar--orange" />
          </div>
          <div className="an-kpi-divider" />
          <div className="an-kpi">
            <span className="an-kpi-value">{fmtCents(o.totalRevenueCents)}</span>
            <span className="an-kpi-label">Revenue</span>
            <span className="an-kpi-bar an-kpi-bar--green" />
          </div>
        </div>

        {/* Breakdown grid */}
        <div className="an-breakdown-grid">

          <div className="an-breakdown-card">
            <p className="an-breakdown-title">Users</p>
            <div className="an-breakdown-metrics">
              <div className="an-bm"><span className="an-bm-val">{u.artists}</span><span className="an-bm-lbl">Artists</span></div>
              <div className="an-bm"><span className="an-bm-val">{u.artLovers}</span><span className="an-bm-lbl">Art Lovers</span></div>
              <div className="an-bm"><span className="an-bm-val">{u.stripeLinked}</span><span className="an-bm-lbl">Stripe Linked</span></div>
              <div className="an-bm"><span className="an-bm-val">{u.stripeNotLinked}</span><span className="an-bm-lbl">Not Linked</span></div>
            </div>
          </div>

          <div className="an-breakdown-card">
            <p className="an-breakdown-title">Artworks</p>
            <div className="an-breakdown-metrics">
              <div className="an-bm"><span className="an-bm-val an-bm-val--yellow">{img.pending}</span><span className="an-bm-lbl">Pending</span></div>
              <div className="an-bm"><span className="an-bm-val an-bm-val--green">{img.approved}</span><span className="an-bm-lbl">Approved</span></div>
              <div className="an-bm"><span className="an-bm-val an-bm-val--red">{img.rejected}</span><span className="an-bm-lbl">Rejected</span></div>
            </div>
          </div>

          <div className="an-breakdown-card">
            <p className="an-breakdown-title">Orders</p>
            <div className="an-breakdown-metrics">
              <div className="an-bm"><span className="an-bm-val an-bm-val--green">{o.paid}</span><span className="an-bm-lbl">Paid</span></div>
              <div className="an-bm"><span className="an-bm-val an-bm-val--yellow">{o.pending}</span><span className="an-bm-lbl">Pending</span></div>
              <div className="an-bm"><span className="an-bm-val an-bm-val--red">{o.failed}</span><span className="an-bm-lbl">Failed</span></div>
              <div className="an-bm"><span className="an-bm-val">{o.refunded}</span><span className="an-bm-lbl">Refunded</span></div>
            </div>
          </div>

        </div>

        {/* Recent activity */}
        <div className="an-tables-grid">

          <div className="an-table-card">
            <p className="an-breakdown-title">Recent Users</p>
            {u.recent.length > 0 ? (
              <table className="an-table">
                <thead><tr><th>Name</th><th>Email</th><th>Type</th><th>Joined</th></tr></thead>
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
              <div className="an-empty-state"><span className="an-empty-icon">👥</span><p>No users yet.</p></div>
            )}
          </div>

          <div className="an-table-card">
            <p className="an-breakdown-title">Recent Orders</p>
            {o.recent.length > 0 ? (
              <table className="an-table">
                <thead><tr><th>Artwork</th><th>Artist</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
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
              <div className="an-empty-state"><span className="an-empty-icon">📦</span><p>No orders yet.</p></div>
            )}
          </div>

        </div>

        {/* ══════════════════════════════════
            WEB SECTION
        ══════════════════════════════════ */}
        <div className="an-section-label" style={{ marginTop: 56 }}>Web · immpression.art</div>

        {/* Tab bar */}
        <div className="an-tabs">
          <button
            className={`an-tab ${webTab === "traffic" ? "an-tab--active" : ""}`}
            onClick={() => setWebTab("traffic")}
          >
            Traffic
            <span className="an-tab-sub">Google Analytics · 30d</span>
          </button>
          <button
            className={`an-tab ${webTab === "search" ? "an-tab--active" : ""}`}
            onClick={() => setWebTab("search")}
          >
            Search
            <span className="an-tab-sub">Search Console · 28d</span>
          </button>
        </div>

        {/* ── Traffic Tab (GA4) ── */}
        {webTab === "traffic" && (
          <div className="an-tab-content">
            {webLoading && (
              <div className="an-web-state"><div className="loading-spinner" /><p>Loading...</p></div>
            )}
            {webError && !webLoading && (
              <div className="an-web-state an-web-error"><p>⚠️ {webError}</p></div>
            )}
            {webData && !webLoading && (
              <>
                <div className="an-stat-row">
                  <StatCard icon="👤" label="Users" value={fmt(webData.last30Days.users)} sub={fmt(webData.last7Days.users)} subLabel="last 7d" accent="indigo" />
                  <StatCard icon="🔁" label="Sessions" value={fmt(webData.last30Days.sessions)} sub={fmt(webData.last7Days.sessions)} subLabel="last 7d" />
                  <StatCard icon="📄" label="Page Views" value={fmt(webData.last30Days.pageViews)} sub={fmt(webData.last7Days.pageViews)} subLabel="last 7d" />
                  <StatCard icon="↩️" label="Bounce Rate" value={`${webData.last30Days.bounceRate}%`} />
                  <StatCard icon="⏱" label="Avg. Session" value={fmtDuration(webData.last30Days.avgSessionDuration)} />
                </div>

                <div className="an-chart-card">
                  <p className="an-chart-label">Daily Page Views &amp; Users</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={webData.daily} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gPV" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gU" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                      <Area type="monotone" dataKey="pageViews" name="Page Views" stroke="#6366f1" strokeWidth={2} fill="url(#gPV)" dot={false} />
                      <Area type="monotone" dataKey="users" name="Users" stroke="#10b981" strokeWidth={2} fill="url(#gU)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="an-two-col">
                  <div className="an-table-card">
                    <p className="an-chart-label">Top Pages</p>
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

                  <div className="an-table-card">
                    <p className="an-chart-label">Traffic Sources</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={webData.sources} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis type="category" dataKey="channel" tick={{ fontSize: 11 }} width={88} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} formatter={(v) => [v.toLocaleString(), "Sessions"]} />
                        <Bar dataKey="sessions" radius={[0, 4, 4, 0]}>
                          {webData.sources.map((_, i) => <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="an-legend">
                      {webData.sources.map((s, i) => (
                        <div key={s.channel} className="an-legend-row">
                          <span className="an-legend-dot" style={{ background: SOURCE_COLORS[i % SOURCE_COLORS.length] }} />
                          <span className="an-legend-name">{s.channel}</span>
                          <span className="an-legend-val">{s.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Search Tab (GSC) ── */}
        {webTab === "search" && (
          <div className="an-tab-content">
            {gscLoading && (
              <div className="an-web-state"><div className="loading-spinner" /><p>Loading...</p></div>
            )}
            {gscError && !gscLoading && (
              <div className="an-web-state an-web-error"><p>⚠️ {gscError}</p></div>
            )}
            {gscData && !gscLoading && (
              <>
                <div className="an-stat-row an-stat-row--4">
                  <StatCard icon="🖱️" label="Total Clicks" value={gscData.summary.clicks.toLocaleString()} accent="indigo" />
                  <StatCard icon="👁️" label="Impressions" value={gscData.summary.impressions.toLocaleString()} />
                  <StatCard icon="📊" label="Avg CTR" value={gscData.summary.ctr} />
                  <StatCard icon="📍" label="Avg Position" value={gscData.summary.position} />
                </div>

                <div className="an-chart-card">
                  <p className="an-chart-label">Daily Clicks &amp; Impressions</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={gscData.daily} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                      <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line yAxisId="left" type="monotone" dataKey="clicks" name="Clicks" stroke="#6366f1" strokeWidth={2} dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="impressions" name="Impressions" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="an-two-col">
                  <div className="an-table-card">
                    <p className="an-chart-label">Top Search Queries</p>
                    <table className="an-table">
                      <thead><tr><th>Query</th><th>Clicks</th><th>Impr.</th><th>CTR</th><th>Pos.</th></tr></thead>
                      <tbody>
                        {gscData.topQueries.length > 0 ? gscData.topQueries.map((q) => (
                          <tr key={q.query}>
                            <td className="an-cell-primary" style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.query}</td>
                            <td className="an-cell-primary">{q.clicks}</td>
                            <td className="an-cell-secondary">{q.impressions}</td>
                            <td className="an-cell-secondary">{q.ctr}</td>
                            <td className="an-cell-secondary">{q.position}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan={5} style={{ textAlign: "center", color: "#94a3b8", padding: "24px" }}>No search data yet — check back once Google has indexed your pages.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="an-table-card">
                    <p className="an-chart-label">Top Pages from Search</p>
                    <table className="an-table">
                      <thead><tr><th>Page</th><th>Clicks</th><th>Impr.</th><th>Pos.</th></tr></thead>
                      <tbody>
                        {gscData.topPages.length > 0 ? gscData.topPages.map((p) => (
                          <tr key={p.fullUrl}>
                            <td className="an-cell-secondary" title={p.page} style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.page}</td>
                            <td className="an-cell-primary">{p.clicks}</td>
                            <td className="an-cell-secondary">{p.impressions}</td>
                            <td className="an-cell-secondary">{p.position}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan={4} style={{ textAlign: "center", color: "#94a3b8", padding: "24px" }}>No page data yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </ScreenTemplate>
  );
}

export default Analytics;
