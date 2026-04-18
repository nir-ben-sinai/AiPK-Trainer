import React from "react";
import { CheckCircle, ArrowRight, MessageSquare, Target, Award } from "lucide-react";

export function DebriefScreen({ debriefData, setScreen, topic }) {
    // נתונים זמניים למקרה שאין תחקיר אמיתי
    const stats = [
        { label: "ציון סופי", value: `${debriefData?.score || 0}%`, icon: Award, color: "#34d399" },
        { label: "דיוק", value: "גבוה", icon: Target, color: "#38bdf8" },
        { label: "זמן אימון", value: "12 דק'", icon: MessageSquare, color: "#fbbf24" }
    ];

    return (
        <div className="screen-layout" style={{ direction: "rtl", fontFamily: "sans-serif" }}>
            
            {/* Header - מודבק למעלה */}
            <div className="screen-header" style={{ padding: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", background: "#0f172a" }}>
                <div style={{ color: "#f8fafc", fontWeight: "bold", fontSize: "18px" }}>תחקיר ביצועים</div>
                <div style={{ color: "#94a3b8", fontSize: "14px" }}>{topic?.title || "אימון טכני"}</div>
            </div>

            {/* Content Area - האזור האמצעי שנגלל */}
            <div className="screen-content" style={{ padding: "40px 20px", display: "flex", flexDirection: "column", gap: "30px", alignItems: "center" }}>
                
                {/* כרטיסיות סטטיסטיקה */}
                <div style={{ display: "flex", gap: "15px", width: "100%", maxWidth: "800px" }}>
                    {stats.map((s, i) => (
                        <div key={i} style={{ flex: 1, background: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #1e293b", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                            <s.icon size={24} color={s.color} />
                            <span style={{ color: "#64748b", fontSize: "12px", fontWeight: "600" }}>{s.label}</span>
                            <span style={{ color: "#f8fafc", fontSize: "20px", fontWeight: "bold" }}>{s.value}</span>
                        </div>
                    ))}
                </div>

                {/* סיכום AI */}
                <div style={{ width: "100%", maxWidth: "800px", background: "#0f172a", borderRadius: "12px", border: "1px solid #1e293b", overflow: "hidden" }}>
                    <div style={{ background: "rgba(56, 189, 248, 0.05)", padding: "15px 20px", borderBottom: "1px solid #1e293b", color: "#38bdf8", fontWeight: "bold", display: "flex", alignItems: "center", gap: "10px" }}>
                        <CheckCircle size={18} /> סיכום מדריך AI
                    </div>
                    <div style={{ padding: "20px", color: "#94a3b8", lineHeight: "1.6", fontSize: "16px" }}>
                        {debriefData?.aiSummary || "השלמת את האימון בהצלחה. המערכת מנתחת את התוצאות שלך כדי לשפר את השאלות הבאות."}
                    </div>
                </div>

                {/* רשימת תובנות */}
                <div style={{ width: "100%", maxWidth: "800px", display: "flex", flexDirection: "column", gap: "15px" }}>
                    <h3 style={{ color: "#f8fafc", fontSize: "16px", marginBottom: "5px" }}>תובנות מרכזיות:</h3>
                    {(debriefData?.insights || ["הבנה טובה של החומר", "קצב מענה מצוין"]).map((insight, i) => (
                        <div key={i} style={{ background: "#0f172a", padding: "15px 20px", borderRadius: "8px", border: "1px solid #1e293b", color: "#cbd5e1", display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ width: "6px", height: "6px", background: "#38bdf8", borderRadius: "50%" }} />
                            {insight}
                        </div>
                    ))}
                </div>

            </div>

            {/* Footer - מודבק למטה */}
            <div className="screen-footer" style={{ padding: "20px", background: "#0b1120", borderTop: "1px solid #1e293b", display: "flex", justifyContent: "center" }}>
                <button 
                    onClick={() => setScreen("home")}
                    style={{ width: "100%", maxWidth: "800px", padding: "16px", borderRadius: "10px", background: "#3b82f6", color: "#fff", border: "none", cursor: "pointer", fontSize: "16px", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
                >
                    חזרה למסך הבית <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
}
