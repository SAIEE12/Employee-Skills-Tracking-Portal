import { useState, useEffect } from 'react';
import { User } from '@/services/api/types';
import { managerService } from '@/services/api/managerService';

export function useManagers() {
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await managerService.getManagers();
      setManagers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load managers');
    } finally {
      setLoading(false);
    }
  };

  const createManager = async (managerData: Partial<User> & { password: string }): Promise<boolean> => {
    try {
      const newManager = await managerService.createManager(managerData);
      if (newManager) {
        setManagers(prev => [...prev, newManager]);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create manager');
      return false;
    }
  };

  const updateManager = async (manager: User): Promise<boolean> => {
    try {
      const updated = await managerService.updateManager(manager);
      if (updated) {
        setManagers(prev => prev.map(m => (m.id === manager.id ? updated : m)));
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update manager');
      return false;
    }
  };

  const deleteManager = async (id: string): Promise<boolean> => {
    try {
      const success = await managerService.deleteManager(id);
      if (success) {
        setManagers(prev => prev.filter(m => m.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete manager');
      return false;
    }
  };

  return {
    managers,
    loading,
    error,
    loadManagers,
    createManager,
    updateManager,
    deleteManager,
  };
} 