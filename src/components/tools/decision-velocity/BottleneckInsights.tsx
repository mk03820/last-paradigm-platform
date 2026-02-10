'use client';

/**
 * BottleneckInsights Component
 *
 * Aggregated view of all detected bottleneck patterns with
 * prioritized intervention recommendations.
 *
 * Story 10.4: Bottleneck Pattern Identification
 * Covers: AC 3, 4 (Intervention recommendations, Tool 7 integration)
 */

import { useState, useMemo } from 'react';
import { BottleneckDiagnostic } from './BottleneckDiagnostic';
import { BottleneckPatternCard } from './BottleneckPatternCard';
import {
  getTopInterventions,
  getSeverityColor,
  type PatternDetection,
} from './bottleneck-patterns';

export interface BottleneckInsightsProps {
  initialDetections: PatternDetection[];
  onDetectionsChange?: (detections: PatternDetection[]) => void;
}

export function BottleneckInsights({
  initialDetections,
  onDetectionsChange,
}: BottleneckInsightsProps) {
  const [detections, setDetections] = useState<PatternDetection[]>(initialDetections);
  const [viewMode, setViewMode] = useState<'summary' | 'diagnostic'>('summary');

  const handleDetectionUpdate = (updated: PatternDetection) => {
    const newDetections = detections.map((d) =>
      d.patternId === updated.patternId ? updated : d
    );
    setDetections(newDetections);
    onDetectionsChange?.(newDetections);
  };

  const activeDetections = useMemo(
    () => detections.filter((d) => d.detected && d.confidence !== 'rejected'),
    [detections]
  );

  const topInterventions = useMemo(
    () => getTopInterventions(activeDetections, 3),
    [activeDetections]
  );

  if (detections.length === 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <p className="text-green-700 font-medium">No Bottleneck Patterns Detected</p>
        <p className="text-sm text-green-600 mt-1">
          Your decision velocity appears healthy across all categories.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Bottleneck Analysis
            {activeDetections.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {activeDetections.length} pattern{activeDetections.length !== 1 ? 's' : ''} detected
              </span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Understand why decisions take longer than benchmarks
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('summary')}
            className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
              viewMode === 'summary'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setViewMode('diagnostic')}
            className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
              viewMode === 'diagnostic'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Verify
          </button>
        </div>
      </div>

      {/* Top Interventions */}
      {activeDetections.length > 0 && topInterventions.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="font-semibold text-blue-800 mb-3">
            Top 3 Recommended Actions
          </h4>
          <ol className="space-y-3">
            {topInterventions.map(({ pattern, intervention }, idx) => {
              const severityColors = getSeverityColor(
                activeDetections.find((d) => d.patternId === pattern.id)?.severity || 'medium'
              );
              return (
                <li key={intervention.id} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {intervention.title}
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${severityColors.bg} ${severityColors.text}`}
                      >
                        {pattern.label}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {intervention.description}
                    </p>
                    {intervention.playbook2Link && (
                      <p className="text-xs text-blue-600 mt-1">
                        Detailed guidance available in Playbook 2 (Coming Soon)
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* Pattern Cards or Diagnostics */}
      <div className="space-y-4">
        {viewMode === 'summary' ? (
          // Summary view: Show pattern cards
          activeDetections.length > 0 ? (
            activeDetections.map((detection) => (
              <BottleneckPatternCard key={detection.patternId} detection={detection} />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>All detected patterns have been dismissed.</p>
              <button
                onClick={() => setViewMode('diagnostic')}
                className="text-sm text-primary hover:underline mt-2"
              >
                Review dismissed patterns
              </button>
            </div>
          )
        ) : (
          // Diagnostic view: Show verification questions
          detections.map((detection) => (
            <BottleneckDiagnostic
              key={detection.patternId}
              detection={detection}
              onUpdate={handleDetectionUpdate}
            />
          ))
        )}
      </div>

      {/* Tool 7 Integration Note */}
      <div className="text-xs text-muted-foreground text-center pt-4 border-t">
        These insights will be included in your Total Cost of Misalignment calculation (Tool 7)
      </div>
    </div>
  );
}
