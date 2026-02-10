'use client';

import * as React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { ALIGNMENT_DIMENSIONS } from './constants';
import type { DimensionId } from './constants';

interface AlignmentRadarChartProps {
  scores: Record<DimensionId, number>;
  showBenchmark?: boolean;
}

interface ChartDataPoint {
  dimension: string;
  shortName: string;
  score: number;
  benchmark: number;
  fullMark: number;
}

const BENCHMARK_VALUE = 3.0; // "Coordinated" level

/**
 * AlignmentRadarChart Component
 *
 * Displays a 5-axis radar chart showing dimension scores
 * with an optional benchmark overlay at the "Coordinated" level.
 *
 * Story 9.3: Radar Chart Visualization
 * Covers: FR2-8 (Radar chart visualization)
 */
export function AlignmentRadarChart({
  scores,
  showBenchmark = true,
}: AlignmentRadarChartProps) {
  // Transform scores into chart data format
  const chartData: ChartDataPoint[] = React.useMemo(() => {
    return ALIGNMENT_DIMENSIONS.map((dim) => ({
      dimension: dim.label,
      shortName: dim.label.replace(' Alignment', ''),
      score: scores[dim.id] ?? 0,
      benchmark: BENCHMARK_VALUE,
      fullMark: 4,
    }));
  }, [scores]);

  // Generate accessible description
  const accessibleDescription = React.useMemo(() => {
    const scoreDescriptions = ALIGNMENT_DIMENSIONS.map((dim) => {
      const score = scores[dim.id] ?? 0;
      return `${dim.label}: ${score} out of 4`;
    }).join(', ');
    return `Alignment scores radar chart showing 5 dimensions. ${scoreDescriptions}.`;
  }, [scores]);

  return (
    <figure
      className="w-full"
      role="img"
      aria-label={accessibleDescription}
    >
      {/* Screen reader description */}
      <figcaption className="sr-only">
        {accessibleDescription}
        {showBenchmark && ' Benchmark line shown at 3.0 (Coordinated level).'}
      </figcaption>

      <ResponsiveContainer width="100%" height={350}>
        <RadarChart
          data={chartData}
          margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
        >
          <PolarGrid
            stroke="hsl(var(--border))"
            strokeOpacity={0.5}
          />
          <PolarAngleAxis
            dataKey="shortName"
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 4]}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            tickCount={5}
            axisLine={false}
          />

          {/* Benchmark overlay */}
          {showBenchmark && (
            <Radar
              name="Benchmark (Coordinated)"
              dataKey="benchmark"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="none"
              dot={false}
            />
          )}

          {/* User scores */}
          <Radar
            name="Your Scores"
            dataKey="score"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
            dot={{
              fill: 'hsl(var(--primary))',
              strokeWidth: 0,
              r: 4,
            }}
            activeDot={{
              fill: 'hsl(var(--primary))',
              stroke: 'hsl(var(--background))',
              strokeWidth: 2,
              r: 6,
            }}
          />

          <Tooltip content={<CustomTooltip />} />

          {showBenchmark && (
            <Legend
              wrapperStyle={{ paddingTop: 20 }}
              formatter={(value: string) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </figure>
  );
}

/**
 * Custom tooltip for the radar chart
 */
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint; dataKey: string; value: number }>;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;
  const scoreLabel = getScoreLabel(data.score);

  return (
    <div className="rounded-lg border bg-background p-3 shadow-md">
      <p className="font-semibold">{data.dimension}</p>
      <p className="text-sm text-muted-foreground">
        Score: <span className="font-medium text-foreground">{data.score}</span> / 4
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Level: {scoreLabel}
      </p>
    </div>
  );
}

function getScoreLabel(score: number): string {
  switch (score) {
    case 1:
      return 'Chaos';
    case 2:
      return 'Siloed';
    case 3:
      return 'Coordinated';
    case 4:
      return 'Integrated';
    default:
      return 'Unknown';
  }
}
