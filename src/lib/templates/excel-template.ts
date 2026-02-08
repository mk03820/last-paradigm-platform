/**
 * Excel Template Generator
 *
 * Generates a Meeting Audit Calculator Excel template with:
 * - Input fields for meeting data
 * - Visible formulas matching platform methodology
 * - Clear instructions for offline use
 * - Platform URL messaging
 *
 * Covers: FR1.5-1, FR1.5-4, FR1.5-5, FR1.5-6, FR1.5-7
 */

import ExcelJS from 'exceljs';

// Salary band hourly rates (visible in template for transparency)
const SALARY_BAND_RATES = {
  executive: 150,
  senior: 100,
  midLevel: 65,
  entry: 35,
};

const WEEKS_PER_YEAR = 52;

/**
 * Generates a Meeting Audit Calculator Excel workbook
 */
export async function generateMeetingAuditTemplate(): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'The Last Paradigm Platform';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Create the calculator worksheet
  const sheet = workbook.addWorksheet('Meeting Audit Calculator', {
    properties: { tabColor: { argb: 'FFB45309' } }, // Gold accent
  });

  // Set column widths
  sheet.columns = [
    { width: 30 },  // A - Labels
    { width: 15 },  // B - Values
    { width: 15 },  // C - Additional info
    { width: 40 },  // D - Notes/Instructions
  ];

  // ===== HEADER SECTION =====
  let row = 1;

  // Title
  sheet.mergeCells(`A${row}:D${row}`);
  const titleCell = sheet.getCell(`A${row}`);
  titleCell.value = 'Meeting Audit Calculator';
  titleCell.font = { size: 24, bold: true, color: { argb: 'FF1E293B' } };
  titleCell.alignment = { horizontal: 'center' };
  row++;

  // Subtitle
  sheet.mergeCells(`A${row}:D${row}`);
  const subtitleCell = sheet.getCell(`A${row}`);
  subtitleCell.value = 'Step 1 of 7: Quantify Your Meeting Waste';
  subtitleCell.font = { size: 14, italic: true, color: { argb: 'FF6B7280' } };
  subtitleCell.alignment = { horizontal: 'center' };
  row++;

  // Platform attribution
  sheet.mergeCells(`A${row}:D${row}`);
  const attributionCell = sheet.getCell(`A${row}`);
  attributionCell.value = 'From "The Last Paradigm" methodology';
  attributionCell.font = { size: 11, color: { argb: 'FF6B7280' } };
  attributionCell.alignment = { horizontal: 'center' };
  row += 2;

  // ===== INSTRUCTIONS SECTION =====
  sheet.mergeCells(`A${row}:D${row}`);
  const instructionsHeader = sheet.getCell(`A${row}`);
  instructionsHeader.value = 'Instructions';
  instructionsHeader.font = { size: 14, bold: true, color: { argb: 'FF1E293B' } };
  row++;

  const instructions = [
    '1. Enter your meeting details in the yellow highlighted cells below.',
    '2. Distribute your attendees across salary bands (totals must match).',
    '3. View your calculated Annual Meeting Waste in the Results section.',
    '4. All formulas are visible - click any result cell to see how it\'s calculated.',
  ];

  for (const instruction of instructions) {
    sheet.mergeCells(`A${row}:D${row}`);
    sheet.getCell(`A${row}`).value = instruction;
    sheet.getCell(`A${row}`).font = { size: 11, color: { argb: 'FF374151' } };
    row++;
  }
  row++;

  // ===== INPUT SECTION =====
  const inputStartRow = row;
  sheet.mergeCells(`A${row}:D${row}`);
  const inputHeader = sheet.getCell(`A${row}`);
  inputHeader.value = 'Meeting Details (Enter Your Data)';
  inputHeader.font = { size: 14, bold: true, color: { argb: 'FF1E293B' } };
  inputHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
  row++;

  // Input fields with yellow highlighting
  const inputStyle = {
    fill: { type: 'pattern' as const, pattern: 'solid' as const, fgColor: { argb: 'FFFFFBEB' } },
    border: {
      top: { style: 'thin' as const, color: { argb: 'FFD97706' } },
      bottom: { style: 'thin' as const, color: { argb: 'FFD97706' } },
      left: { style: 'thin' as const, color: { argb: 'FFD97706' } },
      right: { style: 'thin' as const, color: { argb: 'FFD97706' } },
    },
  };

  // Meeting Count
  const meetingCountRow = row;
  sheet.getCell(`A${row}`).value = 'Number of Recurring Meetings';
  sheet.getCell(`B${row}`).value = 10;
  sheet.getCell(`B${row}`).fill = inputStyle.fill;
  sheet.getCell(`B${row}`).border = inputStyle.border;
  sheet.getCell(`D${row}`).value = 'How many recurring meetings do you have per week?';
  sheet.getCell(`D${row}`).font = { size: 10, italic: true, color: { argb: 'FF6B7280' } };
  row++;

  // Average Attendees
  const attendeesRow = row;
  sheet.getCell(`A${row}`).value = 'Average Attendees per Meeting';
  sheet.getCell(`B${row}`).value = 6;
  sheet.getCell(`B${row}`).fill = inputStyle.fill;
  sheet.getCell(`B${row}`).border = inputStyle.border;
  sheet.getCell(`D${row}`).value = 'Typical number of people in each meeting';
  sheet.getCell(`D${row}`).font = { size: 10, italic: true, color: { argb: 'FF6B7280' } };
  row++;

  // Average Duration
  const durationRow = row;
  sheet.getCell(`A${row}`).value = 'Average Duration (minutes)';
  sheet.getCell(`B${row}`).value = 60;
  sheet.getCell(`B${row}`).fill = inputStyle.fill;
  sheet.getCell(`B${row}`).border = inputStyle.border;
  sheet.getCell(`D${row}`).value = 'How long does a typical meeting last?';
  sheet.getCell(`D${row}`).font = { size: 10, italic: true, color: { argb: 'FF6B7280' } };
  row += 2;

  // Salary Band Distribution
  sheet.mergeCells(`A${row}:D${row}`);
  const salaryHeader = sheet.getCell(`A${row}`);
  salaryHeader.value = 'Salary Band Distribution (Must Equal Total Attendees)';
  salaryHeader.font = { size: 14, bold: true, color: { argb: 'FF1E293B' } };
  salaryHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
  row++;

  // Column headers for salary bands
  sheet.getCell(`A${row}`).value = 'Salary Band';
  sheet.getCell(`B${row}`).value = 'Count';
  sheet.getCell(`C${row}`).value = 'Hourly Rate';
  sheet.getCell(`D${row}`).value = 'Description';
  sheet.getRow(row).font = { bold: true, size: 11 };
  row++;

  // Executive
  const execRow = row;
  sheet.getCell(`A${row}`).value = 'Executive';
  sheet.getCell(`B${row}`).value = 1;
  sheet.getCell(`B${row}`).fill = inputStyle.fill;
  sheet.getCell(`B${row}`).border = inputStyle.border;
  sheet.getCell(`C${row}`).value = SALARY_BAND_RATES.executive;
  sheet.getCell(`C${row}`).numFmt = '"$"#,##0"/hr"';
  sheet.getCell(`D${row}`).value = 'C-suite, VP, Executive compensation level';
  sheet.getCell(`D${row}`).font = { size: 10, italic: true, color: { argb: 'FF6B7280' } };
  row++;

  // Senior
  const seniorRow = row;
  sheet.getCell(`A${row}`).value = 'Senior';
  sheet.getCell(`B${row}`).value = 2;
  sheet.getCell(`B${row}`).fill = inputStyle.fill;
  sheet.getCell(`B${row}`).border = inputStyle.border;
  sheet.getCell(`C${row}`).value = SALARY_BAND_RATES.senior;
  sheet.getCell(`C${row}`).numFmt = '"$"#,##0"/hr"';
  sheet.getCell(`D${row}`).value = 'Director-level, Senior management';
  sheet.getCell(`D${row}`).font = { size: 10, italic: true, color: { argb: 'FF6B7280' } };
  row++;

  // Mid-Level
  const midRow = row;
  sheet.getCell(`A${row}`).value = 'Mid-Level';
  sheet.getCell(`B${row}`).value = 2;
  sheet.getCell(`B${row}`).fill = inputStyle.fill;
  sheet.getCell(`B${row}`).border = inputStyle.border;
  sheet.getCell(`C${row}`).value = SALARY_BAND_RATES.midLevel;
  sheet.getCell(`C${row}`).numFmt = '"$"#,##0"/hr"';
  sheet.getCell(`D${row}`).value = 'Manager, Senior Individual Contributor';
  sheet.getCell(`D${row}`).font = { size: 10, italic: true, color: { argb: 'FF6B7280' } };
  row++;

  // Entry
  const entryRow = row;
  sheet.getCell(`A${row}`).value = 'Entry';
  sheet.getCell(`B${row}`).value = 1;
  sheet.getCell(`B${row}`).fill = inputStyle.fill;
  sheet.getCell(`B${row}`).border = inputStyle.border;
  sheet.getCell(`C${row}`).value = SALARY_BAND_RATES.entry;
  sheet.getCell(`C${row}`).numFmt = '"$"#,##0"/hr"';
  sheet.getCell(`D${row}`).value = 'Junior staff, Entry-level';
  sheet.getCell(`D${row}`).font = { size: 10, italic: true, color: { argb: 'FF6B7280' } };
  row++;

  // Total validation
  const totalRow = row;
  sheet.getCell(`A${row}`).value = 'Total Attendees';
  sheet.getCell(`A${row}`).font = { bold: true };
  sheet.getCell(`B${row}`).value = { formula: `SUM(B${execRow}:B${entryRow})` };
  sheet.getCell(`B${row}`).font = { bold: true };
  sheet.getCell(`C${row}`).value = { formula: `IF(B${totalRow}=B${attendeesRow},"✓ Valid","⚠ Must equal "&B${attendeesRow})` };
  sheet.getCell(`C${row}`).font = { bold: true };
  row += 2;

  // ===== CALCULATION SECTION =====
  sheet.mergeCells(`A${row}:D${row}`);
  const calcHeader = sheet.getCell(`A${row}`);
  calcHeader.value = 'Calculations (Formulas Visible)';
  calcHeader.font = { size: 14, bold: true, color: { argb: 'FF1E293B' } };
  calcHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
  row++;

  // Weighted Hourly Rate
  const weightedRateRow = row;
  sheet.getCell(`A${row}`).value = 'Weighted Hourly Rate';
  sheet.getCell(`B${row}`).value = {
    formula: `(B${execRow}*C${execRow}+B${seniorRow}*C${seniorRow}+B${midRow}*C${midRow}+B${entryRow}*C${entryRow})/B${totalRow}`
  };
  sheet.getCell(`B${row}`).numFmt = '"$"#,##0.00"/hr"';
  sheet.getCell(`D${row}`).value = 'Average hourly rate weighted by attendee distribution';
  sheet.getCell(`D${row}`).font = { size: 10, italic: true, color: { argb: 'FF6B7280' } };
  row++;

  // Duration in Hours
  const durationHoursRow = row;
  sheet.getCell(`A${row}`).value = 'Duration (hours)';
  sheet.getCell(`B${row}`).value = { formula: `B${durationRow}/60` };
  sheet.getCell(`B${row}`).numFmt = '0.00" hrs"';
  sheet.getCell(`D${row}`).value = 'Meeting duration converted to hours';
  sheet.getCell(`D${row}`).font = { size: 10, italic: true, color: { argb: 'FF6B7280' } };
  row++;

  // Cost per Meeting
  const costPerMeetingRow = row;
  sheet.getCell(`A${row}`).value = 'Cost per Meeting';
  sheet.getCell(`B${row}`).value = {
    formula: `B${attendeesRow}*B${durationHoursRow}*B${weightedRateRow}`
  };
  sheet.getCell(`B${row}`).numFmt = '"$"#,##0.00';
  sheet.getCell(`D${row}`).value = 'attendees × hours × weighted rate';
  sheet.getCell(`D${row}`).font = { size: 10, italic: true, color: { argb: 'FF6B7280' } };
  row++;

  // Weekly Meeting Waste
  const weeklyWasteRow = row;
  sheet.getCell(`A${row}`).value = 'Weekly Meeting Waste';
  sheet.getCell(`B${row}`).value = {
    formula: `B${meetingCountRow}*B${costPerMeetingRow}`
  };
  sheet.getCell(`B${row}`).numFmt = '"$"#,##0.00';
  sheet.getCell(`D${row}`).value = 'meetings × cost per meeting';
  sheet.getCell(`D${row}`).font = { size: 10, italic: true, color: { argb: 'FF6B7280' } };
  row += 2;

  // ===== RESULTS SECTION =====
  sheet.mergeCells(`A${row}:D${row}`);
  const resultsHeader = sheet.getCell(`A${row}`);
  resultsHeader.value = 'Results';
  resultsHeader.font = { size: 14, bold: true, color: { argb: 'FF1E293B' } };
  resultsHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
  row++;

  // Annual Meeting Waste (HEADLINE NUMBER)
  const annualWasteRow = row;
  sheet.getCell(`A${row}`).value = 'Annual Meeting Waste';
  sheet.getCell(`A${row}`).font = { size: 16, bold: true, color: { argb: 'FF1E293B' } };
  sheet.getCell(`B${row}`).value = { formula: `B${weeklyWasteRow}*${WEEKS_PER_YEAR}` };
  sheet.getCell(`B${row}`).numFmt = '"$"#,##0';
  sheet.getCell(`B${row}`).font = { size: 20, bold: true, color: { argb: 'FFB45309' } };
  sheet.getCell(`B${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFBEB' } };
  sheet.getCell(`D${row}`).value = 'weekly waste × 52 weeks';
  sheet.getCell(`D${row}`).font = { size: 10, italic: true, color: { argb: 'FF6B7280' } };
  row += 2;

  // Alignment Tax Estimate
  sheet.getCell(`A${row}`).value = 'Estimated Total Alignment Tax Range';
  sheet.getCell(`A${row}`).font = { bold: true };
  row++;

  sheet.getCell(`A${row}`).value = 'Low Estimate (Meeting waste = 30% of total)';
  sheet.getCell(`B${row}`).value = { formula: `B${annualWasteRow}/0.30` };
  sheet.getCell(`B${row}`).numFmt = '"$"#,##0';
  sheet.getCell(`D${row}`).value = 'If meetings represent 30% of alignment tax';
  sheet.getCell(`D${row}`).font = { size: 10, italic: true, color: { argb: 'FF6B7280' } };
  row++;

  sheet.getCell(`A${row}`).value = 'High Estimate (Meeting waste = 25% of total)';
  sheet.getCell(`B${row}`).value = { formula: `B${annualWasteRow}/0.25` };
  sheet.getCell(`B${row}`).numFmt = '"$"#,##0';
  sheet.getCell(`D${row}`).value = 'If meetings represent 25% of alignment tax';
  sheet.getCell(`D${row}`).font = { size: 10, italic: true, color: { argb: 'FF6B7280' } };
  row += 2;

  // ===== PLATFORM CTA SECTION =====
  sheet.mergeCells(`A${row}:D${row}`);
  const ctaCell = sheet.getCell(`A${row}`);
  ctaCell.value = 'For integrated analysis, PDF export, and the complete 7-step diagnostic:';
  ctaCell.font = { size: 12, bold: true, color: { argb: 'FF1E293B' } };
  row++;

  sheet.mergeCells(`A${row}:D${row}`);
  const urlCell = sheet.getCell(`A${row}`);
  urlCell.value = 'Visit: https://lastparadigm.com';
  urlCell.font = { size: 14, bold: true, color: { argb: 'FFB45309' } };
  urlCell.alignment = { horizontal: 'left' };
  row += 2;

  // ===== METHODOLOGY SECTION =====
  sheet.mergeCells(`A${row}:D${row}`);
  const methodHeader = sheet.getCell(`A${row}`);
  methodHeader.value = 'Methodology';
  methodHeader.font = { size: 14, bold: true, color: { argb: 'FF1E293B' } };
  methodHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
  row++;

  const methodology = [
    'Formula: Annual Meeting Waste = Meetings × Attendees × (Duration ÷ 60) × Weighted Rate × 52',
    '',
    'This calculation represents Step 1 of the 7-step Alignment Tax diagnostic from',
    '"The Last Paradigm" book. Meeting waste typically represents 25-30% of an',
    'organization\'s total alignment tax.',
    '',
    'The alignment tax includes all costs from organizational misalignment:',
    '• Meeting waste (calculated here)',
    '• Rework and revision cycles',
    '• Delayed decisions',
    '• Cross-functional friction',
    '• Strategic drift',
  ];

  for (const line of methodology) {
    sheet.mergeCells(`A${row}:D${row}`);
    sheet.getCell(`A${row}`).value = line;
    sheet.getCell(`A${row}`).font = { size: 10, color: { argb: 'FF374151' } };
    row++;
  }

  // Protect the sheet but allow editing of input cells
  sheet.protect('', {
    selectLockedCells: true,
    selectUnlockedCells: true,
    formatCells: false,
    formatColumns: false,
    formatRows: false,
  });

  // Unlock input cells
  const inputCells = [
    `B${meetingCountRow}`, `B${attendeesRow}`, `B${durationRow}`,
    `B${execRow}`, `B${seniorRow}`, `B${midRow}`, `B${entryRow}`,
  ];
  for (const cellRef of inputCells) {
    sheet.getCell(cellRef).protection = { locked: false };
  }

  return workbook;
}

/**
 * Generates Excel buffer for download
 */
export async function generateExcelBuffer(): Promise<Buffer> {
  const workbook = await generateMeetingAuditTemplate();
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
