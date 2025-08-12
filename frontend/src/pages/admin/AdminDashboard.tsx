import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, Settings, BarChart3 } from 'lucide-react';
import { AdminFilterBar } from '@/components/AdminFilterBar';
import { AddUserModal } from '@/components/AddUserModal';
import { StatsCards } from '@/components/StatsCards';
import { UserTable } from '@/components/UserTable';
import { UserFilter, UserWithSkills, StatsData } from '@/services/api/types';
import adminService from '@/services/api/adminService';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserWithSkills[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [filters, setFilters] = useState<UserFilter>({});
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    loadStats();
    loadUsers();
  }, []);

  // Load users when filters change
  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const statsData = await adminService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive"
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await adminService.getUsers(filters);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: UserFilter) => {
    setFilters(newFilters);
  };

  const handleUserCreated = () => {
    // Refresh data after user creation
    loadUsers();
    loadStats();
  };

  const handleRefresh = () => {
    loadUsers();
    loadStats();
  };

  const handleViewUser = (user: UserWithSkills) => {
    // TODO: Implement user detail view
    console.log('View user:', user);
    toast({
      title: "User Details",
      description: `Viewing details for ${user.name}`,
    });
  };

  const handleEditUser = (user: UserWithSkills) => {
    // TODO: Implement user editing
    console.log('Edit user:', user);
    toast({
      title: "Edit User",
      description: `Editing ${user.name}`,
    });
  };

  const handleDeleteUser = async (userId: string) => {
    // TODO: Implement user deletion with confirmation
    console.log('Delete user:', userId);
    toast({
      title: "Delete User",
      description: "User deletion not yet implemented",
      variant: "destructive"
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, skills, and system statistics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Admin Access</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || statsLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading || statsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && <StatsCards stats={stats} />}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1">
          <AdminFilterBar onFiltersChange={handleFiltersChange} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Actions Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {users.length} users found
                    </span>
                  </div>
                  {filters.domain_id && (
                    <Badge variant="secondary">
                      Domain filtered
                    </Badge>
                  )}
                  {filters.skill_ids && filters.skill_ids.length > 0 && (
                    <Badge variant="secondary">
                      {filters.skill_ids.length} skills selected
                    </Badge>
                  )}
                </div>
                <AddUserModal onUserCreated={handleUserCreated} />
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <UserTable
            users={users}
            onViewUser={handleViewUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />

          {/* Loading State */}
          {loading && (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Loading users...</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Export Data
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Bulk Operations
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              System Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 