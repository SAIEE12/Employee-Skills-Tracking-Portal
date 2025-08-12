import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, TrendingUp, Award, Building2, Code2 } from 'lucide-react';
import { StatsData } from '@/services/api/types';

interface StatsCardsProps {
  stats: StatsData;
  className?: string;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, className = '' }) => {
  const statsConfig = [
    {
      title: 'Total Users',
      value: stats.total_users.toString(),
      icon: Users,
      color: 'text-blue-600',
      description: 'Active users in the system'
    },
    {
      title: 'Total Skills',
      value: stats.total_skills.toString(),
      icon: Target,
      color: 'text-green-600',
      description: 'Skills tracked across domains'
    },
    {
      title: 'Total Domains',
      value: stats.total_domains.toString(),
      icon: Building2,
      color: 'text-purple-600',
      description: 'Skill domains available'
    },
    {
      title: 'Avg Skills/User',
      value: stats.total_users > 0 
        ? (stats.total_skills / stats.total_users).toFixed(1)
        : '0',
      icon: TrendingUp,
      color: 'text-orange-600',
      description: 'Average skills per user'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users by Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.users_by_role).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {role.replace('-', ' ')}
                    </Badge>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skills by Domain */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Skills by Domain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.skills_by_domain).map(([domain, count]) => (
                <div key={domain} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{domain}</Badge>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 