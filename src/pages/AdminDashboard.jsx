import { getActivities, createActivity, deleteActivity as deleteActivityApi } from "../services/api";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trophy, ClipboardList, BarChart2, Users, FolderOpen,
  Plus, Trash2, ChevronDown, LogOut, Eye, EyeOff,
  Medal, Target, Calendar, Palette, Star,
  Megaphone, TrendingUp, UserCog, AlertCircle, Download,
  Activity, ChevronRight, UserCheck, Shield, Search,
  X, CheckSquare, Settings
} from "lucide-react";
import "./Admin.css";

const categoryIcons = {
  Sports: <Medal size={18} strokeWidth={1.8} />,
  Clubs: <Target size={18} strokeWidth={1.8} />,
  Events: <Calendar size={18} strokeWidth={1.8} />,
  Cultural: <Palette size={18} strokeWidth={1.8} />,
};

const catColors = {
  Sports: { bg: "rgba(239,68,68,0.10)", color: "#DC2626", border: "rgba(239,68,68,0.20)" },
  Clubs: { bg: "rgba(59,130,246,0.10)", color: "#2563EB", border: "rgba(59,130,246,0.20)" },
  Events: { bg: "rgba(16,185,129,0.10)", color: "#059669", border: "rgba(16,185,129,0.20)" },
  Cultural: { bg: "rgba(168,85,247,0.10)", color: "#7C3AED", border: "rgba(168,85,247,0.20)" },
};

const activityOptions = {
  Sports: ["Cricket", "Football", "Badminton", "Basketball", "Tennis", "Volleyball"],
  Clubs: ["Film Making Club", "Coding Club", "Photography Club", "Drama Club", "Music Club"],
  Events: ["Annual Sports Day", "Tech Fest", "Cultural Fest", "Hackathon"],
  Cultural: ["Dance Competition", "Singing Competition", "Art Exhibition", "Debate Competition"],
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [activities, setActivities] = useState([]);
  const [category, setCategory] = useState("Sports");
  const [selectedActivity, setSelectedActivity] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(30);
  const [customActivityName, setCustomActivityName] = useState("");

  const [activeTab, setActiveTab] = useState("activities");
  const [expandedId, setExpandedId] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  // Bulk Actions
  const [checkedIds, setCheckedIds] = useState(new Set());

  // Announcements
  const [announcements, setAnnouncements] = useState([]);
  const [annText, setAnnText] = useState("");
  const [annTarget, setAnnTarget] = useState("All");
  const [annPriority, setAnnPriority] = useState("Info");

  // Users & Audit
  const [sysUsers, setSysUsers] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [auditOpen, setAuditOpen] = useState(false);
  const [searchUser, setSearchUser] = useState("");

  // Profile dropdown
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const loadActivities = async () => {
    const data = await getActivities();
    setActivities(data);
  };

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("currentUser"));
    if (!u || u.role !== "admin") { navigate("/login"); return; }
    setUser(u);
    loadActivities();
  }, []);

  // Close profile on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };

  const logAction = (type, actName) => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      adminName: user?.name || "Admin",
      type,
      activityName: actName,
    };
    const updated = [newLog, ...auditLog].slice(0, 100);
    setAuditLog(updated);
  };

  // ── Activity Management ──────────────────────────────────
  const addActivity = async () => {
    const name = customActivityName.trim() || selectedActivity;
    if (!name) { showToast("Enter activity name", "error"); return; }
    await createActivity({
      name,
      type: category,
      maxParticipants: parseInt(maxParticipants) || 30,
    });
    logAction("Add", name);
    setSelectedActivity(""); setCustomActivityName("");
    showToast("Activity created");
    loadActivities();
  };

  const handleDelete = async (id) => {
    const target = activities.find(a => a.id === id);
    await deleteActivityApi(id);
    const newChecked = new Set(checkedIds); newChecked.delete(id); setCheckedIds(newChecked);
    if (expandedId === id) setExpandedId(null);
    if (target) logAction("Delete", target.name);
    showToast("Deleted");
    loadActivities();
  };

  const overrideCap = (id) => {
    const target = activities.find(a => a.id === id);
    if (!target) return;
    const updated = activities.map(a => a.id === id ? { ...a, maxParticipants: a.maxParticipants + 10 } : a);
    setActivities(updated);
    logAction("Override", target.name);
    showToast("Capacity increased by 10");
  };

  // ── Bulk Actions ─────────────────────────────────────────
  const toggleCheck = (id) => {
    const s = new Set(checkedIds);
    if (s.has(id)) s.delete(id); else s.add(id);
    setCheckedIds(s);
  };
  const toggleCheckAll = () => {
    if (checkedIds.size === activities.length) setCheckedIds(new Set());
    else setCheckedIds(new Set(activities.map(a => a.id)));
  };
  const deleteSelected = async () => {
    if (checkedIds.size === 0) return;
    await Promise.all([...checkedIds].map(id => deleteActivityApi(id)));
    logAction("Delete", `Bulk: ${checkedIds.size} items`);
    setCheckedIds(new Set());
    showToast("Selected activities deleted");
    loadActivities();
  };
  const exportCSV = () => {
    const acts = checkedIds.size > 0 ? activities.filter(a => checkedIds.has(a.id)) : activities;
    let csv = "Activity,Category,Max Participants,Current Participants\n";
    acts.forEach(a => {
      csv += `"${a.name}","${a.type}",${a.maxParticipants},${a.currentParticipants || 0}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url; el.download = "activities_export.csv"; el.click();
    showToast("Exported to CSV");
  };

  // ── Announcements ────────────────────────────────────────
  const postAnnouncement = () => {
    if (!annText.trim()) { showToast("Announcement text cannot be empty", "error"); return; }
    const newAnn = {
      id: Date.now(), text: annText.trim(),
      target: annTarget, priority: annPriority,
      date: new Date().toLocaleDateString(),
      author: user?.name || "Admin",
    };
    const updated = [newAnn, ...announcements];
    setAnnouncements(updated);
    setAnnText("");
    showToast("Announcement posted");
  };
  const deleteAnn = (id) => {
    const updated = announcements.filter(a => a.id !== id);
    setAnnouncements(updated);
    showToast("Announcement removed");
  };

  // ── Users Management ─────────────────────────────────────
  const toggleRole = (email) => {
    if (email === user.email) { showToast("Cannot change your own role", "error"); return; }
    if (!window.confirm("Change this user's role?")) return;
    const updated = sysUsers.map(u =>
      u.email === email ? { ...u, role: u.role === "admin" ? "student" : "admin" } : u
    );
    setSysUsers(updated);
    showToast("User role updated");
  };
  const toggleActive = (email) => {
    if (email === user.email) { showToast("Cannot deactivate yourself", "error"); return; }
    const updated = sysUsers.map(u =>
      u.email === email ? { ...u, active: u.active === false ? true : false } : u
    );
    setSysUsers(updated);
    showToast("User status updated");
  };

  const handleLogout = () => { localStorage.removeItem("currentUser"); navigate("/login"); };

  // ── Analytics Helpers ────────────────────────────────────
  const totalParticipants = activities.reduce((s, a) => s + (a.currentParticipants || 0), 0);
  const uniqueStudents = totalParticipants; // aggregate from server count
  const grouped = activities.reduce((acc, a) => {
    acc[a.type] = acc[a.type] || []; acc[a.type].push(a); return acc;
  }, {});

  const studentEngagement = [];

  const initials = (name) => name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AD";

  // SVG Line Chart
  const renderSVGLineChart = () => {
    if (activities.length === 0) return (
      <div className="adm-no-data">
        <BarChart2 size={28} strokeWidth={1.4} />
        <p>No activity data yet</p>
      </div>
    );
    const w = 560, h = 180;
    const maxVal = Math.max(...activities.map(a => a.currentParticipants || 0), 1);
    const pad = 20;
    const usableW = w - pad * 2;
    const usableH = h - pad * 2;
    const pts = activities.map((a, i) => {
      const x = pad + (activities.length === 1 ? usableW / 2 : i * (usableW / (activities.length - 1)));
      const y = pad + usableH - ((a.currentParticipants || 0) / maxVal) * usableH;
      return { x, y, a };
    });
    const polyPoints = pts.map(p => `${p.x},${p.y}`).join(" ");
    const areaPoints = `${pts[0].x},${h - pad} ` + polyPoints + ` ${pts[pts.length - 1].x},${h - pad}`;
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="adm-svg-chart" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(124,58,237,0.25)" />
            <stop offset="100%" stopColor="rgba(124,58,237,0)" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#chartGrad)" />
        <polyline fill="none" stroke="var(--violet)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={polyPoints} />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="var(--pink)" stroke="white" strokeWidth="2" />
            <title>{p.a.name}: {p.a.currentParticipants || 0}</title>
          </g>
        ))}
      </svg>
    );
  };

  // Tab config
  const tabs = [
    { id: "activities", icon: <ClipboardList size={16} />, label: "Manage Activities" },
    { id: "participation", icon: <Users size={16} />, label: "Participation" },
    { id: "announcements", icon: <Megaphone size={16} />, label: "Announcements" },
    { id: "analytics", icon: <TrendingUp size={16} />, label: "Analytics" },
    { id: "users", icon: <UserCog size={16} />, label: "Users" },
  ];

  const pageTitle = {
    activities: "Manage Activities",
    participation: "Participation Tracker",
    announcements: "Broadcast Announcements",
    analytics: "Platform Analytics",
    users: "User Management",
  }[activeTab];

  return (
    <div className="admin-container">
      <div className="admin-blob admin-b1" />
      <div className="admin-blob admin-b2" />

      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon"><Trophy size={18} strokeWidth={2} color="#fff" /></div>
          <div>
            <span className="sidebar-brand-name">ClubConnect</span>
            <span className="sidebar-brand-sub">Admin Panel</span>
          </div>
        </div>

        <div className="sidebar-section-label">Management</div>
        <nav className="sidebar-nav">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`sidebar-item ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <div className="sidebar-avatar">{initials(user?.name)}</div>
            <div>
              <div className="sidebar-uname">{user?.name || "Admin"}</div>
              <div className="sidebar-urole">Administrator</div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="admin-main">
        {/* Top Bar */}
        <div className="admin-topbar">
          <div className="topbar-left">
            <div className="adm-breadcrumb">
              <span>Admin</span>
              <ChevronRight size={12} />
              <span className="adm-bc-active">{pageTitle}</span>
            </div>
            <h1>{pageTitle}</h1>
          </div>

          {/* Profile area */}
          <div className="topbar-right" ref={profileRef}>
            <div
              className="topbar-profile-trigger"
              onMouseEnter={() => setProfileOpen(true)}
              onClick={() => setProfileOpen(v => !v)}
            >
              <div className="topbar-avatar">{initials(user?.name)}</div>
              <div>
                <div className="topbar-name">{user?.name || "Admin"}</div>
                <div className="topbar-role-lbl">Administrator</div>
              </div>
              <ChevronDown size={13} className={`adm-profile-chev ${profileOpen ? "open" : ""}`} />
            </div>

            {profileOpen && (
              <div
                className="adm-profile-dropdown"
                onMouseLeave={() => setProfileOpen(false)}
              >
                <div className="adm-pd-header">
                  <div className="adm-pd-av">{initials(user?.name)}</div>
                  <div>
                    <div className="adm-pd-name">{user?.name || "Admin"}</div>
                    <div className="adm-pd-email">{user?.email || "admin@college.edu"}</div>
                  </div>
                </div>
                <div className="adm-pd-divider" />
                <div className="adm-pd-stats">
                  <div className="adm-pd-stat">
                    <span className="adm-pd-stat-val">{activities.length}</span>
                    <span className="adm-pd-stat-lbl">Activities</span>
                  </div>
                  <div className="adm-pd-stat-sep" />
                  <div className="adm-pd-stat">
                    <span className="adm-pd-stat-val">{uniqueStudents}</span>
                    <span className="adm-pd-stat-lbl">Students</span>
                  </div>
                  <div className="adm-pd-stat-sep" />
                  <div className="adm-pd-stat">
                    <span className="adm-pd-stat-val">{announcements.length}</span>
                    <span className="adm-pd-stat-lbl">Posts</span>
                  </div>
                </div>
                <div className="adm-pd-divider" />
                <button className="adm-pd-logout" onClick={handleLogout}>
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="admin-body">

          {/* ═══════════════ MANAGE ACTIVITIES ═══════════════ */}
          {activeTab === "activities" && (
            <>
              {/* Stats */}
              <div className="admin-stats-grid">
                <div className="stat-card">
                  <div className="stat-icon"><ClipboardList size={20} /></div>
                  <div><div className="stat-num">{activities.length}</div><div className="stat-label">Total Activities</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><Star size={20} /></div>
                  <div><div className="stat-num">{totalParticipants}</div><div className="stat-label">Registrations</div></div>
                </div>
                <div className="stat-card accent">
                  <div className="stat-icon"><Users size={20} /></div>
                  <div><div className="stat-num">{uniqueStudents}</div><div className="stat-label">Unique Students</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><FolderOpen size={20} /></div>
                  <div><div className="stat-num">{Object.keys(grouped).length}</div><div className="stat-label">Categories</div></div>
                </div>
              </div>

              {/* Add Activity */}
              <div className="add-activity-card">
                <div className="section-header">
                  <div><h2>Add New Activity</h2><p>Select category, name, and capacity</p></div>
                </div>
                <div className="add-activity-form">
                  <div className="select-wrap" style={{ flex: "0 0 160px" }}>
                    <select value={category} onChange={e => { setCategory(e.target.value); setSelectedActivity(""); setCustomActivityName(""); }}>
                      {Object.keys(activityOptions).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={14} className="select-icon" />
                  </div>
                  <div className="select-wrap">
                    <select value={selectedActivity} onChange={e => { setSelectedActivity(e.target.value); setCustomActivityName(""); }}>
                      <option value="">— Choose preset —</option>
                      {activityOptions[category].map((a, i) => <option key={i} value={a}>{a}</option>)}
                    </select>
                    <ChevronDown size={14} className="select-icon" />
                  </div>
                  <div className="input-wrap">
                    <input
                      type="text"
                      placeholder="Or type custom name…"
                      value={customActivityName}
                      onChange={e => { setCustomActivityName(e.target.value); setSelectedActivity(""); }}
                    />
                  </div>
                  <div className="input-wrap" style={{ flex: "0 0 140px" }}>
                    <input type="number" min="1" max="500" placeholder="Max capacity" value={maxParticipants} onChange={e => setMaxParticipants(e.target.value)} />
                  </div>
                  <button className="add-btn" onClick={addActivity}>
                    <Plus size={15} /> Add Activity
                  </button>
                </div>
              </div>

              {/* Activity Table */}
              <div className="activity-table-card">
                {/* Bulk bar */}
                {checkedIds.size > 0 && (
                  <div className="bulk-bar">
                    <div className="bulk-count"><span>{checkedIds.size}</span> selected</div>
                    <div className="action-cell">
                      <button className="delete-btn-sm" onClick={deleteSelected}><Trash2 size={14} /> Delete</button>
                      <button className="view-btn" onClick={exportCSV}><Download size={14} /> Export CSV</button>
                    </div>
                  </div>
                )}

                <div className="activity-table-header">
                  <input type="checkbox" className="custom-chk" onChange={toggleCheckAll}
                    checked={activities.length > 0 && checkedIds.size === activities.length}
                    ref={el => { if (el) el.indeterminate = checkedIds.size > 0 && checkedIds.size < activities.length; }}
                  />
                  <span>Activity</span>
                  <span>Category</span>
                  <span>Capacity</span>
                  <span>Registered</span>
                  <span style={{ textAlign: "right" }}>Actions</span>
                </div>

                {activities.length === 0 ? (
                  <div className="adm-empty">
                    <ClipboardList size={28} strokeWidth={1.4} />
                    <p>No activities yet. Add your first one above!</p>
                  </div>
                ) : activities.map(activity => {
                  const curr = activity.currentParticipants || 0;
                  const capPercent = Math.min((curr / activity.maxParticipants) * 100, 100);
                  const isFull = curr >= activity.maxParticipants;
                  const cc = catColors[activity.type] || {};
                  return (
                    <div key={activity.id} className="adm-table-row-wrap">
                      <div className="activity-row">
                        <input type="checkbox" className="custom-chk" checked={checkedIds.has(activity.id)} onChange={() => toggleCheck(activity.id)} />
                        <div className="activity-name-cell">
                          <div className="activity-emoji-box" style={{ background: cc.bg, color: cc.color }}>{categoryIcons[activity.type]}</div>
                          <div>
                            <span className="activity-name">{activity.name}</span>
                            {activity.createdAt && <span className="adm-created">{activity.createdAt}</span>}
                          </div>
                        </div>
                        <div>
                          <span className="category-pill" style={{ background: cc.bg, color: cc.color, border: `1px solid ${cc.border}` }}>{activity.type}</span>
                        </div>

                        <div className="cap-wrap">
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }} className="cap-text">
                            <span>{curr}/{activity.maxParticipants}</span>
                            <span>{Math.round(capPercent)}%</span>
                          </div>
                          <div className="cap-bar">
                            <div className="cap-fill" style={{
                              width: `${capPercent}%`,
                              background: isFull ? "#EF4444" : capPercent > 80 ? "#F59E0B" : "#10B981"
                            }} />
                          </div>
                          {isFull && <span className="adm-full-tag">FULL</span>}
                        </div>

                        <div>
                          {curr === 0 ? (
                            <span style={{ fontSize: "13px", color: "var(--text-soft)" }}>No registrations</span>
                          ) : (
                            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>{curr} enrolled</span>
                          )}
                        </div>

                        <div className="action-cell">
                          {isFull && <button className="over-btn-sm" onClick={() => overrideCap(activity.id)}>Override</button>}
                          <button className="delete-btn-sm" onClick={() => handleDelete(activity.id)}><Trash2 size={13} /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {activities.length > 0 && (
                  <div style={{ padding: "12px 24px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
                    <button className="view-btn" onClick={exportCSV}><Download size={14} /> Export All CSV</button>
                  </div>
                )}
              </div>

              {/* Audit Log */}
              <div className="audit-wrap">
                <div className="audit-head" onClick={() => setAuditOpen(!auditOpen)}>
                  <span>Activity Audit Log ({auditLog.length})</span>
                  <ChevronDown size={16} style={{ transform: auditOpen ? "rotate(180deg)" : "", transition: "0.2s" }} />
                </div>
                {auditOpen && (
                  <div className="audit-list">
                    {auditLog.length === 0 ? (
                      <p style={{ color: "var(--text-soft)", fontSize: "13px" }}>No logs yet.</p>
                    ) : auditLog.map(l => (
                      <div key={l.id} className="audit-item">
                        <span className="audit-time">{l.timestamp}</span>
                        <span style={{ width: "100px", fontWeight: 600, fontSize: "13px" }}>{l.adminName}</span>
                        <span className={`audit-pill ${l.type}`}>{l.type}</span>
                        <span style={{ fontSize: "13px" }}>{l.activityName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ═══════════════ PARTICIPATION ═══════════════ */}
          {activeTab === "participation" && (
            <>
              <div className="admin-stats-grid">
                <div className="stat-card">
                  <div className="stat-icon"><Users size={20} /></div>
                  <div><div className="stat-num">{uniqueStudents}</div><div className="stat-label">Unique Students</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><CheckSquare size={20} /></div>
                  <div><div className="stat-num">{totalParticipants}</div><div className="stat-label">Total Registrations</div></div>
                </div>
                <div className="stat-card accent">
                  <div className="stat-icon"><Activity size={20} /></div>
                  <div>
                    <div className="stat-num">
                      {activities.length > 0 ? Math.round((totalParticipants / (activities.length * (activities[0]?.maxParticipants || 30))) * 100) : 0}%
                    </div>
                    <div className="stat-label">Avg Fill Rate</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><Trophy size={20} /></div>
                  <div>
                    <div className="stat-num">
                      {activities.length > 0 ? activities.reduce((best, a) => (a.currentParticipants || 0) > (best?.currentParticipants || 0) ? a : best, null)?.name?.split(" ")[0] || "—" : "—"}
                    </div>
                    <div className="stat-label">Most Popular</div>
                  </div>
                </div>
              </div>

              {/* Per-Activity Participation */}
              <div className="activity-table-card" style={{ marginBottom: 24 }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
                  <h2 className="chart-title" style={{ margin: 0 }}>Activity Fill Rates</h2>
                  <p style={{ fontSize: "13px", color: "var(--text-soft)", marginTop: 4 }}>Capacity utilization per activity</p>
                </div>
                {activities.length === 0 ? (
                  <div className="adm-empty"><Users size={28} strokeWidth={1.4} /><p>No activities added yet</p></div>
                ) : (
                  <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
                    {activities
                      .slice()
                      .sort((a, b) => (b.currentParticipants || 0) - (a.currentParticipants || 0))
                      .map(act => {
                        const curr = act.currentParticipants || 0;
                        const pct = Math.min((curr / act.maxParticipants) * 100, 100);
                        const isFull = curr >= act.maxParticipants;
                        const cc = catColors[act.type] || {};
                        return (
                          <div key={act.id} className="part-row">
                            <div className="part-info">
                              <div className="part-ic" style={{ background: cc.bg, color: cc.color }}>{categoryIcons[act.type]}</div>
                              <div>
                                <div className="part-name">{act.name}</div>
                                <div className="part-sub">{act.type} · {curr}/{act.maxParticipants} enrolled</div>
                              </div>
                            </div>
                            <div className="part-bar-wrap">
                              <div className="part-bar">
                                <div className="part-fill" style={{
                                  width: `${pct}%`,
                                  background: isFull ? "#EF4444" : pct > 80 ? "#F59E0B" : cc.color || "#10B981",
                                }} />
                              </div>
                              <span className="part-pct">{Math.round(pct)}%</span>
                            </div>
                            {isFull && <span className="adm-full-tag">FULL</span>}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Top Engaged Students */}
              <div className="activity-table-card">
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border)" }}>
                  <h2 className="chart-title" style={{ margin: 0 }}>Top Engaged Students</h2>
                  <p style={{ fontSize: "13px", color: "var(--text-soft)", marginTop: 4 }}>Ranked by number of activities joined</p>
                </div>
                {studentEngagement.length === 0 ? (
                  <div className="adm-empty"><UserCheck size={28} strokeWidth={1.4} /><p>No student data yet</p></div>
                ) : (
                  <div style={{ padding: "0" }}>
                    <div className="activity-table-header" style={{ gridTemplateColumns: "40px 2fr 1fr 1fr 120px" }}>
                      <span>#</span><span>Student</span><span>Activities</span><span>Top Category</span><span style={{ textAlign: "right" }}>Score</span>
                    </div>
                    {studentEngagement.slice(0, 10).map((st, i) => {
                      const cc = catColors[st.freqCat] || {};
                      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                      return (
                        <div key={i} className="activity-row" style={{ gridTemplateColumns: "40px 2fr 1fr 1fr 120px" }}>
                          <div style={{ fontSize: "18px" }}>{medal || <span style={{ color: "var(--text-soft)", fontWeight: 700 }}>#{i + 1}</span>}</div>
                          <div style={{ fontWeight: 600, fontSize: "14px" }}>{st.name}</div>
                          <div>{st.joined} <span style={{ color: "var(--text-soft)", fontSize: "11px" }}>activities</span></div>
                          <div><span className="category-pill" style={{ background: cc.bg, color: cc.color, border: `1px solid ${cc.border}` }}>{st.freqCat}</span></div>
                          <div style={{ textAlign: "right", fontWeight: 800, color: "var(--violet)", fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: "16px" }}>
                            {st.joined * 10}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ═══════════════ ANNOUNCEMENTS ═══════════════ */}
          {activeTab === "announcements" && (
            <div style={{ maxWidth: "760px" }}>
              <div className="add-activity-card">
                <div className="section-header">
                  <div><h2>Broadcast Message</h2><p>Post announcements visible on student dashboards</p></div>
                </div>
                <textarea
                  className="adm-textarea"
                  placeholder="Write your announcement here…"
                  value={annText}
                  onChange={e => setAnnText(e.target.value)}
                />
                <div className="announce-controls">
                  <div className="select-wrap">
                    <select value={annTarget} onChange={e => setAnnTarget(e.target.value)}>
                      <option value="All">All Students</option>
                      <option value="Sports">Sports</option>
                      <option value="Clubs">Clubs</option>
                      <option value="Events">Events</option>
                      <option value="Cultural">Cultural</option>
                    </select>
                    <ChevronDown size={14} className="select-icon" />
                  </div>
                  <div className="select-wrap">
                    <select value={annPriority} onChange={e => setAnnPriority(e.target.value)}>
                      <option value="Info">ℹ️ Info</option>
                      <option value="Warning">⚠️ Warning</option>
                      <option value="Urgent">🚨 Urgent</option>
                    </select>
                    <ChevronDown size={14} className="select-icon" />
                  </div>
                  <button className="add-btn" onClick={postAnnouncement}><Megaphone size={15} /> Post</button>
                </div>
              </div>

              <div className="section-header" style={{ marginTop: 8 }}>
                <h2>Active Announcements ({announcements.length})</h2>
              </div>
              <div className="announce-list">
                {announcements.length === 0 ? (
                  <div className="adm-empty"><Megaphone size={28} strokeWidth={1.4} /><p>No announcements posted yet</p></div>
                ) : announcements.map(a => (
                  <div key={a.id} className={`announce-card ${a.priority}`}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
                        <span className={`adm-priority-pill ${a.priority}`}>{a.priority}</span>
                        <span style={{ fontSize: "11.5px", color: "var(--text-soft)", fontWeight: 600 }}>
                          {a.date} · Target: {a.target} · By {a.author || "Admin"}
                        </span>
                      </div>
                      <p style={{ fontSize: "14.5px", lineHeight: 1.6 }}>{a.text}</p>
                    </div>
                    <button className="delete-btn-sm" onClick={() => deleteAnn(a.id)}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════ ANALYTICS ═══════════════ */}
          {activeTab === "analytics" && (
            <>
              <div className="admin-stats-grid">
                <div className="stat-card">
                  <div className="stat-icon"><ClipboardList size={20} /></div>
                  <div><div className="stat-num">{activities.length}</div><div className="stat-label">Activities</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><Users size={20} /></div>
                  <div><div className="stat-num">{uniqueStudents}</div><div className="stat-label">Students</div></div>
                </div>
                <div className="stat-card accent">
                  <div className="stat-icon"><TrendingUp size={20} /></div>
                  <div><div className="stat-num">{totalParticipants}</div><div className="stat-label">Registrations</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><FolderOpen size={20} /></div>
                  <div><div className="stat-num">{Object.keys(grouped).length}</div><div className="stat-label">Categories</div></div>
                </div>
              </div>

              <div className="analytics-grid">
                <div className="chart-card">
                  <div className="chart-title">Registrations per Activity</div>
                  {renderSVGLineChart()}
                  <div style={{ textAlign: "center", fontSize: "12px", color: "var(--text-soft)", marginTop: 10 }}>
                    Oldest → Newest
                  </div>
                </div>
                <div className="chart-card">
                  <div className="chart-title">Category Breakdown</div>
                  {Object.keys(grouped).length === 0 ? (
                    <div className="adm-no-data"><BarChart2 size={24} strokeWidth={1.4} /><p>No data</p></div>
                  ) : (
                    <div style={{ marginTop: 20 }}>
                      {Object.entries(grouped).sort((a, b) => b[1].length - a[1].length).map(([cat, acts]) => {
                        const max = Math.max(...Object.values(grouped).map(g => g.length), 1);
                        const cc = catColors[cat] || {};
                        return (
                          <div key={cat} className="bar-chart-row">
                            <div className="bar-chart-lbl">{cat}</div>
                            <div className="bar-chart-track">
                              <div className="bar-chart-fill" style={{ width: `${(acts.length / max) * 100}%`, background: cc.color }} />
                            </div>
                            <div style={{ fontSize: "12px", fontWeight: 700, color: cc.color, width: 20, textAlign: "right" }}>{acts.length}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Registration heatmap by category */}
              <div className="chart-card" style={{ marginBottom: 24 }}>
                <div className="chart-title">Category Registration Summary</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginTop: 16 }}>
                  {Object.entries(grouped).map(([cat, acts]) => {
                    const registered = acts.reduce((s, a) => s + (a.currentParticipants || 0), 0);
                    const cc = catColors[cat] || {};
                    return (
                      <div key={cat} className="adm-cat-card" style={{ borderColor: cc.border, background: cc.bg }}>
                        <div style={{ color: cc.color, marginBottom: 6 }}>{categoryIcons[cat]}</div>
                        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 22, color: cc.color }}>{registered}</div>
                        <div style={{ fontSize: 12, color: cc.color, fontWeight: 600, opacity: 0.85 }}>{cat} registrations</div>
                        <div style={{ fontSize: 11, color: "var(--text-soft)", marginTop: 4 }}>{acts.length} activit{acts.length !== 1 ? "ies" : "y"}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ═══════════════ USERS ═══════════════ */}
          {activeTab === "users" && (
            <div className="activity-table-card">
              <div className="adm-users-header">
                <div>
                  <div className="chart-title" style={{ margin: 0 }}>System Users</div>
                  <p style={{ fontSize: "13px", color: "var(--text-soft)", marginTop: 4 }}>{sysUsers.length} registered users</p>
                </div>
                <div className="adm-search-wrap">
                  <Search size={14} className="adm-search-ic" />
                  <input
                    type="text"
                    className="adm-search"
                    placeholder="Search by name or email…"
                    value={searchUser}
                    onChange={e => setSearchUser(e.target.value)}
                  />
                </div>
              </div>

              <div className="activity-table-header" style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr 160px" }}>
                <span>Name</span><span>Email</span><span>Role</span><span>Status</span><span style={{ textAlign: "right" }}>Actions</span>
              </div>

              {sysUsers.length === 0 ? (
                <div className="adm-empty"><UserCog size={28} strokeWidth={1.4} /><p>No users found</p></div>
              ) : sysUsers
                .filter(u =>
                  u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
                  u.email?.toLowerCase().includes(searchUser.toLowerCase())
                )
                .map((u, i) => (
                  <div key={i} className="activity-row" style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr 160px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="adm-user-av">{initials(u.name)}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "14px" }}>{u.name}</div>
                        {u.email === user?.email && <span className="adm-you-tag">You</span>}
                      </div>
                    </div>
                    <span style={{ color: "var(--text-soft)", fontSize: "13px" }}>{u.email}</span>
                    <span><span className={`user-badge ${u.role}`}>{u.role}</span></span>
                    <span>
                      {u.active === false
                        ? <span className="adm-status-dot inactive">● Inactive</span>
                        : <span className="adm-status-dot active">● Active</span>
                      }
                    </span>
                    <div className="action-cell">
                      <button className="view-btn" onClick={() => toggleRole(u.email)} title="Toggle admin/student">
                        <Shield size={13} /> Role
                      </button>
                      <button
                        className={u.active === false ? "view-btn" : "delete-btn-sm"}
                        onClick={() => toggleActive(u.email)}
                      >
                        {u.active === false ? "Activate" : "Deactivate"}
                      </button>
                    </div>
                  </div>
                ))
              }
            </div>
          )}

        </div>
      </main>

      {/* Toast */}
      {toast.msg && (
        <div className={`admin-toast adm-toast-${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}

export default AdminDashboard;