import { NextResponse } from 'next/server'
import { calculateCost } from '@/lib/calculate-cost'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = calculateCost(body)

    return NextResponse.json({ data: result })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
