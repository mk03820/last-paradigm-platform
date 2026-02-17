/**
 * Unsubscribe Page
 *
 * Allows users to manage their email preferences and unsubscribe
 * from marketing/nurture emails.
 *
 * Story 20.1: Email Template System
 * Task 3.3: Create unsubscribe page (AC: 5)
 * Covers: NFR30 (GDPR compliance)
 */

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [unsubscribeType, setUnsubscribeType] = useState<'all' | 'marketing' | 'nurture'>('all');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-fill from URL parameters
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const tokenParam = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (emailParam) setEmail(emailParam);
    if (tokenParam) setToken(tokenParam);
    if (errorParam) {
      setStatus('error');
      setErrorMessage(errorParam);
    }
  }, [searchParams]);

  const handleUnsubscribe = async () => {
    if (!email) {
      setStatus('error');
      setErrorMessage('Please enter your email address.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/email/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, type: unsubscribeType }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Failed to unsubscribe. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('An error occurred. Please try again later.');
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Unsubscribed Successfully</CardTitle>
            <CardDescription>
              You have been unsubscribed from our marketing emails.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              You will continue to receive important transactional emails
              (such as purchase confirmations and password resets).
            </p>
            <Button asChild variant="outline">
              <a href="/">Return to Homepage</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">
            The Last Paradigm
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Email Preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'error' && errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                disabled={status === 'loading'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Unsubscribe From
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="type"
                    value="all"
                    checked={unsubscribeType === 'all'}
                    onChange={() => setUnsubscribeType('all')}
                    className="h-4 w-4"
                    disabled={status === 'loading'}
                  />
                  <span className="text-sm">All marketing emails</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="type"
                    value="nurture"
                    checked={unsubscribeType === 'nurture'}
                    onChange={() => setUnsubscribeType('nurture')}
                    className="h-4 w-4"
                    disabled={status === 'loading'}
                  />
                  <span className="text-sm">Educational nurture emails only</span>
                </label>
              </div>
            </div>
          </div>

          <Button
            onClick={handleUnsubscribe}
            disabled={status === 'loading' || !email}
            className="w-full"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Unsubscribe'
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            You will still receive transactional emails such as purchase
            confirmations and account updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  );
}
