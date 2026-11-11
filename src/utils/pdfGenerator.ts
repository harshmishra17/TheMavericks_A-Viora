import { jsPDF } from 'jspdf';
import { ProjectClaim } from '../types';

interface PDFResumeOptions {
  resumeText: string;
  candidateName: string;
  targetRole: string;
  company: string;
  version: number;
  excludeUnresolved?: boolean;
  unresolvedClaims?: ProjectClaim[];
}

interface PDFCoverLetterOptions {
  coverNoteText: string;
  candidateName: string;
  targetRole: string;
  company: string;
  version: number;
}

/**
 * Generates and downloads a clean, professional PDF resume formatted
 * according to the A-viora verified placement design principles.
 */
export function generateResumePDF({
  resumeText,
  candidateName,
  targetRole,
  company,
  version,
  excludeUnresolved = true,
  unresolvedClaims = []
}: PDFResumeOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 10) {
      doc.addPage();
      y = margin;
      drawPageFooter();
    }
  };

  const drawPageFooter = () => {
    const pageCount = doc.getNumberOfPages();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 145, 155);
    doc.text(
      `A-viora Verified Placement Document · v${version} · Backed by student project repositories`,
      margin,
      pageHeight - 10
    );
    doc.text(
      `Page ${pageCount}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
  };

  // 1. Header Banner
  doc.setFillColor(20, 33, 61); // Deep Navy #14213D
  doc.rect(margin, y, contentWidth, 22, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(244, 237, 224); // Warm Cream #F4EDE0
  doc.text(candidateName.toUpperCase(), margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(255, 107, 91); // Coral #FF6B5B
  doc.text(`TARGET: ${targetRole.toUpperCase()} — ${company.toUpperCase()}`, margin + 6, y + 16);

  y += 28;

  // 2. Prepare text lines, filtering out unresolved claims if requested
  let processedText = resumeText;
  if (excludeUnresolved && unresolvedClaims.length > 0) {
    unresolvedClaims.forEach(claim => {
      if (!claim.resolved && processedText.includes(claim.text)) {
        processedText = processedText.replace(
          claim.text,
          `[Claim removed: Awaiting individual project contribution clarification]`
        );
      }
    });
  }

  const rawLines = processedText.split('\n');

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i].trim();

    // Skip candidate name repetition if already rendered in top banner
    if (line.toUpperCase() === candidateName.toUpperCase() && i < 3) {
      continue;
    }

    if (!line) {
      y += 3;
      continue;
    }

    // Check if section header (e.g. OBJECTIVE:, SKILLS:, PROJECTS:, EDUCATION:)
    const isHeader =
      line.endsWith(':') ||
      line === line.toUpperCase() && line.length < 35 && !line.startsWith('-') && !line.startsWith('•') ||
      line.startsWith('## ') ||
      line.startsWith('# ');

    if (isHeader) {
      checkPageBreak(12);
      const cleanHeader = line.replace(/^#+\s*/, '').replace(/:$/, '').trim();

      y += 2;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(20, 33, 61); // Deep Navy
      doc.text(cleanHeader.toUpperCase(), margin, y);

      // Coral accent underline rule
      doc.setDrawColor(255, 107, 91); // Coral
      doc.setLineWidth(0.6);
      doc.line(margin, y + 1.5, margin + 40, y + 1.5);

      // Light divider across rest of width
      doc.setDrawColor(230, 225, 215);
      doc.setLineWidth(0.2);
      doc.line(margin + 42, y + 1.5, pageWidth - margin, y + 1.5);

      y += 6;
      continue;
    }

    // Bullet point or project experience line
    const isBullet = line.startsWith('-') || line.startsWith('•') || line.startsWith('*');

    if (isBullet) {
      const bulletContent = line.replace(/^[-•*]\s*/, '').trim();
      const wrapped = doc.splitTextToSize(bulletContent, contentWidth - 8);
      const blockHeight = wrapped.length * 4.2;
      checkPageBreak(blockHeight + 2);

      // Bullet dot
      doc.setFillColor(255, 107, 91); // Coral bullet dot
      doc.circle(margin + 2.5, y - 1, 0.9, 'F');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(30, 35, 45);

      doc.text(wrapped, margin + 6, y);
      y += blockHeight + 1.5;
    } else {
      // Regular paragraph line
      const wrapped = doc.splitTextToSize(line, contentWidth);
      const blockHeight = wrapped.length * 4.2;
      checkPageBreak(blockHeight + 2);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(45, 50, 60);

      doc.text(wrapped, margin, y);
      y += blockHeight + 1;
    }
  }

  // Draw footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 145, 155);
    doc.text(
      `A-viora Placement Assistant · Verified Resume v${version} · ${company}`,
      margin,
      pageHeight - 10
    );
    doc.text(
      `Page ${p} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  const cleanFilename = `${candidateName.replace(/\s+/g, '_')}_Verified_Resume_v${version}.pdf`;
  doc.save(cleanFilename);
}

/**
 * Generates and downloads a clean, professional PDF Cover Letter.
 */
export function generateCoverLetterPDF({
  coverNoteText,
  candidateName,
  targetRole,
  company,
  version
}: PDFCoverLetterOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 22;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      y = margin;
      drawCoverPageFooter();
    }
  };

  const drawCoverPageFooter = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 145, 155);
    doc.text(
      `A-viora Application Studio · Cover Letter · Confidential`,
      margin,
      pageHeight - 12
    );
    doc.text(
      `Page ${doc.getNumberOfPages()}`,
      pageWidth - margin,
      pageHeight - 12,
      { align: 'right' }
    );
  };

  // Header Letterhead
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(20, 33, 61); // Deep Navy
  doc.text(candidateName, margin, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 105, 115);
  doc.text(`Candidate for: ${targetRole} · ${company}`, margin, y);

  y += 4;
  doc.setDrawColor(255, 107, 91); // Coral hairline rule
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  y += 9;

  // Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 85, 95);
  doc.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, y);

  y += 7;

  // Addressed to
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(20, 33, 61);
  doc.text(`Hiring Team`, margin, y);
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.text(`${company}`, margin, y);

  y += 9;

  // Body paragraphs
  const paragraphs = coverNoteText.split(/\n\s*\n/);

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i].trim();
    if (!p) continue;

    const wrapped = doc.splitTextToSize(p, contentWidth);
    const blockHeight = wrapped.length * 4.8;
    checkPageBreak(blockHeight + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 35, 45);
    doc.text(wrapped, margin, y);

    y += blockHeight + 5;
  }

  // Draw footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 145, 155);
    doc.text(
      `A-viora Application Studio · Cover Letter · Application for ${company}`,
      margin,
      pageHeight - 12
    );
    doc.text(
      `Page ${p} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 12,
      { align: 'right' }
    );
  }

  const cleanFilename = `${candidateName.replace(/\s+/g, '_')}_Cover_Letter_${company.replace(/\s+/g, '_')}.pdf`;
  doc.save(cleanFilename);
}
