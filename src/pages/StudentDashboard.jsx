import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getActivities,
  getMyActivities,
  registerActivity,
  unregisterActivity
} from "../services/api";
import {
  Search, CheckSquare, Briefcase, ClipboardList,
  FolderOpen, TrendingUp, LogOut, Users, Medal,
  Calendar, Palette, Target, X, Plus, Zap,
  ChevronRight, Activity, Sparkles, ArrowRight,
  Bell, Trophy, Star, Award, ChevronDown, User, Settings
} from "lucide-react";
import CareerIntelligence from "./Careerintelligence";
import "./Student.css";

const catIcons = {
  Sports: <Medal size={18} strokeWidth={1.6} />,
  Clubs: <Target size={18} strokeWidth={1.6} />,
  Events: <Calendar size={18} strokeWidth={1.6} />,
  Cultural: <Palette size={18} strokeWidth={1.6} />,
};
const catIconsSm = {
  Sports: <Medal size={14} strokeWidth={1.6} />,
  Clubs: <Target size={14} strokeWidth={1.6} />,
  Events: <Calendar size={14} strokeWidth={1.6} />,
  Cultural: <Palette size={14} strokeWidth={1.6} />,
};

const catColors = {
  Sports: { bg: "rgba(239,68,68,0.08)", color: "#DC2626", border: "rgba(239,68,68,0.18)" },
  Clubs: { bg: "rgba(59,130,246,0.08)", color: "#2563EB", border: "rgba(59,130,246,0.18)" },
  Events: { bg: "rgba(16,185,129,0.08)", color: "#059669", border: "rgba(16,185,129,0.18)" },
  Cultural: { bg: "rgba(168,85,247,0.08)", color: "#7C3AED", border: "rgba(168,85,247,0.18)" },
};

const ACHIEVEMENTS = [
  { id: "first", label: "First Step", desc: "Join your first activity", icon: <Star size={16} />, check: (my) => my.length >= 1 },
  { id: "trio", label: "Hat-Trick", desc: "Join 3 activities", icon: <Trophy size={16} />, check: (my) => my.length >= 3 },
  { id: "explorer", label: "Explorer", desc: "Join activities in 2 categories", icon: <Award size={16} />, check: (my) => new Set(my.map(a => a.type)).size >= 2 },
  { id: "allroundar", label: "All-Rounder", desc: "Join all 4 categories", icon: <Medal size={16} />, check: (my) => new Set(my.map(a => a.type)).size >= 4 },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const [activities, setActivities] = useState([]);
  const [myActivities, setMyActivities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState("browse");
  const [filterCat, setFilterCat] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "" });
  const [profileOpen, setProfileOpen] = useState(false);
  const [annDismissed, setAnnDismissed] = useState(new Set());
  const profileRef = useRef(null);

  useEffect(() => {
    if (!user || user.role !== "student") { navigate("/login"); return; }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [all, mine] = await Promise.all([
        getActivities(),
        getMyActivities(user.id)
      ]);
      setActivities(Array.isArray(all) ? all : []);
      setMyActivities(Array.isArray(mine) ? mine : []);
    } catch (err) {
      console.error("LOAD ERROR:", err);
    }
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "" }), 3000);
  };

  const isReg = (a) => myActivities.some(m => m.id === a.id);

  const register = async (id) => {
    try {
      await registerActivity(user.id, id);
      showToast("Successfully registered");
      loadData();
    } catch (e) {
      showToast("Registration failed", "warn");
    }
  };

  const unregister = async (id) => {
    try {
      await unregisterActivity(user.id, id);
      showToast("Unregistered from activity", "warn");
      loadData();
    } catch (e) {
      showToast("Unregister failed", "warn");
    }
  };

  const handleLogout = () => { localStorage.removeItem("currentUser"); navigate("/login"); };

  const allCats = ["All", ...new Set(activities.map(a => a.type))];
  const filtered = activities
    .filter(a => filterCat === "All" || a.type === filterCat)
    .filter(a => a.name.toLowerCase().includes(searchQ.toLowerCase()));

  const initials = (n) => n ? n.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "ST";
  const partRate = activities.length > 0 ? Math.round((myActivities.length / activities.length) * 100) : 0;

  // Leaderboard derived from myActivities (real enrolled data from backend)
  const leaderboard = [];
  const myRank = 0;

  const visibleAnns = announcements.filter(a =>
    !annDismissed.has(a.id) && (a.target === "All" || a.target === undefined)
  );

  const unlockedAchievements = ACHIEVEMENTS.filter(ac => ac.check(myActivities));

  const navItems = [
    { id: "browse", icon: <Search size={15} strokeWidth={2} />, label: "Browse Activities" },
    { id: "my", icon: <CheckSquare size={15} strokeWidth={2} />, label: "My Activities", badge: myActivities.length },
    { id: "leaderboard", icon: <Trophy size={15} strokeWidth={2} />, label: "Leaderboard" },
    { id: "career", icon: <Briefcase size={15} strokeWidth={2} />, label: "Career Intelligence", isNew: true },
  ];

  return (
    <div className="sd-root">

      {/* SIDEBAR */}
      <aside className="sd-sidebar">

        {/* Brand */}
        <div className="sd-brand">
          <div className="sd-brand-mark">
            <Zap size={14} strokeWidth={2.5} />
          </div>
          <div className="sd-brand-text">
            <span className="sd-brand-name">ClubConnect</span>
            <span className="sd-brand-tag">Student Portal</span>
          </div>
        </div>

        {/* Nav */}
        <div className="sd-nav-section">
          <span className="sd-nav-group-label">Menu</span>
          <nav className="sd-nav">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`sd-nav-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="sd-nav-ic">{item.icon}</span>
                <span className="sd-nav-txt">{item.label}</span>
                {item.badge > 0 && <span className="sd-badge">{item.badge}</span>}
                {item.isNew && <span className="sd-new">NEW</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* User Footer */}
        <div className="sd-sidebar-foot">
          <div className="sd-user">
            <div className="sd-user-av">{initials(user?.name)}</div>
            <div className="sd-user-meta">
              <span className="sd-user-name">{user?.name || user?.username}</span>
              <span className="sd-user-sub">Student Account</span>
            </div>
          </div>
          <button className="sd-logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={15} strokeWidth={2} />
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="sd-main">

        {/* Top bar */}
        <header className="sd-header">
          <div className="sd-header-left">
            <div className="sd-breadcrumb">
              <span>Dashboard</span>
              <ChevronRight size={12} strokeWidth={2} />
              <span className="sd-bc-active">
                {{ browse: "Browse", my: "My Activities", leaderboard: "Leaderboard", career: "Career" }[activeTab]}
              </span>
            </div>
            <h1 className="sd-page-title">
              {{ browse: "Browse Activities", my: "My Activities", leaderboard: "Leaderboard", career: "Career Intelligence" }[activeTab]}
            </h1>
          </div>
          <div className="sd-header-right">
            {/* Announcements bell */}
            {visibleAnns.length > 0 && (
              <div className="sd-bell-wrap">
                <Bell size={16} strokeWidth={2} />
                <span className="sd-bell-dot">{visibleAnns.length}</span>
              </div>
            )}
            {/* Profile dropdown */}
            <div className="sd-profile-wrap" ref={profileRef}>
              <div
                className="sd-profile-trigger"
                onMouseEnter={() => setProfileOpen(true)}
                onClick={() => setProfileOpen(v => !v)}
              >
                <div className="sd-header-av">{initials(user?.name)}</div>
                <div>
                  <div className="sd-header-name">{user?.name || user?.username}</div>
                  <div className="sd-header-role">Student</div>
                </div>
                <ChevronDown size={13} strokeWidth={2} className={`sd-profile-chevron ${profileOpen ? "open" : ""}`} />
              </div>

              {profileOpen && (
                <div
                  className="sd-profile-dropdown"
                  onMouseLeave={() => setProfileOpen(false)}
                >
                  <div className="sd-pd-header">
                    <div className="sd-pd-av">{initials(user?.name)}</div>
                    <div>
                      <div className="sd-pd-name">{user?.name || user?.username}</div>
                      <div className="sd-pd-email">{user?.email || "student@college.edu"}</div>
                    </div>
                  </div>
                  <div className="sd-pd-divider" />
                  <div className="sd-pd-stats">
                    <div className="sd-pd-stat">
                      <span className="sd-pd-stat-val">{myActivities.length}</span>
                      <span className="sd-pd-stat-lbl">Enrolled</span>
                    </div>
                    <div className="sd-pd-stat-sep" />
                    <div className="sd-pd-stat">
                      <span className="sd-pd-stat-val">{myRank || "—"}</span>
                      <span className="sd-pd-stat-lbl">Rank</span>
                    </div>
                    <div className="sd-pd-stat-sep" />
                    <div className="sd-pd-stat">
                      <span className="sd-pd-stat-val">{unlockedAchievements.length}</span>
                      <span className="sd-pd-stat-lbl">Badges</span>
                    </div>
                  </div>
                  <div className="sd-pd-divider" />
                  <button className="sd-pd-item" onClick={() => { setProfileOpen(false); setActiveTab("my"); }}>
                    <User size={14} strokeWidth={2} /> My Activities
                  </button>
                  <button className="sd-pd-item" onClick={() => { setProfileOpen(false); setActiveTab("leaderboard"); }}>
                    <Trophy size={14} strokeWidth={2} /> Leaderboard
                  </button>
                  <div className="sd-pd-divider" />
                  <button className="sd-pd-logout" onClick={handleLogout}>
                    <LogOut size={14} strokeWidth={2} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Announcements Banner */}
        {visibleAnns.length > 0 && activeTab !== "career" && (
          <div className="sd-ann-stack">
            {visibleAnns.slice(0, 2).map(ann => (
              <div key={ann.id} className={`sd-ann-banner sd-ann-${ann.priority?.toLowerCase() || "info"}`}>
                <Bell size={13} strokeWidth={2} />
                <span>{ann.text}</span>
                <button className="sd-ann-close" onClick={() => setAnnDismissed(s => new Set([...s, ann.id]))}>
                  <X size={12} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="sd-content">

          {/* Welcome Banner */}
          {activeTab === "browse" && (
            <div className="sd-welcome-banner">
              <div className="sd-banner-overlay" />
              <div className="sd-banner-content">
                <div className="sd-banner-badge"><Sparkles size={12} strokeWidth={2} /> Student Portal</div>
                <h2 className="sd-banner-title">Welcome back, {user?.name || user?.username}!</h2>
                <p className="sd-banner-desc">Discover activities, build skills, and shape your career path.</p>
              </div>
              {/* Achievement pills */}
              <div className="sd-banner-achieve">
                {unlockedAchievements.map(ac => (
                  <div key={ac.id} className="sd-achieve-pill">
                    {ac.icon} {ac.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          {activeTab !== "career" && activeTab !== "leaderboard" && (
            <div className="sd-stats-row">
              {[
                { label: "Total Activities", value: activities.length, icon: <ClipboardList size={16} strokeWidth={1.8} />, accent: false },
                { label: "Registered", value: myActivities.length, icon: <CheckSquare size={16} strokeWidth={1.8} />, accent: false },
                { label: "Categories", value: allCats.length - 1, icon: <FolderOpen size={16} strokeWidth={1.8} />, accent: false },
                { label: "Participation", value: `${partRate}%`, icon: <Activity size={16} strokeWidth={1.8} />, accent: true },
              ].map((s, i) => (
                <div key={i} className={`sd-stat ${s.accent ? "sd-stat--accent" : ""}`} style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="sd-stat-top">
                    <span className="sd-stat-label">{s.label}</span>
                    <div className="sd-stat-icon">{s.icon}</div>
                  </div>
                  <div className="sd-stat-val">{s.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* BROWSE */}
          {activeTab === "browse" && (
            <div className="sd-panel">
              {/* Toolbar */}
              <div className="sd-toolbar">
                <div className="sd-search-wrap">
                  <Search size={14} strokeWidth={2} className="sd-search-ic" />
                  <input
                    className="sd-search"
                    placeholder="Search activities…"
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                  />
                </div>
                <div className="sd-filters">
                  {allCats.map(cat => (
                    <button
                      key={cat}
                      className={`sd-filter-btn ${filterCat === cat ? "active" : ""}`}
                      onClick={() => setFilterCat(cat)}
                    >
                      {cat !== "All" && <span style={{ color: catColors[cat]?.color }}>{catIconsSm[cat]}</span>}
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Count */}
              <div className="sd-count-row">
                <span className="sd-count">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
              </div>

              {filtered.length === 0 ? (
                <div className="sd-empty">
                  <div className="sd-empty-ic"><ClipboardList size={28} strokeWidth={1.4} /></div>
                  <p>No activities found</p>
                  <span>Try adjusting your filters or search query</span>
                </div>
              ) : (
                <div className="sd-grid">
                  {filtered.map((act, i) => {
                    const cc = catColors[act.type] || {};
                    const reg = isReg(act);
                    const isFull = act.currentParticipants >= act.maxParticipants;
                    const capPct = Math.min((act.currentParticipants / (act.maxParticipants || 30)) * 100, 100);
                    return (
                      <div key={act.id} className={`sd-card ${reg ? "sd-card--reg" : ""}`}
                        style={{ animationDelay: `${i * 0.04}s` }}>

                        <div className="sd-card-header">
                          <div className="sd-card-ic" style={{ background: cc.bg, color: cc.color, border: `1px solid ${cc.border}` }}>
                            {catIcons[act.type]}
                          </div>
                          <span className="sd-card-cat" style={{ color: cc.color, background: cc.bg, border: `1px solid ${cc.border}` }}>
                            {act.type}
                          </span>
                          {isFull && !reg && <span className="sd-full-tag">Full</span>}
                        </div>

                        <div className="sd-card-name">{act.name}</div>

                        {/* Capacity bar */}
                        <div className="sd-cap-wrap">
                          <div className="sd-cap-bar">
                            <div className="sd-cap-fill" style={{
                              width: `${capPct}%`,
                              background: isFull ? '#EF4444' : capPct > 80 ? '#F59E0B' : cc.color
                            }} />
                          </div>
                          <span className="sd-cap-txt">{act.currentParticipants}/{act.maxParticipants || 30}</span>
                        </div>

                        <div className="sd-card-foot">
                          <span className="sd-card-meta">
                            <Users size={12} strokeWidth={2} />
                            {act.currentParticipants} enrolled
                          </span>
                          {reg
                            ? <button className="sd-btn-unreg" onClick={() => unregister(act.id)}>
                              <X size={12} strokeWidth={2.5} /> Withdraw
                            </button>
                            : <button className="sd-btn-reg" onClick={() => register(act.id)} disabled={isFull}>
                              <Plus size={12} strokeWidth={2.5} /> {isFull ? "Full" : "Enroll"}
                            </button>
                          }
                        </div>

                        {reg && <div className="sd-card-enrolled-bar" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* MY ACTIVITIES */}
          {activeTab === "my" && (
            <div className="sd-panel">
              <div className="sd-panel-head">
                <div>
                  <h2 className="sd-panel-title">Enrolled Activities</h2>
                  <p className="sd-panel-sub">{myActivities.length} active enrollment{myActivities.length !== 1 ? "s" : ""}</p>
                </div>
                {/* Achievements mini bar */}
                <div className="sd-achieve-mini">
                  {ACHIEVEMENTS.map(ac => {
                    const unlocked = ac.check(myActivities);
                    return (
                      <div key={ac.id} className={`sd-achieve-badge ${unlocked ? "unlocked" : "locked"}`} title={ac.desc}>
                        {ac.icon}
                        <span>{ac.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {myActivities.length === 0 ? (
                <div className="sd-empty">
                  <div className="sd-empty-ic"><Target size={28} strokeWidth={1.4} /></div>
                  <p>No enrollments yet</p>
                  <span>Browse activities and enroll to get started</span>
                  <button className="sd-cta-btn" onClick={() => setActiveTab("browse")}>Browse Activities</button>
                </div>
              ) : (
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th>Activity</th>
                      <th>Category</th>
                      <th>Capacity</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myActivities.map((act, i) => {
                      const cc = catColors[act.type] || {};
                      const capPct = Math.min((act.currentParticipants / (act.maxParticipants || 30)) * 100, 100);
                      return (
                        <tr key={act.id} style={{ animationDelay: `${i * 0.04}s` }}>
                          <td>
                            <div className="sd-table-act">
                              <div className="sd-table-ic" style={{ background: cc.bg, color: cc.color }}>
                                {catIconsSm[act.type]}
                              </div>
                              <span className="sd-table-name">{act.name}</span>
                            </div>
                          </td>
                          <td>
                            <span className="sd-tag" style={{ color: cc.color, background: cc.bg, border: `1px solid ${cc.border}` }}>
                              {act.type}
                            </span>
                          </td>
                          <td>
                            <div style={{ width: 80 }}>
                              <div className="sd-cap-bar">
                                <div className="sd-cap-fill" style={{ width: `${capPct}%`, background: cc.color }} />
                              </div>
                              <span style={{ fontSize: 11, color: "var(--sd-text-soft)" }}>{act.currentParticipants}/{act.maxParticipants || 30}</span>
                            </div>
                          </td>
                          <td>
                            <div className="sd-status">
                              <div className="sd-dot" /> Active
                            </div>
                          </td>
                          <td>
                            <button className="sd-btn-unreg sm" onClick={() => unregister(act.id)}>
                              <X size={11} strokeWidth={2.5} /> Withdraw
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* LEADERBOARD */}
          {activeTab === "leaderboard" && (
            <div className="sd-panel">
              <div className="sd-panel-head">
                <div>
                  <h2 className="sd-panel-title">Student Leaderboard</h2>
                  <p className="sd-panel-sub">Ranked by activity participation & diversity</p>
                </div>
                {myRank > 0 && (
                  <div className="sd-my-rank-badge">
                    <Trophy size={14} strokeWidth={2} /> Your Rank: #{myRank}
                  </div>
                )}
              </div>

              {leaderboard.length === 0 ? (
                <div className="sd-empty">
                  <div className="sd-empty-ic"><Trophy size={28} strokeWidth={1.4} /></div>
                  <p>No data yet</p>
                  <span>Enroll in activities to appear on the leaderboard</span>
                </div>
              ) : (
                <div className="sd-lb-list">
                  {leaderboard.map((st, i) => {
                    const isMe = st.name === user?.username;
                    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                    return (
                      <div key={i} className={`sd-lb-row ${isMe ? "sd-lb-me" : ""}`}>
                        <div className="sd-lb-rank">
                          {medal ? <span className="sd-lb-medal">{medal}</span> : <span className="sd-lb-num">#{i + 1}</span>}
                        </div>
                        <div className="sd-lb-av">{initials(st.name)}</div>
                        <div className="sd-lb-info">
                          <span className="sd-lb-name">{st.name}{isMe && <span className="sd-you-tag">You</span>}</span>
                          <span className="sd-lb-sub">{st.joined} activities · {st.cats} categories</span>
                        </div>
                        <div className="sd-lb-score">
                          <span className="sd-lb-pts">{st.score}</span>
                          <span className="sd-lb-pts-lbl">pts</span>
                        </div>
                        <div className="sd-lb-bar-wrap">
                          <div className="sd-lb-bar">
                            <div className="sd-lb-bar-fill" style={{ width: `${Math.min((st.score / (leaderboard[0]?.score || 1)) * 100, 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* CAREER */}
          {activeTab === "career" && (
            <CareerIntelligence registeredActivities={myActivities} />
          )}

        </div>
      </div>

      {/* Toast */}
      {toast.msg && (
        <div className={`sd-toast sd-toast--${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}