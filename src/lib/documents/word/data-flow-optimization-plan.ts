/**
 * Data Flow Optimization Plan Generator
 *
 * Generates a Word document with journey friction maps, latency analysis,
 * and improvement recommendations based on Tool 5 data.
 *
 * Story 18.2: Word Document Templates & Generation
 * Task 5: Create Data Flow Optimization Plan generator
 * Covers: AC5, AC7, FR65 (Book attribution)
 */

import { Document, Packer, Paragraph, TextRun, Table } from 'docx';
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
} from './components';
import { PAGE_MARGINS, DOCUMENT_STYLES, BRAND_COLORS } from './styles';
import type { GenerationResult } from './types';

// Local types for Tool 5 data structures
interface FrictionPoint {
  severity: number;
  stageIndex: number;
  category?: string;
  description?: string;
}

interface JourneyStage {
  name: string;
}

interface Journey {
  name: string;
  stages?: JourneyStage[];
  frictionPoints?: FrictionPoint[];
}

/**
 * Generate the Data Flow Optimization Plan document
 */
export async function generateDataFlowOptimizationPlan(
  diagnosticData: DiagnosticSessionData
): Promise<GenerationResult> {
  const tool5 = diagnosticData.tool5;

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
          default: createBrandedHeader('Data Flow Optimization Plan'),
        },
        footers: {
          default: createBrandedFooter(),
        },
        children: [
          // Cover Page
          ...createCoverPage(
            'Data Flow Optimization Plan',
            'Eliminating Friction in Critical Data Journeys'
          ),

          // Executive Summary
          ...createExecutiveSummary(tool5),

          // Data Journey Overview
          ...createJourneyOverview(tool5),

          // Friction Point Analysis
          ...createFrictionAnalysis(tool5),

          // Latency Hotspots
          createPageBreak(),
          ...createLatencyHotspots(tool5),

          // Improvement Recommendations
          ...createImprovementRecommendations(tool5),

          // Implementation Roadmap
          createPageBreak(),
          ...createImplementationRoadmap(),
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

function createExecutiveSummary(tool5: DiagnosticSessionData['tool5']): (Paragraph | Table)[] {
  const totalCost = tool5?.totalFrictionCost || 0;
  const journeyCount = tool5?.journeys?.length || 0;
  const byCategory = tool5?.frictionByCategory || {};

  const totalByCategory = Object.values(byCategory).reduce((sum, val) => sum + (val || 0), 0);
  const topCategory = Object.entries(byCategory)
    .sort(([, a], [, b]) => (b || 0) - (a || 0))[0];

  return [
    createSectionTitle('Executive Summary'),
    createBodyParagraph(
      'This Data Flow Optimization Plan identifies friction points across your critical data journeys and provides a prioritized roadmap for improvement. Reducing data friction directly impacts decision speed, operational efficiency, and cost.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    ...createHighlightMetric(
      'Total Annual Friction Cost',
      formatCurrency(totalCost),
      `Across ${journeyCount} data journeys analyzed`
    ),
    createKeyValue('Journeys Analyzed', `${journeyCount}`),
    createKeyValue(
      'Largest Friction Category',
      topCategory ? `${formatCategoryName(topCategory[0])} (${formatCurrency(topCategory[1] || 0)})` : 'N/A'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Friction by Category'),
    createDataTable(
      ['Category', 'Annual Cost', '% of Total'],
      [
        ['Manual Processes', formatCurrency(byCategory.manual || 0), getPercent(byCategory.manual, totalByCategory)],
        ['Delays', formatCurrency(byCategory.delay || 0), getPercent(byCategory.delay, totalByCategory)],
        ['Quality Issues', formatCurrency(byCategory.quality || 0), getPercent(byCategory.quality, totalByCategory)],
        ['Access Barriers', formatCurrency(byCategory.access || 0), getPercent(byCategory.access, totalByCategory)],
      ]
    ),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

function createJourneyOverview(tool5: DiagnosticSessionData['tool5']): (Paragraph | Table)[] {
  const journeys = (tool5?.journeys || []) as Journey[];

  if (journeys.length === 0) {
    return [
      createPageBreak(),
      createSectionTitle('Data Journey Overview'),
      createBodyParagraph('No data journeys were mapped in the diagnostic.'),
    ];
  }

  const journeyRows = journeys.map((j) => [
    j.name,
    `${j.stages?.length || 0}`,
    `${j.frictionPoints?.length || 0}`,
    j.frictionPoints?.length
      ? Math.max(...j.frictionPoints.map(fp => fp.severity)).toString()
      : '0',
  ]);

  return [
    createPageBreak(),
    createSectionTitle('Data Journey Overview'),
    createBodyParagraph(
      'The following data journeys represent critical information flows in your organization. Each journey has been analyzed for friction points that slow down data movement or degrade data quality.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createDataTable(
      ['Journey Name', 'Stages', 'Friction Points', 'Max Severity'],
      journeyRows
    ),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

function createFrictionAnalysis(tool5: DiagnosticSessionData['tool5']): (Paragraph | Table)[] {
  const journeys = (tool5?.journeys || []) as Journey[];
  const paragraphs: (Paragraph | Table)[] = [
    createPageBreak(),
    createSectionTitle('Friction Point Analysis'),
    createBodyParagraph(
      'Each friction point has been categorized and assessed for severity (1-9 scale). Higher severity points have greater impact on operations and should be prioritized.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
  ];

  // Group all friction points by severity
  const allFrictionPoints = journeys.flatMap((j) =>
    (j.frictionPoints || []).map((fp) => ({
      ...fp,
      journeyName: j.name,
      stageName: j.stages?.[fp.stageIndex]?.name || 'Unknown Stage',
    }))
  );

  // Sort by severity descending
  allFrictionPoints.sort((a, b) => b.severity - a.severity);

  if (allFrictionPoints.length === 0) {
    paragraphs.push(createBodyParagraph('No friction points were identified.'));
    return paragraphs;
  }

  // Create friction point table
  paragraphs.push(
    createSubsectionTitle('Top Friction Points by Severity'),
    createDataTable(
      ['Journey', 'Stage', 'Category', 'Severity', 'Description'],
      allFrictionPoints.slice(0, 10).map((fp) => [
        fp.journeyName,
        fp.stageName,
        formatCategoryName(fp.category || 'unknown'),
        `${fp.severity}/9`,
        fp.description || 'No description',
      ])
    ),
    new Paragraph({ text: '', spacing: { after: 200 } })
  );

  return paragraphs;
}

function createLatencyHotspots(tool5: DiagnosticSessionData['tool5']): Paragraph[] {
  const journeys = tool5?.journeys || [];

  return [
    createSectionTitle('Latency Hotspot Analysis'),
    createBodyParagraph(
      'Latency hotspots are stages in data journeys where data sits waiting, causing delays. These often occur at handoff points between systems or teams.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Common Latency Patterns'),
    ...createBulletList([
      'Batch Processing: Data processed in batches rather than real-time',
      'Approval Queues: Data waiting for human approval or review',
      'System Integration: Delays at interfaces between systems',
      'Manual Handoffs: Data transferred manually between teams',
      'Validation Delays: Time spent correcting data quality issues',
    ]),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Identified Hotspots'),
    createBodyParagraph(
      journeys.length > 0
        ? `Analysis of ${journeys.length} journeys revealed friction points at key transition stages. Focus on reducing handoff times and automating manual processes.`
        : 'No journey data available for hotspot analysis.'
    ),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

function createImprovementRecommendations(tool5: DiagnosticSessionData['tool5']): Paragraph[] {
  const byCategory = tool5?.frictionByCategory || {};

  const recommendations: Array<{
    category: string;
    actions: string[];
    expectedSavings: string;
    priority: number;
  }> = [];

  // Generate recommendations based on friction categories
  if ((byCategory.manual || 0) > 0) {
    recommendations.push({
      category: 'Reduce Manual Processes',
      actions: [
        'Identify top 5 manual data entry points',
        'Evaluate automation tools (RPA, integrations)',
        'Implement form pre-population where possible',
        'Create templates for repetitive data tasks',
      ],
      expectedSavings: `Up to ${formatCurrency((byCategory.manual || 0) * 0.6)} annually`,
      priority: 1,
    });
  }

  if ((byCategory.delay || 0) > 0) {
    recommendations.push({
      category: 'Eliminate Processing Delays',
      actions: [
        'Identify bottleneck stages in data journeys',
        'Move from batch to real-time processing where feasible',
        'Set SLAs for data handoff points',
        'Implement async notification when data is ready',
      ],
      expectedSavings: `Up to ${formatCurrency((byCategory.delay || 0) * 0.5)} annually`,
      priority: 2,
    });
  }

  if ((byCategory.quality || 0) > 0) {
    recommendations.push({
      category: 'Improve Data Quality',
      actions: [
        'Implement validation at data entry points',
        'Create data quality dashboards',
        'Establish data ownership and stewardship',
        'Automate quality checks at key stages',
      ],
      expectedSavings: `Up to ${formatCurrency((byCategory.quality || 0) * 0.7)} annually`,
      priority: 3,
    });
  }

  if ((byCategory.access || 0) > 0) {
    recommendations.push({
      category: 'Reduce Access Barriers',
      actions: [
        'Audit data access permissions',
        'Implement self-service data access where appropriate',
        'Create data catalogs for discoverability',
        'Reduce approval layers for low-risk data',
      ],
      expectedSavings: `Up to ${formatCurrency((byCategory.access || 0) * 0.5)} annually`,
      priority: 4,
    });
  }

  // Sort by priority
  recommendations.sort((a, b) => a.priority - b.priority);

  const paragraphs: Paragraph[] = [
    createSectionTitle('Improvement Recommendations'),
    createBodyParagraph(
      'The following recommendations are prioritized by potential impact based on your friction analysis.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
  ];

  recommendations.forEach((rec, index) => {
    paragraphs.push(
      createSubsectionTitle(`${index + 1}. ${rec.category}`),
      createKeyValue('Expected Savings', rec.expectedSavings, BRAND_COLORS.green),
      new Paragraph({ text: 'Actions:', spacing: { before: 50 } }),
      ...createBulletList(rec.actions),
      new Paragraph({ text: '', spacing: { after: 100 } })
    );
  });

  return paragraphs;
}

function createImplementationRoadmap(): (Paragraph | Table)[] {
  return [
    createSectionTitle('Implementation Roadmap'),
    createBodyParagraph(
      'Use this phased approach to implement data flow optimizations while minimizing disruption to ongoing operations.'
    ),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Phase 1: Quick Wins (Days 1-30)'),
    ...createBulletList([
      'Document current state of top 3 friction points',
      'Implement template solutions for manual processes',
      'Set up basic monitoring for data delays',
      'Communicate improvement initiative to stakeholders',
    ]),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Phase 2: Foundation (Days 31-90)'),
    ...createBulletList([
      'Deploy automation for highest-impact manual processes',
      'Establish data quality baseline metrics',
      'Implement first integration improvements',
      'Train teams on new processes',
    ]),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Phase 3: Optimization (Days 91-180)'),
    ...createBulletList([
      'Roll out remaining automation initiatives',
      'Implement real-time processing for critical journeys',
      'Deploy self-service data access capabilities',
      'Measure and report on friction reduction',
    ]),
    new Paragraph({ text: '', spacing: { after: 100 } }),
    createSubsectionTitle('Success Metrics'),
    createDataTable(
      ['Metric', 'Current', 'Target (90 days)', 'Target (180 days)'],
      [
        ['Total Friction Cost', '[Current]', '-30%', '-50%'],
        ['Manual Process Time', '[Current hrs]', '-40%', '-60%'],
        ['Average Data Latency', '[Current]', '-25%', '-40%'],
        ['Data Quality Issues', '[Current count]', '-35%', '-60%'],
      ]
    ),
    new Paragraph({ text: '', spacing: { after: 200 } }),
  ];
}

// Helper functions
function formatCategoryName(category: string): string {
  const names: Record<string, string> = {
    manual: 'Manual Processes',
    delay: 'Delays',
    quality: 'Quality Issues',
    access: 'Access Barriers',
  };
  return names[category] || category;
}

function getPercent(value: number | undefined, total: number | undefined): string {
  if (!value || !total || total === 0) return '0%';
  return formatPercent((value / total) * 100);
}
