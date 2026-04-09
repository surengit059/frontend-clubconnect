import { useNavigate } from "react-router-dom";
import { useRef, useState, useCallback } from "react";
import {
  ClipboardList, LayoutDashboard, Bell, TrendingUp,
  ChevronRight, Users, Shield, Zap, Star, ArrowRight, Sparkles,
  Target, Briefcase, CheckCircle, Medal, Calendar, Palette,
  Trophy, Rocket, BarChart2, Globe, Heart, Mail,
  Github, Twitter, Linkedin, BookOpen, MonitorSmartphone,
  UserCheck, Search, Award, Map, ChevronDown
} from "lucide-react";
import "./Home.css";

const PULL_THRESHOLD = 110; // px needed to trigger navigation

function Home() {
  const navigate = useNavigate();

  /* ── Pull-to-demo state ── */
  const pullRef = useRef(null);   // the draggable handle element
  const dragStart = useRef(null);   // { y, touch }
  const [pullY, setPullY] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [triggered, setTriggered] = useState(false);

  const progress = Math.min(pullY / PULL_THRESHOLD, 1);

  /* ── Pointer / touch handlers ── */
  const onDragStart = useCallback((clientY) => {
    dragStart.current = clientY;
    setPulling(true);
  }, []);

  const onDragMove = useCallback((clientY) => {
    if (dragStart.current === null) return;
    const delta = Math.max(0, clientY - dragStart.current);
    setPullY(delta);
    if (delta >= PULL_THRESHOLD && !triggered) {
      setTriggered(true);
    }
  }, [triggered]);

  const onDragEnd = useCallback(() => {
    if (pullY >= PULL_THRESHOLD) {
      // short delay so user sees the "launched" state
      setTimeout(() => navigate("/login"), 320);
    }
    dragStart.current = null;
    setPullY(0);
    setPulling(false);
    setTimeout(() => setTriggered(false), 400);
  }, [pullY, navigate]);

  /* Mouse */
  const handleMouseDown = (e) => { e.preventDefault(); onDragStart(e.clientY); };
  const handleMouseMove = useCallback((e) => { if (pulling) onDragMove(e.clientY); }, [pulling, onDragMove]);
  const handleMouseUp = useCallback(() => { if (pulling) onDragEnd(); }, [pulling, onDragEnd]);

  /* Touch */
  const handleTouchStart = (e) => onDragStart(e.touches[0].clientY);
  const handleTouchMove = (e) => onDragMove(e.touches[0].clientY);
  const handleTouchEnd = () => onDragEnd();

  return (
    <div
      className="home"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* SVG gradient def for pull ring */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="pullGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
      </svg>
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
      <div className="blob blob-4" />

      {/* ═══════════════ NAVBAR ═══════════════ */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-logo">
            <Zap size={15} strokeWidth={2.5} color="#fff" />
          </div>
          <span className="brand-name">Club<span>Connect</span></span>
        </div>
        <nav className="nav-links">
          <a className="active" href="#hero">Home</a>
          <a href="#product">About</a>
          <a href="#features">Features</a>
          <a href="#screens">Screens</a>
        </nav>
        <button className="nav-cta" onClick={() => navigate("/login")}>
          Sign In <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </header>

      {/* ═══════════════ 1. HERO ═══════════════ */}
      <section className="hero" id="hero">
        <div className="hero-eyebrow">
          <span className="eyebrow-dot" />
          Student Activity Management Platform
        </div>

        <h1 className="hero-title">
          Where Students<br />
          Discover Their<br />
          <span className="hero-accent">Passion</span>
        </h1>

        <p className="hero-sub">
          ClubConnect brings every extracurricular activity under one roof.
          Admins manage with precision. Students register in seconds.
        </p>

        <div className="hero-cta-row">
          <button className="btn-primary" onClick={() => navigate("/login")}>
            <Sparkles size={15} strokeWidth={2} />
            Get Started Free
            <ChevronRight size={15} strokeWidth={2.5} />
          </button>
          <button className="btn-ghost" onClick={() => navigate("/login")}>
            Sign In
          </button>
        </div>

        <div className="trust-row">
          <div className="trust-pill"><Shield size={12} strokeWidth={2.5} />Secure &amp; Private</div>
          <div className="trust-pill"><Star size={12} strokeWidth={2.5} />Free to Join</div>
          <div className="trust-pill"><Users size={12} strokeWidth={2.5} />3,200+ Students</div>
        </div>

        {/* ── Pull-to-demo handle ── */}
        <div className="pull-demo-wrapper">
          <p className="pull-demo-hint" style={{ opacity: pulling ? 0 : 1 }}>
            <ChevronDown size={13} strokeWidth={2.5} className="pull-chevron-bounce" />
            Pull down to try the demo
          </p>

          {/* Track */}
          <div className="pull-track">
            {/* Progress fill */}
            <div
              className="pull-track-fill"
              style={{ height: `${progress * 100}%` }}
            />

            {/* Draggable knob */}
            <div
              ref={pullRef}
              className={`pull-knob${pulling ? " pulling" : ""}${triggered ? " triggered" : ""}`}
              style={{
                transform: `translateY(${pullY}px) translateX(-50%)`,
                cursor: pulling ? "grabbing" : "grab",
              }}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="pull-knob-inner">
                {triggered
                  ? <Sparkles size={18} strokeWidth={2} />
                  : <ChevronDown size={18} strokeWidth={2.5} />
                }
              </div>
              {/* Radial progress ring */}
              <svg className="pull-ring" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="21" className="pull-ring-bg" />
                <circle
                  cx="24" cy="24" r="21"
                  className="pull-ring-prog"
                  strokeDasharray={`${2 * Math.PI * 21}`}
                  strokeDashoffset={`${2 * Math.PI * 21 * (1 - progress)}`}
                />
              </svg>
            </div>

            {/* Landing zone label */}
            <div
              className="pull-target"
              style={{ opacity: pulling ? Math.min(progress * 1.5, 1) : 0 }}
            >
              <Zap size={14} strokeWidth={2.5} />
              {triggered ? "Release to launch!" : `${Math.round(progress * 100)}%`}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <div className="stats-row">
        <div className="stats-item">
          <span className="stats-num">120<em>+</em></span>
          <span className="stats-label">Activities</span>
        </div>
        <div className="stats-divider" />
        <div className="stats-item">
          <span className="stats-num">3.2<em>k</em></span>
          <span className="stats-label">Students</span>
        </div>
        <div className="stats-divider" />
        <div className="stats-item">
          <span className="stats-num">98<em>%</em></span>
          <span className="stats-label">Satisfaction</span>
        </div>
        <div className="stats-divider" />
        <div className="stats-item">
          <span className="stats-num">35<em>+</em></span>
          <span className="stats-label">Categories</span>
        </div>
      </div>

      {/* ═══════════════ 2. PRODUCT EXPLANATION ═══════════════ */}
      <section className="product-section" id="product">
        <div className="product-inner">
          <div className="product-text">
            <div className="section-tag"><Globe size={11} strokeWidth={2} /> What is ClubConnect</div>
            <h2>The Complete Student<br />Activity Platform</h2>
            <p className="product-desc">
              ClubConnect is a full-stack web application that bridges the gap between
              students and extracurricular activities. It provides a seamless experience for
              students to discover, register, and track sports, clubs, events, and cultural
              activities — while giving admins powerful tools to manage everything.
            </p>
            <div className="product-highlights">
              <div className="product-hl">
                <CheckCircle size={16} strokeWidth={2} />
                <span><strong>For Students</strong> — Browse, register, and track all activities in one dashboard</span>
              </div>
              <div className="product-hl">
                <CheckCircle size={16} strokeWidth={2} />
                <span><strong>For Admins</strong> — Create activities, monitor participation, and manage categories</span>
              </div>
              <div className="product-hl">
                <CheckCircle size={16} strokeWidth={2} />
                <span><strong>Career Intelligence</strong> — AI-powered career path matching based on your skills</span>
              </div>
              <div className="product-hl">
                <CheckCircle size={16} strokeWidth={2} />
                <span><strong>Real-Time Updates</strong> — Instant registration with live participant tracking</span>
              </div>
            </div>
          </div>
          <div className="product-visual">
            <div className="product-mockup">
              {/* Mockup: sidebar */}
              <div className="pm-sidebar">
                <div className="pm-brand-dot" />
                {["Browse","My Activities","Career"].map((l,i)=>(
                  <div key={i} className={`pm-nav-item${i===0?" active":""}`}>
                    <div className="pm-nav-dot" /><span>{l}</span>
                  </div>
                ))}
              </div>
              {/* Mockup: content */}
              <div className="pm-content">
                <div className="pm-topbar">
                  <div className="pm-search" />
                  <div className="pm-av" />
                </div>
                <div className="pm-stat-row">
                  {["Sports","Clubs","Events","Cultural"].map((c,i)=>(
                    <div key={i} className="pm-stat-card">
                      <div className="pm-stat-icon" />
                      <div className="pm-stat-label">{c}</div>
                    </div>
                  ))}
                </div>
                <div className="pm-cards">
                  {[0,1,2,3,4,5].map(i=>(
                    <div key={i} className="pm-card">
                      <div className="pm-card-dot" />
                      <div className="pm-card-lines">
                        <div className="pm-line pm-line-title" />
                        <div className="pm-line pm-line-sub" />
                      </div>
                      <div className="pm-card-btn" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="product-float-card pfc-1">
              <Medal size={18} strokeWidth={1.8} />
              <div>
                <div className="pfc-num">4</div>
                <div className="pfc-label">Categories</div>
              </div>
            </div>
            <div className="product-float-card pfc-2">
              <Users size={18} strokeWidth={1.8} />
              <div>
                <div className="pfc-num">3,200+</div>
                <div className="pfc-label">Active Students</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ 3. HOW IT WORKS ═══════════════ */}
      <section className="how-section" id="how">
        <div className="section-tag"><Rocket size={11} strokeWidth={2} /> How It Works</div>
        <h2 className="how-title">Get Started in 3 Simple Steps</h2>
        <p className="how-sub">From sign-up to career insights — it only takes a few minutes.</p>

        <div className="how-steps">
          <div className="how-step">
            <div className="how-step-num">1</div>
            <div className="how-step-line" />
            <div className="how-step-icon"><UserCheck size={26} strokeWidth={1.7} /></div>
            <h3>Create an Account</h3>
            <p>Sign up as a Student or Admin in seconds. No credit card required, completely free to use.</p>
          </div>
          <div className="how-step">
            <div className="how-step-num">2</div>
            <div className="how-step-line" />
            <div className="how-step-icon"><Search size={26} strokeWidth={1.7} /></div>
            <h3>Browse &amp; Register</h3>
            <p>Explore activities across Sports, Clubs, Events, and Cultural categories. Register with one click.</p>
          </div>
          <div className="how-step">
            <div className="how-step-num">3</div>
            <div className="how-step-icon"><TrendingUp size={26} strokeWidth={1.7} /></div>
            <h3>Track &amp; Grow</h3>
            <p>Monitor your activities, build real skills, and discover career paths that match your strengths.</p>
          </div>
        </div>
      </section>

      {/* ═══════════════ 4. FEATURE HIGHLIGHTS ═══════════════ */}
      <section className="features-section" id="features">
        <div className="features-header">
          <div className="section-tag"><Sparkles size={11} strokeWidth={2} /> Feature Highlights</div>
          <h2>Everything you need,<br />nothing you don't</h2>
          <p>A focused platform built specifically for student activity management.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card tall">
            <div className="feature-icon"><ClipboardList size={22} strokeWidth={1.8} /></div>
            <div className="feature-tag">Students</div>
            <h3>One-Click Registration</h3>
            <p>Browse every activity in your school and register instantly. Track all your sign-ups in a single personal dashboard.</p>
            <div className="feature-arrow"><ArrowRight size={15} strokeWidth={2} /></div>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><LayoutDashboard size={22} strokeWidth={1.8} /></div>
            <div className="feature-tag">Admins</div>
            <h3>Powerful Dashboard</h3>
            <p>Create, edit, and monitor every activity with a clean admin panel.</p>
            <div className="feature-arrow"><ArrowRight size={15} strokeWidth={2} /></div>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><Bell size={22} strokeWidth={1.8} /></div>
            <div className="feature-tag">Tracking</div>
            <h3>Live Participation</h3>
            <p>Real-time participant counts and registration tracking across all activities.</p>
            <div className="feature-arrow"><ArrowRight size={15} strokeWidth={2} /></div>
          </div>
          <div className="feature-card">
            <div className="feature-icon"><BarChart2 size={22} strokeWidth={1.8} /></div>
            <div className="feature-tag">Analytics</div>
            <h3>Participation Reports</h3>
            <p>Detailed participation data per category for smarter decisions.</p>
            <div className="feature-arrow"><ArrowRight size={15} strokeWidth={2} /></div>
          </div>
          <div className="feature-card glow-card tall">
            <div className="feature-icon glow-icon"><Zap size={22} strokeWidth={1.8} /></div>
            <div className="feature-tag glow-tag">New</div>
            <h3>Career Intelligence</h3>
            <p>AI maps your activities to real career skills. See your top career matches, skill gaps, and a personalized career roadmap.</p>
            <div className="feature-arrow glow-arrow"><ArrowRight size={15} strokeWidth={2} /></div>
          </div>
        </div>

        {/* Extra feature pills */}
        <div className="extra-features">
          {[
            { icon: <Shield size={14} />, label: "Secure Authentication" },
            { icon: <MonitorSmartphone size={14} />, label: "Responsive Design" },
            { icon: <Target size={14} />, label: "Skill Tracking" },
            { icon: <Map size={14} />, label: "Career Roadmap" },
            { icon: <Award size={14} />, label: "Achievement System" },
            { icon: <BookOpen size={14} />, label: "Resource Library" },
          ].map((f, i) => (
            <div key={i} className="extra-pill">{f.icon}{f.label}</div>
          ))}
        </div>
      </section>

      {/* ═══════════════ 5. SCREENS PREVIEW ═══════════════ */}
      <section className="screens-section" id="screens">
        <div className="section-tag"><MonitorSmartphone size={11} strokeWidth={2} /> App Screens</div>
        <h2 className="screens-title">See ClubConnect in Action</h2>
        <p className="screens-sub">A sneak peek into the beautiful, intuitive interfaces that power ClubConnect.</p>

        <div className="screens-grid">
          {/* Student Dashboard Mockup */}
          <div className="screen-card screen-large">
            <div className="screen-label"><LayoutDashboard size={13} /> Student Dashboard</div>
            <div className="screen-mockup screen-mockup--dashboard">
              <div className="sm-sidebar">
                <div className="sm-logo-row"><div className="sm-logo-dot" /></div>
                {["Browse","My Activities","Career"].map((l,i)=>(
                  <div key={i} className={`sm-nav${i===0?" sm-active":""}`}><div className="sm-dot"/><div className="sm-nl"/></div>
                ))}
              </div>
              <div className="sm-body">
                <div className="sm-header-bar"><div className="sm-hline"/><div className="sm-hav"/></div>
                <div className="sm-stats">{[0,1,2,3].map(i=><div key={i} className="sm-stat-box"><div className="sm-stat-ic"/><div className="sm-stat-val"/></div>)}</div>
                <div className="sm-grid">{[0,1,2,3,4,5].map(i=><div key={i} className="sm-card"><div className="sm-card-ic"/><div className="sm-card-l1"/><div className="sm-card-l2"/><div className="sm-card-btn"/></div>)}</div>
              </div>
            </div>
            <div className="screen-overlay" />
            <div className="screen-desc">
              <h4>Student Dashboard</h4>
              <p>Browse activities, manage enrollments, and track your participation — all in one place.</p>
            </div>
          </div>
          {/* Login Mockup */}
          <div className="screen-card">
            <div className="screen-label"><UserCheck size={13} /> Login & Signup</div>
            <div className="screen-mockup screen-mockup--login">
              <div className="sm-login-left">
                <div className="sm-login-icon"><Zap size={20} strokeWidth={2} color="#fff" /></div>
                <div className="sm-login-title"/>
                <div className="sm-login-sub"/>
                <div className="sm-login-badges">{[0,1,2].map(i=><div key={i} className="sm-badge"/>)}</div>
              </div>
              <div className="sm-login-right">
                <div className="sm-logo-sm"><Zap size={12} strokeWidth={2} color="#fff"/></div>
                <div className="sm-fl"/><div className="sm-fl sm-fl2"/>
                <div className="sm-finput"/><div className="sm-finput"/><div className="sm-finput"/>
                <div className="sm-fsubmit"/>
              </div>
            </div>
            <div className="screen-overlay" />
            <div className="screen-desc">
              <h4>Secure Authentication</h4>
              <p>Split-screen login with role-based access for students and admins.</p>
            </div>
          </div>
          {/* Career Intelligence Mockup */}
          <div className="screen-card">
            <div className="screen-label"><Briefcase size={13} /> Career Intelligence</div>
            <div className="screen-mockup screen-mockup--career">
              <div className="sm-career-header"><div className="sm-ch-title"/><div className="sm-ch-sub"/></div>
              <div className="sm-career-bars">
                {[85,72,60,48,38].map((w,i)=>(
                  <div key={i} className="sm-bar-row">
                    <div className="sm-bar-label"/>
                    <div className="sm-bar-track"><div className="sm-bar-fill" style={{width:`${w}%`}}/></div>
                  </div>
                ))}
              </div>
              <div className="sm-career-cards">
                {[0,1,2].map(i=>(
                  <div key={i} className="sm-career-card">
                    <div className="sm-cc-ic"/>
                    <div className="sm-cc-lines"><div className="sm-cc-l1"/><div className="sm-cc-l2"/></div>
                    <div className="sm-cc-badge"/>
                  </div>
                ))}
              </div>
            </div>
            <div className="screen-overlay" />
            <div className="screen-desc">
              <h4>Career Intelligence</h4>
              <p>AI-powered career matching, skill analysis, and personalized roadmaps.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ 6. CALL TO ACTION ═══════════════ */}
      <section className="cta-section">
        <div className="cta-glow" />
        <div className="cta-content">
          <div className="section-tag"><Heart size={11} strokeWidth={2} /> Join Us Today</div>
          <h2>Ready to get started?</h2>
          <p>Join thousands of students already discovering their passion with ClubConnect. It's free, fast, and built for you.</p>
          <div className="cta-buttons">
            <button className="btn-primary large" onClick={() => navigate("/login")}>
              <Sparkles size={15} strokeWidth={2} />
              Create Free Account
              <ChevronRight size={15} strokeWidth={2.5} />
            </button>
            <button className="btn-ghost" onClick={() => navigate("/login")}>
              Sign In Instead
            </button>
          </div>
          <div className="cta-trust">
            <span><CheckCircle size={13} /> No credit card required</span>
            <span><CheckCircle size={13} /> Free forever</span>
            <span><CheckCircle size={13} /> Setup in 30 seconds</span>
          </div>
        </div>
      </section>

      {/* ═══════════════ 7. FOOTER ═══════════════ */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand-col">
            <div className="footer-brand">
              <div className="brand-logo"><Zap size={14} strokeWidth={2.5} color="#fff" /></div>
              <span className="brand-name">Club<span>Connect</span></span>
            </div>
            <p className="footer-tagline">
              The all-in-one student activity management platform.
              Discover activities, build skills, shape your career.
            </p>
            <div className="footer-socials">
              <a href="#" className="footer-social"><Github size={16} /></a>
              <a href="#" className="footer-social"><Twitter size={16} /></a>
              <a href="#" className="footer-social"><Linkedin size={16} /></a>
              <a href="#" className="footer-social"><Mail size={16} /></a>
            </div>
          </div>

          <div className="footer-links-col">
            <h4>Platform</h4>
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
            <a href="#screens">Screenshots</a>
            <a href="#product">About</a>
          </div>

          <div className="footer-links-col">
            <h4>Categories</h4>
            <a href="#">Sports</a>
            <a href="#">Clubs</a>
            <a href="#">Events</a>
            <a href="#">Cultural</a>
          </div>

          <div className="footer-links-col">
            <h4>Get Started</h4>
            <a href="/login">Sign In</a>
            <a href="/login">Create Account</a>
            <a href="#">Student Guide</a>
            <a href="#">Admin Guide</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 ClubConnect. Built with ❤ for students everywhere.</span>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default Home;