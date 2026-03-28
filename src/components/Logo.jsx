export function Logo({ sz = 52 }) {
    const fs = sz < 42 ? 8 : sz < 58 ? 10 : 13;
    return (
        <div style={{ width: sz, height: sz, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#0f2040 0%,#050d1f 100%)", border: "1.5px solid rgba(56,189,248,0.5)", boxShadow: "0 0 20px rgba(56,189,248,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", lineHeight: 1.2 }}>
                <div style={{ fontSize: fs, fontWeight: 700, letterSpacing: "0.03em", fontFamily: "'IBM Plex Mono',monospace" }}>
                    <span style={{ color: "#38bdf8" }}>A</span><span style={{ color: "#fb923c" }}>i</span><span style={{ color: "#38bdf8" }}>PK</span>
                </div>
                <div style={{ fontSize: Math.max(fs - 3, 6), color: "#4a7090", letterSpacing: "0.1em", fontFamily: "'IBM Plex Mono',monospace" }}>TRAINER</div>
            </div>
        </div>
    );
}
