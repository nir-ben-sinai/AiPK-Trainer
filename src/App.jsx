import React, { useState } from "react";
import { Mail, Lock, LogIn, UserPlus, Shield } from "lucide-react";

// העיצוב המקורי והיפה
const STYLE = `
  :root { --bg: #020617; --card: #0f172a; --primary: #22c55e; --text: #f8fafc; }
  body { margin: 0; font-family: sans-serif; background: var(--bg); color: var(--text); direction: rtl; }
  .screen { display: flex; flex-direction: column; min-height: 100vh; align-items: center; justify-content: center; padding: 20px; }
  .card { background: var(--card); padding: 40px; border-radius: 16px; border: 1px solid #1e293b; width: 100%; maxWidth: 380px; text-align: center; }
  .inp-group { margin-bottom: 20px; text-align: right; }
  .lbl { display: block; margin-bottom: 8px; font-size: 14px; color: #94a3b8; }
  .inp { width: 100%; padding: 12px; background: #020617; border: 1px solid #334155; border-radius: 8px; color: white; box-sizing: border-box; }
  .btn { width: 100%; padding: 14px; background: var(--primary); color: #052e16; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s; font-size: 16px; }
  .btn:hover { opacity: 0.9; }
`;

export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("auth");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const doLogin = () => {
    if (form.email === "admin@aipk.co.il") {
      setUser({ name: "ניר", role: "admin" });
    } else {
      setUser({ name: form.name || "יוסי", role: "trainee" });
    }
    setScreen("dashboard");
  };

  return (
    <>
      <style>{STYLE}</style>
      <div className="screen">
        {screen === "auth" ? (
          <div className="card">
            <Shield size={60} color="#22c55e" style={{marginBottom: 20}} />
            <h1 style={{fontSize: 24, margin: '0 0 10px 0'}}>AIPK</h1>
            <p style={{color: '#94a3b8', marginBottom: 30}}>כניסה למערכת</p>
            
            <div className="inp-group">
              <label className="lbl">אימייל</label>
              <input className="inp" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="your@email.com" />
            </div>
            <div className="inp-group">
              <label className="lbl">שם (למתרגלים חדשים)</label>
              <input className="inp" type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="יוסי" />
            </div>
            
            <button className="btn" onClick={doLogin}>כניסה למערכת</button>
          </div>
        ) : (
          <div className="card shadow-lg">
            <h1 style={{color: '#22c55e'}}>שלום {user.name}!</h1>
            <p>התחברת בהצלחה למערכת AIPK.</p>
            <p style={{fontSize: 14, color: '#94a3b8'}}>תפקיד: {user.role === 'admin' ? 'מנהל מערכת' : 'מתרגל'}</p>
            <button className="btn" style={{marginTop: 20, background: '#ef4444', color: 'white'}} onClick={() => setScreen("auth")}>התנתק</button>
          </div>
        )}
      </div>
    </>
  );
}
