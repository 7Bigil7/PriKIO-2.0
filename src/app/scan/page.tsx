"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AppHeader from "@/components/AppHeader"
import './scan.css'

export default function ScanPage() {
  const router = useRouter()
  const [cameraActive, setCameraActive] = useState(false)
  const [initializing, setInitializing] = useState(false)

  const handleStartScanning = () => {
    setCameraActive(true)
    setInitializing(false)
  }

  const handleBypass = () => {
    router.push('/upload')
  }

  const handleCancel = () => {
    router.push('/')
  }

  return (
    <div className="scan-root">
      {/* Left panel */}
      <div className="scan-left">
        <svg className="scan-left-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '40px', height: '40px', color: 'rgba(255,255,255,0.9)' }}>
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
        <h1 className="scan-left-title">Connect to Kiosk</h1>
        <p className="scan-left-sub">Scan the QR code on any CampusPrint kiosk to begin.</p>
      </div>

      {/* Right panel */}
      <div className="scan-right">
        <div className="scan-card">
          <AppHeader title="CampusPrint" subtitle="Print Anywhere on Campus" onBack={handleCancel} />

          <div className="scan-body">
            <div className="scan-inner">
              <div className="scan-instructions">
                <h1 className="scan-headline">Choose a kiosk to start</h1>
              </div>

              {/* Mascot (Idle State) */}
              {!cameraActive && (
                <div className="scan-idle-mascot">
                  <img 
                    src="/mascot_scan.png" 
                    alt="CampusPrint Mascot Scanning" 
                    className="mascot-img"
                  />
                </div>
              )}

              {/* Scanner Viewport (Only show when camera is active) */}
              {cameraActive && (
                <div className="scan-viewport">
                  <div className="scan-frame">
                    <div className="scan-corner top-left"></div>
                    <div className="scan-corner top-right"></div>
                    <div className="scan-corner bottom-left"></div>
                    <div className="scan-corner bottom-right"></div>
                    
                    {!initializing && <div className="scan-laser"></div>}
                    
                    <div className="scan-center-text">
                      {initializing ? (
                        "Initializing camera..." 
                      ) : (
                        "Point your camera at the QR code"
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="scan-actions">
                {!cameraActive ? (
                  <button className="scan-btn-primary" onClick={handleStartScanning}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="scan-btn-icon">
                      <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h-2v2h2v-2zm-2 2h-2v2h2v-2zm2 2h-2v2h2v-2zm-4 0h-2v2h2v-2zm2 2h-2v2h2v-2zm-4 0h-2v2h2v-2zm2 2h-2v2h2v-2z"/>
                    </svg>
                    Scan QR
                  </button>
                ) : (
                  <>
                    <button className="scan-btn-outline" onClick={() => setCameraActive(false)}>Stop Camera</button>
                    <button className="scan-btn-primary" onClick={() => alert('Upload QR Image clicked')}>Upload QR Image</button>
                  </>
                )}
              </div>

              {/* Bypass for Testing */}
              <div className="scan-bypass-container">
                <button className="scan-bypass-btn" onClick={handleBypass}>
                  Skip Scanning (Test Mode) ↗
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
