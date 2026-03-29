import { useState } from "react";
import { CSS } from "./lib/mockBackend";
import { AuthScreen } from "./components/screens/AuthScreen";
import { OnboardingScreen } from "./components/screens/OnboardingScreen";
import { HomeScreen } from "./components/screens/HomeScreen";
import { TrainingScreen } from "./components/screens/TrainingScreen";
import { DebriefScreen } from "./components/screens/DebriefScreen";
import { BackofficeScreen } from "./components/screens/BackofficeScreen";

export default function App() {
  const [user, setUser] = useState(null);
  const [screen, setScreen] = useState("auth");
  const [authMode, setAuthMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const doLogin = () => {
    // כניסה פשוטה - אם זה המייל שלך, אתה אדמין. כל השאר מתרגלים.
    if (form.email === "admin@aipk.co.il") {
      setUser({ name: "ניר", role: "admin", email: form.email });
      setScreen("backoffice");
    } else {
      setUser({ name: form.name || "מתרגל", role: "trainee", email: form.email });
      setScreen("onboarding");
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="app-container">
        {screen === "auth" && (
          <AuthScreen 
            authMode={authMode} setAuthMode={setAuthMode} 
            form={form} setForm={setForm} doLogin={doLogin} 
          />
        )}
        {screen === "onboarding" && <OnboardingScreen user={user} setScreen={setScreen} />}
        {screen === "home" && <HomeScreen user={user} setScreen={setScreen} />}
        {screen === "training" && <TrainingScreen user={user} setScreen={setScreen} />}
        {screen === "debrief" && <DebriefScreen user={user} setScreen={setScreen} />}
        {screen === "backoffice" && <BackofficeScreen user={user} setScreen={setScreen} />}
      </div>
    </>
  );
}
