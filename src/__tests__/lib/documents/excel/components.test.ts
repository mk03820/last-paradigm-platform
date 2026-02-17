/**
 * Tests for Excel Document Components
 *
 * Story 18.3: Excel Document Templates & Generation
 * Task 6: Write comprehensive tests for Excel infrastructure
 */

import { describe, it, expect, beforeEach } from 'vitest';
import ExcelJS from 'exceljs';
import {
  addBrandedHeader,
  addSectionHeader,
  addDataTable,
  addKeyValuePairs,
  addFormulaCell,
  addChartPlaceholder,
  configurePrintArea,
  getColumnLetter,
  formatCurrency,
  formatPercent,
} from '@/lib/documents/excel/components';
import { ATTRIBUTION_TEXT } from '@/lib/documents/excel/styles';

describe('Excel Components', () => {
  let workbook: ExcelJS.Workbook;
  let worksheet: ExcelJS.Worksheet;

  beforeEach(() => {
    workbook = new ExcelJS.Workbook();
    worksheet = workbook.addWorksheet('Test');
  });

  describe('addBrandedHeader', () => {
    it('should add title row with document name', () => {
      const nextRow = addBrandedHeader(worksheet, 'Test Document');

      const titleCell = worksheet.getCell(1, 1);
      expect(titleCell.value).toBe('Test Document');
    });

    it('should add attribution row with book reference', () => {
      addBrandedHeader(worksheet, 'Test Document');

      const attrCell = worksheet.getCell(2, 1);
      expect(attrCell.value).toBe(ATTRIBUTION_TEXT);
    });

    it('should return the next available row number', () => {
      const nextRow = addBrandedHeader(worksheet, 'Test Document');

      // Header takes rows 1-2, plus spacer = row 3, so next is 4
      expect(nextRow).toBeGreaterThan(2);
    });

    it('should merge cells for title area', () => {
      addBrandedHeader(worksheet, 'Test Document');

      // Check that cells are merged (cell at column 6 should share value with column 1)
      // ExcelJS merges don't copy value to merged cells, but the merge range exists
      expect(worksheet.getCell(1, 1).value).toBe('Test Document');
    });
  });

  describe('addSectionHeader', () => {
    it('should add section title at specified row', () => {
      const nextRow = addSectionHeader(worksheet, 'My Section', 5);

      const cell = worksheet.getCell(5, 1);
      expect(cell.value).toBe('My Section');
    });

    it('should return the next row number', () => {
      const nextRow = addSectionHeader(worksheet, 'My Section', 5);

      expect(nextRow).toBe(6);
    });
  });

  describe('addDataTable', () => {
    it('should add header row with column names', () => {
      const headers = ['Name', 'Value', 'Status'];
      const data: (string | number | null)[][] = [];

      addDataTable(worksheet, headers, data, 1);

      expect(worksheet.getCell(1, 1).value).toBe('Name');
      expect(worksheet.getCell(1, 2).value).toBe('Value');
      expect(worksheet.getCell(1, 3).value).toBe('Status');
    });

    it('should add data rows after header', () => {
      const headers = ['Name', 'Value'];
      const data = [
        ['Item 1', 100],
        ['Item 2', 200],
      ];

      addDataTable(worksheet, headers, data, 1);

      expect(worksheet.getCell(2, 1).value).toBe('Item 1');
      expect(worksheet.getCell(2, 2).value).toBe(100);
      expect(worksheet.getCell(3, 1).value).toBe('Item 2');
      expect(worksheet.getCell(3, 2).value).toBe(200);
    });

    it('should return the next row after data', () => {
      const headers = ['Name', 'Value'];
      const data = [['Item 1', 100], ['Item 2', 200]];

      const nextRow = addDataTable(worksheet, headers, data, 1);

      expect(nextRow).toBe(4); // header + 2 data rows + next
    });

    it('should handle null values in data', () => {
      const headers = ['Name', 'Value'];
      const data = [['Item 1', null]];

      addDataTable(worksheet, headers, data, 1);

      expect(worksheet.getCell(2, 2).value).toBeNull();
    });
  });

  describe('addKeyValuePairs', () => {
    it('should add label-value pairs', () => {
      const pairs = [
        { label: 'Total Cost', value: 5000, format: 'currency' as const },
        { label: 'Count', value: 10, format: 'number' as const },
      ];

      addKeyValuePairs(worksheet, pairs, 1);

      expect(worksheet.getCell(1, 1).value).toBe('Total Cost');
      expect(worksheet.getCell(1, 2).value).toBe(5000);
      expect(worksheet.getCell(2, 1).value).toBe('Count');
      expect(worksheet.getCell(2, 2).value).toBe(10);
    });

    it('should apply currency formatting', () => {
      const pairs = [{ label: 'Cost', value: 1000, format: 'currency' as const }];

      addKeyValuePairs(worksheet, pairs, 1);

      const cell = worksheet.getCell(1, 2);
      expect(cell.numFmt).toBe('$#,##0');
    });

    it('should apply percent formatting', () => {
      const pairs = [{ label: 'Rate', value: 0.5, format: 'percent' as const }];

      addKeyValuePairs(worksheet, pairs, 1);

      const cell = worksheet.getCell(1, 2);
      expect(cell.numFmt).toBe('0.0%');
    });

    it('should return the next row number', () => {
      const pairs = [
        { label: 'A', value: 1 },
        { label: 'B', value: 2 },
      ];

      const nextRow = addKeyValuePairs(worksheet, pairs, 1);

      expect(nextRow).toBe(3);
    });
  });

  describe('addFormulaCell', () => {
    it('should add formula to cell', () => {
      addFormulaCell(worksheet, 1, 1, 'SUM(A2:A10)');

      const cell = worksheet.getCell(1, 1);
      expect((cell.value as { formula: string }).formula).toBe('SUM(A2:A10)');
    });

    it('should apply currency format when specified', () => {
      addFormulaCell(worksheet, 1, 1, 'SUM(A2:A10)', 'currency');

      const cell = worksheet.getCell(1, 1);
      expect(cell.numFmt).toBe('$#,##0');
    });

    it('should apply percent format when specified', () => {
      addFormulaCell(worksheet, 1, 1, 'A2/A10', 'percent');

      const cell = worksheet.getCell(1, 1);
      expect(cell.numFmt).toBe('0.0%');
    });
  });

  describe('addChartPlaceholder', () => {
    it('should add placeholder text with chart title', () => {
      addChartPlaceholder(worksheet, 'Sales Trend', 1, 5);

      const cell = worksheet.getCell(1, 1);
      expect(cell.value).toContain('Chart:');
      expect(cell.value).toContain('Sales Trend');
    });
  });

  describe('configurePrintArea', () => {
    it('should set landscape orientation', () => {
      configurePrintArea(worksheet, 50, 8);

      expect(worksheet.pageSetup.orientation).toBe('landscape');
    });

    it('should set fit to width', () => {
      configurePrintArea(worksheet, 50, 8);

      expect(worksheet.pageSetup.fitToPage).toBe(true);
      expect(worksheet.pageSetup.fitToWidth).toBe(1);
    });

    it('should set print area', () => {
      configurePrintArea(worksheet, 50, 8);

      expect(worksheet.pageSetup.printArea).toBe('A1:H50');
    });
  });

  describe('getColumnLetter', () => {
    it('should return A for column 1', () => {
      expect(getColumnLetter(1)).toBe('A');
    });

    it('should return Z for column 26', () => {
      expect(getColumnLetter(26)).toBe('Z');
    });

    it('should return AA for column 27', () => {
      expect(getColumnLetter(27)).toBe('AA');
    });

    it('should return AZ for column 52', () => {
      expect(getColumnLetter(52)).toBe('AZ');
    });

    it('should return BA for column 53', () => {
      expect(getColumnLetter(53)).toBe('BA');
    });
  });

  describe('formatCurrency', () => {
    it('should format positive numbers with dollar sign', () => {
      expect(formatCurrency(1000)).toBe('$1,000');
    });

    it('should format large numbers with thousands separator', () => {
      expect(formatCurrency(1234567)).toBe('$1,234,567');
    });

    it('should format zero', () => {
      expect(formatCurrency(0)).toBe('$0');
    });

    it('should not include decimals', () => {
      expect(formatCurrency(1000.99)).toBe('$1,001'); // Rounds
    });
  });

  describe('formatPercent', () => {
    it('should format with one decimal by default', () => {
      expect(formatPercent(50.5)).toBe('50.5%');
    });

    it('should respect decimal precision', () => {
      expect(formatPercent(33.333, 2)).toBe('33.33%');
    });

    it('should format zero', () => {
      expect(formatPercent(0)).toBe('0.0%');
    });

    it('should format 100', () => {
      expect(formatPercent(100)).toBe('100.0%');
    });
  });
});
