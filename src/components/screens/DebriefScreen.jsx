
import { useState } from "react";
import { FileText, Home, Download } from "lucide-react";
import { Popup } from "../Popup";
import { fmt, sc } from "../../lib/mockBackend";
// הנה השורה החדשה שמייבאת את מכשיר הקשר שלנו:
import { supabase } from "../supabase"; 

export function DebriefScreen({ topic, user, debrief, insights, setInsights, setScreen, saveDebrief, pops, loading, submitDebriefInsights, msgs = [] }) {
    const [traineeInsights, setTraineeInsights] = useState(["", "", ""]);
    const hasAiSummary = !!debrief?.aiSummary;

    const handleSubmitInsights = () => {
        if (traineeInsights.some(t => !t.trim())) {
            alert("נא למלא 3 תובנות לפני המשך התחקיר");
            return;
        }
        submitDebriefInsights(traineeInsights);
    };

    // הפונקציה החדשה שמשדרת את הנתונים לענן (לסופהבייס)
    const handleSaveToCloudAndClose = async () => {
        try {
            const { error } = await supabase
                .from('training_sessions')
                .insert([
                    {
                        user_name: user?.name || "חניך לא ידוע",
                        topic_title: topic?.title || "אימון כללי",
                        score: debrief?.score || 0,
                        trainee_insights: traineeInsights,
                        ai_summary: debrief?.aiSummary || "",
                        chat_history: msgs
                    }
                ]);

            if (error) {
                console.error("שגיאה בשמירה לענן:", error);
            } else {
                console.log("התחקיר נשמר בהצלחה ב-Supabase!");
            }
        } catch (err) {
            console.error("שגיאת מערכת בשמירה:", err);
        }

        // סוגר את המסך כמו פעם
        saveDebrief();
    };

    const handleDownload = () => {
        const text = `סיכום אימון: ${topic?.title}\nחניך: ${user?.name}\nציון: ${debrief?.score}%\n\n-- היסטוריית האימון --\n` +
            msgs.map(m => `${m.role === 'ai' || m.role === 'ref' ? 'מערכת/מדריך' : 'חניך'}: ${m.text}`).join('\n\n') +
            `\n\n-- תובנות החניך --\n` + traineeInsights.map((t, i) => `${i + 1}. ${t}`).join('\n') +
            `\n\n-- תחקיר מדריך מופעל AI --\n` + debrief?.aiSummary +
            `\n\n-- דגשים להמשך --\n` + insights.map((t, i) => `${i + 1}. ${t}`).join('\n');

        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Debrief_${topic?.title}_${user?.name}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <>
            <Popup {...pops} />
            <div className="screen fade">
                <div style={{ maxWidth: 560, width: "100%", margin: "auto", padding: "28px 20px" }}>
                    <div style={{ textAlign: "center", marginBottom: 8 }}>
                        <div className="lbl" style={{ marginBottom: 6, color: "var(--cy)" }}>Debrief Report</div>
                        <div className="rb" style={{ fontSize: 17, fontWeight: 600, color: "var(--t0)" }}>{topic?.title}</div>
                        <div className="lbl" style={{ marginTop: 4 }}>{user?.name} · {fmt(debrief?.createdAt || new Date().toISOString())}</div>
                        <div style={{ display: "inline-block", padding: "10px 32px", borderRadius: 8, background: `${sc(debrief?.score || 0)}12`, border: `1px solid ${sc(debrief?.score || 0)}44`, marginTop: 16 }}>
                            <span style={{ fontSize: 36, fontWeight: 700, color: sc(debrief?.score || 0), fontFamily: "'IBM Plex Mono',monospace" }}>{debrief?.score}%</span>
                        </div>
                    </div>

                    {!hasAiSummary && !loading && (
                        <div className="card fade" style={{ padding: "16px", marginBottom: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                                <FileText size={14} color="var(--cy)" />
                                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--t0)" }}>שלב 1: הזן 3 תובנות שלמדת באימון</span>
                            </div>
                            {traineeInsights.map((v, i) => (
                                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 12 }}>
                                    <span style={{ color: "var(--cy)", fontWeight: 600, fontSize: 12, marginTop: 11, width: 18, flexShrink: 0, fontFamily: "'IBM Plex Mono',monospace" }}>{i + 1}</span>
                                    <textarea className="inp" value={v}
                                        onChange={e => { const n = [...traineeInsights]; n[i] = e.target.value; setTraineeInsights(n); }}
                                        placeholder={`תובנה ${i + 1}...`} style={{ lineHeight: 1.55 }} rows={2} />
                                </div>
                            ))}
                            <button className="btn btn-primary" style={{ width: "100%", marginTop: 8 }} onClick={handleSubmitInsights}>המשך לתחקיר AI</button>
                        </div>
                    )}

                    {loading && (
                        <div className="card fade" style={{ padding: "32px 16px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                            <div className="spin border-cyan" style={{ width: 24, height: 24 }} />
                            <div className="rb" style={{ fontSize: 13, color: "var(--cy)", fontWeight: 500 }}>המאמן מנתח את התובנות שלך ומפיק תחקיר...</div>
                        </div>
                    )}
                    {hasAiSummary && !loading && (
                        <>
                            <div className="card fade" style={{ padding: "16px", borderRight: "2px solid var(--cy)", marginBottom: 12 }}>
                                <div className="lbl" style={{ marginBottom: 8, color: "var(--cy)" }}>AI Assessment & Feedback</div>
                                <div className="rb" style={{ fontSize: 13, lineHeight: 1.8, color: "var(--t1)", whiteSpace: "pre-wrap" }}>{debrief.aiSummary}</div>
                            </div>

                            <div className="card fade" style={{ padding: "16px", marginBottom: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                                    <FileText size={14} color="var(--cy)" />
                                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--t0)" }}>דגשים נוספים להמשך</span>
                                </div>
                                {insights.map((v, i) => (
                                    <div key={'ai_' + i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
                                        <div style={{ color: "var(--cy)", fontWeight: 600, fontSize: 12, marginTop: 4, width: 18, flexShrink: 0, fontFamily: "'IBM Plex Mono',monospace" }}>•</div>
                                        <div className="rb" style={{ fontSize: 13, lineHeight: 1.6, color: "var(--t1)" }}>{v}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                        <button className="btn btn-ghost" style={{ flex: 1, gap: 6 }} onClick={() => setScreen("home")}><Home size={13} /> בית</button>
                        {hasAiSummary && !loading && (
                            <button className="btn btn-ghost" style={{ flex: 1, gap: 6 }} onClick={handleDownload}><Download size={13} /> קובץ סיכום </button>
                        )}
                        {/* כאן שינינו את הכפתור שיפעיל את פונקציית השידור שבנינו */}
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveToCloudAndClose}>שמור וסגור</button>
                    </div>
                </div>
            </div >
        </>
    );
}