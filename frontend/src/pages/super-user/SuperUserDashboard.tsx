import { useState, useMemo,useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Edit, Trash2, Users, Settings, Shield } from 'lucide-react';
import { User, UserRole } from '@/services/api/types';
import { useToast } from '@/hooks/use-toast';
import { UserFilters, FilterState } from '@/components/filters/UserFilters';
import { employeeService } from '@/services/api/employeeService';

//  Mock data (for development)
// const mockUsers: User[] = [
//   { id: '1', email: 'john@company.com', name: 'John Smith', role: 'employee', department: 'Engineering', experience: 3 },
//   { id: '2', email: 'sarah@company.com', name: 'Sarah Johnson', role: 'trainer', department: 'Training', experience: 8 },
// ];

export default function SuperUserDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({});
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    role: 'all',
    department: '',
    experienceMin: 0,
    experienceMax: 50,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  
  const { toast } = useToast();

  //  Fetch users from DB
  const fetchUsers = async () => {
    try {
      const allUsers = await employeeService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      toast({
        title: 'Error loading users',
        description: 'Failed to fetch users from database',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const departments = useMemo(
    () =>
      Array.from(new Set(users.map((user) => user.department).filter(Boolean))),
    [users]
  );

const filteredUsers = useMemo(() => {
  let filtered = users.filter((user) => {
    const matchesSearch =
      !filters.search ||
      [user.name, user.email]
        .filter(Boolean)
        .some(field =>
          field.toLowerCase().includes(filters.search.toLowerCase())
        );

    const matchesRole =
      !filters.role ||
      filters.role === 'all' ||
      user.role?.toLowerCase() === filters.role.toLowerCase();

    const matchesDept =
      !filters.department ||
      user.department?.trim().toLowerCase() === filters.department.trim().toLowerCase();

    const matchesExp =
      Number(user.experience) >= filters.experienceMin &&
      Number(user.experience) <= filters.experienceMax;

    return matchesSearch && matchesRole && matchesDept && matchesExp;
  });

    // ✅ Fix: handle null/undefined for email, department, experience
    filtered.sort((a, b) => {
      let aVal: any = a[filters.sortBy] ?? '';
      let bVal: any = b[filters.sortBy] ?? '';

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      return filters.sortOrder === 'asc'
        ? aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        : aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    });


  return filtered;
}, [users, filters]);



  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'employee': return 'default';
      case 'trainer': return 'secondary';
      case 'manager': return 'destructive';
      default: return 'outline';
    }
  };

  //  Add user to DB
  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.password) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await employeeService.createEmployee(newUser as any);
      await fetchUsers(); // refresh from DB
      setNewUser({});
      setIsAddUserOpen(false);
      toast({ title: 'User created successfully' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add user to the database.',
        variant: 'destructive',
      });
    }
  };

//  Update user in DB
const handleEditUser = async () => {
  if (!editingUser) return;

  try {
    const updated = await employeeService.updateEmployee(editingUser);
    
    if (!updated) {
      throw new Error('Update failed');
    }

    await fetchUsers(); // refresh user list
    setEditingUser(null);
    toast({ title: 'User updated successfully' });
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to update user in the database.',
      variant: 'destructive',
    });
  }
};


  //  Delete user from DB
  const handleDeleteUser = async (userId: string) => {
    try {
      await employeeService.deleteEmployee(userId);
      await fetchUsers();
      toast({ title: 'User deleted' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user.',
        variant: 'destructive',
      });
    }
  };

    const userStats = {
      total: users.length,
      employees: users.filter((u) => u.role === 'employee').length,
      trainers: users.filter((u) => u.role === 'trainer').length,
      managers: users.filter((u) => u.role === 'manager').length,
    };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Super User Dashboard</h1>
        <p className="text-muted-foreground">Manage users and system configuration</p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            System Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* User Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employees</CardTitle>
                <Badge variant="default">{userStats.employees}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.employees}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trainers</CardTitle>
                <Badge variant="secondary">{userStats.trainers}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.trainers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Managers</CardTitle>
                <Badge variant="destructive">{userStats.managers}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats.managers}</div>
              </CardContent>
            </Card>
          </div>

          {/* User Filters */}
          <UserFilters
            filters={filters}
            onFiltersChange={setFilters}
            departments={departments}
          />

          {/* User Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Add, edit, or remove users from the system</CardDescription>
                </div>
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                      <DialogDescription>Create a new user account with the specified role</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input
                          id="name"
                          value={newUser.name || ''}
                          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email || ''}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right">Role</Label>
                        <Select onValueChange={(value: UserRole) => setNewUser({ ...newUser, role: value })}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Employee</SelectItem>
                            <SelectItem value="trainer">Trainer</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="department" className="text-right">Department</Label>
                        <Input
                          id="department"
                          value={newUser.department || ''}
                          onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="experience" className="text-right">Experience</Label>
                        <Input
                          id="experience"
                          type="number"
                          value={newUser.experience || ''}
                          onChange={(e) => setNewUser({ ...newUser, experience: parseInt(e.target.value) || 0 })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter initial password"
                          value={newUser.password || ''}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddUser}>Add User</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>{user.experience} years</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => !open && setEditingUser(null)}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                                <DialogDescription>Update user information</DialogDescription>
                              </DialogHeader>
                              {editingUser && (
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-name" className="text-right">Name</Label>
                                    <Input
                                      id="edit-name"
                                      value={editingUser.name}
                                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                      className="col-span-3"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-email" className="text-right">Email</Label>
                                    <Input
                                      id="edit-email"
                                      type="email"
                                      value={editingUser.email}
                                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                      className="col-span-3"
                                    />
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-role" className="text-right">Role</Label>
                                    <Select 
                                      value={editingUser.role}
                                      onValueChange={(value: UserRole) => setEditingUser({ ...editingUser, role: value })}
                                    >
                                      <SelectTrigger className="col-span-3">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="employee">Employee</SelectItem>
                                        <SelectItem value="trainer">Trainer</SelectItem>
                                        <SelectItem value="manager">Manager</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="edit-department" className="text-right">Department</Label>
                                    <Input
                                      id="edit-department"
                                      value={editingUser.department || ''}
                                      onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                                      className="col-span-3"
                                    />
                                  </div>
                                </div>
                              )}
                              <DialogFooter>
                                <Button onClick={handleEditUser}>Update User</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>Manage global system settings and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>System settings configuration coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}