import { jsPDF } from 'jspdf';
import type { CorrectiveAction } from './api';

export function exportActionToPdf(action: CorrectiveAction): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  // 1. Top Government Header Bar (#0B3D6B)
  const headerHeight = 24;
  doc.setFillColor(11, 61, 107);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  // Title text in white
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('MOIL LIMITED (MANGANESE ORE INDIA LTD.)', margin, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(216, 230, 245);
  doc.text('MINISTRY OF STEEL · GOVT. OF INDIA | AI MINING DIRECTIVE', margin, 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('SIH26009', pageWidth - margin, 14, { align: 'right' });

  // 2. Tricolor Strip (directly beneath the top government header)
  const tricolorY = headerHeight;
  const tricolorHeight = 1.6;
  const segWidth = pageWidth / 3;

  doc.setFillColor(255, 153, 51); // Saffron #FF9933
  doc.rect(0, tricolorY, segWidth, tricolorHeight, 'F');

  doc.setFillColor(255, 255, 255); // White
  doc.rect(segWidth, tricolorY, segWidth, tricolorHeight, 'F');

  doc.setFillColor(19, 136, 8); // Green #138808
  doc.rect(segWidth * 2, tricolorY, segWidth, tricolorHeight, 'F');

  y = tricolorY + tricolorHeight + 12;

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(11, 61, 107);
  doc.text('CORRECTIVE ACTION DIRECTIVE', margin, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(92, 102, 112);
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  doc.text(`Doc Ref: MOIL-ACT-${String(action.id).padStart(4, '0')} | Issued: ${dateStr}`, margin, y + 5);

  y += 14;

  // Key Metadata Box
  doc.setFillColor(244, 246, 248);
  doc.setDrawColor(226, 230, 234);
  doc.roundedRect(margin, y, contentWidth, 26, 2, 2, 'FD');

  const colWidth = contentWidth / 4;

  // Metadata 1: Target Mine
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(92, 102, 112);
  doc.text('TARGET MINE', margin + 6, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(27, 31, 35);
  doc.text(`${action.mine_name} Mine`, margin + 6, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(140, 150, 160);
  doc.text('MOIL Operations', margin + 6, y + 20);

  // Metadata 2: Category
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(92, 102, 112);
  doc.text('ACTION CATEGORY', margin + colWidth + 6, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(27, 31, 35);
  doc.text(action.category, margin + colWidth + 6, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(140, 150, 160);
  doc.text('Intervention Type', margin + colWidth + 6, y + 20);

  // Metadata 3: Priority
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(92, 102, 112);
  doc.text('PRIORITY LEVEL', margin + colWidth * 2 + 6, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  if (action.priority === 'urgent') {
    doc.setTextColor(179, 38, 30);
  } else if (action.priority === 'high') {
    doc.setTextColor(199, 119, 0);
  } else {
    doc.setTextColor(27, 138, 90);
  }
  doc.text(action.priority.toUpperCase(), margin + colWidth * 2 + 6, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(140, 150, 160);
  doc.text('Execution Urgency', margin + colWidth * 2 + 6, y + 20);

  // Metadata 4: Status
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(92, 102, 112);
  doc.text('CURRENT STATUS', margin + colWidth * 3 + 6, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  if (action.is_implemented) {
    doc.setTextColor(27, 138, 90);
    doc.text('IMPLEMENTED', margin + colWidth * 3 + 6, y + 14);
  } else {
    doc.setTextColor(11, 61, 107);
    doc.text('PENDING ACTION', margin + colWidth * 3 + 6, y + 14);
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(140, 150, 160);
  doc.text('Operations Log', margin + colWidth * 3 + 6, y + 20);

  y += 34;

  // Directive Subject / Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(11, 61, 107);
  doc.text('DIRECTIVE SUBJECT:', margin, y);

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(27, 31, 35);
  const titleLines = doc.splitTextToSize(action.title, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 5 + 4;

  // Operational Context & Description
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(11, 61, 107);
  doc.text('OPERATIONAL CONTEXT & BACKGROUND', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(45, 55, 72);
  const descLines = doc.splitTextToSize(action.description, contentWidth);
  doc.text(descLines, margin, y);
  y += descLines.length * 4.8 + 6;

  // Quantitative Impact Estimates Box
  doc.setFillColor(238, 244, 249);
  doc.setDrawColor(178, 204, 227);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(11, 61, 107);
  doc.text('PROJECTED PRODUCTION RECOVERY:', margin + 6, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(11, 61, 107);
  doc.text(`${action.estimated_impact_tonnes.toLocaleString()} MT`, margin + 6, y + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(11, 61, 107);
  doc.text('SHORTFALL COMPENSATION:', margin + contentWidth / 2 + 6, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(27, 138, 90);
  doc.text(`${action.estimated_impact_percent}% Target Recovery`, margin + contentWidth / 2 + 6, y + 14);

  y += 26;

  // Sequential Implementation Protocol
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(11, 61, 107);
  doc.text('MANDATORY SEQUENTIAL IMPLEMENTATION PROTOCOL', margin, y);
  y += 6;

  action.implementation_steps.forEach((step, idx) => {
    // Step number pill
    doc.setFillColor(11, 61, 107);
    doc.roundedRect(margin, y, 14, 5.5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(`STEP ${idx + 1}`, margin + 7, y + 3.8, { align: 'center' });

    // Step text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    const stepLines = doc.splitTextToSize(step, contentWidth - 18);
    doc.text(stepLines, margin + 18, y + 4);
    y += Math.max(stepLines.length * 4.5, 7) + 3;
  });

  y += 6;

  // Authority & Sign-Off Section
  const footerBoxY = Math.max(y, 250);
  doc.setDrawColor(226, 230, 234);
  doc.line(margin, footerBoxY, pageWidth - margin, footerBoxY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(92, 102, 112);
  doc.text('Authorized by: MOIL Production Control & AI Intelligence System', margin, footerBoxY + 6);
  doc.text('Ministry of Steel · Smart India Hackathon 2026 (SIH26009)', margin, footerBoxY + 11);
  doc.text('Verification Status: Automated Dispatch Document · Valid Without Physical Signature', margin, footerBoxY + 16);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(11, 61, 107);
  doc.text('CONFIDENTIAL / OFFICIAL MOIL RECORD', pageWidth - margin, footerBoxY + 6, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toISOString()}`, pageWidth - margin, footerBoxY + 11, { align: 'right' });

  // Save PDF
  const filename = `MOIL_Directive_Action_${action.id}_${action.mine_name.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
  return filename;
}
