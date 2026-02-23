'use client';

/**
 * Tool 6 Session Loader
 *
 * Wrapper component that connects the generic DiagnosticSessionLoader
 * to the Tool 6 store for session persistence.
 *
 * C3-S7: Tool 6 session persistence integration
 */

import { DiagnosticSessionLoader } from '@/components/session';
import { useTool6Store } from '@/lib/store/tool6-store';

export function Tool6SessionLoader() {
  return (
    <DiagnosticSessionLoader
      useStore={useTool6Store}
      toolNumber={6}
    />
  );
}
