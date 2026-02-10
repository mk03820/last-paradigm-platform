/**
 * Risk Summary Component
 *
 * Displays identified stakeholder risks with severity and mitigation suggestions.
 *
 * Story 11.3: Sentiment Overlay and Risk Identification
 * Covers: AC4 (risk summary section lists critical stakeholder risks)
 */

'use client';

import React, { memo, useMemo } from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { Stakeholder } from './stakeholder-constants';
import {
  detectRisks,
  calculateRiskScore,
  getRiskLevel,
  getSentimentCounts,
  type StakeholderRisk,
  type RiskSeverity,
} from './stakeholder-risks';
import { cn } from '@/lib/utils';

export interface RiskSummaryProps {
  stakeholders: Stakeholder[];
  className?: string;
}

const SEVERITY_STYLES: Record<
  RiskSeverity,
  { icon: typeof AlertTriangle; bg: string; text: string; badge: string }
> = {
  critical: {
    icon: AlertTriangle,
    bg: 'bg-red-50 dark:bg-red-950/20',
    text: 'text-red-700 dark:text-red-300',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
  },
  high: {
    icon: AlertCircle,
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    text: 'text-orange-700 dark:text-orange-300',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
  },
  medium: {
    icon: Info,
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    text: 'text-yellow-700 dark:text-yellow-300',
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
  },
};

const RISK_LEVEL_STYLES: Record<
  'low' | 'medium' | 'high' | 'critical',
  { bg: string; text: string }
> = {
  low: { bg: 'bg-green-100', text: 'text-green-800' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800' },
  critical: { bg: 'bg-red-100', text: 'text-red-800' },
};

export const RiskSummary = memo(function RiskSummary({
  stakeholders,
  className,
}: RiskSummaryProps) {
  const risks = useMemo(() => detectRisks(stakeholders), [stakeholders]);
  const riskScore = useMemo(() => calculateRiskScore(stakeholders), [stakeholders]);
  const riskLevel = useMemo(() => getRiskLevel(riskScore), [riskScore]);
  const sentimentCounts = useMemo(() => getSentimentCounts(stakeholders), [stakeholders]);

  const hasAnySentiment = sentimentCounts.supporter > 0 ||
    sentimentCounts.neutral > 0 ||
    sentimentCounts.blocker > 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Risk Summary</span>
          {risks.length > 0 && (
            <Badge className={cn('text-xs', RISK_LEVEL_STYLES[riskLevel].bg, RISK_LEVEL_STYLES[riskLevel].text)}>
              {risks.length} {risks.length === 1 ? 'risk' : 'risks'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sentiment Distribution */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Sentiment Distribution</p>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">
                {sentimentCounts.supporter} Supporter{sentimentCounts.supporter !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-muted-foreground">
                {sentimentCounts.neutral} Neutral
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-muted-foreground">
                {sentimentCounts.blocker} Blocker{sentimentCounts.blocker !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          {sentimentCounts.unassigned > 0 && (
            <p className="text-xs text-muted-foreground">
              {sentimentCounts.unassigned} stakeholder{sentimentCounts.unassigned !== 1 ? 's' : ''} without sentiment assigned
            </p>
          )}
        </div>

        {/* No Risks State */}
        {risks.length === 0 && (
          <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-4 text-center">
            <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
            {hasAnySentiment ? (
              <>
                <p className="font-medium text-green-800 dark:text-green-200">
                  No Critical Risks Detected
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Your stakeholder map shows a healthy distribution of support.
                </p>
              </>
            ) : (
              <>
                <p className="font-medium text-muted-foreground">
                  Assign Sentiment to Identify Risks
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Set stakeholder sentiments (Supporter, Neutral, Blocker) to detect potential risks.
                </p>
              </>
            )}
          </div>
        )}

        {/* Risk List */}
        {risks.length > 0 && (
          <Accordion type="multiple" className="space-y-2">
            {risks.map((risk) => (
              <RiskItem key={risk.id} risk={risk} />
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
});

interface RiskItemProps {
  risk: StakeholderRisk;
}

const RiskItem = memo(function RiskItem({ risk }: RiskItemProps) {
  const styles = SEVERITY_STYLES[risk.severity];
  const Icon = styles.icon;

  return (
    <AccordionItem value={risk.id} className={cn('rounded-lg border px-3', styles.bg)}>
      <AccordionTrigger className="py-3 hover:no-underline">
        <div className="flex items-center gap-3 text-left">
          <Icon className={cn('h-5 w-5 flex-shrink-0', styles.text)} />
          <div>
            <p className={cn('font-medium', styles.text)}>{risk.title}</p>
            {risk.stakeholders.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {risk.stakeholders.length} stakeholder{risk.stakeholders.length !== 1 ? 's' : ''} affected
              </p>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-3">
        <div className="space-y-3 pl-8">
          <p className="text-sm text-muted-foreground">{risk.description}</p>

          {risk.stakeholders.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-1">Affected Stakeholders:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {risk.stakeholders.map((s) => (
                  <li key={s.id} className="flex items-center gap-2">
                    <span className="font-medium">{s.name}</span>
                    <span className="text-xs">({s.role})</span>
                    <span className="text-xs">
                      Power: {s.power}, Interest: {s.interest}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-sm font-medium mb-1">Suggested Mitigation:</p>
            <p className="text-sm text-muted-foreground">{risk.mitigation}</p>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
});
