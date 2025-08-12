import { USE_MOCK_DATA, API_BASE_URL } from '@/config';
import { User, Employee, ApiResponse } from './types';
import { authService } from './authService';

class EmployeeService {
  private getAuthHeaders(): Record<string, string> {
    const token = authService.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getEmployees(): Promise<User[]> {
    if (USE_MOCK_DATA) {
      return this.getMockEmployees();
    }
    try {
      const response = await fetch(`${API_BASE_URL}/employees`, {
        headers: this.getAuthHeaders(),
      });
      return response.ok ? await response.json() : [];
    } catch (error) {
      console.error('Get employees error:', error);
      return [];
    }
  }

  async getEmployee(id: string): Promise<Employee | null> {
    if (USE_MOCK_DATA) {
      return this.getMockEmployee(id);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error('Get employee error:', error);
      return null;
    }
  }

  async createEmployee(employee: Partial<User> & { password: string }): Promise<User | null> {
    if (USE_MOCK_DATA) {
      return this.mockCreateEmployee(employee);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: { ...this.getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(employee),
      });
      return response.ok ? await response.json() : null;
    } catch (error) {
      console.error('Create employee error:', error);
      return null;
    }
  }

async updateEmployee(employee: User): Promise<User | null> {
  if (USE_MOCK_DATA) {
    return this.mockUpdateEmployee(employee);
  }

  try {
    const { id, ...payload } = employee; // 🛠️ Remove ID from body
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`Failed to update employee ${id}:`, response.statusText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Update employee error:', error);
    return null;
  }
}

  async deleteEmployee(id: string): Promise<boolean> {
    if (USE_MOCK_DATA) {
      return this.mockDeleteEmployee(id);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      return response.ok;
    } catch (error) {
      console.error('Delete employee error:', error);
      return false;
    }
  }

   async getAllUsers(): Promise<User[]> {
    try {
      const [employees, trainers] = await Promise.all([
        fetch(`${API_BASE_URL}/employees`, { headers: this.getAuthHeaders() }).then(res => res.json()),
        fetch(`${API_BASE_URL}/trainers`, { headers: this.getAuthHeaders() }).then(res => res.json()),
        // fetch(`${API_BASE_URL}/managers`, { headers: this.getAuthHeaders() }).then(res => res.json()),
      ]);
      return [...employees, ...trainers];
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  }

  // Mock implementations
  private getMockEmployees(): User[] {
    return [
      {
        id: '1',
        email: 'john.employee@company.com',
        name: 'John Smith',
        role: 'employee',
        department: 'Engineering',
        experience: 3,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: '2',
        email: 'sarah.trainer@company.com',
        name: 'Sarah Johnson',
        role: 'trainer',
        department: 'Training',
        experience: 8,
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: '3',
        email: 'mike.manager@company.com',
        name: 'Mike Wilson',
        role: 'manager',
        department: 'Management',
        experience: 12,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      },
      {
        id: '4',
        email: 'admin@company.com',
        name: 'System Administrator',
        role: 'super-user',
        department: 'IT Administration',
        experience: 15,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      }
    ];
  }

  private async getMockEmployee(id: string): Promise<Employee | null> {
    const employees = this.getMockEmployees();
    const user = employees.find(e => e.id === id);
    
    if (user && user.role === 'employee') {
      return {
        ...user,
        role: 'employee',
        skillLevel: 'Intermediate',
        interviewReadiness: 'in-progress',
        scores: [],
        notifications: []
      };
    }
    return null;
  }

  private async mockCreateEmployee(employeeData: Partial<User> & { password: string }): Promise<User> {
    return {
      id: Date.now().toString(),
      name: employeeData.name!,
      email: employeeData.email!,
      role: employeeData.role as any,
      department: employeeData.department || '',
      experience: employeeData.experience || 0,
    };
  }

  private async mockUpdateEmployee(employee: User): Promise<User> {
    return employee;
  }

  private async mockDeleteEmployee(id: string): Promise<boolean> {
    return true;
  }
}

export const employeeService = new EmployeeService();
export default employeeService;