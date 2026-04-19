import { Settings, LogOut, BookOpen, ChevronRight, FileText, Activity, Crosshair, Award, LifeBuoy, TrendingUp, Target } from "lucide-react";
import { Logo } from "../Logo";
import { DB, fmt, sc } from "../../lib/mockBackend";

export function HomeScreen({ user, setScreen, setUser, uploadedSets, startSession, done, allTopics, libraryDocs = [] }) {
    const myDone = done.filter(s => s.userId === user?.id);
    const totalSessions = myDone.length;
    const avgScore = totalSessions > 0 ? Math.round(myDone.reduce((a, s) => a + s.score, 0) / totalSessions) : 0;
    const myHelps = DB.helpRequests.filter(h => h.userId === user?.id).length;

    let rank = "מתלמד";
    let rankColor = "#94a3b8";
    if (totalSessions > 0) {
        if (avgScore >= 90 && totalSessions >= 3) { rank = "אלוף המאגר"; rankColor = "#f59e0b"; }
        else if (avgScore >= 75) { rank = "מתאמן מתקדם"; rankColor = "#3b82f6"; }
        else { rank = "מתאמן פעיל"; rankColor = "#10b981"; }
    }

    return (
        <>
            <div className="mock-badge">PROTOTYPE</div>
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
                        <button className="btn btn-ghost" style={{ gap: 6 }} onClick={() => { setUser(null); setScreen("auth"); }}>
                            <LogOut size={13} /> יציאה
                        </button>
                    </div>
                </div>

                <div className="fade" style={{ flex: 1, padding: "24px 20px" }}>

                    {/* ── דאשבורד משתמש מרהיב ── */}
                    {uploadedSets.length > 0 && (
                        <div style={{ marginBottom: 44 }}>
                            <div className="flex-resp">
                                <div>
                                    <div style={{ fontSize: 24, fontWeight: 700, color: "var(--t0)", marginBottom: 4 }}>שלום, {user?.name.split(' ')[0]} 👋</div>
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

                    {uploadedSets.length === 0 ? (
                        /* ── No files: show message ── */
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, minHeight: 340, textAlign: "center" }}>
                            <div style={{ width: 52, height: 52, borderRadius: 12, background: "var(--s2)", border: "1px solid var(--bdr)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                                <BookOpen size={22} color="var(--t3)" />
                            </div>
                            <div className="rb" style={{ fontSize: 16, fontWeight: 600, color: "var(--t1)", marginBottom: 8 }}>אין מאגר שאלות פעיל</div>
                            <div className="rb" style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.7, maxWidth: 320 }}>
                                טרם הועלו שאלות לאימון.<br />
                                אנא פנה למנהל המערכת על מנת להפעיל את המאגר.
                            </div>
                        </div>
                    ) : (
                        /* ── Files exist: show topics ── */
                        <>
                            {libraryDocs?.length > 0 && (
                                <div style={{ marginBottom: 36, padding: "24px", background: "var(--s2)", borderRadius: "16px", border: "1px solid var(--s3)" }}>
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                                            <BookOpen size={20} color="var(--t1)" />
                                            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--t0)" }}>ספריית עזר לחזרה ועיון</div>
                                        </div>
                                        <div className="rb" style={{ fontSize: 13, color: "var(--t2)" }}>חומרי קריאה מקצועיים (PDF)</div>
                                    </div>
                                    <div className="topics-grid">
                                        {libraryDocs.map(d => (
                                            <div key={d.id} className="card card-hover" style={{ padding: "16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }} onClick={() => window.open(d.fileUrl, '_blank')}>
                                                <div style={{ padding: 10, background: "rgba(56,189,248,0.1)", borderRadius: 8, color: "var(--cy)", flexShrink: 0 }}>
                                                    <FileText size={20} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div className="rb" style={{ fontSize: 14, fontWeight: 600, color: "var(--t0)", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.filename}</div>
                                                    <div style={{ fontSize: 11, color: "var(--t2)" }}>מסמך קריאה</div>
                                                </div>
                                                <ChevronRight size={14} color="var(--t3)" style={{ flexShrink: 0 }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div style={{ padding: "24px", background: "linear-gradient(180deg, rgba(56,189,248,0.03), var(--bg))", border: "1px solid var(--bdr)", borderRadius: "16px", marginBottom: 28 }}>
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
                                        const best = mySess.length ? Math.max(...mySess.map(s => s.score)) : null;
                                        return (
                                            <div key={t.id} className="card card-hover" style={{ padding: "18px", cursor: "pointer" }} onClick={() => startSession(t)}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                                    <span className="tag tag-cyan" style={{ fontSize: 9 }}>{t.filename}</span>
                                                    {best !== null && <span className="tag tag-cyan" style={{ fontSize: 11, fontWeight: 700 }}>{best}%</span>}
                                                </div>
                                                <div className="rb" style={{ fontSize: 14, fontWeight: 600, color: "var(--t0)", marginBottom: 6, lineHeight: 1.3 }}>{t.title}</div>
                                                <div className="rb" style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.55, marginBottom: 14 }}>{t.description}</div>
                                                <div className="flex-resp">
                                                    <span style={{ fontSize: 11, color: "var(--t3)" }}>{t.questions.length} שאלות</span>
                                                    <ChevronRight size={14} color="var(--t3)" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {done.filter(s => s.userId === user?.id).length > 0 && (
                                <div style={{ maxWidth: 820 }}>
                                    <div style={{ height: 1, background: "rgba(56,189,248,0.08)", margin: "40px 0 24px 0", borderRadius: 2 }} />
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                                        <Activity size={16} color="var(--t2)" />
                                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--t1)" }}>יומן אימונים היסטורי</div>
                                    </div>
                                    <div className="card" style={{ overflow: "hidden" }}>
                                        <div className="table-wrap">
                                            <table>
                                                <thead><tr><th>נושא</th><th>ציון</th><th>ניסיונות</th><th>תאריך</th></tr></thead>
                                                <tbody>
                                                    {done.filter(s => s.userId === user?.id).slice(-5).reverse().map(s => {
                                                        const t = allTopics.find(t => t.id === s.topicId);
                                                        return (
                                                            <tr key={s.id}>
                                                                <td className="rb">{t?.title || s.topicId}</td>
                                                                <td><span style={{ fontWeight: 600, color: sc(s.score) }}>{s.score}%</span></td>
                                                                <td style={{ color: "var(--t2)" }}>{s.attemptCount}</td>
                                                                <td style={{ color: "var(--t2)", fontSize: 12 }}>{fmt(s.startedAt)}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
