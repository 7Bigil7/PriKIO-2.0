import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    return NextResponse.json({
      data: {
        url: 'https://dummy.url/file.pdf',
        fileName: file.name,
        fileSizeMb: (file.size / (1024 * 1024)).toFixed(2),
        pageCount: 5
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
