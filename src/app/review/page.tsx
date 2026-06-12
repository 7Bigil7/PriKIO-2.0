'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { usePrintStore } from '@/store/usePrintStore'
import OrderReview from '@/components/OrderReview'

export default function ReviewPage() {
  const router = useRouter()
  const { profile } = useAuth()
  const { files } = usePrintStore()
  
  const [settings, setSettings] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (files.length === 0) {
      router.push('/upload')
      return
    }
    const storedSettings = sessionStorage.getItem('printSettings')
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings))
    } else {
      router.push('/print-settings')
    }
  }, [files.length, router])

  const handleProceed = async () => {
    if (files.length === 0 || !settings) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/print-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: files.map(f => ({
            fileName: f.fileName,
            fileUrl: f.url,
            fileSizeMb: parseFloat(f.fileSizeMb),
            pageCount: f.pageCount,
            pageRange: f.pagesToPrint
          })),
          colorMode: settings.colorMode,
          sides: settings.layout,
          copies: settings.copies,
          sheetCount: settings.sheetCount,
          total_amount: settings.totalCost
        })
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error)

      sessionStorage.setItem('printJobId', result.data.id)
      sessionStorage.setItem('printJobData', JSON.stringify(result.data))
      router.push('/payment')
      
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (files.length === 0 || !settings) return null

  return (
    <div className="page-root">
      <div className="desktop-left-panel">
        <div className="dlp-step-pill">Step 3 of 4</div>
        <svg className="dlp-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="16" stroke="white" strokeWidth="1.8"/>
          <path d="M16 24h16" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M16 18h16" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M16 30h16" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="32" cy="18" r="2.5" fill="white" opacity="0.9"/>
          <circle cx="20" cy="24" r="2.5" fill="white" opacity="0.9"/>
          <circle cx="28" cy="30" r="2.5" fill="white" opacity="0.9"/>
        </svg>
        <h2 className="dlp-heading">Review Your Order</h2>
        <p className="dlp-sub">Check your print settings and select your kiosk before payment.</p>
        {files.length > 0 && (
          <div className="dlp-file-badge">
            <span className="dlp-file-icon">📄</span>
            <span className="dlp-file-name">{files.length} {files.length === 1 ? 'File' : 'Files'} Selected</span>
          </div>
        )}
        <hr className="dlp-divider" />
        <div className="dlp-dots">
          <span className="dlp-dot active"></span>
          <span className="dlp-dot active"></span>
          <span className="dlp-dot active"></span>
          <span className="dlp-dot"></span>
        </div>
      </div>

      <div className="desktop-right-panel">
        <div className="screen-tag">Step 3 — Order Review</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px' }}>
          <OrderReview
            files={files as any}
            copies={settings.copies}
            colorMode={settings.colorMode}
            layout={settings.layout}
            orientation={settings.orientation}
            printCost={settings.totalCost - 2}
            serviceFee={2}
            onEdit={() => router.push('/print-settings')}
            onProceed={handleProceed}
          />
          {error && <p style={{ color: 'var(--red)', fontSize: '12px', marginTop: '12px', textAlign: 'center' }}>{error}</p>}
          {submitting && <p style={{ color: 'var(--grey)', fontSize: '12px', marginTop: '12px', textAlign: 'center' }}>Processing your order...</p>}
        </div>
      </div>
    </div>
  )
}
