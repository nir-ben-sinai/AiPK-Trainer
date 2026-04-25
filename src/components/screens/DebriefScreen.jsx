import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, CheckCircle, MessageSquare, Target, Lightbulb, AlertTriangle } from "lucide-react";
import { DB } from "../../lib/mockBackend";
import { startInteractiveDebrief, continueInteractiveDebrief } from "../../lib/geminiApi";

export function DebriefScreen({ user, setScreen, openFeedback }) {
    // משיכת נתוני האימון האחרון של המשתמש מה-DB
    const latestSession = [...DB.sessions].reverse().find(s => s.userId === user?.id);
    const sessionLogs = DB.logs.filter(l => l.sessionId === latestSession?.id);

    // יצירת תקציר ביצועים עבור המאמן (ה-AI)
    const logsSummary = sessionLogs.length > 0
        ? sessionLogs.map((l, idx) => `שאלה ${idx + 1}: ${l.question}\nתשובת המתאמן: ${l.answer}\nסטטוס: ${l.status === 'correct' ? 'תשובה נכונה' : 'טעות / חשיפת תשובה'}`).join('\n\n')
        : "אין נתונים על שאלות מהסשן (ייתכן שהסשן הופסק מוקדם).";

    const [step, setStep] = useState("form"); // "form" | "chat"
    const [reflections, setReflections] = useState({ good: "", bad: "", takeaways: "" });

    const [msgs, setMsgs] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatRef = useRef(null);

    // בדיקה האם כל השדות מלאים כדי להאיר את כפתור השלח
    const isFormValid = reflections.good.trim() !== "" && reflections.bad.trim() !== "" && reflections.takeaways.trim() !== "";

    // גלילה אוטומטית בצ'אט
    useEffect(() => {
        if (step === "chat") {
            chatRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [msgs, step, loading]);

    const handleStartDebrief = async (skip = false) => {
        if (!skip && !isFormValid) return;
        setStep("chat");
        setLoading(true);

        const reflectionsPayload = skip
            ? { skipped: true }
            : { good: reflections.good, bad: reflections.bad, takeaways: reflections.takeaways };

        const userRefMsg = skip
            ? "ביקשתי ממשק המערכת לדלג על מילוי תחקיר עצמי. אנא ספק לי סיכום ומשוב אוטומטי לביצועים שלי."
            : `התחקיר העצמי שלי:\n\nלשימור: ${reflections.good}\n\nלשיפור: ${reflections.bad}\n\nמסקנות: ${reflections.takeaways}`;
        setMsgs([{ role: "user", text: userRefMsg }]);

        const userContext = {
            name: user?.name,
            profession: user?.profession,
            topic: latestSession?.topic || "כללי"
        };

        const aiResponse = await startInteractiveDebrief(logsSummary, reflectionsPayload, userContext);
        setMsgs(prev => [...prev, { role: "ai", text: aiResponse }]);
        setLoading(false);

        if (latestSession) {
            const debriefObj = {
                id: `deb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                userId: user.id,
                sessionId: latestSession.id,
                score: latestSession.score,
                aiSummary: aiResponse.slice(0, 200) + '...',
                insights: skip ? ["משוב אוטומטי - ללא תחקיר עצמי"] : [reflections.takeaways, reflections.bad].filter(Boolean),
                timestamp: new Date().toISOString()
            };
            DB.debriefs.push(debriefObj);
        }
    };

    const handleSendChat = async () => {
        if (!input.trim() || loading) return;
        const newMsg = input.trim();
        setInput("");
        setMsgs(prev => [...prev, { role: "user", text: newMsg }]);
        setLoading(true);

        const aiResponse = await continueInteractiveDebrief(msgs, newMsg);
        setMsgs(prev => [...prev, { role: "ai", text: aiResponse }]);
        setLoading(false);
    };

    return (
        <div style={{ background: "#0b1120", minHeight: "100vh", display: "flex", flexDirection: "column", direction: "rtl", fontFamily: "sans-serif" }}>

            {/* Header */}
            <div style={{ padding: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", background: "#0f172a" }}>
                <div style={{ width: 100 }} /> {/* Spacer */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#f8fafc", fontSize: "18px", fontWeight: "bold" }}>
                    <Target size={20} color="#38bdf8" />
                    תחקיר ביצועים מסכם
                </div>
                <button 
                    onClick={openFeedback}
                    style={{ 
                        display: "flex", alignItems: "center", gap: "8px", 
                        padding: "8px 16px", borderRadius: "8px", 
                        background: "rgba(56,189,248,0.1)", color: "#38bdf8", 
                        border: "1px solid rgba(56,189,248,0.3)", cursor: "pointer",
                        fontSize: "13px", fontWeight: "600"
                    }}
                >
                    <MessageSquare size={14} /> משוב
                </button>
            </div>

            {/* Step 1: Form */}
            {step === "form" && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px", overflowY: "auto" }}>
                    <div style={{ width: "100%", maxWidth: "700px", background: "#0f172a", padding: "40px", borderRadius: "16px", border: "1px solid #1e293b", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)" }}>

                        <h2 style={{ color: "#f8fafc", fontSize: "22px", marginBottom: "10px", textAlign: "center" }}>שלב א': תחקיר עצמי</h2>
                        <p style={{ color: "#94a3b8", textAlign: "center", marginBottom: "40px", fontSize: "14px", lineHeight: "1.6" }}>
                            לפני שניגש למאמן, קח רגע לנתח את הביצועים שלך. מה עבד? איפה כשלת? מלא את השדות כדי להתחיל את התחקיר.
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                            <div>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#4ade80", fontWeight: "bold", marginBottom: "10px" }}><CheckCircle size={18} /> לשימור (מה עשיתי טוב?)</label>
                                <textarea
                                    rows="3"
                                    value={reflections.good}
                                    onChange={(e) => setReflections({ ...reflections, good: e.target.value })}
                                    placeholder="פרט דברים שעבדו לך טוב במהלך האימון..."
                                    style={{ width: "100%", padding: "12px", background: "#0b1120", border: "1px solid #1e293b", borderRadius: "8px", color: "#fff", resize: "none", outline: "none" }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f87171", fontWeight: "bold", marginBottom: "10px" }}><AlertTriangle size={18} /> לשיפור (איפה היו טעויות?)</label>
                                <textarea
                                    rows="3"
                                    value={reflections.bad}
                                    onChange={(e) => setReflections({ ...reflections, bad: e.target.value })}
                                    placeholder="היכן התקשית? האם מיהרת לענות? האם חסר ידע תיאורטי?"
                                    style={{ width: "100%", padding: "12px", background: "#0b1120", border: "1px solid #1e293b", borderRadius: "8px", color: "#fff", resize: "none", outline: "none" }}
                                />
                            </div>

                            <div>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#38bdf8", fontWeight: "bold", marginBottom: "10px" }}><Lightbulb size={18} /> מסקנות ולקחים להמשך</label>
                                <textarea
                                    rows="3"
                                    value={reflections.takeaways}
                                    onChange={(e) => setReflections({ ...reflections, takeaways: e.target.value })}
                                    placeholder="איך אתה מתכנן ליישם את מה שלמדת באימון הבא?"
                                    style={{ width: "100%", padding: "12px", background: "#0b1120", border: "1px solid #1e293b", borderRadius: "8px", color: "#fff", resize: "none", outline: "none" }}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: "40px", display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center" }}>
                            <button
                                onClick={() => handleStartDebrief(false)}
                                disabled={!isFormValid || loading}
                                style={{
                                    display: "flex", alignItems: "center", gap: "10px",
                                    padding: "15px 40px", fontSize: "18px", borderRadius: "10px", fontWeight: "bold",
                                    background: isFormValid ? "#3b82f6" : "#1e293b",
                                    color: isFormValid ? "#fff" : "#475569",
                                    border: "none", cursor: isFormValid ? "pointer" : "not-allowed",
                                    transition: "all 0.3s"
                                }}
                            >
                                {loading ? <Loader2 className="spin" size={20} /> : <MessageSquare size={20} />}
                                התחל תחקיר
                            </button>
                            <button
                                onClick={() => handleStartDebrief(true)}
                                disabled={loading}
                                style={{
                                    display: "flex", alignItems: "center", gap: "10px",
                                    padding: "15px 40px", fontSize: "18px", borderRadius: "10px", fontWeight: "bold",
                                    background: "rgba(255,255,255,0.05)", color: "#cbd5e1",
                                    border: "1px solid #1e293b", cursor: loading ? "not-allowed" : "pointer",
                                    transition: "all 0.3s"
                                }}
                            >
                                <Target size={20} />
                                קבל משוב אוטומטי
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Chat Interface */}
            {step === "chat" && (
                <>
                    <div style={{ flex: 1, overflowY: "auto", padding: "40px 20px", display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
                        {msgs.map((m, i) => {
                            const isAI = m.role === "ai";
                            return (
                                <div key={i} style={{ width: "100%", maxWidth: "800px", display: "flex", flexDirection: "column", alignItems: isAI ? "flex-start" : "flex-end" }}>
                                    <div style={{ color: "#64748b", fontSize: "12px", marginBottom: "5px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>
                                        {isAI ? "AI DEBRIEFER" : (user?.name || "TRAINEE")}
                                    </div>
                                    <div style={{
                                        background: isAI ? "#0f172a" : "#1e293b",
                                        color: isAI ? "#38bdf8" : "#f8fafc",
                                        padding: "20px 30px",
                                        borderRadius: "12px",
                                        border: isAI ? "1px solid #0369a1" : "1px solid #334155",
                                        fontSize: "16px",
                                        lineHeight: "1.7",
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
                                <div style={{ color: "#64748b", fontSize: "12px", marginBottom: "5px", fontWeight: "bold" }}>AI DEBRIEFER</div>
                                <div style={{ background: "#0f172a", color: "#94a3b8", padding: "15px 30px", borderRadius: "12px", border: "1px solid #1e293b", display: "flex", alignItems: "center", gap: "10px" }}>
                                    <Loader2 size={16} className="spin" /> המאמן מנתח וכותב תשובה...
                                </div>
                            </div>
                        )}
                        <div ref={chatRef} />
                    </div>

                    <div style={{ padding: "20px", background: "#0b1120", borderTop: "1px solid #1e293b", display: "flex", flexDirection: "column", alignItems: "center", gap: "15px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "15px", width: "100%", maxWidth: "800px" }}>
                            <button
                                onClick={handleSendChat}
                                disabled={loading || !input.trim()}
                                style={{ background: "transparent", color: (loading || !input.trim()) ? "#334155" : "#38bdf8", border: "none", cursor: (loading || !input.trim()) ? "not-allowed" : "pointer", padding: "10px" }}
                            >
                                <Send size={24} style={{ transform: "scaleX(-1)" }} />
                            </button>

                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !loading && input.trim() && handleSendChat()}
                                placeholder="השב למאמן או שאל שאלה..."
                                style={{ flex: 1, padding: "16px", borderRadius: "10px", border: "1px solid #1e293b", background: "#0f172a", color: "#fff", fontSize: "16px", outline: "none" }}
                            />
                        </div>

                        <button
                            onClick={() => setScreen("home")}
                            style={{
                                padding: "12px 30px", borderRadius: "8px",
                                background: "#f97316", color: "#fff", border: "none",
                                cursor: "pointer", fontWeight: "bold", width: "100%", maxWidth: "300px",
                                boxShadow: "0 4px 6px -1px rgba(249, 115, 22, 0.2)"
                            }}
                        >
                            סיום תחקיר וחזרה הביתה
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
