import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Initialize PDF worker for browser environments
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface ParseResult {
  text: string;
  filename: string;
  fileType: 'pdf' | 'docx' | 'text';
}

/**
 * Extracts plain text from an uploaded file (PDF, DOCX, TXT, MD).
 */
export async function parseResumeFile(file: File): Promise<ParseResult> {
  const filename = file.name;
  const lowerName = filename.toLowerCase();

  // 1. Plain text / Markdown
  if (lowerName.endsWith('.txt') || lowerName.endsWith('.md') || file.type === 'text/plain') {
    const text = await file.text();
    return {
      text: text.trim(),
      filename,
      fileType: 'text'
    };
  }

  // 2. Word Document (.docx)
  if (lowerName.endsWith('.docx') || file.type.includes('wordprocessingml')) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    if (!result.value || !result.value.trim()) {
      throw new Error(`The Word document "${filename}" appears to be empty or contains only non-text media.`);
    }
    return {
      text: result.value.trim(),
      filename,
      fileType: 'docx'
    };
  }

  // 3. PDF Document (.pdf)
  if (lowerName.endsWith('.pdf') || file.type === 'application/pdf') {
    const arrayBuffer = await file.arrayBuffer();
    try {
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true
      });
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ');
        fullText += pageText + '\n\n';
      }

      const trimmed = fullText.trim();
      if (!trimmed) {
        throw new Error(`The PDF "${filename}" contains scanned images without extractable text.`);
      }

      return {
        text: trimmed,
        filename,
        fileType: 'pdf'
      };
    } catch (pdfErr: any) {
      // Fallback for PDF text extraction failure
      throw new Error(`PDF text extraction could not parse "${filename}": ${pdfErr.message || 'Scanned or protected PDF'}. Please paste your resume text below.`);
    }
  }

  throw new Error(`Unsupported file type for "${filename}". Please select a .pdf, .docx, .txt, or .md file.`);
}
