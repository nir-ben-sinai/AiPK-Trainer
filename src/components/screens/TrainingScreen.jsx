import React from "react";
import { HelpCircle, XCircle, Send, Loader2 } from "lucide-react";

export function TrainingScreen({ topic, questions, qIdx, msgs, setMsgs, input, setInput, sendAnswer, loading, chatRef, pops, user, setScreen, qAttempts }) {
    
    const currentQ = questions[qIdx] || {};
    
    // לוגיקת כפתור העזרה
    const isHelpActive = qAttempts >= 1; // פעיל אחרי טעות אחת
    const isAnswerReveal = qAttempts >= 3; // הופך לגילוי אחרי 3 טעויות

    const handleHelpClick = () => {
        if (!isHelpActive) return;

        const chapterName = currentQ.topic || "כללי";

        if (isAnswerReveal) {
            // גילוי התשובה
            const answerText = currentQ.correctAnswer || currentQ.answer || "לא הוגדרה תשובה למערכת";
            setMsgs(prev => [...prev, {
                role: "system",
                text: `✅ התשובה המלאה (מתוך פרק "${chapterName}"):\n${answerText}`
            }]);
        } else {
            // רמז
            setMsgs(prev => [...prev, {
                role: "system",
                text: `💡 רמז: נסה להיזכר בנהלים המופיעים בפרק "${chapterName}".`
            }]);
        }
    };

    return (
        <div className="screen" style={{ background: "#020617", minHeight: "100vh", display: "flex", flexDirection: "column", direction: "rtl" }}>
            
            {/* Header */}
            <div style={{ background: "#0f172a", padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b" }}>
                <h2 style={{ color: "#fff", margin: 0, fontSize: "18px" }}>
                    {topic?.title || "אימון פעיל"} - שאלה {qIdx + 1} מתוך {questions.length || 0}
                </h2>

                <div style={{ display: "flex", gap: "10px" }}>
                    {/* כפתור העזרה החכם */}
                    <button
                        disabled={!isHelpActive}
                        onClick={handleHelpClick}
                        style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            padding: "8px 16px", borderRadius: "8px", fontWeight: "bold",
                            background: "transparent",
                            cursor: isHelpActive ? "pointer" : "not-allowed",
                            color: isAnswerReveal ? "#f97316" : (isHelpActive ? "#38bdf8" : "#475569"),
                            border: `1px solid ${isAnswerReveal ? "#f97316" : (isHelpActive ? "#38bdf8" : "#334155")}`,
                            transition: "all 0.3s"
                        }}
                    >
                        <HelpCircle size={18} />
                        {isAnswerReveal ? "הצג תשובה נכונה" : "עזרה?"}
                    </button>

                    <button
                        onClick={() => setScreen("debrief")}
                        style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            padding: "8px 16px", borderRadius: "8px",
                            background: "#334155", color: "#fff", border: "none", cursor: "pointer"
                        }}
                    >
                        <XCircle size={18} /> סיום אימון
                    </button>
                </div>
            </div>

            {/* אזור הצ'אט */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
                {msgs.map((m, i) => (
                    <div key={i} style={{
                        alignSelf: m.role === "user" ? "flex-start" : "flex-end",
                        background: m.role === "user" ? "#22c55e" : (m.role === "system" ? "rgba(56, 189, 248, 0.1)" : "#1e293b"),
                        color: m.role === "user" ? "#052e16" : (m.role === "system" ? "#38bdf8" : "#f8fafc"),
                        padding: "14px 20px",
                        borderRadius: "12px",
                        maxWidth: "75%",
                        border: m.role === "system" ? `1px solid ${isAnswerReveal ? "#f97316" : "#38bdf8"}` : "none",
                        fontSize: "16px",
                        lineHeight: "1.5"
                    }}>
                        <div style={{ color: (m.role === "system" && isAnswerReveal) ? "#f97316" : "inherit" }}>
                            {m.text}
                        </div>
                    </div>
                ))}
                
                {loading && (
                    <div style={{ alignSelf: "flex-end", color: "#94a3b8", padding: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Loader2 size={18} className="spin" /> ה-AI בודק את התשובה...
                    </div>
                )}
                <div ref={chatRef} />
            </div>

            {/* אזור הקלדה */}
            <div style={{ padding: "20px", background: "#0f172a", borderTop: "1px solid #1e293b" }}>
                <div style={{ display: "flex", gap: "10px", maxWidth: "800px", margin: "0 auto" }}>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !loading && input.trim() && sendAnswer()}
                        placeholder="הקלד את תשובתך כאן..."
                        style={{ flex: 1, padding: "16px", borderRadius: "10px", border: "1px solid #334155", background: "#020617", color: "#fff", fontSize: "16px", outline: "none" }}
                    />
                    <button
                        onClick={sendAnswer}
                        disabled={loading || !input.trim()}
                        style={{ padding: "0 25px", borderRadius: "10px", background: "#22c55e", color: "#052e16", border: "none", cursor: (loading || !input.trim()) ? "not-allowed" : "pointer", opacity: (loading || !input.trim()) ? 0.5 : 1 }}
                    >
                        <Send size={24} />
                    </button>
                </div>
            </div>

            {/* פופאפ לשאלה הבאה */}
            {pops?.popup === "next" && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(2,6,23,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                    <div style={{ background: "#0f172a", padding: "40px", borderRadius: "20px", textAlign: "center", border: "2px solid #22c55e" }}>
                        <h2 style={{ color: "#22c55e", fontSize: "32px", marginBottom: "10px" }}>תשובה מצוינת! ✅</h2>
                        <button
                            onClick={pops.onNext}
                            style={{ padding: "14px 40px", fontSize: "18px", borderRadius: "10px", background: "#22c55e", color: "#052e16", border: "none", cursor: "pointer", fontWeight: "bold" }}
                        >
                            לשאלה הבאה
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
