/**
 * Tool Catalog Tests
 *
 * Story 16.2: Tool Recommendation Algorithm
 * Task 8.1: Unit tests for tool-catalog.ts
 */

import { describe, it, expect } from 'vitest';
import {
  PB2_TOOL_CATALOG,
  getPB2Tool,
  getAllPB2Tools,
  getPB2ToolsByPB1Source,
  getPB2ToolCount,
} from './tool-catalog';

describe('PB2 Tool Catalog', () => {
  describe('PB2_TOOL_CATALOG', () => {
    it('should contain exactly 10 tools', () => {
      expect(PB2_TOOL_CATALOG).toHaveLength(10);
    });

    it('should have unique IDs for all tools', () => {
      const ids = PB2_TOOL_CATALOG.map((tool) => tool.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have IDs from 1 to 10', () => {
      const ids = PB2_TOOL_CATALOG.map((tool) => tool.id).sort((a, b) => a - b);
      expect(ids).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should have all required fields for each tool', () => {
      for (const tool of PB2_TOOL_CATALOG) {
        expect(tool.id).toBeDefined();
        expect(tool.name).toBeDefined();
        expect(tool.shortName).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.bookChapter).toBeDefined();
        expect(tool.feedsFromPB1Tools).toBeDefined();
        expect(Array.isArray(tool.feedsFromPB1Tools)).toBe(true);
        expect(tool.documentOutput).toBeDefined();
        expect(tool.recommendationDescription).toBeDefined();
      }
    });

    it('should have valid PB1 tool references (1-7)', () => {
      for (const tool of PB2_TOOL_CATALOG) {
        for (const pb1Id of tool.feedsFromPB1Tools) {
          expect(pb1Id).toBeGreaterThanOrEqual(1);
          expect(pb1Id).toBeLessThanOrEqual(7);
        }
      }
    });

    it('should have valid document output extensions', () => {
      const validExtensions = ['.docx', '.xlsx', '.pptx', '.pdf'];
      for (const tool of PB2_TOOL_CATALOG) {
        const hasValidExtension = validExtensions.some((ext) =>
          tool.documentOutput.endsWith(ext)
        );
        expect(hasValidExtension).toBe(true);
      }
    });
  });

  describe('Specific Tool Definitions', () => {
    it('Tool 1: 30/60/90 Day Transformation Roadmap', () => {
      const tool = getPB2Tool(1);
      expect(tool).toBeDefined();
      expect(tool!.name).toBe('30/60/90 Day Transformation Roadmap');
      expect(tool!.feedsFromPB1Tools).toContain(1);
      expect(tool!.feedsFromPB1Tools).toContain(7);
    });

    it('Tool 2: Executive Steering Committee Charter', () => {
      const tool = getPB2Tool(2);
      expect(tool).toBeDefined();
      expect(tool!.shortName).toBe('Governance Charter');
      expect(tool!.feedsFromPB1Tools).toContain(4);
    });

    it('Tool 3: Decision Rights & Delegation Framework', () => {
      const tool = getPB2Tool(3);
      expect(tool).toBeDefined();
      expect(tool!.shortName).toBe('Delegation Framework');
      expect(tool!.feedsFromPB1Tools).toContain(3);
      expect(tool!.documentOutput).toBe('Decision_Rights_Matrix.xlsx');
    });

    it('Tool 4: Meeting Protocol', () => {
      const tool = getPB2Tool(4);
      expect(tool).toBeDefined();
      expect(tool!.shortName).toBe('Meeting Protocol');
      expect(tool!.feedsFromPB1Tools).toContain(2);
    });

    it('Tool 5: OKR Framework', () => {
      const tool = getPB2Tool(5);
      expect(tool).toBeDefined();
      expect(tool!.shortName).toBe('OKR Framework');
      expect(tool!.feedsFromPB1Tools).toContain(1);
    });

    it('Tool 6: Data Platform Playbook', () => {
      const tool = getPB2Tool(6);
      expect(tool).toBeDefined();
      expect(tool!.shortName).toBe('Data Platform Playbook');
      expect(tool!.feedsFromPB1Tools).toContain(5);
    });

    it('Tool 7: Communication Architecture', () => {
      const tool = getPB2Tool(7);
      expect(tool).toBeDefined();
      expect(tool!.shortName).toBe('Communication Architecture');
      expect(tool!.feedsFromPB1Tools).toContain(6);
    });

    it('Tool 8: ROI Dashboard', () => {
      const tool = getPB2Tool(8);
      expect(tool).toBeDefined();
      expect(tool!.shortName).toBe('ROI Dashboard');
      expect(tool!.feedsFromPB1Tools).toContain(7);
      expect(tool!.documentOutput).toBe('ROI_Dashboard.xlsx');
    });

    it('Tool 9: Change Readiness Assessment', () => {
      const tool = getPB2Tool(9);
      expect(tool).toBeDefined();
      expect(tool!.shortName).toBe('Change Readiness');
      expect(tool!.feedsFromPB1Tools).toContain(1);
      expect(tool!.feedsFromPB1Tools).toContain(4);
    });

    it('Tool 10: Executive Briefing Template', () => {
      const tool = getPB2Tool(10);
      expect(tool).toBeDefined();
      expect(tool!.shortName).toBe('Executive Briefing');
      expect(tool!.feedsFromPB1Tools).toContain(1);
      expect(tool!.feedsFromPB1Tools).toContain(7);
      expect(tool!.documentOutput).toContain('.pptx');
    });
  });

  describe('getPB2Tool', () => {
    it('should return the correct tool by ID', () => {
      const tool = getPB2Tool(3);
      expect(tool).toBeDefined();
      expect(tool!.id).toBe(3);
      expect(tool!.name).toBe('Decision Rights & Delegation Framework');
    });

    it('should return undefined for invalid ID', () => {
      expect(getPB2Tool(0)).toBeUndefined();
      expect(getPB2Tool(11)).toBeUndefined();
      expect(getPB2Tool(-1)).toBeUndefined();
    });
  });

  describe('getAllPB2Tools', () => {
    it('should return a copy of all tools', () => {
      const tools = getAllPB2Tools();
      expect(tools).toHaveLength(10);
      // Verify it's a copy, not the original
      expect(tools).not.toBe(PB2_TOOL_CATALOG);
    });
  });

  describe('getPB2ToolsByPB1Source', () => {
    it('should return tools fed by PB1 Tool 1', () => {
      const tools = getPB2ToolsByPB1Source(1);
      expect(tools.length).toBeGreaterThan(0);
      expect(tools.some((t) => t.id === 1)).toBe(true); // Transformation Roadmap
      expect(tools.some((t) => t.id === 5)).toBe(true); // OKR Framework
    });

    it('should return tools fed by PB1 Tool 3', () => {
      const tools = getPB2ToolsByPB1Source(3);
      expect(tools.length).toBe(1);
      expect(tools[0].id).toBe(3); // Delegation Framework
    });

    it('should return tools fed by PB1 Tool 7', () => {
      const tools = getPB2ToolsByPB1Source(7);
      expect(tools.length).toBeGreaterThan(0);
      expect(tools.some((t) => t.id === 8)).toBe(true); // ROI Dashboard
    });

    it('should return empty array for invalid PB1 tool ID', () => {
      const tools = getPB2ToolsByPB1Source(99);
      expect(tools).toHaveLength(0);
    });
  });

  describe('getPB2ToolCount', () => {
    it('should return 10', () => {
      expect(getPB2ToolCount()).toBe(10);
    });
  });
});
