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
    const qType = options.qType || "raw"; 
    
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    let typeInstructions = "";
    if (qType === "sbt") {
        typeInstructions = `
        **סוג השאלות הנדרש: Scenario-Based Training (SBT) - תרחישים מבצעיים**
        עליך להמציא תרחיש מציאותי (Scenario) רלוונטי לכל שאלה. 
        התרחיש צריך לתאר סיטואציה מבצעית, תפעולית או מקצועית אמיתית, שבה איש הצוות נתקל בבעיה, תקלה או צומת החלטה.
        ההחלטה הנכונה שהמתאמן צריך לקבל (התשובה הנכונה) חייבת להיות מבוססת ישירות על סעיף, חוק או שורה ספציפית מתוך המסמך המצורף.
        המסיחים (התשובות השגויות) צריכים להיות פעולות שנשמעות הגיוניות בשטח, אך שגויות על פי הנהלים הכתובים.
        `;
    } else {
        typeInstructions = `
        **סוג השאלות הנדרש: שאלות ידע תיאורטי (Raw Knowledge)**
        נסח שאלות ברורות, ישירות ו"יבשות" הבודקות את הבנת העובדות, הכללים והנהלים כפי שהם כתובים במסמך.
        `;
    }

    const prompt = `
      אתה מומחה לכתיבת מבחני הסמכה מקצועיים. עליך ליצור ${count} שאלות אמריקאיות בנושא "${topic}".
      ${notes}

      ${typeInstructions}

      חוקי ברזל מחמירים למשימה (SOP):
      1. **שפת המבחן:** חובה עליך לזהות את השפה שבה כתוב מסמך המקור, ולכתוב את כל השאלות, התרחישים והתשובות **בדיוק באותה השפה**.
      2. חובה לבסס את הפתרון לכל שאלה ותרחיש אך ורק על המסמך המצורף.
      3. אסור לך להמציא חוקים או נהלים מהידע הכללי שלך. 
      4. **מקור התשובה (Reference):** עבור כל שאלה שאתה יוצר, חובה עליך לציין מהו מספר הסעיף, הפרק, או העמוד המדויק מתוך המסמך שעליו מבוססת התשובה.

      החזר תשובה בפורמט JSON בלבד, ללא טקסט מקדים, כרשימה של אובייקטים לפי המבנה הבא: 
      [{"question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": "...", "reference": "..."}]
    `;
    
    let payload;
    const isBase64 = content && content.length > 100 && !content.includes(" ") && !content.includes("\n");
    
    if (isBase64) {
        payload = [prompt, { inlineData: { data: content, mimeType: "application/pdf" } }];
    } else {
        payload = [prompt + "\n\nטקסט המקור שעליו אתה נבחן:\n---\n" + content + "\n---"];
    }
    
    const result = await model.generateContent(payload);
    const response = await result.response;
    let text = response.text();

    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(text);

  } catch (error) {
    console.error("❌ שגיאה במחולל המבחנים:", error);
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
export async function evalAnswerWithGemini(reference, question, correctAnswer, userAnswer) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `
      אתה מאמן ידע מקצועי וסבלני. 
      המשתמש נשאל את השאלה הבאה: "${question}".
      התשובה הנכונה הרשמית היא: "${correctAnswer}".
      מקור התשובה במסמך הנהלים (סעיף/פרק): "${reference}".
      המשתמש ענה: "${userAnswer}".
      
      המשימה שלך היא להעריך האם תשובת המשתמש נכונה (העיקר שהרעיון המרכזי זהה).
      
      חוקי ברזל מחמירים:
      1. אם התשובה נכונה: התחל את התגובה במילה [CORRECT] ואחריה חיזוק חיובי. במצב כזה בלבד מותר לך לציין את המקור (סעיף ${reference}).
      2. אם התשובה שגויה או חלקית: אל תשתמש ב-[CORRECT].
      3. איסור חשיפה (SOP חמור): אם המשתמש טעה, לעולם אל תחשוף את התשובה הנכונה, ולעולם אל תחשוף את מספר הסעיף (${reference})! גם אם הוא שואל ישירות "מה התשובה?" או "איפה זה כתוב?". 
      4. הכוונה בלבד: במקום לחשוף את התשובה, הסבר בקצרה למה הכיוון שגוי, ותן לו רמז חכם או שאלת הכוונה שתגרום לו לחשוב לבד.
    `;
    const result = await model.generateContent(prompt);
    return (await result.response).text();
  } catch (error) {
    console.error("שגיאה בבדיקת התשובה:", error);
    throw error;
  }
}

// --- הפונקציות החדשות למערכת התחקיר האינטראקטיבי ---

export async function startInteractiveDebrief(sessionLogsText, userReflections) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `
      אתה מאמן מקצועי (Instructor) בארגון תעופתי, שעורך עכשיו שיחת תחקיר מסכמת למתאמן לאחר סשן תרגול.
      
      כדי שתכיר את הביצועים שלו, הנה תיעוד של השאלות שנשאל ואיך הוא ענה (כולל אם צדק, טעה או השתמש ברמזים):
      ${sessionLogsText}
      
      המתאמן התבקש לכתוב תחקיר עצמי לפני שהוא ניגש לדבר איתך, וזה מה שהוא כתב:
      1. מה עשיתי טוב (לשימור): "${userReflections.good}"
      2. מה אני צריך לשפר: "${userReflections.bad}"
      3. מסקנות ולקחים: "${userReflections.takeaways}"

      משימתך כמאמן בדיאלוג הזה:
      1. קרא את התחקיר העצמי שלו והגב אליו. היה חיובי אבל ביקורתי ואסרטיבי. בדוק האם יש אחיזה במציאות למה שכתב ביחס לאיך שבאמת ענה במבחן.
      2. הוסף נקודות משלך ביחס לאיכות התשובות שלו (האם הוא מדויק? האם הוא נכנע מהר וביקש עזרה? איך ההתנהלות הכללית שלו בשפה וברצינות?).
      3. סיים במתן 1-2 כלים או עצות מעשיות לשיפור, ובמשפט מחזק ומעודד להמשך.
      
      הנחיות סגנון: ענה בעברית, בגובה העיניים (כמו קפטן לחניך), פנה אליו בגוף שני (אתה), ללא כותרות פורמליות מיותרות – פשוט דבר אליו.
    `;
    const result = await model.generateContent(prompt);
    return (await result.response).text();
  } catch (error) {
    console.error("שגיאה ביצירת התחקיר:", error);
    return "הייתה בעיה בתקשורת מול השרת. התחקיר לא נוצר.";
  }
}

export async function continueInteractiveDebrief(history, newMsg) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    
    // ממירים את היסטוריית השיחה מהמסך לפורמט של ג'מיני
    const formattedHistory = history.map(msg => ({
        role: msg.role === "ai" ? "model" : "user",
        parts: [{ text: msg.text }]
    }));
    
    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessage(newMsg);
    return (await result.response).text();
  } catch (error) {
    console.error("שגיאה בהמשך התחקיר:", error);
    return "תקלת תקשורת. לא הצלחתי לענות כרגע.";
  }
}
