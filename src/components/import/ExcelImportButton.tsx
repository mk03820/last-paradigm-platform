'use client';

/**
 * Excel Import Button
 *
 * Provides file upload interface for importing completed Excel templates.
 * Includes parsing, validation, preview, and confirmation flow.
 *
 * Covers: FR1.5-8, FR1.5-9, FR1.5-10
 */

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { parseExcelTemplate, isValidExcelFile, type ExcelParseResult } from '@/lib/templates/excel-parser';
import type { MeetingData } from '@/types/calculator.types';

interface ExcelImportButtonProps {
  onImport: (data: MeetingData) => void;
}

type ImportState = 'idle' | 'parsing' | 'preview' | 'error';

export function ExcelImportButton({ onImport }: ExcelImportButtonProps) {
  const [state, setState] = useState<ImportState>('idle');
  const [previewData, setPreviewData] = useState<MeetingData | null>(null);
  const [error, setError] = useState<{ message: string; details?: string[] } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!isValidExcelFile(file)) {
      setError({ message: 'Please select a valid Excel file (.xlsx)' });
      setState('error');
      setShowModal(true);
      return;
    }

    setState('parsing');
    setShowModal(true);
    setError(null);

    try {
      const buffer = await file.arrayBuffer();
      const result: ExcelParseResult = await parseExcelTemplate(buffer);

      if (result.success) {
        setPreviewData(result.data);
        setState('preview');
      } else {
        setError({ message: result.error.message, details: result.error.details });
        setState('error');
      }
    } catch (err) {
      setError({ message: 'Failed to read file. Please try again.' });
      setState('error');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirm = () => {
    if (previewData) {
      onImport(previewData);
      handleClose();
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setState('idle');
    setPreviewData(null);
    setError(null);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-label="Upload Excel template"
      />

      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={state === 'parsing'}
        aria-label="Import data from Excel template"
      >
        {state === 'parsing' ? 'Processing...' : 'Import from Excel'}
      </Button>

      {/* Modal Overlay */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <Card style={{ maxWidth: '500px', width: '100%', maxHeight: '90vh', overflow: 'auto' }}>
            {/* Parsing State */}
            {state === 'parsing' && (
              <CardContent style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⏳</div>
                <p>Processing your Excel file...</p>
              </CardContent>
            )}

            {/* Error State */}
            {state === 'error' && error && (
              <>
                <CardHeader>
                  <CardTitle id="import-modal-title" style={{ color: 'var(--destructive)' }}>
                    Import Error
                  </CardTitle>
                  <CardDescription>{error.message}</CardDescription>
                </CardHeader>
                <CardContent>
                  {error.details && error.details.length > 0 && (
                    <ul style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                      {error.details.map((detail, i) => (
                        <li key={i}>{detail}</li>
                      ))}
                    </ul>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <Button variant="outline" onClick={handleClose}>Close</Button>
                    <Button onClick={handleClick}>Try Another File</Button>
                  </div>
                </CardContent>
              </>
            )}

            {/* Preview State */}
            {state === 'preview' && previewData && (
              <>
                <CardHeader>
                  <CardTitle id="import-modal-title">Import Preview</CardTitle>
                  <CardDescription>Review the data extracted from your Excel file</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Meeting Details */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Meeting Details
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <div style={{ color: 'var(--muted-foreground)' }}>Number of Meetings:</div>
                      <div style={{ fontWeight: 500 }}>{previewData.meetingCount}</div>
                      <div style={{ color: 'var(--muted-foreground)' }}>Average Attendees:</div>
                      <div style={{ fontWeight: 500 }}>{previewData.averageAttendees}</div>
                      <div style={{ color: 'var(--muted-foreground)' }}>Duration:</div>
                      <div style={{ fontWeight: 500 }}>{previewData.averageDuration} minutes</div>
                    </div>
                  </div>

                  {/* Salary Distribution */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Salary Band Distribution
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <div style={{ color: 'var(--muted-foreground)' }}>Executive:</div>
                      <div style={{ fontWeight: 500 }}>{previewData.salaryDistribution.executive}</div>
                      <div style={{ color: 'var(--muted-foreground)' }}>Senior:</div>
                      <div style={{ fontWeight: 500 }}>{previewData.salaryDistribution.senior}</div>
                      <div style={{ color: 'var(--muted-foreground)' }}>Mid-Level:</div>
                      <div style={{ fontWeight: 500 }}>{previewData.salaryDistribution.midLevel}</div>
                      <div style={{ color: 'var(--muted-foreground)' }}>Entry:</div>
                      <div style={{ fontWeight: 500 }}>{previewData.salaryDistribution.entry}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleConfirm} className="bg-accent text-accent-foreground hover:bg-accent/90">
                      Apply Data
                    </Button>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
