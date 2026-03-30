import React from "react";
import { HelpCircle, Send, Loader2 } from "lucide-react";

export function TrainingScreen({ 
    user, setScreen, topic, questions, qIdx, 
    msgs, setMsgs, input, setInput, 
    sendAnswer, loading, chatRef, 
    qAttempts, pops 
}) {
    
    const currentQ = questions[qIdx] || {};
    
    // לוגיקת האפיון של כפתור העזרה
    const isHelpActive = qAttempts >= 1;
    const isRevealActive = qAttempts >= 3;

    const handleHelpClick = () => {
        if (!isHelpActive) return;

        const chapterName = currentQ.topic || "פרק לא מוגדר";

        if (isRevealActive) {
            // הופך לכתום - מציג תשובה נכונה + פרק
            const answerText = currentQ.correctAnswer || currentQ.answer || "לא הוזנה תשובה";
            setMsgs(prev => [...prev, {
                role: "system",
                text: `תשובה נכונה מתוך ${chapterName}:\n${answerText}`
            }]);
        } else {
            // נדלק בתכלת - מציג רק את שם הפרק/נושא
            setMsgs(prev => [...prev, {
                role: "system",
                text: `רמז: נסה לחפש את התשובה בנושא: ${chapterName}`
            }]);
        }
    };

    return (
        <div style={{ background: "#0b1120", minHeight: "100vh", display: "flex", flexDirection: "column", direction: "rtl", fontFamily: "sans-serif" }}>
            
            {/* Header / Top Bar */}
            <div style={{ padding: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", background: "#0f172a" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <button 
                        onClick={() => setScreen("debrief")}
                        style={{ padding: "8px 16px", borderRadius: "6px", background: "transparent", border: "1px solid #334155", color: "#94a3b8", cursor: "pointer" }}
                    >
                        סיים אימון
                    </button>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>נכון: 0</span>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "15px", color: "#f8fafc", fontWeight: "bold" }}>
                    <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "normal" }}>{qIdx + 1}/{questions.length}</span>
                    <span>{topic?.title || "אימון צ'אט"}</span>
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: "auto", padding: "40px 20px", display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
                {msgs.map((m, i) => {
                    const isAI = m.role === "ai" || m.role === "system";
                    const isSystemReveal = m.role === "system" && m.text.includes("תשובה נכונה");
                    const isSystemHint = m.role === "system" && m.text.includes("רמז");
                    
                    let borderColor = "transparent";
                    let textColor = "#f8fafc";
                    
                    if (isSystemReveal) { borderColor = "#f97316"; textColor = "#f97316"; } // כתום לתשובה
                    else if (isSystemHint) { borderColor = "#38bdf8"; textColor = "#38bdf8"; } // תכלת לרמז

                    return (
                        <div key={i} style={{ width: "100%", maxWidth: "800px", display: "flex", flexDirection: "column", alignItems: isAI ? "flex-start" : "flex-end" }}>
                            <div style={{ color: "#64748b", fontSize: "12px", marginBottom: "5px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
                                {isAI ? "AI INSTRUCTOR" : (user?.role === "admin" ? "ADMIN" : "TRAINEE")}
                            </div>
                            <div style={{
                                background: "#0f172a",
                                color: textColor,
                                padding: "20px 30px",
                                borderRadius: "12px",
                                border: isSystemReveal || isSystemHint ? `1px solid ${borderColor}` : "1px solid #1e293b",
                                fontSize: "16px",
                                lineHeight: "1.6",
                                textAlign: "center", // טקסט מיושר לאמצע כמו בתמונה
                                maxWidth: "90%",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                            }}>
                                {m.text}
                            </div>
                        </div>
                    );
                })}
                
                {loading && (
                    <div style={{ width: "100%", maxWidth: "800px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                         <div style={{ color: "#64748b", fontSize: "12px", marginBottom: "5px", fontWeight: "bold" }}>AI INSTRUCTOR</div>
                         <div style={{ background: "#0f172a", color: "#94a3b8", padding: "15px 30px", borderRadius: "12px", border: "1px solid #1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
                            <Loader2 size={16} className="spin" /> מקליד...
                         </div>
                    </div>
                )}
                <div ref={chatRef} />
            </div>

            {/* Input Area (Bottom Bar) */}
            <div style={{ padding: "20px", background: "#0b1120", borderTop: "1px solid #1e293b", display: "flex", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px", width: "100%", maxWidth: "800px" }}>
                    
                    {/* Send Button (Left) */}
                    <button
                        onClick={sendAnswer}
                        disabled={loading || !input.trim()}
                        style={{ background: "transparent", color: (loading || !input.trim()) ? "#334155" : "#4ade80", border: "none", cursor: (loading || !input.trim()) ? "not-allowed" : "pointer", padding: "10px" }}
                    >
                        <Send size={24} style={{ transform: "scaleX(-1)" }} />
                    </button>

                    {/* Input Field (Center) */}
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !loading && input.trim() && sendAnswer()}
                        placeholder="הקלד את תשובתך ..."
                        style={{ flex: 1, padding: "16px", borderRadius: "10px", border: "1px solid #1e293b", background: "#0f172a", color: "#fff", fontSize: "16px", outline: "none" }}
                    />

                    {/* Help Button (Right) */}
                    <button
                        disabled={!isHelpActive}
                        onClick={handleHelpClick}
                        style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            padding: "10px 20px", borderRadius: "8px",
                            background: "transparent",
                            cursor: isHelpActive ? "pointer" : "not-allowed",
                            color: isRevealActive ? "#f97316" : (isHelpActive ? "#38bdf8" : "#334155"),
                            border: `1px solid ${isRevealActive ? "#f97316" : (isHelpActive ? "#38bdf8" : "#1e293b")}`,
                            transition: "all 0.3s"
                        }}
                    >
                        <HelpCircle size={18} />
                        {isRevealActive ? "הצג תשובה נכונה" : "עזרה?"}
                    </button>

                </div>
            </div>

            {/* Popup Next Question */}
            {pops?.popup === "next" && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(2,6,23,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                    <div style={{ background: "#0f172a", padding: "40px", borderRadius: "20px", textAlign: "center", border: "1px solid #22c55e", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)" }}>
                        <h2 style={{ color: "#22c55e", fontSize: "28px", marginBottom: "15px" }}>תשובה נכונה!</h2>
                        <button
                            onClick={pops.onNext}
                            style={{ padding: "12px 30px", fontSize: "16px", borderRadius: "8px", background: "#22c55e", color: "#052e16", border: "none", cursor: "pointer", fontWeight: "bold" }}
                        >
                            המשך לשאלה הבאה
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
