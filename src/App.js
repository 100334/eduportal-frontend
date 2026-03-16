import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import LearnerLogin from './pages/LearnerLogin';
import TeacherLogin from './pages/TeacherLogin';
import AdminLogin from './pages/AdminLogin';

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherLearners from './pages/teacher/Learners';
import TeacherReports from './pages/teacher/Reports';
import TeacherAttendance from './pages/teacher/Attendance';

// Learner Pages
import LearnerDashboard from './pages/learners/Dashboard';
import LearnerReportCard from './pages/learners/ReportCard';
import LearnerAttendance from './pages/learners/Attendance';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminTeachers from './pages/admin/Teachers';
import AdminLearners from './pages/admin/Learners';
import AdminClasses from './pages/admin/Classes';
import AdminSubjects from './pages/admin/Subjects';
import AdminStreams from './pages/admin/Streams';
import AdminAssignments from './pages/admin/Assignments';
import AdminSettings from './pages/admin/Settings';
import AdminReports from './pages/admin/Reports';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#2dce89',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#e63946',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <Routes>
          {/* Public Routes - Learner Login is the default landing page */}
          <Route path="/" element={<Navigate to="/learner/login" replace />} />
          <Route path="/learner/login" element={<LearnerLogin />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Teacher Routes */}
          <Route path="/teacher" element={<ProtectedRoute role="teacher" />}>
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="learners" element={<TeacherLearners />} />
            <Route path="reports" element={<TeacherReports />} />
            <Route path="attendance" element={<TeacherAttendance />} />
          </Route>

          {/* Protected Learner Routes */}
          <Route path="/learner" element={<ProtectedRoute role="learner" />}>
            <Route path="dashboard" element={<LearnerDashboard />} />
            <Route path="report-card" element={<LearnerReportCard />} />
            <Route path="attendance" element={<LearnerAttendance />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin" />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            
            {/* Teacher Management */}
            <Route path="teachers" element={<AdminTeachers />} />
            
            {/* Learner Management */}
            <Route path="learners" element={<AdminLearners />} />
            
            {/* Class Management */}
            <Route path="classes" element={<AdminClasses />} />
            <Route path="classes/create" element={<AdminClasses />} />
            <Route path="classes/:id/edit" element={<AdminClasses />} />
            <Route path="classes/:id/subjects" element={<AdminClasses />} />
            
            {/* Subject Management */}
            <Route path="subjects" element={<AdminSubjects />} />
            <Route path="subjects/create" element={<AdminSubjects />} />
            <Route path="subjects/:id/edit" element={<AdminSubjects />} />
            
            {/* Stream Management */}
            <Route path="streams" element={<AdminStreams />} />
            
            {/* Teacher-Class-Subject Assignments */}
            <Route path="assignments" element={<AdminAssignments />} />
            <Route path="assignments/teachers" element={<AdminAssignments />} />
            <Route path="assignments/class-teachers" element={<AdminAssignments />} />
            
            {/* System Settings */}
            <Route path="settings" element={<AdminSettings />} />
            
            {/* Admin Reports */}
            <Route path="reports" element={<AdminReports />} />
            <Route path="reports/teachers" element={<AdminReports />} />
            <Route path="reports/classes" element={<AdminReports />} />
            <Route path="reports/enrollment" element={<AdminReports />} />
          </Route>

          {/* Fallback - redirect to learner login */}
          <Route path="*" element={<Navigate to="/learner/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;