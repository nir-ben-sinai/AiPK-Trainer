import React from "react";
import { Users, Shield, ArrowLeft } from "lucide-react";
import { DB } from "../../lib/mockBackend";

export function BackofficeScreen({ setScreen }) {
    return (
        <div className="screen fade">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "30px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Shield color="var(--cy)" />
                    <h1 className="rb" style={{ color: "#fff", fontSize: "22px" }}>ניהול מערכת</h1>
                </div>
                <button onClick={() => setScreen("home")} className="btn btn-subtle">
                    <ArrowLeft size={16} /> חזרה
                </button>
            </div>

            <div className="card">
                <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Users size={18} color="var(--cy)" />
                    <span style={{ fontWeight: "bold" }}>רשימת משתמשים</span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ textAlign: "right", borderBottom: "1px solid var(--bdr)", color: "var(--cy)", fontSize: "12px" }}>
                            <th style={{ padding: "12px" }}>שם</th>
                            <th>אימייל</th>
                            <th>תפקיד</th>
                            <th>מקצוע</th>
                        </tr>
                    </thead>
                    <tbody>
                        {DB.users.map(u => (
                            <tr key={u.id} style={{ borderBottom: "1px solid rgba(56,189,248,0.05)" }}>
                                <td style={{ padding: "12px", color: "#fff", fontWeight: "500" }}>{u.name}</td>
                                <td style={{ color: "var(--t2)" }}>{u.email}</td>
                                <td><span className="tag tag-ok">{u.role}</span></td>
                                <td style={{ color: "var(--t2)" }}>{u.profession}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
