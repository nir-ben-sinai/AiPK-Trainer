import { GoogleGenerativeAI } from "@google/generative-ai";

// וודא שה-API Key שלך נמצא כאן
const genAI = new GoogleGenerativeAI("YOUR_GEMINI_API_KEY_HERE");

// הפונקציה לחילול שאלות ממסמך (שאהבת)
export async function generateQuestionsFromDocument(content, topic) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `בהתבסס על הטקסט הבא: ${content}, צור 5 שאלות אמריקאיות בנושא ${topic}. 
    החזר תשובה בפורמט JSON בלבד, כרשימה של אובייקטים עם השדות: question, options, correctAnswer.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("שגיאה במחולל המבחנים:", error);
    return [];
  }
}

// הפונקציה ליצירת תחקיר (זו שחסרה וגורמת לשגיאה האדומה)
export async function generateDebriefWithGemini(quizResults, traineeName) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `בהתבסס על תוצאות המבחן הבאות של ${traineeName}: ${JSON.stringify(quizResults)}, 
    צור תחקיר אישי ומעודד בעברית. הדגש נקודות לשימור ונקודות לשיפור.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("שגיאה ביצירת תחקיר:", error);
    return "לא ניתן היה ליצור תחקיר אוטומטי כרגע.";
  }
}
