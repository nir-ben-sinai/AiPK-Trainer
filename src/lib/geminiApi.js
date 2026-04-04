// קובץ: geminiApi.js

async function fetchGeminiDirectly(prompt) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
        throw new Error("Missing API Key");
    }

    // שימוש בגרסה v1beta עם המודל היציב ביותר
    // שים לב: שינינו ל-v1beta ולמודל gemini-1.5-flash-latest
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
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
            // אם v1beta נכשל, ננסה אוטומטית את גרסה v1
            if (response.status === 404) {
                 const fallbackUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
                 const fallbackResponse = await fetch(fallbackUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                 });
                 const fallbackData = await fallbackResponse.json();
                 if (fallbackResponse.ok) return fallbackData.candidates[0].content.parts[0].text;
            }
            throw new Error(data.error?.message || "API Error");
        }

        return data.candidates[0].content.parts[0].text;
    } catch (err) {
        console.error("Gemini Fetch Error:", err);
        throw err;
    }
}

export async function generateQuestionsFromDocument(content, topic) {
  try {
    const prompt = `בהתבסס על הטקסט הבא: ${content}, צור 5 שאלות אמריקאיות בנושא ${topic}. 
    החזר תשובה בפורמט JSON בלבד, כרשימה של אובייקטים עם השדות: question, options, correctAnswer.`;
    let text = await fetchGeminiDirectly(prompt);
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) { return []; }
}

export async function generateDebriefWithGemini(quizResults, traineeName) {
  try {
    const prompt = `צור תחקיר קצר בעברית עבור ${traineeName} על בסיס התוצאות: ${JSON.stringify(quizResults)}`;
    return await fetchGeminiDirectly(prompt);
  } catch (error) { return "שגיאת תקשורת בתחקיר."; }
}

export async function evalAnswerWithGemini(documentText, question, correctAnswer, userAnswer) {
  try {
    const prompt = `
      השאלה: "${question}". התשובה הנכונה: "${correctAnswer}". המשתמש ענה: "${userAnswer}".
      האם המשתמש צדק? ענה בפורמט: [CORRECT] + הסבר קצר אם כן, או רק הסבר קצר אם לא.
    `;
    return await fetchGeminiDirectly(prompt);
  } catch (error) { throw error; }
}
