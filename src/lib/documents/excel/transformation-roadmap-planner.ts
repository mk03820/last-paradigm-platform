/**
 * Transformation Roadmap Planner Generator
 *
 * Generates an Excel spreadsheet for planning organizational transformation
 * with priority matrices, timeline visualization, resource allocation,
 * and milestone tracking.
 *
 * Story 18.3: Excel Document Templates & Generation
 * Task 4: Create Transformation Roadmap Planner generator
 * Covers: AC4, AC5, AC6, FR65 (Book attribution)
 */

import ExcelJS from 'exceljs';
import type { DiagnosticSessionData } from '@/lib/db/schema';
import {
  addBrandedHeader,
  addSectionHeader,
  addDataTable,
  addKeyValuePairs,
  configurePrintArea,
  getColumnLetter,
  addScoreConditionalFormatting,
} from './components';
import {
  EXCEL_COLORS,
  HEADER_STYLE,
  DATA_CELL_STYLE,
  INPUT_CELL_STYLE,
  COLUMN_WIDTHS,
  ROW_HEIGHTS,
} from './styles';
import type { GenerationResult } from '../word/types';

/**
 * Generate the Transformation Roadmap Planner spreadsheet
 */
export async function generateTransformationRoadmapPlanner(
  diagnosticData: DiagnosticSessionData
): Promise<GenerationResult> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'The Last Paradigm Platform';
  workbook.created = new Date();

  // Create worksheets
  createPriorityMatrixWorksheet(workbook, diagnosticData);
  createInitiativeTrackerWorksheet(workbook);
  createTimelineWorksheet(workbook);
  createResourceAllocationWorksheet(workbook);
  createMilestoneTrackerWorksheet(workbook);
  createRiskRegisterWorksheet(workbook);

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer: Buffer.from(buffer),
    fileSizeBytes: buffer.byteLength,
  };
}

/**
 * Create Priority Matrix worksheet based on diagnostic findings
 */
function createPriorityMatrixWorksheet(
  workbook: ExcelJS.Workbook,
  diagnosticData: DiagnosticSessionData
): void {
  const ws = workbook.addWorksheet('Priority Matrix', {
    properties: { tabColor: { argb: EXCEL_COLORS.navy.slice(2) } },
  });

  let currentRow = addBrandedHeader(ws, 'Transformation Priority Matrix');

  // Priority matrix explanation
  currentRow = addSectionHeader(ws, 'Initiative Prioritization Framework', currentRow);

  const introCell = ws.getCell(currentRow, 1);
  introCell.value = 'Prioritize initiatives based on Impact (alignment tax reduction) vs Effort (implementation difficulty)';
  introCell.font = { size: 10, italic: true, color: { argb: EXCEL_COLORS.slate } };
  ws.mergeCells(currentRow, 1, currentRow, 5);
  currentRow += 2;

  // Priority categories
  const priorityHeaders = ['Priority', 'Impact', 'Effort', 'Timeline', 'Description'];
  currentRow = addDataTable(ws, priorityHeaders, [
    ['Quick Wins', 'High', 'Low', '0-30 days', 'Immediate action items with fast ROI'],
    ['Strategic Investments', 'High', 'High', '60-180 days', 'Major initiatives requiring significant resources'],
    ['Fill-Ins', 'Low', 'Low', 'Ongoing', 'Low-effort improvements when capacity allows'],
    ['Reconsider', 'Low', 'High', 'Defer', 'High effort for low return - reconsider necessity'],
  ], currentRow, [COLUMN_WIDTHS.medium, COLUMN_WIDTHS.narrow, COLUMN_WIDTHS.narrow, COLUMN_WIDTHS.medium, COLUMN_WIDTHS.extraWide]);

  // Suggested initiatives based on diagnostics
  currentRow += 2;
  currentRow = addSectionHeader(ws, 'Suggested Initiatives (from Diagnostic)', currentRow);

  // Generate initiative suggestions based on tool findings
  const initiatives = generateInitiativeSuggestions(diagnosticData);

  const initiativeHeaders = ['Initiative', 'Source Tool', 'Impact Score', 'Effort Estimate', 'Priority'];
  currentRow = addDataTable(ws, initiativeHeaders, initiatives, currentRow, [
    COLUMN_WIDTHS.extraWide,
    COLUMN_WIDTHS.medium,
    COLUMN_WIDTHS.narrow,
    COLUMN_WIDTHS.narrow,
    COLUMN_WIDTHS.medium,
  ]);

  // Add conditional formatting to Impact Score column
  const dataStartRow = currentRow - initiatives.length;
  addScoreConditionalFormatting(ws, dataStartRow, currentRow - 1, 3);

  // Impact vs Effort matrix visual placeholder
  currentRow += 2;
  currentRow = addSectionHeader(ws, 'Impact vs Effort Matrix', currentRow);

  const matrixNote = ws.getCell(currentRow, 1);
  matrixNote.value = '[2x2 Priority Matrix Chart - Plot initiatives by Impact (Y-axis) vs Effort (X-axis)]';
  matrixNote.font = { italic: true, size: 10, color: { argb: EXCEL_COLORS.slate } };
  ws.mergeCells(currentRow, 1, currentRow + 6, 5);

  currentRow += 8;

  ws.getColumn(1).width = COLUMN_WIDTHS.extraWide;

  configurePrintArea(ws, currentRow, 5);
}

/**
 * Generate initiative suggestions based on diagnostic data
 */
function generateInitiativeSuggestions(
  diagnosticData: DiagnosticSessionData
): (string | number)[][] {
  const initiatives: (string | number)[][] = [];

  // Tool 2: Meeting efficiency
  const tool2Results = diagnosticData.tool2?.results || {};
  // If wasted hours exceed a threshold, suggest meeting improvements
  if ((tool2Results.wastedHours || 0) > 100) {
    initiatives.push([
      'Implement Meeting Effectiveness Protocol',
      'Tool 2',
      85,
      'Medium',
      'Quick Win',
    ]);
  }
  if ((tool2Results.wastedHours || 0) > 500) {
    initiatives.push([
      'Recurring Meeting Audit & Reduction',
      'Tool 2',
      90,
      'Low',
      'Quick Win',
    ]);
  }

  // Tool 3: Decision velocity
  const tool3 = diagnosticData.tool3 || {};
  const tool3Metrics = (tool3.metrics || {}) as Record<string, number>;
  const decisions = (tool3.decisions || []) as unknown[];
  if (decisions.length > 3) {
    initiatives.push([
      'Decision Authority Clarification (RAPID)',
      'Tool 3',
      80,
      'Medium',
      'Strategic',
    ]);
  }
  if ((tool3Metrics.overallMedian || 0) > 14) {
    initiatives.push([
      'Escalation Path Redesign',
      'Tool 3',
      75,
      'High',
      'Strategic',
    ]);
  }

  // Tool 4: Stakeholder alignment
  const tool4 = diagnosticData.tool4 || {};
  const stakeholders = (tool4.stakeholders || []) as unknown[];
  if (stakeholders.length > 5) {
    initiatives.push([
      'Stakeholder Engagement Campaign',
      'Tool 4',
      70,
      'Medium',
      'Strategic',
    ]);
  }

  // Tool 5: Data flow
  const tool5 = diagnosticData.tool5 || {};
  const journeys = (tool5.journeys || []) as unknown[];
  if (journeys.length > 2) {
    initiatives.push([
      'Process Automation Initiative',
      'Tool 5',
      85,
      'High',
      'Strategic',
    ]);
  }
  if ((tool5.frictionCost || 0) > 10000) {
    initiatives.push([
      'System Integration Project',
      'Tool 5',
      80,
      'High',
      'Strategic',
    ]);
  }

  // Tool 6: Communication
  const tool6 = diagnosticData.tool6 || {};
  const antiPatterns = (tool6.antiPatterns || []) as unknown[];
  if (antiPatterns.length > 2) {
    initiatives.push([
      'Communication Guidelines & Training',
      'Tool 6',
      65,
      'Low',
      'Quick Win',
    ]);
  }
  if (antiPatterns.length > 0) {
    initiatives.push([
      'Work-Life Boundary Initiative',
      'Tool 6',
      60,
      'Low',
      'Fill-In',
    ]);
  }

  // Tool 7: Total cost analysis
  const tool7 = diagnosticData.tool7 || {};
  if ((tool7.alignmentTaxPercent || 0) > 10) {
    initiatives.push([
      'Change Management Training Program',
      'Tool 7',
      70,
      'Medium',
      'Strategic',
    ]);
  }

  // Add default initiatives if none generated
  if (initiatives.length === 0) {
    initiatives.push(
      ['Communication Optimization', 'General', 70, 'Low', 'Quick Win'],
      ['Meeting Efficiency Improvement', 'General', 75, 'Low', 'Quick Win'],
      ['Decision Process Clarity', 'General', 80, 'Medium', 'Strategic'],
      ['Cross-functional Alignment', 'General', 65, 'Medium', 'Fill-In']
    );
  }

  return initiatives;
}

/**
 * Create Initiative Tracker worksheet
 */
function createInitiativeTrackerWorksheet(workbook: ExcelJS.Workbook): void {
  const ws = workbook.addWorksheet('Initiative Tracker', {
    properties: { tabColor: { argb: EXCEL_COLORS.gold.slice(2) } },
  });

  let currentRow = addBrandedHeader(ws, 'Initiative Tracking');

  currentRow = addSectionHeader(ws, 'Active Initiatives', currentRow);

  const headers = [
    'ID',
    'Initiative Name',
    'Owner',
    'Priority',
    'Status',
    'Start Date',
    'Target End',
    'Actual End',
    '% Complete',
    'Notes',
  ];

  // Add header row
  const headerRow = ws.getRow(currentRow);
  headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header;
    Object.assign(cell, HEADER_STYLE);
  });
  currentRow++;

  // Add 15 empty rows for initiatives
  for (let i = 1; i <= 15; i++) {
    const row = ws.getRow(currentRow);

    // ID
    row.getCell(1).value = `INI-${String(i).padStart(3, '0')}`;
    row.getCell(1).font = { size: 10, color: { argb: EXCEL_COLORS.slate } };

    // Initiative Name
    Object.assign(row.getCell(2), INPUT_CELL_STYLE);
    row.getCell(2).alignment = { horizontal: 'left' };

    // Owner
    Object.assign(row.getCell(3), INPUT_CELL_STYLE);
    row.getCell(3).alignment = { horizontal: 'left' };

    // Priority (dropdown would be ideal)
    Object.assign(row.getCell(4), INPUT_CELL_STYLE);
    row.getCell(4).alignment = { horizontal: 'center' };

    // Status
    Object.assign(row.getCell(5), INPUT_CELL_STYLE);
    row.getCell(5).alignment = { horizontal: 'center' };

    // Start Date
    Object.assign(row.getCell(6), INPUT_CELL_STYLE);
    row.getCell(6).numFmt = 'mm/dd/yyyy';

    // Target End
    Object.assign(row.getCell(7), INPUT_CELL_STYLE);
    row.getCell(7).numFmt = 'mm/dd/yyyy';

    // Actual End
    Object.assign(row.getCell(8), INPUT_CELL_STYLE);
    row.getCell(8).numFmt = 'mm/dd/yyyy';

    // % Complete
    Object.assign(row.getCell(9), INPUT_CELL_STYLE);
    row.getCell(9).numFmt = '0%';

    // Notes
    Object.assign(row.getCell(10), INPUT_CELL_STYLE);
    row.getCell(10).alignment = { horizontal: 'left', wrapText: true };

    currentRow++;
  }

  // Set column widths
  const widths = [10, 35, 15, 12, 12, 12, 12, 12, 10, 30];
  widths.forEach((width, index) => {
    ws.getColumn(index + 1).width = width;
  });

  // Status legend
  currentRow += 2;
  currentRow = addSectionHeader(ws, 'Status Legend', currentRow);

  const statuses = [
    ['Not Started', 'Initiative identified but not yet begun'],
    ['In Planning', 'Defining scope, resources, and timeline'],
    ['In Progress', 'Active implementation underway'],
    ['On Hold', 'Temporarily paused'],
    ['At Risk', 'Behind schedule or facing blockers'],
    ['Completed', 'Successfully delivered'],
    ['Cancelled', 'No longer being pursued'],
  ];

  statuses.forEach(([status, description]) => {
    const statusCell = ws.getCell(currentRow, 1);
    statusCell.value = status;
    statusCell.font = { bold: true, size: 10 };

    const descCell = ws.getCell(currentRow, 2);
    descCell.value = description;
    descCell.font = { size: 10, color: { argb: EXCEL_COLORS.slate } };
    ws.mergeCells(currentRow, 2, currentRow, 4);

    currentRow++;
  });

  configurePrintArea(ws, currentRow, 10);
}

/**
 * Create Timeline worksheet with Gantt-style view
 */
function createTimelineWorksheet(workbook: ExcelJS.Workbook): void {
  const ws = workbook.addWorksheet('Timeline', {
    properties: { tabColor: { argb: EXCEL_COLORS.green.slice(2) } },
  });

  let currentRow = addBrandedHeader(ws, 'Transformation Timeline');

  currentRow = addSectionHeader(ws, '12-Month Roadmap', currentRow);

  // Month headers
  const months = ['Initiative', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'];
  const headerRow = ws.getRow(currentRow);
  months.forEach((month, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = month;
    Object.assign(cell, HEADER_STYLE);
    if (index > 0) {
      ws.getColumn(index + 1).width = 6;
    }
  });
  ws.getColumn(1).width = COLUMN_WIDTHS.extraWide;
  currentRow++;

  // Sample initiative rows with phase indicators
  const sampleInitiatives = [
    { name: 'Phase 1: Quick Wins', months: [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { name: '  Meeting Effectiveness', months: [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { name: '  Recurring Meeting Audit', months: [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { name: '', months: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { name: 'Phase 2: Strategic Initiatives', months: [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0] },
    { name: '  Decision Authority (RAPID)', months: [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0] },
    { name: '  Stakeholder Engagement', months: [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0] },
    { name: '  Process Automation', months: [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0] },
    { name: '', months: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { name: 'Phase 3: Optimization', months: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1] },
    { name: '  System Integration', months: [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0] },
    { name: '  Training Program', months: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1] },
  ];

  sampleInitiatives.forEach((init) => {
    const row = ws.getRow(currentRow);

    row.getCell(1).value = init.name;
    if (init.name.startsWith('Phase')) {
      row.getCell(1).font = { bold: true, size: 11, color: { argb: EXCEL_COLORS.navy } };
    } else if (init.name.startsWith('  ')) {
      row.getCell(1).font = { size: 10, color: { argb: EXCEL_COLORS.slate } };
    }

    init.months.forEach((active, idx) => {
      const cell = row.getCell(idx + 2);
      if (active) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: init.name.startsWith('Phase') ? EXCEL_COLORS.navy : EXCEL_COLORS.gold },
        };
      }
      cell.border = {
        top: { style: 'thin', color: { argb: EXCEL_COLORS.mediumGray } },
        bottom: { style: 'thin', color: { argb: EXCEL_COLORS.mediumGray } },
        left: { style: 'thin', color: { argb: EXCEL_COLORS.mediumGray } },
        right: { style: 'thin', color: { argb: EXCEL_COLORS.mediumGray } },
      };
    });

    currentRow++;
  });

  // Legend
  currentRow += 2;
  currentRow = addSectionHeader(ws, 'Legend', currentRow);

  const navyCell = ws.getCell(currentRow, 1);
  navyCell.value = '  ';
  navyCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL_COLORS.navy } };
  ws.getCell(currentRow, 2).value = 'Phase Duration';
  currentRow++;

  const goldCell = ws.getCell(currentRow, 1);
  goldCell.value = '  ';
  goldCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: EXCEL_COLORS.gold } };
  ws.getCell(currentRow, 2).value = 'Initiative Duration';
  currentRow++;

  // Instructions
  currentRow += 1;
  const instructionCell = ws.getCell(currentRow, 1);
  instructionCell.value = 'Note: Color cells to indicate planned duration for each initiative';
  instructionCell.font = { italic: true, size: 10, color: { argb: EXCEL_COLORS.slate } };
  ws.mergeCells(currentRow, 1, currentRow, 6);

  configurePrintArea(ws, currentRow, 13);
}

/**
 * Create Resource Allocation worksheet
 */
function createResourceAllocationWorksheet(workbook: ExcelJS.Workbook): void {
  const ws = workbook.addWorksheet('Resource Allocation', {
    properties: { tabColor: { argb: EXCEL_COLORS.amber.slice(2) } },
  });

  let currentRow = addBrandedHeader(ws, 'Resource Allocation Plan');

  // Team allocation table
  currentRow = addSectionHeader(ws, 'Team Resource Allocation', currentRow);

  const teamHeaders = ['Role/Team', 'FTE Allocation', 'Initiative Assignment', 'Start Date', 'End Date', 'Notes'];
  currentRow = addDataTable(ws, teamHeaders, [], currentRow, [
    COLUMN_WIDTHS.wide,
    COLUMN_WIDTHS.narrow,
    COLUMN_WIDTHS.wide,
    COLUMN_WIDTHS.medium,
    COLUMN_WIDTHS.medium,
    COLUMN_WIDTHS.wide,
  ]);

  // Add 10 input rows
  for (let i = 0; i < 10; i++) {
    const row = ws.getRow(currentRow);
    for (let col = 1; col <= 6; col++) {
      Object.assign(row.getCell(col), INPUT_CELL_STYLE);
      if (col === 4 || col === 5) {
        row.getCell(col).numFmt = 'mm/dd/yyyy';
      }
      if (col === 2) {
        row.getCell(col).numFmt = '0.0';
        row.getCell(col).alignment = { horizontal: 'center' };
      }
    }
    currentRow++;
  }

  // Budget allocation
  currentRow += 2;
  currentRow = addSectionHeader(ws, 'Budget Allocation', currentRow);

  const budgetHeaders = ['Category', 'Allocated', 'Spent', 'Remaining', '% Used'];
  currentRow = addDataTable(ws, budgetHeaders, [
    ['Personnel (Internal)', 0, 0, 0, 0],
    ['Consulting/External', 0, 0, 0, 0],
    ['Technology/Tools', 0, 0, 0, 0],
    ['Training', 0, 0, 0, 0],
    ['Change Management', 0, 0, 0, 0],
    ['Contingency', 0, 0, 0, 0],
  ], currentRow, [COLUMN_WIDTHS.wide, COLUMN_WIDTHS.medium, COLUMN_WIDTHS.medium, COLUMN_WIDTHS.medium, COLUMN_WIDTHS.narrow]);

  // Add formulas and formatting
  const budgetStartRow = currentRow - 6;
  for (let row = budgetStartRow; row < currentRow; row++) {
    // Mark Allocated and Spent as input cells
    Object.assign(ws.getCell(row, 2), INPUT_CELL_STYLE);
    ws.getCell(row, 2).numFmt = '$#,##0';
    Object.assign(ws.getCell(row, 3), INPUT_CELL_STYLE);
    ws.getCell(row, 3).numFmt = '$#,##0';

    // Remaining formula
    ws.getCell(row, 4).value = { formula: `B${row}-C${row}` };
    ws.getCell(row, 4).numFmt = '$#,##0';

    // % Used formula
    ws.getCell(row, 5).value = { formula: `IF(B${row}=0,0,C${row}/B${row})` };
    ws.getCell(row, 5).numFmt = '0%';
  }

  // Budget total row
  const totalRow = ws.getRow(currentRow);
  totalRow.getCell(1).value = 'TOTAL';
  totalRow.getCell(1).font = { bold: true };
  for (let col = 2; col <= 4; col++) {
    totalRow.getCell(col).value = { formula: `SUM(${getColumnLetter(col)}${budgetStartRow}:${getColumnLetter(col)}${currentRow - 1})` };
    totalRow.getCell(col).numFmt = '$#,##0';
    totalRow.getCell(col).font = { bold: true };
  }
  totalRow.getCell(5).value = { formula: `IF(B${currentRow}=0,0,C${currentRow}/B${currentRow})` };
  totalRow.getCell(5).numFmt = '0%';
  totalRow.getCell(5).font = { bold: true };

  configurePrintArea(ws, currentRow, 6);
}

/**
 * Create Milestone Tracker worksheet
 */
function createMilestoneTrackerWorksheet(workbook: ExcelJS.Workbook): void {
  const ws = workbook.addWorksheet('Milestones', {
    properties: { tabColor: { argb: EXCEL_COLORS.green.slice(2) } },
  });

  let currentRow = addBrandedHeader(ws, 'Milestone Tracker');

  currentRow = addSectionHeader(ws, 'Key Milestones', currentRow);

  const milestoneHeaders = ['Milestone', 'Initiative', 'Target Date', 'Actual Date', 'Status', 'Owner', 'Dependencies'];

  const headerRow = ws.getRow(currentRow);
  milestoneHeaders.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header;
    Object.assign(cell, HEADER_STYLE);
  });
  currentRow++;

  // Pre-populated milestones
  const milestones = [
    ['Kickoff Meeting Complete', 'All', '', '', 'Not Started', '', ''],
    ['Quick Wins Identified', 'Phase 1', '', '', 'Not Started', '', 'Kickoff'],
    ['Meeting Protocol Launched', 'Meeting Effectiveness', '', '', 'Not Started', '', ''],
    ['RAPID Framework Defined', 'Decision Authority', '', '', 'Not Started', '', ''],
    ['Stakeholder Map Complete', 'Stakeholder Engagement', '', '', 'Not Started', '', ''],
    ['Automation POC Complete', 'Process Automation', '', '', 'Not Started', '', ''],
    ['Phase 1 Review', 'All', '', '', 'Not Started', '', 'Quick Wins'],
    ['Training Materials Ready', 'Training Program', '', '', 'Not Started', '', ''],
    ['Integration Phase 1 Go-Live', 'System Integration', '', '', 'Not Started', '', 'Automation POC'],
    ['Phase 2 Review', 'All', '', '', 'Not Started', '', 'Phase 1'],
    ['Full Rollout Complete', 'All', '', '', 'Not Started', '', 'Phase 2'],
    ['90-Day Assessment', 'All', '', '', 'Not Started', '', 'Full Rollout'],
  ];

  milestones.forEach((milestone) => {
    const row = ws.getRow(currentRow);
    milestone.forEach((value, index) => {
      const cell = row.getCell(index + 1);
      cell.value = value;
      Object.assign(cell, DATA_CELL_STYLE);

      // Make date columns editable
      if (index === 2 || index === 3) {
        Object.assign(cell, INPUT_CELL_STYLE);
        cell.numFmt = 'mm/dd/yyyy';
      }
      // Make status editable
      if (index === 4 || index === 5) {
        Object.assign(cell, INPUT_CELL_STYLE);
        cell.alignment = { horizontal: 'center' };
      }
    });
    currentRow++;
  });

  // Set column widths
  const widths = [30, 20, 12, 12, 12, 15, 25];
  widths.forEach((width, index) => {
    ws.getColumn(index + 1).width = width;
  });

  configurePrintArea(ws, currentRow, 7);
}

/**
 * Create Risk Register worksheet
 */
function createRiskRegisterWorksheet(workbook: ExcelJS.Workbook): void {
  const ws = workbook.addWorksheet('Risk Register', {
    properties: { tabColor: { argb: EXCEL_COLORS.red.slice(2) } },
  });

  let currentRow = addBrandedHeader(ws, 'Transformation Risk Register');

  currentRow = addSectionHeader(ws, 'Identified Risks', currentRow);

  const riskHeaders = ['ID', 'Risk Description', 'Category', 'Likelihood', 'Impact', 'Score', 'Mitigation', 'Owner', 'Status'];

  const headerRow = ws.getRow(currentRow);
  riskHeaders.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header;
    Object.assign(cell, HEADER_STYLE);
  });
  currentRow++;

  // Common transformation risks
  const risks = [
    ['R001', 'Stakeholder resistance to change', 'People', 3, 4, 12, 'Early engagement, communication plan', '', 'Open'],
    ['R002', 'Resource constraints', 'Resources', 3, 3, 9, 'Prioritization, phased approach', '', 'Open'],
    ['R003', 'Technology integration challenges', 'Technical', 2, 4, 8, 'POC, vendor support', '', 'Open'],
    ['R004', 'Competing priorities', 'Organizational', 4, 3, 12, 'Executive sponsorship, clear prioritization', '', 'Open'],
    ['R005', 'Scope creep', 'Project', 3, 3, 9, 'Change control process', '', 'Open'],
    ['R006', 'Loss of key personnel', 'People', 2, 4, 8, 'Documentation, cross-training', '', 'Open'],
    ['R007', 'Budget overrun', 'Financial', 2, 3, 6, 'Regular monitoring, contingency', '', 'Open'],
    ['R008', 'Timeline slippage', 'Project', 3, 3, 9, 'Buffer time, agile approach', '', 'Open'],
  ];

  risks.forEach((risk) => {
    const row = ws.getRow(currentRow);
    risk.forEach((value, index) => {
      const cell = row.getCell(index + 1);
      cell.value = value;
      Object.assign(cell, DATA_CELL_STYLE);

      // Likelihood and Impact are editable
      if (index === 3 || index === 4) {
        Object.assign(cell, INPUT_CELL_STYLE);
        cell.alignment = { horizontal: 'center' };
      }
    });

    // Score formula
    row.getCell(6).value = { formula: `D${currentRow}*E${currentRow}` };
    row.getCell(6).alignment = { horizontal: 'center' };

    // Color code score
    const score = (risk[3] as number) * (risk[4] as number);
    if (score >= 12) {
      row.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCDD2' } };
    } else if (score >= 6) {
      row.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9C4' } };
    } else {
      row.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC8E6C9' } };
    }

    currentRow++;
  });

  // Add empty rows for additional risks
  for (let i = 0; i < 5; i++) {
    const row = ws.getRow(currentRow);
    row.getCell(1).value = `R${String(risks.length + i + 1).padStart(3, '0')}`;
    for (let col = 2; col <= 9; col++) {
      Object.assign(row.getCell(col), INPUT_CELL_STYLE);
      if (col === 3 || col === 4 || col === 8) {
        row.getCell(col).alignment = { horizontal: 'center' };
      }
    }
    // Score formula
    row.getCell(6).value = { formula: `IF(OR(D${currentRow}="",E${currentRow}=""),"",D${currentRow}*E${currentRow})` };
    currentRow++;
  }

  // Set column widths
  const widths = [8, 35, 15, 10, 10, 8, 35, 15, 10];
  widths.forEach((width, index) => {
    ws.getColumn(index + 1).width = width;
  });

  // Risk matrix legend
  currentRow += 2;
  currentRow = addSectionHeader(ws, 'Risk Scoring Guide', currentRow);

  const guide = [
    ['Likelihood: 1=Rare, 2=Unlikely, 3=Possible, 4=Likely, 5=Almost Certain'],
    ['Impact: 1=Negligible, 2=Minor, 3=Moderate, 4=Major, 5=Severe'],
    ['Score: High (12+)=Red, Medium (6-11)=Yellow, Low (1-5)=Green'],
  ];

  guide.forEach(([text]) => {
    const cell = ws.getCell(currentRow, 1);
    cell.value = text;
    cell.font = { size: 10, color: { argb: EXCEL_COLORS.slate } };
    ws.mergeCells(currentRow, 1, currentRow, 6);
    currentRow++;
  });

  configurePrintArea(ws, currentRow, 9);
}
