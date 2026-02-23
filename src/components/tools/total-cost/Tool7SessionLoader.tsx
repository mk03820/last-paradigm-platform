'use client';

/**
 * Tool 7 Session Loader
 *
 * Wrapper component that connects the generic DiagnosticSessionLoader
 * to the Tool 7 store for session persistence.
 *
 * C3-S8: Tool 7 session persistence integration
 */

import { DiagnosticSessionLoader } from '@/components/session';
import { useTool7Store } from '@/lib/store/tool7-store';

export function Tool7SessionLoader() {
  return (
    <DiagnosticSessionLoader
      useStore={useTool7Store}
      toolNumber={7}
    />
  );
}
