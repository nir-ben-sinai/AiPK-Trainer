import React from "react";
import { Users, Lock, Unlock, ArrowLeft, Shield } from "lucide-react";
import { DB } from "../../lib/mockBackend";

export function BackofficeScreen({ user, setScreen, boTab, setBoTab, toggleUserLicense }) {
    
    return (
        <div style={{ background: "#0b1120", minHeight: "100vh", direction: "rtl", fontFamily: "sans-serif" }}>
            
            {/* Header */}
            <div style={{ padding: "20px 30px", background: "#0f172a", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#fff" }}>
                    <Shield size={22} color="#38bdf8" />
                    <span style={{ fontWeight: "bold", fontSize: "18px" }}>ניהול מערכת והרשאות</span>
                </div>
                <button onClick={() => setScreen("home")} style={{ padding: "8px 16px", borderRadius: "6px", background: "#1e293b", color: "#94a3b8", border: "none", cursor: "pointer" }}>
                    חזרה לבית
                </button>
            </div>

            <div style={{ padding: "40px 30px" }}>
                <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
                    
                    <div style={{ marginBottom: "25px", color: "#fff", fontSize: "20px", fontWeight: "bold" }}>ניהול מנויי Premium</div>

                    <div style={{ background: "#0f172a", borderRadius: "12px", border: "1px solid #1e293b", overflow: "hidden" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid #1e293b", color: "#38bdf8", fontSize: "12px" }}>
                                    <th style={{ padding: "20px" }}>משתמש</th>
                                    <th>תפקיד</th>
                                    <th>סטטוס גישת AI</th>
                                    <th>פעולה</th>
                                </tr>
                            </thead>
                            <tbody>
                                {DB.users.filter(u => u.role !== 'admin').map(u => (
                                    <tr key={u.id} style={{ borderBottom: "1px solid rgba(30, 41, 59, 0.5)" }}>
                                        <td style={{ padding: "20px" }}>
                                            <div style={{ color: "#fff", fontWeight: "600" }}>{u.name}</div>
                                            <div style={{ color: "#64748b", fontSize: "12px" }}>{u.email}</div>
                                        </td>
                                        <td style={{ color: "#94a3b8" }}>{u.profession}</td>
                                        <td>
                                            <div style={{ 
                                                display: "inline-block", 
                                                padding: "4px 10px", 
                                                borderRadius: "20px", 
                                                fontSize: "11px", 
                                                fontWeight: "bold",
                                                background: u.hasAiLicense ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                                color: u.hasAiLicense ? "#4ade80" : "#f87171",
                                                border: `1px solid ${u.hasAiLicense ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"}`
                                            }}>
                                                {u.hasAiLicense ? "מנוי פעיל" : "גישה חסומה"}
                                            </div>
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => toggleUserLicense(u.id)}
                                                style={{ 
                                                    padding: "8px 16px", 
                                                    borderRadius: "6px", 
                                                    background: u.hasAiLicense ? "rgba(239, 68, 68, 0.1)" : "rgba(56, 189, 248, 0.1)", 
                                                    color: u.hasAiLicense ? "#f87171" : "#38bdf8",
                                                    border: "1px solid transparent",
                                                    cursor: "pointer",
                                                    fontSize: "12px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px"
                                                }}
                                            >
                                                {u.hasAiLicense ? <Lock size={14} /> : <Unlock size={14} />}
                                                {u.hasAiLicense ? "בטל מנוי" : "הפעל מנוי"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ marginTop: "30px", padding: "20px", background: "rgba(56, 189, 248, 0.03)", borderRadius: "10px", border: "1px dashed rgba(56, 189, 248, 0.2)", color: "#94a3b8", fontSize: "13px", lineHeight: "1.6" }}>
                        <strong>מידע למנהל:</strong> הפעלת מנוי (License) פותחת למתאמן את היכולת לחולל מבחנים מותאמים אישית מתוך הספרייה או על ידי העלאת קבצים. זהו הפיצ'ר שעליו מתבצעת הסליקה דרך Grow.
                    </div>
                </div>
            </div>
        </div>
    );
}
