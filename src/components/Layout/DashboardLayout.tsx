import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CourseRecommendationsSidebar } from '../CourseRecommendations/CourseRecommendationsSidebar';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto relative">
          <div className="p-6">
            <Outlet />
          </div>
          {/* Course Recommendations Sidebar */}
          <CourseRecommendationsSidebar />
        </main>
      </div>
    </div>
  );
};