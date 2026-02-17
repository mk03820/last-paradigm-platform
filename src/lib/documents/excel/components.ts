/**
 * Shared Excel Components
 *
 * Reusable components for building consistent Excel documents.
 *
 * Story 18.3: Excel Document Templates & Generation
 * Task 1.4: Create reusable worksheet components
 */

import ExcelJS from 'exceljs';
import {
  EXCEL_COLORS,
  ATTRIBUTION_TEXT,
  HEADER_STYLE,
  DATA_CELL_STYLE,
  ALT_ROW_STYLE,
  TITLE_STYLE,
  SECTION_HEADER_STYLE,
  ATTRIBUTION_STYLE,
  CURRENCY_STYLE,
  PERCENT_STYLE,
  COLUMN_WIDTHS,
  ROW_HEIGHTS,
} from './styles';

/**
 * Add branded header row to worksheet
 */
export function addBrandedHeader(
  worksheet: ExcelJS.Worksheet,
  title: string,
  startRow: number = 1
): number {
  // Title row
  const titleCell = worksheet.getCell(startRow, 1);
  titleCell.value = title;
  Object.assign(titleCell, TITLE_STYLE);
  worksheet.getRow(startRow).height = ROW_HEIGHTS.title;

  // Attribution row
  const attrRow = startRow + 1;
  const attrCell = worksheet.getCell(attrRow, 1);
  attrCell.value = ATTRIBUTION_TEXT;
  Object.assign(attrCell, ATTRIBUTION_STYLE);

  // Merge cells for header area
  worksheet.mergeCells(startRow, 1, startRow, 6);
  worksheet.mergeCells(attrRow, 1, attrRow, 6);

  // Add spacer row
  worksheet.getRow(attrRow + 1).height = ROW_HEIGHTS.spacer;

  return attrRow + 2; // Return next available row
}

/**
 * Add section header to worksheet
 */
export function addSectionHeader(
  worksheet: ExcelJS.Worksheet,
  title: string,
  row: number
): number {
  const cell = worksheet.getCell(row, 1);
  cell.value = title;
  Object.assign(cell, SECTION_HEADER_STYLE);
  worksheet.mergeCells(row, 1, row, 4);
  return row + 1;
}

/**
 * Add data table to worksheet
 */
export function addDataTable(
  worksheet: ExcelJS.Worksheet,
  headers: string[],
  data: (string | number | null)[][],
  startRow: number,
  columnWidths?: number[]
): number {
  // Set column widths
  headers.forEach((_, index) => {
    const col = worksheet.getColumn(index + 1);
    col.width = columnWidths?.[index] || COLUMN_WIDTHS.medium;
  });

  // Header row
  const headerRow = worksheet.getRow(startRow);
  headerRow.height = ROW_HEIGHTS.header;
  headers.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header;
    Object.assign(cell, HEADER_STYLE);
  });

  // Data rows
  let currentRow = startRow + 1;
  data.forEach((rowData, rowIndex) => {
    const row = worksheet.getRow(currentRow);
    row.height = ROW_HEIGHTS.data;
    rowData.forEach((value, colIndex) => {
      const cell = row.getCell(colIndex + 1);
      cell.value = value;
      // Apply alternating row style
      const style = rowIndex % 2 === 0 ? DATA_CELL_STYLE : ALT_ROW_STYLE;
      Object.assign(cell, style);
    });
    currentRow++;
  });

  return currentRow;
}

/**
 * Add key-value pairs to worksheet
 */
export function addKeyValuePairs(
  worksheet: ExcelJS.Worksheet,
  pairs: Array<{ label: string; value: string | number; format?: 'currency' | 'percent' | 'number' }>,
  startRow: number,
  labelCol: number = 1,
  valueCol: number = 2
): number {
  let currentRow = startRow;

  pairs.forEach((pair) => {
    const labelCell = worksheet.getCell(currentRow, labelCol);
    labelCell.value = pair.label;
    labelCell.font = { bold: true, size: 10, color: { argb: EXCEL_COLORS.slate } };

    const valueCell = worksheet.getCell(currentRow, valueCol);
    valueCell.value = pair.value;

    // Apply format-specific styling
    if (pair.format === 'currency') {
      Object.assign(valueCell, CURRENCY_STYLE);
    } else if (pair.format === 'percent') {
      Object.assign(valueCell, PERCENT_STYLE);
    } else {
      valueCell.font = { size: 10, color: { argb: EXCEL_COLORS.navy } };
      valueCell.alignment = { horizontal: 'left' };
    }

    currentRow++;
  });

  return currentRow;
}

/**
 * Add formula cell with styling
 */
export function addFormulaCell(
  worksheet: ExcelJS.Worksheet,
  row: number,
  col: number,
  formula: string,
  format?: 'currency' | 'percent' | 'number'
): void {
  const cell = worksheet.getCell(row, col);
  cell.value = { formula };

  if (format === 'currency') {
    cell.numFmt = '$#,##0';
  } else if (format === 'percent') {
    cell.numFmt = '0.0%';
  } else if (format === 'number') {
    cell.numFmt = '#,##0';
  }

  cell.font = { size: 10, color: { argb: EXCEL_COLORS.navy } };
  cell.alignment = { horizontal: 'right' };
}

/**
 * Add chart to worksheet (placeholder - exceljs has limited chart support)
 * Note: ExcelJS chart support is limited; consider adding via template
 */
export function addChartPlaceholder(
  worksheet: ExcelJS.Worksheet,
  title: string,
  startRow: number,
  endRow: number,
  startCol: number = 1,
  endCol: number = 6
): void {
  // Add chart title
  const titleCell = worksheet.getCell(startRow, startCol);
  titleCell.value = `[Chart: ${title}]`;
  titleCell.font = { italic: true, size: 10, color: { argb: EXCEL_COLORS.slate } };

  // Note: ExcelJS has limited native charting capabilities
  // For production, consider using a template-based approach
  worksheet.mergeCells(startRow, startCol, endRow, endCol);
}

/**
 * Configure print settings for worksheet
 */
export function configurePrintArea(
  worksheet: ExcelJS.Worksheet,
  lastRow: number,
  lastCol: number
): void {
  worksheet.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    printArea: `A1:${getColumnLetter(lastCol)}${lastRow}`,
    margins: {
      left: 0.7,
      right: 0.7,
      top: 0.75,
      bottom: 0.75,
      header: 0.3,
      footer: 0.3,
    },
  };

  // Add print header/footer
  worksheet.headerFooter = {
    oddHeader: `&L&"Calibri,Bold"${worksheet.name}&R&D`,
    oddFooter: `&C${ATTRIBUTION_TEXT}&RPage &P of &N`,
  };
}

/**
 * Create named range
 */
export function createNamedRange(
  workbook: ExcelJS.Workbook,
  name: string,
  worksheetName: string,
  startRow: number,
  startCol: number,
  endRow?: number,
  endCol?: number
): void {
  const range = endRow && endCol
    ? `'${worksheetName}'!$${getColumnLetter(startCol)}$${startRow}:$${getColumnLetter(endCol)}$${endRow}`
    : `'${worksheetName}'!$${getColumnLetter(startCol)}$${startRow}`;

  // Note: ExcelJS doesn't have direct named range support
  // This would need to be handled differently or use definedNames
  workbook.definedNames.add(range, name);
}

/**
 * Add conditional formatting for score cells
 */
export function addScoreConditionalFormatting(
  worksheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number,
  col: number
): void {
  const colLetter = getColumnLetter(col);

  // Type assertion needed for ExcelJS conditional formatting operators
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rules: any[] = [
    {
      type: 'cellIs',
      operator: 'greaterThanOrEqual',
      formulae: ['80'],
      style: {
        fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FF90EE90' } },
      },
      priority: 1,
    },
    {
      type: 'cellIs',
      operator: 'between',
      formulae: ['60', '79'],
      style: {
        fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFF59D' } },
      },
      priority: 2,
    },
    {
      type: 'cellIs',
      operator: 'lessThan',
      formulae: ['60'],
      style: {
        fill: { type: 'pattern', pattern: 'solid', bgColor: { argb: 'FFFFCDD2' } },
      },
      priority: 3,
    },
  ];

  worksheet.addConditionalFormatting({
    ref: `${colLetter}${startRow}:${colLetter}${endRow}`,
    rules,
  });
}

/**
 * Helper to get Excel column letter from number
 */
export function getColumnLetter(col: number): string {
  let letter = '';
  while (col > 0) {
    const remainder = (col - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    col = Math.floor((col - 1) / 26);
  }
  return letter;
}

/**
 * Format currency value
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage value
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
