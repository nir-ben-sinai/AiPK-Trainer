import React, { useState, useEffect } from "react";
import { HelpCircle, Send, Loader2, Eye } from "lucide-react";

export function TrainingScreen({ 
    user, setScreen, topic, questions = [], qIdx = 0, 
    msgs = [], setMsgs, input, setInput, 
    sendAnswer, loading, chatRef, 
    qAttempts = 0, pops 
}) {
    
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [inlineTimer, setInlineTimer] = useState(null);
    const currentQ = questions[qIdx] || {};
    
    const isHelpActive = qAttempts >= 1;
    const isRevealActive = qAttempts >= 3;

    useEffect(() => {
        return () => {
            if (window.revealInterval) clearInterval(window.revealInterval);
        };
    }, []);

    useEffect(() => {
        if (inlineTimer !== null) {
            chatRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [inlineTimer]);

    const handleHelpClick = () => {
        if (!isHelpActive || inlineTimer !== null) return;

        const sectionRef = currentQ.reference || currentQ.section || currentQ.topic || "סעיף לא מוגדר";
        setMsgs(prev => [...prev, {
            role: "system",
            text: `רמז: התשובה נמצאת בסעיף ${sectionRef}`
        }]);
    };

    const handleRevealClick = () => {
        if (!isRevealActive || inlineTimer !== null) return;

        const sectionRef = currentQ.reference || currentQ.section || currentQ.topic || "סעיף לא מוגדר";
        const answerText = currentQ.correctAnswer || currentQ.answer || "לא הוזנה תשובה במערכת";

        setMsgs(prev => [...prev, {
            role: "system",
            text: `תשובה נכונה מתוך סעיף ${sectionRef}:\n${answerText}`
        }]);

        setInlineTimer(5);
        let counter = 5;
        
        window.revealInterval = setInterval(() => {
            counter -= 1;
            if (counter > 0) {
                setInlineTimer(counter);
            } else {
                clearInterval(window.revealInterval);
                setInlineTimer(null); 
                if (pops?.onNext) pops.onNext(); 
            }
        }, 1000);
    };

    return (
        {/* העטיפה ננעלת לגובה המסך */}
        <div style={{ background: "#0b1120", height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column", direction: "rtl", fontFamily: "sans-serif" }}>
            
            {/* Header - מודבק למעלה */}
            <div style={{ flexShrink: 0, padding: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", background: "#0f172a", zIndex: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    <button 
                        onClick={() => setShowFinishModal(true)}
                        style={{ padding: "8px 16px", borderRadius: "6px", background: "transparent", border: "1px solid #334155", color: "#94a3b8", cursor: "pointer" }}
                    >
                        סיים אימון
                    </button>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "15px", color: "#f8fafc", fontWeight: "bold" }}>
                    <span style={{ color: "#64748b", fontSize: "14px", fontWeight: "normal" }}>{qIdx + 1}/{questions.length}</span>
                    <span>{topic?.title || "אימון צ'אט"}</span>
                </div>
            </div>

            {/* Chat Area - אזור נגלל */}
            <div style={{ flex: 1, overflowY: "auto", padding: "40px 20px", display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
                {msgs.map((m, i) => {
                    const isAI = m.role === "ai" || m.role === "system";
                    const isSystemReveal = m.role === "system" && m.text.includes("תשובה נכונה");
                    const isSystemHint = m.role === "system" && m.text.includes("רמז");
                    
                    let borderColor = "transparent";
                    let textColor = "#f8fafc";
                    
                    if (isSystemReveal) { borderColor = "#f97316"; textColor = "#f97316"; } 
                    else if (isSystemHint) { borderColor = "#38bdf8"; textColor = "#38bdf8"; } 

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
                                textAlign: "right",
                                maxWidth: "90%",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                whiteSpace: "pre-wrap"
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
                            <Loader2 size={16} className="spin" /> ה-AI בודק את התשובה...
                         </div>
                    </div>
                )}

                {inlineTimer !== null && (
                    <div style={{ width: "100%", maxWidth: "800px", display: "flex", justifyContent: "flex-start", marginTop: "10px" }}>
                        <div style={{ 
                            background: "rgba(249, 115, 22, 0.08)", color: "#f97316", padding: "8px 16px", 
                            borderRadius: "20px", fontSize: "13px", border: "1px solid rgba(249, 115, 22, 0.2)", 
                            display: "flex", alignItems: "center", gap: "8px", fontWeight: "500"
                        }}>
                            <Loader2 size={14} className="spin" />
                            מכין את השאלה הבאה בעוד {inlineTimer} שניות...
                        </div>
                    </div>
                )}

                <div ref={chatRef} />
            </div>

            {/* Input Area - מודבק למטה */}
            <div style={{ flexShrink: 0, padding: "20px", background: "#0b1120", borderTop: "1px solid #1e293b", display: "flex", justifyContent: "center", zIndex: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px", width: "100%", maxWidth: "800px" }}>
                    
                    <button
                        onClick={sendAnswer}
                        disabled={loading || !input.trim() || inlineTimer !== null}
                        style={{ background: "transparent", color: (loading || !input.trim() || inlineTimer !== null) ? "#334155" : "#4ade80", border: "none", cursor: (loading || !input.trim() || inlineTimer !== null) ? "not-allowed" : "pointer", padding: "10px" }}
                    >
                        <Send size={24} style={{ transform: "scaleX(-1)" }} />
                    </button>

                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !loading && input.trim() && inlineTimer === null && sendAnswer()}
                        placeholder={inlineTimer !== null ? "המתן לשאלה הבאה..." : "הקלד את תשובתך ..."}
                        disabled={inlineTimer !== null}
                        style={{ flex: 1, padding: "16px", borderRadius: "10px", border: "1px solid #1e293b", background: "#0f172a", color: "#fff", fontSize: "16px", outline: "none", opacity: inlineTimer !== null ? 0.5 : 1 }}
                    />

                    <div style={{ display: "flex", gap: "10px" }}>
                        <button
                            disabled={!isRevealActive || inlineTimer !== null}
                            onClick={handleRevealClick}
                            style={{
                                display: "flex", alignItems: "center", gap: "6px",
                                padding: "10px 15px", borderRadius: "8px",
                                background: "transparent",
                                cursor: (!isRevealActive || inlineTimer !== null) ? "not-allowed" : "pointer",
                                color: (!isRevealActive || inlineTimer !== null) ? "#334155" : "#f97316",
                                border: `1px solid ${(!isRevealActive || inlineTimer !== null) ? "#1e293b" : "#f97316"}`,
                                transition: "all 0.3s",
                                whiteSpace: "nowrap"
                            }}
                            title="פעיל אחרי 3 טעויות"
                        >
                            <Eye size={18} />
                            גלה תשובה
                        </button>

                        <button
                            disabled={!isHelpActive || inlineTimer !== null}
                            onClick={handleHelpClick}
                            style={{
                                display: "flex", alignItems: "center", gap: "6px",
                                padding: "10px 15px", borderRadius: "8px",
                                background: "transparent",
                                cursor: (!isHelpActive || inlineTimer !== null) ? "not-allowed" : "pointer",
                                color: (!isHelpActive || inlineTimer !== null) ? "#334155" : "#38bdf8",
                                border: `1px solid ${(!isHelpActive || inlineTimer !== null) ? "#1e293b" : "#38bdf8"}`,
                                transition: "all 0.3s",
                                whiteSpace: "nowrap"
                            }}
                            title="פעיל אחרי טעות אחת"
                        >
                            <HelpCircle size={18} />
                            עזרה
                        </button>
                    </div>

                </div>
            </div>

            {pops?.popup === "next" && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(2,6,23,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                    <div style={{ background: "#0f172a", padding: "40px", borderRadius: "20px", textAlign: "center", border: "2px solid #22c55e", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)" }}>
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

            {showFinishModal && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(2,6,23,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                    <div style={{ background: "#0f172a", padding: "40px", borderRadius: "20px", textAlign: "center", border: "1px solid #334155", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)", maxWidth: "450px" }}>
                        <h2 style={{ color: "#f8fafc", fontSize: "24px", marginBottom: "15px" }}>סיום אימון</h2>
                        <p style={{ color: "#94a3b8", marginBottom: "30px", lineHeight: "1.5" }}>
                            האם אתה בטוח שברצונך לסיים את האימון כעת?
                        </p>
                        <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
                            <button
                                onClick={() => {
                                    setShowFinishModal(false);
                                    setScreen("debrief");
                                }}
                                style={{ padding: "10px 24px", fontSize: "16px", borderRadius: "8px", background: "#3b82f6", color: "#fff", border: "none", cursor: "pointer", fontWeight: "bold" }}
                            >
                                כן, עבור לתחקיר
                            </button>
                            <button
                                onClick={() => setShowFinishModal(false)}
                                style={{ padding: "10px 24px", fontSize: "16px", borderRadius: "8px", background: "transparent", color: "#94a3b8", border: "1px solid #334155", cursor: "pointer" }}
                            >
                                ביטול
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
