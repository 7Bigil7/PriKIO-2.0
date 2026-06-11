'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import './desktop-landing.css'

export default function LandingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSignIn = () => {
    setLoading(true)
    setTimeout(() => {
      router.push('/upload')
    }, 500)
  }

  return (
    <>
      <div className="desktop-only-landing">
        
<section className="hero">

  
  <div className="wm" aria-hidden="true">P</div>

  
  <div className="ring-canvas" aria-hidden="true">
    <div className="ring-outer"></div>
    <div className="ring-inner"></div>
    <div className="ring-core"></div>
  </div>

  
  <div className="logo-row">
    <svg className="logo-icon" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Presidency University logo">
      <path d="M6 28 C6 28 9 10 18 6 C27 10 30 28 30 28" stroke="#0D1F3C" stroke-width="1.6" stroke-linecap="round" fill="none"/>
      <path d="M10 28 C10 28 12 16 18 13 C24 16 26 28 26 28" stroke="#2B4EAA" stroke-width="1.6" stroke-linecap="round" fill="none"/>
      <line x1="4" y1="28" x2="32" y2="28" stroke="#0D1F3C" stroke-width="1.6" stroke-linecap="round"/>
    </svg>
    <span className="logo-wordmark">Presidency University</span>
  </div>

  
  <div className="hero-content">
    <h1 className="hero-headline">
      Digital Thoughts<br/>
      <span className="accent-italic">&amp; Physical</span> Reality
    </h1>
    <p className="hero-sub">
      The official on-campus printing service for modern academics.
    </p>
    <div className="hero-cta-row">
      <button className="btn-primary" onClick={handleSignIn} disabled={loading}>
        {loading ? "Loading..." : "Start Testing (Bypass Auth)"}
      </button>
      <button className="btn-ghost">
        Learn More
      </button>
    </div>
  </div>

</section>


<section className="workflow">
  <div className="section-label">Workflow</div>

  <div className="workflow-grid">
    <div className="workflow-card reveal">
      <div className="step-num">01.</div>
      <div className="step-title">Scan to Start</div>
      <p className="step-desc">Tap your student ID or scan the QR code at any campus kiosk to begin your session instantly.</p>
    </div>
    <div className="workflow-card reveal">
      <div className="step-num">02.</div>
      <div className="step-title">Cloud Upload</div>
      <p className="step-desc">Upload directly from your device or pull files from your university cloud account in seconds.</p>
    </div>
    <div className="workflow-card reveal">
      <div className="step-num">03.</div>
      <div className="step-title">Instant Pay</div>
      <p className="step-desc">Pay via UPI, scan a QR code, or use your pre-loaded academic credits — no cash required.</p>
    </div>
    <div className="workflow-card active reveal">
      <div className="step-num">04.</div>
      <div className="step-title">Collect Print</div>
      <p className="step-desc">Retrieve your documents with a secure OTP. Every job is ready within moments of payment.</p>
    </div>
  </div>
</section>


<section className="capabilities">
  <div className="section-label">Capabilities</div>

  <div className="cap-grid">
    <div className="cap-card reveal">
      <svg className="cap-icon" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="12" width="32" height="22" rx="3" stroke="#0D1F3C" stroke-width="1.6"/>
        <path d="M14 12V8h16v4" stroke="#0D1F3C" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M14 34v2h16v-2" stroke="#0D1F3C" stroke-width="1.6" stroke-linecap="round"/>
        <circle cx="34" cy="18" r="2" fill="#0D1F3C"/>
      </svg>
      <div className="cap-title">Campus-Wide</div>
      <p className="cap-desc">Access 12+ printer stations across all buildings, labs, and the main library. Any kiosk, any time.</p>
    </div>
    <div className="cap-card reveal">
      <svg className="cap-icon" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 8 L36 16 L36 32 L22 40 L8 32 L8 16 Z" stroke="#0D1F3C" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M22 8 L22 24 M22 24 L8 16 M22 24 L36 16" stroke="#2B4EAA" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <div className="cap-title">Cloud Storage</div>
      <p className="cap-desc">Save documents to your account and reprint from any kiosk without re-uploading. Encrypted at rest.</p>
    </div>
    <div className="cap-card reveal">
      <svg className="cap-icon" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="22" r="14" stroke="#0D1F3C" stroke-width="1.6"/>
        <path d="M22 15 L22 22 L28 25" stroke="#2B4EAA" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <div className="cap-title">Instant Output</div>
      <p className="cap-desc">High-speed laser and colour inkjet printing. Most jobs complete within 60 seconds of payment confirmation.</p>
    </div>
    <div className="cap-card reveal">
      <svg className="cap-icon" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="8" width="24" height="30" rx="3" stroke="#0D1F3C" stroke-width="1.6"/>
        <line x1="15" y1="16" x2="29" y2="16" stroke="#2B4EAA" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="15" y1="21" x2="29" y2="21" stroke="#2B4EAA" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="15" y1="26" x2="23" y2="26" stroke="#2B4EAA" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <div className="cap-title">Any Format</div>
      <p className="cap-desc">PDF, DOCX, PPTX, JPEG — all formats supported. Auto-fit to page, duplex, colour or mono, your choice.</p>
    </div>
  </div>
</section>


<section className="rates">
  <div className="section-label">Standard Rates</div>

  <div className="rates-card">
    <div className="rates-header">Academic Year 2024 / 25</div>
    <table className="rates-table" aria-label="Printing rate card">
      <tbody>
        <tr>
          <td>B&amp;W — Single Sided</td>
          <td>₹ 2.00</td>
        </tr>
        <tr>
          <td>B&amp;W — Double Sided</td>
          <td>₹ 3.50</td>
        </tr>
        <tr>
          <td>Colour — Standard</td>
          <td>₹ 8.00</td>
        </tr>
        <tr>
          <td>Colour — Glossy / Presentation</td>
          <td>₹ 15.00</td>
        </tr>
      </tbody>
    </table>
    <div className="rates-footnote">* Faculty members receive 50 complimentary credits per month.</div>
  </div>
</section>


<footer>
  <div className="footer-top">
    <div>
      <div className="footer-brand">Presidency University</div>
      <div className="footer-brand-sub">Information Technology Services</div>
    </div>
    <div>
      <div className="footer-links-col">
        <h4>Service</h4>
        <ul>
          <li><a href="#">Kiosk Map</a></li>
          <li><a href="#">Support Desk</a></li>
          <li><a href="#">Status Page</a></li>
        </ul>
      </div>
      <div className="footer-links-col">
        <h4>Legal</h4>
        <ul>
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Usage Terms</a></li>
          <li><a href="#">Refunds</a></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="footer-copy">
    &copy; 2025 Presidency University · All rights reserved
  </div>
</footer>


<nav className="sticky-bar" aria-label="Quick navigation">
  
  <button className="bar-icon-btn" aria-label="Menu">
    <svg viewBox="0 0 24 24"><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></svg>
  </button>

  <div className="bar-divider"></div>

  
  <button className="bar-cta">Scan QR to Print</button>

  <div className="bar-divider"></div>

  
  <button className="bar-icon-btn" aria-label="Profile">
    <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20 C4 16 8 13 12 13 C16 13 20 16 20 20"/></svg>
  </button>
</nav>
      </div>
    </>
  )
}
