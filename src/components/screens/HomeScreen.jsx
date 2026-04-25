import { useMemo, useState, useEffect, useRef } from "react";
import { Settings, LogOut, BookOpen, ChevronRight, FileText, Activity, Crosshair, Award, LifeBuoy, TrendingUp, Target, Search, Wand2, Lock, XCircle, Loader2, Sparkles, Upload, Clock, User, Trash2 } from "lucide-react";
import { Logo } from "../Logo";
import { DB, fmt, sc } from "../../lib/mockBackend";
import { useTableData } from "../../hooks/useTableData";

const SortableTH = ({ label, sortKey, config, requestSort, style }) => {
    const isSorted = config.key === sortKey;
    return (
        <th onClick={() => requestSort(sortKey)} style={{ cursor: "pointer", userSelect: "none", ...style }}>
            {label}
            <span style={{ fontSize: 10, color: isSorted ? "var(--cy)" : "transparent", display: "inline-block", marginLeft: 4, width: 12 }}>
                {isSorted ? (config.direction === 'asc' ? '▲' : '▼') : '▲'}
            </span>
        </th>
    );
};

export function HomeScreen({ user, setScreen, setUser, uploadedSets, startSession, done, allTopics, libraryDocs = [], processAiFile, aiLoading, addLibraryDoc, isUploadingDoc, deleteLibraryDoc, deleteSet }) {
    const fileInputRef = useRef(null);
    const myAllSessions = done.filter(s => s?.userId === user?.id);
    const myDone = myAllSessions.filter(s => s.status === "completed");
    const myIncomplete = myAllSessions.filter(s => s.status === "incomplete");
    const totalSessions = myDone.length;
    const avgScore = totalSessions > 0 ? Math.round(myDone.reduce((a, s) => a + s.score, 0) / totalSessions) : 0;
    const myHelps = DB.helpRequests.filter(h => h.userId === user?.id).length;

    const [diyModalOpen, setDiyModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [genConfig, setGenConfig] = useState({ name: "", count: "20", notes: "", qType: "raw" });
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let interval;
        if (aiLoading) {
            setProgress(Math.random() * 10 + 5);
            interval = setInterval(() => {
                setProgress(p => Math.min(p + Math.random() * 8, 98));
            }, 1500);
        } else {
            setProgress(100);
            const timer = setTimeout(() => setProgress(0), 500);
            return () => clearTimeout(timer);
        }
        return () => clearTimeout(interval);
    }, [aiLoading]);

    const processedHistory = useMemo(() => {
        return myDone.map(s => {
            const t = allTopics.find(t => t.id === s.topicId);
            return { ...s, topicName: t?.title || s.topicId };
        });
    }, [myDone, allTopics]);
    const historyTable = useTableData(processedHistory, { initialSortKey: 'startedAt', initialSortDir: 'desc' });

    const visibleDocs = useMemo(() => {
        const docs = libraryDocs || [];
        // כולם רואים את כל הספרים (ספרי אדמין + ספרים שהמשתמש עצמו העלה)
        return docs;
    }, [libraryDocs, user]);

    let rank = "מתלמד";
    let rankColor = "#94a3b8";
    if (totalSessions > 0) {
        if (avgScore >= 90 && totalSessions >= 3) { rank = "אלוף המאגר"; rankColor = "#f59e0b"; }
        else if (avgScore >= 75) { rank = "מתאמן מתקדם"; rankColor = "#3b82f6"; }
        else { rank = "מתאמן פעיל"; rankColor = "#10b981"; }
    }

    if (!user) return <div style={{ color: "white", padding: 20 }}>טוען נתוני משתמש...</div>;

    return (
        <>
            
            <div className="screen">
                <div className="hdr">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <Logo sz={32} />
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t0)" }}>Training Center</div>
                            <div className="lbl">{user?.name} · {user?.profession}</div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        {user?.role === "admin" && (
                            <button className="btn btn-ghost" style={{ gap: 6 }} onClick={() => setScreen("backoffice")}>
                                <Settings size={13} /> Back Office
                            </button>
                        )}
                        <button className="btn btn-ghost" style={{ gap: 6 }} onClick={() => {
                            setUser(null);
                            localStorage.removeItem("aipk_user");
                            setScreen("auth");
                        }}>
                            <LogOut size={13} /> יציאה
                        </button>
                    </div>
                </div>

                <div style={{ flex: 1, padding: "24px 20px" }}>

                    {/* ── דאשבורד משתמש מרהיב ── */}
                    {uploadedSets.length > 0 && (
                        <div style={{ marginBottom: 44 }}>
                            <div className="flex-resp">
                                <div>
                                    <div style={{ fontSize: 24, fontWeight: 700, color: "var(--t0)", marginBottom: 4 }}>שלום, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || "טייס"} 👋</div>
                                    <div style={{ fontSize: 13, color: "var(--t2)" }}>הנה סיכום הפעילות וההתקדמות שלך במערכת</div>
                                </div>
                                <div style={{
                                    padding: "8px 16px", borderRadius: 20, background: `color-mix(in srgb, ${rankColor} 15%, transparent)`,
                                    border: `1px solid color-mix(in srgb, ${rankColor} 30%, transparent)`,
                                    display: "flex", alignItems: "center", gap: 8, color: rankColor, fontWeight: 700, fontSize: 14,
                                    boxShadow: `0 4px 12px color-mix(in srgb, ${rankColor} 20%, transparent)`
                                }}>
                                    <Award size={18} />
                                    {rank}
                                </div>
                            </div>

                            <div className="dash-grid">
                                {/* ממוצע הצלחה */}
                                <div className="card card-hover" style={{ padding: 20, position: "relative", overflow: "hidden", background: "linear-gradient(135deg, rgba(34,197,94,0.05), rgba(34,197,94,0.01))" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>ממוצע הצלחה</div>
                                        <div style={{ padding: 8, borderRadius: 10, background: "rgba(34,197,94,0.1)", color: "#10b981" }}>
                                            <Crosshair size={18} />
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 32, fontWeight: 800, color: "var(--t0)" }}>{avgScore}%</div>
                                    <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 6 }}>ציון ממוצע של כל האימונים</div>
                                    <div style={{ position: "absolute", bottom: -20, right: -10, opacity: 0.05, transform: "rotate(-15deg)" }}><Crosshair size={100} /></div>
                                </div>

                                {/* השלמות */}
                                <div className="card card-hover" style={{ padding: 20, position: "relative", overflow: "hidden", background: "linear-gradient(135deg, rgba(56,189,248,0.05), rgba(56,189,248,0.01))" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>השלמות אימון</div>
                                        <div style={{ padding: 8, borderRadius: 10, background: "rgba(56,189,248,0.1)", color: "#38bdf8" }}>
                                            <Activity size={18} />
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 32, fontWeight: 800, color: "var(--t0)" }}>{totalSessions}</div>
                                    <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 6 }}>מבדקים שסוימו במלואם</div>
                                    <div style={{ position: "absolute", bottom: -20, right: -10, opacity: 0.05, transform: "rotate(-15deg)" }}><Activity size={100} /></div>
                                </div>

                                {/* מגמת פעילות */}
                                <div className="card card-hover" style={{ padding: 20, position: "relative", overflow: "hidden", background: "linear-gradient(135deg, rgba(236,72,153,0.05), rgba(236,72,153,0.01))" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>מגמת ציונים</div>
                                        <div style={{ padding: 8, borderRadius: 10, background: "rgba(236,72,153,0.1)", color: "#ec4899" }}>
                                            <TrendingUp size={18} />
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 32, fontWeight: 800, color: "var(--t0)" }}>{myDone.length > 0 ? myDone[myDone.length - 1].score + "%" : "—"}</div>
                                    <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 6 }}>ציון בסשן האחרון ביותר</div>
                                    <div style={{ position: "absolute", bottom: -20, right: -10, opacity: 0.04, transform: "rotate(-15deg)" }}><TrendingUp size={100} /></div>
                                </div>

                                {/* בקשות עזרה */}
                                <div className="card card-hover" style={{ padding: 20, position: "relative", overflow: "hidden", background: "linear-gradient(135deg, rgba(245,158,11,0.05), rgba(245,158,11,0.01))" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)" }}>בקשות עזרה</div>
                                        <div style={{ padding: 8, borderRadius: 10, background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                                            <LifeBuoy size={18} />
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 32, fontWeight: 800, color: "var(--t0)" }}>{myHelps}</div>
                                    <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 6 }}>שימוש ברמזים ואימותים השבוע</div>
                                    <div style={{ position: "absolute", bottom: -20, right: -10, opacity: 0.05, transform: "rotate(-15deg)" }}><LifeBuoy size={100} /></div>
                                </div>
                            </div>

                            {/* הפרדה ויזואלית עדינה */}
                            <div style={{ height: 1, background: "rgba(56,189,248,0.08)", margin: "36px 0 0 0", borderRadius: 2 }} />
                        </div>
                    )}

                    {/* ── ספרייה וניהול קבצים (תמיד מוצג) ── */}
                    <div className="panel" style={{ marginBottom: 36, background: "var(--s2)", border: "1px solid var(--s3)" }}>
                        <div className="flex-resp" style={{ marginBottom: 20 }}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                                    <BookOpen size={20} color="var(--t1)" />
                                    <div style={{ fontSize: 18, fontWeight: 600, color: "var(--t0)" }}>ספריית עזר לחזרה ועיון</div>
                                </div>
                                <div className="rb" style={{ fontSize: 13, color: "var(--t2)" }}>חומרי קריאה מקצועיים (PDF)</div>
                            </div>
                            <div style={{ display: "flex", gap: 10 }}>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    style={{ display: "none" }} 
                                    accept=".pdf,.txt" 
                                    onChange={(e) => addLibraryDoc(e.target.files)} 
                                />
                                <button 
                                    className="btn btn-subtle" 
                                    onClick={() => { if (user?.canGenerateTests) { fileInputRef.current?.click(); } else { alert("העלאת חומרים אישיים דורשת מנוי או אישור מנהל."); } }} 
                                    disabled={isUploadingDoc}
                                    style={{ display: "flex", gap: 8, alignItems: "center", ...(!user?.canGenerateTests && { opacity: 0.8, filter: "grayscale(0.5)" }) }}
                                >
                                    {isUploadingDoc ? <Loader2 size={15} className="spin" /> : (user?.canGenerateTests ? <Upload size={15} /> : <Lock size={15} />)}
                                    העלאת ספר
                                </button>
                                <button className="btn btn-primary" onClick={() => { if (user?.canGenerateTests) { setDiyModalOpen(true); } else { alert("יצירת מבדקים אישיים דורשת מנוי או אישור מנהל."); } }} style={{ display: "flex", gap: 8, alignItems: "center", ...(!user?.canGenerateTests && { opacity: 0.8, filter: "grayscale(0.5)" }) }}>
                                    {user?.canGenerateTests ? <Wand2 size={15} /> : <Lock size={15} />} צור לעצמך מבחן
                                </button>
                            </div>
                        </div>
                        <div className="topics-grid">
                            {visibleDocs.length === 0 ? (
                                <div style={{ gridColumn: "1/-1", padding: "20px", textAlign: "center", color: "var(--t3)", fontSize: 13, border: "1px dashed var(--bdr)", borderRadius: 8 }}>
                                    אין עדיין ספרים בספרייה האישית שלך. העלה קובץ PDF כדי להתחיל.
                                </div>
                            ) : visibleDocs.map(d => (
                                <div key={d.id} className="card card-hover" style={{ padding: "16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, position: "relative" }} onClick={() => window.open(d.fileUrl, '_blank')}>
                                    <div style={{ padding: 10, background: d.uploadedById ? "rgba(34, 197, 94, 0.1)" : "rgba(56, 189, 248, 0.1)", borderRadius: 8, color: d.uploadedById ? "#10b981" : "var(--cy)", flexShrink: 0 }}>
                                        <FileText size={20} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                            <div className="rb" style={{ fontSize: 14, fontWeight: 700, color: "var(--t0)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.filename}</div>
                                            {d.uploadedById === user?.id && (
                                                <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(34, 197, 94, 0.15)", color: "#10b981", fontWeight: 700, whiteSpace: "nowrap" }}>
                                                    העלאה שלי
                                                </span>
                                            )}
                                        </div>
                                        {d.uploadedById ? (
                                            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 12px" }}>
                                                <div style={{ fontSize: 11, color: "#f97316", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                                                    <User size={11} /> {d.uploadedByName || "משתמש"}
                                                </div>
                                                <div style={{ fontSize: 10, color: "var(--t3)", display: "flex", alignItems: "center", gap: 4 }}>
                                                    <Clock size={11} /> {new Date(d.uploadedAt).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: 11, color: "var(--t2)" }}>מסמך מערכת</div>
                                        )}
                                    </div>
                                    <button 
                                        className="btn-icon" 
                                        style={{ background: "rgba(56, 189, 248, 0.1)", borderRadius: 8, width: 32, height: 32 }}
                                        onClick={(e) => { e.stopPropagation(); window.open(d.fileUrl, '_blank'); }}
                                    >
                                        <ChevronRight size={16} color="var(--cy)" />
                                    </button>
                                    {d.uploadedById === user?.id && deleteLibraryDoc && (
                                        <button
                                            className="btn-icon"
                                            style={{ background: "rgba(248,113,113,0.08)", borderRadius: 8, width: 32, height: 32, border: "1px solid rgba(248,113,113,0.2)" }}
                                            onClick={(e) => { e.stopPropagation(); deleteLibraryDoc(d.id); }}
                                            title="מחק ספר"
                                        >
                                            <Trash2 size={14} color="#f87171" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {uploadedSets.length === 0 ? (
                        /* ── No files: show message ── */
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, minHeight: 240, textAlign: "center", background: "rgba(245,158,11,0.03)", borderRadius: 12, border: "1px dashed rgba(245,158,11,0.2)" }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                                <Target size={20} color="#f59e0b" />
                            </div>
                            <div className="rb" style={{ fontSize: 15, fontWeight: 600, color: "var(--t1)", marginBottom: 6 }}>אין מבדקים פעילים במאגר</div>
                            <div className="rb" style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, maxWidth: 300 }}>
                                העלה ספר למערכת ולאחר מכן לחץ על <b>"צור לעצמך מבחן"</b> כדי להתחיל להתאמן.
                            </div>
                        </div>
                    ) : (
                        /* ── Files exist: show topics ── */
                        <>

                            <div className="panel" style={{ background: "linear-gradient(180deg, rgba(56,189,248,0.03), var(--bg))", border: "1px solid var(--bdr)", marginBottom: 28 }}>
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                                        <Target size={24} color="var(--cy)" />
                                        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--t0)", letterSpacing: "-0.01em" }}>מוכנים לאימון? בחר מאגר שאלות</div>
                                    </div>
                                    <div className="rb" style={{ fontSize: 13, color: "var(--t2)", paddingRight: 34 }}>מעבר למבדק אקראי מתוך בחירת הנושא.</div>
                                </div>
                                <div className="topics-grid">
                                    {uploadedSets.map(t => {
                                        const mySess = DB.sessions.filter(s => s.userId === user?.id && s.topicId === t.id && s.status === "completed");
                                        const incSess = myIncomplete.find(s => s.topicId === t.id);
                                        const best = mySess.length ? Math.max(...mySess.map(s => s.score)) : null;
                                        // סימון כתום רק למבחנים שיצר משתמש רגיל (לא אדמין)
                                        const isMyTest = t.createdBy === user?.id && user?.role !== "admin";
                                        return (
                                            <div key={t.id} className="card card-hover" style={{ padding: "18px", cursor: "pointer", position: "relative", border: incSess ? "1px solid rgba(234,179,8,0.4)" : (isMyTest ? "1px solid rgba(249,115,22,0.35)" : undefined), background: incSess ? "linear-gradient(135deg, rgba(234,179,8,0.07), rgba(234,179,8,0.02))" : (isMyTest ? "linear-gradient(135deg, rgba(249,115,22,0.06), rgba(249,115,22,0.02))" : undefined) }} onClick={() => startSession(t)}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                        <span className="tag tag-cyan" style={{ fontSize: 9 }}>{t.filename}</span>
                                                        {incSess && (
                                                            <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 20, background: "rgba(234,179,8,0.15)", color: "#eab308", fontWeight: 700, border: "1px solid rgba(234,179,8,0.35)", whiteSpace: "nowrap" }}>
                                                                ⏸ לא הושלם · {incSess.answeredCount || 0}/{incSess.totalQuestions || t.questions.length}
                                                            </span>
                                                        )}
                                                        {!incSess && isMyTest && (
                                                            <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 20, background: "rgba(249,115,22,0.15)", color: "#f97316", fontWeight: 700, border: "1px solid rgba(249,115,22,0.3)", whiteSpace: "nowrap" }}>
                                                                ✏️ יצרתי אני
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                        {best !== null && <span className="tag tag-cyan" style={{ fontSize: 11, fontWeight: 700 }}>{best}%</span>}
                                                        {isMyTest && deleteSet && (
                                                            <button
                                                                className="btn-icon"
                                                                style={{ background: "rgba(248,113,113,0.08)", borderRadius: 6, width: 26, height: 26, border: "1px solid rgba(248,113,113,0.2)", flexShrink: 0 }}
                                                                onClick={(e) => { e.stopPropagation(); deleteSet(t.id); }}
                                                                title="מחק מבחן"
                                                            >
                                                                <Trash2 size={12} color="#f87171" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="rb" style={{ fontSize: 14, fontWeight: 600, color: "var(--t0)", marginBottom: 6, lineHeight: 1.3 }}>{t.title}</div>
                                                <div className="rb" style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.55, marginBottom: 14 }}>{t.description}</div>
                                                <div className="flex-resp">
                                                    <span style={{ fontSize: 11, color: "var(--t3)" }}>{t.questions.length} שאלות</span>
                                                    <ChevronRight size={14} color={incSess ? "#eab308" : (isMyTest ? "#f97316" : "var(--t3)")} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {done.filter(s => s.userId === user?.id).length > 0 && (
                                <div style={{ maxWidth: 820 }}>
                                    <div style={{ height: 1, background: "rgba(56,189,248,0.08)", margin: "40px 0 24px 0", borderRadius: 2 }} />
                                    <div className="flex-resp" style={{ marginBottom: 14 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 0 }}>
                                            <Activity size={16} color="var(--t2)" />
                                            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)" }}>יומן אימונים היסטורי</div>
                                        </div>
                                        <div style={{ position: "relative", width: 220, maxWidth: "100%" }}>
                                            <Search size={14} style={{ position: "absolute", right: 10, top: 10, color: "var(--t2)" }} />
                                            <input type="text" placeholder="חיפוש..." value={historyTable.searchQuery} onChange={e => historyTable.setSearchQuery(e.target.value)} style={{ background: "var(--s2)", border: "1px solid var(--bdr)", borderRadius: 6, padding: "7px 10px 7px 30px", fontSize: 13, color: "var(--t0)", width: "100%" }} />
                                        </div>
                                    </div>
                                    {historyTable.data.length === 0 ? <div className="rb" style={{ color: "var(--t2)", fontSize: 12 }}>אין נתונים התואמים לחיפוש</div> :
                                        <div className="card" style={{ overflow: "hidden" }}>
                                            <div className="table-wrap">
                                                <table>
                                                    <thead><tr>
                                                        <SortableTH label="נושא" sortKey="topicName" config={historyTable.sortConfig} requestSort={historyTable.requestSort} />
                                                        <SortableTH label="ציון" sortKey="score" config={historyTable.sortConfig} requestSort={historyTable.requestSort} />
                                                        <SortableTH label="ניסיונות" sortKey="attemptCount" config={historyTable.sortConfig} requestSort={historyTable.requestSort} />
                                                        <SortableTH label="תאריך" sortKey="startedAt" config={historyTable.sortConfig} requestSort={historyTable.requestSort} />
                                                    </tr></thead>
                                                    <tbody>
                                                        {historyTable.data.map(s => {
                                                            const tSelectedTitle = s.topicName;
                                                            return (
                                                                <tr key={s.id}>
                                                                    <td data-label="נושא" className="rb">{tSelectedTitle}</td>
                                                                    <td data-label="ציון"><span style={{ fontWeight: 600, color: sc(s.score) }}>{s.score}%</span></td>
                                                                    <td data-label="ניסיונות" style={{ color: "var(--t2)" }}>{s.attemptCount}</td>
                                                                    <td data-label="תאריך" style={{ color: "var(--t2)", fontSize: 12 }}>{fmt(s.startedAt)}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            {diyModalOpen && (
                <div className="modal-bg" style={{ zIndex: 9999 }}>
                    <div className="modal-box" style={{ maxWidth: 500 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <Wand2 size={24} color="var(--cy)" />
                                <div style={{ fontSize: 20, fontWeight: 700, color: "var(--t0)" }}>מחולל מבדק מהיר מתוך ספר</div>
                            </div>
                            <button className="btn-icon" onClick={() => setDiyModalOpen(false)} disabled={aiLoading}>
                                <XCircle size={22} color="var(--t2)" />
                            </button>
                        </div>

                        {!aiLoading && (
                            <div className="rb" style={{ fontSize: 13, color: "var(--t2)", marginBottom: 24, lineHeight: 1.5 }}>
                                בחר מסמך מהספרייה והגדר את מאפייני המבחן שברצונך לייצר. המערכת תפיק את השאלות בתוך מספר שניות.
                            </div>
                        )}

                        <div style={{ marginBottom: 16 }}>
                            <label className="lbl">מסמך ללימוד</label>
                            <select className="inp" value={selectedDoc || ""} onChange={e => setSelectedDoc(e.target.value)} disabled={aiLoading}>
                                <option value="">-- יש לבחור מסמך --</option>
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
                            <label className="lbl">סגנון שאלות (מתודולוגיה)</label>
                            <select className="inp" value={genConfig.qType} onChange={e => setGenConfig({ ...genConfig, qType: e.target.value })} disabled={aiLoading}>
                                <option value="raw">ידע תיאורטי יבש (Raw Knowledge)</option>
                                <option value="sbt">מבוסס תרחישים מבצעיים (SBT)</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label className="lbl">שם המבחן (אישי)</label>
                            <input className="inp" type="text" placeholder="לדוגמה: תרגול אישי על פרק 8..." value={genConfig.name} onChange={e => setGenConfig({ ...genConfig, name: e.target.value })} disabled={aiLoading} />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label className="lbl">הערות מיקוד ל-AI (אופציונלי)</label>
                            <textarea className="inp" style={{ resize: "none" }} rows="3" placeholder="למשל: התמקד רק בפרק הסיכונים..." value={genConfig.notes} onChange={e => setGenConfig({ ...genConfig, notes: e.target.value })} disabled={aiLoading} />
                        </div>

                        {aiLoading && (
                            <div style={{ marginTop: 16, marginBottom: 24, padding: "16px", background: "rgba(56,189,248,0.1)", borderRadius: 8, border: "1px solid rgba(56,189,248,0.3)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, color: "var(--cy)", marginBottom: 8 }}>
                                    <span><Loader2 className="spin" size={14} style={{ display: "inline", marginRight: 6, position: "relative", top: 2 }} /> מנתח את המסמך ומייצר מבדק...</span>
                                    <span style={{ fontFamily: "'IBM Plex Mono',monospace" }}>{Math.round(progress)}%</span>
                                </div>
                                <div className="prog-wrap" style={{ height: 8, background: "var(--s2)", borderRadius: 10, overflow: "hidden" }}>
                                    <div className="prog-fill" style={{ width: `${progress}%`, background: "var(--cy)", transition: "width 0.4s ease-out", height: "100%" }} />
                                </div>
                                <div style={{ fontSize: 11, color: "var(--t2)", marginTop: 8, textAlign: "center" }}>אנו מרכיבים עבורך מבדק מותאם אישית (התהליך עשוי לקחת כדקה).</div>
                            </div>
                        )}

                        <div style={{ display: "flex", gap: 12 }}>
                            <button className="btn btn-subtle" style={{ flex: 1 }} onClick={() => setDiyModalOpen(false)} disabled={aiLoading}>ביטול</button>
                            <button className="btn btn-primary" style={{ flex: 2, height: 40 }} onClick={async () => {
                                if (!selectedDoc) { alert("יש לבחור עזר מהספרייה"); return; }
                                const success = await processAiFile(selectedDoc, { count: genConfig.count, notes: genConfig.notes, customTitle: genConfig.name || "תרגול אישי עצמאי", qType: genConfig.qType, createdBy: user?.id, creatorName: user?.name || user?.email });
                                if (success) { setDiyModalOpen(false); setGenConfig({ name: "", count: "20", notes: "", qType: "raw" }); setSelectedDoc(null); }
                            }} disabled={aiLoading || !selectedDoc}>
                                {aiLoading ? <><Loader2 className="spin" size={15} /> ממתין לשרת...</> : <><Sparkles size={15} /> חולל מבדק עכשיו</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
