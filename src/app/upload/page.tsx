'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { usePrintStore } from '@/store/usePrintStore'

interface FileItem {
  id: string;
  file: File;
  pagesToPrint: string;
}

export default function Upload() {
  const { profile } = useAuth()
  const router = useRouter()
  const [files, setFiles] = useState<FileItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files))
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files))
    }
  }

  const addFiles = (selectedFiles: File[]) => {
    const validFiles = selectedFiles.filter(f => {
      if (f.size > 50 * 1024 * 1024) {
        setError('One or more files are too large. Maximum size is 50MB per file.')
        return false
      }
      return true
    })

    const newItems = validFiles.map(f => ({
      id: Math.random().toString(36).substring(7),
      file: f,
      pagesToPrint: 'All'
    }))

    setFiles(prev => [...prev, ...newItems])
    setError(null)
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const updatePagesToPrint = (id: string, val: string) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, pagesToPrint: val } : f))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

  const handleContinue = async () => {
    if (files.length === 0) return
    
    setUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const results = []
      
      for (let i = 0; i < files.length; i++) {
        const item = files[i]
        const formData = new FormData()
        formData.append('file', item.file)

        const fileProgressBase = (i / files.length) * 100
        const fileProgressStep = 100 / files.length
        
        const interval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + fileProgressStep * 0.1, fileProgressBase + fileProgressStep * 0.9))
        }, 100)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        clearInterval(interval)
        setUploadProgress(fileProgressBase + fileProgressStep)

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || `Upload failed for ${item.file.name}`)
        }

        results.push({ 
          id: Math.random().toString(36).substring(7),
          ...result.data, 
          pagesToPrint: item.pagesToPrint,
          originalFile: item.file
        })
      }

      setUploadProgress(100)
      usePrintStore.getState().setFiles(results)
      
      setTimeout(() => {
        router.push('/print-settings')
      }, 500)

    } catch (err: any) {
      setError(err.message)
      setUploading(false)
    }
  }

  return (
    <div className="page-root">
      {/* Desktop left branding panel */}
      <div className="desktop-left-panel">
        <div className="dlp-step-pill">Step 1 of 3</div>
        <svg className="dlp-icon" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 36V16h24v20" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M8 36h32" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M20 16V8h8v8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
          <polyline points="24 22 24 30" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
          <polyline points="20 26 24 22 28 26" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h2 className="dlp-heading">Upload Your Document</h2>
        <p className="dlp-sub">Supports PDF, JPEG, PNG, DOCX up to 20MB. Drag and drop or click to browse.</p>
        <hr className="dlp-divider" />
        <div className="dlp-dots">
          <span className="dlp-dot active"></span>
          <span className="dlp-dot"></span>
          <span className="dlp-dot"></span>
        </div>
      </div>

      <div className="desktop-right-panel">
        <div className="screen-tag">Step 1 — Upload</div>
        <div className="phone-card" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', overflow: 'hidden' }}>
          <div className="top-bar" style={{ flexShrink: 0 }}>
            <button className="back-btn" aria-label="Back" onClick={() => router.back()}>
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="screen-title">CampusPrint</span>
          </div>

          <div 
            className={`upload-center drop-zone ${dragActive ? 'drag-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ 
              flex: 1, 
              overflowY: 'auto', 
              WebkitOverflowScrolling: 'touch', 
              transition: 'all 0.3s ease', 
              border: dragActive ? '2px dashed var(--accent)' : (files.length === 0 ? '2px dashed transparent' : 'none'), 
              borderRadius: '24px',
              padding: files.length > 0 ? '20px' : undefined,
              justifyContent: files.length > 0 ? 'flex-start' : 'center',
            }}
          >
            {files.length === 0 ? (
              <>
                <svg className="upload-illustration" viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '60%', maxWidth: '220px', height: 'auto', display: 'block', margin: '0 auto' }}>
                  <g transform="rotate(-12, 110, 28)">
                    <rect x="97" y="10" width="28" height="36" rx="3" fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="1.4"/>
                    <line x1="103" y1="20" x2="119" y2="20" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round"/>
                    <line x1="103" y1="26" x2="119" y2="26" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round"/>
                    <line x1="103" y1="32" x2="112" y2="32" stroke="#D1D5DB" strokeWidth="1.2" strokeLinecap="round"/>
                  </g>
                  <g transform="rotate(8, 20, 85)">
                    <rect x="10" y="72" width="24" height="30" rx="3" fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="1.3" strokeDasharray="3 2"/>
                    <line x1="16" y1="80" x2="28" y2="80" stroke="#D1D5DB" strokeWidth="1.1" strokeLinecap="round"/>
                    <line x1="16" y1="86" x2="28" y2="86" stroke="#D1D5DB" strokeWidth="1.1" strokeLinecap="round"/>
                  </g>
                  <rect x="24" y="46" width="92" height="42" rx="10" fill="#EEF2FF" stroke="#2B4EAA" strokeWidth="1.8"/>
                  <rect x="38" y="36" width="64" height="16" rx="5" fill="#F3F4F6" stroke="#9CA3AF" strokeWidth="1.5"/>
                  <rect x="44" y="82" width="52" height="13" rx="3" fill="#fff" stroke="#2B4EAA" strokeWidth="1.5"/>
                  <circle cx="96" cy="61" r="3" fill="#2B4EAA" opacity="0.7"/>
                  <circle cx="106" cy="61" r="3" fill="#E5E7EB"/>
                  <line x1="38" y1="70" x2="102" y2="70" stroke="#2B4EAA" strokeWidth="1" strokeLinecap="round" opacity="0.25"/>
                </svg>

                <h1 className="upload-headline">Ready to print?</h1>
                <p className="upload-sub">Upload your documents to get started with high-quality campus printing.</p>
                <div style={{ marginTop: '24px' }}>
                  <button 
                    onClick={handleUploadClick}
                    style={{
                      background: 'var(--accent-s)',
                      color: 'var(--accent)',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '9999px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Select Files
                  </button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                {files.map(item => (
                  <div key={item.id} style={{
                    background: '#fff',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'var(--gl)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {getFileIcon(item.file.name)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: 'var(--gd)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {item.file.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--grey)' }}>
                          {formatFileSize(item.file.size)}
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFile(item.id)}
                        aria-label="Remove file"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--grey)',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
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
                      <span style={{ color: 'var(--grey-mid)', fontWeight: '500' }}>Pages to Print</span>
                      <input 
                        type="text" 
                        value={item.pagesToPrint}
                        onChange={(e) => updatePagesToPrint(item.id, e.target.value)}
                        placeholder="All"
                        style={{
                          width: '80px',
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
                ))}

                <button 
                  onClick={handleUploadClick}
                  style={{
                    background: 'none',
                    border: '2px dashed var(--border)',
                    color: 'var(--grey-mid)',
                    padding: '16px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'border-color 0.2s',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  Add More Files
                </button>
              </div>
            )}
            
            {error && <p style={{ color: 'var(--red)', fontSize: '13px', marginTop: '16px', textAlign: 'center' }}>{error}</p>}
            
            {uploading && (
              <div style={{ marginTop: '20px', width: '100%', maxWidth: '280px', margin: '20px auto 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', color: 'var(--grey-mid)' }}>
                  <span>Uploading {files.length} {files.length === 1 ? 'file' : 'files'}...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.2s' }}></div>
                </div>
              </div>
            )}
          </div>

          <div className="upload-btn-wrap" style={{ flexShrink: 0, paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
            <button 
              className="upload-btn" 
              onClick={handleContinue}
              disabled={files.length === 0 || uploading}
              style={{ 
                opacity: (files.length === 0 || uploading) ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {uploading ? 'Processing...' : `Continue ${files.length > 0 ? `(${files.length} file${files.length > 1 ? 's' : ''})` : ''} →`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
