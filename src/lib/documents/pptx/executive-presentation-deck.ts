/**
 * Executive Presentation Deck Generator
 *
 * Generates a PowerPoint presentation with diagnostic results,
 * visualizations, and recommendations for executive stakeholders.
 *
 * Story 18.4: PowerPoint & PDF Generation
 * Task 2: Create Executive Presentation Deck generator
 * Covers: AC2, AC5, FR65 (Book attribution)
 */

import type { DiagnosticSessionData } from '@/lib/db/schema';
import type { GenerationResult } from '../word/types';
import {
  createPresentation,
  addTitleSlide,
  addSectionSlide,
  addContentSlide,
  addBulletSlide,
  addMetricBox,
  addMetricsRow,
  addTable,
  addScoreIndicator,
  addBarChart,
  addDonutChart,
  addSlideFooter,
  addThankYouSlide,
} from './components';
import {
  PPTX_COLORS,
  FONTS,
  FONT_SIZES,
  CONTENT_SLIDE_STYLE,
  formatCurrency,
  formatPercent,
  formatScore,
  getScoreColor,
  getScoreInterpretation,
} from './styles';

/**
 * Generate the Executive Presentation Deck
 */
export async function generateExecutivePresentationDeck(
  diagnosticData: DiagnosticSessionData
): Promise<GenerationResult> {
  const pptx = createPresentation();

  // Slide 1: Title
  addTitleSlide(pptx, 'Alignment Assessment Results', 'Executive Summary & Strategic Recommendations');

  // Slide 2: Executive Summary
  addExecutiveSummarySlide(pptx, diagnosticData);

  // Slide 3: Section - Diagnostic Findings
  addSectionSlide(pptx, 'Diagnostic Findings', '7-Tool Assessment Overview');

  // Slides 4-10: Tool-by-tool findings
  addTool1Slide(pptx, diagnosticData.tool1);
  addTool2Slide(pptx, diagnosticData.tool2);
  addTool3Slide(pptx, diagnosticData.tool3);
  addTool4Slide(pptx, diagnosticData.tool4);
  addTool5Slide(pptx, diagnosticData.tool5);
  addTool6Slide(pptx, diagnosticData.tool6);
  addTool7Slide(pptx, diagnosticData.tool7);

  // Slide 11: Section - Recommendations
  addSectionSlide(pptx, 'Strategic Recommendations', 'Prioritized Actions for Improvement');

  // Slide 12: Priority Recommendations
  addPriorityRecommendationsSlide(pptx, diagnosticData);

  // Slide 13: Implementation Roadmap
  addImplementationRoadmapSlide(pptx);

  // Slide 14: ROI Projection
  addROIProjectionSlide(pptx, diagnosticData);

  // Slide 15: Next Steps
  addNextStepsSlide(pptx);

  // Slide 16: Thank You
  addThankYouSlide(pptx, { website: 'thelastparadigm.com' });

  // Generate buffer
  const buffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer;

  return {
    buffer: Buffer.from(buffer),
    fileSizeBytes: buffer.length,
  };
}

/**
 * Add Executive Summary slide
 */
function addExecutiveSummarySlide(
  pptx: InstanceType<typeof import('pptxgenjs').default>,
  diagnosticData: DiagnosticSessionData
): void {
  const slide = pptx.addSlide();

  // Title
  slide.addText('Executive Summary', {
    ...CONTENT_SLIDE_STYLE.title,
  });

  // Key metrics row
  const tool7 = diagnosticData.tool7 || {};
  const tool1 = diagnosticData.tool1 || {};
  const tool2Results = diagnosticData.tool2?.results || {};

  addMetricsRow(slide, 1.0, [
    { label: 'Total Alignment Tax', value: formatCurrency(tool7.totalCost || 0), highlight: true },
    { label: '% of Revenue', value: formatPercent(tool7.alignmentTaxPercent || 0) },
    { label: 'Alignment Score', value: formatScore(tool1.compositeScore || 0) },
    { label: 'Meeting Waste', value: formatCurrency(tool2Results.wastedCost || 0) },
  ]);

  // Summary text
  slide.addText('Your organization is experiencing significant alignment tax that impacts productivity, decision-making speed, and overall effectiveness. This presentation summarizes findings from a comprehensive 7-tool diagnostic assessment and provides prioritized recommendations for improvement.', {
    x: 0.5,
    y: 2.1,
    w: 9.0,
    h: 1.0,
    fontSize: FONT_SIZES.body,
    fontFace: FONTS.body,
    color: PPTX_COLORS.slate,
    valign: 'top',
  });

  // Key findings bullets
  const findings = generateKeyFindings(diagnosticData);
  slide.addText(findings.map(f => ({ text: f, options: { bullet: { type: 'bullet' as const } } })), {
    x: 0.5,
    y: 3.2,
    w: 9.0,
    h: 2.0,
    fontSize: FONT_SIZES.body,
    fontFace: FONTS.body,
    color: PPTX_COLORS.slate,
    valign: 'top',
    paraSpaceAfter: 6,
  });

  addSlideFooter(slide);
}

/**
 * Generate key findings based on diagnostic data
 */
function generateKeyFindings(diagnosticData: DiagnosticSessionData): string[] {
  const findings: string[] = [];
  const tool1 = diagnosticData.tool1 || {};
  const tool2Results = diagnosticData.tool2?.results || {};
  const tool3 = diagnosticData.tool3 || {};
  const tool6 = diagnosticData.tool6 || {};
  const tool7 = diagnosticData.tool7 || {};

  if ((tool7.alignmentTaxPercent || 0) > 10) {
    findings.push(`Alignment tax represents ${formatPercent(tool7.alignmentTaxPercent || 0)} of annual revenue`);
  }

  if ((tool2Results.wastedCost || 0) > 50000) {
    findings.push(`Meeting inefficiency costs ${formatCurrency(tool2Results.wastedCost || 0)} annually`);
  }

  if ((tool1.compositeScore || 0) < 70) {
    findings.push(`Overall alignment score of ${tool1.compositeScore || 0}/100 indicates improvement opportunities`);
  }

  const antiPatterns = (tool6.antiPatterns || []) as unknown[];
  if (antiPatterns.length > 2) {
    findings.push(`${antiPatterns.length} communication anti-patterns identified requiring attention`);
  }

  // Ensure at least 3 findings
  while (findings.length < 3) {
    findings.push('Targeted interventions can yield significant ROI within 90 days');
  }

  return findings.slice(0, 4);
}

/**
 * Add Tool 1: Organizational Alignment slide
 */
function addTool1Slide(
  pptx: InstanceType<typeof import('pptxgenjs').default>,
  tool1: DiagnosticSessionData['tool1']
): void {
  const slide = pptx.addSlide();

  slide.addText('Tool 1: Organizational Alignment', {
    ...CONTENT_SLIDE_STYLE.title,
  });

  const scores = tool1?.scores || {};
  const compositeScore = tool1?.compositeScore || 0;

  // Composite score highlight
  addMetricBox(slide, 0.5, 1.0, 3.0, 1.5, 'Composite Score', formatScore(compositeScore), true);

  // Dimension scores
  const dimensions = [
    { label: 'Strategic', score: scores.strategic || 0 },
    { label: 'Execution', score: scores.execution || 0 },
    { label: 'Technology', score: scores.technology || 0 },
    { label: 'People', score: scores.people || 0 },
    { label: 'Governance', score: scores.governance || 0 },
  ];

  let yPos = 1.1;
  dimensions.forEach((dim) => {
    addScoreIndicator(slide, 4.0, yPos, dim.label, dim.score);
    yPos += 0.85;
  });

  // Interpretation
  slide.addText(`Status: ${getScoreInterpretation(compositeScore)}`, {
    x: 0.5,
    y: 2.6,
    w: 3.0,
    h: 0.5,
    fontSize: FONT_SIZES.body,
    fontFace: FONTS.body,
    color: getScoreColor(compositeScore),
    bold: true,
  });

  addSlideFooter(slide);
}

/**
 * Add Tool 2: Meeting Audit slide
 */
function addTool2Slide(
  pptx: InstanceType<typeof import('pptxgenjs').default>,
  tool2: DiagnosticSessionData['tool2']
): void {
  const slide = pptx.addSlide();

  slide.addText('Tool 2: Meeting Cost Analysis', {
    ...CONTENT_SLIDE_STYLE.title,
  });

  const results = tool2?.results || {};
  const inputs = tool2?.inputs || {};

  // Metrics row
  addMetricsRow(slide, 1.0, [
    { label: 'Total Cost', value: formatCurrency(results.totalMeetingCost || 0) },
    { label: 'Wasted Cost', value: formatCurrency(results.wastedCost || 0), highlight: true },
    { label: 'Effective Cost', value: formatCurrency(results.effectiveCost || 0) },
    { label: 'Meetings Analyzed', value: String(inputs.meetingCount || 0) },
  ]);

  // Cost breakdown chart
  const chartData = [
    { label: 'Wasted', value: results.wastedCost || 0 },
    { label: 'Effective', value: results.effectiveCost || 0 },
  ];

  if (chartData.some(d => d.value > 0)) {
    addDonutChart(slide, 'Meeting Cost Distribution', chartData, 0.5, 2.5, 4.0, 2.5);
  }

  // Key insights
  slide.addText([
    { text: 'Key Insights:', options: { bold: true } },
  ], {
    x: 5.0,
    y: 2.1,
    w: 4.5,
    h: 0.4,
    fontSize: FONT_SIZES.body,
    fontFace: FONTS.body,
    color: PPTX_COLORS.navy,
  });

  const wastePercent = results.totalMeetingCost
    ? ((results.wastedCost || 0) / results.totalMeetingCost * 100)
    : 0;

  slide.addText([
    { text: `• ${formatPercent(wastePercent)} of meeting time is unproductive`, options: { bullet: false } },
    { text: `• ${results.wastedHours || 0} hours wasted annually`, options: { bullet: false } },
    { text: `• Average meeting has ${inputs.averageAttendees || 0} attendees`, options: { bullet: false } },
  ], {
    x: 5.0,
    y: 2.5,
    w: 4.5,
    h: 2.0,
    fontSize: FONT_SIZES.body,
    fontFace: FONTS.body,
    color: PPTX_COLORS.slate,
    paraSpaceAfter: 8,
  });

  addSlideFooter(slide);
}

/**
 * Add Tool 3: Decision Velocity slide
 */
function addTool3Slide(
  pptx: InstanceType<typeof import('pptxgenjs').default>,
  tool3: DiagnosticSessionData['tool3']
): void {
  const slide = pptx.addSlide();

  slide.addText('Tool 3: Decision Velocity', {
    ...CONTENT_SLIDE_STYLE.title,
  });

  const metrics = (tool3?.metrics || {}) as Record<string, number>;
  const decisions = (tool3?.decisions || []) as Array<{ archetype?: string; medianDays?: number; p90Days?: number }>;

  // Metrics row
  addMetricsRow(slide, 1.0, [
    { label: 'Median Time', value: `${metrics.overallMedian || 0} days` },
    { label: 'P90 Time', value: `${metrics.overallP90 || 0} days`, highlight: true },
    { label: 'Decisions', value: String(decisions.length) },
    { label: 'Status', value: (metrics.overallMedian || 0) > 14 ? 'Slow' : 'Normal' },
  ]);

  // Decision types table
  if (decisions.length > 0) {
    addTable(
      slide,
      ['Decision Type', 'Median (days)', 'P90 (days)'],
      decisions.slice(0, 5).map((d) => [
        d.archetype || 'Unknown',
        String(d.medianDays || 0),
        String(d.p90Days || 0),
      ]),
      0.5,
      2.2,
      9.0
    );
  }

  addSlideFooter(slide);
}

/**
 * Add Tool 4: Stakeholder Map slide
 */
function addTool4Slide(
  pptx: InstanceType<typeof import('pptxgenjs').default>,
  tool4: DiagnosticSessionData['tool4']
): void {
  const slide = pptx.addSlide();

  slide.addText('Tool 4: Stakeholder Alignment', {
    ...CONTENT_SLIDE_STYLE.title,
  });

  const stakeholders = (tool4?.stakeholders || []) as Array<{ name?: string; power?: number; interest?: number; sentiment?: string }>;

  // Stakeholder count
  addMetricBox(slide, 0.5, 1.0, 2.5, 1.2, 'Total Stakeholders', String(stakeholders.length));

  // Sentiment breakdown
  const champions = stakeholders.filter(s => s.sentiment === 'champion').length;
  const neutrals = stakeholders.filter(s => s.sentiment === 'neutral').length;
  const blockers = stakeholders.filter(s => s.sentiment === 'blocker').length;

  addMetricBox(slide, 3.2, 1.0, 2.0, 1.2, 'Champions', String(champions));
  addMetricBox(slide, 5.4, 1.0, 2.0, 1.2, 'Neutral', String(neutrals));
  addMetricBox(slide, 7.6, 1.0, 2.0, 1.2, 'Blockers', String(blockers));

  // Stakeholder table
  if (stakeholders.length > 0) {
    addTable(
      slide,
      ['Stakeholder', 'Power', 'Interest', 'Sentiment'],
      stakeholders.slice(0, 6).map((s) => [
        s.name || 'Unknown',
        String(s.power || 0),
        String(s.interest || 0),
        (s.sentiment || 'unknown').charAt(0).toUpperCase() + (s.sentiment || 'unknown').slice(1),
      ]),
      0.5,
      2.5,
      9.0
    );
  }

  addSlideFooter(slide);
}

/**
 * Add Tool 5: Data Flow slide
 */
function addTool5Slide(
  pptx: InstanceType<typeof import('pptxgenjs').default>,
  tool5: DiagnosticSessionData['tool5']
): void {
  const slide = pptx.addSlide();

  slide.addText('Tool 5: Data Flow Friction', {
    ...CONTENT_SLIDE_STYLE.title,
  });

  const journeys = (tool5?.journeys || []) as Array<{ name?: string; frictionPoints?: number }>;
  const frictionCost = tool5?.frictionCost || 0;

  // Key metrics
  addMetricsRow(slide, 1.0, [
    { label: 'Friction Cost', value: formatCurrency(frictionCost), highlight: true },
    { label: 'Journeys Analyzed', value: String(journeys.length) },
    { label: 'Total Friction Points', value: String(journeys.reduce((sum, j) => sum + (j.frictionPoints || 0), 0)) },
    { label: 'Status', value: frictionCost > 50000 ? 'High' : 'Normal' },
  ]);

  // Journey table
  if (journeys.length > 0) {
    addTable(
      slide,
      ['Data Journey', 'Friction Points'],
      journeys.slice(0, 6).map((j) => [
        j.name || 'Unknown',
        String(j.frictionPoints || 0),
      ]),
      0.5,
      2.2,
      6.0
    );
  }

  addSlideFooter(slide);
}

/**
 * Add Tool 6: Communication Health slide
 */
function addTool6Slide(
  pptx: InstanceType<typeof import('pptxgenjs').default>,
  tool6: DiagnosticSessionData['tool6']
): void {
  const slide = pptx.addSlide();

  slide.addText('Tool 6: Communication Health', {
    ...CONTENT_SLIDE_STYLE.title,
  });

  const metrics = (tool6?.metrics || {}) as Record<string, number>;
  const antiPatterns = (tool6?.antiPatterns || []) as string[];
  const healthScore = metrics.healthScore || 0;

  // Health score highlight
  addMetricBox(slide, 0.5, 1.0, 3.0, 1.5, 'Health Score', formatScore(healthScore), true);

  // Score indicator
  slide.addText(`Status: ${getScoreInterpretation(healthScore)}`, {
    x: 0.5,
    y: 2.6,
    w: 3.0,
    h: 0.5,
    fontSize: FONT_SIZES.body,
    fontFace: FONTS.body,
    color: getScoreColor(healthScore),
    bold: true,
  });

  // Anti-patterns
  if (antiPatterns.length > 0) {
    slide.addText('Anti-Patterns Detected:', {
      x: 4.0,
      y: 1.0,
      w: 5.5,
      h: 0.4,
      fontSize: FONT_SIZES.body,
      fontFace: FONTS.body,
      color: PPTX_COLORS.navy,
      bold: true,
    });

    slide.addText(antiPatterns.slice(0, 5).map(p => ({ text: p, options: { bullet: { type: 'bullet' as const } } })), {
      x: 4.0,
      y: 1.5,
      w: 5.5,
      h: 2.5,
      fontSize: FONT_SIZES.body,
      fontFace: FONTS.body,
      color: PPTX_COLORS.red,
      paraSpaceAfter: 8,
    });
  }

  addSlideFooter(slide);
}

/**
 * Add Tool 7: Total Cost slide
 */
function addTool7Slide(
  pptx: InstanceType<typeof import('pptxgenjs').default>,
  tool7: DiagnosticSessionData['tool7']
): void {
  const slide = pptx.addSlide();

  slide.addText('Tool 7: Total Cost of Misalignment', {
    ...CONTENT_SLIDE_STYLE.title,
  });

  const totalCost = tool7?.totalCost || 0;
  const alignmentTaxPercent = tool7?.alignmentTaxPercent || 0;

  // Highlight box
  addMetricBox(slide, 2.5, 1.0, 5.0, 2.0, 'Total Alignment Tax', formatCurrency(totalCost), true);

  // Percentage
  slide.addText(`${formatPercent(alignmentTaxPercent)} of Annual Revenue`, {
    x: 2.5,
    y: 3.1,
    w: 5.0,
    h: 0.5,
    fontSize: FONT_SIZES.subheading,
    fontFace: FONTS.body,
    color: PPTX_COLORS.gold,
    bold: true,
    align: 'center',
  });

  // Impact description
  slide.addText([
    { text: 'This represents the annual cost of organizational misalignment across:' },
  ], {
    x: 0.5,
    y: 3.8,
    w: 9.0,
    h: 0.4,
    fontSize: FONT_SIZES.body,
    fontFace: FONTS.body,
    color: PPTX_COLORS.slate,
  });

  slide.addText([
    { text: '• Meeting inefficiency and waste', options: { bullet: false } },
    { text: '• Delayed decisions and bottlenecks', options: { bullet: false } },
    { text: '• Data friction and manual handoffs', options: { bullet: false } },
    { text: '• Communication overhead and anti-patterns', options: { bullet: false } },
  ], {
    x: 0.5,
    y: 4.2,
    w: 9.0,
    h: 1.2,
    fontSize: FONT_SIZES.body,
    fontFace: FONTS.body,
    color: PPTX_COLORS.slate,
    paraSpaceAfter: 4,
  });

  addSlideFooter(slide);
}

/**
 * Add Priority Recommendations slide
 */
function addPriorityRecommendationsSlide(
  pptx: InstanceType<typeof import('pptxgenjs').default>,
  diagnosticData: DiagnosticSessionData
): void {
  const recommendations = generateRecommendations(diagnosticData);

  addBulletSlide(pptx, 'Top 5 Priority Recommendations', recommendations);
}

/**
 * Generate recommendations based on diagnostic data
 */
function generateRecommendations(diagnosticData: DiagnosticSessionData): string[] {
  const recommendations: string[] = [];
  const tool2Results = diagnosticData.tool2?.results || {};
  const tool3 = diagnosticData.tool3 || {};
  const tool6 = diagnosticData.tool6 || {};

  if ((tool2Results.wastedCost || 0) > 50000) {
    recommendations.push('Implement meeting effectiveness protocols to reduce waste by 30%+');
  }

  const tool3Metrics = (tool3.metrics || {}) as Record<string, number>;
  if ((tool3Metrics.overallMedian || 0) > 7) {
    recommendations.push('Clarify decision authority using RAPID framework');
  }

  const antiPatterns = (tool6.antiPatterns || []) as unknown[];
  if (antiPatterns.length > 0) {
    recommendations.push('Address communication anti-patterns with structured guidelines');
  }

  recommendations.push('Establish cross-functional alignment cadences');
  recommendations.push('Deploy tracking metrics for ongoing improvement');

  return recommendations.slice(0, 5);
}

/**
 * Add Implementation Roadmap slide
 */
function addImplementationRoadmapSlide(
  pptx: InstanceType<typeof import('pptxgenjs').default>
): void {
  const slide = pptx.addSlide();

  slide.addText('Implementation Roadmap', {
    ...CONTENT_SLIDE_STYLE.title,
  });

  // Timeline phases
  const phases = [
    { phase: 'Days 1-30', title: 'Foundation', items: ['Quick wins', 'Stakeholder alignment', 'Metrics baseline'] },
    { phase: 'Days 31-60', title: 'Adoption', items: ['Process changes', 'Training rollout', 'Tool deployment'] },
    { phase: 'Days 61-90', title: 'Optimization', items: ['Performance review', 'Refinements', 'Sustainability'] },
  ];

  const phaseWidth = 3.0;
  let xPos = 0.5;

  phases.forEach((phase) => {
    // Phase header
    slide.addShape('rect', {
      x: xPos,
      y: 1.0,
      w: phaseWidth - 0.1,
      h: 0.6,
      fill: { color: PPTX_COLORS.navy },
    });

    slide.addText(phase.phase, {
      x: xPos,
      y: 1.0,
      w: phaseWidth - 0.1,
      h: 0.6,
      fontSize: FONT_SIZES.small,
      fontFace: FONTS.body,
      color: PPTX_COLORS.white,
      bold: true,
      align: 'center',
      valign: 'middle',
    });

    // Phase title
    slide.addText(phase.title, {
      x: xPos,
      y: 1.7,
      w: phaseWidth - 0.1,
      h: 0.5,
      fontSize: FONT_SIZES.body,
      fontFace: FONTS.heading,
      color: PPTX_COLORS.gold,
      bold: true,
      align: 'center',
    });

    // Phase items
    slide.addText(phase.items.map(i => ({ text: i, options: { bullet: { type: 'bullet' as const } } })), {
      x: xPos,
      y: 2.2,
      w: phaseWidth - 0.1,
      h: 2.5,
      fontSize: FONT_SIZES.small,
      fontFace: FONTS.body,
      color: PPTX_COLORS.slate,
      paraSpaceAfter: 6,
    });

    xPos += phaseWidth;
  });

  addSlideFooter(slide);
}

/**
 * Add ROI Projection slide
 */
function addROIProjectionSlide(
  pptx: InstanceType<typeof import('pptxgenjs').default>,
  diagnosticData: DiagnosticSessionData
): void {
  const slide = pptx.addSlide();

  slide.addText('ROI Projection', {
    ...CONTENT_SLIDE_STYLE.title,
  });

  const tool7 = diagnosticData.tool7 || {};
  const totalCost = tool7.totalCost || 0;

  // Projected savings table
  const savingsData = [
    ['10% Reduction (Conservative)', formatCurrency(totalCost * 0.1), '6 months'],
    ['25% Reduction (Moderate)', formatCurrency(totalCost * 0.25), '9 months'],
    ['40% Reduction (Aggressive)', formatCurrency(totalCost * 0.4), '12 months'],
  ];

  addTable(
    slide,
    ['Scenario', 'Annual Savings', 'Payback Period'],
    savingsData,
    0.5,
    1.2,
    9.0
  );

  // Key message
  slide.addText([
    { text: 'Investment Recommendation:', options: { bold: true } },
  ], {
    x: 0.5,
    y: 3.0,
    w: 9.0,
    h: 0.4,
    fontSize: FONT_SIZES.body,
    fontFace: FONTS.body,
    color: PPTX_COLORS.navy,
  });

  slide.addText(`A moderate improvement effort targeting 25% reduction could save ${formatCurrency(totalCost * 0.25)} annually with typical payback within 9 months.`, {
    x: 0.5,
    y: 3.4,
    w: 9.0,
    h: 1.0,
    fontSize: FONT_SIZES.body,
    fontFace: FONTS.body,
    color: PPTX_COLORS.slate,
  });

  addSlideFooter(slide);
}

/**
 * Add Next Steps slide
 */
function addNextStepsSlide(
  pptx: InstanceType<typeof import('pptxgenjs').default>
): void {
  const nextSteps = [
    'Review this presentation with key stakeholders',
    'Prioritize 2-3 quick wins for immediate action',
    'Assign owners for each recommended initiative',
    'Establish baseline metrics and tracking cadence',
    'Schedule 30-day progress review',
  ];

  addBulletSlide(pptx, 'Recommended Next Steps', nextSteps);
}
