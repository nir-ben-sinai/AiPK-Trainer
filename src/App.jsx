import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { DB, CSS } from "./lib/mockBackend";

// ייבוא המסכים - וודא שהשמות והנתיבים תואמים לתיקיות שלך
import { AuthScreen } from "./components/screens/AuthScreen";
import { OnboardingScreen } from "./components/screens/OnboardingScreen";
import { HomeScreen } from "./components/screens/HomeScreen";
import { BackofficeScreen } from "./components/screens/BackofficeScreen";

export default function App() {
    const [user, setUser] = useState(null);
    const [screen, setScreen] = useState("auth");
    const [authMode, setAuthMode] = useState("login");
    const [form, setForm] = useState({ email: "", password: "" });
    const [authErr, setAuthErr] = useState("");

    // מאזין להתחברות של Supabase (גוגל, Magic Link, או סיסמה)
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                await handleUserSync(session.user);
            } else {
                setUser(null);
                setScreen("auth");
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleUserSync = async (authUser) => {
        // משיכת פרופיל המשתמש מהטבלה שלנו
        let { data: profile } = await supabase.from('app_users').select('*').eq('id', authUser.id).single();

        let userData;
        if (!profile) {
            // משתמש חדש (למשל מגוגל) - יוצרים לו רשומה
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
        setScreen(userData.role === "admin" ? "backoffice" : "home");
    };

    const doLogin = async () => {
        setAuthErr("");
        const { error } = await supabase.auth.signInWithPassword({
            email: form.email,
            password: form.password
        });
        if (error) setAuthErr("פרטי התחברות שגויים");
    };

    return (
        <>
            <style>{CSS}</style>
            <div className="app">
                {screen === "auth" && (
                    <AuthScreen 
                        authMode={authMode} setAuthMode={setAuthMode} 
                        authErr={authErr} setAuthErr={setAuthErr}
                        form={form} setForm={setForm} doLogin={doLogin} 
                    />
                )}
                {screen === "home" && <HomeScreen user={user} setScreen={setScreen} setUser={setUser} />}
                {screen === "backoffice" && <BackofficeScreen user={user} setScreen={setScreen} />}
                {screen === "onboarding" && <OnboardingScreen user={user} setScreen={setScreen} />}
            </div>
        </>
    );
}
