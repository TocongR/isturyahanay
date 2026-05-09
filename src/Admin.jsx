import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  doc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --desktop: #008080;
    --win-bg: #d4d0c8;
    --win-dark: #808080;
    --win-darker: #404040;
    --win-light: #ffffff;
    --title-from: #000080;
    --title-to: #1084d0;
    --title-text: #ffffff;
    --text: #000000;
    --inset-bg: #ffffff;
    --font: 'Courier Prime', 'Courier New', monospace;
    --green: #006600;
  }

  html, body { height: 100%; width: 100%; overflow: hidden; }

  body {
    background: var(--desktop);
    font-family: var(--font);
    font-size: 13px;
    color: var(--text);
    cursor: default;
    user-select: none;
    background-image: repeating-linear-gradient(
      45deg,
      rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px,
      transparent 1px, transparent 8px
    );
  }

  .window {
    background: var(--win-bg);
    border-top: 2px solid var(--win-light);
    border-left: 2px solid var(--win-light);
    border-right: 2px solid var(--win-darker);
    border-bottom: 2px solid var(--win-darker);
    box-shadow: 2px 2px 0 #000, inset 1px 1px 0 #e8e4dc;
  }

  .title-bar {
    background: linear-gradient(to right, var(--title-from), var(--title-to));
    padding: 3px 4px 3px 6px;
    display: flex; align-items: center;
    justify-content: space-between; gap: 4px; flex-shrink: 0;
  }
  .title-bar-text {
    font-family: var(--font); font-size: 13px; font-weight: 700;
    color: var(--title-text); white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis; flex: 1;
  }
  .title-bar-controls { display: flex; gap: 2px; }
  .title-btn {
    width: 16px; height: 14px; background: var(--win-bg);
    border-top: 1px solid var(--win-light); border-left: 1px solid var(--win-light);
    border-right: 1px solid var(--win-darker); border-bottom: 1px solid var(--win-darker);
    font-family: var(--font); font-size: 9px; font-weight: 700;
    display: flex; align-items: center; justify-content: center; cursor: pointer;
  }
  .title-btn:active {
    border-top: 1px solid var(--win-darker); border-left: 1px solid var(--win-darker);
    border-right: 1px solid var(--win-light); border-bottom: 1px solid var(--win-light);
  }

  .win-btn {
    background: var(--win-bg); border: none; outline: none;
    font-family: var(--font); font-size: 13px; color: var(--text);
    cursor: pointer; padding: 4px 18px; min-width: 75px;
    border-top: 2px solid var(--win-light); border-left: 2px solid var(--win-light);
    border-right: 2px solid var(--win-darker); border-bottom: 2px solid var(--win-darker);
    box-shadow: inset 1px 1px 0 #e8e4dc, inset -1px -1px 0 #a0a0a0;
    user-select: none;
  }
  .win-btn:active {
    border-top: 2px solid var(--win-darker); border-left: 2px solid var(--win-darker);
    border-right: 2px solid var(--win-light); border-bottom: 2px solid var(--win-light);
    box-shadow: inset 1px 1px 0 #a0a0a0, inset -1px -1px 0 #e8e4dc;
    padding: 5px 17px 3px 19px;
  }
  .win-btn:disabled { color: var(--win-dark); cursor: default; }

  .inset-box {
    background: var(--inset-bg);
    border-top: 2px solid var(--win-darker); border-left: 2px solid var(--win-darker);
    border-right: 2px solid var(--win-light); border-bottom: 2px solid var(--win-light);
    box-shadow: inset 1px 1px 0 #a0a0a0;
  }
  .inset-input {
    background: var(--inset-bg);
    border-top: 2px solid var(--win-darker); border-left: 2px solid var(--win-darker);
    border-right: 2px solid var(--win-light); border-bottom: 2px solid var(--win-light);
    box-shadow: inset 1px 1px 0 #a0a0a0;
    font-family: var(--font); font-size: 13px;
    color: var(--text); outline: none; padding: 3px 6px; user-select: text;
  }

  .separator {
    height: 2px;
    border-top: 1px solid var(--win-darker);
    border-bottom: 1px solid var(--win-light);
    margin: 10px 0;
  }

  .taskbar {
    position: fixed; bottom: 0; left: 0; right: 0; height: 28px;
    background: var(--win-bg); border-top: 2px solid var(--win-light);
    display: flex; align-items: center; gap: 4px; padding: 0 4px; z-index: 50;
  }
  .taskbar-clock {
    margin-left: auto; font-family: var(--font); font-size: 11px;
    border-top: 1px solid var(--win-darker); border-left: 1px solid var(--win-darker);
    border-right: 1px solid var(--win-light); border-bottom: 1px solid var(--win-light);
    padding: 2px 8px;
  }

  .desktop {
    position: fixed; top: 0; left: 0; right: 0; bottom: 28px;
    display: flex; align-items: center; justify-content: center; padding: 10px;
  }

  .login-window { width: 380px; flex-shrink: 0; }
  .login-body { padding: 16px 20px 20px; }
  .login-icon-row { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 14px; }
  .login-message { font-family: var(--font); font-size: 13px; line-height: 1.6; }
  .login-label { font-size: 13px; margin-bottom: 5px; display: block; }
  .login-btns { display: flex; gap: 8px; justify-content: center; margin-top: 14px; }

  .dash-window {
    width: 100%; height: 100%;
    display: flex; flex-direction: column; box-shadow: none;
  }

  .menubar {
    padding: 2px 4px; display: flex; gap: 0;
    border-bottom: 1px solid var(--win-dark); flex-shrink: 0;
  }
  .menu-item { font-family: var(--font); font-size: 13px; padding: 1px 8px; cursor: pointer; }
  .menu-item:hover { background: var(--title-from); color: white; }

  .dash-body {
    flex: 1; min-height: 0; overflow: hidden;
    display: flex; flex-direction: column; padding: 8px; gap: 8px;
  }

  .stat-row { display: flex; gap: 8px; flex-shrink: 0; }
  .stat-group { flex: 1; }
  .group-title {
    background: var(--title-from); color: var(--title-text);
    font-family: var(--font); font-size: 11px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    padding: 2px 8px; margin-bottom: 6px;
  }
  .stat-cards { display: flex; gap: 6px; }
  .stat-card { flex: 1; padding: 8px 10px; display: flex; flex-direction: column; gap: 2px; }
  .stat-card-label {
    font-family: var(--font); font-size: 10px;
    color: var(--win-dark); letter-spacing: 0.08em; text-transform: uppercase;
  }
  .stat-card-value {
    font-family: var(--font); font-size: 22px;
    font-weight: 700; color: var(--title-from); line-height: 1.1;
  }
  .stat-card-sub { font-size: 10px; color: var(--win-dark); }

  .activity-section { flex: 1; min-height: 0; display: flex; flex-direction: column; }
  .section-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 4px; padding: 0 2px; flex-shrink: 0;
  }
  .section-title {
    font-family: var(--font); font-size: 11px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase; color: var(--win-dark);
  }
  .live-badge { display: flex; align-items: center; gap: 4px; font-family: var(--font); font-size: 10px; color: var(--green); }
  .live-dot {
    width: 6px; height: 6px; border-radius: 50%; background: var(--green);
    animation: blink 1.4s ease-in-out infinite;
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

  .activity-log {
    flex: 1; min-height: 0; overflow-y: auto;
    padding: 4px 8px; font-family: var(--font); font-size: 12px;
    scrollbar-width: thin; scrollbar-color: var(--win-bg) var(--win-bg);
    user-select: text;
  }
  .activity-log::-webkit-scrollbar { width: 16px; }
  .activity-log::-webkit-scrollbar-track { background: var(--win-bg); border-left: 1px solid var(--win-darker); }
  .activity-log::-webkit-scrollbar-thumb {
    background: var(--win-bg);
    border-top: 1px solid var(--win-light); border-left: 1px solid var(--win-light);
    border-right: 1px solid var(--win-darker); border-bottom: 1px solid var(--win-darker);
  }

  .log-row {
    display: flex; gap: 8px; align-items: baseline;
    padding: 3px 0; border-bottom: 1px dashed #c0bcb4; animation: fadeIn 0.15s;
  }
  .log-row:last-child { border-bottom: none; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }

  .log-index { color: var(--win-dark); font-size: 10px; min-width: 22px; text-align: right; flex-shrink: 0; }
  .log-nick { font-weight: 700; color: var(--title-from); flex-shrink: 0; white-space: nowrap; }
  .log-nick.anon { color: var(--win-dark); font-weight: 400; }
  .log-text { word-break: break-word; color: var(--text); flex: 1; }
  .log-time { color: var(--win-dark); font-size: 10px; flex-shrink: 0; white-space: nowrap; }
  .log-empty { color: var(--win-dark); font-style: italic; padding: 8px 0; }

  .statusbar {
    padding: 2px 8px; border-top: 1px solid var(--win-darker);
    display: flex; gap: 6px; flex-shrink: 0;
  }
  .status-panel {
    border-top: 1px solid var(--win-darker); border-left: 1px solid var(--win-darker);
    border-right: 1px solid var(--win-light); border-bottom: 1px solid var(--win-light);
    padding: 1px 6px; font-size: 11px; font-family: var(--font); color: var(--win-dark);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;
  }
`;

function Clock() {
  const [t, setT] = useState(() =>
    new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
  );
  useEffect(() => {
    const id = setInterval(() =>
      setT(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }))
    , 15000);
    return () => clearInterval(id);
  }, []);
  return <div className="taskbar-clock">{t}</div>;
}

function formatTime(ts) {
  if (!ts) return "--:--";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [visits, setVisits] = useState({ total: 0, today: 0 });
  const [msgStats, setMsgStats] = useState({ total: 0, today: 0 });
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    if (!authed) return;

    // Live-listen to analytics docs so numbers update without refresh
    const unsubVisits = onSnapshot(doc(db, "analytics", "visits"), (snap) => {
      if (snap.exists()) setVisits(snap.data());
    });

    const unsubMsgs = onSnapshot(doc(db, "analytics", "messages"), (snap) => {
      if (snap.exists()) setMsgStats(snap.data());
    });

    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "desc"),
      limit(20)
    );
    const unsubRecent = onSnapshot(q, (s) =>
      setRecentMessages(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubVisits();
      unsubMsgs();
      unsubRecent();
    };
  }, [authed]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      setAuthed(true);
      setError("");
    } else {
      setError("Access denied. Incorrect password.");
    }
  };

  return (
    <>
      <style>{styles}</style>

      <div className="desktop">
        {!authed ? (
          <div className="window login-window">
            <div className="title-bar">
              <span className="title-bar-text">Admin Gate - Authentication Required</span>
              <div className="title-bar-controls">
                <div className="title-btn">?</div>
                <div className="title-btn">X</div>
              </div>
            </div>
            <div className="login-body">
              <div className="login-icon-row">
                <svg width="36" height="36" viewBox="0 0 36 36" style={{ flexShrink: 0, marginTop: 2 }}>
                  <rect x="6" y="16" width="24" height="16" rx="2" fill="#808080"/>
                  <rect x="8" y="18" width="20" height="12" rx="1" fill="#d4d0c8"/>
                  <path d="M11 16 Q11 8 18 8 Q25 8 25 16" fill="none" stroke="#808080" strokeWidth="3" strokeLinecap="round"/>
                  <circle cx="18" cy="24" r="3" fill="#808080"/>
                  <rect x="17" y="24" width="2" height="4" fill="#808080" rx="1"/>
                </svg>
                <div className="login-message">
                  This area requires administrator credentials.<br/><br/>
                  Enter your password to access the internal dashboard.
                </div>
              </div>
              <div className="separator" />
              <form onSubmit={handleLogin}>
                <label className="login-label">Password:</label>
                <input
                  className="inset-input"
                  style={{ width: "100%", marginBottom: error ? 6 : 14 }}
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  autoFocus
                />
                {error && (
                  <div style={{ fontFamily: "var(--font)", fontSize: 12, color: "#800000", marginBottom: 10 }}>
                    {error}
                  </div>
                )}
                <div className="login-btns">
                  <button className="win-btn" type="submit">OK</button>
                  <button className="win-btn" type="button" disabled>Cancel</button>
                  <button className="win-btn" type="button" disabled>Help</button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="window dash-window">
            <div className="title-bar">
              <span className="title-bar-text">Isturyahanay - Internal Dashboard v1.0 [ADMIN]</span>
              <div className="title-bar-controls">
                <div className="title-btn">_</div>
                <div className="title-btn">&#9744;</div>
                <div className="title-btn">X</div>
              </div>
            </div>

            <div className="menubar">
              <span className="menu-item"><u>F</u>ile</span>
              <span className="menu-item"><u>V</u>iew</span>
              <span className="menu-item"><u>R</u>efresh</span>
              <span className="menu-item"><u>H</u>elp</span>
            </div>

            <div className="dash-body">
              <div className="stat-row">
                <div className="stat-group">
                  <div className="group-title">Visits</div>
                  <div className="stat-cards">
                    <div className="window stat-card">
                      <span className="stat-card-label">Total</span>
                      <span className="stat-card-value">{visits.total || 0}</span>
                      <span className="stat-card-sub">all time</span>
                    </div>
                    <div className="window stat-card">
                      <span className="stat-card-label">Today</span>
                      <span className="stat-card-value">{visits.today || 0}</span>
                      <span className="stat-card-sub">{new Date().toDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="stat-group">
                  <div className="group-title">Messages</div>
                  <div className="stat-cards">
                    <div className="window stat-card">
                      <span className="stat-card-label">Total</span>
                      <span className="stat-card-value">{msgStats.total || 0}</span>
                      <span className="stat-card-sub">all time</span>
                    </div>
                    <div className="window stat-card">
                      <span className="stat-card-label">Today</span>
                      <span className="stat-card-value">{msgStats.today || 0}</span>
                      <span className="stat-card-sub">{new Date().toDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="activity-section">
                <div className="section-header">
                  <span className="section-title">Recent Activity (Last 20 Messages)</span>
                  <span className="live-badge">
                    <span className="live-dot" />
                    Live Feed
                  </span>
                </div>

                <div className="inset-box activity-log">
                  {recentMessages.length === 0
                    ? <div className="log-empty">* No messages on record. *</div>
                    : recentMessages.map((msg, i) => (
                      <div className="log-row" key={msg.id}>
                        <span className="log-index">{i + 1}.</span>
                        <span className={`log-nick${msg.nickname === "Anonymous" ? " anon" : ""}`}>
                          [{msg.nickname}]
                        </span>
                        <span className="log-text">{msg.text}</span>
                        <span className="log-time">{formatTime(msg.createdAt)}</span>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>

            <div className="statusbar">
              <div className="status-panel">Database: Firebase / Firestore</div>
              <div className="status-panel" style={{ flex: "0 0 auto", minWidth: 160 }}>
                Showing {recentMessages.length} of last 20
              </div>
              <div className="status-panel" style={{ flex: "0 0 auto", minWidth: 80, color: "var(--green)" }}>
                Connected
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="taskbar">
        <button className="win-btn" style={{
          fontWeight: 700, padding: "2px 12px",
          height: 22, minWidth: 0, fontSize: 13
        }}>
          Start
        </button>
        {authed && (
          <button className="win-btn" style={{
            fontSize: 11, padding: "0 8px", height: 20, minWidth: 0,
            borderTop: "1px solid var(--win-darker)", borderLeft: "1px solid var(--win-darker)",
            borderRight: "1px solid var(--win-light)", borderBottom: "1px solid var(--win-light)",
            boxShadow: "none"
          }}>
            Internal Dashboard [ADMIN]
          </button>
        )}
        <Clock />
      </div>
    </>
  );
}