import React, { useState } from "react";
import { Logo } from "../Logo";
import { Mail, Lock, Chrome, Send, AlertCircle } from "lucide-react";
import { supabase } from "../../supabase";

export function AuthScreen({ authMode, setAuthMode, authErr, setAuthErr, form, setForm, doLogin }) {
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    const handleGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        });
    };

    const handleMagicLink = async () => {
        if (!form.email) return setAuthErr("נא להזין אימייל");
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({
            email: form.email,
            options: { emailRedirectTo: window.location.origin }
        });
        if (error) setAuthErr(error.message);
        else setMsg("שלחנו לך לינק כניסה למייל!");
        setLoading(false);
    };

    return (
        <div className="screen fade" style={{ justifyContent: "center", alignItems: "center", background: "#020617" }}>
            <div className="card" style={{ width: "100%", maxWidth: 380, padding: 40, textAlign: "center" }}>
                <div style={{ marginBottom: 30 }}><Logo sz={60} /></div>
                
                <h2 style={{ marginBottom: 10, color: "#fff" }}>{authMode === "login" ? "כניסה למערכת" : "הרשמה מהירה"}</h2>
                
                {/* כפתור גוגל */}
                <button onClick={handleGoogle} className="btn" style={{ width: "100%", background: "#fff", color: "#000", gap: 10, marginBottom: 20 }}>
                    <Chrome size={20} color="#4285F4" /> המשך עם Google
                </button>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, color: "#475569", fontSize: 12 }}>
                    <div style={{ flex: 1, height: 1, background: "#1e293b" }} /> או עם אימייל <div style={{ flex: 1, height: 1, background: "#1e293b" }} />
                </div>

                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 15 }}>
                    <div className="inp-group">
                        <label className="lbl">אימייל</label>
                        <input className="inp" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="your@email.com" />
                    </div>
                    
                    {authMode === "login" && (
                        <div className="inp-group">
                            <label className="lbl">סיסמה</label>
                            <input className="inp" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" />
                        </div>
                    )}
                </div>

                {authErr && <div style={{ color: "#f87171", fontSize: 13, marginTop: 15 }}>{authErr}</div>}
                {msg && <div style={{ color: "#4ade80", fontSize: 13, marginTop: 15 }}>{msg}</div>}

                <button 
                    onClick={authMode === "login" ? doLogin : handleMagicLink} 
                    className="btn btn-primary" 
                    style={{ width: "100%", marginTop: 25 }}
                    disabled={loading}
                >
                    {loading ? "טוען..." : authMode === "login" ? "התחברות" : "שלח לי קוד למייל"}
                </button>

                <button 
                    onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthErr(""); }}
                    style={{ background: "none", border: "none", color: "#94a3b8", marginTop: 20, cursor: "pointer", fontSize: 13 }}
                >
                    {authMode === "login" ? "אין לך חשבון? הירשם כאן" : "כבר רשום? היכנס עם סיסמה"}
                </button>
            </div>
        </div>
    );
}
