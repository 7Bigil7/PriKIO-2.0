import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { printJobId, amount } = await request.json()
    
    // Bypass razorpay and supabase, just return a dummy order
    return NextResponse.json({
      data: {
        orderId: `order_dummy_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: 'INR',
        keyId: 'dummy_key_id'
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
