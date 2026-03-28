import { BookOpen, CheckSquare, BarChart2, ChevronRight } from "lucide-react";
import { Logo } from "../Logo";

export function OnboardingScreen({ user, setScreen }) {
    return (
        <>
            <div className="mock-badge">PROTOTYPE</div>
            <div className="screen fade" style={{ alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at 50% 35%, #0a1a30 0%, var(--bg) 65%)" }}>
                <div style={{ width: "100%", maxWidth: 440, padding: "0 20px" }}>
                    <div style={{ textAlign: "center", marginBottom: 24 }}>
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><Logo sz={60} /></div>
                        <div className="lbl" style={{ color: "var(--cy)", marginBottom: 4 }}>Crew Briefing</div>
                        <div className="rb" style={{ fontSize: 18, fontWeight: 600, color: "var(--t0)" }}>ברוך הבא, {user?.name}</div>
                    </div>
                    <div className="card" style={{ padding: "20px", marginBottom: 12 }}>
                        {[[BookOpen, "שאלות אקראיות", "ממאגר הנושא הנבחר, מסודרות באקראי"], [CheckSquare, "הערכה סמנטית", "לפי מהות התשובה, לא התאמה מילולית"], [BarChart2, "תחקיר בסיום", "סיכום AI עם תובנות אישיות וציון"]].map(([Icon, title, desc], i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: i < 2 ? 16 : 0 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--cy2)", border: "1px solid var(--bdr)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <Icon size={15} color="var(--cy)" />
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--t0)", marginBottom: 2 }}>{title}</div>
                                    <div className="rb" style={{ fontSize: 12, color: "var(--t2)", lineHeight: 1.5 }}>{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => setScreen("disclaimer")}>
                        המשך <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </>
    );
}
