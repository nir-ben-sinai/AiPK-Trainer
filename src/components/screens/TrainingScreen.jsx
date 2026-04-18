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
        return () => { if (window.revealInterval) clearInterval(window.revealInterval); };
    }, []);

    const handleHelpClick = () => {
        if (!isHelpActive || inlineTimer !== null) return;
        const sectionRef = currentQ.reference || currentQ.section || currentQ.topic || "סעיף לא מוגדר";
        setMsgs(prev => [...prev, { role: "system", text: `רמז: התשובה נמצאת בסעיף ${sectionRef}` }]);
    };

    const handleRevealClick = () => {
        if (!isRevealActive || inlineTimer !== null) return;
        const sectionRef = currentQ.reference || currentQ.section || currentQ.topic || "סעיף לא מוגדר";
        const answerText = currentQ.correctAnswer || currentQ.answer || "לא הוזנה תשובה במערכת";
        setMsgs(prev => [...prev, { role: "system", text: `תשובה נכונה מתוך סעיף ${sectionRef}:\n${answerText}` }]);
        setInlineTimer(5);
        let counter = 5;
        window.revealInterval = setInterval(() => {
            counter -= 1;
            if (counter > 0) setInlineTimer(counter);
            else {
                clearInterval(window.revealInterval);
                setInlineTimer(null); 
                if (pops?.onNext) pops.onNext(); 
            }
        }, 1000);
    };

    return (
        <div style={{ background: "#0b1120", minHeight: "100vh", display: "flex", flexDirection: "column", direction: "rtl", fontFamily: "sans-serif" }}>
            {/* Header */}
            <div style={{ padding: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", background: "#0f172a" }}>
                <button onClick={() => setShowFinishModal(true)} style={{ padding: "8px 16px", borderRadius: "6px", background: "transparent", border: "1px solid #334155", color: "#94a3b8", cursor: "pointer" }}>סיים אימון</button>
                <div style={{ display: "flex", alignItems: "center", gap: "15px", color: "#f8fafc", fontWeight: "bold" }}>
                    <span style={{ color: "#64748b", fontSize: "14px" }}>{qIdx + 1}/{questions.length}</span>
                    <span>{topic?.title || "אימון צ'אט"}</span>
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, padding: "40px 20px", display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
                {msgs.map((m, i) => (
                    <div key={i} style={{ width: "100%", maxWidth: "800px", display: "flex", flexDirection: "column", alignItems: (m.role === "ai" || m.role === "system") ? "flex-start" : "flex-end" }}>
                        <div style={{ color: "#64748b", fontSize: "12px", marginBottom: "5px", fontWeight: "bold" }}>{m.role === "ai" ? "AI INSTRUCTOR" : "TRAINEE"}</div>
                        <div style={{ background: "#0f172a", color: m.text.includes("תשובה נכונה") ? "#f97316" : m.text.includes("רמז") ? "#38bdf8" : "#f8fafc", padding: "20px 30px", borderRadius: "12px", border: "1px solid #1e293b", fontSize: "16px", maxWidth: "90%", whiteSpace: "pre-wrap", textAlign: "right", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {loading && <div style={{ color: "#94a3b8", display: "flex", gap: "10px" }}><Loader2 className="spin" /> בודק...</div>}
                {inlineTimer !== null && <div style={{ color: "#f97316", padding: "10px", border: "1px solid", borderRadius: "20px" }}>מכין שאלה הבאה בעוד {inlineTimer}...</div>}
                <div ref={chatRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: "20px", background: "#0b1120", borderTop: "1px solid #1e293b", display: "flex", justifyContent: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px", width: "100%", maxWidth: "800px" }}>
                    <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !loading && input.trim() && sendAnswer()} placeholder="הקלד תשובה..." style={{ flex: 1, padding: "16px", borderRadius: "10px", background: "#0f172a", color: "#fff", border: "1px solid #1e293b" }} />
                    <button onClick={sendAnswer} style={{ background: "none", border: "none", color: "#4ade80" }}><Send style={{ transform: "scaleX(-1)" }} /></button>
                    <button disabled={!isRevealActive} onClick={handleRevealClick} style={{ color: isRevealActive ? "#f97316" : "#334155", background: "none", border: "1px solid", borderRadius: "8px", padding: "10px" }}><Eye size={18} /></button>
                    <button disabled={!isHelpActive} onClick={handleHelpClick} style={{ color: isHelpActive ? "#38bdf8" : "#334155", background: "none", border: "1px solid", borderRadius: "8px", padding: "10px" }}><HelpCircle size={18} /></button>
                </div>
            </div>
            
            {/* Modal */}
            {showFinishModal && (
                <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(2,6,23,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                    <div style={{ background: "#0f172a", padding: "40px", borderRadius: "20px", textAlign: "center", border: "1px solid #334155" }}>
                        <h2 style={{ color: "#fff" }}>סיום אימון</h2>
                        <div style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
                            <button onClick={() => setScreen("debrief")} style={{ padding: "10px 20px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "8px" }}>כן, עבור לתחקיר</button>
                            <button onClick={() => setShowFinishModal(false)} style={{ padding: "10px 20px", background: "transparent", color: "#94a3b8", border: "1px solid #334155", borderRadius: "8px" }}>ביטול</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
