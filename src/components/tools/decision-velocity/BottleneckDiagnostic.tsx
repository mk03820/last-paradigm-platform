'use client';

/**
 * BottleneckDiagnostic Component
 *
 * Displays diagnostic questions for detected bottleneck patterns.
 * Allows users to confirm or reject auto-detected patterns.
 *
 * Story 10.4: Bottleneck Pattern Identification
 * Covers: AC 2, 5 (Diagnostic questions, pattern confirmation)
 */

import { useState } from 'react';
import {
  BOTTLENECK_PATTERNS,
  getSeverityColor,
  SEVERITY_LABELS,
  type PatternDetection,
  type BottleneckPatternId,
} from './bottleneck-patterns';

export interface BottleneckDiagnosticProps {
  detection: PatternDetection;
  onUpdate: (updated: PatternDetection) => void;
}

export function BottleneckDiagnostic({
  detection,
  onUpdate,
}: BottleneckDiagnosticProps) {
  const pattern = BOTTLENECK_PATTERNS[detection.patternId];
  const severityColors = getSeverityColor(detection.severity);
  const [expanded, setExpanded] = useState(false);

  const handleQuestionToggle = (questionId: string) => {
    const newConfirmed = detection.confirmedQuestions.includes(questionId)
      ? detection.confirmedQuestions.filter((q) => q !== questionId)
      : [...detection.confirmedQuestions, questionId];

    // Update confidence based on confirmations
    let newConfidence: PatternDetection['confidence'] = 'auto';
    if (newConfirmed.length >= 2) {
      newConfidence = 'confirmed';
    } else if (newConfirmed.length === 0 && detection.confidence !== 'auto') {
      newConfidence = 'rejected';
    }

    onUpdate({
      ...detection,
      confirmedQuestions: newConfirmed,
      confidence: newConfidence,
      detected: newConfidence !== 'rejected',
    });
  };

  const handleReject = () => {
    onUpdate({
      ...detection,
      detected: false,
      confidence: 'rejected',
      confirmedQuestions: [],
    });
  };

  const confirmedCount = detection.confirmedQuestions.length;
  const totalQuestions = pattern.diagnosticQuestions.length;

  return (
    <div
      className={`rounded-lg border p-4 ${
        detection.confidence === 'rejected'
          ? 'bg-muted/30 border-muted'
          : `${severityColors.bg} ${severityColors.border}`
      }`}
      role="region"
      aria-labelledby={`diagnostic-${detection.patternId}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4
              id={`diagnostic-${detection.patternId}`}
              className={`font-semibold ${
                detection.confidence === 'rejected'
                  ? 'text-muted-foreground line-through'
                  : severityColors.text
              }`}
            >
              {pattern.label}
            </h4>
            {detection.confidence !== 'rejected' && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${severityColors.bg} ${severityColors.text} border ${severityColors.border}`}
              >
                {SEVERITY_LABELS[detection.severity]}
              </span>
            )}
            {detection.confidence === 'confirmed' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">
                Confirmed
              </span>
            )}
            {detection.confidence === 'auto' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-300">
                Auto-detected
              </span>
            )}
          </div>
          <p
            className={`text-sm mt-1 ${
              detection.confidence === 'rejected'
                ? 'text-muted-foreground'
                : 'text-foreground/80'
            }`}
          >
            {pattern.description}
          </p>
        </div>

        {detection.confidence !== 'rejected' && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-muted-foreground hover:text-foreground"
            aria-expanded={expanded}
          >
            {expanded ? 'Hide' : 'Verify'}
          </button>
        )}
      </div>

      {/* Diagnostic Questions (expanded) */}
      {expanded && detection.confidence !== 'rejected' && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-medium">
            Does this apply to your organization? ({confirmedCount}/{totalQuestions} confirmed)
          </p>
          <div className="space-y-2">
            {pattern.diagnosticQuestions.map((q) => (
              <label
                key={q.id}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={detection.confirmedQuestions.includes(q.id)}
                  onChange={() => handleQuestionToggle(q.id)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground/90 group-hover:text-foreground">
                  {q.question}
                </span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleReject}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              This doesn&apos;t apply to us
            </button>
          </div>
        </div>
      )}

      {/* Rejected state */}
      {detection.confidence === 'rejected' && (
        <button
          onClick={() =>
            onUpdate({
              ...detection,
              detected: true,
              confidence: 'auto',
            })
          }
          className="mt-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Undo dismissal
        </button>
      )}
    </div>
  );
}
