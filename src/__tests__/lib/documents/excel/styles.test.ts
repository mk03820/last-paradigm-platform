/**
 * Tests for Excel Document Styles
 *
 * Story 18.3: Excel Document Templates & Generation
 * Task 6: Write comprehensive tests for Excel infrastructure
 */

import { describe, it, expect } from 'vitest';
import {
  EXCEL_COLORS,
  ATTRIBUTION_TEXT,
  HEADER_STYLE,
  DATA_CELL_STYLE,
  ALT_ROW_STYLE,
  TITLE_STYLE,
  SECTION_HEADER_STYLE,
  HIGHLIGHT_STYLE,
  CURRENCY_STYLE,
  PERCENT_STYLE,
  NUMBER_STYLE,
  DATE_STYLE,
  INPUT_CELL_STYLE,
  ATTRIBUTION_STYLE,
  getScoreColor,
  COLUMN_WIDTHS,
  ROW_HEIGHTS,
} from '@/lib/documents/excel/styles';

describe('Excel Styles', () => {
  describe('EXCEL_COLORS', () => {
    it('should have navy color in ARGB format', () => {
      expect(EXCEL_COLORS.navy).toBe('FF0F172A');
      expect(EXCEL_COLORS.navy).toMatch(/^FF[0-9A-F]{6}$/);
    });

    it('should have gold color in ARGB format', () => {
      expect(EXCEL_COLORS.gold).toBe('FFD97706');
      expect(EXCEL_COLORS.gold).toMatch(/^FF[0-9A-F]{6}$/);
    });

    it('should have all required brand colors', () => {
      expect(EXCEL_COLORS).toHaveProperty('navy');
      expect(EXCEL_COLORS).toHaveProperty('slate');
      expect(EXCEL_COLORS).toHaveProperty('gold');
      expect(EXCEL_COLORS).toHaveProperty('lightGray');
      expect(EXCEL_COLORS).toHaveProperty('white');
      expect(EXCEL_COLORS).toHaveProperty('red');
      expect(EXCEL_COLORS).toHaveProperty('green');
      expect(EXCEL_COLORS).toHaveProperty('amber');
    });
  });

  describe('ATTRIBUTION_TEXT', () => {
    it('should include book reference', () => {
      expect(ATTRIBUTION_TEXT).toContain('The Last Paradigm');
    });

    it('should include website URL', () => {
      expect(ATTRIBUTION_TEXT).toContain('thelastparadigm.com');
    });
  });

  describe('HEADER_STYLE', () => {
    it('should have bold white font', () => {
      expect(HEADER_STYLE.font?.bold).toBe(true);
      expect(HEADER_STYLE.font?.color?.argb).toBe(EXCEL_COLORS.white);
    });

    it('should have navy background fill', () => {
      const fill = HEADER_STYLE.fill as { fgColor: { argb: string } };
      expect(fill.fgColor.argb).toBe(EXCEL_COLORS.navy);
    });

    it('should have center alignment', () => {
      expect(HEADER_STYLE.alignment?.horizontal).toBe('center');
    });

    it('should have borders', () => {
      expect(HEADER_STYLE.border).toBeDefined();
    });
  });

  describe('DATA_CELL_STYLE', () => {
    it('should have Calibri font', () => {
      expect(DATA_CELL_STYLE.font?.name).toBe('Calibri');
    });

    it('should have size 10 font', () => {
      expect(DATA_CELL_STYLE.font?.size).toBe(10);
    });

    it('should have borders', () => {
      expect(DATA_CELL_STYLE.border).toBeDefined();
    });
  });

  describe('ALT_ROW_STYLE', () => {
    it('should extend DATA_CELL_STYLE with background', () => {
      const fill = ALT_ROW_STYLE.fill as { fgColor: { argb: string } };
      expect(fill.fgColor.argb).toBe(EXCEL_COLORS.lightGray);
    });
  });

  describe('INPUT_CELL_STYLE', () => {
    it('should have yellow background for editability indication', () => {
      const fill = INPUT_CELL_STYLE.fill as { fgColor: { argb: string } };
      expect(fill.fgColor.argb).toMatch(/^FF.*$/); // Should be ARGB format
    });

    it('should have gold border', () => {
      expect(INPUT_CELL_STYLE.border?.top?.color?.argb).toBe(EXCEL_COLORS.gold);
    });
  });

  describe('CURRENCY_STYLE', () => {
    it('should have currency format', () => {
      expect(CURRENCY_STYLE.numFmt).toBe('$#,##0');
    });

    it('should have right alignment', () => {
      expect(CURRENCY_STYLE.alignment?.horizontal).toBe('right');
    });
  });

  describe('PERCENT_STYLE', () => {
    it('should have percent format', () => {
      expect(PERCENT_STYLE.numFmt).toBe('0.0%');
    });
  });

  describe('NUMBER_STYLE', () => {
    it('should have number format with thousands separator', () => {
      expect(NUMBER_STYLE.numFmt).toBe('#,##0');
    });
  });

  describe('DATE_STYLE', () => {
    it('should have date format', () => {
      expect(DATE_STYLE.numFmt).toBe('mm/dd/yyyy');
    });

    it('should have center alignment', () => {
      expect(DATE_STYLE.alignment?.horizontal).toBe('center');
    });
  });

  describe('TITLE_STYLE', () => {
    it('should have large bold font', () => {
      expect(TITLE_STYLE.font?.bold).toBe(true);
      expect(TITLE_STYLE.font?.size).toBe(18);
    });

    it('should use navy color', () => {
      expect(TITLE_STYLE.font?.color?.argb).toBe(EXCEL_COLORS.navy);
    });
  });

  describe('SECTION_HEADER_STYLE', () => {
    it('should have medium bold font', () => {
      expect(SECTION_HEADER_STYLE.font?.bold).toBe(true);
      expect(SECTION_HEADER_STYLE.font?.size).toBe(14);
    });
  });

  describe('getScoreColor', () => {
    it('should return green for high scores (>=80)', () => {
      expect(getScoreColor(80)).toBe(EXCEL_COLORS.green);
      expect(getScoreColor(100)).toBe(EXCEL_COLORS.green);
    });

    it('should return gold for medium-high scores (>=60, <80)', () => {
      expect(getScoreColor(60)).toBe(EXCEL_COLORS.gold);
      expect(getScoreColor(79)).toBe(EXCEL_COLORS.gold);
    });

    it('should return amber for medium-low scores (>=40, <60)', () => {
      expect(getScoreColor(40)).toBe(EXCEL_COLORS.amber);
      expect(getScoreColor(59)).toBe(EXCEL_COLORS.amber);
    });

    it('should return red for low scores (<40)', () => {
      expect(getScoreColor(0)).toBe(EXCEL_COLORS.red);
      expect(getScoreColor(39)).toBe(EXCEL_COLORS.red);
    });
  });

  describe('COLUMN_WIDTHS', () => {
    it('should have standard width options', () => {
      expect(COLUMN_WIDTHS.narrow).toBe(10);
      expect(COLUMN_WIDTHS.medium).toBe(15);
      expect(COLUMN_WIDTHS.wide).toBe(25);
      expect(COLUMN_WIDTHS.extraWide).toBe(40);
    });
  });

  describe('ROW_HEIGHTS', () => {
    it('should have standard height options', () => {
      expect(ROW_HEIGHTS.header).toBe(25);
      expect(ROW_HEIGHTS.data).toBe(20);
      expect(ROW_HEIGHTS.title).toBe(30);
      expect(ROW_HEIGHTS.spacer).toBe(10);
    });
  });
});
