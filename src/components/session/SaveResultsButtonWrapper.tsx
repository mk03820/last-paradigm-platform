/**
 * Save Results Button Wrapper
 *
 * Client-side wrapper for SaveResultsButton to be used in server components.
 * Handles the conditional rendering based on session data.
 *
 * Story 15.8: Pre-Account Results Preservation
 */

'use client';

import { SaveResultsButton } from './SaveResultsButton';

interface SaveResultsButtonWrapperProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showOnlyIfData?: boolean;
}

export function SaveResultsButtonWrapper(props: SaveResultsButtonWrapperProps) {
  return <SaveResultsButton {...props} />;
}
