'use client'

import { useState, useRef } from "react"
import { useRouter } from 'next/navigation'
import { usePrintStore } from '@/store/usePrintStore'

export default function UploadScreen() {
  const router = useRouter()
  const [files, setFiles] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (incoming: FileList | File[]) => {
    const arr = Array.from(incoming).map((f) => ({
      id: Math.random().toString(36).slice(2),
      file: f,
      name: f.name,
      size: (f.size / 1024 / 1024).toFixed(2) + " MB",
      pagesToPrint: "All",
    }))
    setFiles((prev) => [...prev, ...arr])
  }

  const removeFile = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id))

  const updatePages = (id: string, val: string) =>
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, pagesToPrint: val } : f))
    )

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleContinue = async () => {
    if (files.length === 0) return
    setUploading(true)
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
        if (!response.ok) throw new Error(result.error)

        results.push({ 
          id: Math.random().toString(36).substring(7),
          ...result.data, 
          pagesToPrint: item.pagesToPrint,
          originalFile: item.file
        })
      }

      setUploadProgress(100)
      usePrintStore.getState().setFiles(results)
      
      // We don't save copies/colorMode here anymore since it's removed.
      // We just push to the next step.
      setTimeout(() => {
        router.push('/print-settings')
      }, 500)

    } catch (err: any) {
      console.error(err)
      setUploading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&family=Quicksand:wght@400;500;600;700&display=swap');
        
        .up-root {
          height: 100vh; width: 100vw;
          display: flex; overflow: hidden;
          font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #1a2340;
        }
        
        .up-root * {
          font-family: inherit;
        }

        /* Left panel */
        .up-left {
          width: 45%; background: #1a2340;
          display: flex; flex-direction: column;
          justify-content: center;
          padding: clamp(32px,5vw,72px); flex-shrink: 0;
        }
        .up-step {
          display: inline-flex; align-items: center;
          background: rgba(255,255,255,0.08); border-radius: 20px;
          padding: 6px 14px; font-size: 11px; font-weight: 700;
          letter-spacing: 0.1em; color: #a0aec0;
          margin-bottom: 40px; width: fit-content;
        }
        .up-left-icon { font-size: 32px; margin-bottom: 20px; opacity: 0.7; }
        .up-left-title {
          font-family: 'Playfair Display', serif !important;
          font-size: clamp(28px,3.5vw,42px); color: #fff;
          margin-bottom: 16px; line-height: 1.2;
        }
        .up-left-sub { font-size: 15px; color: #8892a4; line-height: 1.6; max-width: 280px; }
        .up-dots { display: flex; gap: 8px; margin-top: 48px; }
        .up-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.2); }
        .up-dot.active { background: #4a5fc1; }

        /* Right panel */
        .up-right {
          flex: 1; background: #f0f2f5;
          display: flex; align-items: center; justify-content: center;
          padding: clamp(16px,3vw,40px); overflow: hidden;
        }

        /* Card */
        .up-card {
          background: #fff; border-radius: 20px;
          width: 100%; max-width: 400px;
          display: flex; flex-direction: column;
          overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.10);
          max-height: calc(100vh - 80px);
        }

        /* Card header */
        .up-card-header {
          display: flex; align-items: center;
          padding: 20px 20px 0; flex-shrink: 0;
        }
        .up-back {
          background: none; border: none; font-size: 20px;
          color: #1a2340; cursor: pointer; padding: 4px 8px 4px 0;
        }
        .up-card-title {
          flex: 1; text-align: center;
          font-family: 'Playfair Display', serif !important;
          font-style: italic; font-size: 20px; color: #1a2340;
          margin-right: 28px;
        }

        /* Scrollable body */
        .up-card-body {
          flex: 1; overflow-y: auto; padding: 20px 20px 0;
          -webkit-overflow-scrolling: touch;
        }

        /* Empty Dropzone / Illustration */
        .up-dropzone {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 30px 20px; text-align: center;
        }
        .up-headline {
          font-family: 'Playfair Display', serif !important;
          font-size: 28px; font-weight: 600; color: #1a2340;
          margin: 20px 0 12px; line-height: 1.2;
        }
        .up-subline {
          font-size: 14px; color: #8892a4; line-height: 1.5;
          max-width: 260px; margin-bottom: 24px;
        }
        .up-select-btn {
          background: #EEF2FF; color: #2B4EAA;
          border: none; padding: 12px 24px; border-radius: 50px;
          font-size: 15px; font-weight: 700; cursor: pointer;
          display: inline-flex; align-items: center; gap: 8px;
          transition: background 0.2s, transform 0.1s;
        }
        .up-select-btn:hover { background: #e0e7ff; transform: scale(1.02); }

        .up-hint {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: #22c55e; margin-bottom: 8px;
        }
        .up-formats { font-size: 11px; color: #a0aec0; margin-bottom: 20px; }

        /* Add more (compact) */
        .up-add-more {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 12px 16px; border-radius: 12px;
          border: 1.5px dashed #cbd5e1; cursor: pointer;
          font-size: 14px; color: #2B4EAA; font-weight: 700;
          margin-bottom: 16px; background: #fff; width: max-content;
          transition: border-color 0.2s;
        }
        .up-add-more:hover { border-color: #2B4EAA; }

        /* File cards */
        .up-file-card {
          background: #fff; border-radius: 16px;
          padding: 16px; margin-bottom: 12px;
          display: flex; align-items: flex-start; gap: 14px;
          border: 1.5px solid #e2e8f0; position: relative;
        }
        .up-file-icon {
          width: 44px; height: 44px; border-radius: 10px;
          background: #f1f5f9; display: flex;
          align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        }
        .up-file-info { flex: 1; min-width: 0; padding-right: 20px; }
        .up-file-name {
          font-size: 14px; font-weight: 700; color: #1a2340;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: 4px;
        }
        .up-file-meta { font-size: 12px; color: #8892a4; margin-bottom: 12px; font-weight: 500; }
        .up-pages-row {
          display: flex; align-items: center; gap: 8px;
        }
        .up-pages-label { font-size: 12px; color: #8892a4; font-weight: 500; }
        .up-pages-input {
          width: 60px; padding: 4px 8px; border-radius: 6px;
          border: 1.5px solid #e2e8f0; font-size: 13px; font-weight: 600;
          color: #1a2340; outline: none; background: #fff; text-align: center;
        }
        .up-pages-input:focus { border-color: #4a5fc1; }
        .up-remove {
          background: none; border: none; cursor: pointer;
          color: #cbd5e1; font-size: 20px; padding: 4px;
          position: absolute; top: 12px; right: 12px;
          line-height: 1; transition: color 0.2s;
        }
        .up-remove:hover { color: #e53e3e; }

        /* Settings rows */
        .up-settings { margin-bottom: 8px; }
        .up-setting-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 0; border-bottom: 1px solid #f0f2f5;
          cursor: pointer;
        }
        .up-setting-row:last-child { border-bottom: none; }
        .up-setting-label { font-size: 14px; color: #4a5568; }
        .up-setting-val {
          font-size: 14px; font-weight: 600; color: #1a2340;
          display: flex; align-items: center; gap: 4px;
        }
        .up-chevron { font-size: 12px; color: #a0aec0; }

        /* Footer */
        .up-footer { padding: 14px 20px 20px; flex-shrink: 0; }
        .up-btn-upload {
          width: 100%; padding: 15px; border-radius: 50px;
          background: #1a2340;
          color: #fff; border: none; font-size: 15px; font-weight: 600;
          cursor: pointer; opacity: 0.35; transition: opacity 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .up-btn-upload.active { opacity: 1; }
        .up-badge {
          background: #4a5fc1; color: #fff;
          border-radius: 20px; padding: 2px 10px;
          font-size: 12px; font-weight: 700;
        }

        /* Modal */
        .up-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4);
          display: flex; align-items: flex-end; justify-content: center;
          z-index: 200;
        }
        @media (min-width: 640px) {
          .up-modal-overlay { align-items: center; }
          .up-modal { border-radius: 20px !important; max-width: 340px; }
        }
        .up-modal {
          background: #fff; border-radius: 20px 20px 0 0;
          padding: 24px; width: 100%;
          animation: modalUp 0.25s ease;
        }
        @keyframes modalUp {
          from { transform: translateY(40px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .up-modal-title {
          font-size: 16px; font-weight: 700; color: #1a2340;
          margin-bottom: 16px; text-align: center;
        }
        .up-modal-option {
          width: 100%; padding: 13px; border-radius: 10px;
          border: 1.5px solid #e2e8f0; background: #fff;
          font-size: 14px; color: #1a2340; cursor: pointer;
          margin-bottom: 8px; text-align: left;
          transition: border-color 0.15s, background 0.15s;
        }
        .up-modal-option.selected {
          border-color: #4a5fc1; background: #eef0fb;
          font-weight: 600; color: #4a5fc1;
        }
        .up-modal-close {
          width: 100%; padding: 13px; border-radius: 50px;
          background: #1a2340; color: #fff; border: none;
          font-size: 14px; font-weight: 600; cursor: pointer;
          margin-top: 8px;
        }

        /* Copies counter */
        .up-counter {
          display: flex; align-items: center;
          justify-content: center; gap: 24px; margin-bottom: 20px;
        }
        .up-counter-btn {
          width: 40px; height: 40px; border-radius: 50%;
          border: 1.5px solid #d1d5db; background: #fff;
          font-size: 22px; cursor: pointer; display: flex;
          align-items: center; justify-content: center;
          color: #1a2340; transition: border-color 0.15s;
        }
        .up-counter-btn:hover { border-color: #4a5fc1; }
        .up-counter-val { font-size: 28px; font-weight: 700; color: #1a2340; min-width: 32px; text-align: center; }

        /* Mobile */
        @media (max-width: 768px) {
          .up-left { display: none; }
          .up-right {
            background: #fff;
            padding: 0;
          }
          .up-card { 
            max-width: 100%; 
            max-height: 100vh; 
            height: 100vh;
            border-radius: 0; 
            box-shadow: none;
          }
        }
      `}</style>

      <div className="up-root" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
        {/* Left panel */}
        <div className="up-left">
          <div className="up-step">STEP 1 OF 3</div>
          <div className="up-left-icon">🖨️</div>
          <h1 className="up-left-title">Upload Your Files</h1>
          <p className="up-left-sub">Select PDF, JPG or PNG files.</p>
          <div className="up-dots">
            <div className="up-dot active" />
            <div className="up-dot" />
            <div className="up-dot" />
          </div>
        </div>

        {/* Right panel */}
        <div className="up-right">
          <div className="up-card">
            {/* Header */}
            <div className="up-card-header">
              <button className="up-back" onClick={() => router.back()}>‹</button>
              <span className="up-card-title">CampusPrint</span>
            </div>

            {/* Body */}
            <div className="up-card-body">
              <input
                ref={inputRef} type="file" multiple
                accept=".pdf,.jpg,.jpeg,.png"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files) handleFiles(e.target.files)
                }}
              />

              {files.length === 0 ? (
                /* Empty state */
                <div className="up-dropzone">
                  <svg viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: '200px', height: 'auto', display: 'block', margin: '0 auto' }}>
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
                  
                  <h2 className="up-headline">Ready to print?</h2>
                  <p className="up-subline">Upload your documents to get started with high-quality campus printing.</p>
                  
                  <button className="up-select-btn" onClick={() => inputRef.current?.click()}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Select Files
                  </button>
                </div>
              ) : (
                /* Files listed */
                <>
                  {files.map((f) => (
                    <div className="up-file-card" key={f.id}>
                      <div className="up-file-icon">
                        {f.name.endsWith(".pdf") ? "📄" : f.name.match(/\.(jpg|jpeg|png)$/i) ? "🖼️" : "📝"}
                      </div>
                      <div className="up-file-info">
                        <div className="up-file-name">{f.name}</div>
                        <div className="up-file-meta">{f.size}</div>

                      </div>
                      <button className="up-remove" onClick={() => removeFile(f.id)}>×</button>
                    </div>
                  ))}
                  <button className="up-add-more" onClick={() => inputRef.current?.click()}>
                    + Add More Files
                  </button>
                </>
              )}

              <div className="up-hint">✓ Preview pages before you print</div>
              <div className="up-formats">Accepted formats: PDF, JPG, PNG. Max 100MB per file</div>
              <div style={{ fontSize: '11px', color: '#dc2626', background: '#fef2f2', padding: '8px 12px', borderRadius: '8px', marginTop: '12px', border: '1px solid #fecaca', lineHeight: '1.4' }}>
                <strong>Printing a Word Doc?</strong> Please Save As/Export as a PDF first to ensure your formatting doesn't change!
              </div>
            </div>

            {/* Footer */}
            <div className="up-footer">
              {uploading && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#8892a4', marginBottom: '6px' }}>
                    <span>Uploading...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#4a5fc1', transition: 'width 0.2s' }}></div>
                  </div>
                </div>
              )}
              <button
                className={`up-btn-upload${files.length > 0 && !uploading ? " active" : ""}`}
                disabled={files.length === 0 || uploading}
                onClick={handleContinue}
              >
                {uploading ? "Processing..." : "Upload"}
                {files.length > 0 && !uploading && <span className="up-badge">{files.length}</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}
