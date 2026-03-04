/**
 * Reporting Test Data Seed Script
 *
 * Adds the data needed to exercise admin reporting / conversion funnel:
 * - Analytics events (preview_viewed, checkout_started) with temporal spread
 * - Toolkit documents for download tracking
 * - Purchases spread across 30 days for trend charts
 * - Email sequences & nurture emails
 * - Additional users to make funnel ratios realistic
 *
 * ADDITIVE: Does not clear existing data. Run after seed-staging.ts or standalone.
 * Run with: npx tsx scripts/seed-reporting-data.ts
 */

import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import * as schema from '../src/lib/db/schema';
import bcrypt from 'bcrypt';

const db = drizzle(sql, { schema });

// ============================================================================
// Helpers
// ============================================================================

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomId(): string {
  return crypto.randomUUID();
}

// ============================================================================
// Additional Users — fills out the funnel with realistic drop-off
// ============================================================================

const FUNNEL_USERS = Array.from({ length: 20 }, (_, i) => ({
  id: `funnel-user-${String(i + 1).padStart(3, '0')}`,
  name: `Test User ${i + 1}`,
  email: `testuser${i + 1}@example.com`,
  password: 'Password123',
  // Stagger creation dates across 30 days
  createdDaysAgo: randomBetween(0, 30),
  // Funnel progression: most create account, fewer preview, fewer checkout, fewest buy
  reachedPreview: Math.random() < 0.7,
  reachedCheckout: Math.random() < 0.35,
  reachedPurchase: Math.random() < 0.15,
}));

// ============================================================================
// Seed Functions
// ============================================================================

async function seedFunnelUsers() {
  console.log('Seeding funnel users...');
  let created = 0;

  for (const user of FUNNEL_USERS) {
    try {
      const passwordHash = await bcrypt.hash(user.password, 10);
      await db.insert(schema.users).values({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: daysAgo(user.createdDaysAgo),
        passwordHash,
        hasPb2Access: user.reachedPurchase,
        pb2PurchasedAt: user.reachedPurchase ? daysAgo(user.createdDaysAgo - 1) : null,
        purchaseStatus: user.reachedPurchase ? 'completed' : 'none',
        purchasedAt: user.reachedPurchase ? daysAgo(user.createdDaysAgo - 1) : null,
        createdAt: daysAgo(user.createdDaysAgo),
      });
      created++;
    } catch (e: any) {
      // Skip if user already exists (unique constraint on email)
      if (e.message?.includes('unique') || e.message?.includes('duplicate')) {
        console.log(`  Skipping existing user: ${user.email}`);
      } else {
        throw e;
      }
    }
  }
  console.log(`  Created ${created} funnel users`);
}

async function seedAnalyticsEvents() {
  console.log('Seeding analytics events...');

  const events: schema.NewAnalyticsEvent[] = [];

  // Generate preview_viewed events for users who reached preview stage
  for (const user of FUNNEL_USERS.filter(u => u.reachedPreview)) {
    const eventDate = daysAgo(Math.max(user.createdDaysAgo - 1, 0));
    events.push({
      eventName: 'preview_viewed',
      eventData: { source: 'seed', userId: user.id },
      userId: user.id,
      sessionId: `sess_${user.id}`,
      timestamp: eventDate,
    });
    // Some users view preview multiple times
    if (Math.random() < 0.4) {
      events.push({
        eventName: 'preview_viewed',
        eventData: { source: 'seed', userId: user.id, repeat: true },
        userId: user.id,
        sessionId: `sess_${user.id}_2`,
        timestamp: daysAgo(Math.max(user.createdDaysAgo - 2, 0)),
      });
    }
  }

  // Generate checkout_started events for users who reached checkout
  for (const user of FUNNEL_USERS.filter(u => u.reachedCheckout)) {
    events.push({
      eventName: 'checkout_started',
      eventData: { source: 'seed', userId: user.id, amount: 250000 },
      userId: user.id,
      sessionId: `sess_${user.id}`,
      timestamp: daysAgo(Math.max(user.createdDaysAgo - 2, 0)),
    });
  }

  // Also sprinkle in events for the original 4 seed users
  const originalUsers = ['user-001', 'user-002', 'user-003', 'user-004'];
  for (const uid of originalUsers) {
    events.push({
      eventName: 'preview_viewed',
      eventData: { source: 'seed', userId: uid },
      userId: uid,
      sessionId: `sess_${uid}`,
      timestamp: daysAgo(randomBetween(5, 25)),
    });
  }
  // user-001 and user-003 have purchases, so they went through checkout
  for (const uid of ['user-001', 'user-003']) {
    events.push({
      eventName: 'checkout_started',
      eventData: { source: 'seed', userId: uid, amount: 250000 },
      userId: uid,
      sessionId: `sess_${uid}`,
      timestamp: daysAgo(randomBetween(3, 20)),
    });
  }

  // Batch insert
  if (events.length > 0) {
    await db.insert(schema.analyticsEvents).values(events);
  }
  console.log(`  Created ${events.length} analytics events`);
}

async function seedPurchasesWithSpread() {
  console.log('Seeding time-spread purchases...');
  let created = 0;

  for (const user of FUNNEL_USERS.filter(u => u.reachedPurchase)) {
    const purchaseDate = daysAgo(Math.max(user.createdDaysAgo - 2, 0));
    try {
      await db.insert(schema.purchases).values({
        userId: user.id,
        stripeSessionId: `cs_test_funnel_${user.id}_${Date.now()}`,
        stripePaymentIntentId: `pi_test_funnel_${user.id}`,
        stripeCustomerId: `cus_test_funnel_${user.id}`,
        amount: 250000, // $2,500
        currency: 'usd',
        status: 'completed',
        metadata: { source: 'seed_reporting', userEmail: user.email },
        createdAt: purchaseDate,
        completedAt: purchaseDate,
      });
      created++;
    } catch (e: any) {
      if (e.message?.includes('unique') || e.message?.includes('duplicate')) {
        console.log(`  Skipping existing purchase for: ${user.email}`);
      } else {
        throw e;
      }
    }
  }
  console.log(`  Created ${created} time-spread purchases`);
}

async function seedToolkitDocuments() {
  console.log('Seeding toolkit documents...');

  // Get all completed purchases to attach docs to
  const completedPurchases = await db
    .select({ id: schema.purchases.id, userId: schema.purchases.userId })
    .from(schema.purchases)
    .where(sql`status = 'completed'`);

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

  let totalDocs = 0;

  for (const purchase of completedPurchases) {
    // Generate 5-10 docs per purchase (some still generating/pending)
    const docsToCreate = randomBetween(5, 10);
    const selectedDocs = docTemplates.slice(0, docsToCreate);

    for (const doc of selectedDocs) {
      const isComplete = Math.random() < 0.8;
      try {
        await db.insert(schema.toolkitDocuments).values({
          purchaseId: purchase.id,
          userId: purchase.userId,
          documentType: doc.type,
          documentName: doc.name,
          status: isComplete ? 'completed' : (Math.random() < 0.5 ? 'generating' : 'pending'),
          s3Key: isComplete ? `toolkits/${purchase.userId}/${doc.name.toLowerCase().replace(/\s+/g, '-')}.${doc.type === 'word' ? 'docx' : doc.type}` : null,
          fileSizeBytes: isComplete ? randomBetween(50000, 500000) : null,
          attempts: isComplete ? 1 : 0,
          generatedAt: isComplete ? daysAgo(randomBetween(0, 5)) : null,
        });
        totalDocs++;
      } catch (e: any) {
        // Skip duplicates
        if (!e.message?.includes('unique') && !e.message?.includes('duplicate')) {
          throw e;
        }
      }
    }
  }
  console.log(`  Created ${totalDocs} toolkit documents across ${completedPurchases.length} purchases`);
}

async function seedEmailSequences() {
  console.log('Seeding email sequences & nurture emails...');

  // Create nurture sequences for purchased users
  const purchasedUsers = FUNNEL_USERS.filter(u => u.reachedPurchase);
  // Also add original purchased users
  const allPurchasedUserIds = [
    ...purchasedUsers.map(u => u.id),
    'user-001',
    'user-003',
  ];

  let seqCount = 0;
  let emailCount = 0;

  for (const userId of allPurchasedUserIds) {
    try {
      const sequenceId = randomId();
      const startDate = daysAgo(randomBetween(1, 14));
      const currentStep = randomBetween(1, 5);

      await db.insert(schema.emailSequences).values({
        id: sequenceId,
        userId,
        sequenceType: 'post_purchase',
        currentStep,
        totalSteps: 5,
        status: currentStep >= 5 ? 'completed' : 'active',
        lastSentAt: daysAgo(randomBetween(0, 3)),
        nextSendAt: currentStep < 5 ? daysAgo(-randomBetween(1, 4)) : null,
        completedAt: currentStep >= 5 ? daysAgo(0) : null,
        createdAt: startDate,
      });
      seqCount++;

      // Create individual nurture emails for steps completed so far
      const emailDays = [0, 3, 7, 10, 14];
      const subjects = [
        'Welcome to Your Alignment Toolkit',
        'Getting Started: Your First Assessment Review',
        'Maximizing Your ROI: Advanced Strategies',
        'How Top Leaders Use Alignment Data',
        'Your 14-Day Progress Check-In',
      ];

      for (let step = 0; step < currentStep; step++) {
        const sentDate = new Date(startDate.getTime() + emailDays[step] * 24 * 60 * 60 * 1000);
        const wasOpened = Math.random() < 0.6;
        const wasClicked = wasOpened && Math.random() < 0.3;

        await db.insert(schema.nurtureEmails).values({
          sequenceId,
          userId,
          emailDay: emailDays[step],
          subject: subjects[step],
          sentAt: sentDate,
          deliveredAt: sentDate,
          openedAt: wasOpened ? new Date(sentDate.getTime() + randomBetween(1, 48) * 60 * 60 * 1000) : null,
          clickedAt: wasClicked ? new Date(sentDate.getTime() + randomBetween(2, 72) * 60 * 60 * 1000) : null,
          status: wasClicked ? 'clicked' : wasOpened ? 'opened' : 'delivered',
          resendMessageId: `msg_test_${userId}_${step}`,
        });
        emailCount++;
      }
    } catch (e: any) {
      if (!e.message?.includes('unique') && !e.message?.includes('duplicate')) {
        throw e;
      }
    }
  }
  console.log(`  Created ${seqCount} email sequences with ${emailCount} nurture emails`);
}

async function seedEmailPreferences() {
  console.log('Seeding email preferences...');
  let created = 0;

  const allUsers = [
    ...FUNNEL_USERS.map(u => ({ id: u.id, email: u.email })),
    { id: 'user-001', email: 'john@example.com' },
    { id: 'user-002', email: 'jane@example.com' },
    { id: 'user-003', email: 'bob@example.com' },
    { id: 'user-004', email: 'alice@example.com' },
  ];

  for (const user of allUsers) {
    try {
      await db.insert(schema.emailPreferences).values({
        email: user.email,
        userId: user.id,
        unsubscribeToken: `unsub_${randomId()}`,
        marketingOptOut: Math.random() < 0.1,
        nurturOptOut: Math.random() < 0.05,
        transactionalOnly: false,
      });
      created++;
    } catch (e: any) {
      if (e.message?.includes('unique') || e.message?.includes('duplicate')) {
        // skip
      } else {
        throw e;
      }
    }
  }
  console.log(`  Created ${created} email preferences`);
}

async function seedDiagnosticResultsForFunnelUsers() {
  console.log('Seeding diagnostic results for funnel purchasers...');
  let created = 0;

  for (const user of FUNNEL_USERS.filter(u => u.reachedPurchase)) {
    try {
      // Import the tool data generators inline (same logic as seed-staging.ts)
      const tool2 = {
        inputs: { meetingCount: randomBetween(20, 70), averageAttendees: randomBetween(4, 9), averageDuration: randomBetween(30, 60), salaryDistribution: { executive: 15, senior: 25, midLevel: 40, entry: 20 } },
        results: {
          totalMeetingHours: randomBetween(200, 800),
          totalMeetingCost: randomBetween(30000, 120000),
          wastedHours: randomBetween(60, 300),
          wastedCost: randomBetween(9000, 45000),
          effectiveHours: randomBetween(140, 500),
          effectiveCost: randomBetween(21000, 75000),
          totalMeetings: randomBetween(20, 70),
          avgAttendees: randomBetween(4, 9),
          inefficiencyPercent: randomBetween(20, 50),
          avgDuration: randomBetween(30, 60),
        },
        completedAt: new Date().toISOString(),
      };

      const totalCost = randomBetween(150000, 600000);
      const data: schema.DiagnosticSessionData = {
        tool1: {
          scores: { strategic: randomBetween(60, 95), execution: randomBetween(50, 90), technology: randomBetween(55, 95), people: randomBetween(45, 85), governance: randomBetween(50, 90) },
          dimensions: { strategic: randomBetween(60, 90), structural: randomBetween(55, 85), processAlignment: randomBetween(50, 80), cultural: randomBetween(45, 75), technological: randomBetween(60, 90) },
          compositeScore: randomBetween(55, 85),
          interpretation: 'moderate',
          completedAt: new Date().toISOString(),
        },
        tool2,
        tool3: {
          decisions: [{ name: 'Budget Approval', daysToDecide: 14, complexity: 'high' }],
          overallVelocityScore: randomBetween(40, 80),
          archetypes: { strategic: { median: 21, p90: 45, samples: 5 }, operational: { median: 7, p90: 14, samples: 12 } },
          bottlenecks: [{ pattern: 'Executive Bottleneck', severity: 'high', description: 'Decisions stall at executive level' }],
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
          totalFrictionCost: randomBetween(50000, 150000),
          frictionByCategory: { manual_handoffs: 35, system_integrations: 25, approval_delays: 20, data_quality: 20 },
          completedAt: new Date().toISOString(),
        },
        tool6: {
          metrics: { email: { volume: 250, avgResponseTime: 4.5 }, chat: { volume: 150, avgResponseTime: 0.5 } },
          antiPatterns: [{ pattern: 'Email Overload', severity: 'high', recommendation: 'Implement chat-first policy' }],
          healthScore: randomBetween(50, 80),
          completedAt: new Date().toISOString(),
        },
        tool7: {
          totalCost,
          alignmentTaxPercent: randomBetween(5, 20),
          interpretation: totalCost > 400000 ? 'critical' : 'significant',
          costBreakdown: {
            meetingWaste: randomBetween(20000, 80000),
            decisionDelay: randomBetween(25000, 75000),
            communicationOverhead: randomBetween(20000, 60000),
            frictionCost: randomBetween(40000, 120000),
            projectDelays: randomBetween(50000, 150000),
            rework: randomBetween(30000, 90000),
            turnover: randomBetween(60000, 180000),
            opportunityCost: randomBetween(75000, 225000),
          },
          roiProjection: { conservative: totalCost * 0.3, moderate: totalCost * 0.5, aggressive: totalCost * 0.7, paybackMonths: 8 },
          completedAt: new Date().toISOString(),
        },
      };

      await db.insert(schema.diagnosticResults).values({
        userId: user.id,
        toolResults: data,
        totalAlignmentTax: totalCost.toString(),
        estimatedSavings: (totalCost * 0.5).toString(),
      });
      created++;
    } catch (e: any) {
      if (!e.message?.includes('unique') && !e.message?.includes('duplicate')) {
        throw e;
      }
    }
  }
  console.log(`  Created ${created} diagnostic results`);
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('\n========================================');
  console.log('Reporting Data Seed Script (Additive)');
  console.log('========================================\n');

  try {
    await seedFunnelUsers();
    await seedAnalyticsEvents();
    await seedPurchasesWithSpread();
    await seedToolkitDocuments();
    await seedEmailSequences();
    await seedEmailPreferences();
    await seedDiagnosticResultsForFunnelUsers();

    console.log('\n========================================');
    console.log('Reporting data seeded successfully!');
    console.log('========================================\n');

    console.log('Summary:');
    console.log('  - 20 additional funnel users (varied drop-off)');
    console.log('  - Analytics events: preview_viewed + checkout_started');
    console.log('  - Purchases spread across 30 days');
    console.log('  - Toolkit documents per purchase');
    console.log('  - Email sequences + nurture emails');
    console.log('  - Email preferences for all users');
    console.log('  - Diagnostic results for purchasers');

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
