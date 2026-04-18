import { GoogleGenerativeAI } from "@google/generative-ai";

// שואב את המפתח בצורה מאובטחת מ-Vercel
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error("שגיאה קריטית: מפתח ה-API חסר! ודא שהגדרת את VITE_GEMINI_API_KEY ב-Vercel.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// מעודכן למודל שפתוח ומופיע אצלך בחשבון כדי למנוע שגיאות 404
const MODEL_NAME = "gemini-3-flash-preview";

// 1. הפונקציה לחילול שאלות ממסמך
export async function generateQuestionsFromDocument(content, topic) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `בהתבסס על הטקסט הבא: ${content}, צור 5 שאלות אמריקאיות בנושא ${topic}. 
    החזר תשובה בפורמט JSON בלבד, ללא טקסט מקדים וללא עטיפות, כרשימה של אובייקטים עם השדות: question, options, correctAnswer.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("שגיאה במחולל המבחנים:", error);
    return [];
  }
}

// 2. הפונקציה ליצירת תחקיר אישי
export async function generateDebriefWithGemini(quizResults, traineeName) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `בהתבסס על תוצאות המבחן הבאות של ${traineeName}: ${JSON.stringify(quizResults)}, 
    צור תחקיר אישי, קצר ומעודד בעברית. הדגש נקודות לשימור ונקודות לשיפור מתוך התשובות שלו.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("שגיאה ביצירת תחקיר:", error);
    return "לא ניתן היה ליצור תחקיר אוטומטי כרגע בגלל שגיאת תקשורת.";
  }
}

// 3. הפונקציה לבדיקת התשובה בזמן אמת בצ'אט
export async function evalAnswerWithGemini(documentText, question, correctAnswer, userAnswer) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `
      אתה מאמן ידע מקצועי וסבלני. המשתמש נשאל את השאלה הבאה: "${question}".
      התשובה הנכונה הרשמית מתוך החומר היא: "${correctAnswer}".
      המשתמש ענה במילים שלו: "${userAnswer}".

      המשימה שלך היא להעריך האם תשובת המשתמש נכונה (גם אם היא מנוסחת קצת אחרת, העיקר שהרעיון המרכזי זהה).
      
      כללים לתשובה שלך:
      - אם התשובה נכונה: עליך להתחיל את התגובה שלך במילה [CORRECT] בדיוק ככה, ואחריה להוסיף משפט חיזוק חיובי קצר בעברית (למשל: "[CORRECT] יפה מאוד, קלעת בול!").
      - אם התשובה שגויה או חסרה פרט קריטי: אל תשתמש במילה [CORRECT]. ענה במשפט קצר בעברית שמסביר שהתשובה אינה מדויקת, ללא מתן הפתרון.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("שגיאה בבדיקת התשובה:", error);
    throw error;
  }
}
