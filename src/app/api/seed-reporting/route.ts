/**
 * Temporary API route to seed reporting test data.
 *
 * Hit GET /api/seed-reporting?key=seed2026 to populate.
 * DELETE THIS ROUTE after seeding — not for production use.
 *
 * Seeds: analytics events, toolkit docs, email sequences,
 * funnel users with temporal spread, and email preferences.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  users,
  purchases,
  analyticsEvents,
  toolkitDocuments,
  emailSequences,
  nurtureEmails,
  emailPreferences,
  diagnosticResults,
} from '@/lib/db/schema';
import type { DiagnosticSessionData } from '@/lib/db/schema';
import { sql, eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

// Simple auth gate — don't leave this route exposed
const SEED_KEY = 'seed2026';

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('key') !== SEED_KEY) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 401 });
  }

  const log: string[] = [];

  try {
    // ── 1. Funnel Users ─────────────────────────────────────────────
    const funnelUsers = Array.from({ length: 20 }, (_, i) => ({
      id: `funnel-user-${String(i + 1).padStart(3, '0')}`,
      name: `Test User ${i + 1}`,
      email: `testuser${i + 1}@example.com`,
      createdDaysAgo: rand(0, 30),
      reachedPreview: Math.random() < 0.7,
      reachedCheckout: Math.random() < 0.35,
      reachedPurchase: Math.random() < 0.15,
    }));

    let usersCreated = 0;
    for (const u of funnelUsers) {
      try {
        const hash = await bcrypt.hash('Password123', 10);
        await db.insert(users).values({
          id: u.id,
          name: u.name,
          email: u.email,
          emailVerified: daysAgo(u.createdDaysAgo),
          passwordHash: hash,
          hasPb2Access: u.reachedPurchase,
          pb2PurchasedAt: u.reachedPurchase ? daysAgo(u.createdDaysAgo - 1) : null,
          purchaseStatus: u.reachedPurchase ? 'completed' : 'none',
          purchasedAt: u.reachedPurchase ? daysAgo(u.createdDaysAgo - 1) : null,
          createdAt: daysAgo(u.createdDaysAgo),
        });
        usersCreated++;
      } catch (e: any) {
        if (!e.message?.includes('unique') && !e.message?.includes('duplicate')) throw e;
      }
    }
    log.push(`Users: ${usersCreated} created`);

    // ── 2. Analytics Events ────────────────────────────────────────
    const events: Array<{
      eventName: string;
      eventData: Record<string, unknown>;
      userId: string | null;
      sessionId: string | null;
      timestamp: Date;
    }> = [];

    for (const u of funnelUsers.filter(x => x.reachedPreview)) {
      events.push({
        eventName: 'preview_viewed',
        eventData: { source: 'seed' },
        userId: u.id,
        sessionId: `sess_${u.id}`,
        timestamp: daysAgo(Math.max(u.createdDaysAgo - 1, 0)),
      });
      if (Math.random() < 0.4) {
        events.push({
          eventName: 'preview_viewed',
          eventData: { source: 'seed', repeat: true },
          userId: u.id,
          sessionId: `sess_${u.id}_2`,
          timestamp: daysAgo(Math.max(u.createdDaysAgo - 2, 0)),
        });
      }
    }

    for (const u of funnelUsers.filter(x => x.reachedCheckout)) {
      events.push({
        eventName: 'checkout_started',
        eventData: { source: 'seed', amount: 250000 },
        userId: u.id,
        sessionId: `sess_${u.id}`,
        timestamp: daysAgo(Math.max(u.createdDaysAgo - 2, 0)),
      });
    }

    // Events for original seed users
    for (const uid of ['user-001', 'user-002', 'user-003', 'user-004']) {
      events.push({
        eventName: 'preview_viewed',
        eventData: { source: 'seed' },
        userId: uid,
        sessionId: `sess_${uid}`,
        timestamp: daysAgo(rand(5, 25)),
      });
    }
    for (const uid of ['user-001', 'user-003']) {
      events.push({
        eventName: 'checkout_started',
        eventData: { source: 'seed' },
        userId: uid,
        sessionId: `sess_${uid}`,
        timestamp: daysAgo(rand(3, 20)),
      });
    }

    if (events.length > 0) {
      await db.insert(analyticsEvents).values(events);
    }
    log.push(`Analytics events: ${events.length} created`);

    // ── 3. Purchases with temporal spread ──────────────────────────
    let purchasesCreated = 0;
    for (const u of funnelUsers.filter(x => x.reachedPurchase)) {
      const purchaseDate = daysAgo(Math.max(u.createdDaysAgo - 2, 0));
      try {
        await db.insert(purchases).values({
          userId: u.id,
          stripeSessionId: `cs_test_fnl_${u.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          stripePaymentIntentId: `pi_test_fnl_${u.id}`,
          stripeCustomerId: `cus_test_fnl_${u.id}`,
          amount: 250000,
          currency: 'usd',
          status: 'completed',
          metadata: { source: 'seed_reporting' },
          createdAt: purchaseDate,
          completedAt: purchaseDate,
        });
        purchasesCreated++;
      } catch (e: any) {
        if (!e.message?.includes('unique') && !e.message?.includes('duplicate')) throw e;
      }
    }
    log.push(`Purchases: ${purchasesCreated} created`);

    // ── 4. Toolkit Documents ───────────────────────────────────────
    const allPurchases = await db
      .select({ id: purchases.id, userId: purchases.userId })
      .from(purchases)
      .where(eq(purchases.status, 'completed'));

    const docTemplates = [
      { type: 'word' as const, name: 'Strategic Alignment Assessment Report' },
      { type: 'word' as const, name: 'Meeting Optimization Playbook' },
      { type: 'word' as const, name: 'Decision Velocity Improvement Plan' },
      { type: 'word' as const, name: 'Stakeholder Engagement Strategy' },
      { type: 'word' as const, name: 'Communication Health Action Plan' },
      { type: 'excel' as const, name: 'Alignment Tax Calculator' },
      { type: 'excel' as const, name: 'Meeting Cost Analysis Workbook' },
      { type: 'excel' as const, name: 'ROI Projection Model' },
      { type: 'pptx' as const, name: 'Board Summary Presentation' },
      { type: 'pdf' as const, name: 'Executive Summary Report' },
    ];

    let docsCreated = 0;
    for (const p of allPurchases) {
      for (const doc of docTemplates.slice(0, rand(5, 10))) {
        const isComplete = Math.random() < 0.8;
        try {
          await db.insert(toolkitDocuments).values({
            purchaseId: p.id,
            userId: p.userId,
            documentType: doc.type,
            documentName: doc.name,
            status: isComplete ? 'completed' : (Math.random() < 0.5 ? 'generating' : 'pending'),
            s3Key: isComplete ? `toolkits/${p.userId}/${doc.name.toLowerCase().replace(/\s+/g, '-')}` : null,
            fileSizeBytes: isComplete ? rand(50000, 500000) : null,
            attempts: isComplete ? 1 : 0,
            generatedAt: isComplete ? daysAgo(rand(0, 5)) : null,
          });
          docsCreated++;
        } catch { /* skip dups */ }
      }
    }
    log.push(`Toolkit docs: ${docsCreated} created across ${allPurchases.length} purchases`);

    // ── 5. Email Sequences & Nurture Emails ────────────────────────
    const purchasedUserIds = [
      ...funnelUsers.filter(u => u.reachedPurchase).map(u => u.id),
      'user-001',
      'user-003',
    ];

    let seqCount = 0, emailCount = 0;
    const emailDays = [0, 3, 7, 10, 14];
    const subjects = [
      'Welcome to Your Alignment Toolkit',
      'Getting Started: Your First Assessment Review',
      'Maximizing Your ROI: Advanced Strategies',
      'How Top Leaders Use Alignment Data',
      'Your 14-Day Progress Check-In',
    ];

    for (const userId of purchasedUserIds) {
      try {
        const seqId = crypto.randomUUID();
        const startDate = daysAgo(rand(1, 14));
        const currentStep = rand(1, 5);

        await db.insert(emailSequences).values({
          id: seqId,
          userId,
          sequenceType: 'post_purchase',
          currentStep,
          totalSteps: 5,
          status: currentStep >= 5 ? 'completed' : 'active',
          lastSentAt: daysAgo(rand(0, 3)),
          nextSendAt: currentStep < 5 ? daysAgo(-rand(1, 4)) : null,
          completedAt: currentStep >= 5 ? new Date() : null,
          createdAt: startDate,
        });
        seqCount++;

        for (let step = 0; step < currentStep; step++) {
          const sentDate = new Date(startDate.getTime() + emailDays[step] * 86400000);
          const opened = Math.random() < 0.6;
          const clicked = opened && Math.random() < 0.3;

          await db.insert(nurtureEmails).values({
            sequenceId: seqId,
            userId,
            emailDay: emailDays[step],
            subject: subjects[step],
            sentAt: sentDate,
            deliveredAt: sentDate,
            openedAt: opened ? new Date(sentDate.getTime() + rand(1, 48) * 3600000) : null,
            clickedAt: clicked ? new Date(sentDate.getTime() + rand(2, 72) * 3600000) : null,
            status: clicked ? 'clicked' : opened ? 'opened' : 'delivered',
            resendMessageId: `msg_test_${userId}_${step}`,
          });
          emailCount++;
        }
      } catch { /* skip dups */ }
    }
    log.push(`Email sequences: ${seqCount}, nurture emails: ${emailCount}`);

    // ── 6. Email Preferences ───────────────────────────────────────
    const allUserEmails = [
      ...funnelUsers.map(u => ({ id: u.id, email: u.email })),
      { id: 'user-001', email: 'john@example.com' },
      { id: 'user-002', email: 'jane@example.com' },
      { id: 'user-003', email: 'bob@example.com' },
      { id: 'user-004', email: 'alice@example.com' },
    ];

    let prefsCreated = 0;
    for (const u of allUserEmails) {
      try {
        await db.insert(emailPreferences).values({
          email: u.email,
          userId: u.id,
          unsubscribeToken: `unsub_${crypto.randomUUID()}`,
          marketingOptOut: Math.random() < 0.1,
          nurturOptOut: Math.random() < 0.05,
          transactionalOnly: false,
        });
        prefsCreated++;
      } catch { /* skip dups */ }
    }
    log.push(`Email preferences: ${prefsCreated}`);

    // ── 7. Diagnostic Results for purchasers ───────────────────────
    let resultsCreated = 0;
    for (const u of funnelUsers.filter(x => x.reachedPurchase)) {
      try {
        const totalCost = rand(150000, 600000);
        const data: DiagnosticSessionData = {
          tool1: {
            scores: { strategic: rand(60, 95), execution: rand(50, 90), technology: rand(55, 95), people: rand(45, 85), governance: rand(50, 90) },
            dimensions: { strategic: rand(60, 90), structural: rand(55, 85), processAlignment: rand(50, 80), cultural: rand(45, 75), technological: rand(60, 90) },
            compositeScore: rand(55, 85),
            interpretation: 'moderate',
            completedAt: new Date().toISOString(),
          },
          tool2: {
            inputs: { meetingCount: rand(20, 70), averageAttendees: rand(4, 9), averageDuration: rand(30, 60), salaryDistribution: { executive: 15, senior: 25, midLevel: 40, entry: 20 } },
            results: { totalMeetingHours: rand(200, 800), totalMeetingCost: rand(30000, 120000), wastedHours: rand(60, 300), wastedCost: rand(9000, 45000), effectiveHours: rand(140, 500), effectiveCost: rand(21000, 75000), totalMeetings: rand(20, 70), avgAttendees: rand(4, 9), inefficiencyPercent: rand(20, 50), avgDuration: rand(30, 60) },
            completedAt: new Date().toISOString(),
          },
          tool3: {
            decisions: [{ name: 'Budget Approval', daysToDecide: 14, complexity: 'high' }],
            overallVelocityScore: rand(40, 80),
            archetypes: { strategic: { median: 21, p90: 45, samples: 5 }, operational: { median: 7, p90: 14, samples: 12 } },
            bottlenecks: [{ pattern: 'Executive Bottleneck', severity: 'high', description: 'Decisions stall at exec level' }],
            completedAt: new Date().toISOString(),
          },
          tool4: {
            stakeholders: [{ name: 'CEO', role: 'Sponsor', power: 95, interest: 80, sentiment: 'supportive', quadrant: 'manage_closely' }],
            quadrantSummary: { manageClosely: 3, keepSatisfied: 1, keepInformed: 1, monitor: 0 },
            riskCount: 1,
            completedAt: new Date().toISOString(),
          },
          tool5: {
            journeys: [{ name: 'Customer Onboarding', frictionScore: 7, bottlenecks: 3 }],
            totalFrictionCost: rand(50000, 150000),
            frictionByCategory: { manual_handoffs: 35, system_integrations: 25, approval_delays: 20, data_quality: 20 },
            completedAt: new Date().toISOString(),
          },
          tool6: {
            metrics: { email: { volume: 250, avgResponseTime: 4.5 }, chat: { volume: 150, avgResponseTime: 0.5 } },
            antiPatterns: [{ pattern: 'Email Overload', severity: 'high', recommendation: 'Implement chat-first policy' }],
            healthScore: rand(50, 80),
            completedAt: new Date().toISOString(),
          },
          tool7: {
            totalCost,
            alignmentTaxPercent: rand(5, 20),
            interpretation: totalCost > 400000 ? 'critical' : 'significant',
            costBreakdown: { meetingWaste: rand(20000, 80000), decisionDelay: rand(25000, 75000), communicationOverhead: rand(20000, 60000), frictionCost: rand(40000, 120000), projectDelays: rand(50000, 150000), rework: rand(30000, 90000), turnover: rand(60000, 180000), opportunityCost: rand(75000, 225000) },
            roiProjection: { conservative: totalCost * 0.3, moderate: totalCost * 0.5, aggressive: totalCost * 0.7, paybackMonths: 8 },
            completedAt: new Date().toISOString(),
          },
        };

        await db.insert(diagnosticResults).values({
          userId: u.id,
          toolResults: data,
          totalAlignmentTax: totalCost.toString(),
          estimatedSavings: (totalCost * 0.5).toString(),
        });
        resultsCreated++;
      } catch { /* skip dups */ }
    }
    log.push(`Diagnostic results: ${resultsCreated}`);

    return NextResponse.json({
      success: true,
      message: 'Reporting data seeded successfully',
      details: log,
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: log,
    }, { status: 500 });
  }
}
