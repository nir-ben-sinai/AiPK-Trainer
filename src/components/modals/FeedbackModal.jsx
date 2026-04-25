import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, X, CheckCircle2, Loader2 } from 'lucide-react';

export function FeedbackModal({ isOpen, onClose, onSubmit, user }) {
    const [text, setText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                handleClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    const handleClose = () => {
        setText("");
        setIsSuccess(false);
        setIsSending(false);
        onClose();
    };

    const handleSend = async () => {
        if (!text.trim()) return;
        setIsSending(true);
        try {
            await onSubmit(text);
            setIsSuccess(true);
        } catch (e) {
            console.error("Feedback error:", e);
            alert("שגיאה בשליחת המשוב. אנא נסה שוב.");
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" style={{ zIndex: 3000 }}>
            <div className="modal-card" style={{ maxWidth: 450, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', background: 'var(--s2)', borderBottom: '1px solid var(--bdr)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(56,189,248,0.1)', color: 'var(--cy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MessageSquare size={18} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--t0)' }}>משוב משתמש</h3>
                    </div>
                    <button onClick={handleClose} className="btn-icon" style={{ background: 'transparent' }}>
                        <X size={20} color="var(--t3)" />
                    </button>
                </div>

                <div style={{ padding: 24 }}>
                    {isSuccess ? (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', color: 'var(--ok)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <CheckCircle2 size={36} />
                            </div>
                            <h4 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t0)', marginBottom: 8 }}>תודה על המשוב!</h4>
                            <p style={{ color: 'var(--t2)', fontSize: 14 }}>המשוב שלך עוזר לנו לשפר את המאמן עבורך.</p>
                            <button className="btn btn-primary" style={{ marginTop: 24, width: '100%' }} onClick={handleClose}>סגור</button>
                        </div>
                    ) : (
                        <>
                            <p style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 16, lineHeight: 1.5 }}>
                                נשמח לשמוע ממך! הערות, הצעות לשיפור או דיווח על תקלות - הכל עוזר לנו לדייק את המאמן.
                            </p>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="כתוב כאן את המשוב שלך..."
                                style={{
                                    width: '100%',
                                    minHeight: 150,
                                    padding: 16,
                                    borderRadius: 12,
                                    background: 'var(--s1)',
                                    border: '1px solid var(--bdr)',
                                    color: 'var(--t0)',
                                    fontSize: 15,
                                    lineHeight: 1.6,
                                    resize: 'none',
                                    marginBottom: 20,
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                                autoFocus
                            />
                            <button 
                                className="btn btn-primary" 
                                style={{ width: '100%', height: 48, gap: 10 }} 
                                onClick={handleSend}
                                disabled={isSending || !text.trim()}
                            >
                                {isSending ? <Loader2 size={18} className="spin" /> : <Send size={18} />}
                                <span>שלח משוב</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
