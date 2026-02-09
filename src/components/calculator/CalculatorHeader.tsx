'use client';

/**
 * Calculator Header Component
 *
 * Page header for the calculator with title, description, and action buttons
 * for importing/exporting data.
 *
 * Covers: FR1.5-8 (import), FR1.5-11 (export), FR1.5-12 (import session)
 */

import { useCalculatorStore } from '@/lib/store/calculator-store';
import { ExcelImportButton } from '@/components/import/ExcelImportButton';
import { SessionManager } from '@/components/session/SessionManager';
import type { MeetingAuditInput } from '@/types/calculator.types';

export function CalculatorHeader() {
  const { setMeetingData } = useCalculatorStore();

  const handleImport = (data: MeetingAuditInput) => {
    setMeetingData(data);
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ textAlign: 'center', flex: 1 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.5rem' }}>
            Meeting Audit Calculator
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--muted-foreground)' }}>
            Calculate the alignment tax on your organization&apos;s meetings.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <ExcelImportButton onImport={handleImport} />
        <SessionManager />
      </div>
    </div>
  );
}
