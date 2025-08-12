import { useMemo, useState } from 'react';
import { useManagers } from '@/hooks/useManagers';
import { User } from '@/services/api/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { UserFilters, FilterState } from '@/components/filters/UserFilters';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getUserInitials } from '@/utils/auth';
import { Edit, Plus, Trash2 } from 'lucide-react';

export default function ManagersPage() {
  const { managers, loading, createManager, updateManager, deleteManager } = useManagers();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    role: 'manager',
    department: '',
    experienceMin: 0,
    experienceMax: 50,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<Partial<User> & { password?: string }>({ role: 'manager' as any });

  const departments = useMemo(
    () => [...new Set(managers.map(m => m.department).filter(Boolean) as string[])],
    [managers]
  );

  const filtered = useMemo(() => {
    const list = managers.filter(m => m.role === 'manager');
    const searched = list.filter(m =>
      !filters.search ||
      m.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      m.email.toLowerCase().includes(filters.search.toLowerCase())
    );
    const byDept = searched.filter(m => !filters.department || m.department === filters.department);
    const byExp = byDept.filter(m => (m.experience || 0) >= filters.experienceMin && (m.experience || 0) <= filters.experienceMax);

    const sorted = [...byExp].sort((a, b) => {
      let aValue: any, bValue: any;
      switch (filters.sortBy) {
        case 'name': aValue = a.name; bValue = b.name; break;
        case 'email': aValue = a.email; bValue = b.email; break;
        case 'experience': aValue = a.experience || 0; bValue = b.experience || 0; break;
        case 'department': aValue = a.department || ''; bValue = b.department || ''; break;
        default: return 0;
      }
      if (typeof aValue === 'string') { aValue = aValue.toLowerCase(); bValue = bValue.toLowerCase(); }
      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [managers, filters]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', email: '', password: '', department: '', experience: 0 });
    setIsOpen(true);
  };

  const openEdit = (manager: User) => {
    setEditing(manager);
    setForm({ id: manager.id, name: manager.name, email: manager.email, department: manager.department, experience: manager.experience, avatar: manager.avatar });
    setIsOpen(true);
  };

  const onSubmit = async () => {
    if (!form.name || !form.email || (!editing && !form.password)) {
      toast({ title: 'Validation error', description: 'Name, email and password (for create) are required.' });
      return;
    }

    if (editing) {
      const ok = await updateManager({ ...(editing as User), ...form } as User);
      if (ok) {
        toast({ title: 'Manager updated' });
        setIsOpen(false);
      } else {
        toast({ title: 'Update failed', description: 'Could not update manager', });
      }
    } else {
      const ok = await createManager(form as Partial<User> & { password: string });
      if (ok) {
        toast({ title: 'Manager created' });
        setIsOpen(false);
      } else {
        toast({ title: 'Create failed', description: 'Could not create manager', });
      }
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this manager?')) return;
    const ok = await deleteManager(id);
    if (ok) toast({ title: 'Manager deleted' });
    else toast({ title: 'Delete failed', description: 'Could not delete manager' });
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Managers</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Manager
        </Button>
      </div>

      <UserFilters filters={filters} onFiltersChange={setFilters} departments={departments} />

      <Card>
        <CardHeader>
          <CardTitle>Managers List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={m.avatar} />
                        <AvatarFallback>{getUserInitials(m.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{m.name}</div>
                        <Badge variant="outline" className="text-xs">{m.role}</Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{m.email}</TableCell>
                  <TableCell>{m.department || '-'}</TableCell>
                  <TableCell>{m.experience ?? 0}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(m)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(m.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <div className="text-muted-foreground text-sm">No managers found.</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Manager' : 'Create Manager'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={form.name || ''} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email || ''} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>
            {!editing && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={form.password || ''} onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={form.department || ''} onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="experience">Experience</Label>
                <Input id="experience" type="number" value={form.experience ?? 0} onChange={(e) => setForm(f => ({ ...f, experience: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button onClick={onSubmit}>{editing ? 'Save Changes' : 'Create Manager'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 