'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { CostResult } from '@/lib/calculate-cost'
import { usePrintStore } from '@/store/usePrintStore'
import dynamic from 'next/dynamic'
import PrintSettingsCard from '@/components/PrintSettingsCard'

const FilePreviewModal = dynamic(() => import('@/components/FilePreviewModal'), { ssr: false })

export default function PrintSettings() {
  const router = useRouter()
  const { profile } = useAuth()
  
  const { files, updatePageRange } = usePrintStore()
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [previewFileId, setPreviewFileId] = useState<string | null>(null)

  useEffect(() => {
    if (files.length === 0) {
      router.push('/upload')
    }
  }, [files.length, router])

  const handleConfirmPay = (settings: any) => {
    if (files.length === 0) return
    
    sessionStorage.setItem('printSettings', JSON.stringify(settings))
    router.push('/review')
  }

  if (files.length === 0) return null

  return (
    <div className="page-root">
      {/* Desktop left branding panel */}
      <div className="desktop-left-panel">
        <div className="dlp-step-pill">Step 2 of 3</div>
        <svg className="dlp-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="16" stroke="white" strokeWidth="1.8"/>
          <path d="M16 24h16" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M16 18h16" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M16 30h16" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="32" cy="18" r="2.5" fill="white" opacity="0.9"/>
          <circle cx="20" cy="24" r="2.5" fill="white" opacity="0.9"/>
          <circle cx="28" cy="30" r="2.5" fill="white" opacity="0.9"/>
        </svg>
        <h2 className="dlp-heading">Configure Print Options</h2>
        <p className="dlp-sub">Choose color mode, layout, and number of copies for your documents.</p>
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
          <span className="dlp-dot"></span>
        </div>
      </div>

      <div className="desktop-right-panel">
        <div className="screen-tag">Step 2 — Print Settings</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px' }}>
          <PrintSettingsCard
            files={files as any}
            onConfirm={handleConfirmPay}
            onPreviewClick={(id: string) => setPreviewFileId(id)}
          />
          {error && <p style={{ color: 'var(--red)', fontSize: '12px', marginTop: '12px', textAlign: 'center' }}>{error}</p>}
          {submitting && <p style={{ color: 'var(--grey)', fontSize: '12px', marginTop: '12px', textAlign: 'center' }}>Processing...</p>}

          {previewFileId && (
            <FilePreviewModal
              file={files.find(f => f.id === previewFileId)!}
              onClose={() => setPreviewFileId(null)}
              onSave={(range: string) => {
                updatePageRange(previewFileId, range)
                setPreviewFileId(null)
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
