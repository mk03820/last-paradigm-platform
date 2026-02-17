/**
 * Strategic Alignment Brief Generator
 *
 * Generates a comprehensive Word document summarizing all diagnostic findings
 * with executive summary, tool-by-tool analysis, and priority recommendations.
 *
 * Story 18.2: Word Document Templates & Generation
 * Task 2: Create Strategic Alignment Brief generator
 * Covers: AC2, AC7, FR65 (Book attribution)
 */

import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import type { DiagnosticSessionData } from '@/lib/db/schema';
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
  createKeyValue,
  createPageBreak,
  formatCurrency,
  formatPercent,
  formatScore,
} from './components';
import {
  PAGE_MARGINS,
  DOCUMENT_STYLES,
  BRAND_COLORS,
  getScoreColor,
  getScoreInterpretation,
} from './styles';
import type { GenerationResult } from './types';

/**
 * Generate the Strategic Alignment Brief document
 */
export async function generateStrategicAlignmentBrief(
  diagnosticData: DiagnosticSessionData
): Promise<GenerationResult> {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: DOCUMENT_STYLES.body.font,
            size: DOCUMENT_STYLES.body.size,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: { margin: PAGE_MARGINS },
        },
        headers: {
          default: createBrandedHeader('Strategic Alignment Brief'),
        },
        footers: {
          default: createBrandedFooter(),
        },
        children: [
          // Cover Page
          ...createCoverPage(
            'Strategic Alignment Brief',
            'Comprehensive Organizational Alignment Assessment'
          ),

          // Executive Summary
          ...createExecutiveSummary(diagnosticData),

          // Tool-by-tool findings
          ...createTool1Section(diagnosticData.tool1),
          ...createTool2Section(diagnosticData.tool2),
          ...createTool3Section(diagnosticData.tool3),
          ...createTool4Section(diagnosticData.tool4),
          ...createTool5Section(diagnosticData.tool5),
          ...createTool6Section(diagnosticData.tool6),
          ...createTool7Section(diagnosticData.tool7),

          // Priority Recommendations
          createPageBreak(),
          ...createPriorityRecommendations(diagnosticData),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  return {
    buffer: Buffer.from(buffer),
    fileSizeBytes: buffer.byteLength,
  };
}

/**
 * Create Executive Summary section
 */
function createExecutiveSummary(data: DiagnosticSessionData): Paragraph[] {
  const totalCost = data.tool7?.totalCost || 0;
  const alignmentTaxPercent = data.tool7?.alignmentTaxPercent || 0;
  const compositeScore = data.tool1?.compositeScore || 0;
  const interpretation = data.tool7?.interpretation || 'unknown';

  const paragraphs: Paragraph[] = [
    createSectionTitle('Executive Summary'),
    new Paragraph({
      children: [
        new TextRun({
          text: 'This Strategic Alignment Brief presents a comprehensive analysis of your organization\'s alignment across seven key dimensions. The findings reveal actionable insights to reduce your alignment tax and improve organizational effectiveness.',
          ...DOCUMENT_STYLES.body,
        }),
      ],
      spacing: { after: 200 },
    }),
    createSubsectionTitle('Key Findings'),
    ...createHighlightMetric(
      'Total Alignment Tax',
      formatCurrency(totalCost),
      `This represents approximately ${formatPercent(alignmentTaxPercent)} of annual revenue lost to organizational misalignment.`
    ),
    createKeyValue(
      'Overall Alignment Score',
      formatScore(compositeScore),
      getScoreColor(compositeScore)
    ),
    createKeyValue(
      'Status Assessment',
      getInterpretationLabel(interpretation),
      getInterpretationColor(interpretation)
    ),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];

  // Add quick stats table
  paragraphs.push(
    createSubsectionTitle('Assessment Overview'),
    createDataTable(
      ['Metric', 'Value', 'Status'],
      [
        [
          'Alignment Score',
          formatScore(compositeScore),
          getScoreInterpretation(compositeScore),
        ],
        [
          'Meeting Waste',
          formatCurrency(data.tool2?.results?.wastedCost || 0),
          'Annual Cost',
        ],
        [
          'Decision Velocity',
          `${data.tool3?.overallVelocityScore || 0}/100`,
          getScoreInterpretation(data.tool3?.overallVelocityScore || 0),
        ],
        [
          'Stakeholder Risks',
          `${data.tool4?.riskCount || 0} identified`,
          data.tool4?.riskCount ? 'Action Needed' : 'Managed',
        ],
        [
          'Data Friction Cost',
          formatCurrency(data.tool5?.totalFrictionCost || 0),
          'Annual Impact',
        ],
        [
          'Communication Health',
          `${data.tool6?.healthScore || 0}/100`,
          getScoreInterpretation(data.tool6?.healthScore || 0),
        ],
      ]
    ),
    new Paragraph({ text: '', spacing: { after: 200 } })
  );

  return paragraphs;
}

/**
 * Tool 1: Organizational Alignment Assessment section
 */
function createTool1Section(tool1: DiagnosticSessionData['tool1']): Paragraph[] {
  if (!tool1) {
    return [
      createPageBreak(),
      createSectionTitle('1. Organizational Alignment Assessment'),
      createBodyParagraph('No alignment assessment data available.'),
    ];
  }

  const dimensions = tool1.dimensions || {};
  const dimensionRows = [
    ['Strategic Alignment', formatScore(dimensions.strategic || 0), getScoreInterpretation(dimensions.strategic || 0)],
    ['Structural Alignment', formatScore(dimensions.structural || 0), getScoreInterpretation(dimensions.structural || 0)],
    ['Process Alignment', formatScore(dimensions.processAlignment || 0), getScoreInterpretation(dimensions.processAlignment || 0)],
    ['Cultural Alignment', formatScore(dimensions.cultural || 0), getScoreInterpretation(dimensions.cultural || 0)],
    ['Technological Alignment', formatScore(dimensions.technological || 0), getScoreInterpretation(dimensions.technological || 0)],
  ];

  return [
    createPageBreak(),
    createSectionTitle('1. Organizational Alignment Assessment'),
    ...createHighlightMetric(
      'Composite Alignment Score',
      formatScore(tool1.compositeScore || 0),
      tool1.interpretation || 'Assessment complete.'
    ),
    createSubsectionTitle('Dimension Breakdown'),
    createDataTable(['Dimension', 'Score', 'Status'], dimensionRows),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

/**
 * Tool 2: Meeting Audit section
 */
function createTool2Section(tool2: DiagnosticSessionData['tool2']): Paragraph[] {
  if (!tool2?.results) {
    return [
      createPageBreak(),
      createSectionTitle('2. Meeting Waste Analysis'),
      createBodyParagraph('No meeting audit data available.'),
    ];
  }

  const results = tool2.results;

  return [
    createPageBreak(),
    createSectionTitle('2. Meeting Waste Analysis'),
    ...createHighlightMetric(
      'Annual Meeting Waste',
      formatCurrency(results.wastedCost || 0),
      `Based on ${results.totalMeetings || 0} meetings analyzed with an average of ${results.avgAttendees || 0} attendees.`
    ),
    createSubsectionTitle('Key Metrics'),
    createKeyValue('Wasted Hours', `${results.wastedHours?.toLocaleString() || 0} hours/year`),
    createKeyValue('Inefficiency Rate', formatPercent(results.inefficiencyPercent || 0)),
    createKeyValue('Average Meeting Duration', `${results.avgDuration || 0} minutes`),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

/**
 * Tool 3: Decision Velocity section
 */
function createTool3Section(tool3: DiagnosticSessionData['tool3']): Paragraph[] {
  if (!tool3) {
    return [
      createPageBreak(),
      createSectionTitle('3. Decision Velocity Analysis'),
      createBodyParagraph('No decision velocity data available.'),
    ];
  }

  const archetypes = tool3.archetypes || {};
  const archetypeRows = Object.entries(archetypes).map(([type, data]) => [
    type.charAt(0).toUpperCase() + type.slice(1),
    `${data?.median || 0} days`,
    `${data?.p90 || 0} days`,
    `${data?.samples || 0}`,
  ]);

  const bottleneckItems = (tool3.bottlenecks || [])
    .map(b => `${b.pattern} (${b.severity}): ${b.description}`);

  const paragraphs: Paragraph[] = [
    createPageBreak(),
    createSectionTitle('3. Decision Velocity Analysis'),
    ...createHighlightMetric(
      'Overall Velocity Score',
      formatScore(tool3.overallVelocityScore || 0)
    ),
    createSubsectionTitle('Decision Latency by Type'),
    createDataTable(['Decision Type', 'Median', '90th Percentile', 'Samples'], archetypeRows),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];

  if (bottleneckItems.length > 0) {
    paragraphs.push(
      createSubsectionTitle('Identified Bottlenecks'),
      ...createBulletList(bottleneckItems)
    );
  }

  return paragraphs;
}

/**
 * Tool 4: Stakeholder Mapping section
 */
function createTool4Section(tool4: DiagnosticSessionData['tool4']): Paragraph[] {
  if (!tool4) {
    return [
      createPageBreak(),
      createSectionTitle('4. Stakeholder Analysis'),
      createBodyParagraph('No stakeholder mapping data available.'),
    ];
  }

  const summary = tool4.quadrantSummary || {};

  return [
    createPageBreak(),
    createSectionTitle('4. Stakeholder Analysis'),
    createBodyParagraph(
      `${tool4.stakeholders?.length || 0} stakeholders mapped across the power/interest matrix.`
    ),
    createSubsectionTitle('Quadrant Distribution'),
    createDataTable(
      ['Quadrant', 'Count', 'Strategy'],
      [
        ['Manage Closely (High Power/High Interest)', `${summary.manageClosely || 0}`, 'Engage deeply, regular communication'],
        ['Keep Satisfied (High Power/Low Interest)', `${summary.keepSatisfied || 0}`, 'Keep informed, minimal effort'],
        ['Keep Informed (Low Power/High Interest)', `${summary.keepInformed || 0}`, 'Regular updates, build support'],
        ['Monitor (Low Power/Low Interest)', `${summary.monitor || 0}`, 'Minimal monitoring'],
      ]
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createKeyValue('Risk Indicators', `${tool4.riskCount || 0} potential risks identified`, BRAND_COLORS.amber),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

/**
 * Tool 5: Data Flow Friction section
 */
function createTool5Section(tool5: DiagnosticSessionData['tool5']): Paragraph[] {
  if (!tool5) {
    return [
      createPageBreak(),
      createSectionTitle('5. Data Flow Friction Analysis'),
      createBodyParagraph('No data flow analysis available.'),
    ];
  }

  const byCategory = tool5.frictionByCategory || {};

  return [
    createPageBreak(),
    createSectionTitle('5. Data Flow Friction Analysis'),
    ...createHighlightMetric(
      'Total Friction Cost',
      formatCurrency(tool5.totalFrictionCost || 0),
      `Analysis of ${tool5.journeys?.length || 0} data journeys.`
    ),
    createSubsectionTitle('Friction by Category'),
    createDataTable(
      ['Category', 'Annual Cost', 'Description'],
      [
        ['Manual Processes', formatCurrency(byCategory.manual || 0), 'Time spent on manual data handling'],
        ['Delays', formatCurrency(byCategory.delay || 0), 'Cost of data availability delays'],
        ['Quality Issues', formatCurrency(byCategory.quality || 0), 'Rework due to data quality problems'],
        ['Access Barriers', formatCurrency(byCategory.access || 0), 'Productivity loss from access issues'],
      ]
    ),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

/**
 * Tool 6: Communication Pattern section
 */
function createTool6Section(tool6: DiagnosticSessionData['tool6']): Paragraph[] {
  if (!tool6) {
    return [
      createPageBreak(),
      createSectionTitle('6. Communication Pattern Analysis'),
      createBodyParagraph('No communication analysis available.'),
    ];
  }

  const metrics = tool6.metrics || {};
  const antiPatterns = tool6.antiPatterns || [];

  const paragraphs: Paragraph[] = [
    createPageBreak(),
    createSectionTitle('6. Communication Pattern Analysis'),
    ...createHighlightMetric(
      'Communication Health Score',
      formatScore(tool6.healthScore || 0)
    ),
    createSubsectionTitle('Current Metrics'),
    createKeyValue('Daily Emails', `${metrics.emailsPerDay || 0}`),
    createKeyValue('Daily Messages (Slack/Teams)', `${metrics.slackMessagesPerDay || 0}`),
    createKeyValue('Weekly Meeting Hours', `${metrics.meetingHoursPerWeek || 0}`),
    createKeyValue('After-Hours Communication', formatPercent(metrics.afterHoursPercent || 0)),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];

  if (antiPatterns.length > 0) {
    paragraphs.push(
      createSubsectionTitle('Detected Anti-Patterns'),
      createDataTable(
        ['Pattern', 'Severity', 'Recommendation'],
        antiPatterns.map(ap => [ap.pattern, ap.severity.toUpperCase(), ap.recommendation])
      ),
      new Paragraph({ text: '', spacing: { after: 200 } })
    );
  }

  return paragraphs;
}

/**
 * Tool 7: Total Cost section
 */
function createTool7Section(tool7: DiagnosticSessionData['tool7']): Paragraph[] {
  if (!tool7) {
    return [
      createPageBreak(),
      createSectionTitle('7. Total Cost of Misalignment'),
      createBodyParagraph('No total cost data available.'),
    ];
  }

  const breakdown = tool7.costBreakdown || {};
  const roi = tool7.roiProjection;

  const paragraphs: Paragraph[] = [
    createPageBreak(),
    createSectionTitle('7. Total Cost of Misalignment'),
    ...createHighlightMetric(
      'Total Alignment Tax',
      formatCurrency(tool7.totalCost || 0),
      `This represents ${formatPercent(tool7.alignmentTaxPercent || 0)} of annual revenue.`
    ),
    createSubsectionTitle('Cost Breakdown'),
    createDataTable(
      ['Category', 'Annual Cost', '% of Total'],
      [
        ['Meeting Waste', formatCurrency(breakdown.meetingWaste || 0), getPercent(breakdown.meetingWaste, tool7.totalCost)],
        ['Decision Delays', formatCurrency(breakdown.decisionDelay || 0), getPercent(breakdown.decisionDelay, tool7.totalCost)],
        ['Communication Overhead', formatCurrency(breakdown.communicationOverhead || 0), getPercent(breakdown.communicationOverhead, tool7.totalCost)],
        ['Data Friction', formatCurrency(breakdown.frictionCost || 0), getPercent(breakdown.frictionCost, tool7.totalCost)],
        ['Project Delays', formatCurrency(breakdown.projectDelays || 0), getPercent(breakdown.projectDelays, tool7.totalCost)],
        ['Rework', formatCurrency(breakdown.rework || 0), getPercent(breakdown.rework, tool7.totalCost)],
        ['Turnover', formatCurrency(breakdown.turnover || 0), getPercent(breakdown.turnover, tool7.totalCost)],
        ['Opportunity Cost', formatCurrency(breakdown.opportunityCost || 0), getPercent(breakdown.opportunityCost, tool7.totalCost)],
      ]
    ),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];

  if (roi) {
    paragraphs.push(
      createSubsectionTitle('ROI Projection'),
      createDataTable(
        ['Scenario', 'Annual Savings', 'Payback Period'],
        [
          ['Conservative', formatCurrency(roi.conservative || 0), `${roi.paybackMonths || 0} months`],
          ['Moderate', formatCurrency(roi.moderate || 0), `${Math.round((roi.paybackMonths || 0) * 0.75)} months`],
          ['Aggressive', formatCurrency(roi.aggressive || 0), `${Math.round((roi.paybackMonths || 0) * 0.5)} months`],
        ]
      ),
      new Paragraph({ text: '', spacing: { after: 200 } })
    );
  }

  return paragraphs;
}

/**
 * Create Priority Recommendations section
 */
function createPriorityRecommendations(data: DiagnosticSessionData): Paragraph[] {
  const recommendations = generateRecommendations(data);

  return [
    createSectionTitle('Priority Recommendations'),
    createBodyParagraph(
      'Based on your diagnostic results, the following actions are recommended in order of potential impact:'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    ...recommendations.map((rec, index) =>
      new Paragraph({
        children: [
          new TextRun({
            text: `${index + 1}. ${rec.title}`,
            ...DOCUMENT_STYLES.heading3,
          }),
        ],
        spacing: { before: 150, after: 50 },
      })
    ),
    ...recommendations.flatMap((rec, index) => [
      createBodyParagraph(rec.description),
      createKeyValue('Expected Impact', rec.impact),
      createKeyValue('Timeframe', rec.timeframe),
      new Paragraph({ text: '', spacing: { after: 100 } }),
    ]),
    createSubsectionTitle('Next Steps'),
    createBodyParagraph(
      'Schedule a strategic planning session with key stakeholders to prioritize these recommendations and develop an implementation roadmap. The Transformation Roadmap Planner (included in your toolkit) will help structure this process.'
    ),
  ];
}

/**
 * Generate prioritized recommendations based on data
 */
function generateRecommendations(data: DiagnosticSessionData): Array<{
  title: string;
  description: string;
  impact: string;
  timeframe: string;
}> {
  const recommendations: Array<{
    title: string;
    description: string;
    impact: string;
    timeframe: string;
    priority: number;
  }> = [];

  // Analyze alignment score
  const alignmentScore = data.tool1?.compositeScore || 100;
  if (alignmentScore < 60) {
    recommendations.push({
      title: 'Address Strategic Alignment Gaps',
      description: 'Your alignment score indicates significant gaps between strategy and execution. Focus on clarifying strategic priorities and ensuring all teams understand how their work connects to organizational goals.',
      impact: 'High - Foundation for all other improvements',
      timeframe: '30-60 days for initial assessment',
      priority: 1,
    });
  }

  // Analyze meeting waste
  const meetingWaste = data.tool2?.results?.wastedCost || 0;
  if (meetingWaste > 100000) {
    recommendations.push({
      title: 'Implement Meeting Efficiency Protocols',
      description: `Your organization is losing ${formatCurrency(meetingWaste)} annually to meeting inefficiency. Implement the meeting protocols outlined in The Last Paradigm to reduce unnecessary meetings and improve those that remain.`,
      impact: `Potential savings: ${formatCurrency(meetingWaste * 0.3)} annually`,
      timeframe: '2-4 weeks to implement',
      priority: 2,
    });
  }

  // Analyze decision velocity
  if ((data.tool3?.overallVelocityScore || 100) < 50) {
    recommendations.push({
      title: 'Streamline Decision-Making Processes',
      description: 'Decision velocity is below optimal levels. Use the Decision Framework Guide to establish clear decision rights and escalation paths.',
      impact: 'Medium - Faster decisions lead to faster execution',
      timeframe: '4-6 weeks to implement',
      priority: 3,
    });
  }

  // Analyze stakeholder risks
  if ((data.tool4?.riskCount || 0) > 2) {
    recommendations.push({
      title: 'Execute Stakeholder Engagement Plan',
      description: 'Multiple stakeholder risks have been identified. Use the Stakeholder Communication Pack to develop targeted engagement strategies.',
      impact: 'Medium - Risk mitigation and change enablement',
      timeframe: 'Ongoing engagement',
      priority: 4,
    });
  }

  // Analyze communication health
  if ((data.tool6?.healthScore || 100) < 60) {
    recommendations.push({
      title: 'Address Communication Anti-Patterns',
      description: 'Communication health score indicates problematic patterns. Implement the recommendations from the Communication Improvement Playbook.',
      impact: 'Medium - Improved productivity and reduced burnout',
      timeframe: '30-90 days for behavior change',
      priority: 5,
    });
  }

  // Sort by priority and return top 5
  return recommendations
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5)
    .map(({ priority, ...rec }) => rec);
}

// Helper functions
function getPercent(value: number | undefined, total: number | undefined): string {
  if (!value || !total || total === 0) return '0%';
  return formatPercent((value / total) * 100);
}

function getInterpretationLabel(interpretation: string): string {
  const labels: Record<string, string> = {
    normal: 'Normal - Typical organizational friction',
    significant: 'Significant - Above-average alignment costs',
    crisis: 'Crisis Level - Urgent attention required',
    existential: 'Existential - Organization at risk',
  };
  return labels[interpretation] || interpretation;
}

function getInterpretationColor(interpretation: string): string {
  const colors: Record<string, string> = {
    normal: BRAND_COLORS.green,
    significant: BRAND_COLORS.amber,
    crisis: BRAND_COLORS.gold,
    existential: BRAND_COLORS.red,
  };
  return colors[interpretation] || BRAND_COLORS.slate;
}
