// קובץ: geminiApi.js

async function fetchGeminiDirectly(prompt) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing API Key");

    // רשימת כתובות לניסוי - גוגל משנה את המיקום של המודלים בין v1 ל-v1beta
    const endpoints = [
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    ];

    for (let url of endpoints) {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.candidates[0].content.parts[0].text;
            }
            
            const errData = await response.json();
            console.warn(`Attempt failed for ${url}:`, errData.error?.message);
        } catch (e) {
            console.error("Network error for endpoint:", e);
        }
    }

    throw new Error("כל ניסיונות התקשורת עם גוגל נכשלו. בדוק את סטטוס המודלים ב-AI Studio.");
}

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
