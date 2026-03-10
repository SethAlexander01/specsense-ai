/**
 * Server-side PDF text extraction using pdf-parse.
 * Returns raw text content from the PDF buffer.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<{ text: string; pages: number }> {
  // Dynamic import to avoid Edge Runtime issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = await import('pdf-parse') as any
  const pdfParse = mod.default ?? mod
  const data = await pdfParse(buffer)
  return {
    text: data.text,
    pages: data.numpages,
  }
}

/**
 * Split text into overlapping chunks for RAG.
 */
export function chunkText(text: string, chunkSize = 1500, overlap = 200): string[] {
  const chunks: string[] = []
  let start = 0
  const clean = text.replace(/\s+/g, ' ').trim()

  while (start < clean.length) {
    const end = Math.min(start + chunkSize, clean.length)
    chunks.push(clean.slice(start, end))
    start += chunkSize - overlap
    if (start >= clean.length) break
  }
  return chunks
}
