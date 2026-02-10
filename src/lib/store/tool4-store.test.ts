import { describe, it, expect, beforeEach } from 'vitest';
import { useTool4Store } from './tool4-store';

/**
 * Tool 4 Store Tests
 *
 * Story 11.1: Stakeholder Input Interface
 * Covers: AC6 (Zustand store with CRUD and persistence)
 */

describe('tool4-store', () => {
  beforeEach(() => {
    useTool4Store.getState().resetTool4();
  });

  describe('initial state', () => {
    it('starts with empty stakeholders array', () => {
      expect(useTool4Store.getState().stakeholders).toEqual([]);
    });

    it('starts with null sessionId', () => {
      expect(useTool4Store.getState().sessionId).toBeNull();
    });

    it('starts with isDirty false', () => {
      expect(useTool4Store.getState().isDirty).toBe(false);
    });

    it('starts with null completion', () => {
      expect(useTool4Store.getState().completion).toBeNull();
    });
  });

  describe('addStakeholder', () => {
    it('adds stakeholder to array', () => {
      const store = useTool4Store.getState();
      store.addStakeholder({
        name: 'John Doe',
        role: 'CEO',
        power: 10,
        interest: 8,
      });

      const { stakeholders } = useTool4Store.getState();
      expect(stakeholders).toHaveLength(1);
      expect(stakeholders[0].name).toBe('John Doe');
      expect(stakeholders[0].role).toBe('CEO');
    });

    it('generates unique id', () => {
      const store = useTool4Store.getState();
      const id = store.addStakeholder({
        name: 'John Doe',
        role: 'CEO',
        power: 10,
        interest: 8,
      });

      expect(id).toBeDefined();
      expect(id.startsWith('sh_')).toBe(true);
      expect(useTool4Store.getState().stakeholders[0].id).toBe(id);
    });

    it('sets isDirty to true', () => {
      useTool4Store.getState().addStakeholder({
        name: 'John',
        role: 'CEO',
        power: 5,
        interest: 5,
      });

      expect(useTool4Store.getState().isDirty).toBe(true);
    });

    it('clears completion on add', () => {
      const store = useTool4Store.getState();
      store.addStakeholder({ name: 'A', role: 'R', power: 5, interest: 5 });
      store.addStakeholder({ name: 'B', role: 'R', power: 5, interest: 5 });
      store.addStakeholder({ name: 'C', role: 'R', power: 5, interest: 5 });
      store.markComplete();

      expect(useTool4Store.getState().completion).not.toBeNull();

      store.addStakeholder({ name: 'D', role: 'R', power: 5, interest: 5 });
      expect(useTool4Store.getState().completion).toBeNull();
    });
  });

  describe('updateStakeholder', () => {
    it('updates existing stakeholder', () => {
      const store = useTool4Store.getState();
      const id = store.addStakeholder({
        name: 'John Doe',
        role: 'CEO',
        power: 5,
        interest: 5,
      });

      store.updateStakeholder(id, { name: 'Jane Doe', power: 10 });

      const stakeholder = useTool4Store.getState().stakeholders[0];
      expect(stakeholder.name).toBe('Jane Doe');
      expect(stakeholder.power).toBe(10);
      expect(stakeholder.role).toBe('CEO'); // unchanged
      expect(stakeholder.interest).toBe(5); // unchanged
    });

    it('does not affect other stakeholders', () => {
      const store = useTool4Store.getState();
      const id1 = store.addStakeholder({ name: 'A', role: 'R1', power: 5, interest: 5 });
      store.addStakeholder({ name: 'B', role: 'R2', power: 6, interest: 6 });

      store.updateStakeholder(id1, { name: 'Updated A' });

      const stakeholders = useTool4Store.getState().stakeholders;
      expect(stakeholders[0].name).toBe('Updated A');
      expect(stakeholders[1].name).toBe('B');
    });

    it('sets isDirty to true', () => {
      const store = useTool4Store.getState();
      const id = store.addStakeholder({ name: 'John', role: 'CEO', power: 5, interest: 5 });

      // Reset dirty flag
      useTool4Store.setState({ isDirty: false });

      store.updateStakeholder(id, { power: 10 });
      expect(useTool4Store.getState().isDirty).toBe(true);
    });
  });

  describe('removeStakeholder', () => {
    it('removes stakeholder by id', () => {
      const store = useTool4Store.getState();
      const id = store.addStakeholder({ name: 'John', role: 'CEO', power: 5, interest: 5 });

      store.removeStakeholder(id);

      expect(useTool4Store.getState().stakeholders).toHaveLength(0);
    });

    it('only removes the specified stakeholder', () => {
      const store = useTool4Store.getState();
      const id1 = store.addStakeholder({ name: 'A', role: 'R', power: 5, interest: 5 });
      store.addStakeholder({ name: 'B', role: 'R', power: 5, interest: 5 });

      store.removeStakeholder(id1);

      const stakeholders = useTool4Store.getState().stakeholders;
      expect(stakeholders).toHaveLength(1);
      expect(stakeholders[0].name).toBe('B');
    });

    it('sets isDirty to true', () => {
      const store = useTool4Store.getState();
      const id = store.addStakeholder({ name: 'John', role: 'CEO', power: 5, interest: 5 });

      useTool4Store.setState({ isDirty: false });

      store.removeStakeholder(id);
      expect(useTool4Store.getState().isDirty).toBe(true);
    });
  });

  describe('resetTool4', () => {
    it('clears all stakeholders', () => {
      const store = useTool4Store.getState();
      store.addStakeholder({ name: 'A', role: 'R', power: 5, interest: 5 });
      store.addStakeholder({ name: 'B', role: 'R', power: 5, interest: 5 });

      store.resetTool4();

      expect(useTool4Store.getState().stakeholders).toHaveLength(0);
    });

    it('resets isDirty to false', () => {
      const store = useTool4Store.getState();
      store.addStakeholder({ name: 'A', role: 'R', power: 5, interest: 5 });

      store.resetTool4();

      expect(useTool4Store.getState().isDirty).toBe(false);
    });

    it('clears completion', () => {
      const store = useTool4Store.getState();
      store.addStakeholder({ name: 'A', role: 'R', power: 5, interest: 5 });
      store.addStakeholder({ name: 'B', role: 'R', power: 5, interest: 5 });
      store.addStakeholder({ name: 'C', role: 'R', power: 5, interest: 5 });
      store.markComplete();

      store.resetTool4();

      expect(useTool4Store.getState().completion).toBeNull();
    });
  });

  describe('setSessionId', () => {
    it('sets sessionId', () => {
      useTool4Store.getState().setSessionId('session-123');
      expect(useTool4Store.getState().sessionId).toBe('session-123');
    });

    it('can clear sessionId with null', () => {
      useTool4Store.getState().setSessionId('session-123');
      useTool4Store.getState().setSessionId(null);
      expect(useTool4Store.getState().sessionId).toBeNull();
    });
  });

  describe('markComplete', () => {
    it('sets completion data', () => {
      const store = useTool4Store.getState();
      store.addStakeholder({ name: 'A', role: 'R', power: 8, interest: 8 });
      store.addStakeholder({ name: 'B', role: 'R', power: 3, interest: 3 });
      store.addStakeholder({ name: 'C', role: 'R', power: 8, interest: 3 });

      store.markComplete();

      const completion = useTool4Store.getState().completion;
      expect(completion).not.toBeNull();
      expect(completion?.completedAt).toBeDefined();
      expect(completion?.stakeholderCount).toBe(3);
      expect(completion?.quadrantCounts.key_players).toBe(1);
      expect(completion?.quadrantCounts.keep_satisfied).toBe(1);
      expect(completion?.quadrantCounts.monitor).toBe(1);
    });

    it('sets isDirty to true', () => {
      const store = useTool4Store.getState();
      store.addStakeholder({ name: 'A', role: 'R', power: 5, interest: 5 });
      store.addStakeholder({ name: 'B', role: 'R', power: 5, interest: 5 });
      store.addStakeholder({ name: 'C', role: 'R', power: 5, interest: 5 });

      useTool4Store.setState({ isDirty: false });

      store.markComplete();
      expect(useTool4Store.getState().isDirty).toBe(true);
    });
  });

  describe('computed helpers', () => {
    describe('getStakeholderCount', () => {
      it('returns 0 for empty store', () => {
        expect(useTool4Store.getState().getStakeholderCount()).toBe(0);
      });

      it('returns correct count', () => {
        const store = useTool4Store.getState();
        store.addStakeholder({ name: 'A', role: 'R', power: 5, interest: 5 });
        store.addStakeholder({ name: 'B', role: 'R', power: 5, interest: 5 });

        expect(store.getStakeholderCount()).toBe(2);
      });
    });

    describe('canProceed', () => {
      it('returns false with fewer than 3 stakeholders', () => {
        const store = useTool4Store.getState();
        expect(store.canProceed()).toBe(false);

        store.addStakeholder({ name: 'A', role: 'R', power: 5, interest: 5 });
        expect(store.canProceed()).toBe(false);

        store.addStakeholder({ name: 'B', role: 'R', power: 5, interest: 5 });
        expect(store.canProceed()).toBe(false);
      });

      it('returns true with 3 or more stakeholders', () => {
        const store = useTool4Store.getState();
        store.addStakeholder({ name: 'A', role: 'R', power: 5, interest: 5 });
        store.addStakeholder({ name: 'B', role: 'R', power: 5, interest: 5 });
        store.addStakeholder({ name: 'C', role: 'R', power: 5, interest: 5 });

        expect(store.canProceed()).toBe(true);
      });
    });

    describe('getQuadrantCounts', () => {
      it('returns counts by quadrant', () => {
        const store = useTool4Store.getState();
        store.addStakeholder({ name: 'A', role: 'R', power: 8, interest: 8 }); // key_players
        store.addStakeholder({ name: 'B', role: 'R', power: 8, interest: 3 }); // keep_satisfied
        store.addStakeholder({ name: 'C', role: 'R', power: 3, interest: 8 }); // keep_informed

        const counts = store.getQuadrantCounts();
        expect(counts.key_players).toBe(1);
        expect(counts.keep_satisfied).toBe(1);
        expect(counts.keep_informed).toBe(1);
        expect(counts.monitor).toBe(0);
      });
    });
  });
});
