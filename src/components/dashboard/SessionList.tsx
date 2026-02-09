'use client';

/**
 * Session List Component
 *
 * Displays a list of diagnostic sessions with loading and empty states.
 * Covers: AC1 (List of saved sessions)
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SessionCard } from './SessionCard';
import { DeleteSessionDialog } from './DeleteSessionDialog';
import { Loader2, FileQuestion } from 'lucide-react';
import type { SessionSummary } from '@/types/session.types';

interface SessionListProps {
  initialSessions?: SessionSummary[];
}

export function SessionList({ initialSessions }: SessionListProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionSummary[]>(initialSessions || []);
  const [loading, setLoading] = useState(!initialSessions);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!initialSessions) {
      fetchSessions();
    }
  }, [initialSessions]);

  async function fetchSessions() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/sessions');
      const data = await res.json();

      if (data.success) {
        setSessions(data.data.sessions);
      } else {
        setError(data.error?.message || 'Failed to load sessions');
      }
    } catch {
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }

  function handleContinue(sessionId: string) {
    // For now, route to the calculator with the session ID
    // In future, this will route to the appropriate tool based on progress
    router.push(`/calculator?session=${sessionId}`);
  }

  function handleDeleteClick(sessionId: string) {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm() {
    if (!sessionToDelete) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/sessions/${sessionToDelete}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSessions(sessions.filter((s) => s.id !== sessionToDelete));
      } else {
        const data = await res.json();
        setError(data.error?.message || 'Failed to delete session');
      }
    } catch {
      setError('Failed to delete session');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <button
          onClick={fetchSessions}
          className="mt-2 text-sm text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <FileQuestion className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No sessions yet</h3>
        <p className="text-muted-foreground">
          Start a new diagnostic to begin quantifying your alignment tax.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            onContinue={handleContinue}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      <DeleteSessionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </>
  );
}
