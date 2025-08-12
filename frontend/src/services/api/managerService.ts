import { USE_MOCK_DATA, API_BASE_URL } from '@/config';
import { User } from './types';
import { authService } from './authService';

class ManagerService {
  private getAuthHeaders(): Record<string, string> {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getManagers(): Promise<User[]> {
    if (USE_MOCK_DATA) {
      return this.getMockManagers();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/managers`, {
        headers: this.getAuthHeaders(),
      });
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Get managers error:', error);
      return [];
    }
  }

  async getManager(id: string): Promise<User | null> {
    if (USE_MOCK_DATA) {
      return this.getMockManager(id);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/managers/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error('Get manager error:', error);
      return null;
    }
  }

  async createManager(manager: Partial<User> & { password: string }): Promise<User | null> {
    if (USE_MOCK_DATA) {
      return this.mockCreateManager(manager);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/managers`, {
        method: 'POST',
        headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(manager),
      });
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error('Create manager error:', error);
      return null;
    }
  }

  async updateManager(manager: User): Promise<User | null> {
    if (USE_MOCK_DATA) {
      return this.mockUpdateManager(manager);
    }

    try {
      const { id, role, ...payload } = manager;
      const response = await fetch(`${API_BASE_URL}/managers/${id}`, {
        method: 'PUT',
        headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error('Update manager error:', error);
      return null;
    }
  }

  async deleteManager(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      return this.mockDeleteManager(id);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/managers/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      return response.ok;
    } catch (error) {
      console.error('Delete manager error:', error);
      return false;
    }
  }

  // Mock implementations
  private getMockManagers(): User[] {
    return [
      {
        id: '3',
        email: 'mike.manager@company.com',
        name: 'Mike Wilson',
        role: 'manager',
        department: 'Management',
        experience: 12,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      }
    ];
  }

  private getMockManager(id: string): User | null {
    return this.getMockManagers().find(m => m.id === id) || null;
  }

  private async mockCreateManager(managerData: Partial<User> & { password: string }): Promise<User> {
    return {
      id: Date.now().toString(),
      name: managerData.name!,
      email: managerData.email!,
      role: 'manager',
      department: managerData.department || '',
      experience: managerData.experience || 0,
    };
  }

  private async mockUpdateManager(manager: User): Promise<User> {
    return manager;
  }

  private async mockDeleteManager(id: string): Promise<boolean> {
    return true;
  }
}

export const managerService = new ManagerService();
export default managerService; 