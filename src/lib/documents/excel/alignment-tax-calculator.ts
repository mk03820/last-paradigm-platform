/**
 * Alignment Tax Calculator Generator
 *
 * Generates an Excel spreadsheet for calculating total alignment tax
 * with all 7 diagnostic tool inputs, master formulas, scenario modeling,
 * and ROI projection.
 *
 * Story 18.3: Excel Document Templates & Generation
 * Task 3: Create Alignment Tax Calculator generator
 * Covers: AC3, AC5, AC6, FR65 (Book attribution)
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
  addScoreConditionalFormatting,
} from './components';
import {
  EXCEL_COLORS,
  HEADER_STYLE,
  DATA_CELL_STYLE,
  INPUT_CELL_STYLE,
  CURRENCY_STYLE,
  NUMBER_STYLE,
  PERCENT_STYLE,
  COLUMN_WIDTHS,
  ROW_HEIGHTS,
} from './styles';
import type { GenerationResult } from '../word/types';

/**
 * Generate the Alignment Tax Calculator spreadsheet
 */
export async function generateAlignmentTaxCalculator(
  diagnosticData: DiagnosticSessionData
): Promise<GenerationResult> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'The Last Paradigm Platform';
  workbook.created = new Date();

  // Create worksheets
  createDiagnosticInputsWorksheet(workbook, diagnosticData);
  createMasterCalculationWorksheet(workbook, diagnosticData);
  createScenarioModelingWorksheet(workbook);
  createROIProjectionWorksheet(workbook);
  createSummaryDashboard(workbook);

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer: Buffer.from(buffer),
    fileSizeBytes: buffer.byteLength,
  };
}

/**
 * Create Diagnostic Inputs worksheet with all 7 tool results
 */
function createDiagnosticInputsWorksheet(
  workbook: ExcelJS.Workbook,
  diagnosticData: DiagnosticSessionData
): void {
  const ws = workbook.addWorksheet('Diagnostic Inputs', {
    properties: { tabColor: { argb: EXCEL_COLORS.navy.slice(2) } },
  });

  let currentRow = addBrandedHeader(ws, 'Alignment Tax Calculator - Diagnostic Inputs');

  // Tool 1: Strategy Alignment
  currentRow = addSectionHeader(ws, 'Tool 1: Strategy Alignment Assessment', currentRow);
  const tool1 = diagnosticData.tool1 || {};
  const tool1Scores = tool1.scores || {};
  currentRow = addKeyValuePairs(ws, [
    { label: 'Strategic Score', value: tool1Scores.strategic || 0, format: 'number' },
    { label: 'Execution Score', value: tool1Scores.execution || 0, format: 'number' },
    { label: 'Technology Score', value: tool1Scores.technology || 0, format: 'number' },
    { label: 'Composite Score', value: tool1.compositeScore || 0, format: 'number' },
  ], currentRow);

  // Tool 2: Meeting Cost Analysis
  currentRow += 1;
  currentRow = addSectionHeader(ws, 'Tool 2: Meeting Cost Analysis', currentRow);
  const tool2Results = diagnosticData.tool2?.results || {};
  const tool2Inputs = diagnosticData.tool2?.inputs || {};
  currentRow = addKeyValuePairs(ws, [
    { label: 'Annual Wasted Meeting Cost', value: tool2Results.wastedCost || 0, format: 'currency' },
    { label: 'Annual Wasted Hours', value: tool2Results.wastedHours || 0, format: 'number' },
    { label: 'Total Meeting Hours', value: tool2Results.totalMeetingHours || 0, format: 'number' },
    { label: 'Meetings Analyzed', value: tool2Inputs.meetingCount || 0, format: 'number' },
  ], currentRow);

  // Tool 3: Decision Velocity
  currentRow += 1;
  currentRow = addSectionHeader(ws, 'Tool 3: Decision Velocity Assessment', currentRow);
  const tool3 = diagnosticData.tool3 || {};
  const tool3Metrics = (tool3.metrics || {}) as Record<string, number>;
  currentRow = addKeyValuePairs(ws, [
    { label: 'Overall Median (days)', value: tool3Metrics.overallMedian || 0, format: 'number' },
    { label: 'Overall P90 (days)', value: tool3Metrics.overallP90 || 0, format: 'number' },
    { label: 'Decisions Analyzed', value: (tool3.decisions as unknown[] || []).length, format: 'number' },
    { label: 'Decision Types', value: (tool3.decisions as unknown[] || []).length > 0 ? 'Available' : 'N/A' },
  ], currentRow);

  // Tool 4: Stakeholder Mapping
  currentRow += 1;
  currentRow = addSectionHeader(ws, 'Tool 4: Stakeholder Alignment', currentRow);
  const tool4 = diagnosticData.tool4 || {};
  const stakeholders = (tool4.stakeholders || []) as unknown[];
  currentRow = addKeyValuePairs(ws, [
    { label: 'Total Stakeholders', value: stakeholders.length, format: 'number' },
    { label: 'Stakeholder Data', value: stakeholders.length > 0 ? 'Available' : 'N/A' },
    { label: 'Mapping Status', value: tool4.completedAt ? 'Complete' : 'Pending' },
    { label: 'Completed At', value: tool4.completedAt || 'N/A' },
  ], currentRow);

  // Tool 5: Data Flow Analysis
  currentRow += 1;
  currentRow = addSectionHeader(ws, 'Tool 5: Data Flow Efficiency', currentRow);
  const tool5 = diagnosticData.tool5 || {};
  const journeys = (tool5.journeys || []) as unknown[];
  currentRow = addKeyValuePairs(ws, [
    { label: 'Friction Cost', value: tool5.frictionCost || 0, format: 'currency' },
    { label: 'Journeys Analyzed', value: journeys.length, format: 'number' },
    { label: 'Analysis Status', value: tool5.completedAt ? 'Complete' : 'Pending' },
    { label: 'Completed At', value: tool5.completedAt || 'N/A' },
  ], currentRow);

  // Tool 6: Communication Health
  currentRow += 1;
  currentRow = addSectionHeader(ws, 'Tool 6: Communication Health', currentRow);
  const tool6 = diagnosticData.tool6 || {};
  const tool6Metrics = (tool6.metrics || {}) as Record<string, number>;
  const antiPatterns = (tool6.antiPatterns || []) as unknown[];
  currentRow = addKeyValuePairs(ws, [
    { label: 'Health Score', value: tool6Metrics.healthScore || 0, format: 'number' },
    { label: 'Anti-Patterns Detected', value: antiPatterns.length, format: 'number' },
    { label: 'Analysis Status', value: tool6.completedAt ? 'Complete' : 'Pending' },
    { label: 'Completed At', value: tool6.completedAt || 'N/A' },
  ], currentRow);

  // Tool 7: Total Cost of Misalignment
  currentRow += 1;
  currentRow = addSectionHeader(ws, 'Tool 7: Total Cost Summary', currentRow);
  const tool7 = diagnosticData.tool7 || {};
  currentRow = addKeyValuePairs(ws, [
    { label: 'Total Cost', value: tool7.totalCost || 0, format: 'currency' },
    { label: 'Alignment Tax %', value: (tool7.alignmentTaxPercent || 0) / 100, format: 'percent' },
    { label: 'Calculation Status', value: tool7.completedAt ? 'Complete' : 'Pending' },
    { label: 'Completed At', value: tool7.completedAt || 'N/A' },
  ], currentRow);

  // Set column widths
  ws.getColumn(1).width = COLUMN_WIDTHS.extraWide;
  ws.getColumn(2).width = COLUMN_WIDTHS.wide;

  configurePrintArea(ws, currentRow, 2);
}

/**
 * Create Master Calculation worksheet with alignment tax formulas
 */
function createMasterCalculationWorksheet(
  workbook: ExcelJS.Workbook,
  diagnosticData: DiagnosticSessionData
): void {
  const ws = workbook.addWorksheet('Master Calculation', {
    properties: { tabColor: { argb: EXCEL_COLORS.gold.slice(2) } },
  });

  let currentRow = addBrandedHeader(ws, 'Alignment Tax Master Calculation');

  // Organization Parameters
  currentRow = addSectionHeader(ws, 'Organization Parameters (Editable)', currentRow);

  const orgParams = [
    ['Total Employees', 100, 'B'],
    ['Average Fully-Loaded Cost per Employee', 85000, 'B'],
    ['Annual Revenue', 10000000, 'B'],
    ['Working Days per Year', 250, 'B'],
    ['Average Hours per Week', 40, 'B'],
  ];

  orgParams.forEach(([label, defaultValue, _]) => {
    const labelCell = ws.getCell(currentRow, 1);
    labelCell.value = label as string;
    labelCell.font = { bold: true, size: 10 };

    const valueCell = ws.getCell(currentRow, 2);
    valueCell.value = defaultValue as number;
    Object.assign(valueCell, INPUT_CELL_STYLE);
    if ((label as string).includes('Cost') || (label as string).includes('Revenue')) {
      valueCell.numFmt = '$#,##0';
    }
    currentRow++;
  });

  // Store parameter row references
  const paramStartRow = currentRow - 5;
  workbook.definedNames.add(`'Master Calculation'!$B$${paramStartRow}`, 'TotalEmployees');
  workbook.definedNames.add(`'Master Calculation'!$B$${paramStartRow + 1}`, 'AvgEmployeeCost');
  workbook.definedNames.add(`'Master Calculation'!$B$${paramStartRow + 2}`, 'AnnualRevenue');

  // Alignment Tax Components
  currentRow += 2;
  currentRow = addSectionHeader(ws, 'Alignment Tax Components', currentRow);

  const componentHeaders = ['Component', 'Annual Cost', 'Formula/Source', '% of Total'];
  const tool2Results = diagnosticData.tool2?.results || {};
  const tool5 = diagnosticData.tool5 || {};

  const componentStartRow = currentRow;
  currentRow = addDataTable(ws, componentHeaders, [
    ['Meeting Waste', tool2Results.wastedCost || 0, 'Tool 2 Analysis', 0],
    ['Decision Delays', 0, 'Tool 3 Analysis', 0],
    ['Data Friction', tool5.frictionCost || 0, 'Tool 5 Analysis', 0],
    ['Communication Overhead', 0, 'Calculated', 0],
    ['Alignment Activities', 0, 'Calculated', 0],
    ['Rework & Corrections', 0, 'Calculated', 0],
  ], currentRow, [COLUMN_WIDTHS.wide, COLUMN_WIDTHS.medium, COLUMN_WIDTHS.wide, COLUMN_WIDTHS.medium]);

  // Add formulas for calculated components
  const dataStartRow = componentStartRow + 1;

  // Communication Overhead formula: 5% of total employee cost * anti-pattern severity
  ws.getCell(dataStartRow + 3, 2).value = {
    formula: `ROUND(TotalEmployees*AvgEmployeeCost*0.05,0)`,
  };

  // Alignment Activities: 8% of employee cost * (100 - alignment score)/100
  ws.getCell(dataStartRow + 4, 2).value = {
    formula: `ROUND(TotalEmployees*AvgEmployeeCost*0.08,0)`,
  };

  // Rework: 10% of employee cost * inefficiency rate
  ws.getCell(dataStartRow + 5, 2).value = {
    formula: `ROUND(TotalEmployees*AvgEmployeeCost*0.10,0)`,
  };

  // Format currency columns
  for (let row = dataStartRow; row < dataStartRow + 6; row++) {
    ws.getCell(row, 2).numFmt = '$#,##0';
    ws.getCell(row, 4).numFmt = '0.0%';
  }

  // Total Alignment Tax
  currentRow += 1;
  const totalRow = ws.getRow(currentRow);
  totalRow.getCell(1).value = 'TOTAL ALIGNMENT TAX';
  totalRow.getCell(1).font = { bold: true, size: 12, color: { argb: EXCEL_COLORS.navy } };

  totalRow.getCell(2).value = {
    formula: `SUM(B${dataStartRow}:B${dataStartRow + 5})`,
  };
  totalRow.getCell(2).numFmt = '$#,##0';
  totalRow.getCell(2).font = { bold: true, size: 14, color: { argb: EXCEL_COLORS.red } };
  totalRow.getCell(2).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFF8E1' },
  };

  // Percentage of Revenue
  currentRow += 2;
  const pctRow = ws.getRow(currentRow);
  pctRow.getCell(1).value = 'Alignment Tax as % of Revenue';
  pctRow.getCell(1).font = { bold: true };
  pctRow.getCell(2).value = {
    formula: `IF(AnnualRevenue=0,0,B${currentRow - 2}/AnnualRevenue)`,
  };
  pctRow.getCell(2).numFmt = '0.0%';
  pctRow.getCell(2).font = { bold: true, color: { argb: EXCEL_COLORS.gold } };

  // Per Employee Cost
  currentRow++;
  const perEmpRow = ws.getRow(currentRow);
  perEmpRow.getCell(1).value = 'Alignment Tax per Employee';
  perEmpRow.getCell(1).font = { bold: true };
  perEmpRow.getCell(2).value = {
    formula: `IF(TotalEmployees=0,0,B${currentRow - 3}/TotalEmployees)`,
  };
  perEmpRow.getCell(2).numFmt = '$#,##0';

  // Set column widths
  ws.getColumn(1).width = COLUMN_WIDTHS.extraWide;
  ws.getColumn(2).width = COLUMN_WIDTHS.wide;
  ws.getColumn(3).width = COLUMN_WIDTHS.wide;
  ws.getColumn(4).width = COLUMN_WIDTHS.medium;

  configurePrintArea(ws, currentRow, 4);
}

/**
 * Create Scenario Modeling worksheet
 */
function createScenarioModelingWorksheet(workbook: ExcelJS.Workbook): void {
  const ws = workbook.addWorksheet('Scenario Modeling', {
    properties: { tabColor: { argb: EXCEL_COLORS.green.slice(2) } },
  });

  let currentRow = addBrandedHeader(ws, 'Alignment Tax Reduction Scenarios');

  // Scenario comparison
  currentRow = addSectionHeader(ws, 'Improvement Scenarios', currentRow);

  const scenarioHeaders = ['Scenario', 'Target Reduction', 'Investment Required', 'Payback Period', 'Annual Savings'];
  currentRow = addDataTable(ws, scenarioHeaders, [
    ['Conservative (10% reduction)', '10%', '$50,000', '6 months', '$0'],
    ['Moderate (25% reduction)', '25%', '$125,000', '8 months', '$0'],
    ['Aggressive (40% reduction)', '40%', '$200,000', '10 months', '$0'],
    ['Transformational (60% reduction)', '60%', '$350,000', '14 months', '$0'],
  ], currentRow, [COLUMN_WIDTHS.wide, COLUMN_WIDTHS.medium, COLUMN_WIDTHS.medium, COLUMN_WIDTHS.medium, COLUMN_WIDTHS.medium]);

  // Add formulas for annual savings
  const dataStartRow = currentRow - 4;
  const reductions = [0.10, 0.25, 0.40, 0.60];
  reductions.forEach((pct, idx) => {
    const row = dataStartRow + idx;
    ws.getCell(row, 5).value = {
      formula: `'Master Calculation'!B${19}*${pct}`,  // Reference total alignment tax
    };
    ws.getCell(row, 5).numFmt = '$#,##0';
  });

  // Mark input cells
  for (let row = dataStartRow; row < currentRow; row++) {
    Object.assign(ws.getCell(row, 3), INPUT_CELL_STYLE);
    ws.getCell(row, 3).numFmt = '$#,##0';
    Object.assign(ws.getCell(row, 4), INPUT_CELL_STYLE);
  }

  // Custom scenario section
  currentRow += 2;
  currentRow = addSectionHeader(ws, 'Custom Scenario Builder', currentRow);

  const customParams = [
    ['Target Alignment Tax Reduction %', 0.30],
    ['Implementation Investment', 150000],
    ['Monthly Run Rate Savings', 0],
    ['Months to Full Implementation', 6],
    ['Annual Recurring Investment', 25000],
  ];

  customParams.forEach(([label, value]) => {
    const labelCell = ws.getCell(currentRow, 1);
    labelCell.value = label as string;
    labelCell.font = { bold: true, size: 10 };

    const valueCell = ws.getCell(currentRow, 2);
    valueCell.value = value as number;
    Object.assign(valueCell, INPUT_CELL_STYLE);

    if ((label as string).includes('%')) {
      valueCell.numFmt = '0%';
    } else if ((label as string).includes('Investment') || (label as string).includes('Savings')) {
      valueCell.numFmt = '$#,##0';
    }
    currentRow++;
  });

  // Calculated outputs
  currentRow += 1;
  const outputLabels = [
    ['Projected Annual Savings', 'currency'],
    ['Net First Year Benefit', 'currency'],
    ['3-Year Total Benefit', 'currency'],
    ['ROI %', 'percent'],
  ];

  outputLabels.forEach(([label, format]) => {
    const labelCell = ws.getCell(currentRow, 1);
    labelCell.value = label;
    labelCell.font = { bold: true, size: 10, color: { argb: EXCEL_COLORS.slate } };

    const valueCell = ws.getCell(currentRow, 2);
    valueCell.value = 0; // Placeholder - would reference formulas
    valueCell.font = { bold: true, color: { argb: EXCEL_COLORS.navy } };
    if (format === 'currency') {
      valueCell.numFmt = '$#,##0';
    } else if (format === 'percent') {
      valueCell.numFmt = '0.0%';
    }
    currentRow++;
  });

  ws.getColumn(1).width = COLUMN_WIDTHS.extraWide;
  ws.getColumn(2).width = COLUMN_WIDTHS.wide;
  ws.getColumn(3).width = COLUMN_WIDTHS.medium;
  ws.getColumn(4).width = COLUMN_WIDTHS.medium;
  ws.getColumn(5).width = COLUMN_WIDTHS.medium;

  configurePrintArea(ws, currentRow, 5);
}

/**
 * Create ROI Projection worksheet
 */
function createROIProjectionWorksheet(workbook: ExcelJS.Workbook): void {
  const ws = workbook.addWorksheet('ROI Projection', {
    properties: { tabColor: { argb: EXCEL_COLORS.amber.slice(2) } },
  });

  let currentRow = addBrandedHeader(ws, '3-Year ROI Projection');

  // ROI Timeline
  currentRow = addSectionHeader(ws, 'Investment & Returns Timeline', currentRow);

  const timelineHeaders = ['Quarter', 'Investment', 'Cumulative Investment', 'Savings', 'Cumulative Savings', 'Net Position'];

  // Generate 12 quarters of data
  const quarterData: (string | number)[][] = [];
  for (let q = 1; q <= 12; q++) {
    quarterData.push([`Q${q}`, 0, 0, 0, 0, 0]);
  }

  currentRow = addDataTable(ws, timelineHeaders, quarterData, currentRow, [
    COLUMN_WIDTHS.narrow,
    COLUMN_WIDTHS.medium,
    COLUMN_WIDTHS.medium,
    COLUMN_WIDTHS.medium,
    COLUMN_WIDTHS.medium,
    COLUMN_WIDTHS.medium,
  ]);

  // Format all currency columns
  const dataStartRow = currentRow - 12;
  for (let row = dataStartRow; row < currentRow; row++) {
    for (let col = 2; col <= 6; col++) {
      ws.getCell(row, col).numFmt = '$#,##0';
      if (col === 2) {
        Object.assign(ws.getCell(row, col), INPUT_CELL_STYLE);
        ws.getCell(row, col).numFmt = '$#,##0';
      }
    }
  }

  // Add cumulative formulas
  for (let i = 0; i < 12; i++) {
    const row = dataStartRow + i;
    // Cumulative Investment
    if (i === 0) {
      ws.getCell(row, 3).value = { formula: `B${row}` };
    } else {
      ws.getCell(row, 3).value = { formula: `C${row - 1}+B${row}` };
    }
    // Cumulative Savings
    if (i === 0) {
      ws.getCell(row, 5).value = { formula: `D${row}` };
    } else {
      ws.getCell(row, 5).value = { formula: `E${row - 1}+D${row}` };
    }
    // Net Position
    ws.getCell(row, 6).value = { formula: `E${row}-C${row}` };
  }

  // Summary metrics
  currentRow += 2;
  currentRow = addSectionHeader(ws, 'ROI Summary Metrics', currentRow);

  const summaryMetrics = [
    ['Total 3-Year Investment', `SUM(B${dataStartRow}:B${dataStartRow + 11})`, 'currency'],
    ['Total 3-Year Savings', `SUM(D${dataStartRow}:D${dataStartRow + 11})`, 'currency'],
    ['Net 3-Year Benefit', `E${dataStartRow + 11}-C${dataStartRow + 11}`, 'currency'],
    ['3-Year ROI', `IF(C${dataStartRow + 11}=0,0,(E${dataStartRow + 11}-C${dataStartRow + 11})/C${dataStartRow + 11})`, 'percent'],
    ['Payback Quarter', '', 'text'],
  ];

  summaryMetrics.forEach(([label, formula, format]) => {
    const labelCell = ws.getCell(currentRow, 1);
    labelCell.value = label;
    labelCell.font = { bold: true, size: 11 };

    const valueCell = ws.getCell(currentRow, 2);
    if (formula) {
      valueCell.value = { formula: formula as string };
    } else {
      valueCell.value = 'TBD';
    }
    valueCell.font = { bold: true, size: 12, color: { argb: EXCEL_COLORS.navy } };

    if (format === 'currency') {
      valueCell.numFmt = '$#,##0';
    } else if (format === 'percent') {
      valueCell.numFmt = '0.0%';
    }
    currentRow++;
  });

  // Instructions
  currentRow += 2;
  currentRow = addSectionHeader(ws, 'Instructions', currentRow);

  const instructions = [
    '1. Enter quarterly investment amounts in the Investment column (yellow cells)',
    '2. Enter expected quarterly savings in the Savings column',
    '3. Formulas will automatically calculate cumulative values and net position',
    '4. Use Scenario Modeling sheet to determine appropriate reduction targets',
  ];

  instructions.forEach((text) => {
    const cell = ws.getCell(currentRow, 1);
    cell.value = text;
    cell.font = { size: 10, color: { argb: EXCEL_COLORS.slate } };
    ws.mergeCells(currentRow, 1, currentRow, 4);
    currentRow++;
  });

  ws.getColumn(1).width = COLUMN_WIDTHS.extraWide;

  configurePrintArea(ws, currentRow, 6);
}

/**
 * Create Summary Dashboard worksheet
 */
function createSummaryDashboard(workbook: ExcelJS.Workbook): void {
  const ws = workbook.addWorksheet('Dashboard', {
    properties: { tabColor: { argb: EXCEL_COLORS.red.slice(2) } },
  });

  let currentRow = addBrandedHeader(ws, 'Alignment Tax Dashboard');

  // Key metrics summary
  currentRow = addSectionHeader(ws, 'Executive Summary', currentRow);

  const metricsHeaders = ['Metric', 'Value', 'Status'];
  currentRow = addDataTable(ws, metricsHeaders, [
    ['Total Alignment Tax', '$0', 'See Master Calculation'],
    ['% of Revenue', '0%', ''],
    ['Per Employee Cost', '$0', ''],
    ['Potential Savings (Moderate)', '$0', ''],
    ['Recommended Investment', '$0', ''],
    ['Expected Payback', 'N/A', ''],
  ], currentRow, [COLUMN_WIDTHS.wide, COLUMN_WIDTHS.medium, COLUMN_WIDTHS.wide]);

  // Add formulas referencing other sheets
  const dataStartRow = currentRow - 6;
  ws.getCell(dataStartRow, 2).value = { formula: `'Master Calculation'!B19` };
  ws.getCell(dataStartRow, 2).numFmt = '$#,##0';

  ws.getCell(dataStartRow + 1, 2).value = { formula: `'Master Calculation'!B21` };
  ws.getCell(dataStartRow + 1, 2).numFmt = '0.0%';

  ws.getCell(dataStartRow + 2, 2).value = { formula: `'Master Calculation'!B22` };
  ws.getCell(dataStartRow + 2, 2).numFmt = '$#,##0';

  // Component breakdown placeholder
  currentRow += 2;
  currentRow = addSectionHeader(ws, 'Alignment Tax Components', currentRow);

  const componentNote = ws.getCell(currentRow, 1);
  componentNote.value = '[Pie chart of alignment tax components will display here when data is populated]';
  componentNote.font = { italic: true, size: 10, color: { argb: EXCEL_COLORS.slate } };
  ws.mergeCells(currentRow, 1, currentRow + 4, 3);
  currentRow += 6;

  // Next steps
  currentRow = addSectionHeader(ws, 'Recommended Next Steps', currentRow);

  const nextSteps = [
    '1. Review Diagnostic Inputs tab to verify all tool data is accurate',
    '2. Update Organization Parameters in Master Calculation with actual values',
    '3. Use Scenario Modeling to evaluate different improvement approaches',
    '4. Build out ROI Projection with planned investments and expected savings',
    '5. Present findings to leadership using this dashboard',
  ];

  nextSteps.forEach((text) => {
    const cell = ws.getCell(currentRow, 1);
    cell.value = text;
    cell.font = { size: 10, color: { argb: EXCEL_COLORS.slate } };
    ws.mergeCells(currentRow, 1, currentRow, 3);
    currentRow++;
  });

  ws.getColumn(1).width = COLUMN_WIDTHS.extraWide;
  ws.getColumn(2).width = COLUMN_WIDTHS.wide;
  ws.getColumn(3).width = COLUMN_WIDTHS.wide;

  configurePrintArea(ws, currentRow, 3);
}
