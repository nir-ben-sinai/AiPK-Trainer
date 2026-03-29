import React, { useState, useRef } from "react";
import { Upload, FileText, Wand2, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { generateQuestionsFromDocument } from "../../lib/geminiApi";

export function AdminUploadScreen({ setScreen }) {
    const [fileData, setFileData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");
    const fileInputRef = useRef(null);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setStatus("קורא קובץ...");

        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target.result;
            setFileData({ name: file.name, content: content });
            setStatus("קובץ נטען בהצלחה!");
            setLoading(false);
        };
        
        if (file.type === "application/pdf") {
            // הערה: קריאת PDF ישירה דורשת ספריה נוספת, כאן אנחנו קוראים כטקסט
            reader.readAsText(file);
        } else {
            reader.readAsText(file);
        }
    };

    const runAiGenerator = async () => {
        if (!fileData) return alert("אנא העלה קובץ קודם");
        setLoading(true);
        setStatus("ה-AI מחולל שאלות מהמסמך...");
        try {
            const questions = await generateQuestionsFromDocument(fileData.content, "בטיחות כללית");
            console.log("Generated:", questions);
            // כאן תוכל לשמור ל-DB או להציג למשתמש
            setStatus("המבחן חולל בהצלחה!");
        } catch (err) {
            setStatus("שגיאה בחילול השאלות: " + err.message);
        }
        setLoading(false);
    };

    const downloadTemplate = () => {
        const template = "Question,Option 1,Option 2,Option 3,Option 4,Correct Answer\nדוגמה לשאלה,תשובה א,תשובה ב,תשובה ג,תשובה ד,תשובה א";
        const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", "AIPK_Template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="screen" style={{ background: "#020617", direction: "rtl" }}>
            <div className="card" style={{ maxWidth: "600px", width: "100%" }}>
                <h2 style={{ color: "#fff", marginBottom: "20px" }}>ניהול תוכן לימודי</h2>
                
                <div style={{ display: "flex", gap: "10px", marginBottom: "30px" }}>
                    <button onClick={runAiGenerator} className="btn" style={{ flex: 1, background: "#0ea5e9", color: "#fff" }}>
                        <Wand2 size={18} style={{ marginLeft: "8px" }} /> חולל אוטומטית בעזרת AI
                    </button>
                    <button onClick={downloadTemplate} className="btn" style={{ flex: 1, background: "#1e293b", color: "#fff" }}>
                        <Download size={18} style={{ marginLeft: "8px" }} /> הורד תבנית CSV
                    </button>
                </div>

                <div 
                    onClick={() => fileInputRef.current.click()}
                    style={{ border: "2px dashed #334155", padding: "40px", borderRadius: "12px", cursor: "pointer", background: "#0f172a" }}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: "none" }} accept=".txt,.csv,.pdf" />
                    <Upload size={40} color="#94a3b8" style={{ marginBottom: "15px" }} />
                    <p style={{ color: "#94a3b8" }}>גרור לכאן מסמך (PDF או TXT)</p>
                    {fileData && <p style={{ color: "#22c55e", fontWeight: "bold" }}>{fileData.name} נבחר</p>}
                </div>

                {status && (
                    <div style={{ marginTop: "20px", padding: "10px", borderRadius: "8px", background: "#1e293b", color: "#94a3b8", fontSize: "14px" }}>
                        {status}
                    </div>
                )}

                <button onClick={() => setScreen("backoffice")} style={{ marginTop: "30px", background: "none", border: "none", color: "#64748b", cursor: "pointer" }}>חזרה לניהול</button>
            </div>
        </div>
    );
}
