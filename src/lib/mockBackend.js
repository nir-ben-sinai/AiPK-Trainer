import * as Papa from "papaparse";

// ═══════════════════════════════════════════
// DATABASE
// ═══════════════════════════════════════════
export const DB = {
    users: [
        { id: "u_admin", name: "מנהל מערכת", email: "admin@system.com", password: "admin123", role: "admin", profession: "מנהל", joinedAt: new Date(Date.now() - 86400000 * 30).toISOString() },
        { id: "u_1", name: "יוסי כהן", email: "yossi@test.com", password: "1234", role: "trainee", profession: "טייס בכיר", joinedAt: new Date(Date.now() - 86400000 * 14).toISOString() },
        { id: "u_2", name: "מיכל לוי", email: "michal@test.com", password: "1234", role: "trainee", profession: "טייס", joinedAt: new Date(Date.now() - 86400000 * 7).toISOString() },
    ],
    sessions: [],
    logs: [
        { id: "log_1", userId: "u_1", status: "correct", question: "הפרעות בגישה — מה המרחק המינימלי?", answer: "1000 רגל לפחות." },
        { id: "log_2", userId: "u_2", status: "partial", question: "תקלה במערכת דיחוס בגובה שיוט", answer: "יש לבצע הנמכת חירום." },
        { id: "log_3", userId: "u_2", status: "wrong", question: "פערי מהירות בגישה של 737", answer: "שומרים מהירות VREF+15 תמיד." },
        { id: "log_4", userId: "u_1", status: "correct", question: "שימוש במערכת ראייה מוגברת", answer: "מוסיף שטח תצפית אך לא מחליף קשר עין." },
    ],
    debriefs: [
        { id: "deb_1", userId: "u_1", sessionId: "sess_x1", score: 85, aiSummary: "ביצועים טובים עם שליטה טובה בחומר. יש לחזק הבנה בנהלי התקרחות.", insights: ["הבנה טובה של נוהל חירום", "קצב מענה מהיר ויעיל"] },
        { id: "deb_2", userId: "u_2", sessionId: "sess_x2", score: 65, aiSummary: "רמה בינונית. ניכר קושי בתרחישי מהירות גישה.", insights: ["דרוש שיפור בחישובי VREF", "פירוט חסר בתשובות ארוכות"] },
    ],
    // Uploaded question sets (Tests) — populated at runtime
    uploadedSets: [],
    // Uploaded source books (PDF/TXT) — populated at runtime
    libraryDocs: [],
    helpRequests: [
        { id: "hr_1", userId: "u_1", topicId: "general", type: "hint", questionPart: "מהי פעולת החירום הראשון ב...", sessionAttempt: 1, time: new Date(Date.now() - 3600000).toISOString() },
        { id: "hr_2", userId: "u_2", topicId: "general", type: "show_answer", questionPart: "כיצד מגדירים התקרחות חמורה...", sessionAttempt: 2, time: new Date(Date.now() - 7200000).toISOString() }
    ],
};

// ═══════════════════════════════════════════
// LOCAL STORAGE PERSISTENCE (PROTOTYPE FALLBACK)
// ═══════════════════════════════════════════
export const saveDbLocal = () => {
    try {
        localStorage.setItem('proto_db', JSON.stringify({
            users: DB.users, sessions: DB.sessions, logs: DB.logs,
            debriefs: DB.debriefs, uploadedSets: DB.uploadedSets,
            libraryDocs: DB.libraryDocs, helpRequests: DB.helpRequests
        }));
    } catch (e) { }
};

export const loadDbLocal = () => {
    try {
        const raw = localStorage.getItem('proto_db');
        if (raw) {
            const p = JSON.parse(raw);
            if (p.users && p.users.length) DB.users = p.users;
            if (p.sessions) DB.sessions = p.sessions;
            if (p.logs) DB.logs = p.logs;
            if (p.debriefs) DB.debriefs = p.debriefs;
            if (p.uploadedSets) DB.uploadedSets = p.uploadedSets;
            if (p.libraryDocs) DB.libraryDocs = p.libraryDocs;
            if (p.helpRequests) DB.helpRequests = p.helpRequests;
        }
    } catch (e) { }
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
                section: colSection ? String(row[colSection] || "").trim() : "",
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
body { background: #080c12; color: #c9d8e4; font-family: 'Inter', sans-serif; direction: rtl; min-height: 100vh; }
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
.screen { min-height:100vh;display:flex;flex-direction:column;background:var(--bg); }
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
.btn-icon:disabled{opacity:0.3;cursor:not-allowed;}
.inp{background:var(--s2);border:1px solid var(--bdr);color:var(--t0);padding:10px 14px;font-size:14px;width:100%;outline:none;transition:border-color 0.18s,background 0.18s;border-radius:var(--r);font-family:'Rubik',sans-serif;}
.inp:focus{border-color:var(--cy);background:rgba(56,189,248,0.04);}
.inp::placeholder{color:var(--t3);}
textarea.inp{resize:none;}
.card{background:var(--s1);border:1px solid var(--bdr);border-radius:var(--r);}
.card-hover{transition:border-color 0.15s,background 0.15s,transform 0.15s;}
.card-hover:hover{border-color:var(--cy);background:rgba(56,189,248,0.04);transform:translateY(-1px);}
.nav-it{display:flex;align-items:center;gap:10px;padding:9px 14px;cursor:pointer;font-size:12px;font-weight:500;color:var(--t2);transition:all 0.15s;border-radius:4px;margin:1px 6px;}
.nav-it:hover{color:var(--t1);background:var(--s2);}
.nav-it.on{color:var(--cy);background:var(--cy2);}
.tag{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;font-size:10px;font-weight:600;border-radius:20px;letter-spacing:0.04em;white-space:nowrap;}
.tag-cyan{background:var(--cy2);color:var(--cy);border:1px solid rgba(56,189,248,0.25);}
.tag-ok{background:rgba(52,211,153,0.1);color:var(--ok);border:1px solid rgba(52,211,153,0.25);}
.tag-warn{background:rgba(251,191,36,0.1);color:var(--warn);border:1px solid rgba(251,191,36,0.25);}
.tag-err{background:rgba(248,113,113,0.1);color:var(--err);border:1px solid rgba(248,113,113,0.25);}
.lbl{font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:var(--t3);font-family:'Inter',sans-serif;}
table{width:100%;border-collapse:collapse;}
th{text-align:right;padding:8px 14px;font-size:10px;font-weight:600;color:var(--cy);border-bottom:1px solid var(--bdr);letter-spacing:0.08em;text-transform:uppercase;}
td{padding:10px 14px;font-size:13px;border-bottom:1px solid rgba(56,189,248,0.05);color:var(--t1);}
tr:last-child td{border-bottom:none;}
tr:hover td{background:rgba(56,189,248,0.02);}
.prog-wrap{height:3px;background:var(--s3);border-radius:2px;overflow:hidden;}
.prog-fill{height:100%;background:var(--cy);border-radius:2px;transition:width 0.4s ease;}
.mock-badge{position:fixed;bottom:12px;left:12px;z-index:99990;background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);color:var(--warn);font-size:10px;font-weight:600;padding:4px 10px;border-radius:4px;letter-spacing:0.06em;font-family:'IBM Plex Mono',monospace;}
.upload-zone{border:1.5px dashed var(--bdr2);border-radius:var(--r);padding:28px 20px;text-align:center;cursor:pointer;transition:all 0.18s;background:var(--cy3);}
.upload-zone:hover,.upload-zone.drag{border-color:var(--cy);background:var(--cy2);}
.dash-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.topics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; max-width: 820px; }
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }

.ti-box { display: flex; align-items: center; gap: 15px; width: 100%; max-width: 800px; }
.ti-wrap { display: flex; flex: 1; gap: 10px; align-items: center; }
.ti-helpers { display: flex; gap: 10px; }

.flex-resp { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 20px; }
.list-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--s2); border: 1px solid var(--bdr); border-radius: 6px; }
.list-item-actions { display: flex; align-items: center; gap: 8px; }
.panel { padding: 24px; border-radius: 16px; }

.table-wrap { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
table { width: 100%; border-collapse: collapse; min-width: 500px; }

.bo-layout { display: flex; height: 100vh; background: var(--bg); }
.sidebar { width: 195px; background: var(--s1); border-left: 1px solid var(--bdr); display: flex; flex-direction: column; flex-shrink: 0; }
.main-content { flex: 1; overflow-y: auto; padding: 24px 22px; }
.sidebar-hdr { display: flex; flex-direction: column; }
.nav-tabs { display: flex; flex-direction: column; flex: 1; padding: 8px 6px; overflow-y: auto; gap: 2px; }

@media (max-width: 900px) {
  .dash-grid { grid-template-columns: repeat(2, 1fr); }
  .topics-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .dash-grid { grid-template-columns: 1fr; gap: 10px; }
  .topics-grid { grid-template-columns: 1fr; gap: 10px; }
  .grid-2 { grid-template-columns: 1fr; gap: 10px; }
  
  .ti-box { flex-direction: column; align-items: stretch; gap: 10px; }
  .ti-helpers { justify-content: space-between; }
  .ti-helpers button { flex: 1; justify-content: center; padding: 6px 10px; font-size: 11px; }
  
  .flex-resp { flex-direction: column; align-items: flex-start; gap: 10px; margin-bottom: 14px; }
  .list-item { flex-direction: column; align-items: stretch; padding: 10px; }
  .list-item-actions { justify-content: space-between; flex-wrap: wrap; margin-top: 8px; }
  .list-item-actions button { flex: 1; justify-content: center; padding: 6px; font-size: 11px; }
  
  .panel { padding: 12px !important; border-radius: 12px !important; }
  .card { padding: 10px !important; border-radius: 8px; }
  
  .hdr { flex-wrap: wrap; height: auto; padding: 10px 14px; gap: 10px; }
  .hdr .logo-container { transform: scale(0.9); transform-origin: right center; }

  .bo-layout { flex-direction: column; }
  .sidebar { width: 100%; height: auto; border-left: none; border-bottom: 1px solid var(--bdr); }
  .sidebar-hdr { flex-direction: row; align-items: center; padding: 8px 12px; justify-content: space-between; }
  .nav-tabs { flex-direction: row; overflow-x: auto; padding: 6px 8px; white-space: nowrap; gap: 4px; border-top: 1px solid var(--bdr); -webkit-overflow-scrolling: touch; }
  .nav-it { padding: 6px 10px; font-size: 11px; margin: 0 2px; }
  .main-content { padding: 12px; width: 100%; overflow-x: hidden; }

  /* Mobile Tables: Tight compression with horizontal scroll */
  .table-wrap { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; margin-top: 6px; }
  table { min-width: 480px; } /* Allows internal scrolling instead of page scrolling */
  th { padding: 6px 8px; font-size: 9px; letter-spacing: normal; }
  td { padding: 8px 8px; font-size: 11px; }
  
  /* Shrink global headers on mobile */
  h1, h2, .panel > div:first-child > div > div:nth-child(2) { font-size: 16px !important; }
  .rb { line-height: 1.4; }
}
`;
