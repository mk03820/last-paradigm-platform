/**
 * Shared Word Document Components
 *
 * Reusable components for building consistent Word documents.
 * Includes headers, footers, tables, and section builders.
 *
 * Story 18.2: Word Document Templates & Generation
 * Task 1.4: Create reusable header/footer components with book attribution
 * Covers: FR65 (Book attribution), NFR28 (Board-presentation ready)
 */

import {
  Paragraph,
  TextRun,
  Header,
  Footer,
  PageNumber,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  VerticalAlign,
  NumberFormat,
} from 'docx';
import { BRAND_COLORS, DOCUMENT_STYLES, SPACING } from './styles';

/**
 * Create branded header with "The Last Paradigm" attribution (FR65)
 */
export function createBrandedHeader(documentTitle: string): Header {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: documentTitle,
            font: DOCUMENT_STYLES.bodySmall.font,
            size: DOCUMENT_STYLES.bodySmall.size,
            color: BRAND_COLORS.slate,
          }),
          new TextRun({
            text: '  |  ',
            size: DOCUMENT_STYLES.bodySmall.size,
            color: BRAND_COLORS.mediumGray,
          }),
          new TextRun({
            text: 'The Last Paradigm',
            font: DOCUMENT_STYLES.bodySmall.font,
            size: DOCUMENT_STYLES.bodySmall.size,
            italics: true,
            color: BRAND_COLORS.gold,
          }),
          new TextRun({
            text: ' Methodology',
            font: DOCUMENT_STYLES.bodySmall.font,
            size: DOCUMENT_STYLES.bodySmall.size,
            color: BRAND_COLORS.slate,
          }),
        ],
        alignment: AlignmentType.RIGHT,
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 6,
            color: BRAND_COLORS.mediumGray,
          },
        },
        spacing: { after: 200 },
      }),
    ],
  });
}

/**
 * Create branded footer with page numbers and attribution (FR65)
 */
export function createBrandedFooter(): Footer {
  return new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: 'Based on ',
            size: 16,
            color: BRAND_COLORS.slate,
          }),
          new TextRun({
            text: 'The Last Paradigm',
            size: 16,
            italics: true,
            color: BRAND_COLORS.gold,
          }),
          new TextRun({
            text: ' methodology  |  Page ',
            size: 16,
            color: BRAND_COLORS.slate,
          }),
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 16,
            color: BRAND_COLORS.slate,
          }),
          new TextRun({
            text: ' of ',
            size: 16,
            color: BRAND_COLORS.slate,
          }),
          new TextRun({
            children: [PageNumber.TOTAL_PAGES],
            size: 16,
            color: BRAND_COLORS.slate,
          }),
        ],
        alignment: AlignmentType.CENTER,
        border: {
          top: {
            style: BorderStyle.SINGLE,
            size: 6,
            color: BRAND_COLORS.mediumGray,
          },
        },
        spacing: { before: 200 },
      }),
    ],
  });
}

/**
 * Create a cover page title
 */
export function createCoverPage(
  title: string,
  subtitle?: string,
  generatedDate?: Date
): Paragraph[] {
  const date = generatedDate || new Date();
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const paragraphs: Paragraph[] = [
    // Title
    new Paragraph({
      children: [
        new TextRun({
          text: title,
          ...DOCUMENT_STYLES.title,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 3000, after: 400 },
    }),
  ];

  // Subtitle if provided
  if (subtitle) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: subtitle,
            ...DOCUMENT_STYLES.heading2,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 },
      })
    );
  }

  // Generation date
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated: ${formattedDate}`,
          ...DOCUMENT_STYLES.body,
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Attribution
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Powered by ',
          ...DOCUMENT_STYLES.body,
        }),
        new TextRun({
          text: 'The Last Paradigm',
          ...DOCUMENT_STYLES.body,
          italics: true,
          color: BRAND_COLORS.gold,
        }),
        new TextRun({
          text: ' Platform',
          ...DOCUMENT_STYLES.body,
        }),
      ],
      alignment: AlignmentType.CENTER,
    })
  );

  // Page break after cover
  paragraphs.push(
    new Paragraph({
      children: [],
      pageBreakBefore: true,
    })
  );

  return paragraphs;
}

/**
 * Create a section title (H1)
 */
export function createSectionTitle(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        ...DOCUMENT_STYLES.heading1,
      }),
    ],
    spacing: { before: SPACING.sectionBefore, after: SPACING.sectionAfter },
  });
}

/**
 * Create a subsection title (H2)
 */
export function createSubsectionTitle(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        ...DOCUMENT_STYLES.heading2,
      }),
    ],
    spacing: { before: 300, after: 150 },
  });
}

/**
 * Create a body paragraph
 */
export function createBodyParagraph(text: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        ...DOCUMENT_STYLES.body,
      }),
    ],
    spacing: { after: SPACING.paragraphAfter },
  });
}

/**
 * Create a highlighted metric paragraph
 */
export function createHighlightMetric(
  label: string,
  value: string,
  description?: string
): Paragraph[] {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      children: [
        new TextRun({
          text: `${label}: `,
          ...DOCUMENT_STYLES.body,
        }),
        new TextRun({
          text: value,
          ...DOCUMENT_STYLES.highlightLarge,
        }),
      ],
      spacing: { after: 80 },
    }),
  ];

  if (description) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: description,
            ...DOCUMENT_STYLES.body,
            italics: true,
          }),
        ],
        spacing: { after: SPACING.paragraphAfter },
      })
    );
  }

  return paragraphs;
}

/**
 * Create a styled data table
 */
export function createDataTable(headers: string[], rows: string[][]): Table {
  const borderStyle = {
    style: BorderStyle.SINGLE,
    size: 4,
    color: BRAND_COLORS.mediumGray,
  };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Header row
      new TableRow({
        children: headers.map(
          (header) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: header,
                      ...DOCUMENT_STYLES.tableHeader,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: {
                fill: BRAND_COLORS.navy,
                type: ShadingType.CLEAR,
              },
              verticalAlign: VerticalAlign.CENTER,
              borders: {
                top: borderStyle,
                bottom: borderStyle,
                left: borderStyle,
                right: borderStyle,
              },
            })
        ),
        tableHeader: true,
      }),
      // Data rows
      ...rows.map(
        (row, index) =>
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cell,
                          ...DOCUMENT_STYLES.tableCell,
                        }),
                      ],
                    }),
                  ],
                  shading: {
                    fill:
                      index % 2 === 0
                        ? BRAND_COLORS.white
                        : BRAND_COLORS.lightGray,
                    type: ShadingType.CLEAR,
                  },
                  verticalAlign: VerticalAlign.CENTER,
                  borders: {
                    top: borderStyle,
                    bottom: borderStyle,
                    left: borderStyle,
                    right: borderStyle,
                  },
                })
            ),
          })
      ),
    ],
  });
}

/**
 * Create a bullet list
 */
export function createBulletList(items: string[]): Paragraph[] {
  return items.map(
    (item) =>
      new Paragraph({
        children: [
          new TextRun({
            text: item,
            ...DOCUMENT_STYLES.body,
          }),
        ],
        bullet: { level: 0 },
        spacing: { after: SPACING.listItemAfter },
      })
  );
}

/**
 * Create a numbered list
 */
export function createNumberedList(items: string[]): Paragraph[] {
  return items.map(
    (item, index) =>
      new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}. ${item}`,
            ...DOCUMENT_STYLES.body,
          }),
        ],
        spacing: { after: SPACING.listItemAfter },
      })
  );
}

/**
 * Create a key-value pair line
 */
export function createKeyValue(
  key: string,
  value: string,
  valueColor?: string
): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${key}: `,
        ...DOCUMENT_STYLES.body,
        bold: true,
      }),
      new TextRun({
        text: value,
        ...DOCUMENT_STYLES.body,
        color: valueColor || DOCUMENT_STYLES.body.color,
      }),
    ],
    spacing: { after: 80 },
  });
}

/**
 * Format currency for display
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
 * Format percentage for display
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a score as X/100
 */
export function formatScore(score: number): string {
  return `${Math.round(score)}/100`;
}

/**
 * Create a page break paragraph
 */
export function createPageBreak(): Paragraph {
  return new Paragraph({
    children: [],
    pageBreakBefore: true,
  });
}
