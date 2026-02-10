'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ALIGNMENT_DIMENSIONS, type DimensionId } from './constants';

/**
 * NextToolsRecommendation Component
 *
 * Recommends next tools based on the user's weakest dimensions.
 * Provides navigation to recommended tools.
 *
 * Story 9.4: Score Interpretation and Next Steps
 * Covers: AC3 (Recommended tools), AC5 (Navigation to next tool)
 */

export interface NextToolsRecommendationProps {
  scores: Record<DimensionId, number>;
}

interface ToolRecommendation {
  id: number;
  name: string;
  description: string;
  href: string;
  dimensions: DimensionId[];
}

const TOOL_RECOMMENDATIONS: ToolRecommendation[] = [
  {
    id: 3,
    name: 'Decision Velocity Calculator',
    description: 'Measure how quickly decisions move through your organization and identify approval bottlenecks.',
    href: '/tool/decision-velocity',
    dimensions: ['strategic', 'governance'],
  },
  {
    id: 5,
    name: 'Data Flow Friction Mapper',
    description: 'Visualize how data moves between systems and quantify integration costs.',
    href: '/tool/data-flow',
    dimensions: ['technology', 'execution'],
  },
  {
    id: 6,
    name: 'Communication Pattern Analyzer',
    description: 'Diagnose information flow and identify collaboration gaps.',
    href: '/tool/communication-pattern',
    dimensions: ['people'],
  },
  {
    id: 7,
    name: 'Total Cost Calculator',
    description: 'Calculate the full cost of organizational misalignment using your assessment data.',
    href: '/tool/total-cost',
    dimensions: ['strategic', 'execution', 'technology', 'people', 'governance'],
  },
];

export function NextToolsRecommendation({ scores }: NextToolsRecommendationProps) {
  const recommendations = useMemo(() => {
    // Find weakest dimensions (score <= 2)
    const weakDimensions = ALIGNMENT_DIMENSIONS
      .filter((dim) => scores[dim.id] <= 2)
      .map((dim) => dim.id);

    // Get unique tools that match weak dimensions
    const matchingTools = new Set<ToolRecommendation>();

    // Always include Tool 7 (Total Cost Calculator) as primary recommendation
    const tool7 = TOOL_RECOMMENDATIONS.find((t) => t.id === 7);
    if (tool7) matchingTools.add(tool7);

    // Add tools matching weak dimensions
    for (const tool of TOOL_RECOMMENDATIONS) {
      if (tool.id === 7) continue; // Already added
      if (tool.dimensions.some((d) => weakDimensions.includes(d))) {
        matchingTools.add(tool);
      }
    }

    // If no weak dimensions, still recommend Tool 7 and maybe Tool 3
    if (matchingTools.size === 1 && tool7) {
      const tool3 = TOOL_RECOMMENDATIONS.find((t) => t.id === 3);
      if (tool3) matchingTools.add(tool3);
    }

    return Array.from(matchingTools).slice(0, 3);
  }, [scores]);

  return (
    <div
      className="rounded-xl border bg-card p-6"
      role="region"
      aria-labelledby="next-tools-heading"
    >
      <h3
        id="next-tools-heading"
        className="text-lg font-semibold mb-2 flex items-center gap-2"
      >
        <span aria-hidden="true">🧭</span>
        Recommended Next Steps
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Based on your assessment, we recommend exploring these tools:
      </p>
      <div className="space-y-3">
        {recommendations.map((tool, index) => (
          <div
            key={tool.id}
            className={`p-4 rounded-lg border ${
              index === 0 ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h4 className="font-medium flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Tool {tool.id}
                  </span>
                  {tool.name}
                  {index === 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      Recommended
                    </span>
                  )}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {tool.description}
                </p>
              </div>
              <Button
                variant={index === 0 ? 'default' : 'outline'}
                size="sm"
                asChild
              >
                <Link href={tool.href}>Start</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
