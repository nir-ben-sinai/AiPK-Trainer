import * as Papa from "papaparse";

// ═══════════════════════════════════════════
// DATABASE
// ═══════════════════════════════════════════
export const DB = {
    users: [
        { 
            id: "u_admin", 
            name: "מנהל מערכת", 
            email: "admin@system.com", 
            password: "admin123", 
            role: "admin", 
            profession: "מנהל", 
            joinedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
            hasAiLicense: true // אדמין תמיד עם גישה
        },
        { 
            id: "u_1", 
            name: "יוסי כהן", 
            email: "yossi@test.com", 
            password: "1234", 
            role: "trainee", 
            profession: "טייס בכיר", 
            joinedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
            hasAiLicense: true // יוסי שילם/קיבל אישור
        },
        { 
            id: "u_2", 
            name: "מיכל לוי", 
            email: "michal@test.com", 
            password: "1234", 
            role: "trainee", 
            profession: "טייס", 
            joinedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
            hasAiLicense: false // מיכל במצב "נעול"
        },
    ],
    sessions: [],
    logs: [],
    debriefs: [],
    uploadedSets: [],
    libraryDocs: [],
    helpRequests: [],
};

// ═══════════════════════════════════════════
// MOCK AI
// ═══════════════════════════════════════════
export const mockEval = ans => new Promise(res => setTimeout(() => {
    const words = ans.trim().split(/\s+/).filter(Boolean).length;
    if (words >= 5) res("תשובה מצוינת — ציינת את הנקודות המרכזיות. [CORRECT]");
    else if (words > 0) res("יש לך כיוון נכון, אך חסר פירוט. נסה להרחיב את תשובתך. [PARTIAL]");
    else res("התשובה אינה מספקת. חזור לפרק הרלוונטי בספרות. [WRONG]");
}, 420));

export const mockDebrief = (score, title) => new Promise(res => setTimeout(() => res({
    insights: [`הבנה טובה של ${title} — יש לחזק נקודות ספציפיות`, "קצב מענה סביר, ניתן לשפר דיוק בפרטים", "מומלץ לחזור על החומר לפני הטיסה הבאה"],
    aiSummary: `[MOCK] הושלם אימון בנושא "${title}" עם ציון ${score}%. ביצועים ${score >= 80 ? "טובים מאוד" : score >= 60 ? "סבירים" : "דורשים שיפור"}.`,
}), 550));

// ═══════════════════════════════════════════
// CSV PARSER
// ═══════════════════════════════════════════
export function parseCsvToSet(results, filename) {
    const rows = results.data.filter(r => Object.values(r).some(v => String(v || "").trim()));
    if (!rows.length) return null;

    const headers = Object.keys(rows[0]);
    const find = (...kws) => headers.find(h => kws.some(k => h.includes(k))) || null;

    const colTopic = find("נושא", "topic", "Topic", "TOPIC");
    const colQuestion = find("שאלה", "question", "Question", "תרחיש", "QUESTION");
    const colAnswer = find("תשובה", "answer", "Answer", "ADM", "ANSWER");
    const colCitation = find("ציטוט", "citation", "Citation");
    const colSection = find("סעיף", "section", "Section", "סעיף");

    if (!colQuestion || !colAnswer) return null;

    const uniqueTopics = [...new Set(rows.map(r => String(r[colTopic] || "כללי").trim()))];
    const chapters = uniqueTopics.map((t, i) => ({ id: `ch_${i}`, title: t }));

    const questions = rows
        .map((row, i) => {
            const topicVal = String(row[colTopic] || "כללי").trim();
            const ch = chapters.find(c => c.title === topicVal);
            return {
                id: `uq_${i}_${Date.now()}`,
                question: String(row[colQuestion] || "").trim(),
                answer: String(row[colAnswer] || "").trim(),
                citation: colCitation ? String(row[colCitation] || "").trim() : "",
                reference: colSection ? String(row[colSection] || "").trim() : "", // שינוי שם ל-reference לטובת המאמן
                chapterId: ch?.id || "ch_0",
            };
        })
        .filter(q => q.question && q.answer);

    if (!questions.length) return null;

    return {
        id: `us_${Date.now()}`,
        title: filename.replace(/\.(csv|xlsx|txt)$/i, ""),
        description: `${questions.length} שאלות · ${chapters.length} נושאים`,
        isUploaded: true,
        filename,
        uploadedAt: new Date().toISOString(),
        chapters,
        questions,
    };
}

// CSV template download
export function downloadTemplate() {
    const rows = [
        "נושא,שאלה,תשובה,ציטוט,סעיף",
        "תעדוף מבצעי,\"הטיסה בפיגור — מהי הפעולה הנדרשת?\",\"הבטיחות היא Paramount. יש לעצור ולברר.\",\"Safety is paramount...\",8.0.1",
        "תרבות בטיחות,\"קצין ראשון זיהה טעות — כיצד עליו לפעול?\",\"עליו להעיר ולדווח ללא חשש.\",\"EL AL adopts safety culture...\",8.0.2",
    ].join("\n");
    const blob = new Blob(["\uFEFF" + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "template_questions.csv"; a.click();
    URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════
export const genId = p => `${p}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
export const fmt = iso => new Date(iso).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "2-digit" });
export const sc = s => s >= 80 ? "#34d399" : s >= 60 ? "#fbbf24" : "#f87171";

// ═══════════════════════════════════════════
// CSS 
// ═══════════════════════════════════════════
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Rubik:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #080c12; color: #c9d8e4; font-family: 'Inter', sans-serif; direction: rtl; min-height: 100vh; margin: 0; padding: 0; }

:root {
  --bg:#080c12; --s1:#0d1421; --s2:#121b2b; --s3:#1a2538;
  --cy:#38bdf8; --cy2:rgba(56,189,248,0.12); --cy3:rgba(56,189,248,0.06);
  --t0:#f0f7ff; --t1:#c9d8e4; --t2:#7a96aa; --t3:#3d5568;
  --bdr:rgba(56,189,248,0.14); --bdr2:rgba(56,189,248,0.32);
  --ok:#34d399; --warn:#fbbf24; --err:#f87171; --r:6px;
}

.rb { font-family:'Rubik',sans-serif; }
.mono { font-family:'IBM Plex Mono',monospace; }

@keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin   { to{transform:rotate(360deg)} }

.fade { animation:fadeUp 0.2s ease forwards; }
.spin { width:14px;height:14px;border:2px solid var(--s3);border-top-color:var(--cy);border-radius:50%;animation:spin 0.65s linear infinite;display:inline-block;vertical-align:middle; }

/* חוקי ה-Sticky החדשים שרצית */
.screen-layout { height: 100vh; display: flex; flex-direction: column; overflow: hidden; background: var(--bg); }
.screen-header { flex-shrink: 0; z-index: 10; border-bottom: 1px solid var(--bdr); }
.screen-content { flex: 1; overflow-y: auto; scroll-behavior: smooth; }
.screen-footer { flex-shrink: 0; z-index: 10; border-top: 1px solid var(--bdr); }

input,textarea,button { font-family:'Rubik',sans-serif; }
::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:var(--s3);border-radius:2px}
::-webkit-scrollbar-thumb:hover{background:var(--t3)}

.hdr { background:var(--s1);border-bottom:1px solid var(--bdr);padding:0 20px;height:52px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0; }
.btn { display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 16px;font-size:12px;font-weight:500;cursor:pointer;transition:all 0.15s;border:none;border-radius:var(--r);letter-spacing:0.02em;white-space:nowrap;font-family:'Inter',sans-serif; }
.btn-primary { background:var(--cy);color:#050d18; }
.btn-primary:hover:not(:disabled){background:#67d0fc;}
.btn-primary:active:not(:disabled){background:#23aee0;}
.btn-primary:disabled{opacity:0.3;cursor:not-allowed;}
.btn-ghost{background:transparent;color:var(--t2);border:1px solid var(--s3);}
.btn-ghost:hover{border-color:var(--t3);color:var(--t1);background:var(--s2);}
.btn-subtle{background:var(--s2);color:var(--t1);border:1px solid var(--bdr);}
.btn-subtle:hover{background:var(--s3);border-color:var(--bdr2);}
.btn-subtle:disabled{opacity:0.3;cursor:not-allowed;}
.btn-icon{padding:8px;border-radius:var(--r);background:transparent;color:var(--t2);border:1px solid var(--s3);cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;}
.btn-icon:hover{background:var(--s2);color:var(--t1);border-color:var(--t3);}

.inp{background:var(--s2);border:1px solid var(--bdr);color:var(--t0);padding:10px 14px;font-size:14px;width:100%;outline:none;transition:border-color 0.18s,background 0.18s;border-radius:var(--r);font-family:'Rubik',sans-serif;}
.inp:focus{border-color:var(--cy);background:rgba(56,189,248,0.04);}
textarea.inp{resize:none;}

.card{background:var(--s1);border:1px solid var(--bdr);border-radius:var(--r);}
.card-hover{transition:border-color 0.15s,background 0.15s,transform 0.15s;}
.card-hover:hover{border-color:var(--cy);background:rgba(56,189,248,0.04);transform:translateY(-1px);}

.tag{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;font-size:10px;font-weight:600;border-radius:20px;letter-spacing:0.04em;white-space:nowrap;}
.tag-ok{background:rgba(52,211,153,0.1);color:var(--ok);border:1px solid rgba(52,211,153,0.25);}
.tag-err{background:rgba(248,113,113,0.1);color:var(--err);border:1px solid rgba(248,113,113,0.25);}
.tag-warn{background:rgba(251,191,36,0.1);color:var(--warn);border:1px solid rgba(251,191,36,0.25);}

table{width:100%;border-collapse:collapse;}
th{text-align:right;padding:12px 14px;font-size:10px;font-weight:600;color:var(--cy);border-bottom:1px solid var(--bdr);text-transform:uppercase;}
td{padding:12px 14px;font-size:13px;border-bottom:1px solid rgba(56,189,248,0.05);color:var(--t1);}
`;
