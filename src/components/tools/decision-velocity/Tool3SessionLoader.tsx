'use client';

/**
 * Tool 3 Session Loader
 *
 * Wrapper component that connects the generic DiagnosticSessionLoader
 * to the Tool 3 store for session persistence.
 *
 * C3-S4: Tool 3 session persistence integration
 */

import { DiagnosticSessionLoader } from '@/components/session';
import { useTool3Store } from '@/lib/store/tool3-store';

export function Tool3SessionLoader() {
  return (
    <DiagnosticSessionLoader
      useStore={useTool3Store}
      toolNumber={3}
    />
  );
}
