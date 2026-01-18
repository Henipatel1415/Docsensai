import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export const parsePDF = async (buffer, documentName) => {
  const data = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({ data, useWorkerFetch: false, isEvalSupported: false });
  const doc = await loadingTask.promise;

  let fullText = '';
  // 1. Saare pages ka text clean karke ek saath jama karein
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(' ');
    fullText += pageText + ' ';
  }

  // Extra spaces aur new lines saaf karein
  const cleanText = fullText.replace(/\s+/g, ' ').trim();
  const chunks = [];

  /**
   * PROFESSIONAL CHUNKING STRATEGY:
   * CHUNK_SIZE: 1000 characters (Taki poora paragraph ya section ek saath rahe)
   * OVERLAP: 200 characters (Taki context agle chunk mein bhi carry forward ho)
   */
  const CHUNK_SIZE = 1000;
  const OVERLAP = 200;

  for (let i = 0; i < cleanText.length; i += CHUNK_SIZE - OVERLAP) {
    const chunkText = cleanText.substring(i, i + CHUNK_SIZE);

    if (chunkText.trim().length > 50) {
      chunks.push({
        documentName,
        chunkText: chunkText.trim(),
        metadata: {
          charCount: chunkText.length,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  return chunks;
};
