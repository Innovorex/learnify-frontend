import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProfileProvider, useProfile } from './contexts/ProfileContext';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { DashboardPage } from './pages/DashboardPage';
import { AssessmentsPage } from './pages/AssessmentsPage';
import { AssessmentTakePage } from './pages/AssessmentTakePage';
import { SubmissionPage } from './pages/SubmissionPage';
import { ProgressPage } from './pages/ProgressPage';
import { GrowthPlanPage } from './pages/GrowthPlanPage';
import { Courses } from './pages/Courses';
import { CPDCoursesPage } from './pages/CPDCoursesPage';
import { CareerProgressionPage } from './pages/CareerProgressionPage';
import { ModuleContentPage } from './pages/ModuleContentPage';
import { ModuleExamPage } from './pages/ModuleExamPage';
import AITutor from './pages/AITutor';
import { AdminLayout } from './components/Layout/AdminLayout';
import { PrincipalDashboard } from './pages/PrincipalDashboard';
import { AdminCourseManagement } from './pages/AdminCourseManagement';
import { AdminTeacherAnalytics } from './pages/AdminTeacherAnalytics';
import { AdminPerformanceAnalytics } from './pages/AdminPerformanceAnalytics';

// K-12 Student Pages
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentAssessmentPage } from './pages/StudentAssessmentPage';
import { StudentResultsPage } from './pages/StudentResultsPage';
import { StudentAssessmentsPage } from './pages/StudentAssessmentsPage';

// K-12 Teacher Pages
import { TeacherCreateAssessment } from './pages/TeacherCreateAssessment';
import { TeacherAssessmentList } from './pages/TeacherAssessmentList';
import { TeacherQuestionsPage } from './pages/TeacherQuestionsPage';
import { TeacherResultsPage } from './pages/TeacherResultsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { hasProfile, loading: profileLoading } = useProfile();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is admin, redirect to admin dashboard
  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If user is student, redirect to student dashboard
  if (user?.role === 'student') {
    return <Navigate to="/student/dashboard" replace />;
  }

  // If user is a teacher and doesn't have a profile, redirect to profile setup
  if (user?.role === 'teacher' && !hasProfile) {
    return <Navigate to="/profile-setup" replace />;
  }

  return <>{children}</>;
};

// Student Route
const StudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'student') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const ProfileSetupRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { hasProfile, loading: profileLoading } = useProfile();

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user already has a profile, redirect to dashboard
  if (hasProfile) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is not a teacher, redirect to dashboard
  if (user?.role !== 'teacher') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect based on user role
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user?.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const RoleBasedRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user?.role === 'student') {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />

        {/* Profile setup route */}
        <Route
          path="/profile-setup"
          element={
            <ProfileSetupRoute>
              <ProfileSetupPage />
            </ProfileSetupRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RoleBasedRedirect />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="assessments" element={<AssessmentsPage />} />
          <Route path="assessment/:moduleId" element={<AssessmentTakePage />} />
          <Route path="submission/:moduleId" element={<SubmissionPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="growth-plan" element={<GrowthPlanPage />} />
          <Route path="courses" element={<Courses />} />
          <Route path="cpd-courses" element={<CPDCoursesPage />} />
          <Route path="career-progression/:courseId" element={<CareerProgressionPage />} />
          <Route path="career-progression/module/:moduleId" element={<ModuleContentPage />} />
          <Route path="career-progression/module/:moduleId/exam" element={<ModuleExamPage />} />
          <Route path="ai-tutor" element={<AITutor />} />
          {/* Teacher K-12 routes */}
          <Route path="teacher/k12/create" element={<TeacherCreateAssessment />} />
          <Route path="teacher/k12/assessments" element={<TeacherAssessmentList />} />
          <Route path="teacher/k12/assessment/:assessmentId/questions" element={<TeacherQuestionsPage />} />
          <Route path="teacher/k12/results/:assessmentId" element={<TeacherResultsPage />} />
        </Route>

        {/* Student routes */}
        <Route
          path="/student"
          element={
            <StudentRoute>
              <DashboardLayout />
            </StudentRoute>
          }
        >
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="assessments" element={<StudentAssessmentsPage />} />
          <Route path="assessment/:id" element={<StudentAssessmentPage />} />
          <Route path="results" element={<StudentResultsPage />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<PrincipalDashboard />} />
          <Route path="teachers" element={<AdminTeacherAnalytics />} />
          <Route path="courses" element={<AdminCourseManagement />} />
          <Route path="analytics" element={<AdminPerformanceAnalytics />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<RoleBasedRedirect />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <div className="App">
          <AppRoutes />
          <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
          />
        </div>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App;