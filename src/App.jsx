import React, { useState, useEffect } from "react";
import { DB, genId } from "./lib/mockBackend";
import { HomeScreen } from "./components/screens/HomeScreen";
import { TrainingScreen } from "./components/screens/TrainingScreen";
import { BackofficeScreen } from "./components/screens/BackofficeScreen";
import { DebriefScreen } from "./components/screens/DebriefScreen";
import { generateQuestionsFromDocument } from "./lib/geminiApi";

export default function App() {
    const [user, setUser] = useState(DB.users[1]); // יוסי כהן כברירת מחדל
    const [screen, setScreen] = useState("home");
    const [boTab, setBoTab] = useState("users");
    const [uploadedSets, setUploadedSets] = useState([]);
    const [selectedTest, setSelectedTest] = useState(null);
    const [isGenPopupOpen, setIsGenPopupOpen] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [tick, setTick] = useState(0);

    // פונקציה לשינוי סטטוס רישיון מה-Backoffice
    const toggleUserLicense = async (userId) => {
        const targetUser = DB.users.find(u => u.id === userId);
        if (targetUser) {
            targetUser.hasAiLicense = !targetUser.hasAiLicense;
            
            // עדכון הסטייט המקומי אם המשתמש המחובר השתנה
            if (user.id === userId) {
                setUser({ ...targetUser });
            }
            setTick(t => t + 1); // גורם לרינדור מחדש
            console.log(`License toggled for ${targetUser.name}: ${targetUser.hasAiLicense}`);
        }
    };

    // פונקציית חילול מבחן (זהה לזו של האדמין)
    const processAiFile = async (docId, options) => {
        setAiLoading(true);
        // כאן נכנסת הלוגיקה של Gemini שכתבנו קודם
        // בסוף התהליך מוסיפים ל-uploadedSets
        setAiLoading(false);
        return true; 
    };

    return (
        <div className="app-main">
            {screen === "home" && (
                <HomeScreen 
                    user={user} 
                    setScreen={setScreen} 
                    uploadedSets={uploadedSets}
                    setSelectedTest={setSelectedTest}
                    setIsGenPopupOpen={setIsGenPopupOpen}
                />
            )}

            {screen === "backoffice" && (
                <BackofficeScreen 
                    user={user}
                    setScreen={setScreen}
                    boTab={boTab}
                    setBoTab={setBoTab}
                    toggleUserLicense={toggleUserLicense}
                />
            )}

            {screen === "training" && (
                <TrainingScreen 
                    user={user}
                    setScreen={setScreen}
                    topic={selectedTest}
                    questions={selectedTest?.questions || []}
                    // ... שאר הפרופס של הצ'אט ...
                />
            )}

            {screen === "debrief" && (
                <DebriefScreen user={user} setScreen={setScreen} />
            )}

            {/* כאן יופיע ה-Generator Popup אם הוא פתוח */}
            {isGenPopupOpen && (
                <div className="gen-modal-overlay">
                    {/* קוד ה-Modal של חילול המבחן */}
                    <button onClick={() => setIsGenPopupOpen(false)}>סגור</button>
                </div>
            )}
        </div>
    );
}
