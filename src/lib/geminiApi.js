import { GoogleGenerativeAI } from "@google/generative-ai";

// וודא שהמפתח שלך כאן במקום ה-XXXX
const genAI = new GoogleGenerativeAI("XXXX-YOUR-KEY-HERE-XXXX");

export async function generateQuestionsFromDocument(fileContent, topic) {
    try {
        if (!fileContent || fileContent.length < 10) {
            throw new Error("הקובץ נראה ריק או לא נקרא כראוי");
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `אתה מומחה בטיחות. בהתבסס על הטקסט הבא:
        ---
        ${fileContent}
        ---
        צור 5 שאלות אמריקאיות בנושא ${topic}. 
        החזר תשובה בפורמט JSON בלבד, כרשימה של אובייקטים עם השדות: 
        question (השאלה), options (מערך של 4 אפשרויות), correctAnswer (התשובה הנכונה מתוך המערך).`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // ניקוי תגיות Markdown אם ה-AI הוסיף אותן
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Gemini Error:", error);
        throw error;
    }
}
