import { useState } from "react";
import { BarChart2, Users, Clock, FileText, BookOpen, Database, ArrowLeft, MapPin, Upload, Download, FolderOpen, XCircle, CheckCircle, Trash2, AlertTriangle, Wand2, Sparkles } from "lucide-react";
import { DB, sc, fmt } from "../../lib/mockBackend";
import { Logo } from "../Logo";
import { Popup } from "../Popup";

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
    uploadDrag,
    setUploadDrag,
    handleDrop,
    handleFileInput,
    uploadError,
    deleteSet,
    downloadTemplate,
    pops
}) {
    const [uploadMode, setUploadMode] = useState("csv");
    const [isGenPopupOpen, setIsGenPopupOpen] = useState(false);
    const [genConfig, setGenConfig] = useState({ docId: "", name: "", count: "20", notes: "" });

    const trainees = DB.users.filter(u => u.role === "trainee");

    const handleAiDrop = e => {
        e.preventDefault(); setUploadDrag(false);
        addLibraryDoc(e.dataTransfer.files);
    };
    const tabs = [
        { id: "overview", label: "סקירה", Icon: BarChart2 },
        { id: "users", label: "משתמשים", Icon: Users },
        { id: "sessions", label: "סשנים", Icon: Clock },
        { id: "logs", label: "לוגים", Icon: FileText },
        { id: "kb", label: "ידע", Icon: BookOpen },
        { id: "database", label: "DB", Icon: Database },
    ];
    const dbTables = { users: DB.users, sessions: DB.sessions, logs: DB.logs, debriefs: DB.debriefs, uploadedSets: DB.uploadedSets, helpRequests: DB.helpRequests };

    return (
        <>
            <div className="mock-badge">PROTOTYPE</div>
            <Popup {...pops} />
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
                            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--t0)", marginBottom: 18 }}>משתמשים</div>
                            <div className="card" style={{ overflow: "hidden" }}>
                                <table>
                                    <thead><tr><th>שם</th><th>אימייל</th><th>תפקיד</th><th>דרגה</th><th>סשנים</th><th>ממוצע</th><th>הצטרף</th></tr></thead>
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
                        </div >
                    )
                    }

                    {/* LOGS */}
                    {
                        boTab === "logs" && (
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
                                {/* Help requests table */}
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
                            </div >
                        )
                    }

                    {/* KNOWLEDGE BASE + UPLOAD */}
                    {
                        boTab === "kb" && (
                            <div className="fade">
                                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--t0)", marginBottom: 18 }}>בסיס ידע והעלאת שאלות</div>

                                {/* ── UPLOAD SECTION ── */}
                                <div className="card" style={{ padding: "20px", marginBottom: 24, borderColor: "rgba(56,189,248,0.25)" }}>
                                    <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                                        <button className={`btn ${uploadMode === "csv" ? "btn-primary" : "btn-ghost"}`} style={{ flex: 1 }} onClick={() => setUploadMode("csv")} disabled={aiLoading}>
                                            <Upload size={14} /> קובץ CSV מתבנית
                                        </button>
                                        <button className={`btn ${uploadMode === "ai" ? "btn-primary" : "btn-ghost"}`} style={{ flex: 1, border: uploadMode !== "ai" ? "1px solid var(--cy2)" : "none", color: uploadMode !== "ai" ? "var(--cy)" : "#050d18" }} onClick={() => setUploadMode("ai")} disabled={aiLoading}>
                                            <Wand2 size={14} /> חולל אוטומטית בעזרת AI
                                        </button>
                                    </div>

                                    {uploadMode === "csv" ? (
                                        <>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <Upload size={14} color="var(--cy)" />
                                                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t0)" }}>העלאת שאלות מוכנות</span>
                                                </div>
                                                <button className="btn btn-ghost" style={{ fontSize: 11, gap: 6 }} onClick={downloadTemplate}>
                                                    <Download size={12} /> הורד תבנית
                                                </button>
                                            </div>

                                            {/* Format note */}
                                            <div style={{ background: "var(--s2)", border: "1px solid var(--bdr)", borderRadius: 6, padding: "10px 14px", marginBottom: 14 }}>
                                                <div className="lbl" style={{ marginBottom: 6 }}>פורמט קובץ CSV נדרש</div>
                                                <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "var(--t2)", lineHeight: 1.7 }}>
                                                    עמודות חובה: <span style={{ color: "var(--cy)" }}>נושא</span>, <span style={{ color: "var(--cy)" }}>שאלה</span>, <span style={{ color: "var(--cy)" }}>תשובה</span><br />
                                                    עמודות אופציונליות: <span style={{ color: "var(--t3)" }}>ציטוט</span>, <span style={{ color: "var(--t3)" }}>סעיף</span><br />
                                                    קידוד: UTF-8 עם BOM, הפרדה בפסיקים
                                                </div>
                                            </div>

                                            {/* Drop zone */}
                                            <div
                                                className={`upload-zone ${uploadDrag ? "drag" : ""}`}
                                                onClick={() => fileInputRef.current?.click()}
                                                onDragOver={e => { e.preventDefault(); setUploadDrag(true); }}
                                                onDragLeave={() => setUploadDrag(false)}
                                                onDrop={handleDrop}
                                            >
                                                <FolderOpen size={24} color="var(--cy)" style={{ marginBottom: 8, opacity: 0.7 }} />
                                                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--t1)", marginBottom: 4 }}>גרור קבצי CSV לכאן או לחץ לבחירה</div>
                                                <div style={{ fontSize: 11, color: "var(--t3)" }}>תומך ב-CSV בלבד · ניתן לבחור מספר קבצים ביחד</div>
                                                <input ref={fileInputRef} type="file" multiple accept=".csv,.txt" style={{ display: "none" }} onChange={handleFileInput} />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <Wand2 size={14} color="var(--cy)" />
                                                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t0)" }}>מחולל המבחנים והאימונים</span>
                                                </div>
                                                <button className="btn btn-primary" onClick={() => setIsGenPopupOpen(true)} disabled={libraryDocs.length === 0}>
                                                    <Sparkles size={14} /> פתח מחולל שאלות
                                                </button>
                                            </div>
                                            <div style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 6, padding: "12px", marginBottom: 16, fontSize: 12, color: "var(--t1)", lineHeight: 1.6 }}>
                                                {libraryDocs.length === 0 ? "כדי לחולל שאלות, עליך להעלות תחילה מסמך מקור לספריית ההדרכה למטה." : "בחר 'פתח מחולל שאלות' כדי ליצור מבחן מהמסמכים שבספרייה על בסיס הגדרותיך, או העלה מסמכים נוספים לספרייה."}
                                            </div>

                                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", marginBottom: 10 }}>ספריית הדרכה ({libraryDocs.length} מסמכים)</div>
                                            {libraryDocs.length > 0 && (
                                                <div style={{ marginBottom: 16 }}>
                                                    {libraryDocs.map(d => (
                                                        <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--s2)", border: "1px solid var(--bdr)", borderRadius: 6, marginBottom: 8 }}>
                                                            <BookOpen size={14} color="var(--cy)" style={{ flexShrink: 0 }} />
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--t0)", marginBottom: 1 }}>{d.filename}</div>
                                                                <div style={{ fontSize: 11, color: "var(--t2)" }}>הועלה {fmt(d.uploadedAt)}</div>
                                                            </div>
                                                            <button className="btn-icon" style={{ border: "none", color: "var(--err)", background: "rgba(248,113,113,0.08)" }} onClick={() => deleteLibraryDoc(d.id)}>
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div
                                                className={`upload-zone ${uploadDrag ? "drag" : ""}`}
                                                onClick={() => !aiLoading && aiFileInputRef.current?.click()}
                                                onDragOver={e => { e.preventDefault(); setUploadDrag(true); }}
                                                onDragLeave={() => setUploadDrag(false)}
                                                onDrop={handleAiDrop}
                                            >
                                                <FileText size={22} color="var(--cy)" style={{ marginBottom: 8, opacity: 0.7 }} />
                                                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--t1)", marginBottom: 3 }}>הוסף מסמך חדש לספרייה (PDF / TXT)</div>
                                                <input ref={aiFileInputRef} type="file" multiple accept=".pdf,.txt" style={{ display: "none" }} onChange={e => addLibraryDoc(e.target.files)} />
                                            </div>
                                        </>
                                    )}

                                    {uploadError && (
                                        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 6 }}>
                                            <XCircle size={13} color="var(--err)" />
                                            <span className="rb" style={{ fontSize: 12, color: "var(--err)" }}>{uploadError}</span>
                                        </div>
                                    )}

                                    {/* Uploaded sets list */}
                                    {uploadedSets.length > 0 && (
                                        <div style={{ marginTop: 14 }}>
                                            <div className="lbl" style={{ marginBottom: 10 }}>קבצים שהועלו ({uploadedSets.length})</div>
                                            {uploadedSets.map(s => (
                                                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--s2)", border: "1px solid var(--bdr)", borderRadius: 6, marginBottom: 8 }}>
                                                    <CheckCircle size={14} color="var(--ok)" style={{ flexShrink: 0 }} />
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--t0)", marginBottom: 1 }}>{s.title}</div>
                                                        <div style={{ fontSize: 11, color: "var(--t2)" }}>{s.description} · הועלה {fmt(s.uploadedAt)}</div>
                                                    </div>
                                                    <button className="btn-icon" style={{ border: "none", color: "var(--err)", background: "rgba(248,113,113,0.08)" }} onClick={() => deleteSet(s.id)}>
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Uploaded sets preview */}
                                {
                                    uploadedSets.length > 0 ? (
                                        <>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", margin: "22px 0 14px" }}>שאלות שהועלו</div>
                                            {uploadedSets.map(t => (
                                                <div key={t.id} className="card" style={{ marginBottom: 12, borderColor: "rgba(251,191,36,0.2)" }}>
                                                    <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--bdr)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                        <div>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                                                                <span className="tag tag-warn" style={{ fontSize: 9 }}><Upload size={8} /> UPLOADED</span>
                                                                <span style={{ fontSize: 11, color: "var(--t3)", fontFamily: "'IBM Plex Mono',monospace" }}>{t.filename}</span>
                                                            </div>
                                                            <div className="rb" style={{ fontSize: 14, fontWeight: 600, color: "var(--t0)" }}>{t.title}</div>
                                                        </div>
                                                        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
                                                            <span className="tag tag-warn">{t.questions.length} שאלות</span>
                                                            <span className="tag tag-cyan">{t.chapters.length} נושאים</span>
                                                            <button className="btn-icon" style={{ border: "none", color: "var(--err)", background: "rgba(248,113,113,0.08)" }} onClick={() => deleteSet(t.id)}>
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                                                        {t.questions.slice(0, 3).map((q, qi) => {
                                                            const ch = t.chapters.find(c => c.id === q.chapterId);
                                                            return (
                                                                <div key={q.id} style={{ background: "var(--s2)", border: "1px solid var(--bdr)", borderRadius: 6, padding: "10px 14px" }}>
                                                                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                                                                        <div className="rb" style={{ fontSize: 13, color: "var(--t0)", flex: 1 }}>{qi + 1}. {q.question}</div>
                                                                        {ch && <span className="tag tag-warn" style={{ flexShrink: 0, fontSize: 10 }}>{ch.title}</span>}
                                                                    </div>
                                                                    <div className="rb" style={{ fontSize: 12, color: "var(--t2)", borderTop: "1px solid var(--bdr)", paddingTop: 7 }}>{q.answer}</div>
                                                                    {q.citation && <div style={{ fontSize: 10, color: "var(--t3)", fontFamily: "'IBM Plex Mono',monospace", marginTop: 5 }}>📎 {q.citation}{q.section ? ` · סעיף ${q.section}` : ""}</div>}
                                                                </div>
                                                            );
                                                        })}
                                                        {t.questions.length > 3 && (
                                                            <div style={{ fontSize: 11, color: "var(--t3)", textAlign: "center", padding: "6px 0" }}>
                                                                + עוד {t.questions.length - 3} שאלות
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "var(--s2)", border: "1px solid var(--bdr)", borderRadius: 6, marginTop: 16 }}>
                                            <AlertTriangle size={14} color="var(--t3)" />
                                            <span className="rb" style={{ fontSize: 13, color: "var(--t2)" }}>אין קבצים שהועלו — השתמש בטופס ההעלאה למעלה</span>
                                        </div>
                                    )
                                }
                            </div >
                        )
                    }

                    {/* DATABASE */}
                    {
                        boTab === "database" && (
                            <div className="fade">
                                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--t0)", marginBottom: 4 }}>Database Viewer</div>
                                <div className="rb" style={{ fontSize: 12, color: "var(--t2)", marginBottom: 18 }}>In-Memory DB — מתאפס בכל רענון. הנתונים מוצגים בזמן אמת.</div>
                                <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                                    {Object.keys(dbTables).map(k => (
                                        <button key={k} className={`btn ${dbTable === k ? "btn-primary" : "btn-ghost"}`} style={{ fontSize: 11, padding: "6px 14px" }} onClick={() => setDbTable(k)}>
                                            {k} ({dbTables[k].length})
                                        </button>
                                    ))}
                                </div>
                                <div className="card" style={{ padding: "16px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                        <Database size={13} color="var(--warn)" />
                                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--warn)", fontFamily: "'IBM Plex Mono',monospace" }}>
                                            {dbTable.toUpperCase()} — {dbTables[dbTable].length} records
                                        </span>
                                    </div>
                                    <pre style={{ fontSize: 11, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 520, overflowY: "auto", fontFamily: "'IBM Plex Mono',monospace" }}>
                                        {JSON.stringify(dbTables[dbTable], null, 2).split("\n").map((line, i) => {
                                            const isStr = /"[^"]+":(\s*)"/.test(line);
                                            const isNum = /"[^"]+":(\s*)(\d|true|false|null)/.test(line);
                                            const isKey = /"[^"]+":/.test(line) && !isStr && !isNum;
                                            const color = isStr ? "var(--ok)" : isNum ? "var(--warn)" : isKey ? "var(--cy)" : "var(--t2)";
                                            return <span key={i} style={{ color }}>{line}{"\n"}</span>;
                                        })}
                                    </pre>
                                </div>
                            </div >
                        )
                    }

                </div >
            </div>

            {/* AI Generator Popup */}
            {isGenPopupOpen && (
                <Popup isOpen={isGenPopupOpen} onClose={() => !aiLoading && setIsGenPopupOpen(false)}>
                    <div style={{ padding: "8px 4px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                            <Wand2 size={18} color="var(--cy)" />
                            <div style={{ fontSize: 17, fontWeight: 600, color: "var(--t0)" }}>מחולל שאלות מתקדם</div>
                        </div>
                        <div style={{ fontSize: 13, color: "var(--t2)", marginBottom: 24, lineHeight: 1.5 }}>בחר מסמך מהספרייה והגדר את מאפייני המבחן שברצונך לייצר. המערכת תפיק את השאלות בתוך מספר שניות.</div>

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

                        <div style={{ marginBottom: 16 }}>
                            <label className="lbl">שם המבחן (יוצג לחניכים)</label>
                            <input className="inp" type="text" placeholder="לדוגמה: מבחן אמצע או פרק 8" value={genConfig.name} onChange={e => setGenConfig({ ...genConfig, name: e.target.value })} disabled={aiLoading} />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label className="lbl">הערות מיקוד ל-AI (אופציונלי)</label>
                            <textarea className="inp" style={{ resize: "none" }} rows="3" placeholder="למשל: התמקד רק בפרק הסיכונים והתעלם מהקדמות..." value={genConfig.notes} onChange={e => setGenConfig({ ...genConfig, notes: e.target.value })} disabled={aiLoading} />
                        </div>

                        {uploadError && (
                            <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8, padding: "10px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 6 }}>
                                <XCircle size={14} color="var(--err)" />
                                <span className="rb" style={{ fontSize: 13, color: "var(--err)" }}>{uploadError}</span>
                            </div>
                        )}

                        <div style={{ display: "flex", gap: 12 }}>
                            <button className="btn btn-subtle" style={{ flex: 1 }} onClick={() => setIsGenPopupOpen(false)} disabled={aiLoading}>ביטול</button>
                            <button className="btn btn-primary" style={{ flex: 2, height: 40 }} onClick={async () => {
                                if (!genConfig.docId) { alert("יש לבחור מסמך מהספרייה"); return; }
                                const success = await processAiFile(genConfig.docId, { count: genConfig.count, notes: genConfig.notes, customTitle: genConfig.name });
                                if (success) { setIsGenPopupOpen(false); setGenConfig({ docId: "", name: "", count: "20", notes: "" }); }
                            }} disabled={aiLoading || !genConfig.docId}>
                                {aiLoading ? <><div className="spin border-cyan" style={{ width: 14, height: 14 }} /> ממתין לשרת... (יכול לקחת דקה)</> : <><Sparkles size={15} /> חולל מבחן</>}
                            </button>
                        </div>
                    </div>
                </Popup>
            )}
        </>
    );
}
