import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';
import { UserWithSkills } from '@/services/api/types';

interface UserTableProps {
  users: UserWithSkills[];
  onEditUser?: (user: UserWithSkills) => void;
  onDeleteUser?: (userId: string) => void;
  onViewUser?: (user: UserWithSkills) => void;
  className?: string;
}

export const UserTable: React.FC<UserTableProps> = ({ 
  users, 
  onEditUser, 
  onDeleteUser, 
  onViewUser,
  className = '' 
}) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super-user':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'manager':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'trainer':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'employee':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getDomainColor = (domainName: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800'
    ];
    
    const index = domainName.length % colors.length;
    return colors[index];
  };

  if (users.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">No users found matching the current filters.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Users ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        {user.experience && (
                          <div className="text-xs text-muted-foreground">
                            {user.experience} years exp.
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm">{user.email}</span>
                  </TableCell>
                  
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`capitalize ${getRoleColor(user.role)}`}
                    >
                      {user.role.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    {user.domain && (
                      <Badge 
                        variant="outline" 
                        className={getDomainColor(user.domain.name)}
                      >
                        {user.domain.name}
                      </Badge>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {user.department ? (
                      <span className="text-sm">{user.department}</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-48">
                      {user.skills.length > 0 ? (
                        user.skills.slice(0, 3).map((skill) => (
                          <Badge 
                            key={skill.id} 
                            variant="secondary" 
                            className="text-xs"
                          >
                            {skill.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">No skills</span>
                      )}
                      {user.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {onViewUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewUser(user)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {onEditUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditUser(user)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {onDeleteUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteUser(user.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}; 