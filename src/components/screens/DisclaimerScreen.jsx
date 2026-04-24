import { useState } from "react";
import { AlertTriangle, Mail } from "lucide-react";

export function DisclaimerScreen({ agreed, setAgreed, setScreen }) {
    return (
        <div className="screen fade" style={{ alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <div style={{ width: "100%", maxWidth: 520 }}>

                {/* כותרת */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, justifyContent: "center" }}>
                    <AlertTriangle size={22} color="var(--warn)" />
                    <span style={{ fontSize: 18, fontWeight: 700, color: "var(--warn)" }}>הצהרת שימוש</span>
                </div>

                {/* כרטיסיית ההצהרה */}
                <div className="card" style={{ borderColor: "rgba(251,191,36,0.3)", marginBottom: 16 }}>
                    <div style={{ padding: "20px 24px" }}>
                        <p className="rb" style={{
                            fontSize: 14,
                            color: "var(--t1)",
                            lineHeight: 1.8,
                            margin: 0,
                            whiteSpace: "pre-wrap"
                        }}>
                            {`ייתכנו טעויות ו/או אי דיוקים מצד המאמן, פה ושם.
כל מידע שתקבלו ממנו חייב להיבדק על ידכם ולהתמך על ידי מה שכתוב בספרות המקצועית.
אם יש סתירה ביניהן, מה שכתוב בספרות קובע.

במקרה של אי דיוק או סתירה, נסו לנהל איתו דיון בעניין, ברוב המקרים זה עוזר.`}
                        </p>

                        {/* מייל */}
                        <div style={{
                            marginTop: 16,
                            padding: "12px 16px",
                            background: "rgba(56,189,248,0.05)",
                            borderRadius: 8,
                            border: "1px solid rgba(56,189,248,0.15)",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10
                        }}>
                            <Mail size={14} color="var(--cy)" style={{ marginTop: 2, flexShrink: 0 }} />
                            <p className="rb" style={{ fontSize: 13, color: "var(--t2)", margin: 0, lineHeight: 1.7 }}>
                                בכל מקרה בבקשה עדכנו את צוות הפיתוח לצורך טיוב המאמן במייל:{" "}
                                <a href="mailto:nir.bensinai@gmail.com" style={{ color: "var(--cy)", textDecoration: "none", fontWeight: 600 }}>
                                    nir.bensinai@gmail.com
                                </a>
                                <br />
                                <span style={{ color: "var(--t3)", fontSize: 12 }}>תודה, הצוות</span>
                            </p>
                        </div>

                        {/* צ'קבוקס */}
                        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--bdr)" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={e => setAgreed(e.target.checked)}
                                    style={{ accentColor: "var(--cy)", width: 16, height: 16, cursor: "pointer", flexShrink: 0 }}
                                />
                                <span className="rb" style={{ fontSize: 13, color: "var(--t1)" }}>
                                    קראתי והבנתי — אני מתחייב/ת לבדוק כל מידע מול הספרות המקצועית
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                <button
                    className="btn btn-primary"
                    style={{ width: "100%", opacity: agreed ? 1 : 0.45, cursor: agreed ? "pointer" : "not-allowed" }}
                    disabled={!agreed}
                    onClick={() => setScreen("home")}
                >
                    אישור והמשך לאימון
                </button>
            </div>
        </div>
    );
}
