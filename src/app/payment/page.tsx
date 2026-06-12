'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import PaymentSuccess from '@/components/PaymentSuccess'

export default function Payment() {
  const router = useRouter()
  const [printJob, setPrintJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [orderData, setOrderData] = useState<any>(null)

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



  if (loading) return null

  if (error || !printJob) {
    return <div style={{ padding: '20px', color: 'red' }}>{error || 'Failed to load print job.'}</div>
  }
  return (
    <PaymentSuccess 
      amount={printJob.total_amount.toFixed(2)}
      paymentId={printJob.id}
      onRedirect={() => router.push(`/status?id=${printJob.id}`)}
    />
  )
}
