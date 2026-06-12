'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'

function StatusScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const printJobId = searchParams.get('id') || sessionStorage.getItem('printJobId')
  
  const [printJob, setPrintJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [otpData, setOtpData] = useState<{ otp: string, expiresAt: string } | null>(null)
  const [timeLeft, setTimeLeft] = useState(120)
  const [showOTP, setShowOTP] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!printJobId) {
      router.push('/')
      return
    }

    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/print-jobs/${printJobId}`)
        const result = await res.json()
        if (res.ok) {
          setPrintJob(result.data)
          if (result.data.status === 'processing') {
            setTimeout(fetchJob, 3000)
          } else if (result.data.status === 'ready_for_kiosk' && !otpData && !result.data.otp_code) {
            generateOtp(printJobId)
          } else if (result.data.otp_code) {
            setOtpData({ otp: result.data.otp_code, expiresAt: result.data.otp_expires_at })
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
    
    const interval = setInterval(() => {
      if (printJob?.status === 'processing' || printJob?.status === 'pending') {
        fetchJob()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [printJobId, router, printJob?.status, otpData])

  const generateOtp = async (id: string) => {
    try {
      const res = await fetch('/api/otp/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printJobId: id })
      })
      const result = await res.json()
      if (res.ok) {
        setOtpData({ otp: result.data.otp, expiresAt: result.data.expiresAt })
      }
    } catch (err) {
      console.error('Failed to generate OTP', err)
    }
  }

  useEffect(() => {
    if (!otpData) return
    const updateTimer = () => {
      const diff = Math.floor((new Date(otpData.expiresAt).getTime() - Date.now()) / 1000)
      setTimeLeft(diff > 0 ? diff : 0)
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [otpData])

  if (loading) return null

  if (printJob?.status === 'processing' || printJob?.status === 'pending') {
    return (
      <div>
        <div className="stag" style={{ textAlign: 'center', fontSize: '10px', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--grey)', margin: '24px 0 12px' }}>Processing Payment</div>
        <div className="phone-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 22px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
              <div style={{ width: '28px', height: '28px' }}>
                <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--gd)' }}>Presidency University</div>
            </div>

            <div style={{ position: 'relative', width: '130px', height: '130px', marginBottom: '24px' }}>
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1.5px solid #E5E7EB' }}></div>
              <div style={{ position: 'absolute', inset: '14px', borderRadius: '50%', border: '1.5px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
              <div style={{ position: 'absolute', inset: '40px', borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '22px', height: '22px', stroke: '#fff', fill: 'none', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }} viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            <h1 style={{ fontFamily: 'var(--serif)', fontSize: '26px', fontWeight: 600, fontStyle: 'italic', color: 'var(--gd)', marginBottom: '8px', textAlign: 'center' }}>Securely Processing..</h1>
            <p style={{ fontSize: '12px', color: 'var(--grey)', fontWeight: 300, lineHeight: 1.65, textAlign: 'center', maxWidth: '200px', marginBottom: '22px' }}>Waiting for payment confirmation from your provider.</p>

            <div style={{ width: '100%', background: 'var(--gl)', border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--grey)', marginBottom: '10px' }}>Print Queue</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px', color: 'var(--grey)', fontWeight: 300 }}>{printJob?.file_name}</span>
                <span style={{ fontSize: '12px', color: 'var(--gd)', fontWeight: 500, textAlign: 'right' }}>{printJob?.page_count} pgs</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (printJob?.status === 'ready_for_kiosk' || printJob?.status === 'completed') {
    if (printJob?.status === 'completed') {
      return (
        <div>
          <div className="stag" style={{ textAlign: 'center', fontSize: '10px', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--grey)', margin: '24px 0 12px' }}>Print Receipt</div>
          <div className="phone-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--green-s)', color: 'var(--green)', border: '1px solid #A7F3D0', borderRadius: '9999px', padding: '4px 12px', fontSize: '11px', fontWeight: 600, marginBottom: '20px', marginTop: '40px' }}>
                <svg style={{ width: '12px', height: '12px', stroke: 'currentColor', fill: 'none', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' }} viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                Print Completed
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '36px', fontWeight: 600, color: 'var(--gd)', marginBottom: '4px' }}>₹ {printJob.total_amount.toFixed(2)}</div>
              <p style={{ fontSize: '12px', color: 'var(--grey)' }}>Document successfully printed at kiosk.</p>
              
              <button 
                onClick={() => router.push('/')}
                style={{ width: '100%', marginTop: '40px', background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: '12px', padding: '14px', fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    const expired = timeLeft === 0;
    const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const secs = String(timeLeft % 60).padStart(2, "0");

    const handleCopy = () => {
      if (!otpData) return;
      navigator.clipboard.writeText(otpData.otp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const otpDigits = otpData?.otp ? otpData.otp.split("") : ["-","-","-","-"];

    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');

          .vk-root {
            height: 100dvh; width: 100vw;
            display: flex; overflow: hidden;
            font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f0f2f5;
          }
          
          .vk-root * {
            font-family: inherit;
          }

          /* Desktop split */
          .vk-left {
            width: 44%; background: #1a2340;
            display: flex; flex-direction: column;
            justify-content: center; padding: clamp(32px,5vw,72px);
            flex-shrink: 0;
          }
          .vk-badge {
            display: inline-flex; align-items: center; gap: 6px;
            background: rgba(255,255,255,0.08); border-radius: 20px;
            padding: 6px 14px; font-size: 11px; font-weight: 700;
            letter-spacing: 0.1em; color: #a0aec0; margin-bottom: 40px;
            width: fit-content;
          }
          .vk-badge-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; }
          .vk-left-icon { font-size: 32px; margin-bottom: 20px; opacity: 0.7; }
          .vk-left-title {
            font-size: clamp(28px,3.5vw,42px); color: #fff;
            font-weight: 700;
            margin-bottom: 16px; line-height: 1.2;
          }
          .vk-left-sub { font-size: 15px; color: #8892a4; line-height: 1.6; max-width: 280px; }
          .vk-dots { display: flex; gap: 8px; margin-top: 48px; }
          .vk-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.2); }
          .vk-dot.active { background: #4a5fc1; }

          /* Right panel */
          .vk-right {
            flex: 1; background: #f0f2f5;
            display: flex; align-items: center; justify-content: center;
            padding: clamp(16px,3vw,40px); overflow: hidden;
          }

          .vk-card {
            background: #fff; border-radius: 20px;
            width: 100%; max-width: 400px;
            overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.10);
          }
          .vk-card-header {
            background: #1a2340; padding: 24px 28px 20px;
            text-align: center;
          }
          .vk-card-title {
            font-size: clamp(18px,2.5vw,22px); color: #fff;
            font-weight: 700;
            margin-bottom: 8px;
          }
          .vk-card-sub { font-size: 13px; color: #8892a4; line-height: 1.5; }

          .vk-card-body { padding: clamp(20px,4vw,32px) clamp(16px,4vw,28px); }

          /* QR Box */
          .vk-qr-wrap {
            display: flex; flex-direction: column; align-items: center;
            margin-bottom: 24px;
          }
          .vk-qr-box {
            width: 160px; height: 160px; background: #f7f8fa;
            border: 2px solid #e2e8f0; border-radius: 12px;
            display: flex; align-items: center; justify-content: center;
            margin-bottom: 12px; position: relative; overflow: hidden;
          }
          .vk-qr-inner {
            width: 120px; height: 120px;
            background: repeating-conic-gradient(#1a2340 0% 25%, #fff 0% 50%) 0 0 / 10px 10px;
            border-radius: 4px;
          }
          .vk-expires {
            font-size: 12px; color: #8892a4;
            display: flex; align-items: center; gap: 5px;
          }
          .vk-expires-time { color: #4a5fc1; font-weight: 600; }

          /* Expired state */
          .vk-expired-label {
            font-size: 13px; font-weight: 700; color: #e53e3e;
            letter-spacing: 0.08em; margin-top: 6px;
          }
          .vk-qr-expired { opacity: 0.3; filter: grayscale(1); }

          /* Action buttons */
          .vk-btn-primary {
            width: 100%; padding: 14px; border-radius: 50px;
            background: #1a2340; color: #fff; border: none;
            font-size: 15px; font-weight: 600; cursor: pointer;
            display: flex; align-items: center; justify-content: center; gap: 8px;
            margin-bottom: 12px; transition: opacity 0.2s;
          }
          .vk-btn-primary:hover { opacity: 0.88; }
          .vk-btn-row { display: flex; gap: 10px; margin-bottom: 20px; }
          .vk-btn-ghost {
            flex: 1; padding: 12px 8px; border-radius: 50px;
            background: transparent; border: 1.5px solid #d1d5db;
            color: #1a2340; font-size: 14px; font-weight: 600;
            cursor: pointer; display: flex; align-items: center;
            justify-content: center; gap: 6px; transition: border-color 0.2s;
          }
          .vk-btn-ghost:hover { border-color: #4a5fc1; color: #4a5fc1; }
          .vk-btn-regen {
            width: 100%; padding: 14px; border-radius: 50px;
            background: #1a2340; color: #fff; border: none;
            font-size: 15px; font-weight: 600; cursor: pointer;
            margin-bottom: 20px;
            transition: opacity 0.2s;
          }
          .vk-btn-regen:hover { opacity: 0.88; }

          /* How to steps */
          .vk-steps-title {
            font-size: 13px; font-weight: 700; color: #8892a4;
            letter-spacing: 0.08em; margin-bottom: 12px;
          }
          .vk-step { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
          .vk-step-num {
            width: 22px; height: 22px; border-radius: 50%;
            background: #4a5fc1; color: #fff;
            font-size: 11px; font-weight: 700;
            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          }
          .vk-step-text { font-size: 13px; color: #4a5568; line-height: 1.5; }

          /* OTP Modal */
          .vk-modal-overlay {
            position: fixed; inset: 0;
            background: rgba(0,0,0,0.45);
            display: flex; align-items: flex-end; justify-content: center;
            z-index: 100;
          }
          @media (min-width: 640px) {
            .vk-modal-overlay { align-items: center; }
            .vk-modal { border-radius: 20px !important; max-width: 360px; width: 100%; }
          }
          .vk-modal {
            background: #fff;
            border-radius: 20px 20px 0 0;
            padding: 28px 28px 36px;
            width: 100%; position: relative;
            animation: slideUp 0.3s cubic-bezier(0.4,0,0.2,1);
          }
          @keyframes slideUp { from { transform: translateY(60px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .vk-modal-close {
            position: absolute; top: 16px; right: 16px;
            width: 28px; height: 28px; border-radius: 50%;
            background: #f0f2f5; border: none; cursor: pointer;
            font-size: 16px; display: flex; align-items: center; justify-content: center;
            color: #4a5568;
          }
          .vk-modal-title {
            font-size: 20px; color: #1a2340;
            font-weight: 700;
            text-align: center; margin-bottom: 24px;
          }
          .vk-otp-digits {
            display: flex; justify-content: center; gap: clamp(12px,4vw,24px);
            margin-bottom: 12px;
          }
          .vk-otp-digit {
            font-size: clamp(36px,10vw,52px); font-weight: 700;
            color: #1a2340; line-height: 1;
          }
          .vk-copy-btn {
            display: block; margin: 0 auto 24px;
            background: none; border: none;
            color: #4a5fc1; font-size: 14px; font-weight: 600;
            cursor: pointer; letter-spacing: 0.02em;
          }
          .vk-btn-wa {
            width: 100%; padding: 13px; border-radius: 50px;
            background: transparent; border: 1.5px solid #25d366;
            color: #25d366; font-size: 14px; font-weight: 600;
            cursor: pointer; display: flex; align-items: center;
            justify-content: center; gap: 8px; margin-top: 10px;
            transition: background 0.2s;
          }
          .vk-btn-wa:hover { background: rgba(37,211,102,0.08); }

          /* Mobile: hide left panel */
          @media (max-width: 639px) {
            .vk-left { display: none; }
            .vk-right {
              background: #1a2340;
              align-items: center; justify-content: center;
              padding: 16px;
            }
            .vk-card { max-width: 100%; }
          }
        `}</style>

        <div className="vk-root">
          {/* Left info panel */}
          <div className="vk-left">
            <div className="vk-badge"><div className="vk-badge-dot" /> OTP — ACTIVE</div>
            <div className="vk-left-icon">🔐</div>
            <h1 className="vk-left-title">Verify Kiosk</h1>
            <p className="vk-left-sub">Enter the code on the kiosk screen to authorize your print queue.</p>
            <div className="vk-dots">
              <div className="vk-dot active" />
              <div className="vk-dot active" />
              <div className="vk-dot active" />
              <div className="vk-dot active" />
            </div>
          </div>

          {/* Right content panel */}
          <div className="vk-right">
            <div className="vk-card">
              <div className="vk-card-header">
                <h2 className="vk-card-title">Your Print Code is Ready!</h2>
                <p className="vk-card-sub">Use this QR code or OTP at any CampusPrint kiosk within 24 hours.</p>
              </div>
              <div className="vk-card-body">
                <div className="vk-qr-wrap">
                  <div className={`vk-qr-box${expired ? " vk-qr-expired" : ""}`}>
                    <div className="vk-qr-inner" />
                  </div>
                  {!expired
                    ? <p className="vk-expires">Expires in <span className="vk-expires-time">{mins}:{secs}</span></p>
                    : <p className="vk-expired-label">EXPIRED</p>
                  }
                </div>

                {!expired ? (
                  <>
                    <button className="vk-btn-primary">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      Download
                    </button>
                    <div className="vk-btn-row">
                      <button className="vk-btn-ghost" onClick={() => setShowOTP(true)}>View OTP</button>
                      <button className="vk-btn-ghost">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                        Share
                      </button>
                    </div>
                  </>
                ) : (
                  <button className="vk-btn-regen" onClick={() => generateOtp(printJobId!)}>Regenerate Code</button>
                )}

                <p className="vk-steps-title">HOW TO PRINT AT THE KIOSK</p>
                {["Go to the nearest CampusPrint kiosk.", "Scan QR or enter OTP on the screen.", "Collect your prints!"].map((s, i) => (
                  <div className="vk-step" key={i}>
                    <div className="vk-step-num">{i + 1}</div>
                    <p className="vk-step-text">{s}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* OTP Modal */}
        {showOTP && (
          <div className="vk-modal-overlay" onClick={() => setShowOTP(false)}>
            <div className="vk-modal" onClick={e => e.stopPropagation()}>
              <button className="vk-modal-close" onClick={() => setShowOTP(false)}>×</button>
              <h3 className="vk-modal-title">OTP Code</h3>
              <div className="vk-otp-digits">
                {otpDigits.map((d, i) => <span className="vk-otp-digit" key={i} style={{ color: expired ? '#a0aec0' : '#1a2340' }}>{d}</span>)}
              </div>
              {expired && <p style={{textAlign: 'center', color: '#e53e3e', fontWeight: 700, fontSize: '13px', marginTop: '-8px', marginBottom: '12px'}}>EXPIRED</p>}
              
              {!expired ? (
                <>
                  <button className="vk-copy-btn" onClick={handleCopy}>{copied ? "Copied!" : "Copy"}</button>
                  <button className="vk-btn-primary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Download
                  </button>
                  <button className="vk-btn-wa">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    Share via WhatsApp
                  </button>
                </>
              ) : (
                <button className="vk-btn-regen" onClick={() => generateOtp(printJobId!)}>Regenerate Code</button>
              )}
            </div>
          </div>
        )}
      </>
    )
  }

  return null
}

export default function Status() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px', color: 'var(--grey)' }}>Loading...</div>}>
      <StatusScreen />
    </Suspense>
  )
}
