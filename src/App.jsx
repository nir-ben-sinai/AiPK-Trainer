import { useState, useRef, useEffect } from "react";
import * as Papa from "papaparse";

import { DB, parseCsvToSet, downloadTemplate, genId, CSS } from "./lib/mockBackend";
import { evalAnswerWithGemini, generateDebriefWithGemini, generateQuestionsFromDocument } from "./lib/geminiApi";
import { supabase } from "./supabase";

import { AuthScreen } from "./components/screens/AuthScreen";
import { OnboardingScreen } from "./components/screens/OnboardingScreen";
import { DisclaimerScreen } from "./components/screens/DisclaimerScreen";
import { AdminUploadScreen } from "./components/screens/AdminUploadScreen";
import { HomeScreen } from "./components/screens/HomeScreen";
import { TrainingScreen } from "./components/screens/TrainingScreen";
import { DebriefScreen } from "./components/screens/DebriefScreen";
import { BackofficeScreen } from "./components/screens/BackofficeScreen";

export default function App() {
    const [screen, setScreen] = useState("auth");
    const [user, setUser] = useState(null);
    const [authMode, setAuthMode] = useState("login");
    const [form, setForm] = useState({ name: "", email: "", password: "", profession: "" });
    const [authErr, setAuthErr] = useState("");
    const [agreed, setAgreed] = useState(false);

    // Training
    const [topic, setTopic] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [qIdx, setQIdx] = useState(0);
    const [qAttempts, setQAttempts] = useState(0);
    const [msgs, setMsgs] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [correct, setCorrect] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [sessionId, setSessionId] = useState(null);
    const [startTime, setStartTime] = useState(0);
    const [popup, setPopup] = useState(null);
    const [debrief, setDebrief] = useState(null);
    const [insights, setInsights] = useState(["", "", ""]);

    // Back office
    const [boTab, setBoTab] = useState("overview");
    const [dbTable, setDbTable] = useState("users");
    const [adminStep, setAdminStep] = useState(null);

    const [uploadedSets, setUploadedSets] = useState([]);
    const [libraryDocs, setLibraryDocs] = useState([]);
    
    const [uploadError, setUploadError] = useState("");
    const [uploadDrag, setUploadDrag] = useState(false);
    const [helpClicks, setHelpClicks] = useState(0);
    const [showAnswerClicks, setShowAnswerClicks] = useState(0);
    const fileInputRef = useRef(null);
    const chatRef = useRef(null);
    const aiFileInputRef = useRef(null);
    const [aiLoading, setAiLoading] = useState(false);

    // גלילה אוטומטית בצ'אט
    useEffect(() => { chatRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

    // ---> משיכת נתונים מסופהבייס בעליית האפליקציה <---
    useEffect(() => {
        const fetchSupabaseData = async () => {
            try {
                // 1. משיכת מסמכי הספרייה
                const { data: docsData } = await supabase.from('library_docs').select('*').order('created_at', { ascending: false });
                if (docsData) {
                    const formattedDocs = docsData.map(d => ({
                        id: d.id,
                        filename: d.filename,
                        fileUrl: d.file_url,
                        uploadedAt: d.created_at,
                        mimeType: "application/pdf"
                    }));
                    setLibraryDocs(formattedDocs);
                }

                // 2. משיכת מבחנים
                const { data: examsData } = await supabase.from('exams').select('*').order('created_at', { ascending: false });
                if (examsData) {
                    const formattedExams = examsData.map(e => {
                        const qs = e.questions || [];
                        const uniqueTopics = [...new Set(qs.map(q => q.topic || "כללי"))];
                        const chapters = uniqueTopics.map((t, idx) => ({ id: `ch_${idx}`, title: t }));
                        
                        return {
                            id: e.id,
                            title: e.title,
                            description: `${qs.length} שאלות (AI)`,
                            isUploaded: true,
                            filename: e.pdf_url,
                            uploadedAt: e.created_at,
                            chapters: chapters,
                            questions: qs
                        };
                    });
                    setUploadedSets(formattedExams);
                    // סנכרון עם מסד הנתונים הזמני לטובת סטטיסטיקות
                    DB.uploadedSets = formattedExams;
                }
            } catch (err) {
                console.error("שגיאה במשיכת נתונים מהענן:", err);
            }
        };

        fetchSupabaseData();
    }, []);

    // ── AUTH ──
    const doLogin = () => {
        const u = DB.users.find(x => x.email === form.email && x.password === form.password);
        if (!u) { setAuthErr("אימייל או סיסמה שגויים"); return; }
        setUser(u); setAuthErr("");
        if (u.role === "admin") {
            if (uploadedSets.length === 0) setAdminStep("upload_required");
            else setAdminStep("upload_optional");
            setScreen("admin_upload");
        } else {
            setScreen("onboarding");
        }
    };
    const doRegister = () => {
        if (!form.name || !form.email || !form.password) { setAuthErr("יש למלא את כל השדות"); return; }
        if (DB.users.find(x => x.email === form.email)) { setAuthErr("אימייל קיים"); return; }
        const u = { id: genId("u"), name: form.name, email: form.email, password: form.password, profession: form.profession || "לא צוין", role: "trainee", joinedAt: new Date().toISOString() };
        DB.users.push(u); setUser(u); setAuthErr(""); setScreen("onboarding");
    };

    // ── CSV UPLOAD ──
    const processFile = async (files) => {
        if (!files || !files.length) return;
        setUploadError("");
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.name.match(/\.(csv|txt)$/i)) { setUploadError("נא להעלות קבצי CSV בלבד"); continue; }
            await new Promise(resolve => {
                Papa.parse(file, {
                    header: true, skipEmptyLines: true, encoding: "UTF-8",
                    complete: results => {
                        const set = parseCsvToSet(results, file.name);
                        if (set) {
                            const existing = uploadedSets.findIndex(s => s.filename === file.name);
                            if (existing !== -1) uploadedSets[existing] = set;
                            else uploadedSets.push(set);
                        }
                        resolve();
                    },
                    error: resolve
                });
            });
        }
        setUploadedSets([...uploadedSets]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFileInput = e => processFile(e.target.files);
    const handleDrop = e => {
        e.preventDefault(); setUploadDrag(false);
        processFile(e.dataTransfer.files);
    };
    const deleteSet = async id => {
        // מחיקה מסופהבייס (אופציונלי - כרגע נמחק רק מהמסך כדי למנוע טעויות מחיקה)
        const idx = uploadedSets.findIndex(s => s.id === id);
        if (idx !== -1) uploadedSets.splice(idx, 1);
        setUploadedSets([...uploadedSets]);
    };

    // ── LIBRARY & AI (With Supabase Storage) ──
    const addLibraryDoc = async (files) => {
        if (!files || !files.length) return null;
        setUploadError("");
        let errorMsg = "";
        let newDocs = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.name.match(/\.(pdf|txt|md)$/i)) { errorMsg += `רק קבצי PDF או TXT נתמכים (${file.name}). `; continue; }

            try {
                // העלאה לסופהבייס Storage
                const uniqueFileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
                let fileUrl = "";
                
                const { error: uploadError } = await supabase.storage
                    .from('pdfs')
                    .upload(uniqueFileName, file);

                if (uploadError) {
                    console.error("שגיאה בהעלאת הקובץ לאחסון:", uploadError);
                } else {
                    const { data: urlData } = supabase.storage.from('pdfs').getPublicUrl(uniqueFileName);
                    fileUrl = urlData.publicUrl;
                }

                // שמירה בטבלת library_docs
                let dbDocId = `doc_${Date.now()}`;
                if (fileUrl) {
                    const { data: dbData } = await supabase.from('library_docs').insert([{
                        filename: file.name,
                        file_url: fileUrl
                    }]).select().single();
                    if (dbData) dbDocId = dbData.id;
                }

                // קריאה מקומית עבור ג'מיני
                const dataUrl = await new Promise((res, rej) => {
                    const reader = new FileReader();
                    reader.onload = e => res(e.target.result);
                    reader.onerror = rej;
                    reader.readAsDataURL(file);
                });
                const base64Data = dataUrl.split(",")[1];
                
                const doc = {
                    id: dbDocId,
                    filename: file.name,
                    mimeType: file.type || "application/pdf",
                    base64Data, // נשמר זמנית כדי שלא נצטרך להוריד שוב אם נייצר מיד
                    fileUrl,
                    uploadedAt: new Date().toISOString()
                };
                
                setLibraryDocs(prev => [doc, ...prev]);
                newDocs.push(doc);
            } catch (err) {
                errorMsg += `שגיאה בהעלאת הספר ${file.name}: ${err.message}. `;
            }
        }
        if (aiFileInputRef.current) aiFileInputRef.current.value = "";
        if (errorMsg) setUploadError(errorMsg);
        return newDocs.length > 0 ? newDocs : null;
    };

    const deleteLibraryDoc = id => {
        const idx = libraryDocs.findIndex(d => d.id === id);
        if (idx !== -1) libraryDocs.splice(idx, 1);
        setLibraryDocs([...libraryDocs]);
    };

    const processAiFile = async (docId, options = {}) => {
        const doc = libraryDocs.find(d => d.id === docId);
        if (!doc) {
            setUploadError("המסמך לא נמצא בספרייה.");
            return false;
        }

        setUploadError("");
        setAiLoading(true);
        try {
            let base64 = doc.base64Data;
            
            // אם המסמך נמשך מהענן ואין לו ייצוג בזיכרון, נוריד אותו מאחורי הקלעים!
            if (!base64 && doc.fileUrl) {
                try {
                    const res = await fetch(doc.fileUrl);
                    const blob = await res.blob();
                    const dataUrl = await new Promise((res, rej) => {
                        const reader = new FileReader();
                        reader.onload = e => res(e.target.result);
                        reader.onerror = rej;
                        reader.readAsDataURL(blob);
                    });
                    base64 = dataUrl.split(",")[1];
                } catch (fetchErr) {
                    throw new Error("לא הצלחתי למשוך את הקובץ מהענן לקריאה.");
                }
            }

            if (!base64) throw new Error("קובץ לא תקין או חסר.");

            const questions = await generateQuestionsFromDocument(base64, doc.mimeType, doc.filename, options);

            if (!questions || !questions.length) throw new Error("לא זוהו שאלות.");

            const uniqueTopics = [...new Set(questions.map(q => q.topic || "כללי"))];
            const chapters = uniqueTopics.map((t, idx) => ({ id: `ch_${idx}`, title: t }));

            const finalQuestions = questions.map((q, idx) => {
                const ch = chapters.find(c => c.title === (q.topic || "כללי"));
                return {
                    id: `uq_${idx}_${Date.now()}`,
                    question: q.question || "", answer: q.answer || "", citation: q.citation || "", section: q.section || "", chapterId: ch?.id || "ch_0"
                };
            }).filter(q => q.question && q.answer);

            if (!finalQuestions.length) throw new Error("לא נוצרו שאלות מלאות עם תשובה");

            const defaultTitle = doc.filename.replace(/\.(pdf|txt|md)$/i, "") + " (AI Generated)";
            const finalTitle = options?.customTitle ? options.customTitle : defaultTitle;

            const set = {
                id: `us_${Date.now()}`,
                title: finalTitle,
                description: `${finalQuestions.length} שאלות · צ'אפטרינג אוטומטי מבוסס AI`,
                isUploaded: true, filename: doc.filename, uploadedAt: new Date().toISOString(), chapters, questions: finalQuestions
            };

            // שמירה בטבלת exams 
            try {
                const { data: insertedExam, error: dbError } = await supabase
                    .from('exams')
                    .insert([{
                        title: finalTitle,
                        questions: finalQuestions,
                        created_by: user ? user.name : "Admin",
                        pdf_url: doc.filename 
                    }]).select().single();
                
                if (insertedExam) {
                    set.id = insertedExam.id; // עדכון ה-ID המקומי שיתאים למסד הנתונים
                }
            } catch (err) {
                console.error("שגיאת רשת מול סופהבייס:", err);
            }

            setUploadedSets(prev => [set, ...prev]);
            setAiLoading(false);
            return true;
        } catch (err) {
            setUploadError(`שגיאה בחילול מהספר ${doc.filename}: ${err.message}`);
            setAiLoading(false);
            return false;
        }
    };

    // ── TRAINING ──
    const startSession = t => {
        const qs = [...t.questions].sort(() => Math.random() - 0.5);
        const sid = genId("s");
        DB.sessions.push({ id: sid, userId: user.id, topicId: t.id, startedAt: new Date().toISOString(), status: "active", score: 0, attemptCount: 0, timeToAnswer: 0, isCopied: false });
        setTopic(t); setQuestions(qs); setQIdx(0); setCorrect(0); setAttempts(
