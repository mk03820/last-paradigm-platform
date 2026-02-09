'use client';

/**
 * Session Manager Component
 *
 * Provides session save/load functionality via JSON export/import.
 * Accessible from calculator page header as a dropdown menu.
 *
 * Covers: FR1.5-11 (export), FR1.5-12 (import), FR1.5-13 (preserve data)
 */

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useCalculatorStore } from '@/lib/store/calculator-store';

interface SessionData {
  version: '1.0';
  exportedAt: string;
  meetingData: ReturnType<typeof useCalculatorStore.getState>['meetingData'];
  results: ReturnType<typeof useCalculatorStore.getState>['results'];
}

export function SessionManager() {
  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { meetingData, results, setMeetingData, setResults } = useCalculatorStore();

  const handleExport = () => {
    const sessionData: SessionData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      meetingData,
      results,
    };

    const json = JSON.stringify(sessionData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Generate filename with timestamp
    const date = new Date().toISOString().split('T')[0];
    const filename = `meeting-audit-session-${date}.json`;

    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setSuccess('Session saved successfully');
    setShowMenu(false);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.json')) {
      setError('Please select a valid JSON file');
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text) as SessionData;

      // Validate structure
      if (data.version !== '1.0') {
        setError('Unsupported session file version');
        return;
      }

      // Restore session
      if (data.meetingData) {
        setMeetingData(data.meetingData);
      }
      if (data.results) {
        setResults(data.results);
      }

      setSuccess('Session loaded successfully');
      setShowMenu(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to load session file. Please check the file format.');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-label="Load session from file"
      />

      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowMenu(!showMenu)}
        aria-expanded={showMenu}
        aria-haspopup="menu"
        title="Session options"
      >
        Session ▾
      </Button>

      {/* Dropdown Menu */}
      {showMenu && (
        <>
          {/* Backdrop to close menu */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 40,
            }}
            onClick={() => setShowMenu(false)}
          />

          <div
            role="menu"
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.25rem',
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              minWidth: '160px',
              zIndex: 50,
              overflow: 'hidden',
            }}
          >
            <button
              role="menuitem"
              onClick={handleExport}
              style={{
                width: '100%',
                padding: '0.625rem 1rem',
                textAlign: 'left',
                fontSize: '0.875rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--muted)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              💾 Save Session
            </button>
            <button
              role="menuitem"
              onClick={handleImportClick}
              style={{
                width: '100%',
                padding: '0.625rem 1rem',
                textAlign: 'left',
                fontSize: '0.875rem',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--muted)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              📂 Load Session
            </button>
          </div>
        </>
      )}

      {/* Success Message */}
      {success && (
        <div
          style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            zIndex: 100,
          }}
        >
          ✓ {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          style={{
            position: 'fixed',
            bottom: '1rem',
            right: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--destructive)',
            color: 'var(--destructive-foreground)',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            zIndex: 100,
          }}
        >
          ✗ {error}
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: '0.5rem',
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
