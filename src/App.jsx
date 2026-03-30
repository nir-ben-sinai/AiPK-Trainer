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

const isUuid = (str) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(str);

export default function App() {
    const [screen, setScreen] = useState("auth");
    const [user, setUser] = useState(null);
    const [authMode, setAuthMode] = useState("login");
    const [form, setForm] = useState({ name: "", email: "", password: "", profession: "" });
    const [authErr, setAuthErr] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [tick, setTick] = useState(0); 

    // Training
    const [topic, setTopic] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [qIdx, setQIdx] = useState(0);
    const [msgs, setMsgs] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const [popup, setPopup] = useState(null);

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

    // משיכת נתונים מסופהבייס 
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

                const adminEmail = "admin@aipk.co.il";
                const adminPassword = "admin";
                
                if (usersRes.data?.length > 0) {
                    DB.users = usersRes.data.map(r => r.data);
                } else {
                    const admin = { id: "u_admin", name: "Admin", email: adminEmail, password: adminPassword, profession: "System Admin", role: "admin", joinedAt: new Date().toISOString() };
                    DB.users = [admin];
                    await supabase.from('app_users').insert([{ id: admin.id, data: admin }]);
                }

                if (sessRes.data) DB.sessions = sessRes.data.map(r => r.data);
                if (logsRes.data) DB.logs = logsRes.data.map(r => r.data);
                if (debRes.data) DB.debriefs = debRes.data.map(r => r.data);
                if (helpRes.data) DB.helpRequests = helpRes.data.map(r => r.data);

                setTick(t => t + 1); 
            } catch (err) { console.error("שגיאה במשיכת נתונים:", err); }
        };
        fetchSupabaseData();
    }, []);

    const deleteUserRecord = async (userId) => {
        if (!window.confirm("אזהרה חמורה: מחיקת המשתמש תמחק לצמיתות גם את כל הסשנים והלוגים שלו. האם אתה בטוח?")) return;
        try {
            await supabase.from('app_users').delete().eq('id', userId);
            DB.users = DB.users.filter(u => u.id !== userId);
            setTick(t => t + 1);
        } catch (e) { console.error(e); }
    };

    const doLogin = () => {
        const u = DB.users.find(x => x.email === form.email && x.password === form.password);
        if (!u) { setAuthErr("אימייל או סיסמה שגויים"); return; }
        setUser(u); setAuthErr("");
        if (u.role === "admin") {
            if (uploadedSets.length === 0) setAdminStep("upload_required");
            else setAdminStep("upload_optional");
            setScreen("admin_upload");
        } else { setScreen("onboarding"); }
    };
    
    const doRegister = async () => {
        if (!form.name || !form.email || !form.password) { setAuthErr("יש למלא את כל השדות"); return; }
        if (DB.users.find(x => x.email === form.email)) { setAuthErr("אימייל קיים במערכת"); return; }
        const u = { id: genId("u"), name: form.name, email: form.email, password: form.password, profession: form.profession || "לא צוין", role: "trainee", joinedAt: new Date().toISOString() };
        DB.users.push(u); setUser(u); setAuthErr(""); setScreen("onboarding");
        await supabase.from('app_users').insert([{ id: u.id, data: u }]); 
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
        setAiLoading(true);
        try {
            const qs = await generateQuestionsFromDocument(doc.base64Data, "application/pdf", doc.filename, options);
            const set = { id: genId("us"), title: options.customTitle || doc.filename, questions: qs, chapters: [] };
            await supabase.from('exams').insert([{ title: set.title, questions: qs, pdf_url: doc.filename }]);
            setUploadedSets(prev => [set, ...prev]);
            setAiLoading(false); return true;
        } catch (e) { setAiLoading(false); return false; }
    };

    const startSession = async (t) => {
        const sid = genId("s");
        const sess = { id: sid, userId: user.id, topicId: t.id, startedAt: new Date().toISOString(), status: "active", score: 0 };
        DB.sessions.push(sess);
        await supabase.from('app_sessions').insert([{ id: sid, user_id: user.id, data: sess }]);
        setTopic(t); setQuestions(t.questions); setQIdx(0); setSessionId(sid); setMsgs([{ role: "ai", text: t.questions[0]?.question || "אין שאלות" }]);
        setScreen("training");
    };

    return (
        <>
            <style>{CSS}</style>
            {screen === "auth" && <AuthScreen authMode={authMode} setAuthMode={setAuthMode} authErr={authErr} setAuthErr={setAuthErr} form={form} setForm={setForm} doLogin={doLogin} doRegister={doRegister} />}
            {screen === "onboarding" && <OnboardingScreen user={user} setScreen={setScreen} />}
            {screen === "disclaimer" && <DisclaimerScreen agreed={agreed} setAgreed={setAgreed} setScreen={setScreen} />}
            {screen === "admin_upload" && <AdminUploadScreen uploadedSets={uploadedSets} adminStep={adminStep} setAdminStep={setAdminStep} goBO={() => setScreen("backoffice")} addLibraryDoc={addLibraryDoc} isUploadingDoc={isUploadingDoc} />}
            {screen === "home" && <HomeScreen user={user} setScreen={setScreen} setUser={setUser} uploadedSets={uploadedSets} startSession={startSession} done={DB.sessions.filter(s=>s.status==='completed')} allTopics={uploadedSets} />}
            
            {/* מסך האימון המעודכן */}
            {screen === "training" && <TrainingScreen user={user} setScreen={setScreen} questions={questions} qIdx={qIdx} setQIdx={setQIdx} />}
            
            {screen === "debrief" && <DebriefScreen user={user} setScreen={setScreen} />}
            {screen === "backoffice" && <BackofficeScreen user={user} setScreen={setScreen} boTab={boTab} setBoTab={setBoTab} dbTable={dbTable} setDbTable={setDbTable} done={DB.sessions.filter(s=>s.status==='completed')} avgSc={0} uploadedSets={uploadedSets} libraryDocs={libraryDocs} processAiFile={processAiFile} addLibraryDoc={addLibraryDoc} deleteLibraryDoc={deleteLibraryDoc} aiLoading={aiLoading} deleteSet={deleteSet} deleteUserRecord={deleteUserRecord} tick={tick} />}
        </>
    );
}
