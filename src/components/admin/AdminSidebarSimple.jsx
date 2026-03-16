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
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function AdminSidebarSimple() {
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
    { name: 'Classes', to: '/admin/classes', icon: BookOpenIcon },
    { name: 'Subjects', to: '/admin/subjects', icon: BookOpenIcon },
    { name: 'Settings', to: '/admin/settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="w-6 h-6 text-ink" />
          <span className="font-bold text-ink">Admin Panel</span>
        </div>
      </div>

      <div className="p-4 border-b bg-gray-50">
        <p className="font-medium">{user?.name || 'Admin'}</p>
        <p className="text-xs text-gray-500">Administrator</p>
      </div>

      <nav className="flex-1 p-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-1 ${
                isActive ? 'bg-ink text-white' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-gray-600 hover:text-red-500 w-full px-4 py-2"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}