import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Award, Target, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { PerformanceSummary, ProgressEntry } from '@/types';
import apiService from '@/services/api';
import { toast } from 'sonner';

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, subtitle, color }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ProgressPage: React.FC = () => {
  const [performance, setPerformance] = useState<PerformanceSummary | null>(null);
  const [progress, setProgress] = useState<ProgressEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [performanceData, progressData] = await Promise.all([
          apiService.getPerformanceSummary(),
          apiService.getProgress(),
        ]);
        setPerformance(performanceData);
        setProgress(progressData);
      } catch (error) {
        console.error('Failed to fetch progress data:', error);
        toast.error('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Prepare chart data
  const moduleScoresData = performance?.module_scores.map(score => ({
    name: score.module_name.split(' ').slice(0, 3).join(' '), // Shorten names
    score: score.score,
    rating: score.rating,
  })) || [];

  const timelineData = progress?.timeline.slice(-10).map(entry => ({
    date: new Date(entry.date).toLocaleDateString(),
    score: entry.score,
    module: entry.module_name.split(' ').slice(0, 2).join(' '),
  })) || [];

  const breakdownData = performance ? [
    { name: 'MCQ Assessments', value: performance.weighted_breakdown.mcq, color: '#3B82F6' },
    { name: 'Submissions', value: performance.weighted_breakdown.submission, color: '#10B981' },
    { name: 'Outcomes', value: performance.weighted_breakdown.outcome, color: '#8B5CF6' },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Progress Tracking
        </h1>
        <p className="text-gray-600">
          Monitor your teaching evaluation progress and improvement trends over time.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={Award}
          title="Overall Score"
          value={performance ? `${Math.round(performance.overall_score)}%` : '0%'}
          subtitle={performance?.overall_rating || 'Not available'}
          color="bg-blue-500"
        />
        <StatCard
          icon={TrendingUp}
          title="Assessments"
          value={progress?.total_assessments || 0}
          subtitle="Completed"
          color="bg-green-500"
        />
        <StatCard
          icon={Target}
          title="Percentile"
          value={performance ? `${Math.round(performance.benchmark.teacher_percentile)}th` : '50th'}
          subtitle="Among peers"
          color="bg-purple-500"
        />
        <StatCard
          icon={Calendar}
          title="Cohort Size"
          value={performance?.benchmark.cohort_size || 0}
          subtitle="Similar teachers"
          color="bg-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Timeline */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Progress Timeline</h3>
            <p className="text-gray-600">Your assessment scores over time</p>
          </CardHeader>
          <CardContent>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No progress data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Breakdown */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Performance Breakdown</h3>
            <p className="text-gray-600">Scores by assessment type</p>
          </CardHeader>
          <CardContent>
            {breakdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={breakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {breakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${Math.round(Number(value))}%`, 'Score']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No breakdown data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Module Scores */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Module Performance</h3>
          <p className="text-gray-600">Your scores across different evaluation modules</p>
        </CardHeader>
        <CardContent>
          {moduleScoresData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={moduleScoresData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Complete some assessments to see your module performance
            </div>
          )}
        </CardContent>
      </Card>

      {/* Benchmark Information */}
      {performance && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Peer Comparison</h3>
            <p className="text-gray-600">How you compare to similar teachers</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round(performance.benchmark.teacher_percentile)}th
                </div>
                <div className="text-sm text-gray-600">Percentile</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {performance.benchmark.cohort_size}
                </div>
                <div className="text-sm text-gray-600">Similar Teachers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {performance.benchmark.cohort_definition.board}
                </div>
                <div className="text-sm text-gray-600">Board/System</div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Comparison Group:</strong> Teachers in {performance.benchmark.cohort_definition.board} board
                teaching {performance.benchmark.cohort_definition.grades_teaching} grades
                in {performance.benchmark.cohort_definition.subjects_teaching}.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};