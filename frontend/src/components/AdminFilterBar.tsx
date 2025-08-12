import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';
import { Domain, Skill, UserFilter } from '@/services/api/types';
import adminService from '@/services/api/adminService';

interface AdminFilterBarProps {
  onFiltersChange: (filters: UserFilter) => void;
  className?: string;
}

export const AdminFilterBar: React.FC<AdminFilterBarProps> = ({ 
  onFiltersChange, 
  className = '' 
}) => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load domains on component mount
  useEffect(() => {
    loadDomains();
  }, []);

  // Load skills when domain changes
  useEffect(() => {
    if (selectedDomain) {
      loadSkills(selectedDomain);
    } else {
      setSkills([]);
    }
  }, [selectedDomain]);

  // Apply filters when selections change
  useEffect(() => {
    const filters: UserFilter = {};
    
    if (selectedDomain) {
      filters.domain_id = selectedDomain;
    }
    
    if (selectedSkills.length > 0) {
      filters.skill_ids = selectedSkills;
    }
    
    onFiltersChange(filters);
  }, [selectedDomain, selectedSkills, onFiltersChange]);

  const loadDomains = async () => {
    try {
      setLoading(true);
      const domainsData = await adminService.getDomains();
      setDomains(domainsData);
    } catch (error) {
      console.error('Failed to load domains:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSkills = async (domainId: string) => {
    try {
      setLoading(true);
      const skillsData = await adminService.getSkills(domainId);
      setSkills(skillsData);
    } catch (error) {
      console.error('Failed to load skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDomainChange = (domainId: string) => {
    setSelectedDomain(domainId);
    setSelectedSkills([]); // Clear skills when domain changes
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  const clearFilters = () => {
    setSelectedDomain('');
    setSelectedSkills([]);
  };

  const hasActiveFilters = selectedDomain || selectedSkills.length > 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter Users
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Domain Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Domain</label>
          <Select value={selectedDomain} onValueChange={handleDomainChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Domains</SelectItem>
              {domains.map((domain) => (
                <SelectItem key={domain.id} value={domain.id}>
                  {domain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Skills Selection */}
        {selectedDomain && skills.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Skills</label>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge
                  key={skill.id}
                  variant={selectedSkills.includes(skill.id) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${
                    selectedSkills.includes(skill.id)
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'hover:bg-secondary'
                  }`}
                  onClick={() => toggleSkill(skill.id)}
                >
                  {skill.name}
                  {selectedSkills.includes(skill.id) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="w-full"
          >
            Clear All Filters
          </Button>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center text-sm text-muted-foreground">
            Loading...
          </div>
        )}
 