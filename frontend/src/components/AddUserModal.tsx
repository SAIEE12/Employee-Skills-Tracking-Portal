import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, UserPlus } from 'lucide-react';
import { Domain, Skill, UserCreateData, UserRole } from '@/services/api/types';
import adminService from '@/services/api/adminService';
import { useToast } from '@/hooks/use-toast';

interface AddUserModalProps {
  onUserCreated: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ onUserCreated }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<Partial<UserCreateData>>({
    email: '',
    name: '',
    password: '',
    role: 'employee',
    department: '',
    experience: undefined,
    domain_id: '',
    skill_ids: []
  });

  const { toast } = useToast();

  // Load domains on component mount
  useEffect(() => {
    if (open) {
      loadDomains();
    }
  }, [open]);

  // Load skills when domain changes
  useEffect(() => {
    if (formData.domain_id) {
      loadSkills(formData.domain_id);
    } else {
      setSkills([]);
    }
  }, [formData.domain_id]);

  const loadDomains = async () => {
    try {
      const domainsData = await adminService.getDomains();
      setDomains(domainsData);
    } catch (error) {
      console.error('Failed to load domains:', error);
      toast({
        title: "Error",
        description: "Failed to load domains",
        variant: "destructive"
      });
    }
  };

  const loadSkills = async (domainId: string) => {
    try {
      const skillsData = await adminService.getSkills(domainId);
      setSkills(skillsData);
    } catch (error) {
      console.error('Failed to load skills:', error);
      toast({
        title: "Error",
        description: "Failed to load skills",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: keyof UserCreateData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleSkill = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      skill_ids: prev.skill_ids?.includes(skillId)
        ? prev.skill_ids.filter(id => id !== skillId)
        : [...(prev.skill_ids || []), skillId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.name || !formData.password || !formData.domain_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      await adminService.createUser(formData as UserCreateData);
      
      toast({
        title: "Success",
        description: "User created successfully"
      });
      
      // Reset form and close modal
      setFormData({
        email: '',
        name: '',
        password: '',
        role: 'employee',
        department: '',
        experience: undefined,
        domain_id: '',
        skill_ids: []
      });
      setOpen(false);
      onUserCreated();
      
    } catch (error) {
      console.error('Failed to create user:', error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      password: '',
      role: 'employee',
      department: '',
      experience: undefined,
      domain_id: '',
      skill_ids: []
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => handleInputChange('role', value as UserRole)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="trainer">Trainer</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="super-user">Super User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                placeholder="Enter department"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience">Experience (years)</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                value={formData.experience || ''}
                onChange={(e) => handleInputChange('experience', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Enter experience"
              />
            </div>
          </div>

          {/* Domain Selection */}
          <div className="space-y-2">
            <Label htmlFor="domain">Domain *</Label>
            <Select 
              value={formData.domain_id} 
              onValueChange={(value) => handleInputChange('domain_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a domain" />
              </SelectTrigger>
              <SelectContent>
                {domains.map((domain) => (
                  <SelectItem key={domain.id} value={domain.id}>
                    {domain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skills Selection */}
          {formData.domain_id && skills.length > 0 && (
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md">
                {skills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant={formData.skill_ids?.includes(skill.id) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      formData.skill_ids?.includes(skill.id)
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'hover:bg-secondary'
                    }`}
                    onClick={() => toggleSkill(skill.id)}
                  >
                    {skill.name}
                    {formData.skill_ids?.includes(skill.id) && (
                      <X className="ml-1 h-3 w-3" />
                    )}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Click on skills to select/deselect them
              </p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              disabled={loading}
            >
              Reset
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 