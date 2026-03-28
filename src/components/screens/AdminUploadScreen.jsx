import { Upload, Download, FolderOpen, XCircle, Sparkles, Wand2, FileText, CheckCircle, Trash2, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Logo } from "../Logo";

export function AdminUploadScreen({
    uploadedSets,
    adminStep,
    setAdminStep,
    goBO,
    downloadTemplate,
    fileInputRef,
    uploadDrag,
    setUploadDrag,
    handleDrop,
    handleFileInput,
    uploadError,
    deleteSet,
    aiLoading,
    processAiFile,
    addLibraryDoc,
    aiFileInputRef
}) {
    const hasFiles = uploadedSets.length > 0;
    const [uploadMode, setUploadMode] = useState("csv");
    const [localStep, setLocalStep] = useState("upload");
    const [genConfig, setGenConfig] = useState({ docId: "", name: "", count: "20", notes: "" });

    const handleAiDrop = async e => {
        e.preventDefault(); setUploadDrag(false);
        const docs = await addLibraryDoc(e.dataTransfer.files);
        if (docs && docs.length > 0) {
            setGenConfig({ ...genConfig, docId: docs[0].id, name: docs[0].filename.replace(/\.(pdf|txt|md)$/i, "") });
            setLocalStep("generate");
        }
    };

    const handleAiSelect = async e => {
        if (!e.target.files?.length) return;
        const docs = await addLibraryDoc(e.target.files);
        if (docs && docs.length > 0) {
            setGenConfig({ ...genConfig, docId: docs[0].id, name: docs[0].filename.replace(/\.(pdf|txt|md)$/i, "") });
            setLocalStep("generate");
        }
    };

    return (
        <>
            <div className="screen fade" style={{ alignItems: "center", justifyContent: "center", background: "radial-gradient(ellipse at 50% 35%, #0a1a30 0%, var(--bg) 65%)" }}>
                <div style={{ width: "100%", maxWidth: 480, padding: "0 20px" }}>
                    <div style={{ textAlign: "center", marginBottom: 24 }}>
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><Logo sz={52} /></div>
                        {!hasFiles ? (
                            <>
                                <div className="lbl" style={{ color: "var(--warn)", marginBottom: 6 }}>נדרשת פעולה</div>
                                <div className="rb" style={{ fontSize: 16, fontWeight: 600, color: "var(--t0)", marginBottom: 6 }}>אין קבצי שאלות במערכת</div>
                                <div className="rb" style={{ fontSize: 13, color: "var(--t2)" }}>יש להעלות לפחות קובץ שאלות אחד לפני שניתן להמשיך</div>
                            </>
                        ) : adminStep === "upload_optional" ? (
                            <>
                                <div className="lbl" style={{ color: "var(--ok)", marginBottom: 6 }}>המערכת פעילה</div>
                                <div className="rb" style={{ fontSize: 16, fontWeight: 600, color: "var(--t0)", marginBottom: 6 }}>קיימים {uploadedSets.length} קבצים במערכת</div>
                                <div className="rb" style={{ fontSize: 13, color: "var(--t2)" }}>האם ברצונך להוסיף קבצי שאלות נוספים?</div>
                            </>
                        ) : null}
                    </div>

                    {hasFiles && adminStep === "upload_optional" && (
                        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={goBO}>
                                לא, המשך לבק-אופיס
                            </button>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setAdminStep("upload_required")}>
                                כן, הוסף שאלות
                            </button>
                        </div>
                    )}

                    {(!hasFiles || adminStep === "upload_required") && (
                        <>
                            <div className="card" style={{ padding: "18px", marginBottom: 14, borderColor: !hasFiles ? "rgba(251,191,36,0.3)" : "var(--bdr)" }}>

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
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <Upload size={14} color="var(--cy)" />
                                                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t0)" }}>העלאת שאלות מוכנות</span>
                                            </div>
                                            <button className="btn btn-ghost" style={{ fontSize: 11, gap: 5 }} onClick={downloadTemplate}>
                                                <Download size={12} /> הורידו תבנית CSV
                                            </button>
                                        </div>
                                        <div style={{ background: "var(--s2)", border: "1px solid var(--bdr)", borderRadius: 6, padding: "9px 13px", marginBottom: 12, fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "var(--t2)", lineHeight: 1.7 }}>
                                            עמודות חובה: <span style={{ color: "var(--cy)" }}>נושא, שאלה, תשובה</span><br />
                                            אופציונלי: <span style={{ color: "var(--t3)" }}>ציטוט, סעיף</span> · קידוד UTF-8
                                        </div>
                                        <div
                                            className={`upload-zone ${uploadDrag ? "drag" : ""}`}
                                            onClick={() => fileInputRef.current?.click()}
                                            onDragOver={e => { e.preventDefault(); setUploadDrag(true); }}
                                            onDragLeave={() => setUploadDrag(false)}
                                            onDrop={handleDrop}
                                        >
                                            <FolderOpen size={22} color="var(--cy)" style={{ marginBottom: 8, opacity: 0.7 }} />
                                            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--t1)", marginBottom: 3 }}>גרור קובץ CSV לכאן או לחץ לבחירה</div>
                                            <div style={{ fontSize: 11, color: "var(--t3)" }}>ניתן לבחור מספר קבצים ביחד. קובץ קיים יוחלף באם השם זהה</div>
                                            <input ref={fileInputRef} type="file" multiple accept=".csv,.txt" style={{ display: "none" }} onChange={handleFileInput} />
                                        </div>
                                    </>
                                ) : localStep === "upload" ? (
                                    <>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                                            <Wand2 size={14} color="var(--cy)" />
                                            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--t0)" }}>שלב 1: העלאת מסמך מקור לספרייה</span>
                                        </div>
                                        <div style={{ background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: 6, padding: "12px", marginBottom: 12, fontSize: 12, color: "var(--t1)", lineHeight: 1.6 }}>
                                            העלה קובץ PDF או TXT כדי להוסיף אותו לספריית המערכת. מיד לאחר מכן ייפתח מחולל השאלות לבניית המבחן.
                                        </div>

                                        <div
                                            className={`upload-zone ${uploadDrag ? "drag" : ""}`}
                                            onClick={() => !aiLoading && aiFileInputRef.current?.click()}
                                            onDragOver={e => { e.preventDefault(); setUploadDrag(true); }}
                                            onDragLeave={() => setUploadDrag(false)}
                                            onDrop={handleAiDrop}
                                        >
                                            <FileText size={22} color="var(--cy)" style={{ marginBottom: 8, opacity: 0.7 }} />
                                            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--t1)", marginBottom: 3 }}>גרור לכאן מסמך (PDF או TXT)</div>
                                            <div style={{ fontSize: 11, color: "var(--t3)" }}>ניתן לבחור או לגרור מסמך ממנו תרצה לבנות מבחן</div>
                                            <input ref={aiFileInputRef} type="file" accept=".pdf,.txt" style={{ display: "none" }} onChange={handleAiSelect} />
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                                            <Sparkles size={16} color="var(--cy)" />
                                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--t0)" }}>שלב 2: הגדרות יצירת המבחן</span>
                                        </div>
                                        <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 20 }}>המסמך הועלה לספרייה בהצלחה. כעת, הגדר כמה שאלות תרצה ועל מה על המודל להתמקד.</div>

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

                                        <div style={{ display: "flex", gap: 12 }}>
                                            <button className="btn btn-primary" style={{ flex: 1, height: 40 }} onClick={async () => {
                                                const success = await processAiFile(genConfig.docId, { count: genConfig.count, notes: genConfig.notes, customTitle: genConfig.name });
                                                if (success) { if (goBO) goBO(); }
                                            }} disabled={aiLoading}>
                                                {aiLoading ? <><div className="spin border-cyan" style={{ width: 14, height: 14 }} /> מייצר מבחן... (יכול לקחת דקה)</> : <><Sparkles size={15} /> חולל מבחן למערכת</>}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {uploadError && (
                                    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 6 }}>
                                        <XCircle size={13} color="var(--err)" />
                                        <span className="rb" style={{ fontSize: 12, color: "var(--err)" }}>{uploadError}</span>
                                    </div>
                                )}

                                {hasFiles && (
                                    <div style={{ marginTop: 14 }}>
                                        {uploadedSets.map(s => (
                                            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--s2)", border: "1px solid var(--bdr)", borderRadius: 6, marginBottom: 6 }}>
                                                <CheckCircle size={13} color="var(--ok)" style={{ flexShrink: 0 }} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: 12, fontWeight: 500, color: "var(--t0)" }}>
                                                        {s.title} {s.title.includes("AI Generated") && <span className="tag tag-cyan" style={{ marginLeft: 6, padding: "1px 5px", fontSize: 9 }}>AI</span>}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: "var(--t2)" }}>{s.description}</div>
                                                </div>
                                                <button className="btn-icon" style={{ border: "none", color: "var(--err)", background: "rgba(248,113,113,0.08)" }} disabled={aiLoading} onClick={() => deleteSet(s.id)}>
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <button
                                className="btn btn-primary"
                                style={{ width: "100%" }}
                                disabled={!hasFiles || aiLoading}
                                onClick={goBO}
                            >
                                המשך לבק-אופיס <ChevronRight size={14} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
