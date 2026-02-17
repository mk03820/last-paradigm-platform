/**
 * PowerPoint Document Components
 *
 * Reusable components for building consistent PowerPoint presentations.
 *
 * Story 18.4: PowerPoint & PDF Generation
 * Task 1.3: Create PowerPoint components
 */

import pptxgen from 'pptxgenjs';
import {
  PPTX_COLORS,
  ATTRIBUTION_TEXT,
  FONTS,
  FONT_SIZES,
  TITLE_SLIDE_STYLE,
  SECTION_SLIDE_STYLE,
  CONTENT_SLIDE_STYLE,
  METRIC_BOX_STYLE,
  TABLE_STYLE,
  FOOTER_STYLE,
  getScoreColor,
} from './styles';

/**
 * Add a title slide
 */
export function addTitleSlide(
  pptx: pptxgen,
  title: string,
  subtitle?: string
): void {
  const slide = pptx.addSlide();

  // Title
  slide.addText(title, {
    ...TITLE_SLIDE_STYLE.title,
  });

  // Subtitle
  if (subtitle) {
    slide.addText(subtitle, {
      ...TITLE_SLIDE_STYLE.subtitle,
    });
  }

  // Attribution
  slide.addText(ATTRIBUTION_TEXT, {
    ...TITLE_SLIDE_STYLE.attribution,
  });

  // Add decorative element (gold line)
  slide.addShape('rect', {
    x: 3.5,
    y: 1.8,
    w: 3.0,
    h: 0.05,
    fill: { color: PPTX_COLORS.gold },
  });
}

/**
 * Add a section header slide with navy background
 */
export function addSectionSlide(
  pptx: pptxgen,
  title: string,
  subtitle?: string
): void {
  const slide = pptx.addSlide();

  // Navy background
  slide.background = { color: SECTION_SLIDE_STYLE.background };

  // Title
  slide.addText(title, {
    ...SECTION_SLIDE_STYLE.title,
  });

  // Subtitle
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.5,
      y: 3.0,
      w: 9.0,
      h: 0.5,
      fontSize: FONT_SIZES.subheading,
      fontFace: FONTS.body,
      color: PPTX_COLORS.lightGray,
      align: 'center',
    });
  }

  // Gold accent line
  slide.addShape('rect', {
    x: 4.0,
    y: 3.6,
    w: 2.0,
    h: 0.03,
    fill: { color: PPTX_COLORS.gold },
  });
}

/**
 * Add a content slide with title and body text
 */
export function addContentSlide(
  pptx: pptxgen,
  title: string,
  content: string | string[]
): pptxgen.Slide {
  const slide = pptx.addSlide();

  // Title
  slide.addText(title, {
    ...CONTENT_SLIDE_STYLE.title,
  });

  // Content
  const bodyContent = Array.isArray(content) ? content.join('\n\n') : content;
  slide.addText(bodyContent, {
    ...CONTENT_SLIDE_STYLE.body,
  });

  // Footer
  addSlideFooter(slide);

  return slide;
}

/**
 * Add a bullet list slide
 */
export function addBulletSlide(
  pptx: pptxgen,
  title: string,
  bullets: string[]
): pptxgen.Slide {
  const slide = pptx.addSlide();

  // Title
  slide.addText(title, {
    ...CONTENT_SLIDE_STYLE.title,
  });

  // Bullet list
  const textRows = bullets.map((bullet) => ({
    text: bullet,
    options: {
      bullet: { type: 'bullet' as const },
      fontSize: FONT_SIZES.body,
      fontFace: FONTS.body,
      color: PPTX_COLORS.slate,
      paraSpaceAfter: 8,
    },
  }));

  slide.addText(textRows, {
    x: 0.5,
    y: 1.0,
    w: 9.0,
    h: 4.0,
    valign: 'top',
  });

  addSlideFooter(slide);

  return slide;
}

/**
 * Add a metric highlight box
 */
export function addMetricBox(
  slide: pptxgen.Slide,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
  highlight?: boolean
): void {
  // Background box
  slide.addShape('rect', {
    x,
    y,
    w,
    h,
    fill: METRIC_BOX_STYLE.box.fill,
    line: METRIC_BOX_STYLE.box.line,
  });

  // Label
  slide.addText(label, {
    x,
    y: y + 0.1,
    w,
    h: 0.3,
    ...METRIC_BOX_STYLE.label,
    align: 'center',
  });

  // Value
  const valueStyle = highlight ? METRIC_BOX_STYLE.highlight : METRIC_BOX_STYLE.value;
  slide.addText(value, {
    x,
    y: y + 0.4,
    w,
    h: h - 0.5,
    ...valueStyle,
    align: 'center',
    valign: 'middle',
  });
}

/**
 * Add a metrics row (4 metrics side by side)
 */
export function addMetricsRow(
  slide: pptxgen.Slide,
  y: number,
  metrics: Array<{ label: string; value: string; highlight?: boolean }>
): void {
  const metricWidth = 2.1;
  const startX = 0.5;
  const gap = 0.2;

  metrics.forEach((metric, index) => {
    addMetricBox(
      slide,
      startX + index * (metricWidth + gap),
      y,
      metricWidth,
      0.9,
      metric.label,
      metric.value,
      metric.highlight
    );
  });
}

/**
 * Add a data table to slide
 */
export function addTable(
  slide: pptxgen.Slide,
  headers: string[],
  data: string[][],
  x: number,
  y: number,
  w: number
): void {
  const colWidth = w / headers.length;

  // Build table rows
  const tableData: pptxgen.TableRow[] = [];

  // Header row
  tableData.push(
    headers.map((header) => ({
      text: header,
      options: {
        fill: TABLE_STYLE.header.fill,
        color: TABLE_STYLE.header.color,
        bold: TABLE_STYLE.header.bold,
        fontSize: TABLE_STYLE.header.fontSize,
        fontFace: TABLE_STYLE.header.fontFace,
        align: TABLE_STYLE.header.align,
        valign: 'middle' as const,
      },
    }))
  );

  // Data rows
  data.forEach((row, rowIndex) => {
    const rowStyle = rowIndex % 2 === 0 ? TABLE_STYLE.body : TABLE_STYLE.altRow;
    tableData.push(
      row.map((cell) => ({
        text: cell,
        options: {
          fill: rowStyle.fill,
          color: rowStyle.color,
          fontSize: rowStyle.fontSize,
          fontFace: rowStyle.fontFace,
          align: rowStyle.align,
          valign: 'middle' as const,
        },
      }))
    );
  });

  slide.addTable(tableData, {
    x,
    y,
    w,
    colW: Array(headers.length).fill(colWidth),
    border: { type: 'solid', pt: TABLE_STYLE.border.pt, color: TABLE_STYLE.border.color },
    rowH: 0.4,
  });
}

/**
 * Add a score indicator with color coding
 */
export function addScoreIndicator(
  slide: pptxgen.Slide,
  x: number,
  y: number,
  label: string,
  score: number
): void {
  const scoreColor = getScoreColor(score);

  // Score circle
  slide.addShape('ellipse', {
    x,
    y,
    w: 0.8,
    h: 0.8,
    fill: { color: scoreColor },
  });

  // Score value
  slide.addText(String(Math.round(score)), {
    x,
    y,
    w: 0.8,
    h: 0.8,
    fontSize: FONT_SIZES.subheading,
    fontFace: FONTS.heading,
    color: PPTX_COLORS.white,
    bold: true,
    align: 'center',
    valign: 'middle',
  });

  // Label
  slide.addText(label, {
    x: x + 0.9,
    y,
    w: 2.5,
    h: 0.8,
    fontSize: FONT_SIZES.body,
    fontFace: FONTS.body,
    color: PPTX_COLORS.slate,
    valign: 'middle',
  });
}

/**
 * Add a bar chart placeholder (pptxgenjs has limited chart support)
 */
export function addBarChart(
  slide: pptxgen.Slide,
  title: string,
  data: Array<{ label: string; value: number }>,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  // Chart title
  slide.addText(title, {
    x,
    y: y - 0.4,
    w,
    h: 0.4,
    fontSize: FONT_SIZES.subheading,
    fontFace: FONTS.heading,
    color: PPTX_COLORS.navy,
    bold: true,
  });

  // Create chart data
  const chartData = [
    {
      name: 'Values',
      labels: data.map((d) => d.label),
      values: data.map((d) => d.value),
    },
  ];

  slide.addChart('bar', chartData, {
    x,
    y,
    w,
    h,
    barDir: 'bar',
    barGapWidthPct: 50,
    chartColors: [PPTX_COLORS.navy],
    showLegend: false,
    showTitle: false,
    catAxisTitle: '',
    valAxisTitle: '',
  });
}

/**
 * Add a donut/pie chart
 */
export function addDonutChart(
  slide: pptxgen.Slide,
  title: string,
  data: Array<{ label: string; value: number }>,
  x: number,
  y: number,
  w: number,
  h: number
): void {
  // Chart title
  slide.addText(title, {
    x,
    y: y - 0.4,
    w,
    h: 0.4,
    fontSize: FONT_SIZES.subheading,
    fontFace: FONTS.heading,
    color: PPTX_COLORS.navy,
    bold: true,
  });

  // Create chart data
  const chartData = [
    {
      name: 'Values',
      labels: data.map((d) => d.label),
      values: data.map((d) => d.value),
    },
  ];

  slide.addChart('doughnut', chartData, {
    x,
    y,
    w,
    h,
    chartColors: [
      PPTX_COLORS.navy,
      PPTX_COLORS.gold,
      PPTX_COLORS.green,
      PPTX_COLORS.slate,
      PPTX_COLORS.amber,
    ],
    showLegend: true,
    legendPos: 'r',
    showTitle: false,
    holeSize: 50,
  });
}

/**
 * Add footer to slide
 */
export function addSlideFooter(slide: pptxgen.Slide): void {
  slide.addText(ATTRIBUTION_TEXT, {
    ...FOOTER_STYLE.text,
  });
}

/**
 * Add a "Thank You" closing slide
 */
export function addThankYouSlide(
  pptx: pptxgen,
  contactInfo?: { email?: string; website?: string }
): void {
  const slide = pptx.addSlide();

  // Navy background
  slide.background = { color: PPTX_COLORS.navy };

  // Thank you text
  slide.addText('Thank You', {
    x: 0.5,
    y: 1.8,
    w: 9.0,
    h: 1.0,
    fontSize: 48,
    fontFace: FONTS.heading,
    color: PPTX_COLORS.white,
    bold: true,
    align: 'center',
  });

  // Questions text
  slide.addText('Questions?', {
    x: 0.5,
    y: 2.8,
    w: 9.0,
    h: 0.5,
    fontSize: FONT_SIZES.subheading,
    fontFace: FONTS.body,
    color: PPTX_COLORS.lightGray,
    align: 'center',
  });

  // Contact info
  if (contactInfo) {
    const contactText = [
      contactInfo.email || '',
      contactInfo.website || 'thelastparadigm.com',
    ].filter(Boolean).join(' | ');

    slide.addText(contactText, {
      x: 0.5,
      y: 4.2,
      w: 9.0,
      h: 0.4,
      fontSize: FONT_SIZES.body,
      fontFace: FONTS.body,
      color: PPTX_COLORS.gold,
      align: 'center',
    });
  }

  // Attribution
  slide.addText(ATTRIBUTION_TEXT, {
    x: 0.5,
    y: 5.0,
    w: 9.0,
    h: 0.4,
    fontSize: FONT_SIZES.caption,
    fontFace: FONTS.body,
    color: PPTX_COLORS.slate,
    italic: true,
    align: 'center',
  });
}

/**
 * Create a new presentation with default settings
 */
export function createPresentation(): pptxgen {
  const pptx = new pptxgen();

  // Set presentation properties
  pptx.author = 'The Last Paradigm Platform';
  pptx.company = 'The Last Paradigm';
  pptx.subject = 'Alignment Assessment Results';
  pptx.title = 'Executive Presentation';

  // Set slide layout to widescreen 16:9
  pptx.layout = 'LAYOUT_16x9';

  // Set default font
  pptx.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: PPTX_COLORS.white },
    margin: [0.5, 0.5, 0.5, 0.5],
  });

  return pptx;
}
