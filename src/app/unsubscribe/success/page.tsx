/**
 * Unsubscribe Success Page
 *
 * Displayed after successful one-click unsubscribe.
 *
 * Story 20.1: Email Template System
 * Task 3: Implement unsubscribe mechanism (AC: 5)
 * Covers: NFR30 (GDPR compliance)
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function UnsubscribeSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Unsubscribed Successfully</CardTitle>
          <CardDescription>
            Your email preferences have been updated.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            You have been unsubscribed from our marketing and nurture emails.
            You will continue to receive important transactional emails
            (such as purchase confirmations and password resets).
          </p>

          <div className="pt-4">
            <Button asChild variant="outline">
              <Link href="/">Return to Homepage</Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-4">
            Changed your mind? Contact us at{' '}
            <a href="mailto:support@lastparadigm.com" className="text-primary underline">
              support@lastparadigm.com
            </a>{' '}
            to resubscribe.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
