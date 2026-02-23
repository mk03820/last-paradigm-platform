'use client';

/**
 * New Session Button Component
 *
 * Creates a new diagnostic session and redirects to begin.
 * Covers: AC4 (Start new diagnostic)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';

export function NewSessionButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (data.success) {
        // Redirect to diagnostic hub with new session
        // TODO: C3-S9 will add smart routing to start at Tool 1
        router.push(`/diagnostic?session=${data.data.session.id}`);
      } else {
        setError(data.error?.message || 'Failed to create session');
      }
    } catch {
      setError('Failed to create session');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleClick}
        disabled={loading}
        size="lg"
        className="gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Start New Diagnostic
          </>
        )}
      </Button>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
