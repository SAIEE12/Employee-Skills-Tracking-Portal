import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import SkillsPage from '@/pages/SkillsPage';
import ProfilePage from '@/pages/ProfilePage';
import UsersPage from '@/pages/UsersPage';
import ManagersPage from '@/pages/manager/ManagersPage';
import EmployeeDashboard from '@/pages/employee/EmployeeDashboard';
import TrainerDashboard from '@/pages/trainer/TrainerDashboard';
import ManagerDashboard from '@/pages/manager/ManagerDashboard';
import SuperUserDashboard from '@/pages/super-user/SuperUserDashboard';
import NotFound from '@/pages/NotFound';

function DashboardRouter() {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case 'employee':
      return <EmployeeDashboard />;
    case 'trainer':
      return <TrainerDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'super-user':
      return <SuperUserDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardRouter />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/skills" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SkillsPage />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/users" 
        element={
          <ProtectedRoute requiredRole="manager">
            <DashboardLayout>
              <UsersPage />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/managers" 
        element={
          <ProtectedRoute requiredRole="super-user">
            <DashboardLayout>
              <ManagersPage />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;