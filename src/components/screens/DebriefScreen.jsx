import React, { useState, useEffect, useRef } from "react";
import { Send, Loader2, CheckCircle, MessageSquare, Target, Lightbulb, AlertTriangle } from "lucide-react";
import { DB } from "../../lib/mockBackend";
import { startInteractiveDebrief, continueInteractiveDebrief } from "../../lib/geminiApi";

export function DebriefScreen({ user, setScreen }) {
    const latestSession = [...DB.sessions].reverse().find(s => s.userId === user?.id);
    const sessionLogs = DB.logs.filter(l => l.sessionId === latestSession?.id);
    const logsSummary = sessionLogs.length > 0 ? sessionLogs.map((l, idx) => `שאלה ${idx+1}: ${l.question}\nתשובה: ${l.answer}\nסטטוס: ${l.status}`).join('\n\n') : "אין נתונים";

    const [step, setStep] = useState("form");
    const [reflections, setReflections] = useState({ good: "", bad: "", takeaways: "" });
    const [msgs, setMsgs] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const chatRef = useRef(null);

    const isFormValid = reflections.good.trim() && reflections.bad.trim() && reflections.takeaways.trim();

    const handleStartDebrief = async () => {
        if (!isFormValid) return;
        setStep("chat");
        setLoading(true);
        const userRefMsg = `תחקיר עצמי:\n\nלשימור: ${reflections.good}\nלשיפור: ${reflections.bad}\nמסקנות: ${reflections.takeaways}`;
        setMsgs([{ role: "user", text: userRefMsg }]);
        const aiResponse = await startInteractiveDebrief(logsSummary, reflections);
        setMsgs(prev => [...prev, { role: "ai", text: aiResponse }]);
        setLoading(false);
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
            <div style={{ padding: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", background: "#0f172a" }}>
                {step === "chat" && <button onClick={() => setScreen("home")} style={{ padding: "8px 20px", background: "#f97316", color: "#fff", border: "none", borderRadius: "6px" }}>סיום תחקיר</button>}
                <div style={{ color: "#fff", fontWeight: "bold" }}>תחקיר ביצועים מסכם</div>
            </div>

            {step === "form" ? (
                <div style={{ padding: "40px 20px", display: "flex", justifyContent: "center" }}>
                    <div style={{ maxWidth: "700px", background: "#0f172a", padding: "40px", borderRadius: "16px", border: "1px solid #1e293b" }}>
                        <h2 style={{ color: "#fff", textAlign: "center", marginBottom: "30px" }}>שלב א': תחקיר עצמי</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <textarea placeholder="מה עשיתי טוב?" value={reflections.good} onChange={(e) => setReflections({...reflections, good: e.target.value})} style={{ width: "100%", padding: "12px", background: "#0b1120", color: "#fff", border: "1px solid #1e293b", borderRadius: "8px" }} />
                            <textarea placeholder="מה לשיפור?" value={reflections.bad} onChange={(e) => setReflections({...reflections, bad: e.target.value})} style={{ width: "100%", padding: "12px", background: "#0b1120", color: "#fff", border: "1px solid #1e293b", borderRadius: "8px" }} />
                            <textarea placeholder="מסקנות?" value={reflections.takeaways} onChange={(e) => setReflections({...reflections, takeaways: e.target.value})} style={{ width: "100%", padding: "12px", background: "#0b1120", color: "#fff", border: "1px solid #1e293b", borderRadius: "8px" }} />
                            <button onClick={handleStartDebrief} disabled={!isFormValid} style={{ padding: "15px", background: isFormValid ? "#3b82f6" : "#1e293b", color: "#fff", border: "none", borderRadius: "10px" }}>התחל תחקיר</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ padding: "40px 20px", display: "flex", flexDirection: "column", gap: "20px", alignItems: "center" }}>
                    {msgs.map((m, i) => (
                        <div key={i} style={{ width: "100%", maxWidth: "800px", alignSelf: m.role === "ai" ? "flex-start" : "flex-end" }}>
                            <div style={{ background: m.role === "ai" ? "#0f172a" : "#1e293b", color: "#fff", padding: "20px", borderRadius: "12px", textAlign: "right", whiteSpace: "pre-wrap" }}>{m.text}</div>
                        </div>
                    ))}
                    {loading && <Loader2 className="spin" />}
                    <div style={{ width: "100%", maxWidth: "800px", display: "flex", gap: "10px", marginTop: "20px" }}>
                        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendChat()} placeholder="השב למאמן..." style={{ flex: 1, padding: "15px", background: "#0f172a", color: "#fff", border: "1px solid #1e293b", borderRadius: "10px" }} />
                        <button onClick={handleSendChat} style={{ background: "none", border: "none", color: "#38bdf8" }}><Send style={{ transform: "scaleX(-1)" }} /></button>
                    </div>
                    <div ref={chatRef} />
                </div>
            )}
        </div>
    );
}
