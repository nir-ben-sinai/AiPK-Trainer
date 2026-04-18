import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) console.error("Missing VITE_GEMINI_API_KEY");

const genAI = new GoogleGenerativeAI(apiKey);
const MODEL_NAME = "gemini-3-flash-preview";

export async function generateQuestionsFromDocument(content, topic, options = {}) {
  try {
    const count = options.count || 5; 
    const notes = options.notes ? `דגשים מיוחדים: ${options.notes}` : "";
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    // הפרומפט המהודק שלנו
    const prompt = `
      אתה מומחה לכתיבת מבחני הסמכה מקצועיים. עליך ליצור ${count} שאלות אמריקאיות בנושא "${topic}".
      ${notes}

      חוקי ברזל:
      1. התבסס אך ורק על המסמך המצורף.
      2. אסור להמציא מידע שאינו מופיע במפורש.
      3. החזר תשובה בפורמט JSON בלבד כרשימת אובייקטים: [{question, options, correctAnswer}].
    `;
    
    // הלוגיקה החכמה: אם זה קובץ, נשגר אותו כקובץ. אם זה טקסט, נשגר כטקסט.
    let payload;
    if (content.length > 50000 && !content.includes(" ")) {
        // מזהה שמדובר במחרוזת Base64 (ללא רווחים וארוכה מאוד) ובונה אובייקט PDF
        payload = [
            prompt,
            { inlineData: { data: content, mimeType: "application/pdf" } }
        ];
    } else {
        // טקסט רגיל
        payload = [prompt + "\n\nטקסט המקור:\n" + content];
    }
    
    const result = await model.generateContent(payload);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("שגיאה במחולל המבחנים:", error);
    return [];
  }
}

export async function generateDebriefWithGemini(quizResults, traineeName) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `בהתבסס על תוצאות המבחן של ${traineeName}: ${JSON.stringify(quizResults)}, צור תחקיר אישי ומעודד.`;
    const result = await model.generateContent(prompt);
    return (await result.response).text();
  } catch (error) { return "שגיאת תקשורת."; }
}

export async function evalAnswerWithGemini(documentText, question, correctAnswer, userAnswer) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `שאלה: "${question}". תשובה נכונה: "${correctAnswer}". משתמש ענה: "${userAnswer}". האם המשתמש צדק? ענה ב-[CORRECT] עם הסבר, או רק הסבר אם טעה.`;
    const result = await model.generateContent(prompt);
    return (await result.response).text();
  } catch (error) { throw error; }
}
