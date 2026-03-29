import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { AuthScreen } from "./components/screens/AuthScreen";

export default function App() {
    const [user, setUser] = useState(null);
    const [screen, setScreen] = useState("loading");

    useEffect(() => {
        // בודק אם מישהו כבר מחובר או התחבר הרגע
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                setUser(session.user);
                setScreen("home");
            } else {
                setUser(null);
                setScreen("auth");
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    if (screen === "loading") return <div style={{color:'white', textAlign:'center', marginTop:'50px'}}>טוען...</div>;

    return (
        <div className="app-main" style={{ minHeight: '100vh', background: '#020617', color: 'white' }}>
            {screen === "auth" ? (
                <AuthScreen />
            ) : (
                <div style={{ textAlign: 'center', paddingTop: '100px' }}>
                    <h1>שלום {user?.user_metadata?.full_name || user?.email}</h1>
                    <p>התחברת בהצלחה למערכת AIPK!</p>
                    <button 
                        onClick={() => supabase.auth.signOut()}
                        style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer', borderRadius: '8px' }}
                    >
                        התנתק
                    </button>
                </div>
            )}
        </div>
    );
}
