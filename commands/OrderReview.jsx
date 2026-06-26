import { useState } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// OrderReview.jsx  — "Review Your Order" screen
//
// INSERT THIS AS A NEW STEP between Print Settings and Payment.
// Your flow becomes: Upload → Print Settings → Review Order → Payment
//
// AGENT INSTRUCTIONS:
//   1. Add this file to your components/pages folder
//   2. Add a new route: /review  →  <OrderReview />
//   3. In PrintSettings.jsx, change onConfirm to navigate("/review")
//      and pass settings via React state/context/localStorage
//   4. In OrderReview.jsx, "Proceed to Pay" navigates to "/payment"
//   5. Keep your existing two-column desktop layout wrapper — wrap this
//      card the same way as PrintSettings card (right panel)
//
// Props:
//   files       – Array of files
//   copies      – 1
//   colorMode   – "bw" | "color"
//   layout      – "simplex" | "duplex"
//   orientation – "portrait" | "landscape"
//   printCost   – number (from PrintSettings)
//   serviceFee  – number (default 2)
//   kioskName   – "Presidency University Kiosk"
//   kioskLoc    – "Udupi, Karnataka"
//   kioskOpen   – true | false
//   kioskHours  – "Open until 10 PM"
//   phone       – "+91 98408 24210"
//   onEdit      – fn — goes back to print settings
//   onProceed   – fn — goes to payment
// ─────────────────────────────────────────────────────────────────────────────

export default function OrderReview({
  files       = [],
  copies      = 1,
  colorMode   = "bw",
  layout      = "duplex",
  orientation = "portrait",
  printCost   = 13,
  serviceFee  = 2,
  kioskName   = "Presidency University Kiosk",
  kioskLoc    = "Udupi, Karnataka",
  kioskOpen   = true,
  kioskHours  = "Open until 10 PM",
  phone       = "+91 98408 24210",
  onEdit      = () => window.history.back(),
  onProceed   = () => {},
}) {
  const [phoneVal, setPhoneVal] = useState(phone);
  const [editPhone, setEditPhone] = useState(false);

  const grandTotal    = printCost + serviceFee;
  
  const totalFilePages = files.reduce((acc, f) => {
    const pagesToPrint = f.pageRange || f.pagesToPrint || "All";
    if (!pagesToPrint || pagesToPrint.toLowerCase() === 'all') return acc + (f.pageCount || 1);
    try {
      const parts = pagesToPrint.split(',');
      let count = 0;
      for (const part of parts) {
        if (part.includes('-')) {
          const [start, end] = part.split('-').map(s => parseInt(s.trim()));
          if (!isNaN(start) && !isNaN(end) && end >= start) count += (end - start + 1);
        } else {
          const num = parseInt(part.trim());
          if (!isNaN(num)) count += 1;
        }
      }
      return acc + (count > 0 ? count : (f.pageCount || 1));
    } catch {
      return acc + (f.pageCount || 1);
    }
  }, 0);

  const colorLabel    = colorMode === "bw" ? "B/W" : "Color";

  return (
    <>
      <style>{`
        .or-card * { box-sizing: border-box; }

        .or-section {
          background: #f8f9ff;
          border-radius: 14px;
          overflow: hidden;
        }
        .or-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 11px 14px;
          border-bottom: 1px solid #f0f1f7;
          font-size: 0.88rem;
          color: #444;
          gap: 8px;
        }
        .or-row:last-child { border-bottom: none; }
        .or-row-label { color: #888; font-size: 0.85rem; }
        .or-row-val   { font-weight: 600; color: #1a2340; font-size: 0.88rem; }

        .or-sec-heading {
          font-size: 1.05rem;
          font-weight: 700;
          color: #1a2340;
          margin: 0 0 10px;
          font-family: 'Playfair Display', Georgia, serif;
        }

        .or-edit-btn {
          background: none; border: none;
          color: #4a5fc1; font-size: 0.82rem; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; gap: 4px;
          padding: 0; font-family: inherit;
          transition: opacity 0.15s;
        }
        .or-edit-btn:hover { opacity: 0.7; }

        .or-tag {
          font-size: 0.7rem; font-weight: 700;
          padding: 2px 8px; border-radius: 20px;
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .or-tag-open   { background: #dcfce7; color: #15803d; }
        .or-tag-closed { background: #fee2e2; color: #b91c1c; }

        .or-icon-pill {
          display: inline-flex; align-items: center; gap: 4px;
          background: #f0f1f7; border-radius: 20px;
          padding: 3px 8px; font-size: 0.75rem; color: #666; font-weight: 500;
        }

        .or-grand {
          display: flex; justify-content: space-between; align-items: center;
          padding: 13px 14px;
          font-size: 1rem; font-weight: 700; color: #1a2340;
          border-top: 2px solid #e8eaef;
          margin-top: 2px;
        }

        .or-proceed {
          width: 100%;
          padding: 15px;
          background: #1a2340;
          color: white; border: none; border-radius: 50px;
          font-size: 1rem; font-weight: 700;
          cursor: pointer; font-family: inherit;
          letter-spacing: 0.02em;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: opacity 0.2s, transform 0.15s;
        }
        .or-proceed:hover  { opacity: 0.88; transform: scale(1.01); }
        .or-proceed:active { transform: scale(0.98); }
        .or-proceed-badge {
          background: rgba(255,255,255,0.18);
          border-radius: 20px; padding: 3px 12px;
          font-size: 0.88rem;
        }

        .or-phone-input {
          border: 1.5px solid #4a5fc1;
          border-radius: 8px; padding: 6px 10px;
          font-size: 0.88rem; font-family: inherit;
          color: #1a2340; font-weight: 600;
          outline: none; width: 180px;
        }

        /* footer sticky bar */
        .or-footer {
          padding: 0.75rem 1.5rem 1.25rem;
          border-top: 1px solid #f0f1f7;
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px;
        }
        .or-footer-left { font-size: 0.78rem; color: #aaa; line-height: 1.4; }
        .or-footer-left strong { display: block; font-size: 1.1rem; color: #1a2340; }

        @media (max-width: 768px) {
          .or-card { border-radius: 0 !important; box-shadow: none !important; }
        }
      `}</style>

      <div className="or-card" style={{
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 4px 32px rgba(26,35,64,0.09)",
        width: "min(440px, 100%)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, system-ui, sans-serif",
      }}>

        {/* ── Header ── */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f0f1f7", display: "flex", alignItems: "center", position: "relative" }}>
          <button onClick={onEdit} style={{ position: "absolute", left: "1.5rem", background: "none", border: "none", fontSize: "0.88rem", color: "#4a5fc1", cursor: "pointer", fontWeight: 600, fontFamily: "inherit", display: "flex", alignItems: "center", gap: "4px" }}>
            ← Back
          </button>
          <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.15rem", fontWeight: 600, color: "#1a2340", width: "100%", textAlign: "center" }}>
            Review Your Order
          </span>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem", overflowY: "auto", maxHeight: "70vh" }}>

          {/* ── Uploaded Files ── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <h3 className="or-sec-heading">Uploaded Files</h3>
              <button className="or-edit-btn" onClick={onEdit}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit
              </button>
            </div>

            <div className="or-section">
              <div style={{ display: "flex", flexDirection: "column" }}>
                {files.map((file, idx) => (
                  <div key={idx} style={{ padding: "12px 14px", borderBottom: idx === files.length - 1 ? "none" : "1px solid #f0f1f7" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {/* Mini preview thumbnail */}
                      <div style={{ width: "44px", height: "56px", background: "#f0f1f7", borderRadius: "6px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #e0e2ef" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a5fc1" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#1a2340", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.fileName}</p>
                        <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "#888" }}>
                          ({file.pageCount || 1} Page{(file.pageCount || 1) !== 1 ? "s" : ""})
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Settings chips */}
              <div style={{ padding: "0 14px 12px 14px", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", borderTop: "1px solid #f0f1f7", paddingTop: "12px" }}>
                <span className="or-icon-pill">{copies} Cop{copies === 1 ? "y" : "ies"}</span>

                {/* Color blob chip */}
                <span className="or-icon-pill">
                  {colorMode === "color" ? (
                    <svg width="14" height="14" viewBox="0 0 20 20">
                      <circle cx="7"  cy="10" r="6" fill="#3b82f6" opacity="0.85"/>
                      <circle cx="13" cy="10" r="6" fill="#f59e0b" opacity="0.85"/>
                      <circle cx="10" cy="6"  r="6" fill="#ec4899" opacity="0.75"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 20 20">
                      <circle cx="8"  cy="11" r="6" fill="#9e9e9e"/>
                      <circle cx="12" cy="9"  r="6" fill="#212121"/>
                    </svg>
                  )}
                  {colorLabel}
                </span>

                {/* Layout chip */}
                <span className="or-icon-pill">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    {layout === "duplex"
                      ? <><rect x="2" y="3" width="13" height="17" rx="2"/><rect x="9" y="5" width="13" height="17" rx="2" opacity="0.4"/></>
                      : <rect x="4" y="3" width="16" height="18" rx="2"/>
                    }
                  </svg>
                  {layout === "duplex" ? "Double-sided" : "Single-sided"}
                </span>

                {/* Orientation chip */}
                <span className="or-icon-pill">
                  {orientation === "portrait"
                    ? <svg width="10" height="13" viewBox="0 0 10 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="1" width="8" height="11" rx="1.5"/></svg>
                    : <svg width="13" height="10" viewBox="0 0 13 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="1" width="11" height="8" rx="1.5"/></svg>
                  }
                  {orientation === "portrait" ? "Portrait" : "Landscape"}
                </span>
              </div>
            </div>
          </div>

          {/* ── Personal & Shop Details ── */}
          <div>
            <h3 className="or-sec-heading">Personal & Shop Details</h3>
            <div className="or-section">

              {/* Phone */}
              <div className="or-row">
                {editPhone ? (
                  <input
                    className="or-phone-input"
                    value={phoneVal}
                    onChange={e => setPhoneVal(e.target.value)}
                    onBlur={() => setEditPhone(false)}
                    autoFocus
                  />
                ) : (
                  <span style={{ fontWeight: 600, color: "#1a2340", fontSize: "0.9rem" }}>{phoneVal}</span>
                )}
                <button onClick={() => setEditPhone(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", padding: "2px" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </div>

              {/* Kiosk info */}
              <div style={{ padding: "12px 14px", borderBottom: "1px solid #f0f1f7" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                      <span style={{ fontWeight: 700, color: "#1a2340", fontSize: "0.92rem" }}>{kioskName}</span>
                      <span className={`or-tag ${kioskOpen ? "or-tag-open" : "or-tag-closed"}`}>
                        {kioskOpen ? "Open" : "Closed"}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#888" }}>{kioskLoc}</p>
                  </div>
                  {/* Kiosk illustration */}
                  <div style={{ width: "48px", height: "56px", flexShrink: 0, background: "#f0f1f7", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="28" height="36" viewBox="0 0 28 36" fill="none">
                      <rect x="4"  y="0"  width="20" height="28" rx="3" fill="#4a5fc1" opacity="0.15"/>
                      <rect x="4"  y="0"  width="20" height="28" rx="3" stroke="#4a5fc1" strokeWidth="1.5"/>
                      <rect x="8"  y="4"  width="12" height="8"  rx="1.5" fill="#4a5fc1" opacity="0.3"/>
                      <rect x="8"  y="15" width="5"  height="5"  rx="1" fill="#4a5fc1" opacity="0.5"/>
                      <rect x="15" y="15" width="5"  height="5"  rx="1" fill="#4a5fc1" opacity="0.5"/>
                      <rect x="8"  y="22" width="12" height="3"  rx="1" fill="#4a5fc1" opacity="0.3"/>
                      <rect x="10" y="28" width="8"  height="4"  rx="1" fill="#4a5fc1" opacity="0.2"/>
                      <rect x="6"  y="32" width="16" height="4"  rx="2" fill="#4a5fc1" opacity="0.15"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="or-row">
                <span style={{ fontSize: "0.85rem", color: "#666", display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                  {kioskHours}
                </span>
              </div>
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div>
            <h3 className="or-sec-heading">Order Summary</h3>
            <div className="or-section">
              <div style={{ padding: "10px 14px 4px", borderBottom: "1px solid #f0f1f7" }}>
                <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, color: "#1a2340", letterSpacing: "0.04em" }}>Bill Details</p>
              </div>
              <div className="or-row">
                <span className="or-row-label">Total Files</span>
                <span className="or-row-val">{files.length} File{files.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="or-row">
                <span className="or-row-label">Total Pages</span>
                <span className="or-row-val">{totalFilePages} Page{totalFilePages !== 1 ? "s" : ""}</span>
              </div>
              <div className="or-row">
                <span className="or-row-label">Sheets ({colorLabel}, {layout === "duplex" ? "Duplex" : "Simplex"})</span>
                <span className="or-row-val">₹ {printCost.toFixed(2)}</span>
              </div>
              <div className="or-row">
                <span className="or-row-label" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  Service Fee
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </span>
                <span className="or-row-val">₹ {serviceFee.toFixed(2)}</span>
              </div>

              {/* Grand total */}
              <div className="or-grand">
                <span>Grand Total</span>
                <span style={{ fontSize: "1.15rem" }}>₹ {grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Sticky footer ── */}
        <div className="or-footer">
          <div className="or-footer-left">
            Total {totalFilePages} page{totalFilePages !== 1 ? "s" : ""}
            <strong>₹ {grandTotal.toFixed(2)}</strong>
          </div>
          <button className="or-proceed" style={{ width: "auto", padding: "13px 28px" }} onClick={onProceed}>
            Proceed to Pay
          </button>
        </div>

      </div>
    </>
  );
}
