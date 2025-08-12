export type UserRole = 'employee' | 'trainer' | 'manager' | 'super-user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  experience?: number;
  password?: string; // For user creation only
  domain_id?: string;
}

export interface Domain {
  id: string;
  name: string;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
  domain_id: string;
}

export interface UserWithSkills extends User {
  skills: Skill[];
  domain?: Domain;
}

export interface Employee extends User {
  role: 'employee';
  skillLevel: string;
  interviewReadiness: 'ready' | 'in-progress' | 'not-ready';
  currentLearningPath?: LearningPath;
  scores: Score[];
  notifications: Notification[];
}

export interface Score {
  id: string;
  employeeId: string;
  skill: string;
  score: number;
  date: string;
  trainerId: string;
  feedback?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  steps: LearningStep[];
  assignedBy: string;
  assignedDate: string;
}

export interface LearningStep {
  id: string;
  title: string;
  description: string;
  skillType: string;
  completed: boolean;
  completedDate?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'feedback' | 'status_change' | 'learning_path' | 'assessment';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface Assessment {
  id: string;
  employeeId: string;
  skill: string;
  score: number;
  date: string;
  trainerId: string;
  feedback?: string;
}

// Admin Types
export interface UserCreateData {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  department?: string;
  experience?: number;
  domain_id: string;
  skill_ids: string[];
}

export interface UserFilter {
  domain_id?: string;
  skill_ids?: string[];
  role?: UserRole;
  department?: string;
}

export interface StatsData {
  total_users: number;
  total_skills: number;
  total_domains: number;
  users_by_role: Record<string, number>;
  skills_by_domain: Record<string, number>;
}

// API Response Types
export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}