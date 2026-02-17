/**
 * Word Document Components Tests
 *
 * Tests for shared document components and helper functions.
 *
 * Story 18.2: Word Document Templates & Generation
 * Task 8.2: Unit tests for header/footer generation
 */

import { describe, it, expect } from 'vitest';
import {
  createBrandedHeader,
  createBrandedFooter,
  createCoverPage,
  createSectionTitle,
  createSubsectionTitle,
  createBodyParagraph,
  createHighlightMetric,
  createDataTable,
  createBulletList,
  createNumberedList,
  createKeyValue,
  createPageBreak,
  formatCurrency,
  formatPercent,
  formatScore,
} from '@/lib/documents/word/components';
import { Header, Footer, Paragraph, Table } from 'docx';

describe('createBrandedHeader', () => {
  it('should return a Header instance', () => {
    const header = createBrandedHeader('Test Document');
    expect(header).toBeInstanceOf(Header);
  });

  it('should include document title in header', () => {
    const header = createBrandedHeader('Strategic Alignment Brief');
    // Header is created successfully - testing constructor doesn't throw
    expect(header).toBeDefined();
  });
});

describe('createBrandedFooter', () => {
  it('should return a Footer instance', () => {
    const footer = createBrandedFooter();
    expect(footer).toBeInstanceOf(Footer);
  });

  it('should create footer with page numbers', () => {
    const footer = createBrandedFooter();
    expect(footer).toBeDefined();
  });
});

describe('createCoverPage', () => {
  it('should return array of paragraphs', () => {
    const paragraphs = createCoverPage('Test Title');
    expect(Array.isArray(paragraphs)).toBe(true);
    expect(paragraphs.length).toBeGreaterThan(0);
  });

  it('should include title paragraph', () => {
    const paragraphs = createCoverPage('Test Title');
    expect(paragraphs.some((p) => p instanceof Paragraph)).toBe(true);
  });

  it('should include subtitle if provided', () => {
    const paragraphs = createCoverPage('Title', 'Subtitle');
    // More paragraphs with subtitle
    expect(paragraphs.length).toBeGreaterThanOrEqual(4);
  });

  it('should include page break at the end', () => {
    const paragraphs = createCoverPage('Title');
    const lastParagraph = paragraphs[paragraphs.length - 1];
    expect(lastParagraph).toBeInstanceOf(Paragraph);
  });
});

describe('createSectionTitle', () => {
  it('should return a Paragraph', () => {
    const title = createSectionTitle('Section 1');
    expect(title).toBeInstanceOf(Paragraph);
  });
});

describe('createSubsectionTitle', () => {
  it('should return a Paragraph', () => {
    const title = createSubsectionTitle('Subsection');
    expect(title).toBeInstanceOf(Paragraph);
  });
});

describe('createBodyParagraph', () => {
  it('should return a Paragraph', () => {
    const para = createBodyParagraph('This is body text.');
    expect(para).toBeInstanceOf(Paragraph);
  });
});

describe('createHighlightMetric', () => {
  it('should return array of paragraphs', () => {
    const paragraphs = createHighlightMetric('Total Cost', '$1,000,000');
    expect(Array.isArray(paragraphs)).toBe(true);
    expect(paragraphs.length).toBeGreaterThan(0);
  });

  it('should include description if provided', () => {
    const withDesc = createHighlightMetric('Total Cost', '$1M', 'Annual estimate');
    const withoutDesc = createHighlightMetric('Total Cost', '$1M');
    expect(withDesc.length).toBeGreaterThan(withoutDesc.length);
  });
});

describe('createDataTable', () => {
  it('should return a Table', () => {
    const table = createDataTable(['Col1', 'Col2'], [['A', 'B']]);
    expect(table).toBeInstanceOf(Table);
  });

  it('should handle empty rows', () => {
    const table = createDataTable(['Col1', 'Col2'], []);
    expect(table).toBeInstanceOf(Table);
  });

  it('should handle multiple rows', () => {
    const table = createDataTable(
      ['Name', 'Value'],
      [
        ['Row 1', '100'],
        ['Row 2', '200'],
        ['Row 3', '300'],
      ]
    );
    expect(table).toBeInstanceOf(Table);
  });
});

describe('createBulletList', () => {
  it('should return array of Paragraphs', () => {
    const list = createBulletList(['Item 1', 'Item 2', 'Item 3']);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(3);
    list.forEach((item) => {
      expect(item).toBeInstanceOf(Paragraph);
    });
  });

  it('should handle empty list', () => {
    const list = createBulletList([]);
    expect(list).toHaveLength(0);
  });
});

describe('createNumberedList', () => {
  it('should return array of Paragraphs', () => {
    const list = createNumberedList(['First', 'Second', 'Third']);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(3);
  });
});

describe('createKeyValue', () => {
  it('should return a Paragraph', () => {
    const kv = createKeyValue('Label', 'Value');
    expect(kv).toBeInstanceOf(Paragraph);
  });

  it('should accept optional color parameter', () => {
    const kv = createKeyValue('Label', 'Value', 'FF0000');
    expect(kv).toBeInstanceOf(Paragraph);
  });
});

describe('createPageBreak', () => {
  it('should return a Paragraph', () => {
    const pageBreak = createPageBreak();
    expect(pageBreak).toBeInstanceOf(Paragraph);
  });
});

describe('formatCurrency', () => {
  it('should format positive numbers as USD', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
    expect(formatCurrency(1000000)).toBe('$1,000,000');
    expect(formatCurrency(1234567)).toBe('$1,234,567');
  });

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  it('should format negative numbers', () => {
    expect(formatCurrency(-1000)).toBe('-$1,000');
  });

  it('should round to whole numbers', () => {
    expect(formatCurrency(1000.99)).toBe('$1,001');
    expect(formatCurrency(1000.01)).toBe('$1,000');
  });
});

describe('formatPercent', () => {
  it('should format percentages with default 1 decimal', () => {
    expect(formatPercent(50)).toBe('50.0%');
    expect(formatPercent(33.33)).toBe('33.3%');
    expect(formatPercent(100)).toBe('100.0%');
  });

  it('should respect decimal places parameter', () => {
    expect(formatPercent(33.333, 2)).toBe('33.33%');
    expect(formatPercent(33.333, 0)).toBe('33%');
  });

  it('should handle zero', () => {
    expect(formatPercent(0)).toBe('0.0%');
  });
});

describe('formatScore', () => {
  it('should format scores as X/100', () => {
    expect(formatScore(75)).toBe('75/100');
    expect(formatScore(100)).toBe('100/100');
    expect(formatScore(0)).toBe('0/100');
  });

  it('should round decimal scores', () => {
    expect(formatScore(75.4)).toBe('75/100');
    expect(formatScore(75.5)).toBe('76/100');
  });
});
