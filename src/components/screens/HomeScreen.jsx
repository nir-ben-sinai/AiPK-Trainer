import { Settings, LogOut, BookOpen, ChevronRight } from "lucide-react";
import { Logo } from "../Logo";
import { DB, fmt, sc } from "../../lib/mockBackend";

export function HomeScreen({ user, setScreen, setUser, uploadedSets, startSession, done, allTopics }) {
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
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 16, fontWeight: 600, color: "var(--t0)", marginBottom: 4 }}>בחר נושא לאימון</div>
                                <div className="rb" style={{ fontSize: 13, color: "var(--t2)" }}>שאלות אקראיות ממאגר הנושא הנבחר</div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, maxWidth: 820, marginBottom: 28 }}>
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
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                <span style={{ fontSize: 11, color: "var(--t3)" }}>{t.questions.length} שאלות</span>
                                                <ChevronRight size={14} color="var(--t3)" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {done.filter(s => s.userId === user?.id).length > 0 && (
                                <div style={{ maxWidth: 820 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--t1)", marginBottom: 12 }}>יומן אימונים</div>
                                    <div className="card" style={{ overflow: "hidden" }}>
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
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
