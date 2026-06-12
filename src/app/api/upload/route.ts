import { NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    let pageCount = 1
    if (file.name.match(/\.pdf$/i)) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(new Uint8Array(arrayBuffer))
        pageCount = pdfDoc.getPageCount()
      } catch (e) {
        console.error('Failed to parse PDF', e)
        pageCount = 1
      }
    }

    return NextResponse.json({
      data: {
        url: 'https://dummy.url/file.pdf',
        fileName: file.name,
        fileSizeMb: (file.size / (1024 * 1024)).toFixed(2),
        pageCount: pageCount
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
