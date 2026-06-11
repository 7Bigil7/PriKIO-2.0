'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { CostResult } from '@/lib/calculate-cost'
import { usePrintStore } from '@/store/usePrintStore'
import dynamic from 'next/dynamic'

const FilePreviewModal = dynamic(() => import('@/components/FilePreviewModal'), { ssr: false })

export default function PrintSettings() {
  const router = useRouter()
  const { profile } = useAuth()
  
  const { files, updatePageRange } = usePrintStore()
  
  const [colorMode, setColorMode] = useState<'bw' | 'color'>('bw')
  const [sides, setSides] = useState<'simplex' | 'duplex'>('duplex')
  const [copies, setCopies] = useState(1)
  
  const [cost, setCost] = useState<CostResult | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [previewFileId, setPreviewFileId] = useState<string | null>(null)

  useEffect(() => {
    if (files.length === 0) {
      router.push('/upload')
    }
  }, [files.length, router])

  useEffect(() => {
    if (files.length === 0) return

    const fetchCost = async () => {
      setCalculating(true)
      try {
        const res = await fetch('/api/calculate-cost', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            files: files.map(f => ({ pageCount: f.pageCount, pageRange: f.pagesToPrint })),
            colorMode,
            sides,
            copies,
            role: profile?.role
          })
        })
        const result = await res.json()
        if (res.ok) {
          setCost(result.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setCalculating(false)
      }
    }

    const timer = setTimeout(fetchCost, 300)
    return () => clearTimeout(timer)
  }, [files, colorMode, sides, copies, profile?.role])

  const handleConfirmPay = async () => {
    if (files.length === 0 || !cost) return
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
          colorMode,
          sides,
          copies,
          sheetCount: cost.sheetCount,
          total_amount: cost.total
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

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (ext === 'pdf') {
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--red)' }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <path d="M10 9H8"></path>
          <path d="M16 13H8"></path>
          <path d="M16 17H8"></path>
        </svg>
      )
    }
    if (ext === 'doc' || ext === 'docx') {
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <path d="M8 13h8"></path>
          <path d="M8 17h8"></path>
          <path d="M8 9h2"></path>
        </svg>
      )
    }
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
      return (
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--green)' }}>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      )
    }
    return (
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--grey)' }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>
    )
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
        <div className="phone-card" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
        
          <div className="top-bar" style={{ flexShrink: 0 }}>
            <button className="back-btn" aria-label="Back" onClick={() => router.back()}>
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="screen-title">Print Settings</span>
          </div>

          <div className="screen-body" style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div className="s-label">Selected Files</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {files.map(file => {
                const ext = file.fileName.split('.').pop()?.toUpperCase() || 'DOC'
                return (
                  <div key={file.id} style={{
                    background: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="file-icon-wrap" style={{ flexShrink: 0, margin: 0 }}>
                        {getFileIcon(file.fileName)}
                        <span className="file-type-badge">{ext}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                          <div className="file-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.fileName}</div>
                          <div className="file-meta">{file.pageCount} Pages · {file.fileSizeMb} MB</div>
                        </div>
                        <button 
                          onClick={() => setPreviewFileId(file.id)}
                          style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, color: 'var(--navy)' }}
                          aria-label="Preview Document"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      background: 'var(--gl)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '13px'
                    }}>
                      <span style={{ color: 'var(--grey-mid)', fontWeight: '500' }}>Page Range</span>
                      <input 
                        type="text" 
                        value={file.pagesToPrint}
                        onChange={(e) => updatePageRange(file.id, e.target.value)}
                        placeholder="All"
                        style={{
                          width: '100px',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '13px',
                          textAlign: 'center',
                          outline: 'none',
                          background: '#fff',
                          color: 'var(--gd)'
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="s-label">Color Mode</div>
            <div className="toggle-group" id="colorGroup">
              <div className={`toggle-card ${colorMode === 'bw' ? 'active' : ''}`} onClick={() => setColorMode('bw')}>
                <div className="tc-sub">Economy</div>
                <div className="tc-label">Black &amp; White</div>
              </div>
              <div className={`toggle-card ${colorMode === 'color' ? 'active' : ''}`} onClick={() => setColorMode('color')}>
                <div className="tc-sub">Standard</div>
                <div className="tc-label">Full Color</div>
              </div>
            </div>

            <div className="s-label">Layout</div>
            <div className="toggle-group" id="layoutGroup">
              <div className={`toggle-card ${sides === 'simplex' ? 'active' : ''}`} onClick={() => setSides('simplex')}>
                <div className="tc-sub">Simplex</div>
                <div className="tc-label">Single Sided</div>
              </div>
              <div className={`toggle-card ${sides === 'duplex' ? 'active' : ''}`} onClick={() => setSides('duplex')}>
                <div className="tc-sub">Duplex</div>
                <div className="tc-label">Double Sided</div>
              </div>
            </div>

            <div className="s-label">Copies</div>
            <div className="range-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <span className="range-label">Number of Copies</span>
              <input 
                type="number" 
                min="1" 
                max="100" 
                className="range-pill" 
                style={{ width: '100%', boxSizing: 'border-box', textAlign: 'right', background: 'transparent', border: '1px solid var(--border)', outline: 'none' }}
                value={copies}
                onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
              />
            </div>

            {error && <p style={{ color: 'var(--red)', fontSize: '12px', marginTop: '12px' }}>{error}</p>}
          </div>

          <div className="sticky-bottom" style={{ flexShrink: 0, marginTop: 'auto', paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}>
            {calculating ? (
              <div style={{ textAlign: 'center', padding: '10px', fontSize: '12px', color: 'var(--grey)' }}>Calculating cost...</div>
            ) : cost ? (
              <>
                <div className="sticky-cost-line">
                  <span className="sticky-cost-desc">{cost.sheetCount} Sheets ({sides === 'duplex' ? 'Double Sided' : 'Single Sided'})</span>
                  <span className="sticky-cost-val">₹ {cost.baseCost.toFixed(2)}</span>
                </div>
                <div className="sticky-cost-line">
                  <span className="sticky-cost-desc">Service Fee</span>
                  <span className="sticky-cost-val">₹ {cost.serviceFee.toFixed(2)}</span>
                </div>
                {cost.discount > 0 && (
                  <div className="sticky-cost-line">
                    <span className="sticky-cost-desc" style={{ color: 'var(--green)' }}>Faculty Discount</span>
                    <span className="sticky-cost-val" style={{ color: 'var(--green)' }}>- ₹ {cost.discount.toFixed(2)}</span>
                  </div>
                )}
                <button className="pay-btn" onClick={handleConfirmPay} disabled={submitting || calculating}>
                  {submitting ? 'Processing...' : 'Confirm & Pay'}
                  <span className="pay-amount-badge">₹ {cost.total.toFixed(2)}</span>
                </button>
              </>
            ) : null}
          </div>

          {previewFileId && (
            <FilePreviewModal
              file={files.find(f => f.id === previewFileId)!}
              onClose={() => setPreviewFileId(null)}
              onSave={(range) => {
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
