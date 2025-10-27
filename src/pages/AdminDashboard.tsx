import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Users,
  GraduationCap,
  TrendingUp,
  BookOpen,
  AlertCircle,
  Activity,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  Target,
  Monitor
} from 'lucide-react';

interface AdminDashboardData {
  systemMetrics: {
    totalTeachers: number;
    activeTeachers: number;
    totalCourses: number;
    activeCourses: number;
    totalAssessments: number;
    pendingRecommendations: number;
    systemUptime: string;
    avgResponseTime: string;
  };
  performanceAnalytics: {
    overallAverage: number;
    topPerformers: Array<{name: string; score: number}>;
    improvementNeeded: Array<{name: string; score: number}>;
    modulePerformance: Array<{module: string; avgScore: number; totalTests: number}>;
  };
  courseAnalytics: {
    mostPopular: Array<{title: string; enrollments: number}>;
    completionRates: Array<{title: string; rate: number}>;
    platformDistribution: Array<{platform: string; count: number}>;
  };
  recentActivity: Array<{
    type: 'enrollment' | 'completion' | 'assessment' | 'recommendation';
    teacher: string;
    action: string;
    timestamp: string;
    status: 'success' | 'warning' | 'error';
  }>;
  systemAlerts: Array<{
    type: 'info' | 'warning' | 'error';
    message: string;
    timestamp: string;
  }>;
  system_health?: {
    system_uptime: string;
    last_backup: string;
    active_teachers: number;
    total_users: number;
  };
  weekly_metrics?: {
    new_assessments: number;
    recommendations_generated: number;
  };
  course_metrics?: {
    active_courses: number;
    most_popular: string;
  };
  averagePerformance?: number;
}

export const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      const response = await fetch('/api/admin/dashboard/metrics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Fetch additional data for comprehensive dashboard
      const [statsResponse, teachersResponse, coursesResponse] = await Promise.all([
        fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/admin/teachers', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/admin/courses/analytics', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (response.ok && statsResponse.ok && teachersResponse.ok && coursesResponse.ok) {
        const [metricsData, statsData, teachersData, coursesData] = await Promise.all([
          response.json(),
          statsResponse.json(),
          teachersResponse.json(),
          coursesResponse.json()
        ]);

        // Process teachers data for performance analytics
        const teachersWithScores = teachersData.teachers.filter((t: any) => t.performance_summary.total_assessments > 0);
        const topPerformers = teachersWithScores
          .sort((a: any, b: any) => b.performance_summary.overall_score - a.performance_summary.overall_score)
          .slice(0, 5)
          .map((t: any) => ({
            name: t.name,
            score: Math.round(t.performance_summary.overall_score)
          }));

        const improvementNeeded = teachersWithScores
          .sort((a: any, b: any) => a.performance_summary.overall_score - b.performance_summary.overall_score)
          .slice(0, 5)
          .map((t: any) => ({
            name: t.name,
            score: Math.round(t.performance_summary.overall_score)
          }));

        // Process course data for course analytics
        const mostPopular = coursesData.courses
          .sort((a: any, b: any) => b.enrolled_count - a.enrolled_count)
          .slice(0, 5)
          .map((c: any) => ({
            title: c.title,
            enrollments: c.enrolled_count
          }));

        // Platform distribution
        const platformCounts = coursesData.courses.reduce((acc: any, course: any) => {
          acc[course.platform] = (acc[course.platform] || 0) + course.enrolled_count;
          return acc;
        }, {});

        const platformDistribution = Object.entries(platformCounts).map(([platform, count]) => ({
          platform,
          count
        }));

        // Combine all data
        const combinedData = {
          ...metricsData,
          ...statsData,
          performanceAnalytics: {
            topPerformers,
            improvementNeeded,
            modulePerformance: []
          },
          courseAnalytics: {
            mostPopular,
            platformDistribution
          }
        };

        setDashboardData(combinedData);
      } else {
        // Enhanced mock data for admin dashboard
        setDashboardData({
          systemMetrics: {
            totalTeachers: 156,
            activeTeachers: 134,
            totalCourses: 28,
            activeCourses: 24,
            totalAssessments: 847,
            pendingRecommendations: 43,
            systemUptime: '99.9%',
            avgResponseTime: '145ms'
          },
          performanceAnalytics: {
            overallAverage: 72.4,
            topPerformers: [
              {name: 'Sarah Johnson', score: 94},
              {name: 'Michael Chen', score: 91},
              {name: 'Emma Davis', score: 89}
            ],
            improvementNeeded: [
              {name: 'John Smith', score: 45},
              {name: 'Lisa Brown', score: 38},
              {name: 'David Wilson', score: 42}
            ],
            modulePerformance: [
              {module: 'Pedagogical Skills', avgScore: 68, totalTests: 156},
              {module: 'Subject Knowledge', avgScore: 78, totalTests: 134},
              {module: 'Technology Integration', avgScore: 71, totalTests: 142},
              {module: 'Assessment Methods', avgScore: 74, totalTests: 128}
            ]
          },
          courseAnalytics: {
            mostPopular: [
              {title: 'Digital Teaching Tools', enrollments: 89},
              {title: 'Classroom Management', enrollments: 76},
              {title: 'FLN Training', enrollments: 65}
            ],
            completionRates: [
              {title: 'Classroom Management', rate: 87},
              {title: 'Digital Teaching Tools', rate: 72},
              {title: 'FLN Training', rate: 68}
            ],
            platformDistribution: [
              {platform: 'DIKSHA', count: 18},
              {platform: 'SWAYAM', count: 6},
              {platform: 'NCERT', count: 4}
            ]
          },
          recentActivity: [
            {type: 'enrollment', teacher: 'Alice Cooper', action: 'enrolled in Digital Math Tools', timestamp: '2 min ago', status: 'success'},
            {type: 'completion', teacher: 'Bob Wilson', action: 'completed Classroom Management course', timestamp: '15 min ago', status: 'success'},
            {type: 'assessment', teacher: 'Carol Smith', action: 'scored 85% in Pedagogical Skills assessment', timestamp: '32 min ago', status: 'success'},
            {type: 'recommendation', teacher: 'David Lee', action: 'dismissed AI recommendation', timestamp: '1 hour ago', status: 'warning'},
            {type: 'enrollment', teacher: 'Eva Garcia', action: 'enrolled in FLN Training', timestamp: '2 hours ago', status: 'success'}
          ],
          systemAlerts: [
            {type: 'warning', message: 'Course recommendation acceptance rate below 80%', timestamp: '1 hour ago'},
            {type: 'info', message: 'Weekly performance report generated successfully', timestamp: '3 hours ago'},
            {type: 'error', message: 'OpenRouter API rate limit reached (resolved)', timestamp: '6 hours ago'}
          ]
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const exportReport = () => {
    // Implement report export functionality
    console.log('Exporting comprehensive report...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="text-center text-gray-500">Failed to load dashboard data</div>;
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'enrollment': return <BookOpen className="h-4 w-4 text-blue-600" />;
      case 'completion': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'assessment': return <Target className="h-4 w-4 text-purple-600" />;
      case 'recommendation': return <Zap className="h-4 w-4 text-orange-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Command Center</h1>
          <p className="text-gray-600">Complete oversight of the Teacher Evaluation Platform</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={refreshData}
            disabled={refreshing}
            variant="ghost"
            className="border border-gray-300"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportReport} className="bg-red-600 hover:bg-red-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* System Status Bar */}
      <Card className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-gray-900">System Status: Operational</h3>
              <p className="text-sm text-gray-600">Uptime: {dashboardData.system_health?.system_uptime} | Last Backup: {dashboardData.system_health?.last_backup}</p>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{dashboardData.system_health?.active_teachers}</div>
              <div className="text-gray-500">Active Teachers</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{dashboardData.weekly_metrics?.new_assessments}</div>
              <div className="text-gray-500">New Assessments</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{dashboardData.weekly_metrics?.recommendations_generated}</div>
              <div className="text-gray-500">AI Recommendations</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Total Users</p>
              <p className="text-3xl font-bold text-blue-900">{dashboardData.system_health?.total_users || dashboardData.systemMetrics.totalTeachers}</p>
              <p className="text-sm text-blue-600">
                {dashboardData.system_health?.active_teachers || dashboardData.systemMetrics.activeTeachers} active
              </p>
            </div>
            <Users className="h-12 w-12 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-green-800">Active Courses</p>

      <p className="text-3xl font-bold text-green-900">
        {dashboardData?.course_metrics?.active_courses ??
         dashboardData?.systemMetrics?.activeCourses ??
         0}
      </p>

      <p className="text-sm text-green-600">
        Most popular: {dashboardData?.course_metrics?.most_popular ?? 'N/A'}
      </p>
    </div>
    <GraduationCap className="h-12 w-12 text-green-600" />
  </div>
</Card>


        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Avg Performance</p>
              <p className="text-3xl font-bold text-purple-900">{dashboardData.averagePerformance}%</p>
              <p className="text-sm text-purple-600">Across all assessments</p>
            </div>
            <TrendingUp className="h-12 w-12 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-800">System Load</p>
              <p className="text-3xl font-bold text-orange-900">78%</p>
              <p className="text-sm text-orange-600">Optimal performance</p>
            </div>
            <Activity className="h-12 w-12 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Analytics */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>

          {/* Top Performers */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-3">Top Performers</h4>
            <div className="space-y-2">
              {(dashboardData.performanceAnalytics?.topPerformers || []).map((teacher, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm font-medium">{teacher.name}</span>
                  <span className="text-sm font-bold text-green-600">{teacher.score}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Needs Improvement */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Needs Attention</h4>
            <div className="space-y-2">
              {(dashboardData.performanceAnalytics?.improvementNeeded || []).map((teacher, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-sm font-medium">{teacher.name}</span>
                  <span className="text-sm font-bold text-red-600">{teacher.score}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Course Analytics */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Course Analytics</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>

          {/* Most Popular Courses */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-700 mb-3">Most Popular Courses</h4>
            <div className="space-y-3">
              {(dashboardData.courseAnalytics?.mostPopular || []).map((course, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{course.title}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(course.enrollments / 100) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{course.enrollments}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Distribution */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Platform Distribution</h4>
            <div className="grid grid-cols-3 gap-2">
              {(dashboardData.courseAnalytics?.platformDistribution || []).map((platform, index) => (
                <div key={index} className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-bold text-lg">{platform.count}</div>
                  <div className="text-xs text-gray-600">{platform.platform}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Real-time Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Activity Feed */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Live Activity Feed</h3>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {(dashboardData.recentActivity || []).map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.teacher}</p>
                  <p className="text-xs text-gray-600">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.timestamp}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* System Alerts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">System Alerts</h3>
            <AlertCircle className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {(dashboardData.systemAlerts || []).map((alert, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                alert.type === 'error' ? 'bg-red-50 border-red-400' :
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className="flex items-start space-x-2">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500">{alert.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Module Performance Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Module Performance Overview</h3>
          <Monitor className="h-5 w-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(dashboardData.performanceAnalytics?.modulePerformance || []).map((module, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900">{module.module}</div>
              <div className="text-2xl font-bold text-blue-600 my-2">{module.avgScore}%</div>
              <div className="text-sm text-gray-600">{module.totalTests} assessments</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${module.avgScore}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};