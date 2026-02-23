'use client';

/**
 * Tool 4 Session Loader
 *
 * Wrapper component that connects the generic DiagnosticSessionLoader
 * to the Tool 4 store for session persistence.
 *
 * C3-S5: Tool 4 session persistence integration
 */

import { DiagnosticSessionLoader } from '@/components/session';
import { useTool4Store } from '@/lib/store/tool4-store';

export function Tool4SessionLoader() {
  return (
    <DiagnosticSessionLoader
      useStore={useTool4Store}
      toolNumber={4}
    />
  );
}
