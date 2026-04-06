// geminiApi.js - מעודכן למודל Gemini 3

async function fetchGeminiDirectly(prompt) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("מפתח API חסר בהגדרות Vercel");

    // עדכון למודל Gemini 3 Flash כפי שמופיע אצלך ב-Playground
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || "שגיאת API");

        return data.candidates[0].content.parts[0].text;
    } catch (err) {
        console.error("שגיאת תקשורת:", err);
        throw err;
    }
}

export async function generateQuestionsFromDocument(content, topic) {
    const prompt = `בהתבסס על הטקסט: ${content}, צור 5 שאלות אמריקאיות על ${topic}. החזר JSON בלבד.`;
    try {
        let text = await fetchGeminiDirectly(prompt);
        text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (e) { return []; }
}

export async function evalAnswerWithGemini(documentText, question, correctAnswer, userAnswer) {
    const prompt = `שאלה: "${question}". תשובה נכונה: "${correctAnswer}". חניך ענה: "${userAnswer}". האם הוא צדק? ענה ב-[CORRECT] והסבר קצר.`;
    return await fetchGeminiDirectly(prompt);
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
