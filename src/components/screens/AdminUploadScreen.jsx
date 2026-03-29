import React, { useState } from "react";
import { Upload, Download, Wand2, AlertCircle } from "lucide-react";
import { generateQuestionsFromDocument } from "../../lib/geminiApi";

export function AdminUploadScreen({ setScreen }) {
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
        <div className="screen" style={{ background: "#020617", direction: "rtl" }}>
            <div className="card" style={{ maxWidth: "600px", width: "100%", padding: "40px" }}>
                <h2 style={{ color: "#fff", marginBottom: "30px" }}>ניהול תוכן לימודי</h2>
                
                <div style={{ display: "flex", gap: "15px", marginBottom: "30px" }}>
                    <button onClick={handleAiGeneration} disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                        <Wand2 size={18} style={{ marginLeft: "8px" }} /> {loading ? "מחולל..." : "חולל שאלות AI"}
                    </button>
                    <button onClick={downloadCsvTemplate} className="btn" style={{ flex: 1, background: "#1e293b", color: "#fff" }}>
                        <Download size={18} style={{ marginLeft: "8px" }} /> הורד תבנית CSV
                    </button>
                </div>

                <div style={{ border: "2px dashed #334155", padding: "50px", borderRadius: "12px", textAlign: "center", background: "#0f172a" }}>
                    <Upload size={40} color="#94a3b8" style={{ marginBottom: "15px" }} />
                    <p style={{ color: "#94a3b8", margin: 0 }}>גרור לכאן קובץ TXT או PDF (בקרוב)</p>
                </div>

                {status && (
                    <div style={{ marginTop: "25px", padding: "15px", borderRadius: "8px", background: "#1e293b", color: "#22c55e", fontSize: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <AlertCircle size={16} /> {status}
                    </div>
                )}

                <button onClick={() => setScreen("backoffice")} style={{ marginTop: "30px", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "14px" }}>חזרה לפאנל הניהול</button>
            </div>
        </div>
    );
}
