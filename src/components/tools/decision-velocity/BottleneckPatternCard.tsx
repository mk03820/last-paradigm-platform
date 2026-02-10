'use client';

/**
 * BottleneckPatternCard Component
 *
 * Displays a single bottleneck pattern with severity and affected archetypes.
 *
 * Story 10.4: Bottleneck Pattern Identification
 * Covers: AC 1, 6 (Pattern display, affected decision types)
 */

import { useState } from 'react';
import {
  BOTTLENECK_PATTERNS,
  getSeverityColor,
  SEVERITY_LABELS,
  type PatternDetection,
} from './bottleneck-patterns';
import { DECISION_ARCHETYPES } from './constants';

export interface BottleneckPatternCardProps {
  detection: PatternDetection;
}

export function BottleneckPatternCard({ detection }: BottleneckPatternCardProps) {
  const [expanded, setExpanded] = useState(false);
  const pattern = BOTTLENECK_PATTERNS[detection.patternId];
  const severityColors = getSeverityColor(detection.severity);

  // Get labels for affected archetypes
  const affectedLabels = detection.affectedArchetypes
    .map((id) => DECISION_ARCHETYPES.find((a) => a.id === id)?.label || id)
    .join(', ');

  return (
    <div
      className={`rounded-lg border p-4 ${severityColors.bg} ${severityColors.border}`}
      role="region"
      aria-labelledby={`pattern-${detection.patternId}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              id={`pattern-${detection.patternId}`}
              className={`font-semibold ${severityColors.text}`}
            >
              {pattern.label}
            </h4>
            <span
              className={`text-xs px-2 py-0.5 rounded-full border ${severityColors.bg} ${severityColors.text} ${severityColors.border}`}
            >
              {SEVERITY_LABELS[detection.severity]}
            </span>
            {detection.confidence === 'confirmed' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">
                Confirmed
              </span>
            )}
          </div>
          <p className="text-sm mt-1 text-foreground/80">{pattern.description}</p>
          <p className="text-xs mt-2 text-muted-foreground">
            Affects: {affectedLabels}
          </p>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-muted-foreground hover:text-foreground shrink-0"
          aria-expanded={expanded}
          aria-controls={`pattern-details-${detection.patternId}`}
        >
          {expanded ? 'Less' : 'More'}
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div
          id={`pattern-details-${detection.patternId}`}
          className="mt-4 pt-4 border-t border-current/10"
        >
          {/* Symptoms */}
          <div className="mb-4">
            <h5 className="text-sm font-medium mb-2">Common Symptoms</h5>
            <ul className="text-sm space-y-1 text-foreground/80">
              {pattern.symptoms.map((symptom, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  {symptom}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Interventions */}
          <div>
            <h5 className="text-sm font-medium mb-2">Recommended Interventions</h5>
            <ul className="text-sm space-y-2">
              {pattern.interventions.map((intervention) => (
                <li key={intervention.id} className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">→</span>
                  <div>
                    <span className="font-medium">{intervention.title}</span>
                    <p className="text-foreground/70 text-xs mt-0.5">
                      {intervention.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
