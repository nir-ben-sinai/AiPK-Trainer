import React, { useState } from "react";
import { HelpCircle, Eye, Send, XCircle, CheckCircle2 } from "lucide-react";

export function TrainingScreen({ user, setScreen, questions = [] }) {
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);

    const q = questions[currentQ] || {
        question: "טוען שאלה...",
        options: ["...", "...", "...", "..."],
        correctAnswer: ""
    };

    const handleFinish = () => {
        console.log("Finishing training...");
        setScreen("debrief"); // מעביר למסך התחקיר
    };

    return (
        <div className="screen fade" style={{ background: "#020617", padding: "20px" }}>
            <div className="card" style={{ maxWidth: "800px", width: "100%", textAlign: "right" }}>
                {/* שורת כפתורי עזר */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                    <button 
                        className="btn-ghost" 
                        onClick={() => setShowHint(true)}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", border: "1px solid #334155", color: "#94a3b8", padding: "10px", borderRadius: "8px" }}
                    >
                        <HelpCircle size={18} /> עזרה מה-AI
                    </button>
                    <button 
                        className="btn-ghost" 
                        onClick={() => setShowAnswer(true)}
                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", border: "1px solid #334155", color: "#94a3b8", padding: "10px", borderRadius: "8px" }}
                    >
                        <Eye size={18} /> הגלה לי את התשובה
                    </button>
                </div>

                <h2 style={{ color: "#fff", marginBottom: "25px" }}>{q.question}</h2>

                <div style={{ display: "grid", gap: "12px", marginBottom: "30px" }}>
                    {q.options.map((opt, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setSelectedAnswer(idx)}
                            style={{
                                padding: "15px",
                                borderRadius: "10px",
                                border: selectedAnswer === idx ? "2px solid #22c55e" : "1px solid #1e293b",
                                background: selectedAnswer === idx ? "rgba(34, 197, 94, 0.1)" : "#0f172a",
                                color: "#f8fafc",
                                textAlign: "right",
                                cursor: "pointer"
                            }}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {showHint && <p style={{ color: "#eab308", fontSize: "14px", marginBottom: "15px" }}>💡 רמז מה-AI: נסה לחשוב על נהלי הבטיחות במקרה של תקלה טכנית.</p>}
                {showAnswer && <p style={{ color: "#22c55e", fontSize: "14px", marginBottom: "15px" }}>✅ התשובה הנכונה היא: {q.correctAnswer}</p>}

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", borderTop: "1px solid #1e293b", paddingTop: "20px" }}>
                    <button 
                        onClick={handleFinish}
                        className="btn" 
                        style={{ background: "#ef4444", color: "#fff", padding: "10px 25px", display: "flex", alignItems: "center", gap: "8px" }}
                    >
                        <XCircle size={18} /> סיים אימון
                    </button>
                    
                    <button 
                        disabled={selectedAnswer === null}
                        onClick={() => {
                            if (currentQ < questions.length - 1) {
                                setCurrentQ(currentQ + 1);
                                setSelectedAnswer(null);
                                setShowHint(false);
                                setShowAnswer(false);
                            } else {
                                handleFinish();
                            }
                        }}
                        className="btn btn-primary" 
                        style={{ padding: "10px 25px", display: "flex", alignItems: "center", gap: "8px" }}
                    >
                        לשאלה הבאה <CheckCircle2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
