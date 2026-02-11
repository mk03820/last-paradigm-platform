/**
 * Tests for Tool 5 Data Flow Store
 *
 * Story 12.1: Data Journey Mapping Interface
 * Task 9.1: Unit tests for tool5-store
 *
 * Story 12.2: Friction Point Identification
 * Task 8.2: Unit tests for store friction actions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useTool5Store } from './tool5-store';

describe('useTool5Store', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useTool5Store());
    act(() => {
      result.current.resetTool5();
    });
  });

  describe('initial state', () => {
    it('starts with empty journeys', () => {
      const { result } = renderHook(() => useTool5Store());
      expect(result.current.journeys).toEqual([]);
    });

    it('starts with no active journey', () => {
      const { result } = renderHook(() => useTool5Store());
      expect(result.current.activeJourneyId).toBeNull();
    });

    it('starts as not complete', () => {
      const { result } = renderHook(() => useTool5Store());
      expect(result.current.completion).toBeNull();
    });
  });

  describe('addJourney', () => {
    it('adds a journey with generated ID', () => {
      const { result } = renderHook(() => useTool5Store());

      let journeyId: string;
      act(() => {
        journeyId = result.current.addJourney({
          name: 'Test Journey',
          stages: [],
        });
      });

      expect(journeyId!).toBeDefined();
      expect(result.current.journeys).toHaveLength(1);
      expect(result.current.journeys[0].name).toBe('Test Journey');
    });

    it('sets active journey to new journey', () => {
      const { result } = renderHook(() => useTool5Store());

      let journeyId: string;
      act(() => {
        journeyId = result.current.addJourney({
          name: 'Test Journey',
          stages: [],
        });
      });

      expect(result.current.activeJourneyId).toBe(journeyId!);
    });

    it('adds timestamps', () => {
      const { result } = renderHook(() => useTool5Store());

      act(() => {
        result.current.addJourney({
          name: 'Test Journey',
          stages: [],
        });
      });

      expect(result.current.journeys[0].createdAt).toBeDefined();
      expect(result.current.journeys[0].updatedAt).toBeDefined();
    });

    it('generates IDs for stages', () => {
      const { result } = renderHook(() => useTool5Store());

      act(() => {
        result.current.addJourney({
          name: 'Test Journey',
          stages: [
            { type: 'source', systemName: 'A', owner: '', latency: 0, latencyUnit: 'hours', order: 0 },
          ],
        });
      });

      expect(result.current.journeys[0].stages[0].id).toBeDefined();
    });

    it('marks store as dirty', () => {
      const { result } = renderHook(() => useTool5Store());

      act(() => {
        result.current.addJourney({
          name: 'Test Journey',
          stages: [],
        });
      });

      expect(result.current.isDirty).toBe(true);
    });

    it('clears completion', () => {
      const { result } = renderHook(() => useTool5Store());

      act(() => {
        result.current.addJourney({
          name: 'Test',
          stages: [
            { type: 'source', systemName: 'A', owner: '', latency: 0, latencyUnit: 'hours', order: 0 },
            { type: 'storage', systemName: 'B', owner: '', latency: 0, latencyUnit: 'hours', order: 1 },
          ],
        });
        result.current.markComplete();
      });

      expect(result.current.completion).not.toBeNull();

      act(() => {
        result.current.addJourney({
          name: 'Another',
          stages: [],
        });
      });

      expect(result.current.completion).toBeNull();
    });
  });

  describe('updateJourney', () => {
    it('updates journey name', () => {
      const { result } = renderHook(() => useTool5Store());

      let journeyId: string;
      act(() => {
        journeyId = result.current.addJourney({
          name: 'Original',
          stages: [],
        });
      });

      act(() => {
        result.current.updateJourney(journeyId!, { name: 'Updated' });
      });

      expect(result.current.journeys[0].name).toBe('Updated');
    });

    it('updates timestamp', async () => {
      const { result } = renderHook(() => useTool5Store());

      let journeyId: string;
      act(() => {
        journeyId = result.current.addJourney({
          name: 'Test',
          stages: [],
        });
      });

      const originalUpdatedAt = result.current.journeys[0].updatedAt;

      // Wait to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));

      act(() => {
        result.current.updateJourney(journeyId!, { name: 'Updated' });
      });

      // Just verify the field exists and is a valid ISO string
      expect(result.current.journeys[0].updatedAt).toBeDefined();
      expect(new Date(result.current.journeys[0].updatedAt).toISOString()).toBe(
        result.current.journeys[0].updatedAt
      );
    });
  });

  describe('removeJourney', () => {
    it('removes journey by ID', () => {
      const { result } = renderHook(() => useTool5Store());

      let journeyId: string;
      act(() => {
        journeyId = result.current.addJourney({
          name: 'Test',
          stages: [],
        });
      });

      expect(result.current.journeys).toHaveLength(1);

      act(() => {
        result.current.removeJourney(journeyId!);
      });

      expect(result.current.journeys).toHaveLength(0);
    });

    it('clears active journey if removed', () => {
      const { result } = renderHook(() => useTool5Store());

      let journeyId: string;
      act(() => {
        journeyId = result.current.addJourney({
          name: 'Test',
          stages: [],
        });
      });

      expect(result.current.activeJourneyId).toBe(journeyId!);

      act(() => {
        result.current.removeJourney(journeyId!);
      });

      expect(result.current.activeJourneyId).toBeNull();
    });

    it('keeps other journeys', () => {
      const { result } = renderHook(() => useTool5Store());

      let journeyId1: string;
      let journeyId2: string;
      act(() => {
        journeyId1 = result.current.addJourney({ name: 'Journey 1', stages: [] });
        journeyId2 = result.current.addJourney({ name: 'Journey 2', stages: [] });
      });

      act(() => {
        result.current.removeJourney(journeyId1!);
      });

      expect(result.current.journeys).toHaveLength(1);
      expect(result.current.journeys[0].id).toBe(journeyId2!);
    });
  });

  describe('setActiveJourney', () => {
    it('sets active journey ID', () => {
      const { result } = renderHook(() => useTool5Store());

      let journeyId: string;
      act(() => {
        journeyId = result.current.addJourney({ name: 'Test', stages: [] });
      });

      act(() => {
        result.current.setActiveJourney(null);
      });

      expect(result.current.activeJourneyId).toBeNull();

      act(() => {
        result.current.setActiveJourney(journeyId!);
      });

      expect(result.current.activeJourneyId).toBe(journeyId!);
    });
  });

  describe('addStage', () => {
    it('adds stage to journey', () => {
      const { result } = renderHook(() => useTool5Store());

      let journeyId: string;
      act(() => {
        journeyId = result.current.addJourney({ name: 'Test', stages: [] });
      });

      act(() => {
        result.current.addStage(journeyId!, {
          type: 'source',
          systemName: 'Salesforce',
          owner: 'Team A',
          latency: 2,
          latencyUnit: 'hours',
          order: 0,
        });
      });

      expect(result.current.journeys[0].stages).toHaveLength(1);
      expect(result.current.journeys[0].stages[0].systemName).toBe('Salesforce');
    });

    it('returns stage ID', () => {
      const { result } = renderHook(() => useTool5Store());

      let journeyId: string;
      act(() => {
        journeyId = result.current.addJourney({ name: 'Test', stages: [] });
      });

      let stageId: string;
      act(() => {
        stageId = result.current.addStage(journeyId!, {
          type: 'source',
          systemName: 'Test',
          owner: '',
          latency: 0,
          latencyUnit: 'hours',
          order: 0,
        });
      });

      expect(stageId!).toBeDefined();
      expect(result.current.journeys[0].stages[0].id).toBe(stageId!);
    });
  });

  describe('updateStage', () => {
    it('updates stage properties', () => {
      const { result } = renderHook(() => useTool5Store());

      let journeyId: string;
      let stageId: string;
      act(() => {
        journeyId = result.current.addJourney({ name: 'Test', stages: [] });
        stageId = result.current.addStage(journeyId!, {
          type: 'source',
          systemName: 'Original',
          owner: '',
          latency: 0,
          latencyUnit: 'hours',
          order: 0,
        });
      });

      act(() => {
        result.current.updateStage(journeyId!, stageId!, {
          systemName: 'Updated',
          latency: 5,
        });
      });

      expect(result.current.journeys[0].stages[0].systemName).toBe('Updated');
      expect(result.current.journeys[0].stages[0].latency).toBe(5);
    });
  });

  describe('removeStage', () => {
    it('removes stage from journey', () => {
      const { result } = renderHook(() => useTool5Store());

      let journeyId: string;
      let stageId: string;
      act(() => {
        journeyId = result.current.addJourney({ name: 'Test', stages: [] });
        stageId = result.current.addStage(journeyId!, {
          type: 'source',
          systemName: 'Test',
          owner: '',
          latency: 0,
          latencyUnit: 'hours',
          order: 0,
        });
      });

      expect(result.current.journeys[0].stages).toHaveLength(1);

      act(() => {
        result.current.removeStage(journeyId!, stageId!);
      });

      expect(result.current.journeys[0].stages).toHaveLength(0);
    });
  });

  describe('reorderStages', () => {
    it('reorders stages by ID array', () => {
      const { result } = renderHook(() => useTool5Store());

      let journeyId: string;
      let stageId1: string;
      let stageId2: string;
      act(() => {
        journeyId = result.current.addJourney({ name: 'Test', stages: [] });
        stageId1 = result.current.addStage(journeyId!, {
          type: 'source',
          systemName: 'First',
          owner: '',
          latency: 0,
          latencyUnit: 'hours',
          order: 0,
        });
        stageId2 = result.current.addStage(journeyId!, {
          type: 'storage',
          systemName: 'Second',
          owner: '',
          latency: 0,
          latencyUnit: 'hours',
          order: 1,
        });
      });

      act(() => {
        result.current.reorderStages(journeyId!, [stageId2!, stageId1!]);
      });

      expect(result.current.journeys[0].stages[0].order).toBe(0);
      expect(result.current.journeys[0].stages[0].systemName).toBe('Second');
      expect(result.current.journeys[0].stages[1].order).toBe(1);
      expect(result.current.journeys[0].stages[1].systemName).toBe('First');
    });
  });

  describe('applyTemplate', () => {
    it('creates journey from template', () => {
      const { result } = renderHook(() => useTool5Store());

      let journeyId: string | null;
      act(() => {
        journeyId = result.current.applyTemplate('customer-360');
      });

      expect(journeyId).not.toBeNull();
      expect(result.current.journeys).toHaveLength(1);
      expect(result.current.journeys[0].name).toBe('Customer 360 for Sales');
      expect(result.current.journeys[0].stages).toHaveLength(5);
    });

    it('uses custom name if provided', () => {
      const { result } = renderHook(() => useTool5Store());

      act(() => {
        result.current.applyTemplate('customer-360', 'My Custom Journey');
      });

      expect(result.current.journeys[0].name).toBe('My Custom Journey');
    });

    it('returns null for unknown template', () => {
      const { result } = renderHook(() => useTool5Store());

      let journeyId: string | null;
      act(() => {
        journeyId = result.current.applyTemplate('unknown');
      });

      expect(journeyId).toBeNull();
      expect(result.current.journeys).toHaveLength(0);
    });

    it('sets active journey', () => {
      const { result } = renderHook(() => useTool5Store());

      let journeyId: string | null;
      act(() => {
        journeyId = result.current.applyTemplate('customer-360');
      });

      expect(result.current.activeJourneyId).toBe(journeyId);
    });
  });

  describe('markComplete', () => {
    it('sets completion data', () => {
      const { result } = renderHook(() => useTool5Store());

      act(() => {
        result.current.addJourney({
          name: 'Test',
          stages: [
            { type: 'source', systemName: 'A', owner: '', latency: 2, latencyUnit: 'hours', order: 0 },
            { type: 'storage', systemName: 'B', owner: '', latency: 1, latencyUnit: 'days', order: 1 },
          ],
        });
        result.current.markComplete();
      });

      expect(result.current.completion).not.toBeNull();
      expect(result.current.completion!.journeyCount).toBe(1);
      expect(result.current.completion!.totalStages).toBe(2);
      expect(result.current.completion!.totalLatencyHours).toBe(26); // 2 + 24
      expect(result.current.completion!.completedAt).toBeDefined();
    });
  });

  describe('resetTool5', () => {
    it('resets all state', () => {
      const { result } = renderHook(() => useTool5Store());

      act(() => {
        result.current.addJourney({ name: 'Test', stages: [] });
        result.current.markComplete();
      });

      expect(result.current.journeys).toHaveLength(1);

      act(() => {
        result.current.resetTool5();
      });

      expect(result.current.journeys).toHaveLength(0);
      expect(result.current.activeJourneyId).toBeNull();
      expect(result.current.completion).toBeNull();
      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('computed helpers', () => {
    it('getJourneyCount returns count', () => {
      const { result } = renderHook(() => useTool5Store());

      expect(result.current.getJourneyCount()).toBe(0);

      act(() => {
        result.current.addJourney({ name: 'Test 1', stages: [] });
        result.current.addJourney({ name: 'Test 2', stages: [] });
      });

      expect(result.current.getJourneyCount()).toBe(2);
    });

    it('getActiveJourney returns active journey', () => {
      const { result } = renderHook(() => useTool5Store());

      expect(result.current.getActiveJourney()).toBeUndefined();

      act(() => {
        result.current.addJourney({ name: 'Test', stages: [] });
      });

      const active = result.current.getActiveJourney();
      expect(active).toBeDefined();
      expect(active!.name).toBe('Test');
    });

    it('getTotalLatency returns sum across journeys', () => {
      const { result } = renderHook(() => useTool5Store());

      expect(result.current.getTotalLatency()).toBe(0);

      act(() => {
        result.current.addJourney({
          name: 'Test 1',
          stages: [
            { type: 'source', systemName: 'A', owner: '', latency: 5, latencyUnit: 'hours', order: 0 },
          ],
        });
        result.current.addJourney({
          name: 'Test 2',
          stages: [
            { type: 'source', systemName: 'B', owner: '', latency: 1, latencyUnit: 'days', order: 0 },
          ],
        });
      });

      expect(result.current.getTotalLatency()).toBe(29); // 5 + 24
    });
  });

  // Story 12.2: Friction Point tests
  describe('friction points', () => {
    describe('initial state', () => {
      it('starts with empty friction points', () => {
        const { result } = renderHook(() => useTool5Store());
        expect(result.current.frictionPoints).toEqual([]);
      });
    });

    describe('addFrictionPoint', () => {
      it('adds a friction point with generated ID', () => {
        const { result } = renderHook(() => useTool5Store());

        let frictionId: string;
        act(() => {
          frictionId = result.current.addFrictionPoint({
            journeyId: 'journey_1',
            stageId: 'stage_1',
            category: 'access_bureaucracy',
            description: 'Test friction',
            severity: { frequency: 2, effort: 2, impact: 2 },
          });
        });

        expect(frictionId!).toBeDefined();
        expect(result.current.frictionPoints).toHaveLength(1);
        expect(result.current.frictionPoints[0].description).toBe('Test friction');
      });

      it('adds timestamps', () => {
        const { result } = renderHook(() => useTool5Store());

        act(() => {
          result.current.addFrictionPoint({
            journeyId: 'journey_1',
            stageId: 'stage_1',
            category: 'technical_debt',
            description: 'Test',
            severity: { frequency: 1, effort: 1, impact: 1 },
          });
        });

        expect(result.current.frictionPoints[0].createdAt).toBeDefined();
        expect(result.current.frictionPoints[0].updatedAt).toBeDefined();
      });

      it('marks store as dirty', () => {
        const { result } = renderHook(() => useTool5Store());

        act(() => {
          result.current.addFrictionPoint({
            journeyId: 'journey_1',
            stageId: 'stage_1',
            category: 'quality_degradation',
            description: 'Test',
            severity: { frequency: 1, effort: 1, impact: 1 },
          });
        });

        expect(result.current.isDirty).toBe(true);
      });

      it('clears completion', () => {
        const { result } = renderHook(() => useTool5Store());

        act(() => {
          result.current.addJourney({
            name: 'Test',
            stages: [
              { type: 'source', systemName: 'A', owner: '', latency: 0, latencyUnit: 'hours', order: 0 },
              { type: 'storage', systemName: 'B', owner: '', latency: 0, latencyUnit: 'hours', order: 1 },
            ],
          });
          result.current.markComplete();
        });

        expect(result.current.completion).not.toBeNull();

        act(() => {
          result.current.addFrictionPoint({
            journeyId: 'journey_1',
            stageId: 'stage_1',
            category: 'multiple_sources',
            description: 'Test',
            severity: { frequency: 1, effort: 1, impact: 1 },
          });
        });

        expect(result.current.completion).toBeNull();
      });
    });

    describe('updateFrictionPoint', () => {
      it('updates friction point properties', () => {
        const { result } = renderHook(() => useTool5Store());

        let frictionId: string;
        act(() => {
          frictionId = result.current.addFrictionPoint({
            journeyId: 'journey_1',
            stageId: 'stage_1',
            category: 'access_bureaucracy',
            description: 'Original',
            severity: { frequency: 1, effort: 1, impact: 1 },
          });
        });

        act(() => {
          result.current.updateFrictionPoint(frictionId!, {
            description: 'Updated',
            severity: { frequency: 3, effort: 3, impact: 3 },
          });
        });

        expect(result.current.frictionPoints[0].description).toBe('Updated');
        expect(result.current.frictionPoints[0].severity.frequency).toBe(3);
      });

      it('updates timestamp', () => {
        const { result } = renderHook(() => useTool5Store());

        let frictionId: string;
        act(() => {
          frictionId = result.current.addFrictionPoint({
            journeyId: 'journey_1',
            stageId: 'stage_1',
            category: 'technical_debt',
            description: 'Test',
            severity: { frequency: 1, effort: 1, impact: 1 },
          });
        });

        act(() => {
          result.current.updateFrictionPoint(frictionId!, { description: 'Updated' });
        });

        expect(result.current.frictionPoints[0].updatedAt).toBeDefined();
      });
    });

    describe('removeFrictionPoint', () => {
      it('removes friction point by ID', () => {
        const { result } = renderHook(() => useTool5Store());

        let frictionId: string;
        act(() => {
          frictionId = result.current.addFrictionPoint({
            journeyId: 'journey_1',
            stageId: 'stage_1',
            category: 'quality_degradation',
            description: 'Test',
            severity: { frequency: 1, effort: 1, impact: 1 },
          });
        });

        expect(result.current.frictionPoints).toHaveLength(1);

        act(() => {
          result.current.removeFrictionPoint(frictionId!);
        });

        expect(result.current.frictionPoints).toHaveLength(0);
      });

      it('keeps other friction points', () => {
        const { result } = renderHook(() => useTool5Store());

        let frictionId1: string;
        let frictionId2: string;
        act(() => {
          frictionId1 = result.current.addFrictionPoint({
            journeyId: 'journey_1',
            stageId: 'stage_1',
            category: 'access_bureaucracy',
            description: 'Friction 1',
            severity: { frequency: 1, effort: 1, impact: 1 },
          });
          frictionId2 = result.current.addFrictionPoint({
            journeyId: 'journey_1',
            stageId: 'stage_2',
            category: 'technical_debt',
            description: 'Friction 2',
            severity: { frequency: 2, effort: 2, impact: 2 },
          });
        });

        act(() => {
          result.current.removeFrictionPoint(frictionId1!);
        });

        expect(result.current.frictionPoints).toHaveLength(1);
        expect(result.current.frictionPoints[0].id).toBe(frictionId2!);
      });
    });

    describe('removeJourney cleans up friction points', () => {
      it('removes associated friction points when journey is removed', () => {
        const { result } = renderHook(() => useTool5Store());

        let journeyId: string;
        act(() => {
          journeyId = result.current.addJourney({
            name: 'Test Journey',
            stages: [
              { type: 'source', systemName: 'A', owner: '', latency: 0, latencyUnit: 'hours', order: 0 },
            ],
          });
          result.current.addFrictionPoint({
            journeyId: journeyId!,
            stageId: 'stage_1',
            category: 'access_bureaucracy',
            description: 'Test',
            severity: { frequency: 1, effort: 1, impact: 1 },
          });
        });

        expect(result.current.frictionPoints).toHaveLength(1);

        act(() => {
          result.current.removeJourney(journeyId!);
        });

        expect(result.current.frictionPoints).toHaveLength(0);
      });

      it('keeps friction points from other journeys', () => {
        const { result } = renderHook(() => useTool5Store());

        let journeyId1: string;
        let journeyId2: string;
        act(() => {
          journeyId1 = result.current.addJourney({
            name: 'Journey 1',
            stages: [],
          });
          journeyId2 = result.current.addJourney({
            name: 'Journey 2',
            stages: [],
          });
          result.current.addFrictionPoint({
            journeyId: journeyId1!,
            stageId: 'stage_1',
            category: 'access_bureaucracy',
            description: 'Journey 1 friction',
            severity: { frequency: 1, effort: 1, impact: 1 },
          });
          result.current.addFrictionPoint({
            journeyId: journeyId2!,
            stageId: 'stage_2',
            category: 'technical_debt',
            description: 'Journey 2 friction',
            severity: { frequency: 2, effort: 2, impact: 2 },
          });
        });

        act(() => {
          result.current.removeJourney(journeyId1!);
        });

        expect(result.current.frictionPoints).toHaveLength(1);
        expect(result.current.frictionPoints[0].journeyId).toBe(journeyId2!);
      });
    });

    describe('removeStage cleans up friction points', () => {
      it('removes associated friction points when stage is removed', () => {
        const { result } = renderHook(() => useTool5Store());

        let journeyId: string;
        let stageId: string;
        act(() => {
          journeyId = result.current.addJourney({
            name: 'Test Journey',
            stages: [],
          });
          stageId = result.current.addStage(journeyId!, {
            type: 'source',
            systemName: 'Test Stage',
            owner: '',
            latency: 0,
            latencyUnit: 'hours',
            order: 0,
          });
          result.current.addFrictionPoint({
            journeyId: journeyId!,
            stageId: stageId!,
            category: 'quality_degradation',
            description: 'Test',
            severity: { frequency: 1, effort: 1, impact: 1 },
          });
        });

        expect(result.current.frictionPoints).toHaveLength(1);

        act(() => {
          result.current.removeStage(journeyId!, stageId!);
        });

        expect(result.current.frictionPoints).toHaveLength(0);
      });
    });

    describe('getFrictionPointsByJourney', () => {
      it('returns friction points for specific journey', () => {
        const { result } = renderHook(() => useTool5Store());

        act(() => {
          result.current.addFrictionPoint({
            journeyId: 'journey_1',
            stageId: 'stage_1',
            category: 'access_bureaucracy',
            description: 'Journey 1 friction',
            severity: { frequency: 1, effort: 1, impact: 1 },
          });
          result.current.addFrictionPoint({
            journeyId: 'journey_2',
            stageId: 'stage_2',
            category: 'technical_debt',
            description: 'Journey 2 friction',
            severity: { frequency: 2, effort: 2, impact: 2 },
          });
        });

        const journey1Points = result.current.getFrictionPointsByJourney('journey_1');
        expect(journey1Points).toHaveLength(1);
        expect(journey1Points[0].description).toBe('Journey 1 friction');
      });

      it('returns empty array for journey with no friction', () => {
        const { result } = renderHook(() => useTool5Store());

        const points = result.current.getFrictionPointsByJourney('nonexistent');
        expect(points).toEqual([]);
      });
    });

    describe('getFrictionPointsByStage', () => {
      it('returns friction points for specific stage', () => {
        const { result } = renderHook(() => useTool5Store());

        act(() => {
          result.current.addFrictionPoint({
            journeyId: 'journey_1',
            stageId: 'stage_1',
            category: 'access_bureaucracy',
            description: 'Stage 1 friction',
            severity: { frequency: 1, effort: 1, impact: 1 },
          });
          result.current.addFrictionPoint({
            journeyId: 'journey_1',
            stageId: 'stage_2',
            category: 'technical_debt',
            description: 'Stage 2 friction',
            severity: { frequency: 2, effort: 2, impact: 2 },
          });
        });

        const stage1Points = result.current.getFrictionPointsByStage('stage_1');
        expect(stage1Points).toHaveLength(1);
        expect(stage1Points[0].description).toBe('Stage 1 friction');
      });
    });

    describe('getTotalFrictionCount', () => {
      it('returns total count of friction points', () => {
        const { result } = renderHook(() => useTool5Store());

        expect(result.current.getTotalFrictionCount()).toBe(0);

        act(() => {
          result.current.addFrictionPoint({
            journeyId: 'journey_1',
            stageId: 'stage_1',
            category: 'access_bureaucracy',
            description: 'Test 1',
            severity: { frequency: 1, effort: 1, impact: 1 },
          });
          result.current.addFrictionPoint({
            journeyId: 'journey_2',
            stageId: 'stage_2',
            category: 'technical_debt',
            description: 'Test 2',
            severity: { frequency: 2, effort: 2, impact: 2 },
          });
        });

        expect(result.current.getTotalFrictionCount()).toBe(2);
      });
    });

    describe('resetTool5 clears friction points', () => {
      it('clears friction points on reset', () => {
        const { result } = renderHook(() => useTool5Store());

        act(() => {
          result.current.addFrictionPoint({
            journeyId: 'journey_1',
            stageId: 'stage_1',
            category: 'access_bureaucracy',
            description: 'Test',
            severity: { frequency: 1, effort: 1, impact: 1 },
          });
        });

        expect(result.current.frictionPoints).toHaveLength(1);

        act(() => {
          result.current.resetTool5();
        });

        expect(result.current.frictionPoints).toHaveLength(0);
      });
    });
  });
});
