import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from './route';

// Mock auth
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    returning: vi.fn(),
  },
}));

import { auth } from '@/auth';
import { db } from '@/lib/db';

describe('/api/sessions/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSession = {
    id: 'session-123',
    userId: 'user-123',
    name: 'Test Session',
    status: 'in_progress',
    toolsCompleted: 2,
    data: { tool1: { completedAt: '2024-01-01' } },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  };

  const createParams = (id: string) => ({
    params: Promise.resolve({ id }),
  });

  describe('GET /api/sessions/[id]', () => {
    const createRequest = () => {
      return new NextRequest('http://localhost/api/sessions/session-123', {
        method: 'GET',
      });
    };

    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const response = await GET(createRequest(), createParams('session-123'));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 404 when session not found', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as never);
      vi.mocked(db.where).mockResolvedValue([] as never);

      const response = await GET(createRequest(), createParams('nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('should return session for authenticated owner', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as never);
      vi.mocked(db.where).mockResolvedValue([mockSession] as never);

      const response = await GET(createRequest(), createParams('session-123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.session.id).toBe('session-123');
    });

    it('should return 500 on database error', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as never);
      vi.mocked(db.where).mockRejectedValue(new Error('DB error'));

      const response = await GET(createRequest(), createParams('session-123'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('SERVER_ERROR');
    });
  });

  describe('PUT /api/sessions/[id]', () => {
    const createRequest = (body: object) => {
      return new NextRequest('http://localhost/api/sessions/session-123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    };

    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const response = await PUT(createRequest({ name: 'Updated' }), createParams('session-123'));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 404 when session not found', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as never);
      vi.mocked(db.where).mockResolvedValue([] as never);

      const response = await PUT(createRequest({ name: 'Updated' }), createParams('nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('should update session name', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as never);
      vi.mocked(db.where).mockResolvedValue([mockSession] as never);
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([{ ...mockSession, name: 'Updated Session' }]),
          }),
        }),
      } as never);

      const response = await PUT(createRequest({ name: 'Updated Session' }), createParams('session-123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.session.name).toBe('Updated Session');
    });

    it('should merge data and count completed tools', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as never);
      vi.mocked(db.where).mockResolvedValue([mockSession] as never);
      
      const updatedSession = {
        ...mockSession,
        toolsCompleted: 2,
        data: {
          tool1: { completedAt: '2024-01-01' },
          tool2: { inputs: { test: 1 }, completedAt: '2024-01-02' },
        },
      };
      
      vi.mocked(db.update).mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([updatedSession]),
          }),
        }),
      } as never);

      const response = await PUT(
        createRequest({
          data: { tool2: { inputs: { test: 1 }, completedAt: '2024-01-02' } },
        }),
        createParams('session-123')
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.session.toolsCompleted).toBe(2);
    });

    it('should return 500 on database error', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as never);
      vi.mocked(db.where).mockRejectedValue(new Error('DB error'));

      const response = await PUT(createRequest({ name: 'Updated' }), createParams('session-123'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('SERVER_ERROR');
    });
  });

  describe('DELETE /api/sessions/[id]', () => {
    const createRequest = () => {
      return new NextRequest('http://localhost/api/sessions/session-123', {
        method: 'DELETE',
      });
    };

    it('should return 401 when not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null);

      const response = await DELETE(createRequest(), createParams('session-123'));
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 404 when session not found', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as never);
      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      } as never);

      const response = await DELETE(createRequest(), createParams('nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('should delete session successfully', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as never);
      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockSession]),
        }),
      } as never);

      const response = await DELETE(createRequest(), createParams('session-123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return 500 on database error', async () => {
      vi.mocked(auth).mockResolvedValue({
        user: { id: 'user-123', email: 'test@example.com' },
      } as never);
      vi.mocked(db.delete).mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(new Error('DB error')),
        }),
      } as never);

      const response = await DELETE(createRequest(), createParams('session-123'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('SERVER_ERROR');
    });
  });
});
