import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Award,
  BookOpen,
  TrendingUp,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PerformanceSummary } from '@/types';
import apiService from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { CareerProgressionCard } from '@/components/CareerProgressionCard';

interface QuickActionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const QuickAction: React.FC<QuickActionProps> = ({
  icon: Icon,
  title,
  description,
  onClick,
  variant = 'primary',
}) => {
  const bgColor = variant === 'primary' ? 'bg-blue-600' : 'bg-green-600';
  const hoverColor = variant === 'primary' ? 'hover:bg-blue-700' : 'hover:bg-green-700';

  return (
    <button
      onClick={onClick}
      className={`${bgColor} ${hoverColor} text-white p-6 rounded-lg transition-colors text-left w-full group`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Icon className="w-6 h-6" />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <p className="text-blue-100 group-hover:text-white transition-colors">
            {description}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 opacity-70" />
      </div>
    </button>
  );
};

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  subtitle: string;
  iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  value,
  subtitle,
  iconColor,
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-lg ${iconColor}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get time-based greeting
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

export const DashboardPage: React.FC = () => {
  const [performance, setPerformance] = useState<PerformanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const data = await apiService.getPerformanceSummary();
        setPerformance(data);
      } catch (error: any) {
        console.error('Failed to fetch performance data:', error);
        if (error.response?.status !== 404) {
          toast.error('Failed to load performance data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, []);

  const handleStartAssessment = () => {
    navigate('/assessments');
  };

  const handleViewProgress = () => {
    navigate('/progress');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {getTimeBasedGreeting()}, {user?.name || 'Teacher'}!
        </h2>
        <p className="text-gray-600">
          Ready to continue your professional journey?
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={FileText}
          title="Total Assessments"
          value={performance?.module_scores?.length || 0}
          subtitle="Completed this year"
          iconColor="bg-blue-500"
        />
        <StatCard
          icon={Award}
          title="Average Score"
          value={performance ? `${Math.round(performance.overall_score)}%` : '0%'}
          subtitle="Overall performance"
          iconColor="bg-green-500"
        />
        <StatCard
          icon={Calendar}
          title="Last Assessment"
          value={performance?.overall_rating || 'Not started'}
          subtitle="December 15, 2024"
          iconColor="bg-purple-500"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <p className="text-gray-600">Common tasks and shortcuts</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickAction
              icon={FileText}
              title="Start New Assessment"
              description="Begin your next evaluation"
              onClick={handleStartAssessment}
              variant="primary"
            />
            <QuickAction
              icon={TrendingUp}
              title="View Progress"
              description="Check your improvement trends"
              onClick={handleViewProgress}
              variant="secondary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Assessments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Assessments</h3>
              <p className="text-gray-600">Your latest evaluation results</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/assessments')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {performance && performance.module_scores.length > 0 ? (
            <div className="space-y-4">
              {performance.module_scores.slice(0, 3).map((moduleScore) => (
                <div
                  key={moduleScore.module_id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {moduleScore.module_name}
                      </h4>
                      <p className="text-sm text-gray-600 capitalize">
                        {moduleScore.assessment_type} Assessment
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {Math.round(moduleScore.score)}%
                    </p>
                    <p className={`text-sm ${
                      moduleScore.rating === 'Excellent'
                        ? 'text-green-600'
                        : moduleScore.rating === 'Good'
                        ? 'text-blue-600'
                        : 'text-yellow-600'
                    }`}>
                      {moduleScore.rating}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No assessments completed yet</p>
              <Button onClick={handleStartAssessment} className="mt-4">
                Start Your First Assessment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Career Progression Card */}
      <CareerProgressionCard />
    </div>
  );
};