
import dotenv from "dotenv";
dotenv.config({ path: "/Users/nir/projects/AiPK-Trainer/.env" });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

async function run() {
    console.log("Checking Supabase tables using REST API...");

    const headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    };

    const payload = {
        id: "test_" + Date.now(),
        data: { name: "Test Trainee", role: "trainee" }
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/app_users`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
    });

    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
}
run();
