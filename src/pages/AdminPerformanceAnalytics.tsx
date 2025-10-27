import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Award,
  Target,
  Download,
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface PerformanceData {
  overall_stats: {
    total_assessments: number;
    overall_average: number;
    this_month_avg: number;
    last_month_avg: number;
    month_change: number;
  };
  module_performance: Array<{
    module: string;
    average_score: number;
    total_assessments: number;
    teachers_assessed: number;
    teachers_below_60: number;
    below_60_percent: number;
  }>;
  teacher_distribution: {
    excellent: number;
    good: number;
    needs_support: number;
    critical: number;
  };
  monthly_trends: Array<{
    month: string;
    average_score: number;
    assessments_count: number;
  }>;
  competency_gaps: Array<{
    module: string;
    average_score: number;
    below_60_percent: number;
  }>;
  top_improvements: Array<{
    teacher_name: string;
    improvement: number;
    current_score: number;
  }>;
}

export const AdminPerformanceAnalytics: React.FC = () => {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://104.251.217.92:8000/admin/reports/performance', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const apiData = await response.json();
        setData(apiData);
      } else {
        toast.error('Failed to load performance data');
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
      toast.error('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPerformanceData();
    setRefreshing(false);
    toast.success('Data refreshed!');
  };

  const exportReport = () => {
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
        <p className="text-gray-500">No performance data available</p>
      </div>
    );
  }

  const totalTeachers = data.teacher_distribution.excellent +
                        data.teacher_distribution.good +
                        data.teacher_distribution.needs_support +
                        data.teacher_distribution.critical;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-sm text-gray-600">Comprehensive insights into teacher performance and competency development</p>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">Total Assessments</p>
              <p className="text-3xl font-bold text-blue-900">{data.overall_stats.total_assessments}</p>
              <p className="text-xs text-blue-600 mt-1">Completed</p>
            </div>
            <BarChart3 className="h-12 w-12 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">School Average</p>
              <p className="text-3xl font-bold text-green-900">{data.overall_stats.overall_average}%</p>
              <p className="text-xs text-green-600 mt-1">Overall performance</p>
            </div>
            <Target className="h-12 w-12 text-green-600" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">This Month</p>
              <p className="text-3xl font-bold text-purple-900">{data.overall_stats.this_month_avg}%</p>
              <p className="text-xs text-purple-600 mt-1">Current average</p>
            </div>
            <TrendingUp className="h-12 w-12 text-purple-600" />
          </div>
        </Card>

        <Card className={`p-6 bg-gradient-to-br ${
          data.overall_stats.month_change >= 0
            ? 'from-green-50 to-emerald-100 border-green-200'
            : 'from-red-50 to-red-100 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${data.overall_stats.month_change >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                Monthly Change
              </p>
              <p className={`text-3xl font-bold ${data.overall_stats.month_change >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {data.overall_stats.month_change > 0 ? '+' : ''}{data.overall_stats.month_change}%
              </p>
              <p className={`text-xs mt-1 ${data.overall_stats.month_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                vs last month
              </p>
            </div>
            {data.overall_stats.month_change >= 0 ? (
              <TrendingUp className="h-12 w-12 text-green-600" />
            ) : (
              <TrendingDown className="h-12 w-12 text-red-600" />
            )}
          </div>
        </Card>
      </div>

      {/* Performance Trends Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">6-Month Performance Trend</h3>
          <BarChart3 className="h-5 w-5 text-gray-400" />
        </div>
        {data.monthly_trends.length > 0 ? (
          <div className="space-y-4">
            {data.monthly_trends.map((trend, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-20 text-sm font-medium text-gray-700">{trend.month}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{trend.assessments_count} assessments</span>
                    <span className="text-sm font-bold text-gray-900">{trend.average_score}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        trend.average_score >= 75 ? 'bg-green-500' :
                        trend.average_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${trend.average_score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No trend data available yet</p>
        )}
      </Card>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NPST Module Performance */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">NPST Module Performance</h3>
            <Target className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {data.module_performance.map((module, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{module.module}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">{module.average_score}%</span>
                    {module.average_score >= 75 ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : module.average_score >= 60 ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full ${
                      module.average_score >= 75 ? 'bg-green-500' :
                      module.average_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${module.average_score}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{module.teachers_assessed} teachers assessed</span>
                  <span className={module.below_60_percent > 30 ? 'text-red-600 font-medium' : ''}>
                    {module.below_60_percent}% below 60%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Teacher Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Teacher Performance Distribution</h3>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {/* Excellent */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-900">Excellent (85-100%)</span>
                </div>
                <span className="text-2xl font-bold text-green-700">{data.teacher_distribution.excellent}</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${(data.teacher_distribution.excellent / totalTeachers) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-green-700 mt-1">
                {totalTeachers > 0 ? Math.round((data.teacher_distribution.excellent / totalTeachers) * 100) : 0}% of teachers
              </p>
            </div>

            {/* Good */}
            <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-gray-900">Good (70-84%)</span>
                </div>
                <span className="text-2xl font-bold text-blue-700">{data.teacher_distribution.good}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(data.teacher_distribution.good / totalTeachers) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                {totalTeachers > 0 ? Math.round((data.teacher_distribution.good / totalTeachers) * 100) : 0}% of teachers
              </p>
            </div>

            {/* Needs Support */}
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-gray-900">Needs Support (60-69%)</span>
                </div>
                <span className="text-2xl font-bold text-yellow-700">{data.teacher_distribution.needs_support}</span>
              </div>
              <div className="w-full bg-yellow-200 rounded-full h-2">
                <div
                  className="bg-yellow-600 h-2 rounded-full"
                  style={{ width: `${(data.teacher_distribution.needs_support / totalTeachers) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                {totalTeachers > 0 ? Math.round((data.teacher_distribution.needs_support / totalTeachers) * 100) : 0}% of teachers
              </p>
            </div>

            {/* Critical */}
            <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-lg p-4 border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-gray-900">Critical (&lt;60%)</span>
                </div>
                <span className="text-2xl font-bold text-red-700">{data.teacher_distribution.critical}</span>
              </div>
              <div className="w-full bg-red-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{ width: `${(data.teacher_distribution.critical / totalTeachers) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-red-700 mt-1">
                {totalTeachers > 0 ? Math.round((data.teacher_distribution.critical / totalTeachers) * 100) : 0}% of teachers
              </p>
            </div>
          </div>
        </Card>

        {/* Competency Gaps */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Priority Training Areas</h3>
            <AlertTriangle className="h-5 w-5 text-gray-400" />
          </div>
          {data.competency_gaps.length > 0 ? (
            <div className="space-y-3">
              {data.competency_gaps.map((gap, index) => (
                <div key={index} className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{gap.module}</span>
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      HIGH PRIORITY
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Average Score:</span>
                    <span className="font-bold text-red-600">{gap.average_score}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">Teachers below 60%:</span>
                    <span className="font-bold text-red-600">{gap.below_60_percent}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-2" />
              <p className="text-gray-500">No critical gaps! All modules performing well.</p>
            </div>
          )}
        </Card>

        {/* Top Improvements */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Improvement Highlights</h3>
            <Award className="h-5 w-5 text-gray-400" />
          </div>
          {data.top_improvements.length > 0 ? (
            <div className="space-y-3">
              {data.top_improvements.map((teacher, index) => (
                <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <span className="font-medium text-gray-900">{teacher.teacher_name}</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">+{teacher.improvement}%</span>
                  </div>
                  <div className="text-xs text-gray-600 ml-11">
                    Current score: <span className="font-medium">{teacher.current_score}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No improvement data available yet</p>
          )}
        </Card>
      </div>
    </div>
  );
};
