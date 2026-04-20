import { useState, useRef, useEffect } from "react";
import * as Papa from "papaparse";

import { DB, parseCsvToSet, downloadTemplate, genId, CSS, saveDbLocal, loadDbLocal } from "./lib/mockBackend";
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

const isUuid = (str) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);

export default function App() {
    const [screen, setScreen] = useState("auth");
    const [user, setUser] = useState(null);
    const [authMode, setAuthMode] = useState("login");
    const [form, setForm] = useState({ name: "", email: "", password: "", profession: "" });
    const [authErr, setAuthErr] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [tick, _setTick] = useState(0);
    const setTick = (val) => { saveDbLocal(); _setTick(val); };

    // Training
    const [topic, setTopic] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [qIdx, setQIdx] = useState(0);
    const [msgs, setMsgs] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [popup, setPopup] = useState(null);
    const [qAttempts, setQAttempts] = useState(0);

    // Back office
    const [boTab, setBoTab] = useState("overview");
    const [dbTable, setDbTable] = useState("users");
    const [adminStep, setAdminStep] = useState(null);

    const [uploadedSets, setUploadedSets] = useState([]);
    const [libraryDocs, setLibraryDocs] = useState([]);




    const [uploadError, setUploadError] = useState("");
    const chatRef = useRef(null);

    const [aiLoading, setAiLoading] = useState(false);
    const [isUploadingDoc, setIsUploadingDoc] = useState(false);

    useEffect(() => { chatRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

    useEffect(() => {
        const fetchSupabaseData = async () => {
            try {
                const [docsRes, examsRes, usersRes, sessRes, logsRes, debRes, helpRes] = await Promise.all([
                    supabase.from('library_docs').select('*').order('created_at', { ascending: false }),
                    supabase.from('exams').select('*').order('created_at', { ascending: false }),
                    supabase.from('app_users').select('*'),
                    supabase.from('app_sessions').select('*'),
                    supabase.from('app_logs').select('*'),
                    supabase.from('app_debriefs').select('*'),
                    supabase.from('app_help').select('*')
                ]);

                if (docsRes.data) {
                    setLibraryDocs(docsRes.data.map(d => ({ id: d.id, filename: d.filename, fileUrl: d.file_url, uploadedAt: d.created_at, mimeType: "application/pdf" })));
                }

                if (examsRes.data) {
                    const formattedExams = examsRes.data.map(e => {
                        const qs = e.questions || [];
                        const uniqueTopics = [...new Set(qs.map(q => q.topic || "כללי"))];
                        const chapters = uniqueTopics.map((t, idx) => ({ id: `ch_${idx}`, title: t }));
                        return { id: e.id, title: e.title, description: `${qs.length} שאלות (AI)`, isUploaded: true, filename: e.pdf_url, uploadedAt: e.created_at, chapters, questions: qs };
                    });
                    setUploadedSets(formattedExams);
                    DB.uploadedSets = formattedExams;
                }

                loadDbLocal();

                const mergeData = (localArr, supData) => {
                    if (!supData) return localArr;
                    const sb = supData.map(r => r.data);
                    const merged = [...(localArr || [])];
                    sb.forEach(su => {
                        const idx = merged.findIndex(u => u.id === su.id);
                        if (idx === -1) merged.push(su); else merged[idx] = su;
                    });
                    return merged;
                };

                DB.users = mergeData(DB.users, usersRes.data);
                DB.sessions = mergeData(DB.sessions, sessRes.data);
                DB.logs = mergeData(DB.logs, logsRes.data);
                DB.debriefs = mergeData(DB.debriefs, debRes.data);
                DB.helpRequests = mergeData(DB.helpRequests, helpRes.data);

                // --- תיקון פרטי האדמין לאלו שרצית ---
                const adminEmail = "admin@system.com";
                const adminPassword = "admin123";

                const hasAdmin = DB.users.some(u => u.email === adminEmail);
                if (!hasAdmin) {
                    const admin = { id: "u_admin", name: "Admin", email: adminEmail, password: adminPassword, profession: "System Admin", role: "admin", joinedAt: new Date().toISOString() };
                    DB.users.push(admin);
                    await supabase.from('app_users').insert([{ id: admin.id, data: admin }]);
                }

                setTick(t => t + 1);
            } catch (err) { console.error("שגיאה במשיכת נתונים:", err); }
        };
        fetchSupabaseData();
    }, []);

    const deleteUserRecord = async (userId) => {
        if (!window.confirm("האם אתה בטוח שברצונך למחוק משתמש זה?")) return;
        try {
            await supabase.from('app_users').delete().eq('id', userId);
            DB.users = DB.users.filter(u => u.id !== userId);
            setTick(t => t + 1);
        } catch (e) { console.error(e); }
    };

    const saveTestUpdate = async (updatedTest) => {
        // update locally
        const idx = DB.uploadedSets.findIndex(s => s.id === updatedTest.id);
        if (idx !== -1) {
            DB.uploadedSets[idx] = updatedTest;
        }
        setUploadedSets(prev => prev.map(s => s.id === updatedTest.id ? updatedTest : s));

        // update db
        await supabase.from('exams').update({
            title: updatedTest.title,
            questions: updatedTest.questions
        }).eq('id', updatedTest.id).catch(console.error);

        setTick(t => t + 1);
    };

    const doLogin = () => {
        const cleanEmail = form.email.trim().toLowerCase();
        const u = DB.users.find(x => x.email.toLowerCase() === cleanEmail);

        if (!u) {
            setAuthErr("משתמש לא קיים במערכת. אנא הירשם תחילה.");
            return;
        }
        if (u.password !== form.password.trim()) {
            setAuthErr("סיסמה שגויה. אנא נסה שוב.");
            return;
        }

        setUser(u);
        setAuthErr("");

        if (u.role === "admin") {
            if (uploadedSets.length === 0 && libraryDocs.length === 0) {
                setAdminStep("upload_required");
                setScreen("admin_upload");
            } else {
                setScreen("backoffice");
            }
        } else {
            setScreen("home");
        }
    };

    const doRegister = async () => {
        if (!form.name || !form.email || !form.password) {
            setAuthErr("יש למלא לפחות שם מלא, אימייל וסיסמה כדי להירשם.");
            return;
        }

        const cleanEmail = form.email.trim().toLowerCase();
        if (DB.users.find(x => x.email.toLowerCase() === cleanEmail)) {
            setAuthErr("אימייל זה כבר קיים במערכת. אנא עבור למסך ההתחברות.");
            return;
        }

        const u = {
            id: genId("u"),
            name: form.name.trim(),
            email: cleanEmail,
            password: form.password.trim(),
            profession: form.profession || "לא צוין",
            role: "trainee",
            joinedAt: new Date().toISOString()
        };

        DB.users.push(u);
        setUser(u);
        setAuthErr("");

        setScreen("home");

        // ממתינים לשמירה כדי להבטיח שהיא תושלם גם אם המשתמש ירפרש את העמוד
        await supabase.from('app_users').insert([{ id: u.id, data: u }]).catch(console.error);
        setTick(t => t + 1);
    };

    const deleteSet = async id => {
        if (!window.confirm("מחק מבחן?")) return;
        if (isUuid(id)) await supabase.from('exams').delete().eq('id', id);
        setUploadedSets(prev => prev.filter(s => s.id !== id));
    };

    const deleteLibraryDoc = async id => {
        if (!window.confirm("מחק ספר?")) return;
        if (isUuid(id)) await supabase.from('library_docs').delete().eq('id', id);
        setLibraryDocs(prev => prev.filter(d => d.id !== id));
    };

    const addLibraryDoc = async (files) => {
        if (!files || !files.length) return;
        setIsUploadingDoc(true);
        try {
            const file = files[0];
            const uniqueName = `${Date.now()}_${file.name}`;
            await supabase.storage.from('pdfs').upload(uniqueName, file);
            const { data: urlData } = supabase.storage.from('pdfs').getPublicUrl(uniqueName);
            const dbEntry = { filename: file.name, file_url: urlData.publicUrl };
            const { data } = await supabase.from('library_docs').insert([dbEntry]).select().single();

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setLibraryDocs(prev => [{ ...data, base64Data: reader.result.split(',')[1] }, ...prev]);
            };
        } catch (e) { setUploadError("שגיאה בהעלאה"); }
        setIsUploadingDoc(false);
    };

    const processAiFile = async (docId, options = {}) => {
        const doc = libraryDocs.find(d => d.id === docId);
        if (!doc) return false;

        setAiLoading(true);
        try {
            let fileContent = doc.base64Data;

            // אם אין לנו את התוכן בזיכרון (קורה אחרי רענון עמוד), נוריד אותו עכשיו מהלינק
            if (!fileContent && doc.fileUrl) {
                console.log("מוריד קובץ מהענן לצורך ניתוח AI...");
                const response = await fetch(doc.fileUrl);
                const blob = await response.blob();

                // ממירים את הקובץ שירד ל-Base64
                fileContent = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result.split(',')[1]);
                    reader.readAsDataURL(blob);
                });
            }

            if (!fileContent) {
                alert("שגיאה: לא הצלחנו לקרוא את תוכן הקובץ.");
                setAiLoading(false);
                return false;
            }

            // משגרים לג'מיני את התוכן האמיתי!
            const qs = await generateQuestionsFromDocument(fileContent, doc.filename, options);

            if (!qs || qs.length === 0) {
                alert("ה-AI לא הצליח לחלץ שאלות. ייתכן שהמסמך סרוק כתמונה או שגיאת תקשורת.");
                setAiLoading(false);
                return false;
            }

            const set = { id: genId("us"), title: options.customTitle || doc.filename, questions: qs, chapters: [], createdBy: options.createdBy, creatorName: options.creatorName };
            await supabase.from('exams').insert([{ title: set.title, questions: qs, pdf_url: doc.filename }]);
            // Optional: Also save the creator into the persistent mock supabase table if column is configured, 
            // but for frontend reactivity adding it to `set` is what matters.
            setUploadedSets(prev => [set, ...prev]);

            setAiLoading(false);
            return true;
        } catch (e) {
            console.error(e);
            setAiLoading(false);
            return false;
        }
    };

    const finishSession = async () => {
        const sess = DB.sessions.find(s => s.id === sessionId);
        if (sess) {
            const sessionLogs = DB.logs.filter(l => l.sessionId === sessionId);
            const correctLogs = sessionLogs.filter(l => l.status === "correct").length;
            const total = questions.length || 1;
            sess.score = Math.round((correctLogs / total) * 100);
            sess.status = "completed";
            supabase.from('app_sessions').update({ data: sess }).eq('id', sessionId);
            setTick(t => t + 1);
        }
    };

    const logHelpRequest = async (type) => {
        const req = {
            id: genId("help"), userId: user.id, sessionId: sessionId, topicId: topic?.id,
            type: type, questionText: questions[qIdx]?.question, qIdx: qIdx, timestamp: new Date().toISOString()
        };
        DB.helpRequests.push(req);

        const sess = DB.sessions.find(s => s.id === sessionId);
        if (sess) {
            if (type === "show_answer") { sess.showAnswerClicks = (sess.showAnswerClicks || 0) + 1; }
            else { sess.helpClicks = (sess.helpClicks || 0) + 1; }
            supabase.from('app_sessions').update({ data: sess }).eq('id', sessionId);
        }
        supabase.from('app_help').insert([{ id: req.id, user_id: user.id, data: req }]);
        setTick(t => t + 1);
    };

    const startSession = async (t) => {
        const sid = genId("s");
        const sess = { id: sid, userId: user.id, topicId: t.id, startedAt: new Date().toISOString(), status: "active", score: 0 };
        DB.sessions.push(sess);
        await supabase.from('app_sessions').insert([{ id: sid, user_id: user.id, data: sess }]);

        // --- הוספנו כאן ערבוב (Shuffle) אקראי של מערך השאלות ---
        // אנחנו יוצרים עותק של השאלות ומערבבים אותו, כדי לא לשנות את קובץ המקור ב-DB
        const shuffledQuestions = [...t.questions].sort(() => Math.random() - 0.5);

        setTopic(t);
        setQuestions(shuffledQuestions); // טוענים את המערך המעורבב לסטייט
        setQIdx(0);
        setSessionId(sid);

        // השאלה הראשונה שמוצגת היא כעת השאלה הראשונה מהמערך המעורבב (שהיא אקראית)
        setMsgs([{ role: "ai", text: shuffledQuestions[0]?.question || "אין שאלות" }]);
        setQAttempts(0);
        setScreen("training");
    };

    const sendAnswer = async () => {
        if (!input.trim() || loading) return;
        const ans = input.trim();
        setInput("");
        setLoading(true);

        setMsgs(prev => [...prev, { role: "user", text: ans }]);

        try {
            const correctAnswer = questions[qIdx]?.correctAnswer || questions[qIdx]?.answer || "";
            // שולפים את המקור החדש מתוך השאלה
            const reference = questions[qIdx]?.reference || "לא צוין סעיף מדויק";

            // מעבירים למאמן את המקור במקום מחרוזת ריקה!
            const reply = await evalAnswerWithGemini(reference, questions[qIdx]?.question || "", correctAnswer, ans);

            const isCorrect = reply.includes("[CORRECT]");
            const cleanReply = reply.replace(/\[.*\]/g, "").trim();

            setMsgs(prev => [...prev, { role: "ai", text: cleanReply }]);

            if (isCorrect) {
                const log = { id: genId("log"), sessionId, userId: user.id, question: questions[qIdx].question, answer: ans, status: "correct" };
                await supabase.from('app_logs').insert([{ id: log.id, session_id: sessionId, user_id: user.id, data: log }]);

                setTimeout(() => setPopup("next"), 1500);
            } else {
                setQAttempts(prev => prev + 1);
            }
        } catch (error) {
            console.error("Gemini Error:", error);
            setMsgs(prev => [...prev, { role: "ai", text: "הייתה בעיה בתקשורת מול שרתי ה-AI. אי אפשר לבדוק את התשובה כרגע." }]);
            setQAttempts(prev => prev + 1);
        }

        setLoading(false);
    };
    const toggleUserAi = async (userId) => {
        const u = DB.users.find(x => x.id === userId);
        if (u) {
            u.canGenerateTests = !u.canGenerateTests;
            setTick(t => t + 1); // Optimistic UI update
            await supabase.from('app_users').update({
                can_generate_tests: u.canGenerateTests
            }).eq('id', userId).catch(console.error);
        }
    };

    return (
        <>
            <style>{CSS}</style>
            {screen === "auth" && <AuthScreen authMode={authMode} setAuthMode={setAuthMode} authErr={authErr} setAuthErr={setAuthErr} form={form} setForm={setForm} doLogin={doLogin} doRegister={doRegister} />}
            {screen === "onboarding" && <OnboardingScreen user={user} setScreen={setScreen} />}
            {screen === "disclaimer" && <DisclaimerScreen agreed={agreed} setAgreed={setAgreed} setScreen={setScreen} />}
            {screen === "admin_upload" && <AdminUploadScreen uploadedSets={uploadedSets} adminStep={adminStep} setAdminStep={setAdminStep} goBO={() => setScreen("backoffice")} addLibraryDoc={addLibraryDoc} isUploadingDoc={isUploadingDoc} />}
            {screen === "home" && <HomeScreen user={user} setScreen={setScreen} setUser={setUser} uploadedSets={uploadedSets} startSession={startSession} done={DB.sessions.filter(s => s.status === 'completed')} allTopics={uploadedSets} libraryDocs={libraryDocs} processAiFile={processAiFile} aiLoading={aiLoading} />}

            {screen === "training" && (
                <TrainingScreen
                    user={user} setScreen={setScreen}
                    topic={topic} questions={questions} qIdx={qIdx}
                    msgs={msgs} setMsgs={setMsgs}
                    input={input} setInput={setInput}
                    sendAnswer={sendAnswer} loading={loading} chatRef={chatRef}
                    qAttempts={qAttempts} finishSession={finishSession} logHelpRequest={logHelpRequest}
                    pops={{
                        popup,
                        onNext: () => {
                            setQIdx(i => i + 1);
                            setQAttempts(0);
                            setPopup(null);
                            if (qIdx + 1 >= questions.length) {
                                finishSession();
                                setScreen("debrief");
                            } else {
                                setMsgs(prev => [...prev, { role: "ai", text: questions[qIdx + 1]?.question || "סיימת!" }]);
                            }
                        }
                    }}
                />
            )}

            {screen === "debrief" && <DebriefScreen user={user} setScreen={setScreen} />}
            {screen === "backoffice" && (() => {
                const completedSessions = DB.sessions.filter(s => s.status === 'completed');
                const calculatedAvgSc = completedSessions.length ? Math.round(completedSessions.reduce((acc, s) => acc + s.score, 0) / completedSessions.length) : 0;
                return <BackofficeScreen user={user} setScreen={setScreen} boTab={boTab} setBoTab={setBoTab} dbTable={dbTable} setDbTable={setDbTable} done={completedSessions} avgSc={calculatedAvgSc} uploadedSets={uploadedSets} updateSet={saveTestUpdate} libraryDocs={libraryDocs} processAiFile={processAiFile} addLibraryDoc={addLibraryDoc} deleteLibraryDoc={deleteLibraryDoc} aiLoading={aiLoading} deleteSet={deleteSet} deleteUserRecord={deleteUserRecord} toggleUserAi={toggleUserAi} tick={tick} />;
            })()}
        </>
    );
}
