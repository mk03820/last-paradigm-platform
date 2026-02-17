/**
 * ShareResultsButton Component
 *
 * Generates a shareable read-only link for diagnostic results.
 *
 * Story 19.2: Diagnostic Results Display
 * Task 5: Implement share functionality (AC: 5)
 * Covers: FR64 (Results sharing)
 */

'use client';

import { useState } from 'react';
import { Share2, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ShareResultsButtonProps {
  diagnosticResultId: string;
  userId?: string;
}

export function ShareResultsButton({ diagnosticResultId }: ShareResultsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateShareLink = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/results/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ diagnosticResultId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate share link');
      }

      const data = await response.json();
      setShareUrl(data.shareUrl);
    } catch (err) {
      setError('Error generating share link. Please try again.');
      console.error('Share link error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !shareUrl) {
      generateShareLink();
    }
    if (!open) {
      setCopied(false);
    }
  };

  const copyToClipboard = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share Results
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" aria-labelledby="share-dialog-title">
        <DialogHeader>
          <DialogTitle id="share-dialog-title">Share Your Results</DialogTitle>
          <DialogDescription>
            Share a read-only view of your diagnostic results. Recipients will see your
            findings but cannot edit or access your account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Generating share link...
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
              {error}
            </div>
          )}

          {shareUrl && !isLoading && (
            <>
              <div className="space-y-2">
                <Label htmlFor="share-link">Share Link</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="share-link"
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={copyToClipboard}
                    aria-label="Copy share link"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>This link will expire in 7 days.</p>
                <p>Anyone with this link can view your results (read-only).</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
