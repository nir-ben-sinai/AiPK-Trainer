import { MapPin, Send, CheckCircle, XCircle, Clock } from "lucide-react";
import { Popup } from "../Popup";

export function TrainingScreen({
    topic,
    questions,
    qIdx,
    correct,
    setPopup,
    msgs,
    showRef,
    attempts,
    qAttempts,
    input,
    setInput,
    sendAnswer,
    loading,
    chatRef,
    pops,
    user // added user prop to show name
}) {
    const prog = questions.length > 0 ? (qIdx / questions.length) * 100 : 0;
    return (
        <>
            <Popup {...pops} />
            <div className="screen" style={{ height: "100vh", overflow: "hidden" }}>
                <div className="hdr">
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t0)" }}>{topic?.title}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div className="prog-wrap" style={{ width: 100 }}>
                                <div className="prog-fill" style={{ width: `${prog}%` }} />
                            </div>
                            <span style={{ fontSize: 11, color: "var(--t2)", fontFamily: "'IBM Plex Mono',monospace" }}>{qIdx + 1}/{questions.length}</span>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <div style={{ fontSize: 12, color: "var(--t2)" }}>נכון: <span style={{ color: "var(--ok)", fontWeight: 600 }}>{correct}</span></div>
                        <button className="btn btn-ghost" style={{ gap: 6 }} onClick={() => setPopup("end")}>סיים אימון</button>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 14, maxWidth: 720, width: "100%", margin: "0 auto" }}>
                    {msgs.map((m, i) => {
                        if (m.role === "ref") return (
                            <div key={i} className="fade" style={{ display: "flex", justifyContent: "center" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 16px", borderRadius: 8, background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.22)", maxWidth: "72%" }}>
                                    <MapPin size={13} color="var(--cy)" style={{ flexShrink: 0, marginTop: 2 }} />
                                    <span className="rb" style={{ fontSize: 12, color: "var(--cy)", whiteSpace: "pre-line", lineHeight: 1.65 }}>{m.text}</span>
                                </div>
                            </div>
                        );
                        return (
                            <div key={i} className="fade" style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-start" : "flex-end" }}>
                                <div className="lbl" style={{ marginBottom: 5, color: "var(--t3)" }}>{m.role === "user" ? user?.name : "AI Instructor"}</div>
                                <div style={{
                                    maxWidth: "82%", padding: "12px 16px", lineHeight: 1.75, fontSize: 14, whiteSpace: "pre-line", borderRadius: 8,
                                    background: m.role === "user" ? "var(--s2)" : "var(--s1)",
                                    border: `1px solid ${m.status === "correct" ? "rgba(52,211,153,0.35)" : m.status === "wrong" ? "rgba(248,113,113,0.35)" : m.status === "partial" ? "rgba(251,191,36,0.35)" : "var(--bdr)"}`,
                                }} className="rb">{m.text}</div>
                                {
                                    m.status && (
                                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
                                            {m.status === "correct" ? <CheckCircle size={12} color="var(--ok)" /> : m.status === "wrong" ? <XCircle size={12} color="var(--err)" /> : <Clock size={12} color="var(--warn)" />}
                                            <span className="tag" style={{
                                                padding: "2px 8px", fontSize: 10, fontWeight: 600, borderRadius: 20,
                                                color: m.status === "correct" ? "var(--ok)" : m.status === "wrong" ? "var(--err)" : "var(--warn)",
                                                background: m.status === "correct" ? "rgba(52,211,153,0.1)" : m.status === "wrong" ? "rgba(248,113,113,0.1)" : "rgba(251,191,36,0.1)",
                                                border: `1px solid ${m.status === "correct" ? "rgba(52,211,153,0.25)" : m.status === "wrong" ? "rgba(248,113,113,0.25)" : "rgba(251,191,36,0.25)"}`,
                                            }}>
                                                {m.status === "correct" ? "נכון" : m.status === "wrong" ? "שגוי" : "חלקי"}
                                            </span>
                                        </div>
                                    )}
                            </div>
                        );
                    })}
                    {loading && (
                        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                            <div className="spin" /><span className="lbl">מעבד...</span>
                        </div>
                    )}
                    <div ref={chatRef} />
                </div >

                <div style={{ flexShrink: 0, borderTop: "1px solid var(--bdr)", background: "var(--s1)", padding: "12px 20px" }}>
                    <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
                        {/* מראה מקום — active only after first user answer */}
                        <button
                            onClick={showRef}
                            disabled={attempts === 0}
                            title="מראה מקום"
                            style={{
                                display: "flex", alignItems: "center", gap: 6,
                                padding: "0 12px", height: 40, flexShrink: 0,
                                background: qAttempts >= 3 ? "rgba(251,191,36,0.15)" : "transparent",
                                border: `1px solid ${qAttempts >= 3 ? "var(--warn)" : (attempts > 0 ? "rgba(56,189,248,0.4)" : "var(--s3)")}`,
                                borderRadius: 8, cursor: attempts > 0 || qAttempts >= 3 ? "pointer" : "not-allowed",
                                color: qAttempts >= 3 ? "var(--warn)" : (attempts > 0 ? "var(--cy)" : "var(--t3)"),
                                fontSize: 11, fontWeight: 500, fontFamily: "'Inter',sans-serif",
                                transition: "all 0.15s", whiteSpace: "nowrap",
                            }}
                            onMouseEnter={e => {
                                if (qAttempts >= 3) e.currentTarget.style.background = "rgba(251,191,36,0.25)";
                                else if (attempts > 0) e.currentTarget.style.background = "rgba(56,189,248,0.08)";
                            }}
                            onMouseLeave={e => {
                                if (qAttempts >= 3) e.currentTarget.style.background = "rgba(251,191,36,0.15)";
                                else e.currentTarget.style.background = "transparent";
                            }}
                        >
                            <MapPin size={13} />
                            {qAttempts >= 3 ? "הצג תשובה" : "עזרה?"}
                        </button>
                        <textarea className="inp" placeholder="הקלד את תשובתך..." value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAnswer(); } }}
                            rows={2} style={{ resize: "none", lineHeight: 1.6, flex: 1 }} />
                        <button className="btn-icon" onClick={sendAnswer} disabled={!input.trim() || loading}
                            style={{ width: 40, height: 40, borderRadius: 8, background: input.trim() && !loading ? "var(--cy)" : "var(--s2)", border: "none", color: input.trim() && !loading ? "#050d18" : "var(--t3)", flexShrink: 0 }}>
                            {loading ? <div className="spin" style={{ width: 13, height: 13 }} /> : <Send size={15} />}
                        </button>
                    </div>
                    <div className="lbl" style={{ marginTop: 6, maxWidth: 720, margin: "6px auto 0" }}>Enter = שלח · Shift+Enter = שורה חדשה</div>
                </div >
            </div >
        </>
    );
}
