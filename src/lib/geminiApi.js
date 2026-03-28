import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

const MODELS_TO_TRY = [
    "gemini-flash-latest",
    "gemini-1.5-pro-latest",
    "gemini-pro",
    "gemini-1.5-flash-8b-latest",
    "gemini-2.0-flash",
    "gemini-2.5-flash"
];

async function attemptGenerateContent(promptData) {
    let lastError = null;
    for (const modelName of MODELS_TO_TRY) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            console.log(`[Gemini] Trying model: ${modelName}`);
            const result = await model.generateContent(promptData);
            return result;
        } catch (error) {
            console.warn(`[Gemini] Model ${modelName} failed:`, error?.message);
            lastError = error;
            const msg = error?.message || "";
            // Retry on 503 (Overloaded), 429 (Quota limit) or 404 (Not Found for this API version)
            if (msg.includes("503") || msg.includes("429") || msg.includes("Quota") || msg.includes("Overloaded") || msg.includes("404") || msg.includes("not found")) {
                continue;
            } else {
                throw error;
            }
        }
    }
    throw lastError;
}

export async function evalAnswerWithGemini(context, question, reference, userAnswer) {
    if (!apiKey) return "[WRONG] (Missing API Key. Please add VITE_GEMINI_API_KEY in .env)";
    try {
        const prompt = `You are an expert flight instructor in an airline (EL AL).
Evaluate the trainee's answer to the following question.

Context: ${context}
Question: ${question}
Reference Answer / Policy: ${reference}

Trainee's Answer: ${userAnswer}

Provide short, professional, and encouraging feedback in Hebrew.
IMPORTANT RULES for your feedback:
1. DO NOT reveal the correct reference answer directly.
2. If the trainee's answer is wrong or partial, provide a subtle hint or ask a guiding question to help them reach the correct conclusion themselves.
3. Keep the feedback concise (1-3 sentences).

CRITICAL INSTRUCTION: Your response MUST end with exactly one of the following tags on a new line:
[CORRECT] - if the answer is completely correct and matches the core of the reference.
[PARTIAL] - if the answer is partially correct but missing key points.
[WRONG] - if the answer is incorrect or completely misses the point.`;

        const result = await attemptGenerateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini Eval Error:", error);
        return `שגיאת חיבור: ${error?.message || "Unknown error"}.[WRONG]`;
    }
}

export async function generateDebriefWithGemini(chatHistory, score, topicTitle, traineeInsights) {
    if (!apiKey) return { aiSummary: "חסר מפתח API. לא ניתן לייצר תחקיר.", insights: ["", "", ""] };
    try {
        const historyText = chatHistory.map(m => `${m.role === 'ai' || m.role === 'ref' ? 'Instructor/System' : 'Trainee'}: ${m.text} ${m.status ? `(${m.status})` : ''} `).join('\n\n');
        const insightsText = traineeInsights && traineeInsights.length ? traineeInsights.map((t, i) => `${i + 1}. ${t} `).join('\n') : "The trainee provided no insights.";

        const prompt = `You are a strict but fair Chief Flight Instructor.
Review the following training session transcript for the topic: "${topicTitle}".
Final Score: ${score}%

            Transcript:
${historyText}

The trainee was asked to provide 3 insights / lessons learned from this session.They wrote:
${insightsText}

Based on the trainee's insights and performance, generate a JSON object with exactly these two keys:
        1. "aiSummary": A short paragraph(3 - 4 sentences) written in Hebrew.First, explicitly provide feedback on the trainee's 3 insights (are they correct and relevant?). Then summarize their overall performance and areas for improvement.
        2. "insights": An array of exactly 3 strings written in Hebrew.Each string should be a short, actionable insight or tip based strictly on the trainee's specific mistakes or the topics discussed.

Do not include any markdown formatting like \`\`\`json. Return ONLY the raw JSON object.`;

        const result = await attemptGenerateContent(prompt);
        let text = result.response.text().trim();
        if (text.startsWith("\`\`\`json") || text.startsWith("\`\`\`")) {
            text = text.replace(/^\`\`\`(json)?/, "").replace(/\`\`\`$/, "").trim();
        }
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini Debrief Error:", error);
        return { aiSummary: "שגיאה ביצירת תחקיר AI.", insights: ["", "", ""] };
    }
}

export async function generateQuestionsFromDocument(base64Data, mimeType, filename, options = {}) {
    if (!apiKey) throw new Error("חסר מפתח API. לא ניתן לייצר שאלות.");
    try {
        const count = options.count || "10 to 20";
        const remarksParams = options.notes ? `\nSPECIAL INSTRUCTIONS FROM THE INSTRUCTOR regarding what to focus on:\n"${options.notes}"\nMake absolutely sure to follow these instructions when generating the questions.` : "";

        const prompt = `You are an expert flight instructor.
Read the provided document.
Generate a set of exactly ${count} challenging training scenarios for pilots based ONLY on the content of this document. ${remarksParams}

For each scenario, provide:
- "topic": The general topic or chapter name (e.g., "General", "Emergency Operations", or the specific system)
- "question": A challenging training scenario or question.
- "answer": The correct policy/answer based strictly on the text.
- "citation": A short quote from the text that proves the answer.
- "section": The section or paragraph number where this is found (if applicable).

Output MUST be a raw JSON array of objects. Do not use markdown blocks like \`\`\`json. Just the raw array.
Example:
[ { "topic": "...", "question": "...", "answer": "...", "citation": "...", "section": "..." } ]`;

        const result = await attemptGenerateContent([
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType || "application/pdf"
                }
            },
            prompt
        ]);

        let text = result.response.text().trim();
        if (text.startsWith("\`\`\`json")) {
            text = text.replace(/^\`\`\`json/, "").replace(/\`\`\`$/, "").trim();
        } else if (text.startsWith("\`\`\`")) {
            text = text.replace(/^\`\`\`/, "").replace(/\`\`\`$/, "").trim();
        }
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini Doc Gen Error:", error);
        throw new Error(error.message || "שגיאה ביצירת שאלות מהקובץ");
    }
}
