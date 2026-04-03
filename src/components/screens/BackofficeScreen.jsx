import { useState, useEffect } from "react";
import { BarChart2, Users, Clock, FileText, BookOpen, Database, ArrowLeft, MapPin, Upload, Download, XCircle, CheckCircle, Trash2, Wand2, Sparkles, Loader2 } from "lucide-react";
import { DB, sc, fmt } from "../../lib/mockBackend";
import { Logo } from "../Logo";

export function BackofficeScreen({
    user,
    setScreen,
    boTab,
    setBoTab,
    dbTable,
    setDbTable,
    done,
    avgSc,
    uploadedSets,
    libraryDocs,
    fileInputRef,
    processAiFile,
    addLibraryDoc,
    deleteLibraryDoc,
    aiFileInputRef,
    aiLoading,
    handleFileInput,
    uploadError,
    deleteSet,
    isUploadingDoc,
    deleteUserRecord,
    tick
}) {
    const [isGenPopupOpen, setIsGenPopupOpen] = useState(false);
    const [genConfig, setGenConfig] = useState({ docId: "", name: "", count: "20", notes: "" });
    
    // מנגנון פס התקדמות ברור למחולל השאלות
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let interval;
        if (aiLoading) {
            setProgress(0);
            interval = setInterval(() => {
                setProgress(p => {
                    if (p < 40) return p + Math.random() * 8;
                    if (p < 85) return p + Math.random() * 4;
                    if (p < 96) return p + Math.random() * 1;
                    return p;
                });
            }, 800);
        } else {
            setProgress(100);
            const timer = setTimeout(() => setProgress(0), 500);
            return () => clearTimeout(timer);
        }
        return () => clearInterval(interval);
    }, [aiLoading]);

    const trainees = DB.users.filter(u => u.role === "trainee");

    // פונקציה מקומית תקינה להורדת תבנית קובץ CSV בעברית
    const localDownloadTemplate = () => {
        // ה-\uFEFF מבטיח שהאקסל יזהה את הקידוד כ-UTF-8 והעברית תוצג כראוי
        const csvContent = "data:text/csv;charset=utf-8,\uFEFFQuestion,Option 1,Option 2,Option 3,Option 4,Correct Answer\nדוגמה לשאלה,תשובה א,תשובה ב,תשובה ג,תשובה ד,תשובה א";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "aipk_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const tabs = [
        { id: "overview", label: "סקירה", Icon: BarChart2 },
        { id: "users", label: "משתמשים", Icon: Users },
        { id: "sessions", label: "סשנים", Icon: Clock },
        { id: "logs", label: "לוגים", Icon: FileText },
        { id: "kb", label: "ידע", Icon: BookOpen },
        { id: "database", label: "DB", Icon: Database },
    ];
    
    return (
        <>
            <div className="mock-badge">PROTOTYPE</div>
            <div className="screen" style={{ flexDirection: "row" }}>

                {/* Sidebar */}
                <div style={{ width: 195, background: "var(--s1)", borderLeft: "1px solid var(--bdr)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
                    <div style={{ padding: "8px 6px", borderBottom: "1px solid var(--bdr)" }}>
                        <div className="nav-it" onClick={() => setScreen("home")} style={{ gap: 8 }}>
                            <ArrowLeft size={14} /><span>בית</span>
                        </div>
                    </div>
                    <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid var(--bdr)" }}>
                        <Logo sz={36} />
                        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--cy)", marginTop: 10, letterSpacing: "0.04em" }}>Back Office</div>
                        <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2 }}>{user?.name}</div>
                    </div>
                    <div style={{ flex: 1, padding: "8px 6px", overflowY: "auto" }}>
                        {tabs.map(({ id, label, Icon: I }) => (
                            <div key={id} className={`nav-it ${boTab === id ? "on" : ""}`} onClick={() => setBoTab(id)}>
                                <I size={14} /><span>{label}</span>
                                {id === "database" && <span className="tag tag-warn" style={{ marginRight: "auto", marginLeft: 4, fontSize: 9, padding: "1px 5px" }}>RAW</span>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: "auto", padding: "24px 22px" }}>

                    {/* OVERVIEW */}
                    {boTab === "overview" && (
                        <div className="fade">
                            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--t0)", marginBottom: 18 }}>סקירה כללית</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 22 }}>
                                {[
                                    { label: "משתמשים", value: DB.users.length, sub: `${trainees.length} מתאמנים`, Icon: Users },
                                    { label: "סשנים", value: DB.sessions.length, sub: `${done.length} הושלמו`, Icon: Clock },
                                    { label: "ממוצע", value: `${avgSc}%`, sub: "כלל הסשנים", color: sc(avgSc), Icon: BarChart2 },
                                    { label: "בקשות עזרה", value: DB.helpRequests.length, sub: "סה״כ", Icon: MapPin },
                                ].map(({ label, value, sub, color, Icon: I }) => (
                                    <div key={label} className="card" style={{ padding: "14px", borderColor: color && value > 0 ? color + "44" : "var(--bdr)" }}>
                                        <div style={{ marginBottom: 8 }}><I size={15} color={color || "var(--t3)"} /></div>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: color || "var(--t0)", fontFamily: "'IBM Plex Mono',monospace" }}>{value}</div>
                                        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--t1)", marginTop: 3 }}>{label}</div>
                                        <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 1 }}>{sub}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", marginBottom: 12 }}>ביצועים לפי מודול</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 22 }}>
                                {[...uploadedSets].map(t => {
                                    const ts = done.filter(s => s.topicId === t.id);
                                    const avg = ts.length ? Math.round(ts.reduce((a, s) => a + s.score, 0) / ts.length) : 0;
                                    return (
                                        <div key={t.id} className="card" style={{ padding: "14px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                                                <div>
                                                    <div className="rb" style={{ fontSize: 13, fontWeight: 500, color: "var(--t0)" }}>{t.title}</div>
                                                    <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 2 }}>{ts.length} סשנים</div>
                                                </div>
                                                <div style={{ fontSize: 22, fontWeight: 700, color: avg ? sc(avg) : "var(--t3)", fontFamily: "'IBM Plex Mono',monospace" }}>{avg ? `${avg}%` : "—"}</div>
                                            </div>
                                            <div className="prog-wrap"><div className="prog-fill" style={{ width: `${avg}%`, background: sc(avg) }} /></div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", marginBottom: 12 }}>סשנים אחרונים</div>
                            <div className="card" style={{ overflow: "hidden" }}>
                                <table>
                                    <thead><tr><th>משתמש</th><th>נושא</th><th>ציון</th><th>ניסיונות</th><th>עזרה</th><th>דגל</th><th>תאריך</th></tr></thead>
                                    <tbody>
                                        {[...DB.sessions].reverse().slice(0, 8).map(s => {
                                            const u = DB.users.find(u => u.id === s.userId);
                                            const t = [...uploadedSets].find(t => t.id === s.topicId);
                                            const hlp = s.helpClicks || 0;
                                            const ansShow = s.showAnswerClicks || 0;
                                            return (
                                                <tr key={s.id}>
                                                    <td style={{ fontWeight: 500, color: "var(--t0)" }} className="rb">{u?.name}</td>
                                                    <td className="rb" style={{ color: "var(--t2)" }}>{t?.title || s.topicId}</td>
                                                    <td><span style={{ fontWeight: 600, color: sc(s.score), fontFamily: "'IBM Plex Mono',monospace" }}>{s.score}%</span></td>
                                                    <td style={{ color: "var(--t2)" }}>{s.attemptCount}</td>
                                                    <td>{hlp > 0 || ansShow > 0 ? <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                                        {hlp > 0 && <span className="tag tag-warn" style={{ gap: 4, padding: "1px 6px", fontSize: 9 }}>עזרה: {hlp}</span>}
                                                        {ansShow > 0 && <span className="tag tag-err" style={{ gap: 4, padding: "1px 6px", fontSize: 9 }}>תשובות: {ansShow}</span>}
                                                    </div> : <span style={{ color: "var(--t3)" }}>—</span>}</td>
                                                    <td>{s.isCopied ? <span className="tag tag-err">Flag</span> : <span style={{ color: "var(--t3)" }}>—</span>}</td>
                                                    <td style={{ color: "var(--t2)", fontSize: 12 }}>{fmt(s.startedAt)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* CREW */}
                    {boTab === "users" && (
                        <div className="fade">
                            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--t0)", marginBottom: 18 }}>משתמשים במערכת</div>
                            <div className="card" style={{ overflow: "hidden" }}>
                                <table>
                                    <thead><tr><th>שם</th><th>אימייל</th><th>תפקיד</th><th>דרגה</th><th>סשנים</th><th>ממוצע</th><th>הצטרף</th><th>פעולות</th></tr></thead>
                                    <tbody>
                                        {DB.users.map(u => {
                                            const us = done.filter(s => s.userId === u.id);
                                            const ua = us.length ? Math.round(us.reduce((a, s) => a + s.score, 0) / us.length) : null;
                                            return (
                                                <tr key={u.id}>
                                                    <td style={{ fontWeight: 500, color: "var(--t0)" }} className="rb">{u.name}</td>
                                                    <td style={{ color: "var(--t2)", fontSize: 12, fontFamily: "'IBM Plex Mono',monospace" }}>{u.email}</td>
                                                    <td className="rb" style={{ color: "var(--t2)" }}>{u.profession}</td>
