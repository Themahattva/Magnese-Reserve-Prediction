import { jsPDF } from 'jspdf';
import type { CorrectiveAction } from './api';

export function exportActionToPdf(action: CorrectiveAction): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 14;

  // ── 1. Top Formal Government Header (Center Aligned) ─────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(20, 20, 20);
  doc.text('GOVERNMENT OF INDIA', pageWidth / 2, y, { align: 'center' });
  y += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('MINISTRY OF STEEL', pageWidth / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  doc.text('MOIL LIMITED', pageWidth / 2, y, { align: 'center' });
  y += 4.5;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  doc.text('(A Government of India Enterprise · Miniratna-I Category CPSE)', pageWidth / 2, y, { align: 'center' });
  y += 3.8;
  doc.setFont('helvetica', 'normal');
  doc.text('MOIL Bhawan, 1A Katol Road, Nagpur, Maharashtra – 440013', pageWidth / 2, y, { align: 'center' });
  y += 4.5;

  // Double Horizontal Line (Official Gazette standard)
  doc.setDrawColor(20, 20, 20);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  doc.setLineWidth(0.2);
  doc.line(margin, y + 1.1, pageWidth - margin, y + 1.1);
  y += 6;

  // ── 2. Official Reference & Date ─────────────────────────────
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(20, 20, 20);
  doc.text(`F. No. MOIL/PROD-AI/2026/DIR-${String(action.id).padStart(4, '0')}`, margin, y);

  doc.setFont('helvetica', 'normal');
  doc.text(`Nagpur, Dated: ${dateStr}`, pageWidth - margin, y, { align: 'right' });
  y += 7.5;

  // ── 3. Document Title ────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('OFFICE DIRECTIVE / ORDER', pageWidth / 2, y, { align: 'center' });
  y += 4;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  doc.text('(Issued under Shortfall Mitigation & Resource Optimization Protocol)', pageWidth / 2, y, { align: 'center' });
  y += 6.5;

  // ── 4. Subject & Reference ───────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.setTextColor(0, 0, 0);
  const subjText = `SUBJECT: OPERATIONAL DIRECTIVE – ${action.title.toUpperCase()}`;
  const subjLines = doc.splitTextToSize(subjText, contentWidth);
  doc.text(subjLines, margin, y);
  y += subjLines.length * 4.2 + 2;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  doc.text(`Reference: Central AI Telemetry & Predictive Shortfall Advisory Ref: SIH26009/ACT-${String(action.id).padStart(4, '0')}`, margin, y);
  y += 5.5;

  // Thin separator rule
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4.5;

  // ── 5. Preamble ──────────────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(20, 20, 20);
  const p1 = `1. In exercise of delegated administrative powers and pursuant to the predictive production shortfall assessment conducted for ${action.mine_name} Mine, sanction of the Competent Authority is hereby conveyed for the execution of the following operational corrective directive to mitigate output deficit and restore production targets:`;
  const p1Lines = doc.splitTextToSize(p1, contentWidth);
  doc.text(p1Lines, margin, y);
  y += p1Lines.length * 4.2 + 3.5;

  // ── 6. Formal Parameter Matrix (Table) ───────────────────────
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.25);
  doc.rect(margin, y, contentWidth, 23);

  // Table horizontal dividing lines
  doc.line(margin, y + 7.6, margin + contentWidth, y + 7.6);
  doc.line(margin, y + 15.3, margin + contentWidth, y + 15.3);

  // Table vertical dividing line
  const midX = margin + contentWidth / 2;
  doc.line(midX, y, midX, y + 23);

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text('Target Mine Location:', margin + 3, y + 5.2);
  doc.setFont('helvetica', 'normal');
  doc.text(`${action.mine_name} Mine`, margin + 36, y + 5.2);

  doc.setFont('helvetica', 'bold');
  doc.text('Classification / Type:', midX + 3, y + 5.2);
  doc.setFont('helvetica', 'normal');
  doc.text(`${(action.action_type || 'Operational').toUpperCase()} / ${action.category}`, midX + 35, y + 5.2);

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.text('Projected Recovery:', margin + 3, y + 12.8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${action.estimated_impact_tonnes.toLocaleString()} Metric Tonnes`, margin + 36, y + 12.8);

  doc.setFont('helvetica', 'bold');
  doc.text('Shortfall Offset:', midX + 3, y + 12.8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${action.estimated_impact_percent}% Target Recovery`, midX + 35, y + 12.8);

  // Row 3
  doc.setFont('helvetica', 'bold');
  doc.text('Urgency / Priority:', margin + 3, y + 20.4);
  doc.setFont('helvetica', 'bold');
  const prioLevel = action.priority?.toLowerCase() === 'urgent' ? 'I' : action.priority?.toLowerCase() === 'high' ? 'II' : 'III';
  doc.text(`${action.priority.toUpperCase()} (Priority Level ${prioLevel})`, margin + 36, y + 20.4);

  doc.setFont('helvetica', 'bold');
  doc.text('Action Status:', midX + 3, y + 20.4);
  doc.setFont('helvetica', 'normal');
  doc.text(action.is_implemented ? 'IMPLEMENTED & LOGGED' : 'Pending Field Execution', midX + 35, y + 20.4);

  y += 27;

  // ── 7. Operational Justification ─────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text('2. Technical Justification & Operational Context:', margin, y);
  y += 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  const descLines = doc.splitTextToSize(action.description, contentWidth);
  doc.text(descLines, margin, y);
  y += descLines.length * 4.2 + 3.5;

  // ── 8. Sequential Protocol Steps ─────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 0, 0);
  doc.text('3. Sequential Standard Operating Procedure (SOP):', margin, y);
  y += 4;

  action.implementation_steps.forEach((step, idx) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`3.${idx + 1}`, margin + 2, y);
    doc.setFont('helvetica', 'normal');
    const stepLines = doc.splitTextToSize(step, contentWidth - 12);
    doc.text(stepLines, margin + 10, y);
    y += Math.max(stepLines.length * 4, 4.5) + 1;
  });
  y += 2;

  // ── 9. Compliance & Safety Directive ─────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  const comp = `4. Compliance Directive: The Agent / Mine Manager shall oversee immediate compliance under safety guidelines prescribed by Directorate General of Mines Safety (DGMS). Daily operational progress and telemetry entries must be transmitted to Central Production Cell, MOIL Bhawan until complete recovery is verified.`;
  const compLines = doc.splitTextToSize(comp, contentWidth);
  doc.text(compLines, margin, y);
  y += compLines.length * 3.8 + 6;

  // Separator line before signature section
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // ── 10. Authority, Signature & Stamp (Two-Column Layout) ─────
  const signY = y;
  const colLeftWidth = 90;
  const colRightStart = margin + colLeftWidth + 10;

  // LEFT COLUMN: Official Distribution & Round Seal Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text('Copy forwarded for information & necessary action to:', margin, signY);

  const copies = [
    '1. The Chairman-cum-Managing Director (CMD), MOIL Limited',
    '2. The Director (Production & Planning), Ministry of Steel, New Delhi',
    `3. The Agent / Mine Manager, ${action.mine_name} Mine`,
    '4. Central Production & Telemetry Monitoring Cell, Nagpur',
    '5. Guard File / Record Section',
  ];

  let copyY = signY + 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(50, 50, 50);
  copies.forEach((c) => {
    doc.text(c, margin, copyY);
    copyY += 3.4;
  });

  // Official Stamp Box
  const stampY = copyY + 2.5;
  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.25);
  doc.roundedRect(margin, stampY, 55, 18, 1, 1, 'D');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 100);
  doc.text('[ OFFICIAL ROUND SEAL / STAMP ]', margin + 27.5, stampY + 7, { align: 'center' });
  doc.text('MOIL LIMITED · PRODUCTION CELL', margin + 27.5, stampY + 11.5, { align: 'center' });

  // RIGHT COLUMN: Undersigned Officer Sign-off Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text('By Order of the Competent Authority,', colRightStart, signY);

  // Signature Space
  const sigLineY = signY + 17;
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.3);
  doc.line(colRightStart, sigLineY, pageWidth - margin, sigLineY);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(80, 80, 80);
  doc.text('(Signature of the Undersigned Officer)', colRightStart, sigLineY + 3.8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text('Name:', colRightStart, sigLineY + 8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('________________________________', colRightStart + 16, sigLineY + 8.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Designation:', colRightStart, sigLineY + 13);
  doc.setFont('helvetica', 'normal');
  doc.text('General Manager (Production & Mines)', colRightStart + 21, sigLineY + 13);

  doc.setFont('helvetica', 'bold');
  doc.text('Organization:', colRightStart, sigLineY + 17.5);
  doc.setFont('helvetica', 'normal');
  doc.text('MOIL Limited, Ministry of Steel', colRightStart + 22, sigLineY + 17.5);

  doc.setFont('helvetica', 'bold');
  doc.text('Date & Place:', colRightStart, sigLineY + 22);
  doc.setFont('helvetica', 'normal');
  doc.text('_____ / _____ / 2026,  Nagpur', colRightStart + 22, sigLineY + 22);

  // ── 11. Official Document Footer ─────────────────────────────
  const pageBottomY = pageHeight - 8;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(margin, pageBottomY - 2, pageWidth - margin, pageBottomY - 2);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(120, 120, 120);
  doc.text('MOIL AI-Enabled Mining Intelligence System · Smart India Hackathon 2026 (SIH26009)', margin, pageBottomY + 2);
  doc.text('Page 1 of 1', pageWidth - margin, pageBottomY + 2, { align: 'right' });

  // Save PDF
  const filename = `MOIL_Office_Directive_Act_${String(action.id).padStart(4, '0')}_${action.mine_name.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
  return filename;
}
