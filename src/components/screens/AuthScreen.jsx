import React from "react";
import { Logo } from "../Logo";
import { Mail, Lock, LogIn, UserPlus } from "lucide-react";

export function AuthScreen({ authMode, setAuthMode, form, setForm, doLogin }) {
    return (
        <div className="screen fade" style={{ justifyContent: "center", alignItems: "center", background: "radial-gradient(circle at center, #0f172a 0%, #020617 100%)" }}>
            <div className="card" style={{ width: "100%", maxWidth: 380, padding: 40, textAlign: "center" }}>
                <div style={{ marginBottom: 30, display: "flex", justifyContent: "center" }}>
                    <Logo sz={80} />
                </div>
                
                <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 10 }}>AIPK</h1>
                <p style={{ color: "#94a3b8", marginBottom: 30 }}>מערכת לניהול ואימון בטיחות</p>

                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 20 }}>
                    {authMode === "register" && (
                        <div className="inp-group">
                            <label className="lbl">שם מלא</label>
                            <input className="inp" type="text" placeholder="ישראל ישראלי" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                    )}
                    <div className="inp-group">
                        <label className="lbl">אימייל</label>
                        <div style={{ position: "relative" }}>
                            <Mail size={16} style={{ position: "absolute", right: 12, top: 14, color: "#475569" }} />
                            <input className="inp" style={{ paddingRight: 40 }} type="email" placeholder="name@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>
                    </div>
                    <div className="inp-group">
                        <label className="lbl">סיסמה</label>
                        <div style={{ position: "relative" }}>
                            <Lock size={16} style={{ position: "absolute", right: 12, top: 14, color: "#475569" }} />
                            <input className="inp" style={{ paddingRight: 40 }} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                        </div>
                    </div>
                </div>

                <button className="btn btn-primary" style={{ width: "100%", height: 50, marginTop: 30 }} onClick={doLogin}>
                    {authMode === "login" ? <><LogIn size={18} style={{marginLeft:8}}/> כניסה למערכת</> : <><UserPlus size={18} style={{marginLeft:8}}/> יצירת חשבון</>}
                </button>

                <button 
                    className="btn-ghost" 
                    style={{ marginTop: 20, color: "#4ade80", fontSize: 14, border: "none", background: "none", cursor: "pointer" }}
                    onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                >
                    {authMode === "login" ? "אין לך חשבון? הירשם כאן" : "כבר רשום? היכנס כאן"}
                </button>
            </div>
        </div>
    );
}
