import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HomeIcon, 
  UsersIcon, 
  AcademicCapIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/learner/login');
  };

  const navigation = [
    { name: 'Dashboard', to: '/admin/dashboard', icon: HomeIcon },
    { name: 'Teachers', to: '/admin/teachers', icon: UsersIcon },
    { name: 'Learners', to: '/admin/learners', icon: AcademicCapIcon },
    { name: 'Classes', to: '/admin/classes', icon: BuildingOfficeIcon },
    { name: 'Subjects', to: '/admin/subjects', icon: BookOpenIcon },
    { name: 'Assignments', to: '/admin/assignments', icon: UserGroupIcon },
    { name: 'Reports', to: '/admin/reports', icon: ChartBarIcon },
    { name: 'Settings', to: '/admin/settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="w-64 bg-white border-r-2 border-ink/10 flex flex-col h-screen sticky top-0 shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-ink/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-ink to-azure rounded-lg flex items-center justify-center shadow-md">
            <ShieldCheckIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-serif font-bold text-ink">Admin Panel</span>
            <p className="text-xs text-gray-500">v1.0.0</p>
          </div>
        </div>
      </div>

      {/* Admin Info */}
      <div className="p-4 m-2 bg-gradient-to-r from-ink/5 to-azure/5 rounded-lg border border-ink/10">
        <p className="font-medium text-ink">{user?.name || 'Administrator'}</p>
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <ShieldCheckIcon className="w-3 h-3 text-azure" />
          System Administrator
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          // Define the styling function inside the map
          const linkStyle = ({ isActive }) => {
            return `flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full ${
              isActive 
                ? 'bg-gradient-to-r from-ink to-azure text-white shadow-md' 
                : 'text-gray-600 hover:bg-ink/5 hover:text-ink'
            }`;
          };
          
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={linkStyle}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-ink/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-gray-600 hover:text-red-500 transition-colors w-full px-4 py-2 rounded-lg hover:bg-red-50"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}