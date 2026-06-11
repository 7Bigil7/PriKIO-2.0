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
    const interval = setInterval(() => {
      const diff = Math.floor((new Date(otpData.expiresAt).getTime() - Date.now()) / 1000)
      if (diff > 0) {
        setTimeLeft(diff)
      } else {
        setTimeLeft(0)
      }
    }, 1000)
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

    const formatTime = (secs: number) => {
      const m = Math.floor(secs / 60)
      const s = secs % 60
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    return (
      <div className="page-root otp-page">
        {/* Desktop left branding panel */}
        <div className="desktop-left-panel">
          <div className="dlp-step-pill">OTP — Active</div>
          <svg className="dlp-icon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <h2 className="dlp-heading">Verify Kiosk</h2>
          <p className="dlp-sub">Enter the code on the kiosk screen to authorize your print queue.</p>
          <hr className="dlp-divider" />
          <div className="dlp-dots">
            <span className="dlp-dot active"></span>
            <span className="dlp-dot active"></span>
            <span className="dlp-dot active"></span>
            <span className="dlp-dot active"></span>
          </div>
        </div>

        <div className="desktop-right-panel">
          <div className="screen-tag" style={{ textAlign: 'center', fontSize: '10px', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--grey)', marginBottom: '12px' }}>OTP — Active</div>
          <div className="phone-card otp-card" style={{ padding: 0, borderRadius: '20px', overflow: 'hidden', width: 'min(400px, 100%)', boxShadow: '0 4px 32px rgba(0,0,0,0.10)' }}>
            
            <div className="otp-header" style={{ background: '#1a2340', padding: '2rem 2rem 1.5rem', textAlign: 'center' }}>
              <h1 style={{ fontFamily: 'var(--serif), Georgia, serif', fontSize: '1.6rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem', marginTop: 0 }}>Verify Kiosk</h1>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, maxWidth: '260px', margin: '0 auto' }}>Enter this code on the kiosk screen to authorize your print queue.</p>
            </div>

            <div className="otp-body" style={{ background: 'white', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', textAlign: 'center' }}>
              <svg width="200" height="200" viewBox="0 0 200 200">
                {/* Grey track */}
                <circle cx="100" cy="100" r="85" fill="white" stroke={timeLeft === 0 ? "#e8eaf6" : "#e8eaf6"} strokeWidth="6" />
                {/* Animated progress arc */}
                <circle
                  cx="100" cy="100" r="85"
                  fill="none"
                  stroke={timeLeft === 0 ? "#e8eaf6" : (timeLeft <= 30 ? "#e24b4a" : "#4a5fc1")}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="534"
                  strokeDashoffset={timeLeft === 0 ? 534 : 534 - (534 * timeLeft) / 120}
                  transform="rotate(-90 100 100)"
                  id="otp-ring"
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
                />
                
                {/* Label */}
                <text x="100" y="72" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="9" fontWeight="600" fill="#aaa" letterSpacing="2">ONE-TIME PASSCODE</text>

                {/* OTP digits */}
                <text x="100" y="112" textAnchor="middle" fontFamily="'Courier New', Courier, monospace" fontSize="32" fontWeight="700" fill="#1a2340" letterSpacing="8" id="otp-digits" style={{ opacity: timeLeft === 0 ? 0.3 : 1 }}>
                  {otpData?.otp ? otpData.otp : '......'}
                </text>

                {/* Timer */}
                <text x="100" y="142" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="600" fill={timeLeft === 0 ? "#e24b4a" : (timeLeft <= 30 ? "#e24b4a" : "#4a5fc1")} id="otp-timer">
                  {timeLeft === 0 ? 'EXPIRED' : formatTime(timeLeft)}
                </text>
              </svg>

              <p className="otp-disclaimer" style={{ fontSize: '0.8rem', color: '#aaa', textAlign: 'center', maxWidth: '280px', lineHeight: 1.5, margin: '0 auto' }}>
                This code is unique to your session and will expire shortly. Do not share this code with others.
              </p>

              {timeLeft === 0 && (
                <button 
                  onClick={() => generateOtp(printJobId!)}
                  style={{ 
                    background: '#1a2340', color: 'white', border: 'none', borderRadius: '50px', 
                    padding: '12px 28px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', 
                    width: '100%', marginTop: '0.5rem', transition: 'opacity 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Regenerate Code
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
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
