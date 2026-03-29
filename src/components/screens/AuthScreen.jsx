import React, { useState } from "react";
import { Logo } from "../Logo";
import { Mail, Lock, LogIn, AlertCircle, Chrome, Send } from "lucide-react";
import { supabase } from "../../supabase";

export function AuthScreen({ authMode, setAuthMode, authErr, setAuthErr, form, setForm, doLogin }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    // כניסה עם גוגל
    const handleGoogleLogin = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        });
        if (error) setAuthErr(error.message);
        setLoading(false);
    };

    // כניסה ללא סיסמה (Magic Link)
    const handleMagicLink = async () => {
        if (!form.email) { setAuthErr("יש להזין אימייל"); return; }
        setLoading(true);
        setAuthErr("");
        setMessage("");
        const { error } = await supabase.auth.signInWithOtp({
            email: form.email,
            options: { emailRedirectTo: window.location.origin }
        });
        if (error) setAuthErr(error.message);
        else setMessage("שלחנו לך לינק לכניסה למייל! בדוק את תיבת הדואר שלך.");
        setLoading(false);
    };

    return (
        <div className="screen fade" style={{ justifyContent: "center", alignItems: "center", background: "radial-gradient(circle at center, #0f172a 0%, #020617 100%)" }}>
            <div className="card" style={{ width: "100%", maxWidth: 380, padding: 35, textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
                <div style={{ marginBottom: 25, display: "flex", justifyContent: "center" }}>
                    <Logo sz={64} />
                </div>
                
                <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--t0)", marginBottom: 10 }}>
                    {authMode === "login" ? "ברוכים הבאים" : "הרשמה למערכת"}
                </h1>
                <p style={{ fontSize: 14, color: "var(--t2)", marginBottom: 30 }}>
                    התחבר כדי להתחיל בתרגול AIPK
                </p>

                {/* כפתור גוגל */}
                <button 
                    className="btn" 
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{ width: "100%", height: 48, background: "white", color: "#1f2937", gap: 12, marginBottom: 20, border: "1px solid #e5e7eb", cursor: "pointer", borderRadius: 8, fontWeight: 600 }}
                >
                    <Chrome size={20} color="#4285F4" />
                    המשך עם Google
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 25, color: "var(--t3)" }}>
                    <div style={{ flex: 1, height: 1, background: "var(--bdr)" }} />
                    <span style={{ fontSize: 12 }}>או באמצעות אימייל</span>
                    <div style={{ flex: 1, height: 1, background: "var(--bdr)" }} />
                </div>

                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="inp-group">
                        <label className="lbl">אימייל</label>
                        <div style={{ position: "relative" }}>
                            <Mail size={16} style={{ position: "absolute", right: 12, top: 14, color: "var(--t3)" }} />
                            <input className="inp" style={{ paddingRight: 40, height: 44 }} type="email" placeholder="name@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>
                    </div>

                    {authMode === "login" && (
                        <div className="inp-group">
                            <label className="lbl">סיסמה</label>
                            <div style={{ position: "relative" }}>
                                <Lock size={16} style={{ position: "absolute", right: 12, top: 14, color: "var(--t3)" }} />
                                <input className="inp" style={{ paddingRight: 40, height: 44 }} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                            </div>
                        </div>
                    )}
                </div>

                {authErr && <div style={{ color: "#f87171", fontSize: 13, marginTop: 15, background: "rgba(248,113,113,0.1)", padding: "10px", borderRadius: "6px" }}>{authErr}</div>}
                {message && <div style={{ color: "#4ade80", fontSize: 13, marginTop: 15, background: "rgba(74,222,128,0.1)", padding: "10px", borderRadius: "6px" }}>{message}</div>}

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 30 }}>
                    <button 
                        className="btn btn-primary" 
                        style={{ width: "100%", height: 48, cursor: "pointer" }}
                        onClick={authMode === "login" ? doLogin : handleMagicLink}
                        disabled={loading}
                    >
                        {loading ? "מבצע פעולה..." : authMode === "login" ? <><LogIn size={18} style={{marginLeft:8}} /> כניסה</> : <><Send size={18} style={{marginLeft:8}} /> שלח לי לינק כניסה</>}
                    </button>

                    <button 
                        className="btn-ghost" 
                        style={{ fontSize: 14, color: "var(--cy)", cursor: "pointer", border: "none", background: "none", marginTop: 10 }}
                        onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthErr(""); setMessage(""); }}
                    >
                        {authMode === "login" ? "אין לך חשבון? הירשם עם לינק למייל" : "יש לך סיסמה? חזור לכניסה רגילה"}
                    </button>
                </div>
            </div>
        </div>
    );
}
