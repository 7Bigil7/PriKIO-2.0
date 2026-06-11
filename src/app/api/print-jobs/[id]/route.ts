import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    
    // Return dummy data, make sure it says 'ready_for_kiosk' so UI proceeds
    return NextResponse.json({
      data: {
        id,
        status: 'ready_for_kiosk',
        total_amount: 10,
        file_name: 'test.pdf',
        page_count: 5
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
