import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ScreenTemplate from "./Template/ScreenTemplate";
import { useAuth } from "@/context/authContext";
import { getAllImagesStats, getAnalytics } from "@/api/API";
import "@/styles/home.css";

const NAV_CARDS = [
  {
    key: "review",
    title: "Review Art",
    description: "Approve or reject submitted artworks before they go live.",
    path: "/review-art",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="m9 12 2 2 4-4" />
      </svg>
    ),
    accent: "#8b5cf6",
    accentBg: "#f5f3ff",
  },
  {
    key: "users",
    title: "User Base",
    description: "View profiles, account types, and manage registered users.",
    path: "/user-base",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    accent: "#3b82f6",
    accentBg: "#eff6ff",
  },
  {
    key: "orders",
    title: "Orders",
    description: "Track purchases, manage payouts, and review order history.",
    path: "/orders",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    accent: "#10b981",
    accentBg: "#f0fdf4",
  },
  {
    key: "reports",
    title: "Reports",
    description: "Review user-reported content and take moderation actions.",
    path: "/reports",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    accent: "#f59e0b",
    accentBg: "#fffbeb",
  },
  {
    key: "analytics",
    title: "Analytics",
    description: "Platform stats, web traffic, and Google Search Console data.",
    path: "/analytics",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    accent: "#6366f1",
    accentBg: "#eef2ff",
  },
];

function Home() {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [stats, setStats] = useState({ pending: 0, users: 0, orders: 0 });

  useEffect(() => {
    if (!authState?.token) return;
    (async () => {
      try {
        const [imgRes, analyticsRes] = await Promise.all([
          getAllImagesStats(authState.token),
          getAnalytics(authState.token),
        ]);
        setStats({
          pending: imgRes?.stats?.pending || 0,
          users: analyticsRes?.data?.users?.total || 0,
          orders: analyticsRes?.data?.orders?.total || 0,
        });
      } catch {
        // fail silently
      }
    })();
  }, [authState?.token]);

  const getBadge = (key) => {
    if (key === "review" && stats.pending > 0) return stats.pending;
    return null;
  };

  const getMeta = (key) => {
    if (key === "users") return `${stats.users.toLocaleString()} total`;
    if (key === "orders") return `${stats.orders.toLocaleString()} total`;
    if (key === "review") return stats.pending > 0 ? `${stats.pending} awaiting review` : "All caught up";
    return null;
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <ScreenTemplate>
      <div className="home-page">

        <header className="home-header">
          <div>
            <p className="home-greeting">{greeting}</p>
            <h1 className="home-title">Immpression Admin</h1>
          </div>
          <div className="home-header-meta">
            <span className="home-date">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </span>
          </div>
        </header>

        <div className="home-grid">
          {NAV_CARDS.map((card) => {
            const badge = getBadge(card.key);
            const meta = getMeta(card.key);
            return (
              <button
                key={card.key}
                className="home-card"
                onClick={() => navigate(card.path)}
                style={{ "--card-accent": card.accent, "--card-accent-bg": card.accentBg }}
              >
                <div className="home-card-top">
                  <div className="home-card-icon">
                    {card.icon}
                  </div>
                  {badge !== null && (
                    <span className="home-card-badge">{badge}</span>
                  )}
                </div>
                <div className="home-card-body">
                  <h2 className="home-card-title">{card.title}</h2>
                  <p className="home-card-desc">{card.description}</p>
                </div>
                <div className="home-card-footer">
                  {meta && <span className="home-card-meta">{meta}</span>}
                  <span className="home-card-arrow">→</span>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </ScreenTemplate>
  );
}

export default Home;
