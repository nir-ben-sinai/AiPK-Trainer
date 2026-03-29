import React from "react";
import { Logo } from "../Logo";
import { Mail, Lock, User, Briefcase, LogIn, UserPlus, AlertCircle } from "lucide-react";

export function AuthScreen({ authMode, setAuthMode, authErr, setAuthErr, form, setForm, doLogin, doRegister }) {
    return (
        <div className="screen fade" style={{ justifyContent: "center", alignItems: "center", background: "radial-gradient(circle at center, #0f172a 0%, #020617 100%)" }}>
            <div className="card" style={{ width: "100%", maxWidth: 360, padding: 30, textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
                <div style={{ marginBottom: 25, display: "flex", justifyContent: "center" }}>
                    <Logo sz={52} />
                </div>
                
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--t0)", marginBottom: 8 }}>
                    {authMode === "login" ? "כניסה למערכת" : "הרשמה למערכת"}
                </h1>
                <p style={{ fontSize: 13, color: "var(--t2)", marginBottom: 25 }}>
                    {authMode === "login" ? "הזן פרטים כדי להתחיל באימון" : "צור חשבון חדש כדי להצטרף"}
                </p>

                <div style={{ display: "flex", background: "var(--s1)", padding: 4, borderRadius: 8, marginBottom: 25 }}>
                    <button 
                        onClick={() => { setAuthMode("login"); setAuthErr(""); }}
                        style={{ flex: 1, padding: "8px 0", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", background: authMode === "login" ? "var(--s2)" : "transparent", color: authMode === "login" ? "var(--cy)" : "var(--t2)", transition: "all 0.2s" }}
                    >כניסה</button>
                    <button 
                        onClick={() => { setAuthMode("register"); setAuthErr(""); }}
                        style={{ flex: 1, padding: "8px 0", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", background: authMode === "register" ? "var(--s2)" : "transparent", color: authMode === "register" ? "var(--cy)" : "var(--t2)", transition: "all 0.2s" }}
                    >הרשמה</button>
                </div>

                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 16 }}>
                    {authMode === "register" && (
                        <div className="inp-group">
                            <label className="lbl">שם מלא</label>
                            <div style={{ position: "relative" }}>
                                <User size={14} style={{ position: "absolute", right: 12, top: 12, color: "var(--t3)" }} />
                                <input className="inp" style={{ paddingRight: 35 }} type="text" placeholder="ישראל ישראלי" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                        </div>
                    )}

                    <div className="inp-group">
                        <label className="lbl">אימייל</label>
                        <div style={{ position: "relative" }}>
                            <Mail size={14} style={{ position: "absolute", right: 12, top: 12, color: "var(--t3)" }} />
                            <input className="inp" style={{ paddingRight: 35 }} type="email" placeholder="name@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>
                    </div>

                    {authMode === "register" && (
                        <div className="inp-group">
                            <label className="lbl">תפקיד / מקצוע</label>
                            <div style={{ position: "relative" }}>
                                <Briefcase size={14} style={{ position: "absolute", right: 12, top: 12, color: "var(--t3)" }} />
                                <input className="inp" style={{ paddingRight: 35 }} type="text" placeholder="לדוגמה: טייס, מדריך..." value={form.profession} onChange={e => setForm({ ...form, profession: e.target.value })} />
                            </div>
                        </div>
                    )}

                    <div className="inp-group">
                        <label className="lbl">סיסמה</label>
                        <div style={{ position: "relative" }}>
                            <Lock size={14} style={{ position: "absolute", right: 12, top: 12, color: "var(--t3)" }} />
                            <input className="inp" style={{ paddingRight: 35 }} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                        </div>
                    </div>
                </div>

                {authErr && (
                    <div style={{ marginTop: 20, padding: "10px 12px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8, color: "#f87171", fontSize: 12 }}>
                        <AlertCircle size={14} />
                        <span>{authErr}</span>
                    </div>
                )}

                <button 
                    className="btn btn-primary" 
                    style={{ width: "100%", height: 44, marginTop: 25, fontSize: 15, gap: 10 }}
                    onClick={authMode === "login" ? doLogin : doRegister}
                >
                    {authMode === "login" ? <><LogIn size={18} /> כניסה</> : <><UserPlus size={18} /> יצירת חשבון</>}
                </button>
            </div>
        </div>
    );
}
