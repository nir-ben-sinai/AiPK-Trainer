import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("AIzaSyDLkYyS1vlwVfRIpTnSaXqS4Lbr_VuVgAQ");
async function test() {
    const models = ["gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-2.0-flash-lite-001"];
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("hello");
            console.log(`Success ${m} !`);
        } catch (e) {
            console.error(`Error ${m}:`, e.message);
        }
    }
}
test();
