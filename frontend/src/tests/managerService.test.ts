import { describe, it, expect, vi, beforeEach } from 'vitest';
import { managerService } from '@/services/api/managerService';
import { API_BASE_URL } from '@/config';

const token = 'test-token';

describe('managerService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => {
      if (key === 'authToken') return token;
      return null;
    });
  });

  it('fetches managers', async () => {
    (fetch as any).mockResolvedValue({ ok: true, json: async () => ([{ id: '1', email: 'a@a.com', name: 'A', role: 'manager' }]) });
    const res = await managerService.getManagers();
    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/managers`, { headers: { Authorization: `Bearer ${token}` } });
    expect(res.length).toBe(1);
  });

  it('creates manager', async () => {
    (fetch as any).mockResolvedValue({ ok: true, json: async () => ({ id: '2', email: 'b@b.com', name: 'B', role: 'manager' }) });
    const res = await managerService.createManager({ email: 'b@b.com', name: 'B', password: 'x' });
    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/managers`, expect.any(Object));
    expect(res?.id).toBe('2');
  });

  it('updates manager', async () => {
    (fetch as any).mockResolvedValue({ ok: true, json: async () => ({ id: '1', email: 'a@a.com', name: 'A1', role: 'manager' }) });
    const res = await managerService.updateManager({ id: '1', email: 'a@a.com', name: 'A1', role: 'manager' });
    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/managers/1`, expect.any(Object));
    expect(res?.name).toBe('A1');
  });

  it('deletes manager', async () => {
    (fetch as any).mockResolvedValue({ ok: true });
    const res = await managerService.deleteManager('1');
    expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/managers/1`, expect.any(Object));
    expect(res).toBe(true);
  });
}); 