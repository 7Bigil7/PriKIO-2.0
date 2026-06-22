'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import PaymentSuccess from '@/components/PaymentSuccess'

import { usePrintStore } from '@/store/usePrintStore'

export default function Payment() {
  const router = useRouter()
  const [printJob, setPrintJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const { globalJobId } = usePrintStore()

  useEffect(() => {
    const printJobId = sessionStorage.getItem('printJobId')
    if (!printJobId) {
      router.push('/upload')
      return
    }

    const fetchJob = async () => {
      try {
        const cached = sessionStorage.getItem('printJobData')
        if (cached) {
          setPrintJob(JSON.parse(cached))
          setLoading(false)
          return
        }

        const res = await fetch(`/api/print-jobs/${printJobId}`)
        const result = await res.json()
        if (res.ok) {
          setPrintJob(result.data)
        } else {
          setError(result.error)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [router])

  const handleSimulateWebhookAndRedirect = async () => {
    // In production, Razorpay calls the webhook. Here we simulate it.
    const realJobId = globalJobId || printJob.id
    try {
      await fetch('http://localhost:8000/api/webhook/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: realJobId })
      })
    } catch (e) {
      console.error("Webhook simulation failed", e)
    }
    router.push(`/status?id=${realJobId}`)
  }

  if (loading) return null

  if (error || !printJob) {
    return <div style={{ padding: '20px', color: 'red' }}>{error || 'Failed to load print job.'}</div>
  }
  
  return (
    <PaymentSuccess 
      amount={(printJob.total_amount || 0).toFixed(2)}
      paymentId={printJob.id}
      onRedirect={handleSimulateWebhookAndRedirect}
    />
  )
}
