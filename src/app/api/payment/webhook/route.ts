import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-razorpay-signature')
    const rawBody = await request.text()

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET!)
      .update(rawBody)
      .digest('hex')

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const payload = JSON.parse(rawBody)
    const supabase = await createClient()

    if (payload.event === 'payment.captured' || payload.event === 'order.paid') {
      const paymentEntity = payload.payload.payment.entity
      const orderId = paymentEntity.order_id
      const paymentId = paymentEntity.id

      // Update Transaction status using service role or bypass RLS if needed
      // (Assuming the API route has bypass RLS or we use service_role key)
      await supabase
        .from('transactions')
        .update({ status: 'paid', razorpay_payment_id: paymentId })
        .eq('razorpay_order_id', orderId)

      // Get printJobId
      const { data: tx } = await supabase
        .from('transactions')
        .select('print_job_id')
        .eq('razorpay_order_id', orderId)
        .single()

      if (tx?.print_job_id) {
        await supabase
          .from('print_jobs')
          .update({ status: 'processing', payment_status: 'paid', payment_id: paymentId })
          .eq('id', tx.print_job_id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
