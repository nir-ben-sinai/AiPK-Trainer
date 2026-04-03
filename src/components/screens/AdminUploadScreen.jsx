import React, { useState } from "react";
import { Upload, Download, Wand2, AlertCircle, Loader2 } from "lucide-react";
import { generateQuestionsFromDocument } from "../../lib/geminiApi";

export function AdminUploadScreen({ 
    uploadedSets, 
    adminStep, 
    setAdminStep, 
    goBO, // תוקן כדי להתאים ל-App.jsx
    addLibraryDoc, 
    isUploadingDoc 
}) {
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAiGeneration = async () => {
        setStatus("ה-AI מחולל שאלות... זה עשוי לקחת חצי דקה.");
        setLoading(true);
        try {
            // ה-AI יחולל שאלות כלליות, ללא צורך בהעלאת קובץ קודם
            const questions = await generateQuestionsFromDocument("בטיחות כללית במקום העבודה", "בטיחות");
            setStatus(`הצלחנו! חוללו ${questions.length} שאלות חדשות.`);
            console.log(questions);
        } catch (error) {
            setStatus("שגיאה בחיבור ל-AI. וודא שה-API Key תקין.");
        }
        setLoading(false);
    };

    const downloadCsvTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,Question,Option 1,Option 2,Option 3,Option 4,Correct Answer\nדוגמה לשאלה,תשובה א,תשובה ב,תשובה ג,תשובה ד,תשובה א";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "aipk_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        // תוקן המירכוז באמצעות Flexbox כך שישב באמצע המסך
        <div style={{ 
            background: "#020617", 
            minHeight: "100vh", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            direction: "rtl",
            fontFamily: "sans-serif",
            padding: "20px"
        }}>
            <div style={{ 
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "16px",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.1)",
                maxWidth: "600px", 
                width: "100%", 
                padding: "40px" 
            }}>
                <div style={{ textAlign: "center", marginBottom: "30px" }}>
                    <h2 style={{ color: "#f8fafc", margin: "0 0 10px 0", fontSize: "28px" }}>ניהול תוכן לימודי</h2>
                    <p style={{ color: "#94a3b8", margin: 0, fontSize: "15px" }}>
                        {adminStep === "upload_required" 
                            ? "כדי להתחיל, עליך להעלות לפחות חומר לימוד אחד למערכת." 
                            : "העלה חומרי לימוד חדשים או חולל שאלות אוטומטית."}
                    </p>
                </div>
                
                <div style={{ display: "flex", gap: "15px", marginBottom: "30px" }}>
                    <button 
                        onClick={handleAiGeneration} 
                        disabled={loading} 
                        style={{ 
                            flex: 1, 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            gap: "8px",
                            background: "#3b82f6", 
                            color: "#fff", 
                            border: "none", 
                            padding: "14px", 
                            borderRadius: "10px", 
                            cursor: loading ? "not-allowed" : "pointer",
                            fontWeight: "bold",
                            fontSize: "15px",
                            opacity: loading ? 0.7 : 1,
                            transition: "all 0.2s"
                        }}
                    >
                        {loading ? <Loader2 size={18} className="spin" /> : <Wand2 size={18} />} 
                        {loading ? "מחולל..." : "חולל שאלות AI"}
                    </button>
                    
                    <button 
                        onClick={downloadCsvTemplate} 
                        style={{ 
                            flex: 1, 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            gap: "8px",
                            background: "#1e293b", 
                            color: "#f8fafc", 
                            border: "1px solid #334155", 
                            padding: "14px", 
                            borderRadius: "10px", 
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "15px",
                            transition: "all 0.2s"
                        }}
                    >
                        <Download size={18} /> הורד תבנית CSV
                    </button>
                </div>

                <div style={{ 
                    border: "2px dashed #334155", 
                    padding: "50px", 
                    borderRadius: "12px", 
                    textAlign: "center", 
                    background: "#0b1120",
                    cursor: "pointer",
                    transition: "all 0.2s"
                }}>
                    <Upload size={48} color="#3b82f6" style={{ marginBottom: "15px" }} />
                    <h3 style={{ color: "#f8fafc", margin: "0 0 8px 0", fontSize: "18px" }}>העלאת קובץ</h3>
                    <p style={{ color: "#64748b", margin: 0, fontSize: "14px" }}>גרור לכאן קובץ TXT או PDF (בקרוב)</p>
                </div>

                {status && (
                    <div style={{ marginTop: "25px", padding: "15px", borderRadius: "8px", background: "rgba(34, 197, 94, 0.1)", border: "1px solid #22c55e", color: "#22c55e", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <AlertCircle size={18} style={{ flexShrink: 0 }} /> 
                        <span style={{ lineHeight: "1.4" }}>{status}</span>
                    </div>
                )}

                <div style={{ marginTop: "30px", textAlign: "center" }}>
                    <button 
                        onClick={goBO} // שימוש נכון בפונקציה שנשלחת מ-App.jsx
                        style={{ 
                            background: "none", 
                            border: "none", 
                            color: "#94a3b8", 
                            cursor: "pointer", 
                            fontSize: "15px",
                            textDecoration: "underline",
                            textUnderlineOffset: "4px"
                        }}
                    >
                        חזרה לפאנל הניהול
                    </button>
                </div>
            </div>
        </div>
    );
}
