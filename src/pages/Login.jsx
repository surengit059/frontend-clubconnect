import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    role: "student"
  });

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await fetch("http://localhost:8081/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: form.username,
            password: form.password
          })
        });

        const data = await res.json();

        if (data.error) throw new Error(data.error);

        localStorage.setItem("currentUser", JSON.stringify(data));
        navigate(data.role === "admin" ? "/admin" : "/student");

      } else {
        if (!form.name || !form.email || !form.username || !form.password) {
          throw new Error("All fields required");
        }

        const res = await fetch("http://localhost:8081/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });

        const text = await res.text();
        if (!res.ok) throw new Error(text);

        setIsLogin(true);
      }

    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">

      {/* ── LEFT PANEL ── */}
      <div className="auth-left">
        <div className="auth-left-glass">

          {/* Brand pill */}
          <div className="auth-left-brand">
            <div className="auth-left-brand-dot">⚡</div>
            <span>ClubConnect</span>
          </div>

          <h1>Join activities.<br />Build skills.<br />Grow faster.</h1>
          <p>The all-in-one student activity platform. Discover clubs, register in seconds, and unlock your career potential.</p>

        </div>

        {/* Trust pills at bottom */}
        <div className="auth-trust">
          <div className="auth-trust-pill">3,200+ Students enrolled</div>
          <div className="auth-trust-pill">120+ Activities available</div>
          <div className="auth-trust-pill">Free to join, always</div>
        </div>
      </div>

      {/* ── RIGHT PANEL (form card) ── */}
      <div className="auth-card">

        {/* Eyebrow */}
        <div className="auth-eyebrow">Student Activity Platform</div>

        <h2>{isLogin ? "Welcome back " : "Create Account"}</h2>
        <p className="auth-card-sub">
          {isLogin
            ? "Sign in to access your dashboard and activities."
            : "Join thousands of students already on ClubConnect."}
        </p>

        <div className="auth-divider" />

        {/* Switch */}
        <div className="switch">
          <button
            className={isLogin ? "active" : ""}
            onClick={() => { setIsLogin(true); setError(""); }}
          >
            Login
          </button>
          <button
            className={!isLogin ? "active" : ""}
            onClick={() => { setIsLogin(false); setError(""); }}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="error">⚠ {error}</div>}

        {!isLogin && (
          <>
            <input
              placeholder="Full Name"
              value={form.name}
              onChange={e => update("name", e.target.value)}
            />
            <input
              placeholder="Email"
              value={form.email}
              onChange={e => update("email", e.target.value)}
            />
          </>
        )}

        <input
          placeholder="Username"
          value={form.username}
          onChange={e => update("username", e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={e => update("password", e.target.value)}
        />

        <select
          value={form.role}
          onChange={e => update("role", e.target.value)}
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>

        <button className="submit" onClick={handleSubmit}>
          {loading ? "Please wait..." : isLogin ? "Sign In" : "Register"}
        </button>

        <p className="auth-card-footer">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            style={{ color: "#7C3AED", fontWeight: 600, cursor: "pointer" }}
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
          >
            {isLogin ? "Sign up free" : "Sign in"}
          </span>
        </p>

      </div>
    </div>
  );
}

export default Login;