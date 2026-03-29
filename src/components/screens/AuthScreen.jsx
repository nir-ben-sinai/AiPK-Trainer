import React from "react";
import { Chrome, Mail } from "lucide-react";
import { supabase } from "../../supabase";

export function AuthScreen() {
    const loginGoogle = () => {
        supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        });
    };

    const loginMagic = async () => {
        const email = prompt("הכנס אימייל לקבלת לינק כניסה:");
        if (email) {
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) alert("שגיאה: " + error.message);
            else alert("שלחנו לך לינק למייל! בדוק גם בספאם.");
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '25px', background: '#020617', color: 'white' }}>
            <h1 style={{ color: '#4ade80', fontSize: '48px', margin: 0 }}>AIPK</h1>
            <p>מערכת אימוני בטיחות</p>
            
            <button onClick={loginGoogle} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 30px', fontSize: '18px', borderRadius: '12px', border: 'none', cursor: 'pointer', background: 'white', color: 'black', fontWeight: 'bold' }}>
                <Chrome size={24} color="#4285F4" /> המשך עם Google
            </button>

            <button onClick={loginMagic} style={{ background: 'none', border: '1px solid #334155', color: '#94a3b8', padding: '10px 20px', cursor: 'pointer', borderRadius: '8px' }}>
                <Mail size={16} style={{marginLeft: '8px'}} /> כניסה עם לינק למייל
            </button>
        </div>
    );
}
