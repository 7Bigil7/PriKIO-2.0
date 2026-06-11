import React, { useEffect, useRef, useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import { parsePageRangeToSet, formatSetToPageRange } from '@/lib/pageRangeUtils'
import { PrintFile } from '@/store/usePrintStore'

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`
}

function PdfPageCanvas({ pdf, pageNum, selected, onToggle }: { pdf: any, pageNum: number, selected: boolean, onToggle: (n: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsVisible(true)
    }, { rootMargin: '400px' })
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return
    let renderTask: any
    pdf.getPage(pageNum).then((page: any) => {
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = canvasRef.current
      if (!canvas) return
      const context = canvas.getContext('2d')
      if (!context) return
      canvas.height = viewport.height
      canvas.width = viewport.width

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }
      renderTask = page.render(renderContext)
    })
    return () => {
      if (renderTask) renderTask.cancel()
    }
  }, [pdf, pageNum, isVisible])

  return (
    <div 
      ref={containerRef}
      onClick={() => onToggle(pageNum)}
      style={{
        border: selected ? '4px solid var(--accent)' : '1px solid var(--border)',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        opacity: selected ? 1 : 0.85,
        background: '#fff',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '650px',
        minHeight: '400px',
        margin: '0 auto',
        boxShadow: selected ? '0 8px 24px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)'
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: 'auto', display: 'block' }} />
      <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: '14px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px' }}>
        Page {pageNum}
      </div>
      
      {/* Checkbox indicator */}
      {selected ? (
        <div style={{ position: 'absolute', top: 16, right: 16, background: 'var(--accent)', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      ) : (
        <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.9)', border: '2.5px solid var(--grey-mid)', borderRadius: '50%', width: '36px', height: '36px', transition: 'all 0.2s' }}>
        </div>
      )}
    </div>
  )
}

export default function FilePreviewModal({ 
  file, 
  onSave, 
  onClose 
}: { 
  file: PrintFile, 
  onSave: (range: string) => void, 
  onClose: () => void 
}) {
  const [pdf, setPdf] = useState<any>(null)
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set())
  const [objectUrl, setObjectUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    setSelectedPages(parsePageRangeToSet(file.pagesToPrint, file.pageCount))
  }, [file])

  useEffect(() => {
    if (!file.originalFile) {
      setErrorMsg("Original file object is lost from memory.")
      return
    }

    const url = URL.createObjectURL(file.originalFile)
    setObjectUrl(url)
    
    const isPdf = file.originalFile.type === 'application/pdf' || file.fileName.toLowerCase().endsWith('.pdf')
    
    if (isPdf) {
      pdfjsLib.getDocument({ url }).promise.then(setPdf).catch(err => {
        console.error(err)
        setErrorMsg(err.message || 'Failed to load PDF document.')
      })
    }

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  const handleToggle = (pageNum: number) => {
    const next = new Set(selectedPages)
    if (next.has(pageNum)) {
      next.delete(pageNum)
    } else {
      next.add(pageNum)
    }
    setSelectedPages(next)
  }

  const handleSave = () => {
    onSave(formatSetToPageRange(selectedPages, file.pageCount))
  }

  const isImage = file.originalFile?.type.startsWith('image/')

  return (
    <div className="modal-overlay" style={{ position: 'fixed', zIndex: 9999, inset: 0 }}>
      <div className="modal-card" style={{ height: '90vh', maxWidth: '800px', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden', margin: 'auto' }}>
        
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
          <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--gd)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '16px' }}>
            Preview: {file.fileName}
          </div>
          <button onClick={onClose} style={{ background: 'var(--gl)', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gd)" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: 'var(--body-bg)' }}>
          {pdf ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', padding: '16px 0' }}>
              {Array.from({ length: pdf.numPages }, (_, i) => i + 1).map(pageNum => (
                <PdfPageCanvas 
                  key={pageNum} 
                  pdf={pdf} 
                  pageNum={pageNum} 
                  selected={selectedPages.has(pageNum)} 
                  onToggle={handleToggle} 
                />
              ))}
            </div>
          ) : isImage && objectUrl ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <img src={objectUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '12px' }} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--grey)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <div style={{ fontWeight: 500, color: 'var(--gd)' }}>Preview not available</div>
              <div style={{ fontSize: '13px', marginTop: '4px' }}>{errorMsg || 'Please set the page range manually.'}</div>
            </div>
          )}
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid var(--border)', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', color: 'var(--grey-mid)' }}>
            {selectedPages.size} {selectedPages.size === 1 ? 'page' : 'pages'} selected
          </div>
          <button 
            onClick={handleSave}
            disabled={selectedPages.size === 0}
            style={{
              background: selectedPages.size === 0 ? 'var(--grey)' : 'var(--navy)',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: selectedPages.size === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            Save Selection
          </button>
        </div>
      </div>
    </div>
  )
}
