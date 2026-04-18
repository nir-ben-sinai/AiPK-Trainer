import { useState, useEffect, useRef } from "react";
import { BarChart2, Users, Clock, FileText, BookOpen, Database, ArrowLeft, MapPin, Upload, Download, XCircle, CheckCircle, Trash2, Wand2, Sparkles, Loader2, Play, Eye } from "lucide-react";
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
    processAiFile,
    addLibraryDoc,
    deleteLibraryDoc,
    aiLoading,
    handleFileInput,
    uploadError,
    deleteSet,
    isUploadingDoc,
    deleteUserRecord,
    tick,
    setSelectedTest
}) {
    const fileInputRef = useRef(null);
    const aiFileInputRef = useRef(null);

    const [isGenPopupOpen, setIsGenPopupOpen] = useState(false);
    // הוספנו כאן את ה-qType לסטייט ההתחלתי
    const [genConfig, setGenConfig] = useState({ docId: "", name: "", count: "20", notes: "", qType: "raw" });

    // סטייט חדש להצגת השאלות של מבחן ספציפי (לאדמין)
    const [testToView, setTestToView] = useState(null);

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

    const localDownloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,\uFEFFQuestion,Option 1,Option 2,Option 3,Option 4,Correct Answer\nדוגמה לשאלה,תשובה א,תשובה ב,תשובה ג,תשובה ד,תשובה א";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "aipk_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const onCsvSelected = (e) => {
        if (handleFileInput) {
            handleFileInput(e);
        } else {
            const file = e.target.files[0];
            if (file) alert(`קובץ ${file.name} נבחר! כדי לקרוא את השאלות ממנו, יש לחבר את לוגיקת ה-CSV בקובץ הראשי.`);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
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
                                                    <td><span className={`tag ${u.role === "admin" ? "tag-cyan" : "tag-ok"}`}>{u.role}</span></td>
                                                    <td style={{ color: "var(--t2)" }}>{us.length}</td>
                                                    <td>{ua !== null ? <span style={{ fontWeight: 600, color: sc(ua), fontFamily: "'IBM Plex Mono',monospace" }}>{ua}%</span> : <span style={{ color: "var(--t3)" }}>—</span>}</td>
                                                    <td style={{ color: "var(--t2)", fontSize: 12 }}>{fmt(u.joinedAt)}</td>
                                                    <td>
                                                        {u.id !== "u_admin" && (
                                                            <button className="btn-icon" style={{ border: "none", color: "var(--err)", background: "rgba(248,113,113,0.08)" }} onClick={() => deleteUserRecord(u.id)} title="מחק משתמש ונתונים">
                                                                <Trash2 size={13} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* SESSIONS */}
                    {boTab === "sessions" && (
                        <div className="fade">
                            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--t0)", marginBottom: 18 }}>יומן סשנים</div>
                            <div className="card" style={{ overflow: "hidden" }}>
                                <table>
                                    <thead><tr><th>ID</th><th>משתמש</th><th>נושא</th><th>סטטוס</th><th>ציון</th><th>ניסיונות</th><th>עזרה</th><th>דגל</th><th>תאריך</th></tr></thead>
                                    <tbody>
                                        {[...DB.sessions].reverse().map(s => {
                                            const u = DB.users.find(u => u.id === s.userId);
                                            const t = [...uploadedSets].find(t => t.id === s.topicId);
                                            const hlp = s.helpClicks || 0;
                                            const ansShow = s.showAnswerClicks || 0;
                                            return (
                                                <tr key={s.id}>
                                                    <td style={{ fontSize: 11, color: "var(--t3)", fontFamily: "'IBM Plex Mono',monospace" }}>{s.id.slice(-6)}</td>
                                                    <td style={{ fontWeight: 500, color: "var(--t0)" }} className="rb">{u?.name}</td>
                                                    <td className="rb" style={{ color: "var(--t2)" }}>{t?.title || s.topicId}</td>
                                                    <td><span className={`tag ${s.status === "completed" ? "tag-ok" : "tag-warn"}`}>{s.status}</span></td>
                                                    <td><span style={{ fontWeight: 600, color: sc(s.score), fontFamily: "'IBM Plex Mono',monospace" }}>{s.score}%</span></td>
                                                    <td style={{ color: "var(--t2)" }}>{s.attemptCount}</td>
                                                    <td>{hlp > 0 || ansShow > 0 ? <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                                        {hlp > 0 && <span className="tag tag-warn" style={{ gap: 4, padding: "1px 6px", fontSize: 9 }}>עזרה: {hlp}</span>}
                                                        {ansShow > 0 && <span className="tag tag-err" style={{ gap: 4, padding: "1px 6px", fontSize: 9 }}>תשובות: {ansShow}</span>}
                                                    </div> : <span style={{ color: "var(--t3)" }}>—</span>}</td>
                                                    <td>{s.isCopied ? <span className="tag tag-err">Flag</span> : "—"}</td>
                                                    <td style={{ color: "var(--t2)", fontSize: 12 }}>{fmt(s.startedAt)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* LOGS */}
                    {boTab === "logs" && (
                        <div className="fade">
                            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--t0)", marginBottom: 18 }}>לוגים ותחקירים</div>
                            <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                                <div className="card" style={{ flex: 1, padding: "16px" }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--cy)", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><FileText size={13} /> תשובות</div>
                                    {DB.logs.length === 0 ? <div className="rb" style={{ color: "var(--t2)", fontSize: 12 }}>אין נתונים</div>
                                        : DB.logs.slice(-8).reverse().map(l => {
                                            const u = DB.users.find(u => u.id === l.userId);
                                            return (
                                                <div key={l.id} style={{ borderBottom: "1px solid var(--bdr)", paddingBottom: 12, marginBottom: 12 }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
                                                        <span className="rb" style={{ fontSize: 13, color: "var(--t0)", fontWeight: 500 }}>{u?.name}</span>
                                                        <span className={`tag ${l.status === "correct" ? "tag-ok" : l.status === "wrong" ? "tag-err" : "tag-warn"}`}>{l.status}</span>
                                                    </div>
                                                    <div className="rb" style={{ fontSize: 11, color: "var(--cy)", marginBottom: 3 }}>{l.question}</div>
                                                    <div className="rb" style={{ fontSize: 11, color: "var(--t2)" }}>{l.answer.slice(0, 65)}...</div>
                                                </div>
                                            );
                                        })}
                                </div>
                                <div className="card" style={{ flex: 1, padding: "16px" }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--cy)", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><BarChart2 size={13} /> תחקירים</div>
                                    {DB.debriefs.length === 0 ? <div className="rb" style={{ color: "var(--t2)", fontSize: 12 }}>אין נתונים</div>
                                        : DB.debriefs.map(d => {
                                            const u = DB.users.find(u => u.id === d.userId);
                                            const sess = DB.sessions.find(s => s.id === d.sessionId);
                                            const t = [...uploadedSets].find(t => t.id === sess?.topicId);
                                            return (
                                                <div key={d.id} style={{ borderBottom: "1px solid var(--bdr)", paddingBottom: 14, marginBottom: 14 }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "flex-start" }}>
                                                        <div>
                                                            <div className="rb" style={{ fontSize: 13, fontWeight: 500, color: "var(--t0)" }}>{u?.name}</div>
                                                            <div className="rb" style={{ fontSize: 11, color: "var(--t2)", marginTop: 1 }}>{t?.title}</div>
                                                        </div>
                                                        <span style={{ fontSize: 20, fontWeight: 700, color: sc(d.score), fontFamily: "'IBM Plex Mono',monospace" }}>{d.score}%</span>
                                                    </div>
                                                    <div className="rb" style={{ fontSize: 12, color: "var(--t1)", lineHeight: 1.65, marginBottom: 6 }}>{d.aiSummary}</div>
                                                    {d.insights.filter(Boolean).map((ins, i) => (
                                                        <div key={i} className="rb" style={{ fontSize: 11, color: "var(--t2)", marginTop: 3, display: "flex", gap: 5, alignItems: "flex-start" }}>
                                                            <span style={{ color: "var(--t3)", marginTop: 1 }}>·</span>{ins}
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                            <div className="card" style={{ overflow: "hidden" }}>
                                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--bdr)", display: "flex", alignItems: "center", gap: 8 }}>
                                    <MapPin size={13} color="var(--warn)" />
                                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--warn)" }}>בקשות עזרה ({DB.helpRequests.length})</span>
                                </div>
                                {DB.helpRequests.length === 0
                                    ? <div className="rb" style={{ color: "var(--t2)", fontSize: 12, padding: "14px 16px" }}>אין נתונים</div>
                                    : <table>
                                        <thead><tr><th>משתמש</th><th>נושא</th><th>סוג</th><th>שאלה</th><th>מס׳</th><th>שעה</th></tr></thead>
                                        <tbody>
                                            {[...DB.helpRequests].reverse().map(h => {
                                                const u = DB.users.find(u => u.id === h.userId);
                                                const t = [...uploadedSets].find(t => t.id === h.topicId);
                                                return (
                                                    <tr key={h.id}>
                                                        <td style={{ fontWeight: 500, color: "var(--t0)" }} className="rb">{u?.name}</td>
                                                        <td className="rb" style={{ color: "var(--t2)" }}>{t?.title || h.topicId}</td>
                                                        <td>{h.type === 'show_answer' ? <span className="tag tag-err" style={{ fontSize: 9 }}>נחשפה תשובה</span> : <span className="tag tag-warn" style={{ fontSize: 9 }}>בקשת רמז</span>}</td>
                                                        <td className="rb" style={{ color: "var(--t1)", maxWidth: 220 }}>{h.questionText?.slice(0, 45)}…</td>
                                                        <td style={{ color: "var(--t2)", fontFamily: "'IBM Plex Mono',monospace" }}>#{h.qIdx + 1}</td>
                                                        <td style={{ color: "var(--t2)", fontSize: 12 }}>{fmt(h.timestamp)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>}
                            </div>
                        </div>
                    )}

                    {/* KNOWLEDGE BASE + UPLOAD */}
                    {boTab === "kb" && (
                        <div className="fade">
                            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--t0)", marginBottom: 18 }}>בסיס ידע והעלאת חומרים</div>

                            <div style={{ display: "flex", gap: 15, marginBottom: 24 }}>
                                {/* כרטיסיית העלאת ספר (PDF) לחילול AI */}
                                <div className="card" style={{ flex: 1, padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", border: "1px solid rgba(56,189,248,0.3)", background: "rgba(56,189,248,0.03)" }}>
                                    <BookOpen size={36} color="var(--cy)" style={{ marginBottom: 12 }} />
                                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--t0)", marginBottom: 6 }}>העלאת ספר או נוהל (PDF/TXT)</div>
                                    <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 20, lineHeight: 1.4 }}>העלה חומר עיוני לספרייה. לאחר מכן, ה-AI יוכל לנתח אותו ולחולל ממנו שאלות אוטומטית למבחן.</div>

                                    <button
                                        className="btn btn-primary"
                                        onClick={() => !aiLoading && !isUploadingDoc && aiFileInputRef.current?.click()}
                                        disabled={aiLoading || isUploadingDoc}
                                    >
                                        {isUploadingDoc ? <Loader2 className="spin" size={16} /> : <Upload size={16} />}
                                        {isUploadingDoc ? "מעלה מסמך לשרת..." : "העלה ספרייה חדשה"}
                                    </button>
                                    <input
                                        ref={aiFileInputRef}
                                        type="file"
                                        accept=".pdf,.txt"
                                        style={{ display: "none" }}
                                        onChange={e => {
                                            addLibraryDoc(e.target.files);
                                            if (aiFileInputRef.current) aiFileInputRef.current.value = "";
                                        }}
                                    />
                                </div>

                                {/* כרטיסיית העלאת CSV */}
                                <div className="card" style={{ flex: 1, padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", border: "1px solid var(--bdr)" }}>
                                    <FileText size={36} color="var(--t2)" style={{ marginBottom: 12 }} />
                                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--t0)", marginBottom: 6 }}>העלאת שאלות מוכנות (CSV)</div>
                                    <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 20, lineHeight: 1.4 }}>העלה בנק שאלות מוכן מראש שיצרת בקובץ אקסל, תוך שימוש בתבנית הנדרשת של המערכת.</div>

                                    <div style={{ display: "flex", gap: 10 }}>
                                        <button
                                            className="btn btn-ghost"
                                            style={{ background: "var(--s2)", border: "1px solid var(--bdr)" }}
                                            onClick={() => !aiLoading && !isUploadingDoc && fileInputRef.current?.click()}
                                            disabled={aiLoading || isUploadingDoc}
                                        >
                                            <Upload size={16} /> בחר קובץ CSV
                                        </button>
                                        <button className="btn btn-ghost" onClick={localDownloadTemplate}>
                                            <Download size={16} /> הורד תבנית
                                        </button>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv"
                                        style={{ display: "none" }}
                                        onChange={onCsvSelected}
                                    />
                                </div>
                            </div>

                            {uploadError && (
                                <div style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 8, padding: "12px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 6 }}>
                                    <XCircle size={16} color="var(--err)" />
                                    <span className="rb" style={{ fontSize: 13, color: "var(--err)" }}>{uploadError}</span>
                                </div>
                            )}

                            <div style={{ display: "flex", gap: 20, flexDirection: "column" }}>

                                <div>
                                    <div className="lbl" style={{ marginBottom: 12, fontSize: 14 }}>ספריית הדרכה - מסמכי מקור ({libraryDocs.length})</div>
                                    {libraryDocs.length === 0 ? (
                                        <div style={{ padding: "20px", background: "var(--s2)", borderRadius: 6, color: "var(--t2)", fontSize: 13, border: "1px dashed var(--bdr)", textAlign: "center" }}>
                                            אין מסמכים בספרייה. העלה קובץ PDF כדי שה-AI יוכל לייצר שאלות.
                                        </div>
                                    ) : (
                                        <div style={{ display: "grid", gap: 8 }}>
                                            {libraryDocs.map(d => (
                                                <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--s2)", border: "1px solid var(--bdr)", borderRadius: 6 }}>
                                                    <BookOpen size={18} color="var(--cy)" style={{ flexShrink: 0 }} />
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--t0)", marginBottom: 2 }}>{d.filename}</div>
                                                        <div style={{ fontSize: 12, color: "var(--t2)" }}>הועלה בתאריך {fmt(d.uploadedAt)}</div>
                                                    </div>
                                                    <button
                                                        className="btn btn-ghost"
                                                        style={{ fontSize: 12, gap: 6, color: "var(--cy)", padding: "6px 12px", border: "1px solid rgba(56,189,248,0.2)" }}
                                                        onClick={() => {
                                                            setGenConfig({ ...genConfig, docId: d.id, name: d.filename.replace(/\.(pdf|txt|md)$/i, "") + " - מבחן חדש" });
                                                            setIsGenPopupOpen(true);
                                                        }}
                                                        disabled={aiLoading || isUploadingDoc}
                                                    >
                                                        <Sparkles size={14} /> חולל מבחן
                                                    </button>
                                                    <button className="btn-icon" style={{ border: "none", color: "var(--err)", background: "rgba(248,113,113,0.08)", marginLeft: 8 }} onClick={() => deleteLibraryDoc(d.id)} disabled={aiLoading || isUploadingDoc}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginTop: 10 }}>
                                    <div className="lbl" style={{ marginBottom: 12, fontSize: 14 }}>מבחנים שזמינים לאימון במערכת ({uploadedSets.length})</div>
                                    {uploadedSets.length === 0 ? (
                                        <div style={{ padding: "20px", background: "var(--s2)", borderRadius: 6, color: "var(--t2)", fontSize: 13, border: "1px dashed var(--bdr)", textAlign: "center" }}>
                                            אין מבחנים במערכת. חולל מבחן מתוך מסמך או העלה בנק שאלות מוכן (CSV).
                                        </div>
                                    ) : (
                                        <div style={{ display: "grid", gap: 8 }}>
                                            {uploadedSets.map(s => (
                                                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "var(--s2)", border: "1px solid var(--bdr)", borderRadius: 6 }}>
                                                    <CheckCircle size={18} color="var(--ok)" style={{ flexShrink: 0 }} />
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--t0)", marginBottom: 2 }}>{s.title}</div>
                                                        <div style={{ fontSize: 12, color: "var(--t2)" }}>{s.description || "מבחן פעיל"} · בוצעו {done.filter(se => se.topicId === s.id).length} אימונים · נוצר בתאריך {fmt(s.uploadedAt)}</div>
                                                    </div>

                                                    {/* כפתור "התחל אימון" */}
                                                    <button
                                                        className="btn-icon"
                                                        style={{ border: "1px solid var(--bdr)", color: "var(--t0)", background: "var(--s1)", width: 34, height: 34 }}
                                                        onClick={() => { setSelectedTest && setSelectedTest(s); setScreen('training'); }}
                                                        title="התחל אימון במבחן זה"
                                                    >
                                                        <Play size={14} style={{ position: "relative", left: 1 }} />
                                                    </button>

                                                    {/* כפתור "צפה בשאלות" לאדמין */}
                                                    {user?.role === 'admin' && (
                                                        <button
                                                            className="btn-icon"
                                                            style={{ border: "1px solid rgba(56,189,248,0.3)", color: "var(--cy)", background: "rgba(56,189,248,0.1)", width: 34, height: 34 }}
                                                            onClick={() => setTestToView(s)}
                                                            title="צפה בשאלות ותשובות (Admin)"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                    )}

                                                    <button
                                                        className="btn-icon"
                                                        style={{ border: "none", color: "var(--err)", background: "rgba(248,113,113,0.08)", width: 34, height: 34, marginLeft: 4 }}
                                                        onClick={() => deleteSet(s.id)}
                                                        disabled={aiLoading || isUploadingDoc}
                                                        title="מחק מבחן"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* AI Generator Overlay */}
            {isGenPopupOpen && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.6)", zIndex: 99999,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backdropFilter: "blur(4px)"
                }}>
                    <div className="card fade" style={{
                        width: "100%", maxWidth: 480, padding: 24,
                        backgroundColor: "var(--bg)", borderRadius: 12,
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
                        border: "1px solid var(--bdr)"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                            <Wand2 size={18} color="var(--cy)" />
                            <div style={{ fontSize: 17, fontWeight: 600, color: "var(--t0)" }}>מחולל שאלות מתקדם</div>
                        </div>

                        {!aiLoading && (
                            <div style={{ fontSize: 13, color: "var(--t2)", marginBottom: 24, lineHeight: 1.5 }}>
                                בחר מסמך מהספרייה והגדר את מאפייני המבחן שברצונך לייצר. המערכת תפיק את השאלות בתוך מספר שניות.
                            </div>
                        )}

                        <div style={{ marginBottom: 16 }}>
                            <label className="lbl">מסמך מקור מהספרייה</label>
                            <select className="inp" value={genConfig.docId} onChange={e => setGenConfig({ ...genConfig, docId: e.target.value })} disabled={aiLoading}>
                                <option value="">-- בחר מסמך --</option>
                                {libraryDocs.map(d => <option key={d.id} value={d.id}>{d.filename}</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label className="lbl">כמות שאלות במבחן</label>
                            <select className="inp" value={genConfig.count} onChange={e => setGenConfig({ ...genConfig, count: e.target.value })} disabled={aiLoading}>
                                <option value="10">10 שאלות</option>
                                <option value="20">20 שאלות</option>
                                <option value="30">30 שאלות</option>
                                <option value="40">40 שאלות</option>
                                <option value="50">50 שאלות</option>
                            </select>
                        </div>

                        {/* תפריט סוג השאלות החדש */}
                        <div style={{ marginBottom: 16 }}>
                            <label className="lbl">סגנון שאלות (מתודולוגיה)</label>
                            <select className="inp" value={genConfig.qType} onChange={e => setGenConfig({ ...genConfig, qType: e.target.value })} disabled={aiLoading}>
                                <option value="raw">ידע תיאורטי יבש (Raw Knowledge)</option>
                                <option value="sbt">מבוסס תרחישים מבצעיים (SBT)</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label className="lbl">שם המבחן (יוצג לחניכים)</label>
                            <input className="inp" type="text" placeholder="לדוגמה: מבחן אמצע או פרק 8" value={genConfig.name} onChange={e => setGenConfig({ ...genConfig, name: e.target.value })} disabled={aiLoading} />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label className="lbl">הערות מיקוד ל-AI (אופציונלי)</label>
                            <textarea className="inp" style={{ resize: "none" }} rows="3" placeholder="למשל: התמקד רק בפרק הסיכונים והתעלם מהקדמות..." value={genConfig.notes} onChange={e => setGenConfig({ ...genConfig, notes: e.target.value })} disabled={aiLoading} />
                        </div>

                        {aiLoading && (
                            <div style={{ marginTop: 16, marginBottom: 24, padding: "16px", background: "rgba(56,189,248,0.1)", borderRadius: 8, border: "1px solid rgba(56,189,248,0.3)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "var(--cy)", marginBottom: 8 }}>
                                    <span><Loader2 className="spin" size={14} style={{ display: "inline", marginRight: 6, position: "relative", top: 2 }} /> מנתח את המסמך ומייצר שאלות...</span>
                                    <span style={{ fontFamily: "'IBM Plex Mono',monospace" }}>{Math.round(progress)}%</span>
                                </div>
                                <div className="prog-wrap" style={{ height: 8, background: "var(--s2)", borderRadius: 10, overflow: "hidden" }}>
                                    <div className="prog-fill" style={{ width: `${progress}%`, background: "var(--cy)", transition: "width 0.4s ease-out", height: "100%" }} />
                                </div>
                                <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 8, textAlign: "center" }}>התהליך עשוי לקחת כדקה, אנא המתן עד לסיום החילול.</div>
                            </div>
                        )}

                        <div style={{ display: "flex", gap: 12 }}>
                            <button className="btn btn-subtle" style={{ flex: 1 }} onClick={() => setIsGenPopupOpen(false)} disabled={aiLoading}>ביטול</button>
                            <button className="btn btn-primary" style={{ flex: 2, height: 40 }} onClick={async () => {
                                if (!genConfig.docId) { alert("יש לבחור מסמך מהספרייה"); return; }
                                // הוספת genConfig.qType לקריאה לפונקציה הוכנסה לכאן
                                const success = await processAiFile(genConfig.docId, { count: genConfig.count, notes: genConfig.notes, customTitle: genConfig.name, qType: genConfig.qType });
                                if (success) { setIsGenPopupOpen(false); setGenConfig({ docId: "", name: "", count: "20", notes: "", qType: "raw" }); }
                            }} disabled={aiLoading || !genConfig.docId}>
                                {aiLoading ? <><Loader2 className="spin" size={15} /> ממתין לשרת...</> : <><Sparkles size={15} /> חולל מבחן</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal לתצוגת שאלות (זמין לאדמין בלבד) */}
            {testToView && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.7)", zIndex: 99999,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backdropFilter: "blur(4px)", padding: 20
                }}>
                    <div className="card fade" style={{
                        width: "100%", maxWidth: 800, maxHeight: "85vh", display: "flex", flexDirection: "column",
                        backgroundColor: "var(--bg)", borderRadius: 12,
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                        border: "1px solid var(--bdr)", overflow: "hidden"
                    }}>
                        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--bdr)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--cy)", display: "flex", alignItems: "center", gap: 10 }}>
                                <BookOpen size={20} />
                                תצוגת שאלות: {testToView.title}
                            </div>
                            <button className="btn-icon" onClick={() => setTestToView(null)} style={{ border: "none", background: "transparent", color: "var(--t2)" }}>
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div style={{ padding: 24, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                            {testToView.questions?.map((q, index) => (
                                <div key={index} style={{ padding: 16, background: "var(--s1)", borderRadius: 8, border: "1px solid var(--bdr)" }}>
                                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--t0)", marginBottom: 12, direction: "ltr", textAlign: "left" }}>
                                        <span style={{ color: "var(--cy)", marginRight: 8, display: "inline-block" }}>{index + 1}.</span>
                                        {q.question}
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 24, direction: "ltr", textAlign: "left" }}>
                                        {q.options?.map((opt, i) => {
                                            const isCorrect = opt === q.correctAnswer;
                                            return (
                                                <div key={i} style={{
                                                    padding: "8px 12px", borderRadius: 6, fontSize: 13,
                                                    background: isCorrect ? "rgba(34,197,94,0.15)" : "var(--s2)",
                                                    color: isCorrect ? "#4ade80" : "var(--t1)",
                                                    border: `1px solid ${isCorrect ? "rgba(34,197,94,0.3)" : "transparent"}`
                                                }}>
                                                    {opt} {isCorrect && " ✓"}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
