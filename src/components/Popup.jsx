import { CheckCircle, Layers } from "lucide-react";

export function Popup({ popup, qIdx, questions, loading, onNext, onEnd, onBack }) {
    if (!popup) return null;
    const isNext = popup === "next";
    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(5,10,18,0.85)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="card fade" style={{ width: 340, padding: "28px", borderColor: isNext ? "rgba(52,211,153,0.35)" : "var(--bdr2)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    {isNext ? <CheckCircle size={18} color="var(--ok)" /> : <Layers size={18} color="var(--cy)" />}
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--t0)" }}>{isNext ? "תשובה נכונה" : "סיום אימון"}</span>
                </div>
                <p className="rb" style={{ fontSize: 13, color: "var(--t2)", marginBottom: 24, lineHeight: 1.6 }}>
                    {isNext ? `מוכן לשאלה ${qIdx + 2} מתוך ${questions.length}?` : "עבור לתחקיר ולמידה מהסשן"}
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-ghost" style={{ flex: 1 }} onClick={isNext ? onEnd : onBack} disabled={loading}>{isNext ? "סיים" : "חזור"}</button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={isNext ? onNext : onEnd} disabled={loading}>
                        {loading ? <div className="spin" /> : isNext ? "שאלה הבאה" : "תחקיר"}
                    </button>
                </div>
            </div>
        </div>
    );
}
