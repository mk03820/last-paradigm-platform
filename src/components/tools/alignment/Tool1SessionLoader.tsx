'use client';

/**
 * Tool 1 Session Loader
 *
 * Wrapper component that connects the generic DiagnosticSessionLoader
 * to the Tool 1 store for session persistence.
 *
 * C3-S3: Tool 1 session persistence integration
 */

import { DiagnosticSessionLoader } from '@/components/session';
import { useTool1Store } from '@/lib/store/tool1-store';

export function Tool1SessionLoader() {
  return (
    <DiagnosticSessionLoader
      useStore={useTool1Store}
      toolNumber={1}
    />
  );
}
