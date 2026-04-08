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
const fmtDuration = (s) => {
  const m = Math.floor(s / 60); const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
};

const NAV = [
  { key: "inhouse",  label: "In-House",      sub: "Backend · Live",           color: "dark" },
  { key: "website",  label: "Website",        sub: "Google Analytics · 30d",   color: "blue" },
  { key: "search",   label: "Search Console", sub: "Search Console · 28d",     color: "green" },
  { key: "mobile",   label: "Mobile",         sub: "Coming soon",              color: "mobile", disabled: true },
];

function StatCard({ label, value, sub, subLabel }) {
  return (
    <div className="an-stat-card">
      <p className="an-stat-card-label">{label}</p>
      <p className="an-stat-card-value">{value ?? "—"}</p>
      {sub !== undefined && (
        <p className="an-stat-card-sub">{sub} <span>{subLabel}</span></p>
      )}
    </div>
  );
}

function Analytics() {
  const navigate = useNavigate();
  const { authState } = useAuth();

  const [activeTab, setActiveTab] = useState("inhouse");

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  const [webData, setWebData]       = useState(null);
  const [webLoading, setWebLoading] = useState(true);
  const [webError, setWebError]     = useState("");

  const [gscData, setGscData]       = useState(null);
  const [gscLoading, setGscLoading] = useState(true);
  const [gscError, setGscError]     = useState("");

  useEffect(() => {
    if (!authState?.token) { navigate("/login"); return; }
    let cancelled = false;
    (async () => {
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

  return (
    <ScreenTemplate>
      <div className="an-page">

        {/* ─── Top nav ─── */}
        <div className="an-nav">
          <h1 className="an-h1">Analytics</h1>
          <div className="an-nav-tabs">
            {NAV.map((n) => (
              <button
                key={n.key}
                className={`an-nav-tab an-nav-tab--${n.color} ${activeTab === n.key ? "an-nav-tab--active" : ""} ${n.disabled ? "an-nav-tab--disabled" : ""}`}
                onClick={() => !n.disabled && setActiveTab(n.key)}
                disabled={n.disabled}
              >
                <span className="an-nav-tab-label">{n.label}</span>
                <span className="an-nav-tab-sub">{n.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="an-divider" />

        {/* ══════════════════════════════════
            IN-HOUSE
        ══════════════════════════════════ */}
        {activeTab === "inhouse" && (
          <div className="an-content">
            {loading ? (
              <div className="an-state"><div className="an-spinner" /><p>Loading…</p></div>
            ) : !data ? (
              <div className="an-state"><p>Unable to load analytics.</p></div>
            ) : (() => {
              const { users: u, images: img, orders: o } = data;
              return (
                <>
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

                  {/* Breakdown */}
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

                  {/* Recent tables */}
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
                        <div className="an-empty-state"><p>No users yet.</p></div>
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
                        <div className="an-empty-state"><p>No orders yet.</p></div>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* ══════════════════════════════════
            WEBSITE  (GA4)
        ══════════════════════════════════ */}
        {activeTab === "website" && (
          <div className="an-content">
            {webLoading && <div className="an-state"><div className="an-spinner" /><p>Loading…</p></div>}
            {webError && !webLoading && <div className="an-state an-state--error"><p>{webError}</p></div>}
            {webData && !webLoading && (
              <>
                <div className="an-stat-row">
                  <StatCard label="Users (30d)"       value={fmt(webData.last30Days.users)}       sub={fmt(webData.last7Days.users)}       subLabel="last 7d" />
                  <StatCard label="Sessions (30d)"    value={fmt(webData.last30Days.sessions)}    sub={fmt(webData.last7Days.sessions)}    subLabel="last 7d" />
                  <StatCard label="Page Views (30d)"  value={fmt(webData.last30Days.pageViews)}   sub={fmt(webData.last7Days.pageViews)}   subLabel="last 7d" />
                  <StatCard label="Bounce Rate"       value={`${webData.last30Days.bounceRate}%`} />
                  <StatCard label="Avg. Session"      value={fmtDuration(webData.last30Days.avgSessionDuration)} />
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
                      <Tooltip contentStyle={{ fontSize: 12, border: "1px solid #e2e8f0" }} />
                      <Area type="monotone" dataKey="pageViews" name="Page Views" stroke="#6366f1" strokeWidth={2} fill="url(#gPV)" dot={false} />
                      <Area type="monotone" dataKey="users"     name="Users"      stroke="#10b981" strokeWidth={2} fill="url(#gU)"  dot={false} />
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
                            <td className="an-cell-secondary an-cell-truncate" title={p.path}>{p.path}</td>
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
                        <Tooltip contentStyle={{ fontSize: 12, border: "1px solid #e2e8f0" }} formatter={(v) => [v.toLocaleString(), "Sessions"]} />
                        <Bar dataKey="sessions" radius={[0, 2, 2, 0]}>
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

        {/* ══════════════════════════════════
            SEARCH CONSOLE
        ══════════════════════════════════ */}
        {activeTab === "search" && (
          <div className="an-content">
            {gscLoading && <div className="an-state"><div className="an-spinner" /><p>Loading…</p></div>}
            {gscError && !gscLoading && <div className="an-state an-state--error"><p>{gscError}</p></div>}
            {gscData && !gscLoading && (
              <>
                <div className="an-stat-row an-stat-row--4">
                  <StatCard label="Total Clicks"  value={gscData.summary.clicks.toLocaleString()} />
                  <StatCard label="Impressions"   value={gscData.summary.impressions.toLocaleString()} />
                  <StatCard label="Avg CTR"        value={gscData.summary.ctr} />
                  <StatCard label="Avg Position"   value={gscData.summary.position} />
                </div>

                <div className="an-chart-card">
                  <p className="an-chart-label">Daily Clicks &amp; Impressions</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={gscData.daily} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                      <YAxis yAxisId="left"  tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ fontSize: 12, border: "1px solid #e2e8f0" }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Line yAxisId="left"  type="monotone" dataKey="clicks"      name="Clicks"      stroke="#6366f1" strokeWidth={2} dot={false} />
                      <Line yAxisId="right" type="monotone" dataKey="impressions" name="Impressions"  stroke="#10b981" strokeWidth={2} dot={false} />
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
                            <td className="an-cell-primary an-cell-truncate">{q.query}</td>
                            <td className="an-cell-primary">{q.clicks}</td>
                            <td className="an-cell-secondary">{q.impressions}</td>
                            <td className="an-cell-secondary">{q.ctr}</td>
                            <td className="an-cell-secondary">{q.position}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan={5} className="an-empty-cell">No search data yet — check back once Google has indexed your pages.</td></tr>
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
                            <td className="an-cell-secondary an-cell-truncate" title={p.page}>{p.page}</td>
                            <td className="an-cell-primary">{p.clicks}</td>
                            <td className="an-cell-secondary">{p.impressions}</td>
                            <td className="an-cell-secondary">{p.position}</td>
                          </tr>
                        )) : (
                          <tr><td colSpan={4} className="an-empty-cell">No page data yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════
            MOBILE  (coming soon)
        ══════════════════════════════════ */}
        {activeTab === "mobile" && (
          <div className="an-content">
            <div className="an-coming-soon">
              <div className="an-coming-soon-label">Coming Soon</div>
              <h2 className="an-coming-soon-title">Mobile Analytics</h2>
              <p className="an-coming-soon-desc">
                Google Analytics for the iOS App Store and Google Play apps will appear here once integrated.
              </p>
              <div className="an-coming-soon-platforms">
                <span className="an-platform-badge">iOS · App Store</span>
                <span className="an-platform-badge">Android · Google Play</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </ScreenTemplate>
  );
}

export default Analytics;
