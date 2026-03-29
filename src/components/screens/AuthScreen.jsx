import React, { useState } from "react";
import { Logo } from "../Logo";
import { Mail, Lock, LogIn, UserPlus, AlertCircle, Chrome } from "lucide-react";
import { supabase } from "../../supabase";

export function AuthScreen({ authMode, setAuthMode, authErr, setAuthErr, form, setForm, doLogin, doRegister }) {
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
        const { error } = await supabase.auth.signInWithOtp({
            email: form.email,
            options: { emailRedirectTo: window.location.origin }
        });
        if (error) setAuthErr(error.message);
        else setMessage("שלחנו לך לינק לכניסה למייל!");
        setLoading(false);
    };

    return (
        <div className="screen fade" style={{ justifyContent: "center", alignItems: "center", background: "radial-gradient(circle at center, #0f172a 0%, #020617 100%)" }}>
            <div className="card" style={{ width: "100%", maxWidth: 380, padding: 30, textAlign: "center" }}>
                <div style={{ marginBottom: 20, display: "flex", justifyContent: "center" }}>
                    <Logo sz={60} />
                </div>
                
                <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--t0)", marginBottom: 25 }}>
                    {authMode === "login" ? "כניסה למערכת" : "הרשמה"}
                </h1>

                {/* כפתור גוגל */}
                <button 
                    className="btn" 
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    style={{ width: "100%", height: 46, background: "white", color: "#1f2937", gap: 12, marginBottom: 20, border: "1px solid #e5e7eb" }}
                >
                    <Chrome size={20} color="#4285F4" />
                    המשך עם Google
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, color: "var(--t3)" }}>
                    <div style={{ flex: 1, height: 1, background: "var(--bdr)" }} />
                    <span style={{ fontSize: 12 }}>או באמצעות אימייל</span>
                    <div style={{ flex: 1, height: 1, background: "var(--bdr)" }} />
                </div>

                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 16 }}>
                    <div className="inp-group">
                        <label className="lbl">אימייל</label>
                        <div style={{ position: "relative" }}>
                            <Mail size={14} style={{ position: "absolute", right: 12, top: 12, color: "var(--t3)" }} />
                            <input className="inp" style={{ paddingRight: 35 }} type="email" placeholder="name@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>
                    </div>

                    {authMode === "login" ? (
                        <div className="inp-group">
                            <label className="lbl">סיסמה</label>
                            <div style={{ position: "relative" }}>
                                <Lock size={14} style={{ position: "absolute", right: 12, top: 12, color: "var(--t3)" }} />
                                <input className="inp" style={{ paddingRight: 35 }} type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                            </div>
                        </div>
                    ) : (
                        <p style={{ fontSize: 12, color: "var(--t2)", textAlign: "center" }}>
                            בהרשמה יישלח אליך קוד אימות למייל
                        </p>
                    )}
                </div>

                {authErr && <div style={{ color: "#f87171", fontSize: 12, marginTop: 15 }}>{authErr}</div>}
                {message && <div style={{ color: "var(--cy)", fontSize: 12, marginTop: 15 }}>{message}</div>}

                <button 
                    className="btn btn-primary" 
                    style={{ width: "100%", height: 46, marginTop: 25 }}
                    onClick={authMode === "login" ? doLogin : handleMagicLink}
                    disabled={loading}
                >
                    {loading ? "טוען..." : authMode === "login" ? "כניסה" : "שלח לי קוד גישה"}
                </button>

                <div style={{ marginTop: 20 }}>
                    <button 
                        className="btn-ghost" 
                        style={{ fontSize: 13, color: "var(--cy)" }}
                        onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthErr(""); }}
                    >
                        {authMode === "login" ? "אין לך חשבון? הירשם כאן" : "כבר רשום? היכנס"}
                    </button>
                </div>
            </div>
        </div>
    );
}
