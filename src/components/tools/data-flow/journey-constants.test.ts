/**
 * Tests for Data Flow Journey Constants
 *
 * Story 12.1: Data Journey Mapping Interface
 * Task 9.2: Unit tests for journey-constants
 */

import { describe, it, expect } from 'vitest';
import {
  STAGE_TYPES,
  JOURNEY_TEMPLATES,
  SYSTEM_SUGGESTIONS,
  getStageTypeInfo,
  getJourneyTemplate,
  generateJourneyId,
  generateStageId,
  calculateTotalLatency,
  formatLatency,
  validateJourney,
  validateStage,
  canProceedToFriction,
  createDefaultStage,
  MAX_JOURNEYS,
  RECOMMENDED_MIN_JOURNEYS,
  RECOMMENDED_MAX_JOURNEYS,
  MIN_STAGES,
} from './journey-constants';
import type { DataStage, DataJourney } from './journey-constants';

describe('Constants', () => {
  it('defines correct limits', () => {
    expect(MAX_JOURNEYS).toBe(10);
    expect(RECOMMENDED_MIN_JOURNEYS).toBe(3);
    expect(RECOMMENDED_MAX_JOURNEYS).toBe(5);
    expect(MIN_STAGES).toBe(2);
  });
});

describe('STAGE_TYPES', () => {
  it('defines all 5 stage types', () => {
    expect(STAGE_TYPES).toHaveLength(5);
    const ids = STAGE_TYPES.map((s) => s.id);
    expect(ids).toContain('source');
    expect(ids).toContain('extraction');
    expect(ids).toContain('storage');
    expect(ids).toContain('transformation');
    expect(ids).toContain('consumption');
  });

  it('each type has required fields', () => {
    STAGE_TYPES.forEach((type) => {
      expect(type.id).toBeDefined();
      expect(type.label).toBeDefined();
      expect(type.shortLabel).toBeDefined();
      expect(type.description).toBeDefined();
      expect(type.color).toBeDefined();
      expect(type.bgColor).toBeDefined();
      expect(type.borderColor).toBeDefined();
    });
  });
});

describe('JOURNEY_TEMPLATES', () => {
  it('defines 4 templates', () => {
    expect(JOURNEY_TEMPLATES).toHaveLength(4);
  });

  it('each template has required fields', () => {
    JOURNEY_TEMPLATES.forEach((template) => {
      expect(template.id).toBeDefined();
      expect(template.name).toBeDefined();
      expect(template.description).toBeDefined();
      expect(template.stages.length).toBeGreaterThanOrEqual(MIN_STAGES);
    });
  });

  it('Customer 360 template has 5 stages', () => {
    const template = JOURNEY_TEMPLATES.find((t) => t.id === 'customer-360');
    expect(template).toBeDefined();
    expect(template!.stages).toHaveLength(5);
  });

  it('template stages have correct order', () => {
    JOURNEY_TEMPLATES.forEach((template) => {
      template.stages.forEach((stage, index) => {
        expect(stage.order).toBe(index);
      });
    });
  });
});

describe('SYSTEM_SUGGESTIONS', () => {
  it('provides suggestions for all stage types', () => {
    expect(SYSTEM_SUGGESTIONS.source.length).toBeGreaterThan(0);
    expect(SYSTEM_SUGGESTIONS.extraction.length).toBeGreaterThan(0);
    expect(SYSTEM_SUGGESTIONS.storage.length).toBeGreaterThan(0);
    expect(SYSTEM_SUGGESTIONS.transformation.length).toBeGreaterThan(0);
    expect(SYSTEM_SUGGESTIONS.consumption.length).toBeGreaterThan(0);
  });
});

describe('getStageTypeInfo', () => {
  it('returns correct info for source', () => {
    const info = getStageTypeInfo('source');
    expect(info.id).toBe('source');
    expect(info.label).toBe('Source Systems');
  });

  it('returns correct info for consumption', () => {
    const info = getStageTypeInfo('consumption');
    expect(info.id).toBe('consumption');
    expect(info.label).toBe('Consumption');
  });

  it('returns first type for unknown (fallback)', () => {
    // @ts-expect-error testing invalid input
    const info = getStageTypeInfo('unknown');
    expect(info.id).toBe('source');
  });
});

describe('getJourneyTemplate', () => {
  it('returns template by ID', () => {
    const template = getJourneyTemplate('customer-360');
    expect(template).toBeDefined();
    expect(template!.name).toBe('Customer 360 for Sales');
  });

  it('returns undefined for unknown ID', () => {
    const template = getJourneyTemplate('unknown');
    expect(template).toBeUndefined();
  });
});

describe('generateJourneyId', () => {
  it('generates unique IDs', () => {
    const id1 = generateJourneyId();
    const id2 = generateJourneyId();
    expect(id1).not.toBe(id2);
  });

  it('starts with journey_ prefix', () => {
    const id = generateJourneyId();
    expect(id.startsWith('journey_')).toBe(true);
  });
});

describe('generateStageId', () => {
  it('generates unique IDs', () => {
    const id1 = generateStageId();
    const id2 = generateStageId();
    expect(id1).not.toBe(id2);
  });

  it('starts with stage_ prefix', () => {
    const id = generateStageId();
    expect(id.startsWith('stage_')).toBe(true);
  });
});

describe('calculateTotalLatency', () => {
  it('calculates total in hours', () => {
    const stages: DataStage[] = [
      { id: '1', type: 'source', systemName: 'A', owner: '', latency: 1, latencyUnit: 'hours', order: 0 },
      { id: '2', type: 'storage', systemName: 'B', owner: '', latency: 2, latencyUnit: 'hours', order: 1 },
    ];
    expect(calculateTotalLatency(stages)).toBe(3);
  });

  it('converts days to hours', () => {
    const stages: DataStage[] = [
      { id: '1', type: 'source', systemName: 'A', owner: '', latency: 1, latencyUnit: 'days', order: 0 },
    ];
    expect(calculateTotalLatency(stages)).toBe(24);
  });

  it('handles mixed units', () => {
    const stages: DataStage[] = [
      { id: '1', type: 'source', systemName: 'A', owner: '', latency: 12, latencyUnit: 'hours', order: 0 },
      { id: '2', type: 'storage', systemName: 'B', owner: '', latency: 1, latencyUnit: 'days', order: 1 },
    ];
    expect(calculateTotalLatency(stages)).toBe(36);
  });

  it('returns 0 for empty array', () => {
    expect(calculateTotalLatency([])).toBe(0);
  });
});

describe('formatLatency', () => {
  it('shows "Real-time" for 0', () => {
    expect(formatLatency(0)).toBe('Real-time');
  });

  it('shows minutes for less than 1 hour', () => {
    expect(formatLatency(0.5)).toBe('30m');
  });

  it('shows hours for less than 24', () => {
    expect(formatLatency(5)).toBe('5h');
    expect(formatLatency(23)).toBe('23h');
  });

  it('shows days for 24+', () => {
    expect(formatLatency(24)).toBe('1d');
    expect(formatLatency(48)).toBe('2d');
  });

  it('shows decimal days for non-whole numbers', () => {
    expect(formatLatency(36)).toBe('1.5d');
  });
});

describe('validateJourney', () => {
  it('valid with name and sufficient stages', () => {
    const journey: Partial<DataJourney> = {
      name: 'Test Journey',
      stages: [
        { id: '1', type: 'source', systemName: 'A', owner: '', latency: 0, latencyUnit: 'hours', order: 0 },
        { id: '2', type: 'storage', systemName: 'B', owner: '', latency: 0, latencyUnit: 'hours', order: 1 },
      ],
    };
    const result = validateJourney(journey);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it('invalid without name', () => {
    const journey: Partial<DataJourney> = {
      name: '',
      stages: [
        { id: '1', type: 'source', systemName: 'A', owner: '', latency: 0, latencyUnit: 'hours', order: 0 },
        { id: '2', type: 'storage', systemName: 'B', owner: '', latency: 0, latencyUnit: 'hours', order: 1 },
      ],
    };
    const result = validateJourney(journey);
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it('invalid with insufficient stages', () => {
    const journey: Partial<DataJourney> = {
      name: 'Test',
      stages: [
        { id: '1', type: 'source', systemName: 'A', owner: '', latency: 0, latencyUnit: 'hours', order: 0 },
      ],
    };
    const result = validateJourney(journey);
    expect(result.valid).toBe(false);
    expect(result.errors.stages).toBeDefined();
  });
});

describe('validateStage', () => {
  it('valid with system name', () => {
    const stage: Partial<DataStage> = {
      systemName: 'Salesforce',
      latency: 5,
    };
    const result = validateStage(stage);
    expect(result.valid).toBe(true);
  });

  it('invalid without system name', () => {
    const stage: Partial<DataStage> = {
      systemName: '',
      latency: 5,
    };
    const result = validateStage(stage);
    expect(result.valid).toBe(false);
    expect(result.errors.systemName).toBeDefined();
  });

  it('invalid with negative latency', () => {
    const stage: Partial<DataStage> = {
      systemName: 'Test',
      latency: -1,
    };
    const result = validateStage(stage);
    expect(result.valid).toBe(false);
    expect(result.errors.latency).toBeDefined();
  });
});

describe('canProceedToFriction', () => {
  it('true with at least one valid journey', () => {
    const journeys: DataJourney[] = [
      {
        id: '1',
        name: 'Test',
        stages: [
          { id: '1', type: 'source', systemName: 'A', owner: '', latency: 0, latencyUnit: 'hours', order: 0 },
          { id: '2', type: 'storage', systemName: 'B', owner: '', latency: 0, latencyUnit: 'hours', order: 1 },
        ],
        createdAt: '',
        updatedAt: '',
      },
    ];
    expect(canProceedToFriction(journeys)).toBe(true);
  });

  it('false with empty journeys', () => {
    expect(canProceedToFriction([])).toBe(false);
  });

  it('false with journey missing stages', () => {
    const journeys: DataJourney[] = [
      {
        id: '1',
        name: 'Test',
        stages: [
          { id: '1', type: 'source', systemName: 'A', owner: '', latency: 0, latencyUnit: 'hours', order: 0 },
        ],
        createdAt: '',
        updatedAt: '',
      },
    ];
    expect(canProceedToFriction(journeys)).toBe(false);
  });
});

describe('createDefaultStage', () => {
  it('creates stage with correct type and order', () => {
    const stage = createDefaultStage('extraction', 2);
    expect(stage.type).toBe('extraction');
    expect(stage.order).toBe(2);
    expect(stage.systemName).toBe('');
    expect(stage.owner).toBe('');
    expect(stage.latency).toBe(0);
    expect(stage.latencyUnit).toBe('hours');
  });
});
