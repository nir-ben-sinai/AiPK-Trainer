import React, { useState } from "react";
import { HelpCircle, Eye, XCircle, CheckCircle2 } from "lucide-react";

export function TrainingScreen({ user, setScreen, questions = [] }) {
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [wrongAttempts, setWrongAttempts] = useState(0); 
    const [showHint, setShowHint] = useState(false);
    const [showAnswer, setShowAnswer] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);

    const q = questions[currentQ] || {
        question: "אין שאלות זמינות במערכת",
        options: ["תשובה 1", "תשובה 2", "תשובה 3", "תשובה 4"],
        correctAnswer: ""
    };

    const handleAnswerClick = (idx) => {
        if (isCorrect) return; 
        setSelectedAnswer(idx);
        if (q.options[idx] === q.correctAnswer) {
            setIsCorrect(true);
        } else {
            setIsCorrect(false);
            setWrongAttempts(prev => prev + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQ < questions.length - 1) {
            setCurrentQ(prev => prev + 1);
            setSelectedAnswer(null);
            setWrongAttempts(0);
            setShowHint(false);
            setShowAnswer(false);
            setIsCorrect(null);
        } else {
            setScreen("debrief");
        }
    };

    return (
        <div className="screen" style={{ background: "#020617", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", direction: "rtl", position: "relative", zIndex: 10 }}>
            <div className="card" style={{ maxWidth: "700px", width: "90%", textAlign: "right", padding: "30px", position: "relative", zIndex: 20 }}>
                
                {/* כפתורי עזר */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                    <button 
                        disabled={wrongAttempts < 1}
                        onClick={() => setShowHint(true)}
                        style={{ 
                            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", 
                            padding: "12px", borderRadius: "10px", border: "1px solid #334155",
                            cursor: wrongAttempts >= 1 ? "pointer" : "not-allowed",
                            background: wrongAttempts >= 1 ? "rgba(234, 179, 8, 0.1)" : "transparent",
                            color: wrongAttempts >= 1 ? "#eab308" : "#475569",
                            opacity: wrongAttempts >= 1 ? 1 : 0.5
                        }}
                    >
                        <HelpCircle size={18} /> עזרה מה-AI {wrongAttempts < 1 && "🔒"}
                    </button>

                    <button 
                        disabled={wrongAttempts < 3}
                        onClick={() => setShowAnswer(true)}
                        style={{ 
                            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", 
                            padding: "12px", borderRadius: "10px", border: "1px solid #334155",
                            cursor: wrongAttempts >= 3 ? "pointer" : "not-allowed",
                            background: wrongAttempts >= 3 ? "rgba(34, 197, 94, 0.1)" : "transparent",
                            color: wrongAttempts >= 3 ? "#22c55e" : "#475569",
                            opacity: wrongAttempts >= 3 ? 1 : 0.5
                        }}
                    >
                        <Eye size={18} /> הגלה תשובה {wrongAttempts < 3 && `(${3 - wrongAttempts})`}
                    </button>
                </div>

                <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "10px" }}>שאלה {currentQ + 1} מתוך {questions.length}</div>
                <h2 style={{ color: "#fff", marginBottom: "25px", fontSize: "22px", lineHeight: "1.4" }}>{q.question}</h2>

                <div style={{ display: "grid", gap: "12px", marginBottom: "25px" }}>
                    {q.options.map((opt, idx) => (
                        <button 
                            key={idx}
                            onClick={() => handleAnswerClick(idx)}
                            style={{
                                padding: "16px", borderRadius: "10px", textAlign: "right", cursor: "pointer", fontSize: "16px",
                                border: selectedAnswer === idx ? (isCorrect ? "2px solid #22c55e" : "2px solid #ef4444") : "1px solid #1e293b",
                                background: selectedAnswer === idx ? (isCorrect ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)") : "#0f172a",
                                color: "#f8fafc", transition: "0.2s"
                            }}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {showHint && <div style={{ padding: "12px", background: "rgba(234, 179, 8, 0.1)", borderRadius: "8px", color: "#eab308", marginBottom: "15px" }}>💡 רמז: שים לב לנהלים המקצועיים במדריך.</div>}
                {showAnswer && <div style={{ padding: "12px", background: "rgba(34, 197, 94, 0.1)", borderRadius: "8px", color: "#22c55e", marginBottom: "15px" }}>✅ התשובה: {q.correctAnswer}</div>}

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", borderTop: "1px solid #1e293b", paddingTop: "20px" }}>
                    <button 
                        onClick={() => { console.log("Exit Clicked"); setScreen("debrief"); }} 
                        style={{ background: "#334155", color: "#fff", padding: "12px 24px", border: "none", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", fontWeight: "bold" }}
                    >
                        <XCircle size={18} /> סיים אימון
                    </button>
                    
                    <button 
                        disabled={!isCorrect}
                        onClick={nextQuestion}
                        style={{ 
                            padding: "12px 24px", borderRadius: "10px", border: "none", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px",
                            background: isCorrect ? "#22c55e" : "#1e293b", 
                            color: isCorrect ? "#052e16" : "#475569",
                            cursor: isCorrect ? "pointer" : "not-allowed",
                            opacity: isCorrect ? 1 : 0.6
                        }}
                    >
                        לשאלה הבאה <CheckCircle2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
