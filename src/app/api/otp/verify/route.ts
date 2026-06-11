import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { otp } = await request.json()
    
    if (otp !== '123456') {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        printJobId: `job_dummy_${Date.now()}`,
        fileName: 'test.pdf',
        pageCount: 5,
        totalAmount: 10
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
