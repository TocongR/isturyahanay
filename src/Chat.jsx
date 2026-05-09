import { useEffect, useState, useRef } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --desktop:       #008080;
    --win-bg:        #d4d0c8;
    --win-dark:      #808080;
    --win-darker:    #404040;
    --win-light:     #ffffff;
    --win-title-from:#000080;
    --win-title-to:  #1084d0;
    --win-title-text:#ffffff;
    --win-btn:       #d4d0c8;
    --text:          #000000;
    --inset-bg:      #ffffff;
    --font: 'Courier Prime', 'Courier New', monospace;
  }

  html, body {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

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

  /* ── DESKTOP: fills above taskbar, centers content ── */
  .desktop {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  /* ── BEVEL WINDOW ── */
  .window {
    background: var(--win-bg);
    border-top: 2px solid var(--win-light);
    border-left: 2px solid var(--win-light);
    border-right: 2px solid var(--win-darker);
    border-bottom: 2px solid var(--win-darker);
    box-shadow: 2px 2px 0 #000, inset 1px 1px 0 #e8e4dc;
  }

  /* ── TITLE BAR ── */
  .title-bar {
    background: linear-gradient(to right, var(--win-title-from), var(--win-title-to));
    padding: 3px 4px 3px 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    flex-shrink: 0;
  }
  .title-bar-text {
    font-family: var(--font);
    font-size: 13px;
    font-weight: 700;
    color: var(--win-title-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    letter-spacing: 0.02em;
  }
  .title-bar-controls { display: flex; gap: 2px; flex-shrink: 0; }
  .title-btn {
    width: 16px; height: 14px;
    background: var(--win-btn);
    border-top: 1px solid var(--win-light);
    border-left: 1px solid var(--win-light);
    border-right: 1px solid var(--win-darker);
    border-bottom: 1px solid var(--win-darker);
    font-family: var(--font);
    font-size: 9px; font-weight: 700;
    color: var(--text);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; line-height: 1;
  }
  .title-btn:active {
    border-top: 1px solid var(--win-darker);
    border-left: 1px solid var(--win-darker);
    border-right: 1px solid var(--win-light);
    border-bottom: 1px solid var(--win-light);
  }

  /* ── BUTTONS ── */
  .win-btn {
    background: var(--win-btn);
    border: none; outline: none;
    font-family: var(--font); font-size: 13px;
    color: var(--text);
    cursor: pointer;
    padding: 4px 18px;
    min-width: 75px;
    border-top: 2px solid var(--win-light);
    border-left: 2px solid var(--win-light);
    border-right: 2px solid var(--win-darker);
    border-bottom: 2px solid var(--win-darker);
    box-shadow: inset 1px 1px 0 #e8e4dc, inset -1px -1px 0 #a0a0a0;
    user-select: none;
  }
  .win-btn:active {
    border-top: 2px solid var(--win-darker);
    border-left: 2px solid var(--win-darker);
    border-right: 2px solid var(--win-light);
    border-bottom: 2px solid var(--win-light);
    box-shadow: inset 1px 1px 0 #a0a0a0, inset -1px -1px 0 #e8e4dc;
    padding: 5px 17px 3px 19px;
  }
  .win-btn:disabled { color: var(--win-dark); cursor: default; }

  /* ── INSET ── */
  .inset-box {
    background: var(--inset-bg);
    border-top: 2px solid var(--win-darker);
    border-left: 2px solid var(--win-darker);
    border-right: 2px solid var(--win-light);
    border-bottom: 2px solid var(--win-light);
    box-shadow: inset 1px 1px 0 #a0a0a0;
  }
  .inset-input {
    background: var(--inset-bg);
    border-top: 2px solid var(--win-darker);
    border-left: 2px solid var(--win-darker);
    border-right: 2px solid var(--win-light);
    border-bottom: 2px solid var(--win-light);
    box-shadow: inset 1px 1px 0 #a0a0a0;
    font-family: var(--font); font-size: 13px;
    color: var(--text); outline: none;
    padding: 4px 6px; user-select: text;
  }

  /* ── LANDING DIALOG ── */
  .landing-window { width: 420px; flex-shrink: 0; }
  .dialog-body { padding: 16px 20px; }
  .dialog-icon-row { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 18px; }
  .dialog-message { font-family: var(--font); font-size: 13px; line-height: 1.6; color: var(--text); }
  .dialog-message strong { font-weight: 700; }
  .dialog-buttons {
    display: flex; justify-content: center; gap: 8px;
    padding: 10px 20px 16px;
    border-top: 1px solid var(--win-dark);
  }
  .separator {
    height: 2px;
    border-top: 1px solid var(--win-darker);
    border-bottom: 1px solid var(--win-light);
    margin: 0 8px 14px;
  }

  /* ── NICK MODAL ── */
  .nick-window {
    width: 360px;
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 200;
  }
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.25); z-index: 100; }
  .nick-label { font-family: var(--font); font-size: 13px; margin-bottom: 6px; display: block; }

  /* ── CHAT WINDOW: fixed comfy size, centered ── */
  .chat-window {
    width: 600px;
    height: 500px;
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 28px - 32px);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
  }

  /* ── MENUBAR ── */
  .menubar {
    padding: 2px 4px; display: flex; gap: 2px;
    border-bottom: 1px solid var(--win-darker);
    background: var(--win-bg);
    flex-shrink: 0;
  }
  .menu-item { font-family: var(--font); font-size: 13px; padding: 1px 8px; color: var(--text); cursor: pointer; }
  .menu-item:hover { background: var(--win-title-from); color: white; }
  .menu-item u { text-decoration: underline; }

  /* ── MESSAGES ── */
  .messages-area {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 6px 8px;
    margin: 6px 8px;
    font-family: var(--font); font-size: 13px; line-height: 1.6;
    scrollbar-width: thin;
  }
  .messages-area::-webkit-scrollbar { width: 16px; }
  .messages-area::-webkit-scrollbar-track { background: var(--win-bg); border-left: 1px solid var(--win-darker); }
  .messages-area::-webkit-scrollbar-thumb {
    background: var(--win-bg);
    border-top: 1px solid var(--win-light);
    border-left: 1px solid var(--win-light);
    border-right: 1px solid var(--win-darker);
    border-bottom: 1px solid var(--win-darker);
  }

  .msg-row { display: flex; gap: 6px; margin-bottom: 2px; animation: fadeIn 0.15s ease-out; }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .msg-time { color: var(--win-dark); flex-shrink: 0; font-size: 11px; margin-top: 1px; }
  .msg-nick { font-weight: 700; flex-shrink: 0; color: var(--win-title-from); }
  .msg-nick.anon { color: var(--win-dark); font-weight: 400; }
  .msg-text { word-break: break-word; flex: 1; }
  .no-messages { color: var(--win-dark); font-style: italic; padding: 12px 4px; }

  /* ── INPUT ROW ── */
  .input-row {
    display: flex; gap: 6px;
    padding: 6px 8px 8px;
    flex-shrink: 0;
    border-top: 1px solid var(--win-darker);
    align-items: center;
  }
  .input-nick-tag {
    font-family: var(--font); font-size: 13px;
    font-weight: 700; color: var(--win-title-from);
    flex-shrink: 0; white-space: nowrap;
  }
  .msg-input { flex: 1; }

  /* ── STATUS BAR ── */
  .statusbar {
    padding: 2px 8px;
    border-top: 1px solid var(--win-darker);
    display: flex; gap: 8px; align-items: center;
    flex-shrink: 0;
  }
  .status-panel {
    flex: 1;
    border-top: 1px solid var(--win-darker);
    border-left: 1px solid var(--win-darker);
    border-right: 1px solid var(--win-light);
    border-bottom: 1px solid var(--win-light);
    padding: 1px 6px;
    font-size: 11px; font-family: var(--font);
    color: var(--win-dark);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* ── TASKBAR ── */
  .taskbar {
    position: fixed; bottom: 0; left: 0; right: 0;
    height: 28px;
    background: var(--win-bg);
    border-top: 2px solid var(--win-light);
    display: flex; align-items: center; gap: 4px;
    padding: 0 4px; z-index: 50;
  }
  .taskbar-window-btn {
    height: 20px; padding: 0 8px; font-size: 11px;
    border-top: 1px solid var(--win-darker);
    border-left: 1px solid var(--win-darker);
    border-right: 1px solid var(--win-light);
    border-bottom: 1px solid var(--win-light);
    background: var(--win-bg); font-family: var(--font); box-shadow: none;
    border: none; outline: none; cursor: pointer;
    border-top: 1px solid var(--win-darker);
    border-left: 1px solid var(--win-darker);
    border-right: 1px solid var(--win-light);
    border-bottom: 1px solid var(--win-light);
  }
  .taskbar-clock {
    margin-left: auto; font-family: var(--font); font-size: 11px;
    border-top: 1px solid var(--win-darker);
    border-left: 1px solid var(--win-darker);
    border-right: 1px solid var(--win-light);
    border-bottom: 1px solid var(--win-light);
    padding: 2px 8px;
  }

  /* ── MOBILE RESPONSIVE ── */
  @media (max-width: 480px) {
    .desktop {
      padding: 8px;
    }

    .landing-window {
      width: 100%;
      max-width: calc(100vw - 16px);
    }

    .dialog-body {
      padding: 12px 14px;
    }

    .dialog-icon-row {
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
      margin-bottom: 14px;
    }

    .dialog-message {
      font-size: 12px;
      line-height: 1.5;
    }

    .dialog-buttons {
      flex-wrap: wrap;
      padding: 8px 14px 12px;
      gap: 6px;
    }

    .win-btn {
      min-width: 65px;
      padding: 4px 12px;
      font-size: 12px;
    }

    .nick-window {
      width: calc(100vw - 16px);
      max-width: 340px;
    }

    .title-bar-text {
      font-size: 12px;
    }

    .taskbar {
      height: 32px;
    }

    .taskbar-clock {
      font-size: 10px;
      padding: 2px 6px;
    }
  }
`;

function formatTime(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function Clock() {
  const [time, setTime] = useState(() =>
    new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
  );
  useEffect(() => {
    const t = setInterval(() =>
      setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }))
    , 15000);
    return () => clearInterval(t);
  }, []);
  return <div className="taskbar-clock">{time}</div>;
}

export default function Chat() {
  const [nickname, setNickname] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [entered, setEntered] = useState(false);
  const [showNickModal, setShowNickModal] = useState(false);
  const [nickInput, setNickInput] = useState("");
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!entered) return;
    const trackVisit = async () => {
      const visitDoc = doc(db, "analytics", "visits");
      const docSnap = await getDoc(visitDoc);
      const today = new Date().toDateString();
      if (!docSnap.exists()) {
        await updateDoc(visitDoc, { total: 1, today: 1, lastDate: today });
      } else {
        const data = docSnap.data();
        await updateDoc(visitDoc, {
          total: increment(1),
          today: data.lastDate !== today ? 1 : increment(1),
          lastDate: today,
        });
      }
    };
    trackVisit();

    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [entered]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEnter = () => setShowNickModal(true);

  const handleNickSubmit = (e) => {
    e.preventDefault();
    setNickname(nickInput.trim() || "Anonymous");
    setShowNickModal(false);
    setEntered(true);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const today = new Date().toDateString();
    await addDoc(collection(db, "messages"), {
      text: input, nickname, createdAt: serverTimestamp(),
    });
    const statsDoc = doc(db, "analytics", "messages");
    const statsSnap = await getDoc(statsDoc);
    if (!statsSnap.exists()) {
      await updateDoc(statsDoc, { total: 1, today: 1, lastDate: today });
    } else {
      const data = statsSnap.data();
      await updateDoc(statsDoc, {
        total: increment(1),
        today: data.lastDate !== today ? 1 : increment(1),
        lastDate: today,
      });
    }
    setInput("");
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      <style>{styles}</style>

      {/* NICK MODAL */}
      {showNickModal && (
        <>
          <div className="overlay" />
          <div className="window nick-window">
            <div className="title-bar">
              <span className="title-bar-text">Enter Username</span>
              <div className="title-bar-controls">
                <div className="title-btn">?</div>
                <div className="title-btn">X</div>
              </div>
            </div>
            <div className="dialog-body">
              <div className="dialog-icon-row">
                <svg width="36" height="36" viewBox="0 0 36 36" style={{ flexShrink: 0 }}>
                  <rect x="4" y="4" width="28" height="28" rx="2" fill="#d4d0c8" stroke="#808080" strokeWidth="1"/>
                  <circle cx="18" cy="14" r="5" fill="#000080"/>
                  <path d="M8 28 Q18 20 28 28" fill="#000080"/>
                </svg>
                <div className="dialog-message">
                  Please enter your username for this chat session.<br/>
                  Leave blank to connect as <strong>Anonymous</strong>.
                </div>
              </div>
              <div className="separator" />
              <form onSubmit={handleNickSubmit}>
                <label className="nick-label">Username:</label>
                <input
                  className="inset-input"
                  style={{ width: "100%", marginBottom: "16px" }}
                  value={nickInput}
                  onChange={(e) => setNickInput(e.target.value)}
                  autoFocus maxLength={24}
                />
                <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                  <button className="win-btn" type="submit">OK</button>
                  <button className="win-btn" type="button" onClick={() => {
                    setNickname("Anonymous");
                    setShowNickModal(false);
                    setEntered(true);
                  }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      <div className="desktop">
        {!entered ? (
          /* LANDING */
          <div className="window landing-window">
            <div className="title-bar">
              <span className="title-bar-text">Isturyahanay - Welcome</span>
              <div className="title-bar-controls">
                <div className="title-btn">_</div>
                <div className="title-btn">&#9744;</div>
                <div className="title-btn">X</div>
              </div>
            </div>
            <div className="dialog-body">
              <div className="dialog-icon-row">
                <svg width="40" height="40" viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
                  <rect x="2" y="6" width="28" height="20" rx="3" fill="#000080"/>
                  <rect x="4" y="8" width="24" height="16" fill="#1084d0"/>
                  <rect x="6" y="11" width="14" height="2" fill="white" rx="1"/>
                  <rect x="6" y="15" width="10" height="2" fill="white" rx="1"/>
                  <rect x="6" y="19" width="12" height="2" fill="white" rx="1"/>
                  <polygon points="8,26 14,26 10,32" fill="#000080"/>
                </svg>
                <div className="dialog-message">
                  <strong>Isturyahanay</strong> is now loading.<br/><br/>
                  Would you like to enter the public chatroom and start a conversation?
                </div>
              </div>
              <div className="separator" />
              <div style={{ fontFamily: "var(--font)", fontSize: "12px", color: "var(--win-dark)", marginBottom: "14px", lineHeight: 1.6 }}>
                This program requires a valid username.<br/>
                All messages are visible to all users.
              </div>
            </div>
            <div className="dialog-buttons">
              <button className="win-btn" onClick={handleEnter}>OK</button>
              <button className="win-btn" disabled>Cancel</button>
              <button className="win-btn" disabled>Help</button>
            </div>
          </div>
        ) : (
          /* CHAT */
          <div className="window chat-window">
            <div className="title-bar">
              <span className="title-bar-text">Isturyahanay - [{nickname}] - Public Room #1</span>
              <div className="title-bar-controls">
                <div className="title-btn">_</div>
                <div className="title-btn">&#9744;</div>
                <div className="title-btn">X</div>
              </div>
            </div>

            <div className="menubar">
              <span className="menu-item"><u>F</u>ile</span>
              <span className="menu-item"><u>E</u>dit</span>
              <span className="menu-item"><u>V</u>iew</span>
              <span className="menu-item"><u>R</u>oom</span>
              <span className="menu-item"><u>H</u>elp</span>
            </div>

            <div className="inset-box messages-area">
              {messages.length === 0
                ? <div className="no-messages">No messages yet. Say something!</div>
                : messages.map((msg) => (
                  <div className="msg-row" key={msg.id}>
                    <span className="msg-time">[{formatTime(msg.createdAt)}]</span>
                    <span className={`msg-nick${msg.nickname === "Anonymous" ? " anon" : ""}`}>
                      &lt;{msg.nickname}&gt;
                    </span>
                    <span className="msg-text">{msg.text}</span>
                  </div>
                ))
              }
              <div ref={chatEndRef} />
            </div>

            <div className="input-row">
              <span className="input-nick-tag">[{nickname}]:</span>
              <input
                ref={inputRef}
                className="inset-input msg-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type here and press Enter..."
                autoFocus
              />
              <button className="win-btn" onClick={sendMessage} disabled={!input.trim()}>Send</button>
            </div>

            <div className="statusbar">
              <div className="status-panel">Connected to: Room #1 - Isturyahanay</div>
              <div className="status-panel" style={{ flex: "0 0 auto", minWidth: 100 }}>
                {messages.length} message{messages.length !== 1 ? "s" : ""}
              </div>
              <div className="status-panel" style={{ flex: "0 0 auto", minWidth: 80 }}>Online</div>
            </div>
          </div>
        )}
      </div>

      {/* TASKBAR */}
      <div className="taskbar">
        <button className="win-btn" style={{ fontWeight: 700, padding: "2px 12px", height: 22, minWidth: 0, fontSize: 13 }}>
          Start
        </button>
        {entered && (
          <button className="taskbar-window-btn">
            Isturyahanay - Public Room #1
          </button>
        )}
        <Clock />
      </div>
    </>
  );
}