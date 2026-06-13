import * as pdfjsLib from 'pdfjs-dist';

// Use a CDN for the worker to avoid complex Webpack/Next.js worker configurations
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

/**
 * Extracts the number of pages from a PDF File object.
 * @param file The PDF File object
 * @returns Promise resolving to the number of pages
 */
export async function getPdfPageCount(file: File): Promise<number> {
  if (file.type !== 'application/pdf') {
    throw new Error('File is not a PDF');
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    return pdf.numPages;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return 1; // Fallback to 1 page if parsing fails
  }
}
