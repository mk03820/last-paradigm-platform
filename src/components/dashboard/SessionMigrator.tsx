'use client';

/**
 * Session Migrator Component
 *
 * Automatically migrates anonymous calculator data to the user's account
 * when they sign in. Runs once on mount and shows a brief status message.
 *
 * Covers: FR2-4 (Cross-device continuity), FR2-5 (Anonymous access)
 * Story 8.3: AC2 (Auto-migrate on authentication), AC5 (SessionStorage saved to server)
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCalculatorStore } from '@/lib/store/calculator-store';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';

type MigrationStatus = 'idle' | 'migrating' | 'success' | 'error' | 'no-data';

export function SessionMigrator() {
  const [status, setStatus] = useState<MigrationStatus>('idle');
  const [message, setMessage] = useState<string>('');
  const router = useRouter();
  const { meetingData, results, migrateToServer, clearSession } = useCalculatorStore();

  useEffect(() => {
    async function migrate() {
      // Check if there's data to migrate
      if (!meetingData && !results) {
        setStatus('no-data');
        return;
      }

      setStatus('migrating');
      setMessage('Saving your progress...');

      try {
        const sessionId = await migrateToServer();

        if (sessionId) {
          setStatus('success');
          setMessage('Your Meeting Audit data has been saved!');

          // Clear the local sessionStorage since data is now on server
          clearSession();

          // Refresh the page to show the new session in the list
          router.refresh();

          // Hide the message after a delay
          setTimeout(() => {
            setStatus('idle');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Could not save your progress. Please try again.');
        }
      } catch (error) {
        console.error('[SessionMigrator] Migration failed:', error);
        setStatus('error');
        setMessage('Could not save your progress. Please try again.');
      }
    }

    // Only run migration once on mount
    migrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - run once on mount

  // Don't render anything if idle, no data, or already completed
  if (status === 'idle' || status === 'no-data') {
    return null;
  }

  return (
    <Card className="mb-6 border-primary/30 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {status === 'migrating' && (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          )}
          {status === 'success' && (
            <Check className="w-5 h-5 text-green-500" />
          )}
          {status === 'error' && (
            <span className="w-5 h-5 text-destructive">!</span>
          )}
          <span className="text-sm font-medium">{message}</span>
        </div>
      </CardContent>
    </Card>
  );
}
