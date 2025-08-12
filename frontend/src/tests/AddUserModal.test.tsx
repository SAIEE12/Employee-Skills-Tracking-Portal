import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AddUserModal } from '@/components/AddUserModal';
import adminService from '@/services/api/adminService';

// Mock the admin service
vi.mock('@/services/api/adminService');
const mockAdminService = vi.mocked(adminService);

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock data
const mockDomains = [
  { id: '1', name: 'Embedded', description: 'Embedded systems' },
  { id: '2', name: 'IT', description: 'Information Technology' }
];

const mockSkills = [
  { id: '1', name: 'C Programming', category: 'Programming', description: 'C programming', domain_id: '1' },
  { id: '2', name: 'RTOS', category: 'OS', description: 'Real-time OS', domain_id: '1' }
];

describe('AddUserModal', () => {
  const mockOnUserCreated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminService.getDomains.mockResolvedValue(mockDomains);
    mockAdminService.getSkills.mockResolvedValue(mockSkills);
    mockAdminService.createUser.mockResolvedValue({
      id: 'new-user-id',
      email: 'newuser@test.com',
      name: 'New User',
      role: 'employee',
      domain_id: '1',
      skills: []
    });
  });

  it('renders add user button', () => {
    render(<AddUserModal onUserCreated={mockOnUserCreated} />);
    
    expect(screen.getByText('Add User')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('opens modal when button is clicked', () => {
    render(<AddUserModal onUserCreated={mockOnUserCreated} />);
    
    const addButton = screen.getByText('Add User');
    fireEvent.click(addButton);
    
    expect(screen.getByText('Add New User')).toBeInTheDocument();
    expect(screen.getByText('Full Name *')).toBeInTheDocument();
    expect(screen.getByText('Email *')).toBeInTheDocument();
  });

  it('loads domains when modal opens', async () => {
    render(<AddUserModal onUserCreated={mockOnUserCreated} />);
    
    const addButton = screen.getByText('Add User');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(mockAdminService.getDomains).toHaveBeenCalledTimes(1);
    });
  });

  it('shows domain selection dropdown', async () => {
    render(<AddUserModal onUserCreated={mockOnUserCreated} />);
    
    const addButton = screen.getByText('Add User');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText('Domain *')).toBeInTheDocument();
    });
    
    const domainSelect = screen.getByRole('combobox');
    fireEvent.click(domainSelect);
    
    expect(screen.getByText('Embedded')).toBeInTheDocument();
    expect(screen.getByText('IT')).toBeInTheDocument();
  });

  it('loads skills when domain is selected', async () => {
    render(<AddUserModal onUserCreated={mockOnUserCreated} />);
    
    const addButton = screen.getByText('Add User');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText('Domain *')).toBeInTheDocument();
    });
    
    // Select a domain
    const domainSelect = screen.getByRole('combobox');
    fireEvent.click(domainSelect);
    fireEvent.click(screen.getByText('Embedded'));
    
    await waitFor(() => {
      expect(mockAdminService.getSkills).toHaveBeenCalledWith('1');
    });
    
    // Check if skills are displayed
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('C Programming')).toBeInTheDocument();
    expect(screen.getByText('RTOS')).toBeInTheDocument();
  });

  it('allows selecting and deselecting skills', async () => {
    render(<AddUserModal onUserCreated={mockOnUserCreated} />);
    
    const addButton = screen.getByText('Add User');
    fireEvent.click(addButton);
    
    // Select a domain
    await waitFor(() => {
      expect(screen.getByText('Domain *')).toBeInTheDocument();
    });
    
    const domainSelect = screen.getByRole('combobox');
    fireEvent.click(domainSelect);
    fireEvent.click(screen.getByText('Embedded'));
    
    // Wait for skills to load
    await waitFor(() => {
      expect(screen.getByText('C Programming')).toBeInTheDocument();
    });
    
    // Select a skill
    const cProgrammingSkill = screen.getByText('C Programming');
    fireEvent.click(cProgrammingSkill);
    
    // Check if skill is selected (should have X icon)
    expect(screen.getByText('×')).toBeInTheDocument();
    
    // Deselect the skill
    fireEvent.click(cProgrammingSkill);
    
    // Check if skill is deselected (should not have X icon)
    expect(screen.queryByText('×')).not.toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    render(<AddUserModal onUserCreated={mockOnUserCreated} />);
    
    const addButton = screen.getByText('Add User');
    fireEvent.click(addButton);
    
    // Try to submit without filling required fields
    const submitButton = screen.getByText('Create User');
    fireEvent.click(submitButton);
    
    // Should not call the API
    expect(mockAdminService.createUser).not.toHaveBeenCalled();
  });

  it('submits form with correct data', async () => {
    render(<AddUserModal onUserCreated={mockOnUserCreated} />);
    
    const addButton = screen.getByText('Add User');
    fireEvent.click(addButton);
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Full Name *'), {
      target: { value: 'John Doe' }
    });
    
    fireEvent.change(screen.getByLabelText('Email *'), {
      target: { value: 'john@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Password *'), {
      target: { value: 'password123' }
    });
    
    // Select domain
    const domainSelect = screen.getByRole('combobox');
    fireEvent.click(domainSelect);
    fireEvent.click(screen.getByText('Embedded'));
    
    // Wait for skills to load and select a skill
    await waitFor(() => {
      expect(screen.getByText('C Programming')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('C Programming'));
    
    // Submit form
    const submitButton = screen.getByText('Create User');
    fireEvent.click(submitButton);
    
    // Check if API was called with correct data
    await waitFor(() => {
      expect(mockAdminService.createUser).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'employee',
        department: '',
        experience: undefined,
        domain_id: '1',
        skill_ids: ['1']
      });
    });
  });

  it('calls onUserCreated after successful submission', async () => {
    render(<AddUserModal onUserCreated={mockOnUserCreated} />);
    
    const addButton = screen.getByText('Add User');
    fireEvent.click(addButton);
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Full Name *'), {
      target: { value: 'John Doe' }
    });
    
    fireEvent.change(screen.getByLabelText('Email *'), {
      target: { value: 'john@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Password *'), {
      target: { value: 'password123' }
    });
    
    // Select domain
    const domainSelect = screen.getByRole('combobox');
    fireEvent.click(domainSelect);
    fireEvent.click(screen.getByText('Embedded'));
    
    // Submit form
    const submitButton = screen.getByText('Create User');
    fireEvent.click(submitButton);
    
    // Check if onUserCreated was called
    await waitFor(() => {
      expect(mockOnUserCreated).toHaveBeenCalledTimes(1);
    });
  });

  it('resets form after successful submission', async () => {
    render(<AddUserModal onUserCreated={mockOnUserCreated} />);
    
    const addButton = screen.getByText('Add User');
    fireEvent.click(addButton);
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Full Name *'), {
      target: { value: 'John Doe' }
    });
    
    fireEvent.change(screen.getByLabelText('Email *'), {
      target: { value: 'john@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Password *'), {
      target: { value: 'password123' }
    });
    
    // Select domain
    const domainSelect = screen.getByRole('combobox');
    fireEvent.click(domainSelect);
    fireEvent.click(screen.getByText('Embedded'));
    
    // Submit form
    const submitButton = screen.getByText('Create User');
    fireEvent.click(submitButton);
    
    // Check if form was reset
    await waitFor(() => {
      expect(screen.getByLabelText('Full Name *')).toHaveValue('');
      expect(screen.getByLabelText('Email *')).toHaveValue('');
      expect(screen.getByLabelText('Password *')).toHaveValue('');
    });
  });

  it('resets form when reset button is clicked', async () => {
    render(<AddUserModal onUserCreated={mockOnUserCreated} />);
    
    const addButton = screen.getByText('Add User');
    fireEvent.click(addButton);
    
    // Fill in some fields
    fireEvent.change(screen.getByLabelText('Full Name *'), {
      target: { value: 'John Doe' }
    });
    
    fireEvent.change(screen.getByLabelText('Email *'), {
      target: { value: 'john@example.com' }
    });
    
    // Click reset button
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    // Check if form was reset
    expect(screen.getByLabelText('Full Name *')).toHaveValue('');
    expect(screen.getByLabelText('Email *')).toHaveValue('');
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    mockAdminService.createUser.mockRejectedValue(new Error('API Error'));
    
    render(<AddUserModal onUserCreated={mockOnUserCreated} />);
    
    const addButton = screen.getByText('Add User');
    fireEvent.click(addButton);
    
    // Fill in required fields
    fireEvent.change(screen.getByLabelText('Full Name *'), {
      target: { value: 'John Doe' }
    });
    
    fireEvent.change(screen.getByLabelText('Email *'), {
      target: { value: 'john@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText('Password *'), {
      target: { value: 'password123' }
    });
    
    // Select domain
    const domainSelect = screen.getByRole('combobox');
    fireEvent.click(domainSelect);
    fireEvent.click(screen.getByText('Embedded'));
    
    // Submit form
    const submitButton = screen.getByText('Create User');
    fireEvent.click(submitButton);
    
    // Should not call onUserCreated
    expect(mockOnUserCreated).not.toHaveBeenCalled();
  });

  it('allows changing user role', async () => {
    render(<AddUserModal onUserCreated={mockOnUserCreated} />);
    
    const addButton = screen.getByText('Add User');
    fireEvent.click(addButton);
    
    // Check if role dropdown is present
    expect(screen.getByText('Role *')).toBeInTheDocument();
    
    const roleSelect = screen.getByDisplayValue('employee');
    fireEvent.click(roleSelect);
    
    // Check if role options are available
    expect(screen.getByText('Employee')).toBeInTheDocument();
    expect(screen.getByText('Trainer')).toBeInTheDocument();
    expect(screen.getByText('Manager')).toBeInTheDocument();
    expect(screen.getByText('Super User')).toBeInTheDocument();
  });
}); 