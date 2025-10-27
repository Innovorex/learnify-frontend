import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Users,
  TrendingUp,
  Award,
  BookOpen,
  Target,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  BarChart3,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';

interface Teacher {
  id: number;
  name: string;
  email: string;
  profile?: {
    education: string;
    experience_years: number;
    grades_teaching: string;
    subjects_teaching: string;
    board: string;
  };
  performance_summary?: {
    overall_score: number;
    total_assessments: number;
    weak_areas: string[];
    strong_areas: string[];
  };
  course_progress?: {
    enrolled_courses: number;
    completed_courses: number;
    recommendations_received: number;
    recommendations_accepted: number;
  };
}

type PerformanceFilter = 'all' | 'excellent' | 'good' | 'needs_support' | 'critical';

export const AdminTeacherAnalytics: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<PerformanceFilter>('all');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      const response = await fetch('http://104.251.217.92:8000/admin/teachers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTeachers(data.teachers || []);
      } else {
        toast.error('Failed to load teachers');
      }
    } catch (error) {
      console.error('Error loading teachers:', error);
      toast.error('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTeachers();
    setRefreshing(false);
    toast.success('Data refreshed!');
  };

  const exportReport = () => {
    toast.info('Export feature coming soon!');
  };

  const getPerformanceLevel = (score: number): { level: string; color: string; bgColor: string; icon: JSX.Element } => {
    if (score >= 85) {
      return {
        level: 'Excellent',
        color: 'text-green-700',
        bgColor: 'bg-green-50 border-green-200',
        icon: <CheckCircle className="h-5 w-5 text-green-600" />
      };
    } else if (score >= 70) {
      return {
        level: 'Good',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50 border-blue-200',
        icon: <CheckCircle className="h-5 w-5 text-blue-600" />
      };
    } else if (score >= 60) {
      return {
        level: 'Needs Support',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50 border-yellow-200',
        icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />
      };
    } else {
      return {
        level: 'Critical',
        color: 'text-red-700',
        bgColor: 'bg-red-50 border-red-200',
        icon: <AlertTriangle className="h-5 w-5 text-red-600" />
      };
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    const score = teacher.performance_summary?.overall_score || 0;
    if (filter === 'all') return true;
    if (filter === 'excellent') return score >= 85;
    if (filter === 'good') return score >= 70 && score < 85;
    if (filter === 'needs_support') return score >= 60 && score < 70;
    if (filter === 'critical') return score < 60;
    return true;
  });

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => (t.performance_summary?.total_assessments || 0) > 0).length,
    avgScore: teachers.length > 0
      ? Math.round(teachers.reduce((sum, t) => sum + (t.performance_summary?.overall_score || 0), 0) / teachers.length)
      : 0,
    enrollments: teachers.reduce((sum, t) => sum + (t.course_progress?.enrolled_courses || 0), 0)
  };

  const performanceCounts = {
    excellent: teachers.filter(t => (t.performance_summary?.overall_score || 0) >= 85).length,
    good: teachers.filter(t => {
      const score = t.performance_summary?.overall_score || 0;
      return score >= 70 && score < 85;
    }).length,
    needs_support: teachers.filter(t => {
      const score = t.performance_summary?.overall_score || 0;
      return score >= 60 && score < 70;
    }).length,
    critical: teachers.filter(t => (t.performance_summary?.overall_score || 0) < 60).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Analytics</h1>
          <p className="text-sm text-gray-600">Individual teacher performance and development tracking</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="ghost"
            className="border border-gray-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportReport} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Total Teachers</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
              <p className="text-xs text-blue-600 mt-1">{stats.active} active</p>
            </div>
            <Users className="h-12 w-12 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">Average Score</p>
              <p className="text-3xl font-bold text-green-900">{stats.avgScore}%</p>
              <p className="text-xs text-green-600 mt-1">Overall performance</p>
            </div>
            <Target className="h-12 w-12 text-green-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">CPD Enrollments</p>
              <p className="text-3xl font-bold text-purple-900">{stats.enrollments}</p>
              <p className="text-xs text-purple-600 mt-1">Professional development</p>
            </div>
            <BookOpen className="h-12 w-12 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-800">Participation</p>
              <p className="text-3xl font-bold text-orange-900">
                {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
              </p>
              <p className="text-xs text-orange-600 mt-1">Assessment engagement</p>
            </div>
            <TrendingUp className="h-12 w-12 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Performance Filter Tabs */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Teachers ({teachers.length})
          </button>
          <button
            onClick={() => setFilter('excellent')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filter === 'excellent'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Excellent ({performanceCounts.excellent})
          </button>
          <button
            onClick={() => setFilter('good')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filter === 'good'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Good ({performanceCounts.good})
          </button>
          <button
            onClick={() => setFilter('needs_support')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filter === 'needs_support'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Needs Support ({performanceCounts.needs_support})
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              filter === 'critical'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Critical ({performanceCounts.critical})
          </button>
        </div>
      </Card>

      {/* Teacher Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => {
          const performance = getPerformanceLevel(teacher.performance_summary?.overall_score || 0);

          return (
            <Card
              key={teacher.id}
              className={`p-6 border-2 ${performance.bgColor} hover:shadow-lg transition-shadow cursor-pointer`}
              onClick={() => setSelectedTeacher(teacher)}
            >
              {/* Teacher Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {teacher.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                    <p className="text-xs text-gray-600">
                      {teacher.profile?.experience_years || 0} years experience
                    </p>
                  </div>
                </div>
                {performance.icon}
              </div>

              {/* Performance Score */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Performance</span>
                  <span className={`text-2xl font-bold ${performance.color}`}>
                    {teacher.performance_summary?.overall_score || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      (teacher.performance_summary?.overall_score || 0) >= 75
                        ? 'bg-green-500'
                        : (teacher.performance_summary?.overall_score || 0) >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${teacher.performance_summary?.overall_score || 0}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-600">
                    {teacher.performance_summary?.total_assessments || 0} assessments
                  </span>
                  <span className={`text-xs font-medium ${performance.color}`}>
                    {performance.level}
                  </span>
                </div>
              </div>

              {/* Teaching Info */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center text-sm">
                  <GraduationCap className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-gray-700">{teacher.profile?.grades_teaching || 'N/A'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <BookOpen className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-gray-700 truncate">{teacher.profile?.subjects_teaching || 'N/A'}</span>
                </div>
              </div>

              {/* Competency Areas */}
              {teacher.performance_summary && (
                <div className="space-y-2">
                  {teacher.performance_summary.strong_areas && teacher.performance_summary.strong_areas.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Strong Areas:</p>
                      <div className="flex flex-wrap gap-1">
                        {teacher.performance_summary.strong_areas.slice(0, 2).map((area, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {teacher.performance_summary.weak_areas && teacher.performance_summary.weak_areas.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Needs Attention:</p>
                      <div className="flex flex-wrap gap-1">
                        {teacher.performance_summary.weak_areas.slice(0, 2).map((area, idx) => (
                          <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CPD Progress */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">CPD Progress:</span>
                  <span className="font-medium text-gray-900">
                    {teacher.course_progress?.completed_courses || 0}/{teacher.course_progress?.enrolled_courses || 0}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredTeachers.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No teachers found in this category</p>
        </Card>
      )}

      {/* Teacher Detail Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-xl">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {selectedTeacher.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedTeacher.name}</h2>
                    <p className="text-sm text-gray-600">{selectedTeacher.profile?.board || 'N/A'} Board</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
                  <h3 className="font-semibold text-gray-900 mb-3">Profile Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Education:</span>
                      <span className="font-medium text-gray-900">{selectedTeacher.profile?.education || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-medium text-gray-900">{selectedTeacher.profile?.experience_years || 0} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Grades:</span>
                      <span className="font-medium text-gray-900">{selectedTeacher.profile?.grades_teaching || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subjects:</span>
                      <span className="font-medium text-gray-900 text-right">{selectedTeacher.profile?.subjects_teaching || 'N/A'}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
                  <h3 className="font-semibold text-gray-900 mb-3">Performance Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Overall Score:</span>
                      <span className="font-bold text-green-700 text-lg">{selectedTeacher.performance_summary?.overall_score || 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assessments:</span>
                      <span className="font-medium text-gray-900">{selectedTeacher.performance_summary?.total_assessments || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${getPerformanceLevel(selectedTeacher.performance_summary?.overall_score || 0).color}`}>
                        {getPerformanceLevel(selectedTeacher.performance_summary?.overall_score || 0).level}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Competency Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    Strong Areas
                  </h3>
                  <div className="space-y-2">
                    {selectedTeacher.performance_summary?.strong_areas && selectedTeacher.performance_summary.strong_areas.length > 0 ? (
                      selectedTeacher.performance_summary.strong_areas.map((area, idx) => (
                        <div key={idx} className="px-3 py-2 bg-green-50 border-l-4 border-green-500 rounded text-sm">
                          {area}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No strong areas identified yet</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    Areas Needing Support
                  </h3>
                  <div className="space-y-2">
                    {selectedTeacher.performance_summary?.weak_areas && selectedTeacher.performance_summary.weak_areas.length > 0 ? (
                      selectedTeacher.performance_summary.weak_areas.map((area, idx) => (
                        <div key={idx} className="px-3 py-2 bg-red-50 border-l-4 border-red-500 rounded text-sm">
                          {area}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No weak areas identified</p>
                    )}
                  </div>
                </div>
              </div>

              {/* CPD Progress */}
              <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Professional Development</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-700">{selectedTeacher.course_progress?.enrolled_courses || 0}</p>
                    <p className="text-sm text-gray-600">Enrolled Courses</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-700">{selectedTeacher.course_progress?.completed_courses || 0}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-700">{selectedTeacher.course_progress?.recommendations_received || 0}</p>
                    <p className="text-sm text-gray-600">Recommendations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-700">{selectedTeacher.course_progress?.recommendations_accepted || 0}</p>
                    <p className="text-sm text-gray-600">Accepted</p>
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedTeacher(null)}
                >
                  Close
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Download className="h-4 w-4 mr-2" />
                  Generate Individual Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
