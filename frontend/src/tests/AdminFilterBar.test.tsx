import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminFilterBar } from '@/components/AdminFilterBar';
import adminService from '@/services/api/adminService';

// Mock the admin service
vi.mock('@/services/api/adminService');
const mockAdminService = vi.mocked(adminService);

// Mock data
const mockDomains = [
  { id: '1', name: 'Embedded', description: 'Embedded systems' },
  { id: '2', name: 'IT', description: 'Information Technology' },
  { id: '3', name: 'AI', description: 'Artificial Intelligence' }
];

const mockSkills = [
  { id: '1', name: 'C Programming', category: 'Programming', description: 'C programming', domain_id: '1' },
  { id: '2', name: 'RTOS', category: 'OS', description: 'Real-time OS', domain_id: '1' },
  { id: '3', name: 'Machine Learning', category: 'AI', description: 'ML algorithms', domain_id: '3' }
];

describe('AdminFilterBar', () => {
  const mockOnFiltersChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAdminService.getDomains.mockResolvedValue(mockDomains);
    mockAdminService.getSkills.mockResolvedValue(mockSkills);
  });

  it('renders filter bar with title', () => {
    render(<AdminFilterBar onFiltersChange={mockOnFiltersChange} />);
    
    expect(screen.getByText('Filter Users')).toBeInTheDocument();
    expect(screen.getByText('Domain')).toBeInTheDocument();
  });

  it('loads and displays domains on mount', async () => {
    render(<AdminFilterBar onFiltersChange={mockOnFiltersChange} />);
    
    await waitFor(() => {
      expect(mockAdminService.getDomains).toHaveBeenCalledTimes(1);
    });
    
    expect(screen.getByText('All Domains')).toBeInTheDocument();
    expect(screen.getByText('Embedded')).toBeInTheDocument();
    expect(screen.getByText('IT')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('shows skills when domain is selected', async () => {
    render(<AdminFilterBar onFiltersChange={mockOnFiltersChange} />);
    
    // Wait for domains to load
    await waitFor(() => {
      expect(screen.getByText('Embedded')).toBeInTheDocument();
    });
    
    // Select a domain
    const domainSelect = screen.getByRole('combobox');
    fireEvent.click(domainSelect);
    
    const embeddedOption = screen.getByText('Embedded');
    fireEvent.click(embeddedOption);
    
    // Wait for skills to load
    await waitFor(() => {
      expect(mockAdminService.getSkills).toHaveBeenCalledWith('1');
    });
    
    // Check if skills are displayed
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('C Programming')).toBeInTheDocument();
    expect(screen.getByText('RTOS')).toBeInTheDocument();
  });

  it('allows selecting and deselecting skills', async () => {
    render(<AdminFilterBar onFiltersChange={mockOnFiltersChange} />);
    
    // Wait for domains to load and select a domain
    await waitFor(() => {
      expect(screen.getByText('Embedded')).toBeInTheDocument();
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

  it('calls onFiltersChange when domain is selected', async () => {
    render(<AdminFilterBar onFiltersChange={mockOnFiltersChange} />);
    
    // Wait for domains to load
    await waitFor(() => {
      expect(screen.getByText('Embedded')).toBeInTheDocument();
    });
    
    // Select a domain
    const domainSelect = screen.getByRole('combobox');
    fireEvent.click(domainSelect);
    fireEvent.click(screen.getByText('Embedded'));
    
    // Check if onFiltersChange was called with domain filter
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        domain_id: '1',
        skill_ids: []
      });
    });
  });

  it('calls onFiltersChange when skills are selected', async () => {
    render(<AdminFilterBar onFiltersChange={mockOnFiltersChange} />);
    
    // Wait for domains to load and select a domain
    await waitFor(() => {
      expect(screen.getByText('Embedded')).toBeInTheDocument();
    });
    
    const domainSelect = screen.getByRole('combobox');
    fireEvent.click(domainSelect);
    fireEvent.click(screen.getByText('Embedded'));
    
    // Wait for skills to load
    await waitFor(() => {
      expect(screen.getByText('C Programming')).toBeInTheDocument();
    });
    
    // Select a skill
    fireEvent.click(screen.getByText('C Programming'));
    
    // Check if onFiltersChange was called with skill filter
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        domain_id: '1',
        skill_ids: ['1']
      });
    });
  });

  it('shows clear filters button when filters are active', async () => {
    render(<AdminFilterBar onFiltersChange={mockOnFiltersChange} />);
    
    // Wait for domains to load and select a domain
    await waitFor(() => {
      expect(screen.getByText('Embedded')).toBeInTheDocument();
    });
    
    const domainSelect = screen.getByRole('combobox');
    fireEvent.click(domainSelect);
    fireEvent.click(screen.getByText('Embedded'));
    
    // Check if clear filters button appears
    await waitFor(() => {
      expect(screen.getByText('Clear All Filters')).toBeInTheDocument();
    });
  });

  it('clears all filters when clear button is clicked', async () => {
    render(<AdminFilterBar onFiltersChange={mockOnFiltersChange} />);
    
    // Wait for domains to load and select a domain
    await waitFor(() => {
      expect(screen.getByText('Embedded')).toBeInTheDocument();
    });
    
    const domainSelect = screen.getByRole('combobox');
    fireEvent.click(domainSelect);
    fireEvent.click(screen.getByText('Embedded'));
    
    // Wait for skills to load and select a skill
    await waitFor(() => {
      expect(screen.getByText('C Programming')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('C Programming'));
    
    // Click clear filters button
    const clearButton = screen.getByText('Clear All Filters');
    fireEvent.click(clearButton);
    
    // Check if onFiltersChange was called with empty filters
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith({});
    });
  });

  it('handles API errors gracefully', async () => {
    // Mock API error
    mockAdminService.getDomains.mockRejectedValue(new Error('API Error'));
    
    render(<AdminFilterBar onFiltersChange={mockOnFiltersChange} />);
    
    // Should still render the component
    expect(screen.getByText('Filter Users')).toBeInTheDocument();
    
    // Check if error is logged (we can't easily test console.error in tests)
    await waitFor(() => {
      expect(mockAdminService.getDomains).toHaveBeenCalled();
    });
  });

  it('applies custom className', () => {
    const customClass = 'custom-filter-bar';
    render(
      <AdminFilterBar 
        onFiltersChange={mockOnFiltersChange} 
        className={customClass}
      />
    );
    
    const filterBar = screen.getByText('Filter Users').closest('.custom-filter-bar');
    expect(filterBar).toBeInTheDocument();
  });
}); 