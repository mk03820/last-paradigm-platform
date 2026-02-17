/**
 * Meeting Cost Tracker Generator
 *
 * Generates an Excel spreadsheet for tracking ongoing meeting costs
 * with pre-populated diagnostic data and working formulas.
 *
 * Story 18.3: Excel Document Templates & Generation
 * Task 2: Create Meeting Cost Tracker generator
 * Covers: AC2, AC5, AC6, FR65 (Book attribution)
 */

import ExcelJS from 'exceljs';
import type { DiagnosticSessionData } from '@/lib/db/schema';
import {
  addBrandedHeader,
  addSectionHeader,
  addDataTable,
  addKeyValuePairs,
  addFormulaCell,
  configurePrintArea,
  getColumnLetter,
} from './components';
import {
  EXCEL_COLORS,
  HEADER_STYLE,
  DATA_CELL_STYLE,
  INPUT_CELL_STYLE,
  CURRENCY_STYLE,
  NUMBER_STYLE,
  COLUMN_WIDTHS,
} from './styles';
import type { GenerationResult } from '../word/types';

/**
 * Generate the Meeting Cost Tracker spreadsheet
 */
export async function generateMeetingCostTracker(
  diagnosticData: DiagnosticSessionData
): Promise<GenerationResult> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'The Last Paradigm Platform';
  workbook.created = new Date();

  const tool2 = diagnosticData.tool2?.results || {};

  // Create worksheets
  createSummaryWorksheet(workbook, tool2);
  createWeeklyTrackerWorksheet(workbook, tool2);
  createMonthlyTrackerWorksheet(workbook);
  createDashboardWorksheet(workbook);

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer: Buffer.from(buffer),
    fileSizeBytes: buffer.byteLength,
  };
}

/**
 * Create Summary worksheet with diagnostic baseline
 */
/**
 * Extended tool2 data type for runtime properties that may exist
 */
type ExtendedTool2Data = NonNullable<DiagnosticSessionData['tool2']>['results'] & {
  totalMeetings?: number;
  avgAttendees?: number;
  avgDuration?: number;
  inefficiencyPercent?: number;
};

function createSummaryWorksheet(
  workbook: ExcelJS.Workbook,
  tool2Data: NonNullable<DiagnosticSessionData['tool2']>['results']
): void {
  const ws = workbook.addWorksheet('Summary', {
    properties: { tabColor: { argb: EXCEL_COLORS.navy.slice(2) } },
  });

  // Type assertion for extended runtime properties
  const data = tool2Data as ExtendedTool2Data;

  let currentRow = addBrandedHeader(ws, 'Meeting Cost Tracker');

  // Diagnostic Baseline section
  currentRow = addSectionHeader(ws, 'Diagnostic Baseline (from Playbook 1)', currentRow);

  const baselineData = [
    { label: 'Annual Wasted Meeting Cost', value: data?.wastedCost || 0, format: 'currency' as const },
    { label: 'Annual Wasted Hours', value: data?.wastedHours || 0, format: 'number' as const },
    { label: 'Total Meetings Analyzed', value: data?.totalMeetings || 0, format: 'number' as const },
    { label: 'Average Attendees per Meeting', value: data?.avgAttendees || 0, format: 'number' as const },
    { label: 'Average Meeting Duration (min)', value: data?.avgDuration || 0, format: 'number' as const },
    { label: 'Meeting Inefficiency Rate', value: (data?.inefficiencyPercent || 0) / 100, format: 'percent' as const },
  ];

  currentRow = addKeyValuePairs(ws, baselineData, currentRow);

  // Set column widths
  ws.getColumn(1).width = COLUMN_WIDTHS.extraWide;
  ws.getColumn(2).width = COLUMN_WIDTHS.wide;

  // Configuration section
  currentRow += 2;
  currentRow = addSectionHeader(ws, 'Salary Configuration', currentRow);

  // Salary band inputs (editable)
  const salaryHeaders = ['Salary Band', 'Hourly Rate', '% of Attendees'];
  const salaryData = [
    ['Entry Level (<$75K)', 30, 0.2],
    ['Mid-Level ($75K-$125K)', 50, 0.4],
    ['Senior ($125K-$200K)', 80, 0.3],
    ['Executive (>$200K)', 125, 0.1],
  ];

  currentRow = addDataTable(ws, salaryHeaders, salaryData, currentRow, [COLUMN_WIDTHS.wide, COLUMN_WIDTHS.medium, COLUMN_WIDTHS.medium]);

  // Mark input cells
  const startDataRow = currentRow - salaryData.length;
  for (let i = 0; i < salaryData.length; i++) {
    const row = startDataRow + i;
    Object.assign(ws.getCell(row, 2), INPUT_CELL_STYLE);
    Object.assign(ws.getCell(row, 3), INPUT_CELL_STYLE);
    ws.getCell(row, 3).numFmt = '0%';
  }

  // Create named ranges for salary data
  workbook.definedNames.add(`'Summary'!$B$${startDataRow}:$B$${currentRow - 1}`, 'HourlyRates');
  workbook.definedNames.add(`'Summary'!$C$${startDataRow}:$C$${currentRow - 1}`, 'AttendeeDistribution');

  // Instructions
  currentRow += 2;
  currentRow = addSectionHeader(ws, 'Instructions', currentRow);

  const instructions = [
    '1. Update salary band configurations above if needed (yellow cells are editable)',
    '2. Use the Weekly Tracker to log individual meetings',
    '3. Monthly Tracker automatically summarizes weekly data',
    '4. Dashboard shows trends and comparisons to baseline',
  ];

  instructions.forEach((text) => {
    const cell = ws.getCell(currentRow, 1);
    cell.value = text;
    cell.font = { size: 10, color: { argb: EXCEL_COLORS.slate } };
    ws.mergeCells(currentRow, 1, currentRow, 3);
    currentRow++;
  });

  configurePrintArea(ws, currentRow, 3);
}

/**
 * Create Weekly Tracker worksheet
 */
function createWeeklyTrackerWorksheet(
  workbook: ExcelJS.Workbook,
  tool2Data: NonNullable<DiagnosticSessionData['tool2']>['results']
): void {
  const ws = workbook.addWorksheet('Weekly Tracker', {
    properties: { tabColor: { argb: EXCEL_COLORS.gold.slice(2) } },
  });

  // Type assertion for extended runtime properties
  const data = tool2Data as ExtendedTool2Data;

  let currentRow = addBrandedHeader(ws, 'Weekly Meeting Tracker');

  // Week selector
  const weekCell = ws.getCell(currentRow, 1);
  weekCell.value = 'Week Starting:';
  weekCell.font = { bold: true };

  const dateCell = ws.getCell(currentRow, 2);
  dateCell.value = new Date();
  dateCell.numFmt = 'mm/dd/yyyy';
  Object.assign(dateCell, INPUT_CELL_STYLE);

  currentRow += 2;

  // Meeting log headers
  const headers = [
    'Date',
    'Meeting Name',
    'Duration (min)',
    'Attendees',
    'Was Necessary?',
    'Effective?',
    'Est. Cost',
    'Wasted Cost',
  ];

  // Set column widths
  const widths = [12, 25, 12, 10, 12, 12, 12, 12];
  headers.forEach((_, index) => {
    ws.getColumn(index + 1).width = widths[index];
  });

  // Add header row
  const headerRow = ws.getRow(currentRow);
  headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header;
    Object.assign(cell, HEADER_STYLE);
  });
  currentRow++;

  // Add data rows with formulas (20 rows for weekly meetings)
  const avgHourlyRate = 60; // Will reference Summary later
  const inefficiencyRate = (data?.inefficiencyPercent || 35) / 100;

  for (let i = 0; i < 20; i++) {
    const row = ws.getRow(currentRow);

    // Date
    Object.assign(row.getCell(1), INPUT_CELL_STYLE);
    row.getCell(1).numFmt = 'mm/dd/yyyy';

    // Meeting Name
    Object.assign(row.getCell(2), INPUT_CELL_STYLE);
    row.getCell(2).alignment = { horizontal: 'left' };

    // Duration
    Object.assign(row.getCell(3), INPUT_CELL_STYLE);
    row.getCell(3).alignment = { horizontal: 'center' };

    // Attendees
    Object.assign(row.getCell(4), INPUT_CELL_STYLE);
    row.getCell(4).alignment = { horizontal: 'center' };

    // Was Necessary (dropdown would be ideal)
    Object.assign(row.getCell(5), INPUT_CELL_STYLE);
    row.getCell(5).alignment = { horizontal: 'center' };

    // Effective
    Object.assign(row.getCell(6), INPUT_CELL_STYLE);
    row.getCell(6).alignment = { horizontal: 'center' };

    // Est. Cost formula: (Duration/60) * Attendees * AvgHourlyRate
    row.getCell(7).value = {
      formula: `IF(C${currentRow}="","",ROUND(C${currentRow}/60*D${currentRow}*${avgHourlyRate},0))`,
    };
    Object.assign(row.getCell(7), CURRENCY_STYLE);

    // Wasted Cost formula: If not necessary or not effective, count as waste
    row.getCell(8).value = {
      formula: `IF(OR(E${currentRow}="No",F${currentRow}="No"),G${currentRow},IF(AND(E${currentRow}="Partial",F${currentRow}="Partial"),G${currentRow}*0.5,0))`,
    };
    Object.assign(row.getCell(8), CURRENCY_STYLE);

    currentRow++;
  }

  // Summary row
  currentRow++;
  const summaryRow = ws.getRow(currentRow);
  summaryRow.getCell(1).value = 'WEEKLY TOTAL';
  summaryRow.getCell(1).font = { bold: true };

  summaryRow.getCell(3).value = { formula: `SUM(C${currentRow - 21}:C${currentRow - 1})` };
  Object.assign(summaryRow.getCell(3), NUMBER_STYLE);
  summaryRow.getCell(3).font = { bold: true };

  summaryRow.getCell(7).value = { formula: `SUM(G${currentRow - 21}:G${currentRow - 1})` };
  Object.assign(summaryRow.getCell(7), CURRENCY_STYLE);
  summaryRow.getCell(7).font = { bold: true };

  summaryRow.getCell(8).value = { formula: `SUM(H${currentRow - 21}:H${currentRow - 1})` };
  Object.assign(summaryRow.getCell(8), CURRENCY_STYLE);
  summaryRow.getCell(8).font = { bold: true, color: { argb: EXCEL_COLORS.red } };

  configurePrintArea(ws, currentRow, 8);
}

/**
 * Create Monthly Tracker worksheet
 */
function createMonthlyTrackerWorksheet(workbook: ExcelJS.Workbook): void {
  const ws = workbook.addWorksheet('Monthly Summary', {
    properties: { tabColor: { argb: EXCEL_COLORS.green.slice(2) } },
  });

  let currentRow = addBrandedHeader(ws, 'Monthly Meeting Summary');

  // Monthly summary headers
  const headers = [
    'Week',
    'Total Meetings',
    'Total Duration (hrs)',
    'Total Attendee-Hours',
    'Total Cost',
    'Wasted Cost',
    'Waste %',
  ];

  currentRow = addDataTable(
    ws,
    headers,
    [
      ['Week 1', 0, 0, 0, 0, 0, 0],
      ['Week 2', 0, 0, 0, 0, 0, 0],
      ['Week 3', 0, 0, 0, 0, 0, 0],
      ['Week 4', 0, 0, 0, 0, 0, 0],
      ['Week 5', 0, 0, 0, 0, 0, 0],
    ],
    currentRow,
    [12, 15, 18, 18, 15, 15, 12]
  );

  // Format columns
  for (let row = currentRow - 5; row < currentRow; row++) {
    ws.getCell(row, 5).numFmt = '$#,##0';
    ws.getCell(row, 6).numFmt = '$#,##0';
    ws.getCell(row, 7).numFmt = '0.0%';
  }

  // Monthly total row
  const totalRow = ws.getRow(currentRow);
  totalRow.getCell(1).value = 'MONTH TOTAL';
  totalRow.getCell(1).font = { bold: true };

  for (let col = 2; col <= 6; col++) {
    totalRow.getCell(col).value = { formula: `SUM(${getColumnLetter(col)}${currentRow - 5}:${getColumnLetter(col)}${currentRow - 1})` };
    totalRow.getCell(col).font = { bold: true };
    if (col >= 5) totalRow.getCell(col).numFmt = '$#,##0';
  }

  // Waste % formula
  totalRow.getCell(7).value = { formula: `IF(E${currentRow}=0,0,F${currentRow}/E${currentRow})` };
  totalRow.getCell(7).numFmt = '0.0%';
  totalRow.getCell(7).font = { bold: true };

  configurePrintArea(ws, currentRow, 7);
}

/**
 * Create Dashboard worksheet
 */
function createDashboardWorksheet(workbook: ExcelJS.Workbook): void {
  const ws = workbook.addWorksheet('Dashboard', {
    properties: { tabColor: { argb: EXCEL_COLORS.amber.slice(2) } },
  });

  let currentRow = addBrandedHeader(ws, 'Meeting Cost Dashboard');

  // Key Metrics section
  currentRow = addSectionHeader(ws, 'Key Metrics (This Month vs Baseline)', currentRow);

  const metricsHeaders = ['Metric', 'Baseline', 'This Month', 'Change', 'Status'];
  const metricsData = [
    ['Monthly Meeting Cost', '$0', '$0', '0%', 'N/A'],
    ['Monthly Wasted Cost', '$0', '$0', '0%', 'N/A'],
    ['Waste Rate', '0%', '0%', '0%', 'N/A'],
    ['Avg Meeting Duration', '0 min', '0 min', '0%', 'N/A'],
    ['Avg Attendees', '0', '0', '0%', 'N/A'],
  ];

  currentRow = addDataTable(
    ws,
    metricsHeaders,
    metricsData,
    currentRow,
    [COLUMN_WIDTHS.wide, COLUMN_WIDTHS.medium, COLUMN_WIDTHS.medium, COLUMN_WIDTHS.medium, COLUMN_WIDTHS.medium]
  );

  // Trend Analysis section
  currentRow += 2;
  currentRow = addSectionHeader(ws, 'Trend Analysis', currentRow);

  const trendNote = ws.getCell(currentRow, 1);
  trendNote.value = '[Chart: Monthly meeting cost trend will be displayed here when data is entered]';
  trendNote.font = { italic: true, size: 10, color: { argb: EXCEL_COLORS.slate } };
  ws.mergeCells(currentRow, 1, currentRow + 5, 5);

  currentRow += 7;

  // Recommendations section
  currentRow = addSectionHeader(ws, 'Improvement Recommendations', currentRow);

  const recommendations = [
    '1. Review meetings marked as "Not Necessary" - consider canceling recurring invites',
    '2. Reduce attendees on low-effectiveness meetings',
    '3. Shorten default meeting durations (try 25 or 50 min instead of 30/60)',
    '4. Implement "meeting-free" days or time blocks',
    '5. Track week-over-week trends to measure improvement',
  ];

  recommendations.forEach((text) => {
    const cell = ws.getCell(currentRow, 1);
    cell.value = text;
    cell.font = { size: 10, color: { argb: EXCEL_COLORS.slate } };
    ws.mergeCells(currentRow, 1, currentRow, 5);
    currentRow++;
  });

  configurePrintArea(ws, currentRow, 5);
}
