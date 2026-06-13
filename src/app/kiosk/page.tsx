'use client'

import { useState } from 'react'

export default function Kiosk() {
  const [otp, setOtp] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [successData, setSuccessData] = useState<any>(null)

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 6) return
    setVerifying(true)
    setError('')

    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp, kioskId: 'LIB-04' })
      })
      const result = await res.json()
      if (res.ok) {
        setSuccessData(result.data.printJob)
      } else {
        setError(result.error)
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div style={{ background: 'var(--body-bg)', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--sans)' }}>
      <div style={{ width: '1920px', height: '1080px', background: 'var(--bg)', position: 'relative', overflow: 'hidden', borderRadius: '24px', boxShadow: '0 40px 100px rgba(0,0,0,0.1)', transform: 'scale(0.6)', transformOrigin: 'center' }}>
        
        <header style={{ background: 'var(--navy)', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 60px' }}>
          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>CampusPrint Kiosk</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '20px', fontWeight: 400, display: 'flex', gap: '40px', alignItems: 'center' }}>
            <span>LIB-04</span>
            <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        </header>

        {successData ? (
          <div style={{ display: 'flex', height: 'calc(1080px - 120px)' }}>
            <aside style={{ width: '400px', borderRight: '2px solid var(--border)', padding: '60px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.2em', color: 'var(--grey)', textTransform: 'uppercase' }}>Current Session</div>
              <div>
                <h3 style={{ fontSize: '32px', fontWeight: 600, color: 'var(--gd)', marginBottom: '8px' }}>User Session</h3>
                <p style={{ fontSize: '18px', fontWeight: 400, color: 'var(--grey)' }}>Verified via OTP</p>
              </div>
              <hr style={{ border: 'none', borderTop: '2px solid var(--border)', margin: '20px 0' }} />
              <div style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.2em', color: 'var(--grey)', textTransform: 'uppercase', marginBottom: '-20px' }}>Print Queue</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '24px 32px', background: 'var(--gl)', borderRadius: '16px' }}>
                  <div style={{ width: '64px', height: '72px', background: 'var(--accent-s)', border: '2px solid var(--accent)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--gd)', marginBottom: '8px' }}>{successData.file_name}</div>
                    <div style={{ fontSize: '18px', fontWeight: 300, color: 'var(--grey)' }}>{successData.page_count} pages • {successData.color_mode} • {successData.sides}</div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 'auto' }}>
                <button onClick={() => { setSuccessData(null); setOtp(''); }} style={{ width: '100%', background: 'transparent', color: 'var(--gd)', padding: '24px 60px', borderRadius: '9999px', fontSize: '24px', fontWeight: 500, border: '2px solid var(--border)', cursor: 'pointer', transition: 'border-color 0.2s' }}>End Session</button>
              </div>
            </aside>
            <main style={{ flex: 1, padding: '80px 120px', position: 'relative', background: 'var(--bg)' }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '48px', fontWeight: 600, color: 'var(--gd)', marginBottom: '60px' }}>Printing in Progress</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '60px', marginBottom: '80px' }}>
                <div style={{ position: 'relative', width: '160px', height: '160px' }}>
                  <svg style={{ transform: 'rotate(-90deg)', width: '160px', height: '160px' }} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="46" fill="none" stroke="#E5E7EB" strokeWidth="8"></circle>
                    <circle cx="50" cy="50" r="46" fill="none" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round" strokeDasharray="289" strokeDashoffset="75"></circle>
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontSize: '48px', fontWeight: 600, color: 'var(--gd)' }}>
                    1<span style={{ fontSize: '24px', color: 'var(--grey)' }}>/{successData.page_count}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 600, color: 'var(--gd)', marginBottom: '12px' }}>Processing Page 1...</div>
                  <div style={{ fontSize: '18px', fontWeight: 400, color: 'var(--grey)' }}>Please do not remove your documents until finished.</div>
                </div>
              </div>
            </main>
          </div>
        ) : (
          <div style={{ position: 'absolute', inset: '120px 0 0 0', background: 'rgba(255, 255, 255, 0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <h1 style={{ fontFamily: 'var(--serif)', fontSize: '80px', fontWeight: 600, color: 'var(--gd)', marginBottom: '24px' }}>Enter <i style={{ color: 'var(--accent)', fontStyle: 'italic' }}>OTP Code</i></h1>
            <p style={{ fontSize: '24px', fontWeight: 300, color: 'var(--grey-mid)', lineHeight: 1.5, textAlign: 'center', marginBottom: '60px' }}>Enter the 6-digit code shown on your phone to release your prints.</p>
            
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
              <input 
                type="text" 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="000000"
                style={{ fontSize: '64px', fontFamily: 'var(--serif)', letterSpacing: '0.2em', textAlign: 'center', border: '2px solid var(--border)', borderRadius: '24px', padding: '20px 40px', width: '400px', outline: 'none', color: 'var(--gd)' }}
              />
              {error && <p style={{ color: 'var(--red)', fontSize: '24px' }}>{error}</p>}
              <button 
                type="submit" 
                disabled={otp.length !== 6 || verifying}
                style={{ background: 'var(--navy)', color: '#fff', padding: '24px 60px', borderRadius: '9999px', fontSize: '24px', fontWeight: 600, border: 'none', cursor: otp.length === 6 && !verifying ? 'pointer' : 'not-allowed', opacity: otp.length === 6 && !verifying ? 1 : 0.7 }}
              >
                {verifying ? 'Verifying...' : 'Verify Print Job'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
