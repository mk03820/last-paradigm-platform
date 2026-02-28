/**
 * Staging Database Seed Script
 *
 * Populates the staging database with mock data for testing.
 * Run with: npx tsx scripts/seed-staging.ts
 *
 * WARNING: This will clear existing data in the staging database!
 */

import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import * as schema from '../src/lib/db/schema';
import bcrypt from 'bcrypt';

const db = drizzle(sql, { schema });

// ============================================================================
// Mock Data Constants
// ============================================================================

const MOCK_USERS = [
  {
    id: 'user-001',
    name: 'John Demo',
    email: 'john@example.com',
    password: 'Password123',
    hasPb2Access: true,
  },
  {
    id: 'user-002',
    name: 'Jane Tester',
    email: 'jane@example.com',
    password: 'Password123',
    hasPb2Access: false,
  },
  {
    id: 'user-003',
    name: 'Bob Builder',
    email: 'bob@example.com',
    password: 'Password123',
    hasPb2Access: true,
  },
  {
    id: 'user-004',
    name: 'Alice Newuser',
    email: 'alice@example.com',
    password: 'Password123',
    hasPb2Access: false,
  },
];

const MOCK_ADMIN = {
  email: 'admin@lastparadigm.com',
  password: 'AdminPass123!',
  name: 'Admin User',
  role: 'super_admin' as const,
};

// ============================================================================
// Mock Tool Data Generators
// ============================================================================

function generateTool1Data() {
  return {
    scores: {
      strategic: Math.floor(Math.random() * 40) + 60,
      execution: Math.floor(Math.random() * 40) + 50,
      technology: Math.floor(Math.random() * 40) + 55,
      people: Math.floor(Math.random() * 40) + 45,
      governance: Math.floor(Math.random() * 40) + 50,
    },
    dimensions: {
      strategic: Math.floor(Math.random() * 30) + 60,
      structural: Math.floor(Math.random() * 30) + 55,
      processAlignment: Math.floor(Math.random() * 30) + 50,
      cultural: Math.floor(Math.random() * 30) + 45,
      technological: Math.floor(Math.random() * 30) + 60,
    },
    compositeScore: Math.floor(Math.random() * 30) + 55,
    interpretation: 'moderate',
    completedAt: new Date().toISOString(),
  };
}

function generateTool2Data() {
  const meetingCount = Math.floor(Math.random() * 50) + 20;
  const avgAttendees = Math.floor(Math.random() * 5) + 4;
  const avgDuration = Math.floor(Math.random() * 30) + 30;
  const totalHours = meetingCount * avgAttendees * (avgDuration / 60);
  const wastedPercent = Math.random() * 0.3 + 0.2;

  return {
    inputs: {
      meetingCount,
      averageAttendees: avgAttendees,
      averageDuration: avgDuration,
      salaryDistribution: {
        executive: 15,
        senior: 25,
        midLevel: 40,
        entry: 20,
      },
    },
    results: {
      totalMeetingHours: totalHours,
      totalMeetingCost: totalHours * 150,
      wastedHours: totalHours * wastedPercent,
      wastedCost: totalHours * wastedPercent * 150,
      effectiveHours: totalHours * (1 - wastedPercent),
      effectiveCost: totalHours * (1 - wastedPercent) * 150,
      totalMeetings: meetingCount,
      avgAttendees,
      inefficiencyPercent: wastedPercent * 100,
      avgDuration,
    },
    completedAt: new Date().toISOString(),
  };
}

function generateTool3Data() {
  return {
    decisions: [
      { name: 'Budget Approval', daysToDecide: 14, complexity: 'high' },
      { name: 'Hiring Decision', daysToDecide: 21, complexity: 'medium' },
      { name: 'Project Kickoff', daysToDecide: 7, complexity: 'low' },
    ],
    overallVelocityScore: Math.floor(Math.random() * 40) + 40,
    archetypes: {
      strategic: { median: 21, p90: 45, samples: 5 },
      operational: { median: 7, p90: 14, samples: 12 },
      tactical: { median: 3, p90: 7, samples: 25 },
    },
    bottlenecks: [
      { pattern: 'Executive Bottleneck', severity: 'high', description: 'Decisions stall at executive level' },
      { pattern: 'Information Gaps', severity: 'medium', description: 'Missing data delays decisions' },
    ],
    completedAt: new Date().toISOString(),
  };
}

function generateTool4Data() {
  return {
    stakeholders: [
      { name: 'CEO', role: 'Executive Sponsor', power: 95, interest: 80, sentiment: 'supportive', quadrant: 'manage_closely' },
      { name: 'CFO', role: 'Budget Authority', power: 85, interest: 70, sentiment: 'neutral', quadrant: 'manage_closely' },
      { name: 'CTO', role: 'Technical Lead', power: 75, interest: 90, sentiment: 'supportive', quadrant: 'manage_closely' },
      { name: 'HR Director', role: 'People Lead', power: 60, interest: 50, sentiment: 'neutral', quadrant: 'keep_satisfied' },
      { name: 'Project Manager', role: 'Coordinator', power: 40, interest: 85, sentiment: 'supportive', quadrant: 'keep_informed' },
    ],
    quadrantSummary: {
      manageClosely: 3,
      keepSatisfied: 1,
      keepInformed: 1,
      monitor: 0,
    },
    riskCount: 1,
    completedAt: new Date().toISOString(),
  };
}

function generateTool5Data() {
  return {
    journeys: [
      { name: 'Customer Onboarding', frictionScore: 7, bottlenecks: 3 },
      { name: 'Sales Pipeline', frictionScore: 5, bottlenecks: 2 },
      { name: 'Support Escalation', frictionScore: 8, bottlenecks: 4 },
    ],
    totalFrictionCost: Math.floor(Math.random() * 100000) + 50000,
    frictionByCategory: {
      manual_handoffs: 35,
      system_integrations: 25,
      approval_delays: 20,
      data_quality: 20,
    },
    completedAt: new Date().toISOString(),
  };
}

function generateTool6Data() {
  return {
    metrics: {
      email: { volume: 250, avgResponseTime: 4.5 },
      chat: { volume: 150, avgResponseTime: 0.5 },
      meetings: { volume: 45, avgDuration: 45 },
    },
    antiPatterns: [
      { pattern: 'Email Overload', severity: 'high', recommendation: 'Implement chat-first policy' },
      { pattern: 'Meeting Creep', severity: 'medium', recommendation: 'Enforce agenda requirements' },
    ],
    healthScore: Math.floor(Math.random() * 30) + 50,
    completedAt: new Date().toISOString(),
  };
}

function generateTool7Data(tool2Results: ReturnType<typeof generateTool2Data>) {
  const meetingWaste = tool2Results.results.wastedCost;
  const decisionDelay = Math.floor(Math.random() * 50000) + 25000;
  const communicationOverhead = Math.floor(Math.random() * 40000) + 20000;
  const frictionCost = Math.floor(Math.random() * 80000) + 40000;
  const projectDelays = Math.floor(Math.random() * 100000) + 50000;
  const rework = Math.floor(Math.random() * 60000) + 30000;
  const turnover = Math.floor(Math.random() * 120000) + 60000;
  const opportunityCost = Math.floor(Math.random() * 150000) + 75000;

  const totalCost = meetingWaste + decisionDelay + communicationOverhead +
    frictionCost + projectDelays + rework + turnover + opportunityCost;

  return {
    totalCost,
    alignmentTaxPercent: Math.random() * 15 + 5,
    interpretation: totalCost > 400000 ? 'critical' : totalCost > 200000 ? 'significant' : 'moderate',
    costBreakdown: {
      meetingWaste,
      decisionDelay,
      communicationOverhead,
      frictionCost,
      projectDelays,
      rework,
      turnover,
      opportunityCost,
    },
    roiProjection: {
      conservative: totalCost * 0.3,
      moderate: totalCost * 0.5,
      aggressive: totalCost * 0.7,
      paybackMonths: 8,
    },
    completedAt: new Date().toISOString(),
  };
}

function generateCompleteDiagnosticData(): schema.DiagnosticSessionData {
  const tool2 = generateTool2Data();
  return {
    tool1: generateTool1Data(),
    tool2,
    tool3: generateTool3Data(),
    tool4: generateTool4Data(),
    tool5: generateTool5Data(),
    tool6: generateTool6Data(),
    tool7: generateTool7Data(tool2),
  };
}

// ============================================================================
// Seed Functions
// ============================================================================

async function clearDatabase() {
  console.log('Clearing existing data...');

  // Delete in order respecting foreign keys
  await db.delete(schema.adminAuditLogs);
  await db.delete(schema.refunds);
  await db.delete(schema.toolkitDocuments);
  await db.delete(schema.nurtureEmails);
  await db.delete(schema.emailSequences);
  await db.delete(schema.webhookLogs);
  await db.delete(schema.analyticsEvents);
  await db.delete(schema.generatedDocuments);
  await db.delete(schema.invoiceRequests);
  await db.delete(schema.purchases);
  await db.delete(schema.diagnosticResults);
  await db.delete(schema.diagnosticSessions);
  await db.delete(schema.preservedSessions);
  await db.delete(schema.passwordResets);
  await db.delete(schema.magicLinks);
  await db.delete(schema.abandonedRegistrations);
  await db.delete(schema.emailPreferences);
  await db.delete(schema.sessions);
  await db.delete(schema.accounts);
  await db.delete(schema.verificationTokens);
  await db.delete(schema.adminUsers);
  await db.delete(schema.users);
  await db.delete(schema.emails);

  console.log('Database cleared.');
}

async function seedUsers() {
  console.log('Seeding users...');

  for (const user of MOCK_USERS) {
    const passwordHash = await bcrypt.hash(user.password, 12);

    await db.insert(schema.users).values({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: new Date(),
      passwordHash,
      hasPb2Access: user.hasPb2Access,
      pb2PurchasedAt: user.hasPb2Access ? new Date() : null,
      purchaseStatus: user.hasPb2Access ? 'completed' : 'none',
      purchasedAt: user.hasPb2Access ? new Date() : null,
    });

    console.log(`  Created user: ${user.email}`);
  }
}

async function seedAdminUsers() {
  console.log('Seeding admin users...');

  const passwordHash = await bcrypt.hash(MOCK_ADMIN.password, 12);

  await db.insert(schema.adminUsers).values({
    email: MOCK_ADMIN.email,
    passwordHash,
    name: MOCK_ADMIN.name,
    role: MOCK_ADMIN.role,
    isActive: true,
  });

  console.log(`  Created admin: ${MOCK_ADMIN.email}`);
}

async function seedDiagnosticSessions() {
  console.log('Seeding diagnostic sessions...');

  for (const user of MOCK_USERS) {
    // Create 1-3 sessions per user
    const sessionCount = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < sessionCount; i++) {
      const isComplete = Math.random() > 0.3;
      const toolsCompleted = isComplete ? 7 : Math.floor(Math.random() * 6) + 1;
      const data = generateCompleteDiagnosticData();

      // Remove incomplete tool data
      if (!isComplete) {
        for (let t = toolsCompleted + 1; t <= 7; t++) {
          delete data[`tool${t}` as keyof schema.DiagnosticSessionData];
        }
      }

      await db.insert(schema.diagnosticSessions).values({
        userId: user.id,
        name: `Diagnostic ${i + 1}`,
        status: isComplete ? 'completed' : 'in_progress',
        toolsCompleted,
        data,
      });

      console.log(`  Created session for ${user.email}: ${toolsCompleted}/7 tools`);
    }
  }
}

async function seedDiagnosticResults() {
  console.log('Seeding diagnostic results...');

  // Only for users who have completed diagnostics
  for (const user of MOCK_USERS.filter(u => u.hasPb2Access)) {
    const data = generateCompleteDiagnosticData();
    const totalTax = data.tool7?.totalCost || 0;

    await db.insert(schema.diagnosticResults).values({
      userId: user.id,
      toolResults: data,
      totalAlignmentTax: totalTax.toString(),
      estimatedSavings: (totalTax * 0.5).toString(),
    });

    console.log(`  Created diagnostic result for ${user.email}`);
  }
}

async function seedPurchases() {
  console.log('Seeding purchases...');

  for (const user of MOCK_USERS.filter(u => u.hasPb2Access)) {
    await db.insert(schema.purchases).values({
      userId: user.id,
      stripeSessionId: `cs_test_${user.id}_${Date.now()}`,
      stripePaymentIntentId: `pi_test_${user.id}`,
      stripeCustomerId: `cus_test_${user.id}`,
      amount: 250000, // $2,500 in cents
      currency: 'usd',
      status: 'completed',
      metadata: {
        source: 'seed_script',
        userEmail: user.email,
      },
      completedAt: new Date(),
    });

    console.log(`  Created purchase for ${user.email}`);
  }
}

async function seedWebhookLogs() {
  console.log('Seeding webhook logs...');

  const eventTypes = [
    'checkout.session.completed',
    'payment_intent.succeeded',
    'customer.created',
  ];

  for (let i = 0; i < 10; i++) {
    const status = Math.random() > 0.8 ? 'failed' : 'processed';

    await db.insert(schema.webhookLogs).values({
      source: 'stripe',
      eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      eventId: `evt_test_${Date.now()}_${i}`,
      payload: { test: true, index: i },
      status,
      attempts: status === 'failed' ? 3 : 1,
      errorMessage: status === 'failed' ? 'Test error for staging' : null,
      processedAt: status === 'processed' ? new Date() : null,
    });
  }

  console.log('  Created 10 webhook log entries');
}

async function seedInvoiceRequests() {
  console.log('Seeding invoice requests...');

  const statuses = ['pending', 'invoice_sent', 'paid', 'cancelled'];

  for (const user of MOCK_USERS.slice(0, 2)) {
    await db.insert(schema.invoiceRequests).values({
      userId: user.id,
      companyName: `${user.name}'s Company`,
      billingAddress: '123 Business St\nSuite 100\nNew York, NY 10001',
      poNumber: `PO-${Date.now()}`,
      contactEmail: user.email,
      status: statuses[Math.floor(Math.random() * statuses.length)],
    });

    console.log(`  Created invoice request for ${user.email}`);
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log('\n========================================');
  console.log('Staging Database Seed Script');
  console.log('========================================\n');

  try {
    await clearDatabase();
    await seedUsers();
    await seedAdminUsers();
    await seedDiagnosticSessions();
    await seedDiagnosticResults();
    await seedPurchases();
    await seedWebhookLogs();
    await seedInvoiceRequests();

    console.log('\n========================================');
    console.log('Seeding completed successfully!');
    console.log('========================================\n');

    console.log('Test Credentials:');
    console.log('------------------');
    console.log('Regular Users:');
    MOCK_USERS.forEach(u => {
      console.log(`  ${u.email} / ${u.password} (PB2: ${u.hasPb2Access ? 'Yes' : 'No'})`);
    });
    console.log('\nAdmin User:');
    console.log(`  ${MOCK_ADMIN.email} / ${MOCK_ADMIN.password}`);
    console.log('');

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
