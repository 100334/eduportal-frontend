import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  CalendarIcon,
  ArrowLeftOnRectangleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
  const { user, logout, isTeacher } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const teacherNav = [
    { name: 'Overview', to: '/teacher/dashboard', icon: HomeIcon },
    { name: 'Learners', to: '/teacher/learners', icon: UserGroupIcon },
    { name: 'Report Cards', to: '/teacher/reports', icon: DocumentTextIcon },
    { name: 'Attendance', to: '/teacher/attendance', icon: CalendarIcon },
  ];

  const learnerNav = [
    { name: 'My Home', to: '/learner/dashboard', icon: HomeIcon },
    { name: 'Report Card', to: '/learner/report-card', icon: DocumentTextIcon },
    { name: 'Attendance', to: '/learner/attendance', icon: CalendarIcon },
  ];

  const navigation = isTeacher ? teacherNav : learnerNav;

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">
          <span className="font-serif text-sm font-black text-gold">E</span>
        </div>
        <span className="sidebar-logo-text">EduPortal</span>
      </div>

      {/* User Info */}
      <div className="sidebar-user">
        <div className="sidebar-user-name">
          {isTeacher ? user?.username : user?.name}
        </div>
        <div className="sidebar-user-role">
          {isTeacher ? 'Class Teacher' : `Student · ${user?.grade}`}
        </div>
        {!isTeacher && (
          <div className="mt-2">
            <span className="reg-chip text-xs">
              <AcademicCapIcon className="w-3 h-3" />
              {user?.reg_number}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="nav-icon" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="logout-btn"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}