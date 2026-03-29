import React from "react";
import { Chrome } from "lucide-react";
import { supabase } from "../../supabase";

export function AuthScreen() {
    const handleGoogle = () => {
        supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '20px' }}>
            <h1 style={{ fontSize: '40px', color: '#4ade80' }}>AIPK</h1>
            <h2 style={{ fontSize: '20px' }}>כניסה למערכת האימונים</h2>
            
            <button 
                onClick={handleGoogle}
                style={{ 
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 30px', 
                    fontSize: '18px', fontWeight: 'bold', borderRadius: '12px', border: 'none', 
                    cursor: 'pointer', background: 'white', color: 'black' 
                }}
            >
                <Chrome size={24} color="#4285F4" />
                המשך עם Google
            </button>
        </div>
    );
}
