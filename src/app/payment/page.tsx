'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

export default function Payment() {
  const router = useRouter()
  const [printJob, setPrintJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orderData, setOrderData] = useState<any>(null)

  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false)

  useEffect(() => {
    const printJobId = sessionStorage.getItem('printJobId')
    if (!printJobId) {
      router.push('/upload')
      return
    }

    const fetchJob = async () => {
      try {
        const cached = sessionStorage.getItem('printJobData')
        if (cached) {
          setPrintJob(JSON.parse(cached))
          setLoading(false)
          return
        }

        const res = await fetch(`/api/print-jobs/${printJobId}`)
        const result = await res.json()
        if (res.ok) {
          setPrintJob(result.data)
        } else {
          setError(result.error)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [router])

  const handlePay = async () => {
    try {
      // BYPASS RAZORPAY FOR TESTING
      // Show local payment success screen
      setIsPaymentSuccess(true)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const openRazorpay = (data: any) => {
    // Kept for reference but not used in bypass mode
  }

  if (loading) return null

  if (error || !printJob) {
    return <div style={{ padding: '20px', color: 'red' }}>{error || 'Failed to load print job.'}</div>
  }

  if (isPaymentSuccess) {
    return (
      <div style={{ minHeight: '100dvh', width: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a2340', margin: 0, padding: 0 }}>
        <div style={paymentSuccessStyles.wrap}>
          <style>{paymentSuccessCss}</style>
          <div style={paymentSuccessStyles.circleWrap}>
            <div className="ps-glow" />
            <svg style={paymentSuccessStyles.svg} viewBox="0 0 100 100">
              <circle className="ps-ring" cx="50" cy="50" r="40" />
            </svg>
            <svg style={paymentSuccessStyles.checkSvg} viewBox="0 0 46 46">
              <path className="ps-check" d="M11 23 L20 32 L35 15" />
            </svg>
          </div>

          <p className="ps-title">Payment Successful</p>
          <p className="ps-amount">₹ {printJob.total_amount.toFixed(2)}</p>

          <div className="ps-status">
            <div style={paymentSuccessStyles.dot}><div style={paymentSuccessStyles.dotInner} /></div>
            <span style={paymentSuccessStyles.statusText}>ORDER CONFIRMED</span>
          </div>

          <button className="ps-btn" onClick={() => router.push(`/status?id=${printJob.id}`)}>View Receipt</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-root">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Desktop left branding panel */}
      <div className="desktop-left-panel">
        <div className="dlp-step-pill">Step 3 of 3</div>
        <svg className="dlp-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="14" width="28" height="22" rx="4" stroke="white" strokeWidth="1.8"/>
          <path d="M18 14V10a6 6 0 0 1 12 0v4" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="24" cy="26" r="3" fill="white" opacity="0.9"/>
          <path d="M24 29v3" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <h2 className="dlp-heading">Secure Payment</h2>
        <p className="dlp-sub">Pay instantly using UPI or scan the QR code. Your transaction is end-to-end encrypted.</p>
        {printJob && (
          <div className="dlp-amount-display">₹ {printJob.total_amount.toFixed(2)}</div>
        )}
        <hr className="dlp-divider" />
        <div className="dlp-dots">
          <span className="dlp-dot active"></span>
          <span className="dlp-dot active"></span>
          <span className="dlp-dot active"></span>
        </div>
      </div>

      <div className="desktop-right-panel">
        <div className="screen-tag">Payment — Android / UPI</div>
        <div className="phone-card" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
          <div className="top-bar" style={{ flexShrink: 0 }}>
            <button className="back-btn" onClick={() => router.back()} aria-label="Back">
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="screen-title" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic' }}>Secure Payment</span>
          </div>

          <div className="screen-body" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '0' }}>
            <div className="summary-card" style={{ background: 'var(--gl)', border: '1px solid var(--border)', borderRadius: '14px', padding: 'clamp(10px, 3vh, 14px) clamp(12px, 4vw, 16px)', marginBottom: '4px' }}>
              <div className="summary-label" style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--grey)', marginBottom: 'clamp(4px, 1.5vh, 6px)' }}>Total Amount Due</div>
              <div className="summary-amount" style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px, 8vh, 36px)', fontWeight: 600, color: 'var(--gd)', lineHeight: 1, marginBottom: 'clamp(8px, 2vh, 12px)' }}>₹ {printJob.total_amount.toFixed(2)}</div>
              <div style={{ height: '1px', background: 'var(--border)', marginBottom: 'clamp(6px, 2vh, 10px)' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(4px, 1vh, 6px)' }}>
                <span style={{ fontSize: 'clamp(11px, 3vw, 12px)', color: 'var(--grey)', fontWeight: 300 }}>{printJob.sheetCount} Sheets ({printJob.colorMode})</span>
                <span style={{ fontSize: 'clamp(11px, 3vw, 12px)', color: 'var(--gd)', fontWeight: 500 }}>₹ {(printJob.total_amount - 2).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'clamp(11px, 3vw, 12px)', color: 'var(--grey)', fontWeight: 300 }}>Processing Fee</span>
                <span style={{ fontSize: 'clamp(11px, 3vw, 12px)', color: 'var(--gd)', fontWeight: 500 }}>₹ 2.00</span>
              </div>
            </div>

            <button 
              onClick={() => router.push('/')}
              style={{ width: '100%', background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: '12px', padding: 'clamp(12px, 3vh, 15px)', fontFamily: 'var(--sans)', fontSize: 'clamp(13px, 3.5vw, 14px)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s', letterSpacing: '-.01em', marginTop: 'clamp(12px, 3vh, 20px)' }}
            >
              Cancel Order
            </button>

            <div className="s-label" style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--grey)', marginBottom: 'clamp(6px, 2vh, 10px)', marginTop: 'clamp(12px, 3vh, 20px)' }}>Or Scan QR</div>
            <div style={{ border: '1.5px dashed #CBD5E1', borderRadius: '14px', padding: 'clamp(12px, 3vh, 20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'clamp(160px, 25vh, 220px)', marginBottom: '0' }}>
              <div style={{ width: 'clamp(80px, 15vh, 110px)', height: 'clamp(80px, 15vh, 110px)', marginBottom: 'clamp(6px, 1.5vh, 10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={handlePay}>
                <svg width="100%" height="100%" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 30 L10 10 L30 10" stroke="#0D1F3C" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M80 10 L100 10 L100 30" stroke="#0D1F3C" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 80 L10 100 L30 100" stroke="#0D1F3C" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M80 100 L100 100 L100 80" stroke="#0D1F3C" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="38" y="38" width="34" height="34" rx="4" fill="#0D1F3C"/>
                  <line x1="20" y1="55" x2="35" y2="55" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 2" strokeLinecap="round"/>
                  <line x1="75" y1="55" x2="90" y2="55" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 2" strokeLinecap="round"/>
                  <line x1="55" y1="20" x2="55" y2="35" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 2" strokeLinecap="round"/>
                  <line x1="55" y1="75" x2="55" y2="90" stroke="#CBD5E1" strokeWidth="1.5" strokeDasharray="3 2" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{ fontSize: 'clamp(9px, 2.5vw, 11px)', color: 'var(--grey)', fontWeight: 300, textAlign: 'center', lineHeight: 1.55 }}>Scan this code using any UPI app<br/>on another device to pay</div>
            </div>
          </div>

          <div style={{ flexShrink: 0, padding: 'clamp(10px, 2vh, 14px) 18px env(safe-area-inset-bottom, 12px)', borderTop: '1px solid var(--border)', background: 'var(--bg)', marginTop: 'auto' }}>
            <button 
              onClick={handlePay}
              style={{ width: '100%', background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: '12px', padding: '15px', fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px', transition: 'background .15s' }}
            >
              <svg style={{ width: '16px', height: '16px', stroke: 'currentColor', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }} viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Pay with UPI Apps
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const paymentSuccessStyles = {
  wrap: {
    minHeight: "unset",
    width: "min(340px, 90vw)",
    background: "#1a2340",
    borderRadius: 20,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "clamp(30px, 8vw, 60px) clamp(20px, 5vw, 40px)",
    position: "relative" as const,
    overflow: "hidden",
  },
  circleWrap: { position: "relative" as const, width: "clamp(80px, 20vw, 100px)", height: "clamp(80px, 20vw, 100px)", marginBottom: "clamp(20px, 5vw, 28px)" },
  svg: { width: "100%", height: "100%", transform: "rotate(-90deg)" },
  checkSvg: { position: "absolute" as const, top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "clamp(36px, 10vw, 46px)", height: "clamp(36px, 10vw, 46px)" },
  dot: { width: "clamp(10px, 3vw, 14px)", height: "clamp(10px, 3vw, 14px)", borderRadius: "50%", border: "2px solid #22c55e", display: "flex", alignItems: "center", justifyContent: "center" },
  dotInner: { width: "clamp(4px, 1.2vw, 5px)", height: "clamp(4px, 1.2vw, 5px)", borderRadius: "50%", background: "#22c55e" },
  statusText: { fontSize: "clamp(9px, 2.5vw, 11px)", fontWeight: 700, letterSpacing: "0.12em", color: "#22c55e", textTransform: "uppercase" as const },
};

const paymentSuccessCss = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&display=swap');

  html, body, #root { 
    margin: 0 !important; 
    padding: 0 !important; 
    height: 100% !important; 
    overflow: hidden !important; 
    background: #1a2340 !important; 
  }

  .ps-ring {
    fill: none; stroke: #4a5fc1; stroke-width: 3; stroke-linecap: round;
    stroke-dasharray: 251.2; stroke-dashoffset: 251.2;
    animation: drawRing 0.9s cubic-bezier(0.4,0,0.2,1) 0.2s forwards;
  }
  .ps-check {
    fill: none; stroke: #22c55e; stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round;
    stroke-dasharray: 60; stroke-dashoffset: 60;
    animation: drawCheck 0.5s cubic-bezier(0.4,0,0.2,1) 1.1s forwards;
  }
  .ps-glow {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
    width: 90%; height: 90%; border-radius: 50%;
    background: radial-gradient(circle, rgba(34,197,94,0.18) 0%, transparent 70%);
    animation: glowPulse 2s ease-in-out 1.6s infinite;
  }
  .ps-title {
    font-family: 'Playfair Display', serif; font-size: clamp(20px, 6vw, 26px); font-weight: 600;
    color: #fff; opacity: 0; margin-bottom: clamp(8px, 2vw, 12px);
    text-align: center;
    animation: fadeIn 0.6s ease 1.5s forwards;
  }
  .ps-amount {
    font-size: clamp(28px, 8vw, 38px); font-weight: 700; color: #4a5fc1;
    opacity: 0; transform: translateY(16px); margin-bottom: clamp(4px, 1vw, 6px);
    animation: slideUp 0.5s cubic-bezier(0.4,0,0.2,1) 1.9s forwards;
  }
  .ps-status {
    display: flex; align-items: center; gap: clamp(4px, 1.5vw, 6px);
    opacity: 0; transform: translateY(14px); margin-bottom: clamp(20px, 5vw, 28px);
    animation: slideUp 0.5s cubic-bezier(0.4,0,0.2,1) 2.1s forwards;
  }
  .ps-btn {
    opacity: 0; transform: translateY(14px);
    animation: slideUp 0.5s cubic-bezier(0.4,0,0.2,1) 2.3s forwards;
    background: #4a5fc1; color: #fff; border: none; border-radius: 50px;
    padding: clamp(10px, 3vw, 13px) clamp(24px, 6vw, 36px); font-size: clamp(13px, 3.5vw, 15px); font-weight: 600; cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    width: 100%;
  }
  .ps-btn:hover { background: #5c72d8; transform: scale(1.03); }
  .ps-btn:active { transform: scale(0.97); }

  @keyframes drawRing { to { stroke-dashoffset: 0; } }
  @keyframes drawCheck { to { stroke-dashoffset: 0; } }
  @keyframes glowPulse {
    0%, 100% { opacity: 0.5; transform: translate(-50%,-50%) scale(1); }
    50% { opacity: 1; transform: translate(-50%,-50%) scale(1.15); }
  }
  @keyframes fadeIn { to { opacity: 1; } }
  @keyframes slideUp { to { opacity: 1; transform: translateY(0); } }
`;
