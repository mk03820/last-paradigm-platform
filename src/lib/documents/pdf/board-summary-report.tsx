/**
 * Board Summary Report Generator
 *
 * Generates a PDF summary report with diagnostic results
 * for board presentation.
 *
 * Story 18.4: PowerPoint & PDF Generation
 * Task 4: Create Board Summary Report generator
 * Covers: AC4, AC6, FR65 (Book attribution)
 */

import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { renderToBuffer } from '@react-pdf/renderer';
import type { DiagnosticSessionData } from '@/lib/db/schema';
import type { GenerationResult } from '../word/types';
import {
  CoverPage,
  StandardPage,
  SectionHeading,
  Paragraph,
  BulletList,
  KeyValue,
  MetricBox,
  MetricsRow,
  DataTable,
  ScoreIndicator,
  Divider,
  Spacer,
  TwoColumns,
  CalloutBox,
} from './components';
import {
  pdfStyles,
  PDF_COLORS,
  formatCurrency,
  formatPercent,
  formatScore,
  getScoreColor,
  getScoreInterpretation,
} from './styles';

/**
 * Generate the Board Summary Report PDF
 */
export async function generateBoardSummaryReport(
  diagnosticData: DiagnosticSessionData
): Promise<GenerationResult> {
  const doc = (
    <BoardSummaryDocument diagnosticData={diagnosticData} />
  );

  const buffer = await renderToBuffer(doc);

  return {
    buffer: Buffer.from(buffer),
    fileSizeBytes: buffer.byteLength,
  };
}

/**
 * Board Summary Document component
 */
function BoardSummaryDocument({
  diagnosticData,
}: {
  diagnosticData: DiagnosticSessionData;
}): React.ReactElement {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document
      title="Board Summary Report"
      author="The Last Paradigm Platform"
      subject="Alignment Assessment Results"
    >
      {/* Cover Page */}
      <CoverPage
        title="Board Summary Report"
        subtitle="Organizational Alignment Assessment"
        date={currentDate}
      />

      {/* Executive Summary */}
      <ExecutiveSummaryPage diagnosticData={diagnosticData} />

      {/* Key Metrics Dashboard */}
      <MetricsDashboardPage diagnosticData={diagnosticData} />

      {/* Tool Findings Summary */}
      <ToolFindingsPage diagnosticData={diagnosticData} />

      {/* Strategic Recommendations */}
      <RecommendationsPage diagnosticData={diagnosticData} />

      {/* Appendix */}
      <AppendixPage diagnosticData={diagnosticData} />
    </Document>
  );
}

/**
 * Executive Summary page
 */
function ExecutiveSummaryPage({
  diagnosticData,
}: {
  diagnosticData: DiagnosticSessionData;
}): React.ReactElement {
  const tool7 = diagnosticData.tool7 || {};
  const tool1 = diagnosticData.tool1 || {};

  return (
    <StandardPage title="Executive Summary" pageNumber={2}>
      <SectionHeading level={1}>Executive Summary</SectionHeading>

      <CalloutBox type="warning" title="Key Finding">
        <Text style={pdfStyles.body}>
          Your organization is experiencing an alignment tax of{' '}
          <Text style={{ fontFamily: 'Helvetica-Bold', color: PDF_COLORS.gold }}>
            {formatCurrency(tool7.totalCost || 0)}
          </Text>{' '}
          annually, representing{' '}
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>
            {formatPercent(tool7.alignmentTaxPercent || 0)}
          </Text>{' '}
          of annual revenue.
        </Text>
      </CalloutBox>

      <Spacer height={16} />

      <SectionHeading level={2}>Assessment Overview</SectionHeading>

      <Paragraph>
        This report summarizes the findings from a comprehensive 7-tool organizational
        alignment assessment. The diagnostic evaluated meeting efficiency, decision
        velocity, stakeholder alignment, data flow friction, communication health,
        and total cost of misalignment.
      </Paragraph>

      <Spacer height={16} />

      <MetricsRow
        metrics={[
          {
            label: 'Alignment Score',
            value: formatScore(tool1.compositeScore || 0),
          },
          {
            label: 'Total Alignment Tax',
            value: formatCurrency(tool7.totalCost || 0),
            highlight: true,
          },
          {
            label: '% of Revenue',
            value: formatPercent(tool7.alignmentTaxPercent || 0),
          },
        ]}
      />

      <Spacer height={16} />

      <SectionHeading level={2}>Key Findings</SectionHeading>

      <BulletList items={generateKeyFindings(diagnosticData)} />

      <Spacer height={16} />

      <SectionHeading level={2}>Assessment Status</SectionHeading>

      <View style={pdfStyles.row}>
        <View style={pdfStyles.flex1}>
          <KeyValue label="Composite Score" value={formatScore(tool1.compositeScore || 0)} />
          <KeyValue label="Status" value={getScoreInterpretation(tool1.compositeScore || 0)} />
        </View>
        <View style={pdfStyles.flex1}>
          <KeyValue label="Assessment Date" value={tool7.completedAt || 'N/A'} />
          <KeyValue label="Tools Completed" value="7 of 7" />
        </View>
      </View>
    </StandardPage>
  );
}

/**
 * Generate key findings based on diagnostic data
 */
function generateKeyFindings(diagnosticData: DiagnosticSessionData): string[] {
  const findings: string[] = [];
  const tool1 = diagnosticData.tool1 || {};
  const tool2Results = diagnosticData.tool2?.results || {};
  const tool6 = diagnosticData.tool6 || {};
  const tool7 = diagnosticData.tool7 || {};

  if ((tool7.alignmentTaxPercent || 0) > 10) {
    findings.push(
      `Alignment tax of ${formatPercent(tool7.alignmentTaxPercent || 0)} exceeds industry benchmark of 8-10%`
    );
  }

  if ((tool2Results.wastedCost || 0) > 50000) {
    findings.push(
      `Meeting inefficiency accounts for ${formatCurrency(tool2Results.wastedCost || 0)} in annual waste`
    );
  }

  if ((tool1.compositeScore || 0) < 70) {
    findings.push(
      `Overall alignment score of ${tool1.compositeScore || 0}/100 indicates significant improvement opportunities`
    );
  }

  const antiPatterns = (tool6.antiPatterns || []) as unknown[];
  if (antiPatterns.length > 0) {
    findings.push(`${antiPatterns.length} communication anti-patterns identified`);
  }

  // Ensure at least 3 findings
  while (findings.length < 3) {
    findings.push('Targeted interventions can yield 20-30% cost reduction within 90 days');
  }

  return findings.slice(0, 5);
}

/**
 * Key Metrics Dashboard page
 */
function MetricsDashboardPage({
  diagnosticData,
}: {
  diagnosticData: DiagnosticSessionData;
}): React.ReactElement {
  const tool1 = diagnosticData.tool1 || {};
  const tool2Results = diagnosticData.tool2?.results || {};
  const tool3 = diagnosticData.tool3 || {};
  const tool5 = diagnosticData.tool5 || {};
  const tool6 = diagnosticData.tool6 || {};
  const tool7 = diagnosticData.tool7 || {};

  const tool3Metrics = (tool3.metrics || {}) as Record<string, number>;
  const tool6Metrics = (tool6.metrics || {}) as Record<string, number>;

  return (
    <StandardPage title="Key Metrics Dashboard" pageNumber={3}>
      <SectionHeading level={1}>Key Metrics Dashboard</SectionHeading>

      <DataTable
        headers={['Metric', 'Value', 'Status']}
        rows={[
          [
            'Overall Alignment Score',
            formatScore(tool1.compositeScore || 0),
            getScoreInterpretation(tool1.compositeScore || 0),
          ],
          [
            'Total Alignment Tax',
            formatCurrency(tool7.totalCost || 0),
            `${formatPercent(tool7.alignmentTaxPercent || 0)} of revenue`,
          ],
          [
            'Meeting Waste',
            formatCurrency(tool2Results.wastedCost || 0),
            `${tool2Results.wastedHours || 0} hours/year`,
          ],
          [
            'Decision Velocity',
            `${tool3Metrics.overallMedian || 0} days median`,
            (tool3Metrics.overallMedian || 0) > 14 ? 'Slow' : 'Normal',
          ],
          [
            'Data Friction Cost',
            formatCurrency(tool5.frictionCost || 0),
            'Annual impact',
          ],
          [
            'Communication Health',
            formatScore(tool6Metrics.healthScore || 0),
            getScoreInterpretation(tool6Metrics.healthScore || 0),
          ],
        ]}
        columnWidths={[40, 30, 30]}
      />

      <Spacer height={24} />

      <SectionHeading level={2}>Dimension Scores</SectionHeading>

      <TwoColumns
        left={
          <>
            <ScoreIndicator
              score={tool1.scores?.strategic || 0}
              label="Strategic Alignment"
            />
            <ScoreIndicator
              score={tool1.scores?.execution || 0}
              label="Execution Alignment"
            />
            <ScoreIndicator
              score={tool1.scores?.technology || 0}
              label="Technology Alignment"
            />
          </>
        }
        right={
          <>
            <ScoreIndicator
              score={tool1.scores?.people || 0}
              label="People Alignment"
            />
            <ScoreIndicator
              score={tool1.scores?.governance || 0}
              label="Governance Alignment"
            />
          </>
        }
      />
    </StandardPage>
  );
}

/**
 * Tool Findings Summary page
 */
function ToolFindingsPage({
  diagnosticData,
}: {
  diagnosticData: DiagnosticSessionData;
}): React.ReactElement {
  const tool2Results = diagnosticData.tool2?.results || {};
  const tool2Inputs = diagnosticData.tool2?.inputs || {};
  const tool3 = diagnosticData.tool3 || {};
  const tool4 = diagnosticData.tool4 || {};
  const tool5 = diagnosticData.tool5 || {};
  const tool6 = diagnosticData.tool6 || {};

  const tool3Metrics = (tool3.metrics || {}) as Record<string, number>;
  const stakeholders = (tool4.stakeholders || []) as unknown[];
  const journeys = (tool5.journeys || []) as unknown[];
  const antiPatterns = (tool6.antiPatterns || []) as string[];

  return (
    <StandardPage title="Tool Findings Summary" pageNumber={4}>
      <SectionHeading level={1}>Tool Findings Summary</SectionHeading>

      <SectionHeading level={2}>Tool 2: Meeting Cost Analysis</SectionHeading>
      <BulletList
        items={[
          `${tool2Inputs.meetingCount || 0} meetings analyzed`,
          `Total meeting cost: ${formatCurrency(tool2Results.totalMeetingCost || 0)}`,
          `Wasted cost: ${formatCurrency(tool2Results.wastedCost || 0)} (${tool2Results.wastedHours || 0} hours)`,
          `Effective cost: ${formatCurrency(tool2Results.effectiveCost || 0)}`,
        ]}
      />

      <Divider />

      <SectionHeading level={2}>Tool 3: Decision Velocity</SectionHeading>
      <BulletList
        items={[
          `Median decision time: ${tool3Metrics.overallMedian || 0} days`,
          `P90 decision time: ${tool3Metrics.overallP90 || 0} days`,
          `${(tool3.decisions as unknown[] || []).length} decision types analyzed`,
        ]}
      />

      <Divider />

      <SectionHeading level={2}>Tool 4: Stakeholder Mapping</SectionHeading>
      <BulletList
        items={[
          `${stakeholders.length} stakeholders identified`,
          `Stakeholder analysis: Complete`,
        ]}
      />

      <Divider />

      <SectionHeading level={2}>Tool 5: Data Flow Analysis</SectionHeading>
      <BulletList
        items={[
          `${journeys.length} data journeys analyzed`,
          `Total friction cost: ${formatCurrency(tool5.frictionCost || 0)}`,
        ]}
      />

      <Divider />

      <SectionHeading level={2}>Tool 6: Communication Health</SectionHeading>
      <BulletList
        items={[
          `${antiPatterns.length} anti-patterns detected`,
          ...(antiPatterns.length > 0 ? [`Patterns: ${antiPatterns.slice(0, 3).join(', ')}`] : []),
        ]}
      />
    </StandardPage>
  );
}

/**
 * Strategic Recommendations page
 */
function RecommendationsPage({
  diagnosticData,
}: {
  diagnosticData: DiagnosticSessionData;
}): React.ReactElement {
  const recommendations = generateRecommendations(diagnosticData);

  return (
    <StandardPage title="Strategic Recommendations" pageNumber={5}>
      <SectionHeading level={1}>Strategic Recommendations</SectionHeading>

      <Paragraph>
        Based on the diagnostic findings, the following prioritized recommendations
        will have the greatest impact on reducing alignment tax:
      </Paragraph>

      <Spacer height={16} />

      <SectionHeading level={2}>Priority Actions</SectionHeading>

      {recommendations.map((rec, index) => (
        <CalloutBox key={index} title={`${index + 1}. ${rec.title}`}>
          <Text style={pdfStyles.body}>{rec.description}</Text>
          <Spacer height={8} />
          <Text style={pdfStyles.small}>
            Expected Impact: {rec.impact} | Timeline: {rec.timeline}
          </Text>
        </CalloutBox>
      ))}

      <Spacer height={24} />

      <SectionHeading level={2}>Implementation Roadmap</SectionHeading>

      <DataTable
        headers={['Phase', 'Timeline', 'Focus Areas']}
        rows={[
          ['Foundation', 'Days 1-30', 'Quick wins, metrics baseline, stakeholder alignment'],
          ['Adoption', 'Days 31-60', 'Process changes, training, tool deployment'],
          ['Optimization', 'Days 61-90', 'Performance review, refinements, sustainability'],
        ]}
        columnWidths={[20, 20, 60]}
      />
    </StandardPage>
  );
}

/**
 * Generate recommendations based on diagnostic data
 */
function generateRecommendations(diagnosticData: DiagnosticSessionData): Array<{
  title: string;
  description: string;
  impact: string;
  timeline: string;
}> {
  const recommendations = [];
  const tool2Results = diagnosticData.tool2?.results || {};
  const tool6 = diagnosticData.tool6 || {};

  if ((tool2Results.wastedCost || 0) > 30000) {
    recommendations.push({
      title: 'Meeting Effectiveness Protocol',
      description:
        'Implement structured meeting guidelines including agenda requirements, attendee optimization, and time-boxing to reduce meeting waste by 30%.',
      impact: formatCurrency((tool2Results.wastedCost || 0) * 0.3) + ' annual savings',
      timeline: '30 days',
    });
  }

  const antiPatterns = (tool6.antiPatterns || []) as unknown[];
  if (antiPatterns.length > 0) {
    recommendations.push({
      title: 'Communication Guidelines',
      description:
        'Address identified anti-patterns with clear channel usage guidelines, response time expectations, and async communication protocols.',
      impact: 'Improved productivity',
      timeline: '45 days',
    });
  }

  recommendations.push({
    title: 'Decision Authority Clarification',
    description:
      'Implement RAPID framework to clarify decision rights and reduce bottlenecks in critical decision pathways.',
    impact: 'Faster decisions',
    timeline: '60 days',
  });

  recommendations.push({
    title: 'Cross-functional Alignment',
    description:
      'Establish regular cross-team coordination cadences and shared objectives to improve strategic alignment.',
    impact: 'Better coordination',
    timeline: '90 days',
  });

  return recommendations.slice(0, 4);
}

/**
 * Appendix page
 */
function AppendixPage({
  diagnosticData,
}: {
  diagnosticData: DiagnosticSessionData;
}): React.ReactElement {
  const tool1 = diagnosticData.tool1 || {};
  const tool2 = diagnosticData.tool2 || {};
  const tool7 = diagnosticData.tool7 || {};

  return (
    <StandardPage title="Appendix" pageNumber={6}>
      <SectionHeading level={1}>Appendix: Detailed Data</SectionHeading>

      <SectionHeading level={2}>Tool 1: Alignment Scores</SectionHeading>
      <DataTable
        headers={['Dimension', 'Score', 'Status']}
        rows={[
          ['Strategic', formatScore(tool1.scores?.strategic || 0), getScoreInterpretation(tool1.scores?.strategic || 0)],
          ['Execution', formatScore(tool1.scores?.execution || 0), getScoreInterpretation(tool1.scores?.execution || 0)],
          ['Technology', formatScore(tool1.scores?.technology || 0), getScoreInterpretation(tool1.scores?.technology || 0)],
          ['People', formatScore(tool1.scores?.people || 0), getScoreInterpretation(tool1.scores?.people || 0)],
          ['Governance', formatScore(tool1.scores?.governance || 0), getScoreInterpretation(tool1.scores?.governance || 0)],
          ['Composite', formatScore(tool1.compositeScore || 0), getScoreInterpretation(tool1.compositeScore || 0)],
        ]}
        columnWidths={[40, 30, 30]}
      />

      <Spacer height={16} />

      <SectionHeading level={2}>Tool 2: Meeting Analysis Parameters</SectionHeading>
      <DataTable
        headers={['Parameter', 'Value']}
        rows={[
          ['Meetings Analyzed', String(tool2.inputs?.meetingCount || 0)],
          ['Average Attendees', String(tool2.inputs?.averageAttendees || 0)],
          ['Average Duration (min)', String(tool2.inputs?.averageDuration || 0)],
          ['Total Meeting Hours', String(tool2.results?.totalMeetingHours || 0)],
          ['Wasted Hours', String(tool2.results?.wastedHours || 0)],
          ['Effective Hours', String(tool2.results?.effectiveHours || 0)],
        ]}
        columnWidths={[60, 40]}
      />

      <Spacer height={16} />

      <SectionHeading level={2}>Tool 7: Cost Summary</SectionHeading>
      <DataTable
        headers={['Metric', 'Value']}
        rows={[
          ['Total Alignment Tax', formatCurrency(tool7.totalCost || 0)],
          ['Percentage of Revenue', formatPercent(tool7.alignmentTaxPercent || 0)],
          ['Assessment Completed', tool7.completedAt || 'N/A'],
        ]}
        columnWidths={[60, 40]}
      />

      <Spacer height={24} />

      <Text style={pdfStyles.caption}>
        This report was generated using The Last Paradigm methodology. For more
        information, visit thelastparadigm.com.
      </Text>
    </StandardPage>
  );
}
