import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Just return a dummy print job
    return NextResponse.json({
      data: {
        id: `job_dummy_${Date.now()}`,
        ...body,
        status: 'pending'
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  return NextResponse.json({ data: [] })
}
