import { PDFDocument } from 'pdf-lib'

export async function getPdfPageCount(buffer: ArrayBuffer): Promise<number> {
  try {
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true })
    return pdfDoc.getPageCount()
  } catch (err) {
    console.error('Error counting PDF pages:', err)
    return 1 // Fallback or throw error
  }
}
