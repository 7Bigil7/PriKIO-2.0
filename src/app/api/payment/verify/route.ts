import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { orderId, paymentId, signature, printJobId } = await request.json()
    
    // Bypass verification and return success
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
