import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { printJobId } = await request.json()
    
    // Return dummy OTP
    return NextResponse.json({
      data: {
        otp: '6473',
        expiresAt: new Date(Date.now() + 120000).toISOString()
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
