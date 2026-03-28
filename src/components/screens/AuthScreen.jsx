import { XCircle } from "lucide-react";
import { Logo } from "../Logo";

export function AuthScreen({ authMode, setAuthMode, authErr, setAuthErr, form, setForm, doLogin, doRegister }) {
    return (
        <>
            <div className="mock-badge">PROTOTYPE</div>
            <div className="screen fade" style={{ alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at 50% 35%, #0a1a30 0%, var(--bg) 65%)" }}>
                <div style={{ width: "100%", maxWidth: 360, padding: "0 20px" }}>
                    <div style={{ textAlign: "center", marginBottom: 32 }}>
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><Logo sz={72} /></div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--t0)", letterSpacing: "0.05em", fontFamily: "'IBM Plex Mono',monospace" }}>
                            A<span style={{ color: "#fb923c" }}>i</span>PK TRAINER
                        </div>
                        <div className="lbl" style={{ marginTop: 5 }}>Flight Training System v2.1</div>
                    </div>
                    <div style={{ display: "flex", background: "var(--s1)", borderRadius: "8px 8px 0 0", border: "1px solid var(--bdr)", borderBottom: "none", padding: "4px", gap: "4px" }}>
                        {[["login", "כניסה"], ["register", "הרשמה"]].map(([m, label]) => (
                            <button key={m} onClick={() => { setAuthMode(m); setAuthErr(""); }} style={{ flex: 1, padding: "7px", fontSize: 12, fontWeight: 500, cursor: "pointer", border: "none", borderRadius: 5, transition: "all 0.15s", background: authMode === m ? "var(--s3)" : "transparent", color: authMode === m ? "var(--t0)" : "var(--t2)" }}>{label}</button>
                        ))}
                    </div>
                    <div className="card" style={{ borderRadius: "0 0 8px 8px", borderTop: "none", padding: "20px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {authMode === "register" && (
                                <>
                                    <div><div className="lbl" style={{ marginBottom: 6 }}>שם מלא</div>
                                        <input className="inp" placeholder="שם מלא" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
                                    <div><div className="lbl" style={{ marginBottom: 6 }}>תפקיד</div>
                                        <input className="inp" placeholder="תפקיד / דרגה" value={form.profession} onChange={e => setForm(p => ({ ...p, profession: e.target.value }))} /></div>
                                </>
                            )}
                            <div><div className="lbl" style={{ marginBottom: 6 }}>אימייל</div>
                                <input className="inp" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
                            <div><div className="lbl" style={{ marginBottom: 6 }}>סיסמה</div>
                                <input className="inp" type="password" placeholder="••••••••" value={form.password}
                                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                                    onKeyDown={e => e.key === "Enter" && (authMode === "login" ? doLogin() : doRegister())} /></div>
                        </div>
                        {authErr && (
                            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 6 }}>
                                <XCircle size={13} color="var(--err)" />
                                <span className="rb" style={{ fontSize: 12, color: "var(--err)" }}>{authErr}</span>
                            </div>
                        )}
                        <button className="btn btn-primary" style={{ width: "100%", marginTop: 16 }} onClick={authMode === "login" ? doLogin : doRegister}>
                            {authMode === "login" ? "כניסה" : "הרשמה"}
                        </button>
                        <div style={{ marginTop: 12, fontSize: 11, color: "var(--t3)", textAlign: "center", fontFamily: "'IBM Plex Mono',monospace" }}>
                            admin@system.com / admin123 &nbsp;·&nbsp; yossi@test.com / 1234
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
