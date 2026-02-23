'use client';

/**
 * Tool 5 Session Loader
 *
 * Wrapper component that connects the generic DiagnosticSessionLoader
 * to the Tool 5 store for session persistence.
 *
 * C3-S6: Tool 5 session persistence integration
 */

import { DiagnosticSessionLoader } from '@/components/session';
import { useTool5Store } from '@/lib/store/tool5-store';

export function Tool5SessionLoader() {
  return (
    <DiagnosticSessionLoader
      useStore={useTool5Store}
      toolNumber={5}
    />
  );
}
