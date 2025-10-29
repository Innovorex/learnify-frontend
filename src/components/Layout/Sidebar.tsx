import React, { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Target,
  LogOut,
  BookOpen,
  GraduationCap,
  Award,
  Sparkles,
  ClipboardList,
  FileText,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TeacherProfileModal } from '../Profile/TeacherProfileModal';

const teacherNavigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'My Growth',
    icon: TrendingUp,
    subItems: [
      {
        name: 'Progress',
        href: '/progress',
        icon: TrendingUp,
      },
      {
        name: 'Growth Plan',
        href: '/growth-plan',
        icon: Target,
      },
    ],
  },
  {
    name: 'Assessments',
    href: '/assessments',
    icon: BookOpen,
  },
  {
    name: 'Professional Development',
    icon: GraduationCap,
    subItems: [
      {
        name: 'Courses',
        href: '/courses',
        icon: GraduationCap,
      },
      {
        name: 'Career Progression',
        href: '/cpd-courses',
        icon: Award,
      },
    ],
  },
  {
    name: 'AI Tutor',
    href: '/ai-tutor',
    icon: Sparkles,
  },
  {
    name: 'Student Assessments',
    href: '/teacher/k12/assessments',
    icon: ClipboardList,
  },
];

const studentNavigation = [
  {
    name: 'Dashboard',
    href: '/student/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'My Assessments',
    href: '/student/assessments',
    icon: FileText,
  },
  {
    name: 'My Results',
    href: '/student/results',
    icon: ClipboardList,
  },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navigation = useMemo(() => {
    if (user?.role === 'student') {
      return studentNavigation;
    }
    return teacherNavigation;
  }, [user?.role]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  return (
    <div className="flex h-screen bg-white border-r border-gray-200 w-64 flex-col">
      {/* Logo and branding */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {user?.role === 'student' ? 'Learnify' : 'TeachEval'}
            </h1>
            <p className="text-sm text-gray-500">Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item: any) => (
          <div key={item.name}>
            {item.subItems ? (
              // Dropdown menu item
              <div>
                <button
                  onClick={() => toggleExpanded(item.name)}
                  className="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  <item.icon
                    className="mr-3 h-5 w-5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-left">{item.name}</span>
                  {expandedItems.includes(item.name) ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                </button>
                {expandedItems.includes(item.name) && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.subItems.map((subItem: any) => (
                      <NavLink
                        key={subItem.name}
                        to={subItem.href}
                        className={({ isActive }) =>
                          `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                            isActive
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`
                        }
                      >
                        <subItem.icon
                          className="mr-3 h-4 w-4 flex-shrink-0"
                          aria-hidden="true"
                        />
                        {subItem.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Regular menu item
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon
                  className="mr-3 h-5 w-5 flex-shrink-0"
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={() => user?.role === 'teacher' && setShowProfileModal(true)}
          className="flex items-center space-x-3 mb-4 w-full hover:bg-gray-50 rounded-lg p-2 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            {user?.role === 'student' && (
              <p className="text-xs text-gray-400">
                Class {user.class_name}-{user.section}
              </p>
            )}
          </div>
        </button>

        {/* Dark Mode Toggle - Placeholder */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">Dark Mode</span>
          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300">
            <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform translate-x-1" />
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center w-full px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </button>
      </div>

      {/* Profile Modal - Only for teachers */}
      {user?.role === 'teacher' && (
        <TeacherProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
};