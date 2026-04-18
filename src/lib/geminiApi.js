import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error("שגיאה קריטית: מפתח ה-API חסר בהגדרות!");
}

const genAI = new GoogleGenerativeAI(apiKey);
const MODEL_NAME = "gemini-3-flash-preview";

// 1. הפונקציה לחילול שאלות ממסמך
export async function generateQuestionsFromDocument(content, topic, options = {}) {
  try {
    const count = options.count || 5; 
    const notes = options.notes ? `דגשים מיוחדים: ${options.notes}` : "";
    
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    const prompt = `
      אתה מומחה לכתיבת מבחני הסמכה מקצועיים. עליך ליצור ${count} שאלות אמריקאיות בנושא "${topic}".
      ${notes}

      חוקי ברזל מחמירים למשימה (SOP):
      1. חובה לבסס את כל השאלות והתשובות אך ורק על המסמך או הטקסט המצורף.
      2. אסור לך להמציא שאלות או נתונים מהידע הכללי שלך בשום אופן! 
      3. כל תשובה נכונה חייבת להיות מגובה בעובדה ברורה מתוך חומר המקור.

      החזר תשובה בפורמט JSON בלבד, ללא טקסט מקדים, כרשימה של אובייקטים: 
      [{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "..."}]
    `;
    
    let payload;
    
    // בדיקה חכמה: אם זה רצף ארוך של תווים בלי רווחים או שורות חדשות, זה בוודאות קובץ מקודד (Base64)
    const isBase64 = content && content.length > 100 && !content.includes(" ") && !content.includes("\n");
    
    if (isBase64) {
        console.log("✈️ AI Engine: מזהה קובץ. משגר את המסמך כ-PDF לשרתים של גוגל...");
        payload = [
            prompt,
            { inlineData: { data: content, mimeType: "application/pdf" } }
        ];
    } else {
        console.log("✈️ AI Engine: מזהה טקסט רגיל. משגר לניתוח...");
        payload = [prompt + "\n\nטקסט המקור שעליו אתה נבחן:\n---\n" + content + "\n---"];
    }
    
    const result = await model.generateContent(payload);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(text);
    
    console.log(`✅ AI Engine: חולצו בהצלחה ${parsedData.length} שאלות.`);
    return parsedData;

  } catch (error) {
    console.error("❌ שגיאה במחולל המבחנים:", error);
    // אם יש שגיאה, נחזיר מערך ריק (מה שייצור מבחן ריק במקום להקריס את המערכת)
    return []; 
  }
}

// 2. הפונקציה ליצירת תחקיר אישי
export async function generateDebriefWithGemini(quizResults, traineeName) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `בהתבסס על תוצאות המבחן הבאות של ${traineeName}: ${JSON.stringify(quizResults)}, צור תחקיר אישי, קצר ומעודד בעברית. הדגש נקודות לשימור ונקודות לשיפור.`;
    const result = await model.generateContent(prompt);
    return (await result.response).text();
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
      התשובה הנכונה הרשמית היא: "${correctAnswer}".
      המשתמש ענה במילים שלו: "${userAnswer}".
      האם המשתמש צדק? ענה ב-[CORRECT] והסבר קצר, או רק הסבר אם טעה.
    `;
    const result = await model.generateContent(prompt);
    return (await result.response).text();
  } catch (error) {
    console.error("שגיאה בבדיקת התשובה:", error);
    throw error;
  }
}
