import { AlertTriangle, Shield, FileText, CheckCircle, Database } from "lucide-react";

export function DisclaimerScreen({ agreed, setAgreed, setScreen }) {
    return (
        <>
            
            <div className="screen fade" style={{ alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: 440, padding: "0 20px" }}>
                    <div className="card" style={{ borderColor: "rgba(251,191,36,0.25)" }}>
                        <div style={{ padding: "14px 18px", borderBottom: "1px solid rgba(251,191,36,0.15)", display: "flex", alignItems: "center", gap: 10 }}>
                            <AlertTriangle size={15} color="var(--warn)" />
                            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--warn)" }}>תנאי שימוש</span>
                        </div>
                        <div style={{ padding: "18px" }}>
                            {[[Shield, "מה שכתוב בספרות קובע", "המאמן אינו מקור סמכות עצמאי"], [FileText, "תיעוד מלא", "כל שיחה נרשמת ונבחנת על ידי הממונים"], [CheckCircle, "זיהוי העתקה", "המערכת מזהה העתק-הדבק אוטומטית"], [Database, "שמירת נתונים", "הסשן מועבר לניהול לאחר הסיום"]].map(([Icon, title, desc], i) => (
                                <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < 3 ? 14 : 0 }}>
                                    <Icon size={14} color="var(--t3)" style={{ marginTop: 2, flexShrink: 0 }} />
                                    <div>
                                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--t1)" }}>{title}</span>
                                        <span className="rb" style={{ fontSize: 13, color: "var(--t2)" }}> — {desc}</span>
                                    </div>
                                </div>
                            ))}
                            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--bdr)" }}>
                                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
                                    <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ accentColor: "var(--cy)", width: 15, height: 15, cursor: "pointer" }} />
                                    <span className="rb" style={{ fontSize: 13, color: "var(--t1)" }}>קראתי והבנתי את תנאי השימוש</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-primary" style={{ width: "100%", marginTop: 10 }} disabled={!agreed} onClick={() => setScreen("home")}>
                        אישור והמשך
                    </button>
                </div>
            </div>
        </>
    );
}
