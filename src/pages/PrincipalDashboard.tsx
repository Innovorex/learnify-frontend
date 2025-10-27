import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Users,
  BookOpen,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  Minus,
  BarChart3,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { toast } from 'sonner';

interface PrincipalInsights {
  school_overview: {
    total_teachers: number;
    active_teachers: number;
    participation_rate: number;
    total_assessments_completed: number;
    overall_average_score: number;
    improvement_trend: number;
    trend_direction: 'up' | 'down' | 'stable';
  };
  question_1_immediate_attention: {
    count: number;
    teachers: Array<{
      id: number;
      name: string;
      average_score: number;
      weak_modules_count: number;
      total_assessments: number;
      status: 'critical' | 'needs_support';
    }>;
  };
  question_2_school_improvement: {
    current_month_avg: number;
    previous_month_avg: number;
    improvement_rate: number;
    is_improving: boolean;
    total_assessments_this_month: number;
  };
  question_3_training_investment: {
    priority_areas: Array<{
      module_name: string;
      average_score: number;
      teachers_below_60_percent: number;
      total_assessments: number;
      priority: 'high' | 'medium' | 'low';
    }>;
  };
  question_4_pd_effectiveness: {
    total_recommendations: number;
    acceptance_rate: number;
    completed_courses: number;
    avg_improvement_after_training: number;
    is_effective: boolean;
  };
  question_5_recognition: {
    count: number;
    top_performers: Array<{
      id: number;
      name: string;
      average_score: number;
      total_assessments: number;
      excellent_performances: number;
      consistency: number;
    }>;
  };
}

export const PrincipalDashboard: React.FC = () => {
  const [data, setData] = useState<PrincipalInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://104.251.217.92:8000/admin/dashboard/principal-insights', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const insights = await response.json();
        setData(insights);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
    toast.success('Dashboard refreshed!');
  };

  const handleExport = () => {
    toast.info('Export feature coming soon!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const getTrendIcon = (direction: string) => {
    if (direction === 'up') return <ArrowUp className="h-5 w-5 text-green-600" />;
    if (direction === 'down') return <ArrowDown className="h-5 w-5 text-red-600" />;
    return <Minus className="h-5 w-5 text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Principal's Dashboard</h1>
          <p className="text-gray-600">Teacher Performance & Professional Development Insights</p>
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
          <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* School Overview */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">School Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Teachers</p>
                <p className="text-3xl font-bold text-gray-900">{data.school_overview.total_teachers}</p>
                <p className="text-xs text-gray-500 mt-1">{data.school_overview.active_teachers} active</p>
              </div>
              <Users className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Participation Rate</p>
                <p className="text-3xl font-bold text-gray-900">{data.school_overview.participation_rate}%</p>
                <p className="text-xs text-gray-500 mt-1">{data.school_overview.total_assessments_completed} assessments</p>
              </div>
              <BarChart3 className="h-10 w-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">School Average</p>
                <p className="text-3xl font-bold text-gray-900">{data.school_overview.overall_average_score}%</p>
                <p className="text-xs text-gray-500 mt-1">Overall performance</p>
              </div>
              <Target className="h-10 w-10 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trend</p>
                <p className="text-3xl font-bold text-gray-900">{data.school_overview.improvement_trend > 0 ? '+' : ''}{data.school_overview.improvement_trend}%</p>
                <p className="text-xs text-gray-500 mt-1">vs last month</p>
              </div>
              {getTrendIcon(data.school_overview.trend_direction)}
            </div>
          </div>
        </div>
      </Card>

      {/* 5 Key Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QUESTION 1: Teachers Needing Attention */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">1. Teachers Needing Attention</h3>
              <p className="text-sm text-gray-600">{data.question_1_immediate_attention.count} teacher(s) require support</p>
            </div>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data.question_1_immediate_attention.teachers.length > 0 ? (
              data.question_1_immediate_attention.teachers.map((teacher, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    teacher.status === 'critical'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{teacher.name}</p>
                      <p className="text-sm text-gray-600">
                        Avg Score: {teacher.average_score}% | {teacher.weak_modules_count} weak areas
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {teacher.total_assessments} assessments completed
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        teacher.status === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {teacher.status === 'critical' ? 'Critical' : 'Needs Support'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                <p>All teachers are performing well!</p>
              </div>
            )}
          </div>
        </Card>

        {/* QUESTION 2: School Improvement */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 ${data.question_2_school_improvement.is_improving ? 'bg-green-100' : 'bg-red-100'} rounded-lg`}>
              {data.question_2_school_improvement.is_improving ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">2. Is School Improving?</h3>
              <p className="text-sm text-gray-600">
                {data.question_2_school_improvement.is_improving ? 'Yes, improving!' : 'Needs attention'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Current Month Average</span>
                <span className="text-2xl font-bold text-gray-900">
                  {data.question_2_school_improvement.current_month_avg}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: `${data.question_2_school_improvement.current_month_avg}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Previous Month Average</span>
                <span className="text-2xl font-bold text-gray-500">
                  {data.question_2_school_improvement.previous_month_avg}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gray-400 h-3 rounded-full"
                  style={{ width: `${data.question_2_school_improvement.previous_month_avg}%` }}
                ></div>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              data.question_2_school_improvement.improvement_rate > 0
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            } border-2`}>
              <p className="text-center">
                <span className="text-3xl font-bold">
                  {data.question_2_school_improvement.improvement_rate > 0 ? '+' : ''}
                  {data.question_2_school_improvement.improvement_rate}%
                </span>
              </p>
              <p className="text-center text-sm text-gray-600 mt-1">
                {data.question_2_school_improvement.total_assessments_this_month} assessments this month
              </p>
            </div>
          </div>
        </Card>

        {/* QUESTION 3: Training Investment */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">3. Where to Invest in Training?</h3>
              <p className="text-sm text-gray-600">Top {data.question_3_training_investment.priority_areas.length} priority areas</p>
            </div>
          </div>

          <div className="space-y-3">
            {data.question_3_training_investment.priority_areas.map((area, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{area.module_name}</p>
                    <p className="text-xs text-gray-600">
                      {area.teachers_below_60_percent}% teachers below 60%
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      area.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : area.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {area.priority.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Average Score:</span>
                  <span className="font-bold text-gray-900">{area.average_score}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      area.average_score < 60
                        ? 'bg-red-500'
                        : area.average_score < 70
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${area.average_score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* QUESTION 4: PD Program Effectiveness */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">4. Are PD Programs Working?</h3>
              <p className="text-sm text-gray-600">
                {data.question_4_pd_effectiveness.is_effective ? 'Yes, effective!' : 'Needs improvement'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Recommendations</p>
              <p className="text-2xl font-bold text-blue-900">{data.question_4_pd_effectiveness.total_recommendations}</p>
              <p className="text-xs text-gray-600 mt-1">
                {data.question_4_pd_effectiveness.acceptance_rate}% accepted
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-900">{data.question_4_pd_effectiveness.completed_courses}</p>
              <p className="text-xs text-gray-600 mt-1">courses finished</p>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            data.question_4_pd_effectiveness.is_effective
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          } border-2`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Improvement After Training</p>
                <p className="text-3xl font-bold text-gray-900">
                  +{data.question_4_pd_effectiveness.avg_improvement_after_training}%
                </p>
              </div>
              {data.question_4_pd_effectiveness.is_effective ? (
                <CheckCircle className="h-10 w-10 text-green-600" />
              ) : (
                <XCircle className="h-10 w-10 text-yellow-600" />
              )}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {data.question_4_pd_effectiveness.is_effective
                ? 'Training programs are making a positive impact'
                : 'Consider reviewing training program effectiveness'}
            </p>
          </div>
        </Card>

        {/* QUESTION 5: Recognition */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">5. Who Deserves Recognition?</h3>
              <p className="text-sm text-gray-600">{data.question_5_recognition.count} top performer(s)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.question_5_recognition.top_performers.length > 0 ? (
              data.question_5_recognition.top_performers.map((teacher, index) => (
                <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="h-6 w-6 text-yellow-600" />
                    <span className="text-xs font-medium text-gray-600">#{index + 1}</span>
                  </div>
                  <p className="font-bold text-gray-900 text-lg mb-1">{teacher.name}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Average:</span>
                      <span className="font-bold text-green-600">{teacher.average_score}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Assessments:</span>
                      <span className="font-medium text-gray-900">{teacher.total_assessments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Excellence:</span>
                      <span className="font-medium text-gray-900">{teacher.consistency}%</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-gray-500">
                <p>No top performers yet. Encourage teachers to take assessments!</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
