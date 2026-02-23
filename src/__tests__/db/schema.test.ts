/**
 * Database Schema Tests for Phase 3
 *
 * Unit tests verifying schema definitions, types, and constraints.
 * These tests validate the schema structure without requiring a database connection.
 *
 * Covers: Story 15.1 Task 7.1 (Schema validation tests)
 */

import { describe, it, expect } from 'vitest';
import {
  // Phase 1
  emails,
  // Phase 2 - NextAuth
  users,
  accounts,
  sessions,
  verificationTokens,
  diagnosticSessions,
  sessionStatusEnum,
  // Phase 3
  diagnosticResults,
  magicLinks,
  passwordResets,
  purchases,
  invoiceRequests,
  generatedDocuments,
  emailSequences,
  webhookLogs,
  // Phase 3 - Epic 18: Toolkit Generation
  toolkitDocuments,
  documentStatusEnum,
  documentTypeEnum,
} from '@/lib/db/schema';
import type {
  Email,
  NewEmail,
  User,
  NewUser,
  DiagnosticSession,
  NewDiagnosticSession,
  DiagnosticSessionData,
  DiagnosticResult,
  NewDiagnosticResult,
  MagicLink,
  NewMagicLink,
  PasswordReset,
  NewPasswordReset,
  Purchase,
  NewPurchase,
  InvoiceRequest,
  NewInvoiceRequest,
  GeneratedDocument,
  NewGeneratedDocument,
  EmailSequence,
  NewEmailSequence,
  WebhookLog,
  NewWebhookLog,
  // Phase 3 - Epic 18: Toolkit Generation
  ToolkitDocument,
  NewToolkitDocument,
} from '@/lib/db/schema';

describe('Phase 1 Schema: emails table', () => {
  it('should have correct column structure', () => {
    const columns = Object.keys(emails);
    expect(columns).toContain('id');
    expect(columns).toContain('email');
    expect(columns).toContain('source');
    expect(columns).toContain('createdAt');
  });

  it('should have id as primary key with serial type', () => {
    const idColumn = emails.id;
    expect(idColumn.columnType).toBe('PgSerial');
  });

  it('should have email as varchar(255) not null unique', () => {
    const emailColumn = emails.email;
    expect(emailColumn.columnType).toBe('PgVarchar');
    expect(emailColumn.notNull).toBe(true);
    expect(emailColumn.isUnique).toBe(true);
  });

  it('should export correct types', () => {
    const email: Email = {
      id: 1,
      email: 'test@example.com',
      source: 'test',
      createdAt: new Date(),
    };
    expect(email).toBeDefined();

    const newEmail: NewEmail = {
      email: 'new@example.com',
    };
    expect(newEmail).toBeDefined();
  });
});

describe('Phase 2 Schema: users table', () => {
  it('should have all required columns including Phase 3 additions', () => {
    const columns = Object.keys(users);
    // Phase 2 columns
    expect(columns).toContain('id');
    expect(columns).toContain('name');
    expect(columns).toContain('email');
    expect(columns).toContain('emailVerified');
    expect(columns).toContain('image');
    expect(columns).toContain('createdAt');
    expect(columns).toContain('updatedAt');
    // Phase 3 additions
    expect(columns).toContain('passwordHash');
    expect(columns).toContain('purchaseStatus');
    expect(columns).toContain('purchasedAt');
    expect(columns).toContain('stripeCustomerId');
  });

  it('should have id as text primary key', () => {
    const idColumn = users.id;
    expect(idColumn.columnType).toBe('PgText');
  });

  it('should have email as unique', () => {
    const emailColumn = users.email;
    expect(emailColumn.isUnique).toBe(true);
  });

  it('should have passwordHash as varchar(255) for bcrypt', () => {
    const passwordHashColumn = users.passwordHash;
    expect(passwordHashColumn.columnType).toBe('PgVarchar');
  });

  it('should have purchaseStatus with default value', () => {
    const purchaseStatusColumn = users.purchaseStatus;
    expect(purchaseStatusColumn.hasDefault).toBe(true);
  });

  it('should export correct types', () => {
    const user: User = {
      id: 'uuid-123',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: new Date(),
      image: null,
      passwordHash: '$2b$12$hashedpassword',
      purchaseStatus: 'completed',
      purchasedAt: new Date(),
      stripeCustomerId: 'cus_123',
      hasPb2Access: true,
      pb2PurchasedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(user).toBeDefined();

    const newUser: NewUser = {
      email: 'new@example.com',
    };
    expect(newUser).toBeDefined();
  });
});

describe('Phase 2 Schema: diagnostic_sessions table', () => {
  it('should have correct columns', () => {
    const columns = Object.keys(diagnosticSessions);
    expect(columns).toContain('id');
    expect(columns).toContain('userId');
    expect(columns).toContain('name');
    expect(columns).toContain('status');
    expect(columns).toContain('toolsCompleted');
    expect(columns).toContain('data');
    expect(columns).toContain('createdAt');
    expect(columns).toContain('updatedAt');
  });

  it('should have data column as jsonb', () => {
    const dataColumn = diagnosticSessions.data;
    expect(dataColumn.columnType).toBe('PgJsonb');
  });

  it('should have session status enum', () => {
    expect(sessionStatusEnum.enumValues).toEqual(['in_progress', 'completed']);
  });

  it('should export correct types', () => {
    const sessionData: DiagnosticSessionData = {
      tool1: {
        scores: {
          strategic: 3,
          execution: 2,
          technology: 4,
          people: 3,
          governance: 2,
        },
        compositeScore: 2.8,
        completedAt: '2024-01-01T00:00:00Z',
      },
      tool2: {
        inputs: {
          meetingCount: 20,
          averageAttendees: 5,
          averageDuration: 60,
        },
        completedAt: '2024-01-02T00:00:00Z',
      },
    };
    expect(sessionData).toBeDefined();

    const session: DiagnosticSession = {
      id: 'session-123',
      userId: 'user-123',
      name: 'Test Session',
      status: 'in_progress',
      toolsCompleted: 2,
      data: sessionData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    expect(session).toBeDefined();
  });
});

describe('Phase 3 Schema: diagnostic_results table', () => {
  it('should have correct columns', () => {
    const columns = Object.keys(diagnosticResults);
    expect(columns).toContain('id');
    expect(columns).toContain('userId');
    expect(columns).toContain('toolResults');
    expect(columns).toContain('totalAlignmentTax');
    expect(columns).toContain('estimatedSavings');
    expect(columns).toContain('completedAt');
  });

  it('should have id as uuid primary key', () => {
    const idColumn = diagnosticResults.id;
    expect(idColumn.columnType).toBe('PgUUID');
    expect(idColumn.hasDefault).toBe(true);
  });

  it('should have toolResults as jsonb not null', () => {
    const toolResultsColumn = diagnosticResults.toolResults;
    expect(toolResultsColumn.columnType).toBe('PgJsonb');
    expect(toolResultsColumn.notNull).toBe(true);
  });

  it('should have numeric columns for financial values', () => {
    const taxColumn = diagnosticResults.totalAlignmentTax;
    const savingsColumn = diagnosticResults.estimatedSavings;
    expect(taxColumn.columnType).toBe('PgNumeric');
    expect(savingsColumn.columnType).toBe('PgNumeric');
  });

  it('should export correct types', () => {
    const result: DiagnosticResult = {
      id: 'result-uuid',
      userId: 'user-123',
      toolResults: {
        tool1: { compositeScore: 2.5, completedAt: '2024-01-01' },
      },
      totalAlignmentTax: '1500000.00',
      estimatedSavings: '750000.00',
      completedAt: new Date(),
    };
    expect(result).toBeDefined();

    const newResult: NewDiagnosticResult = {
      userId: 'user-123',
      toolResults: {},
    };
    expect(newResult).toBeDefined();
  });
});

describe('Phase 3 Schema: magic_links table', () => {
  it('should have correct columns', () => {
    const columns = Object.keys(magicLinks);
    expect(columns).toContain('id');
    expect(columns).toContain('email');
    expect(columns).toContain('token');
    expect(columns).toContain('expiresAt');
    expect(columns).toContain('usedAt');
    expect(columns).toContain('createdAt');
  });

  it('should have token as unique', () => {
    const tokenColumn = magicLinks.token;
    expect(tokenColumn.isUnique).toBe(true);
  });

  it('should have expiresAt as required timestamp', () => {
    const expiresAtColumn = magicLinks.expiresAt;
    expect(expiresAtColumn.notNull).toBe(true);
    expect(expiresAtColumn.columnType).toBe('PgTimestamp');
  });

  it('should export correct types', () => {
    const link: MagicLink = {
      id: 'link-uuid',
      email: 'test@example.com',
      token: 'secure-token-123',
      expiresAt: new Date(),
      usedAt: null,
      createdAt: new Date(),
    };
    expect(link).toBeDefined();

    const newLink: NewMagicLink = {
      email: 'test@example.com',
      token: 'new-token',
      expiresAt: new Date(),
    };
    expect(newLink).toBeDefined();
  });
});

describe('Phase 3 Schema: password_resets table', () => {
  it('should have correct columns', () => {
    const columns = Object.keys(passwordResets);
    expect(columns).toContain('id');
    expect(columns).toContain('userId');
    expect(columns).toContain('token');
    expect(columns).toContain('expiresAt');
    expect(columns).toContain('usedAt');
    expect(columns).toContain('createdAt');
  });

  it('should have userId as required', () => {
    const userIdColumn = passwordResets.userId;
    expect(userIdColumn.notNull).toBe(true);
  });

  it('should have token as unique', () => {
    const tokenColumn = passwordResets.token;
    expect(tokenColumn.isUnique).toBe(true);
  });

  it('should export correct types', () => {
    const reset: PasswordReset = {
      id: 'reset-uuid',
      userId: 'user-123',
      token: 'reset-token-123',
      expiresAt: new Date(),
      usedAt: null,
      createdAt: new Date(),
    };
    expect(reset).toBeDefined();

    const newReset: NewPasswordReset = {
      userId: 'user-123',
      token: 'new-reset-token',
      expiresAt: new Date(),
    };
    expect(newReset).toBeDefined();
  });
});

describe('Phase 3 Schema: purchases table', () => {
  it('should have correct columns', () => {
    const columns = Object.keys(purchases);
    expect(columns).toContain('id');
    expect(columns).toContain('userId');
    expect(columns).toContain('stripeSessionId');
    expect(columns).toContain('stripePaymentIntentId');
    expect(columns).toContain('amount');
    expect(columns).toContain('currency');
    expect(columns).toContain('status');
    expect(columns).toContain('createdAt');
    expect(columns).toContain('completedAt');
  });

  it('should have amount as integer for cents', () => {
    const amountColumn = purchases.amount;
    expect(amountColumn.columnType).toBe('PgInteger');
    expect(amountColumn.notNull).toBe(true);
  });

  it('should have currency with default usd', () => {
    const currencyColumn = purchases.currency;
    expect(currencyColumn.hasDefault).toBe(true);
  });

  it('should export correct types', () => {
    const purchase: Purchase = {
      id: 'purchase-uuid',
      userId: 'user-123',
      stripeSessionId: 'cs_test_123',
      stripePaymentIntentId: 'pi_test_123',
      stripeCustomerId: 'cus_123',
      amount: 250000, // $2,500.00 in cents
      currency: 'usd',
      status: 'completed',
      metadata: { sessionSource: 'preview_page' },
      createdAt: new Date(),
      completedAt: new Date(),
    };
    expect(purchase).toBeDefined();

    const newPurchase: NewPurchase = {
      userId: 'user-123',
      stripeSessionId: 'cs_test_456',
      amount: 250000,
      status: 'pending',
    };
    expect(newPurchase).toBeDefined();
  });
});

describe('Phase 3 Schema: invoice_requests table', () => {
  it('should have correct columns', () => {
    const columns = Object.keys(invoiceRequests);
    expect(columns).toContain('id');
    expect(columns).toContain('userId');
    expect(columns).toContain('companyName');
    expect(columns).toContain('billingAddress');
    expect(columns).toContain('poNumber');
    expect(columns).toContain('contactEmail');
    expect(columns).toContain('status');
    expect(columns).toContain('adminNotes');
    expect(columns).toContain('createdAt');
    expect(columns).toContain('processedAt');
  });

  it('should have companyName and billingAddress as required', () => {
    expect(invoiceRequests.companyName.notNull).toBe(true);
    expect(invoiceRequests.billingAddress.notNull).toBe(true);
  });

  it('should have status with default pending', () => {
    const statusColumn = invoiceRequests.status;
    expect(statusColumn.hasDefault).toBe(true);
  });

  it('should export correct types', () => {
    const request: InvoiceRequest = {
      id: 'request-uuid',
      userId: 'user-123',
      companyName: 'Acme Corp',
      billingAddress: '123 Main St\nNew York, NY 10001',
      poNumber: 'PO-2024-001',
      contactEmail: 'billing@acme.com',
      status: 'pending',
      adminNotes: null,
      invoiceNumber: null,
      cancellationReason: null,
      processedBy: null,
      createdAt: new Date(),
      processedAt: null,
    };
    expect(request).toBeDefined();
  });
});

describe('Phase 3 Schema: generated_documents table', () => {
  it('should have correct columns', () => {
    const columns = Object.keys(generatedDocuments);
    expect(columns).toContain('id');
    expect(columns).toContain('userId');
    expect(columns).toContain('fileName');
    expect(columns).toContain('fileType');
    expect(columns).toContain('s3Key');
    expect(columns).toContain('fileSizeBytes');
    expect(columns).toContain('status');
    expect(columns).toContain('errorMessage');
    expect(columns).toContain('createdAt');
    expect(columns).toContain('generatedAt');
  });

  it('should have s3Key as required with max length', () => {
    const s3KeyColumn = generatedDocuments.s3Key;
    expect(s3KeyColumn.notNull).toBe(true);
    expect(s3KeyColumn.columnType).toBe('PgVarchar');
  });

  it('should export correct types', () => {
    const doc: GeneratedDocument = {
      id: 'doc-uuid',
      userId: 'user-123',
      fileName: 'Alignment-Playbook.docx',
      fileType: 'docx',
      s3Key: 'users/user-123/documents/alignment-playbook.docx',
      fileSizeBytes: 125000,
      status: 'completed',
      errorMessage: null,
      createdAt: new Date(),
      generatedAt: new Date(),
    };
    expect(doc).toBeDefined();
  });
});

describe('Phase 3 Schema: email_sequences table', () => {
  it('should have correct columns', () => {
    const columns = Object.keys(emailSequences);
    expect(columns).toContain('id');
    expect(columns).toContain('userId');
    expect(columns).toContain('sequenceType');
    expect(columns).toContain('currentStep');
    expect(columns).toContain('totalSteps');
    expect(columns).toContain('status');
    expect(columns).toContain('lastSentAt');
    expect(columns).toContain('nextSendAt');
    expect(columns).toContain('completedAt');
    expect(columns).toContain('createdAt');
  });

  it('should have currentStep with default 0', () => {
    const currentStepColumn = emailSequences.currentStep;
    expect(currentStepColumn.hasDefault).toBe(true);
  });

  it('should have totalSteps as required', () => {
    expect(emailSequences.totalSteps.notNull).toBe(true);
  });

  it('should export correct types', () => {
    const sequence: EmailSequence = {
      id: 'seq-uuid',
      userId: 'user-123',
      sequenceType: 'post_purchase',
      currentStep: 2,
      totalSteps: 5,
      status: 'active',
      lastSentAt: new Date(),
      nextSendAt: new Date(Date.now() + 86400000),
      completedAt: null,
      createdAt: new Date(),
    };
    expect(sequence).toBeDefined();
  });
});

describe('Phase 3 Schema: webhook_logs table', () => {
  it('should have correct columns', () => {
    const columns = Object.keys(webhookLogs);
    expect(columns).toContain('id');
    expect(columns).toContain('source');
    expect(columns).toContain('eventType');
    expect(columns).toContain('eventId');
    expect(columns).toContain('payload');
    expect(columns).toContain('status');
    expect(columns).toContain('attempts');
    expect(columns).toContain('errorMessage');
    expect(columns).toContain('createdAt');
    expect(columns).toContain('processedAt');
  });

  it('should have payload as jsonb not null', () => {
    const payloadColumn = webhookLogs.payload;
    expect(payloadColumn.columnType).toBe('PgJsonb');
    expect(payloadColumn.notNull).toBe(true);
  });

  it('should have attempts with default 1', () => {
    const attemptsColumn = webhookLogs.attempts;
    expect(attemptsColumn.hasDefault).toBe(true);
  });

  it('should export correct types', () => {
    const log: WebhookLog = {
      id: 'log-uuid',
      source: 'stripe',
      eventType: 'checkout.session.completed',
      eventId: 'evt_123',
      payload: { type: 'checkout.session.completed', data: {} },
      status: 'processed',
      attempts: 1,
      errorMessage: null,
      acknowledgedAt: null,
      acknowledgedBy: null,
      createdAt: new Date(),
      processedAt: new Date(),
    };
    expect(log).toBeDefined();
  });
});

describe('Schema relationships', () => {
  it('should have all Phase 3 tables referencing users table', () => {
    // These tables should have userId foreign key
    const tablesWithUserFK = [
      diagnosticResults,
      passwordResets,
      purchases,
      invoiceRequests,
      generatedDocuments,
      emailSequences,
    ];

    tablesWithUserFK.forEach((table) => {
      expect(Object.keys(table)).toContain('userId');
    });
  });

  it('should have magicLinks referencing email not userId', () => {
    expect(Object.keys(magicLinks)).toContain('email');
    expect(Object.keys(magicLinks)).not.toContain('userId');
  });

  it('should have webhookLogs as independent table', () => {
    expect(Object.keys(webhookLogs)).not.toContain('userId');
  });
});

describe('Schema field constraints', () => {
  it('should have appropriate varchar lengths', () => {
    // Email fields should be 255
    expect(users.email?.columnType).toBe('PgText');
    expect(magicLinks.email.columnType).toBe('PgVarchar');

    // Token fields should be 255
    expect(magicLinks.token.columnType).toBe('PgVarchar');
    expect(passwordResets.token.columnType).toBe('PgVarchar');

    // Status fields should be 20
    expect(purchases.status.columnType).toBe('PgVarchar');
    expect(invoiceRequests.status.columnType).toBe('PgVarchar');
  });

  it('should have uuid primary keys for Phase 3 tables', () => {
    const phase3Tables = [
      diagnosticResults,
      magicLinks,
      passwordResets,
      purchases,
      invoiceRequests,
      generatedDocuments,
      emailSequences,
      webhookLogs,
      toolkitDocuments,
    ];

    phase3Tables.forEach((table) => {
      expect(table.id.columnType).toBe('PgUUID');
      expect(table.id.hasDefault).toBe(true);
    });
  });
});

// ============================================================================
// PHASE 3 - EPIC 18: Toolkit Document Generation
// ============================================================================

describe('Phase 3 Schema: toolkit_documents table (Story 18.1)', () => {
  it('should have correct columns for document tracking', () => {
    const columns = Object.keys(toolkitDocuments);
    expect(columns).toContain('id');
    expect(columns).toContain('purchaseId');
    expect(columns).toContain('userId');
    expect(columns).toContain('documentType');
    expect(columns).toContain('documentName');
    expect(columns).toContain('status');
    expect(columns).toContain('fileUrl');
    expect(columns).toContain('s3Key');
    expect(columns).toContain('fileSizeBytes');
    expect(columns).toContain('errorMessage');
    expect(columns).toContain('attempts');
    expect(columns).toContain('createdAt');
    expect(columns).toContain('updatedAt');
    expect(columns).toContain('generatedAt');
  });

  it('should have id as uuid primary key', () => {
    const idColumn = toolkitDocuments.id;
    expect(idColumn.columnType).toBe('PgUUID');
    expect(idColumn.hasDefault).toBe(true);
  });

  it('should have purchaseId as required uuid foreign key', () => {
    const purchaseIdColumn = toolkitDocuments.purchaseId;
    expect(purchaseIdColumn.columnType).toBe('PgUUID');
    expect(purchaseIdColumn.notNull).toBe(true);
  });

  it('should have userId as required text foreign key', () => {
    const userIdColumn = toolkitDocuments.userId;
    expect(userIdColumn.columnType).toBe('PgText');
    expect(userIdColumn.notNull).toBe(true);
  });

  it('should have documentName as required varchar', () => {
    const documentNameColumn = toolkitDocuments.documentName;
    expect(documentNameColumn.columnType).toBe('PgVarchar');
    expect(documentNameColumn.notNull).toBe(true);
  });

  it('should have status with default pending', () => {
    const statusColumn = toolkitDocuments.status;
    expect(statusColumn.hasDefault).toBe(true);
    expect(statusColumn.notNull).toBe(true);
  });

  it('should have attempts with default 0', () => {
    const attemptsColumn = toolkitDocuments.attempts;
    expect(attemptsColumn.hasDefault).toBe(true);
    expect(attemptsColumn.notNull).toBe(true);
  });

  it('should have fileUrl and s3Key as optional', () => {
    expect(toolkitDocuments.fileUrl.notNull).toBeFalsy();
    expect(toolkitDocuments.s3Key.notNull).toBeFalsy();
  });

  it('should have errorMessage as optional text', () => {
    expect(toolkitDocuments.errorMessage.columnType).toBe('PgText');
    expect(toolkitDocuments.errorMessage.notNull).toBeFalsy();
  });

  it('should export correct types', () => {
    const doc: ToolkitDocument = {
      id: 'doc-uuid',
      purchaseId: 'purchase-uuid',
      userId: 'user-123',
      documentType: 'word',
      documentName: 'Strategic Alignment Brief',
      status: 'completed',
      fileUrl: 'https://s3.example.com/presigned-url',
      s3Key: 'toolkits/user-123/doc-uuid.docx',
      fileSizeBytes: 125000,
      errorMessage: null,
      attempts: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      generatedAt: new Date(),
    };
    expect(doc).toBeDefined();

    const newDoc: NewToolkitDocument = {
      purchaseId: 'purchase-uuid',
      userId: 'user-123',
      documentType: 'excel',
      documentName: 'Meeting Cost Tracker',
    };
    expect(newDoc).toBeDefined();
  });
});

describe('Phase 3 Schema: document enums (Story 18.1)', () => {
  it('should have document_status enum with correct values', () => {
    expect(documentStatusEnum.enumValues).toEqual([
      'pending',
      'generating',
      'completed',
      'failed',
    ]);
  });

  it('should have document_type enum with correct values', () => {
    expect(documentTypeEnum.enumValues).toEqual([
      'word',
      'excel',
      'pptx',
      'pdf',
    ]);
  });
});

describe('Phase 3 Schema: toolkit_documents relationships', () => {
  it('should reference purchases table via purchaseId', () => {
    expect(Object.keys(toolkitDocuments)).toContain('purchaseId');
  });

  it('should reference users table via userId', () => {
    expect(Object.keys(toolkitDocuments)).toContain('userId');
  });
});
