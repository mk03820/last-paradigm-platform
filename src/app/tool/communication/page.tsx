/**
 * Tool 6: Communication Pattern Diagnostic - Main Page
 *
 * Entry point for entering communication metrics across email, chat, and meetings.
 *
 * Story 13.1: Communication Metrics Input
 * Task 7: Create Tool 6 main page (AC: all)
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout';
import { ProgressStepper, ToolGuidance } from '@/components/diagnostic';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  EmailMetricsForm,
  ChatMetricsForm,
  MeetingMetricsForm,
  MetricsSection,
  getSectionStatus,
} from '@/components/tools/communication';
import {
  METRICS_SECTIONS,
  createDefaultEmailMetrics,
  createDefaultChatMetrics,
  createDefaultMeetingMetrics,
  isEmailMetricsComplete,
  isChatMetricsComplete,
  isMeetingMetricsComplete,
} from '@/components/tools/communication/comm-constants';
import { useTool6Store } from '@/lib/store/tool6-store';

export default function CommunicationPage() {
  const router = useRouter();

  // Store state
  const email = useTool6Store((state) => state.email);
  const chat = useTool6Store((state) => state.chat);
  const meetings = useTool6Store((state) => state.meetings);
  const updateEmailField = useTool6Store((state) => state.updateEmailField);
  const updateChatField = useTool6Store((state) => state.updateChatField);
  const updateMeetingField = useTool6Store((state) => state.updateMeetingField);
  const pullFromTool2 = useTool6Store((state) => state.pullFromTool2);
  const isComplete = useTool6Store((state) => state.isComplete);
  const getCompletedSectionsCount = useTool6Store((state) => state.getCompletedSectionsCount);

  // Get current metrics with defaults
  const currentEmail = email || createDefaultEmailMetrics();
  const currentChat = chat || createDefaultChatMetrics();
  const currentMeetings = meetings || createDefaultMeetingMetrics();

  // Calculate section statuses
  const emailComplete = isEmailMetricsComplete(email);
  const chatComplete = isChatMetricsComplete(chat);
  const meetingsComplete = isMeetingMetricsComplete(meetings);

  const emailStatus = getSectionStatus(!!email, emailComplete);
  const chatStatus = getSectionStatus(!!chat, chatComplete);
  const meetingsStatus = getSectionStatus(!!meetings, meetingsComplete);

  // Progress tracking
  const completedCount = getCompletedSectionsCount();
  const totalSections = 3;
  const progressPercent = (completedCount / totalSections) * 100;

  const canContinue = isComplete();

  const handleContinue = () => {
    // Navigate to analysis page (Story 13.2)
    router.push('/tool/communication/analysis');
  };

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-56px)] bg-background">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Back Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              href="/diagnostic"
              className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <span aria-hidden="true">&larr;</span>
              Back to Diagnostic Hub
            </Link>
          </nav>

          {/* Progress Stepper */}
          <div className="mb-6">
            <ProgressStepper currentToolId="communication" />
          </div>

          {/* Tool Guidance */}
          <ToolGuidance toolId="communication" className="mb-6" />

          {/* Page Header */}
          <header className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Communication Pattern Diagnostic
            </h1>
            <p className="mt-2 text-muted-foreground">
              Analyze how information flows through your organization across
              email, chat, and meetings. Identify communication friction that
              slows decisions and creates rework.
            </p>
          </header>

          {/* Overall Progress */}
          <div className="mb-8 p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedCount} of {totalSections} sections complete
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Metrics Sections */}
          <div className="space-y-4 mb-8">
            {/* Email Section */}
            <MetricsSection
              id="email"
              title={METRICS_SECTIONS[0].title}
              icon={METRICS_SECTIONS[0].icon}
              description={METRICS_SECTIONS[0].description}
              status={emailStatus}
              defaultOpen
            >
              <EmailMetricsForm
                metrics={currentEmail}
                onChange={updateEmailField}
              />
            </MetricsSection>

            {/* Chat Section */}
            <MetricsSection
              id="chat"
              title={METRICS_SECTIONS[1].title}
              icon={METRICS_SECTIONS[1].icon}
              description={METRICS_SECTIONS[1].description}
              status={chatStatus}
            >
              <ChatMetricsForm
                metrics={currentChat}
                onChange={updateChatField}
              />
            </MetricsSection>

            {/* Meetings Section */}
            <MetricsSection
              id="meetings"
              title={METRICS_SECTIONS[2].title}
              icon={METRICS_SECTIONS[2].icon}
              description={METRICS_SECTIONS[2].description}
              status={meetingsStatus}
            >
              <MeetingMetricsForm
                metrics={currentMeetings}
                onChange={updateMeetingField}
                onPullFromTool2={pullFromTool2}
              />
            </MetricsSection>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Link href="/diagnostic" passHref legacyBehavior>
              <Button variant="outline" asChild>
                <a>
                  <span aria-hidden="true" className="mr-2">&larr;</span>
                  Back to Tool Hub
                </a>
              </Button>
            </Link>

            <Button
              onClick={handleContinue}
              disabled={!canContinue}
              size="lg"
            >
              Continue to Analysis
              <span aria-hidden="true" className="ml-2">&rarr;</span>
            </Button>
          </div>

          {/* Completion hint */}
          {!canContinue && (
            <p className="mt-4 text-sm text-muted-foreground text-right">
              Complete all three sections to continue to analysis
            </p>
          )}
        </div>
      </main>
    </>
  );
}
