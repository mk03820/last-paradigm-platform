/**
 * Next Steps Guidance Component
 *
 * Provides suggested order for reviewing documents and implementation timeline.
 *
 * Story 18.7: Post-Generation Success Experience
 * Task 2: Create NextStepsGuidance component
 * Covers: AC3 (suggested order), AC4 (implementation timeline)
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  ArrowRight,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NextStepsGuidanceProps {
  className?: string;
}

const SUGGESTED_ORDER = [
  {
    step: 1,
    title: 'Board Summary Report (PDF)',
    description: 'Start with the executive overview to understand your complete alignment picture',
    icon: FileText,
    timeEstimate: '15 min read',
    category: 'presentations',
  },
  {
    step: 2,
    title: 'Strategic Alignment Brief (Word)',
    description: 'Deep dive into findings and recommendations from all diagnostic tools',
    icon: FileText,
    timeEstimate: '30 min read',
    category: 'strategic',
  },
  {
    step: 3,
    title: 'Executive Presentation Deck (PowerPoint)',
    description: 'Customize for your stakeholder presentation with pre-built slides',
    icon: Presentation,
    timeEstimate: '45 min customize',
    category: 'presentations',
  },
  {
    step: 4,
    title: 'Working Tools (Excel)',
    description: 'Use the calculators and trackers for ongoing measurement',
    icon: FileSpreadsheet,
    timeEstimate: 'Ongoing use',
    category: 'tools',
  },
  {
    step: 5,
    title: 'Implementation Playbooks (Word)',
    description: 'Follow detailed guides for stakeholder engagement, decision-making, and more',
    icon: FileText,
    timeEstimate: '60+ min each',
    category: 'strategic',
  },
];

const TIMELINE = [
  {
    phase: 'Week 1',
    title: 'Assessment & Socialization',
    tasks: [
      'Review Board Summary and Strategic Alignment Brief',
      'Identify key stakeholders for presentation',
      'Schedule executive briefing',
    ],
  },
  {
    phase: 'Week 2-3',
    title: 'Stakeholder Alignment',
    tasks: [
      'Deliver Executive Presentation',
      'Begin Stakeholder Communication Pack activities',
      'Establish transformation governance',
    ],
  },
  {
    phase: 'Week 4+',
    title: 'Implementation',
    tasks: [
      'Deploy Meeting Cost Tracker for ongoing measurement',
      'Follow Decision Framework Guide for quick wins',
      'Use Transformation Roadmap Planner for long-term planning',
    ],
  },
];

export function NextStepsGuidance({ className }: NextStepsGuidanceProps) {
  return (
    <div className={cn('space-y-8', className)}>
      {/* Suggested Review Order */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            Suggested Review Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {SUGGESTED_ORDER.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                    {item.step}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-slate-400" />
                      <h4 className="font-medium text-slate-900">{item.title}</h4>
                    </div>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                  <div className="flex-shrink-0 text-sm text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {item.timeEstimate}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Suggested Implementation Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {TIMELINE.map((phase, index) => (
              <div key={phase.phase} className="relative pl-8">
                {/* Timeline Line */}
                {index < TIMELINE.length - 1 && (
                  <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-slate-200" />
                )}
                {/* Timeline Dot */}
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                {/* Content */}
                <div>
                  <span className="text-xs font-medium text-primary uppercase tracking-wide">
                    {phase.phase}
                  </span>
                  <h4 className="font-semibold text-slate-900 mt-1">{phase.title}</h4>
                  <ul className="mt-2 space-y-1">
                    {phase.tasks.map((task, taskIndex) => (
                      <li
                        key={taskIndex}
                        className="flex items-start gap-2 text-sm text-slate-600"
                      >
                        <CheckCircle className="h-4 w-4 text-slate-300 mt-0.5 flex-shrink-0" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NextStepsGuidance;
