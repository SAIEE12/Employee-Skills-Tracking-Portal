import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import ManagersPage from '@/pages/manager/ManagersPage';

vi.mock('@/hooks/useManagers', () => ({
  useManagers: () => ({
    managers: [
      { id: '1', email: 'a@a.com', name: 'Alice', role: 'manager', department: 'Ops', experience: 3 },
      { id: '2', email: 'b@b.com', name: 'Bob', role: 'manager', department: 'IT', experience: 5 },
    ],
    loading: false,
    createManager: vi.fn(),
    updateManager: vi.fn(),
    deleteManager: vi.fn(),
  })
}));

// Mock toast
vi.mock('@/components/ui/use-toast', () => ({ toast: vi.fn(), useToast: () => ({}) }));

describe('ManagersPage', () => {
  it('renders managers table', async () => {
    render(<ManagersPage />);

    //expect(await screen.findByRole('heading', { name: /Managers/i })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 1, name: /Managers/i })).toBeInTheDocument();

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('opens create dialog', async () => {
    render(<ManagersPage />);
    fireEvent.click(screen.getByRole('button', { name: /Add Manager/i }));
    // There are two occurrences of the phrase in DialogTitle and submit button; assert dialog heading specifically
    expect(await screen.findByRole('heading', { name: /Create Manager/i })).toBeInTheDocument();
  });
}); 