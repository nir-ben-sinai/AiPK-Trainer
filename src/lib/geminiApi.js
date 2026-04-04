// קובץ: geminiApi.js
// מעקף ישיר: פנייה לשרתי גוגל ללא תלות בספריית צד שלישי

// הפונקציה המרכזית שמתקשרת ישירות עם השרת של גוגל
async function fetchGeminiDirectly(prompt) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
        throw new Error("חובה להגדיר VITE_GEMINI_API_KEY ב-Vercel!");
    }

    // פנייה ישירה למודל היציב והמהיר
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Google API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

// 1. הפונקציה לחילול שאלות ממסמך
export async function generateQuestionsFromDocument(content, topic) {
  try {
    const prompt = `בהתבסס על הטקסט הבא: ${content}, צור 5 שאלות אמריקאיות בנושא ${topic}. 
    החזר תשובה בפורמט JSON בלבד, ללא טקסט מקדים וללא עטיפות, כרשימה של אובייקטים עם השדות: question, options, correctAnswer.`;
    
    let text = await fetchGeminiDirectly(prompt);
    // ניקוי עטיפות markdown במידה וג'מיני הוסיף אותן
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
    const prompt = `בהתבסס על תוצאות המבחן הבאות של ${traineeName}: ${JSON.stringify(quizResults)}, 
    צור תחקיר אישי, קצר ומעודד בעברית. הדגש נקודות לשימור ונקודות לשיפור מתוך התשובות שלו.`;
    
    return await fetchGeminiDirectly(prompt);
  } catch (error) {
    console.error("שגיאה ביצירת תחקיר:", error);
    return "לא ניתן היה ליצור תחקיר אוטומטי כרגע בגלל שגיאת תקשורת.";
  }
}

// 3. הפונקציה לבדיקת התשובה בזמן אמת בצ'אט
export async function evalAnswerWithGemini(documentText, question, correctAnswer, userAnswer) {
  try {
    const prompt = `
      אתה מאמן ידע מקצועי וסבלני. המשתמש נשאל את השאלה הבאה: "${question}".
      התשובה הנכונה הרשמית מתוך החומר היא: "${correctAnswer}".
      המשתמש ענה במילים שלו: "${userAnswer}".

      המשימה שלך היא להעריך האם תשובת המשתמש נכונה (גם אם היא מנוסחת קצת אחרת, העיקר שהרעיון המרכזי זהה).
      
      כללים לתשובה שלך:
      - אם התשובה נכונה: עליך להתחיל את התגובה שלך במילה [CORRECT] בדיוק ככה, ואחריה להוסיף משפט חיזוק חיובי קצר בעברית (למשל: "[CORRECT] יפה מאוד, קלעת בול!").
      - אם התשובה שגויה או חסרה פרט קריטי: אל תשתמש במילה [CORRECT]. ענה במשפט קצר בעברית שמסביר שהתשובה אינה מדויקת, ללא מתן הפתרון.
    `;

    return await fetchGeminiDirectly(prompt);
  } catch (error) {
    console.error("שגיאה בבדיקת התשובה:", error);
    throw error; // משליך את השגיאה הלאה כדי שהצ'אט יציג את הודעת התקלה
  }
}
