import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, SortAsc, SortDesc } from 'lucide-react';
import { UserRole } from '@/services/api/types';

export interface FilterState {
  search: string;
  role: UserRole | 'all' | '';
  department: string;
  experienceMin: number;
  experienceMax: number;
  sortBy: 'name' | 'email' | 'experience' | 'department';
  sortOrder: 'asc' | 'desc';
}

interface UserFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  departments: string[];
}

export function UserFilters({ filters, onFiltersChange, departments }: UserFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      role: 'all',
      department: '',
      experienceMin: 0,
      experienceMax: 50,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };


  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.role) count++;
    if (filters.department) count++;
    if (filters.experienceMin > 0 || filters.experienceMax < 50) count++;
    return count;
  };

  const toggleSort = (field: FilterState['sortBy']) => {
    if (filters.sortBy === field) {
      updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      updateFilter('sortBy', field);
      updateFilter('sortOrder', 'asc');
    }
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Sorting
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Less' : 'More'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search users by name or email..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Sort Buttons */}
        <div className="flex flex-wrap gap-2">
          {(['name', 'email', 'experience', 'department'] as const).map((field) => (
            <Button
              key={field}
              variant={filters.sortBy === field ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleSort(field)}
              className="capitalize"
            >
              {field}
              {filters.sortBy === field && (
                filters.sortOrder === 'asc' ? 
                  <SortAsc className="h-3 w-3 ml-1" /> : 
                  <SortDesc className="h-3 w-3 ml-1" />
              )}
            </Button>
          ))}
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            {/* Role Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <Select value={filters.role} onValueChange={(value) => updateFilter('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="trainer">Trainer</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="super-user">Super User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Department</label>
              <Select value={filters.department} onValueChange={(value) => updateFilter('department', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Experience Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Experience (years)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.experienceMin || ''}
                  onChange={(e) => updateFilter('experienceMin', parseInt(e.target.value) || 0)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.experienceMax === 50 ? '' : filters.experienceMax}
                  onChange={(e) => updateFilter('experienceMax', parseInt(e.target.value) || 50)}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}