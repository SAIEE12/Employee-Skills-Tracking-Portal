import { Domain, Skill, UserWithSkills, UserCreateData, UserFilter, StatsData } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class AdminService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Domain operations
  async getDomains(): Promise<Domain[]> {
    return this.request<Domain[]>('/admin/domains');
  }

  // Skill operations
  async getSkills(domainId?: string): Promise<Skill[]> {
    const params = domainId ? `?domain_id=${domainId}` : '';
    return this.request<Skill[]>(`/admin/skills${params}`);
  }

  // User operations
  async getUsers(filters?: UserFilter): Promise<UserWithSkills[]> {
    const params = new URLSearchParams();
    
    if (filters?.domain_id) params.append('domain_id', filters.domain_id);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.skill_ids?.length) {
      filters.skill_ids.forEach(id => params.append('skill_ids', id));
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';
    
    return this.request<UserWithSkills[]>(endpoint);
  }

  async createUser(userData: UserCreateData): Promise<UserWithSkills> {
    return this.request<UserWithSkills>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Statistics
  async getStats(): Promise<StatsData> {
    return this.request<StatsData>('/admin/stats');
  }
}

export const adminService = new AdminService();
export default adminService; 