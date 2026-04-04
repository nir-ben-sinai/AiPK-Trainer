// קובץ: geminiApi.js

// קובץ: geminiApi.js

async function fetchGeminiDirectly(prompt) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing API Key");

    // שימוש במזהה המודל המדויק ביותר שגוגל דורשת כיום למניעת 404
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Google detailed error:", data);
            // אם המודל הספציפי נכשל, ננסה פעם אחרונה עם השם הגנרי בגרסת v1
            if (response.status === 404) {
                const fallbackUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
                const fallbackRes = await fetch(fallbackUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
                const fallbackData = await fallbackRes.json();
                if (fallbackRes.ok) return fallbackData.candidates[0].content.parts[0].text;
            }
            throw new Error(data.error?.message || "API Error");
        }

        return data.candidates[0].content.parts[0].text;
    } catch (err) {
        console.error("Gemini Fetch Error:", err);
        throw err;
    }
}

// שאר הפונקציות נשארות ללא שינוי...
export async function generateQuestionsFromDocument(content, topic) {
  try {
    const prompt = `בהתבסס על הטקסט הבא: ${content}, צור 5 שאלות אמריקאיות בנושא ${topic}. 
    החזר תשובה בפורמט JSON בלבד (ללא גרשיים של markdown), כרשימה של אובייקטים: question, options, correctAnswer.`;
    let text = await fetchGeminiDirectly(prompt);
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) { return []; }
}

export async function generateDebriefWithGemini(quizResults, traineeName) {
  try {
    const prompt = `צור תחקיר אימון קצר ומעודד בעברית עבור ${traineeName}: ${JSON.stringify(quizResults)}`;
    return await fetchGeminiDirectly(prompt);
  } catch (error) { return "לא ניתן לייצר תחקיר כרגע."; }
}

export async function evalAnswerWithGemini(documentText, question, correctAnswer, userAnswer) {
  try {
    const prompt = `
      שאלה: "${question}"
      תשובה נכונה: "${correctAnswer}"
      תשובת המשתמש: "${userAnswer}"
      האם המשתמש צדק? ענה בפורמט: [CORRECT] + הסבר קצר אם כן, או רק הסבר קצר אם לא.
    `;
    return await fetchGeminiDirectly(prompt);
  } catch (error) { throw error; }
}
