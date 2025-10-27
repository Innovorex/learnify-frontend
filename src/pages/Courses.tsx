import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  duration_hours: number;
  difficulty_level: string;
  platform: string;
  provider: string;
  certificate_available: boolean;
  url: string;
}

export const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  useEffect(() => {
    loadCourses();
  }, [selectedCategory, selectedPlatform]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (selectedPlatform !== 'all') {
        params.append('platform', selectedPlatform);
      }

      const url = `/api/courses/catalog${params.toString() ? `?${params.toString()}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      } else {
        setError('Failed to load courses');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(courses.map(course => course.category))];
  const platforms = [...new Set(courses.map(course => course.platform))];

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">CPD Courses</h1>
        <p className="text-gray-600">
          Explore continuous professional development courses to enhance your teaching skills
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Platform
          </label>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Platforms</option>
            {platforms.map(platform => (
              <option key={platform} value={platform}>{platform}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Loading courses...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-600">{error}</div>
          <Button onClick={loadCourses} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">No courses found matching your criteria</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">
                    {course.title}
                  </h3>
                  {course.certificate_available && (
                    <span className="ml-2 text-green-600 text-sm">📜</span>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(course.difficulty_level)}`}>
                    {course.difficulty_level}
                  </span>
                  <span className="text-xs text-gray-500">
                    {course.duration_hours}h • {course.platform}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {course.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="text-xs">
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="ml-1 text-gray-600">{course.category}</span>
                </div>
                {course.subcategory && (
                  <div className="text-xs">
                    <span className="font-medium text-gray-700">Subcategory:</span>
                    <span className="ml-1 text-gray-600">{course.subcategory}</span>
                  </div>
                )}
                <div className="text-xs">
                  <span className="font-medium text-gray-700">Provider:</span>
                  <span className="ml-1 text-gray-600">{course.provider}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => window.open(course.url, '_blank')}
                  className="flex-1 text-sm py-2 bg-blue-600 hover:bg-blue-700"
                >
                  View Course ↗
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};