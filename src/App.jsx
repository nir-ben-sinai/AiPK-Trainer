import { useState, useRef, useEffect } from "react";
import { supabase } from "./supabase";
import { DB, genId, CSS, downloadTemplate } from "./lib/mockBackend";
import { evalAnswerWithGemini, generateDebriefWithGemini, generateQuestionsFromDocument } from "./lib/geminiApi";

// מסכים
import { AuthScreen } from "./components/screens/AuthScreen";
import { OnboardingScreen } from "./components/screens/OnboardingScreen";
import { DisclaimerScreen } from "./components/screens/DisclaimerScreen";
import { AdminUploadScreen } from "./components/screens/AdminUploadScreen";
import { HomeScreen } from "./components/screens/HomeScreen";
import { TrainingScreen } from "./components/screens/TrainingScreen";
import { DebriefScreen } from "./components/screens/DebriefScreen";
import { BackofficeScreen } from "./components/screens/BackofficeScreen";

export default function App() {
    const [user, setUser] = useState(null);
    const [screen, setScreen] = useState("auth");
    const [authMode, setAuthMode] = useState("login");
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [authErr, setAuthErr] = useState("");
    
    // מצבי אימון
    const [topic, setTopic] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [qIdx, setQIdx] = useState(0);
    const [msgs, setMsgs] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);

    // האזנה להתחברות (גוגל / לינק / סיסמה)
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                await handleAuthUser(session.user);
            } else {
                setUser(null);
                setScreen("auth");
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleAuthUser = async (authUser) => {
        let { data: profile, error } = await supabase
            .from('app_users')
            .select('*')
            .eq('id', authUser.id)
            .single();

        let userData;
        if (!profile) {
            userData = {
                id: authUser.id,
                name: authUser.user_metadata.full_name || authUser.email.split('@')[0],
                email: authUser.email,
                role: authUser.email === "admin@aipk.co.il" ? "admin" : "trainee",
                joinedAt: new Date().toISOString()
            };
            await supabase.from('app_users').upsert([{ id: authUser.id, data: userData }]);
        } else {
            userData = profile.data;
        }

        setUser(userData);
        if (userData.role === "admin") setScreen("backoffice");
        else setScreen("onboarding");
    };

    const doLogin = async () => {
        setAuthErr("");
        const { error } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password
        });
        if (error) setAuthErr("פרטי התחברות שגויים או משתמש לא קיים");
    };

    const doLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <>
            <style>{CSS}</style>
            <div className="app-container">
                {screen === "auth" && (
                    <AuthScreen 
                        authMode={authMode} setAuthMode={setAuthMode} 
                        authErr={authErr} setAuthErr={setAuthErr}
                        form={form} setForm={setForm} doLogin={doLogin} 
                    />
                )}
                {screen === "onboarding" && <OnboardingScreen user={user} setScreen={setScreen} />}
                {screen === "backoffice" && <BackofficeScreen user={user} setScreen={setScreen} doLogout={doLogout} />}
                {screen === "home" && <HomeScreen user={user} setScreen={setScreen} />}
                {/* שאר המסכים מנוהלים כאן באותה צורה... */}
            </div>
        </>
    );
}
