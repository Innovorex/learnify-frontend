import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Calendar, Clock, AlertCircle, BookOpen, TrendingUp, Award } from 'lucide-react';
import type { AssessmentStatus, K12Result } from '../types/k12';
import k12Api from '../services/k12Api';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [nextExam, setNextExam] = useState<AssessmentStatus | null>(null);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [averageScore, setAverageScore] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  useEffect(() => {
    if (!nextExam) return;

    const timer = setInterval(() => {
      const now = new Date();
      const startTime = new Date(nextExam.start_time);
      const endTime = new Date(nextExam.end_time);
      const diff = startTime.getTime() - now.getTime();

      if (now >= startTime && now <= endTime) {
        setTimeRemaining('Available Now!');
      } else if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining('Exam Ended');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextExam]);

  const loadDashboardData = async () => {
    if (!user || !user.class_name || !user.section) {
      toast.error('Student information missing');
      return;
    }

    try {
      setLoading(true);

      // Load assessments with status
      const assessments = await k12Api.getAssessmentsWithStatus(
        user.id,
        user.class_name,
        user.section
      );

      // Filter for upcoming assessments (scheduled and available, but NOT completed)
      const upcomingAssessments = assessments.filter(
        (a: AssessmentStatus) =>
          a.status === 'available' || a.status === 'scheduled' &&
          new Date(a.end_time) > new Date()
      );
      setUpcomingCount(upcomingAssessments.length);

      // Find the closest upcoming exam
      const now = new Date();
      const upcoming = upcomingAssessments
        .filter((a: AssessmentStatus) => new Date(a.end_time) > now)
        .sort(
          (a: AssessmentStatus, b: AssessmentStatus) =>
            new Date(a.start_time).getTime() -
            new Date(b.start_time).getTime()
        );

      if (upcoming.length > 0) {
        setNextExam(upcoming[0]);
      }

      // Count completed assessments
      const completed = assessments.filter((a: AssessmentStatus) => a.status === 'completed');
      setCompletedCount(completed.length);

      // Calculate average score from completed assessments
      if (completed.length > 0 && completed[0].score !== undefined) {
        const avg = Math.round(
          completed.reduce(
            (acc: number, a: AssessmentStatus) =>
              acc + ((a.score || 0) / (a.total_questions || 1)) * 100,
            0
          ) / completed.length
        );
        setAverageScore(avg);
      }
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStartExam = () => {
    if (nextExam && timeRemaining === 'Available Now!') {
      navigate(`/student/assessment/${nextExam.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Good morning, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Ready to ace your assessments today?
        </p>
        <p className="text-gray-500 mt-1">
          Class {user?.class_name}-{user?.section}
        </p>
      </div>

      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-semibold mb-2">Welcome, {user?.name}!</h2>
        <p className="text-blue-100">Class {user?.class_name}-{user?.section}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tests Taken</p>
              <p className="text-3xl font-bold text-gray-900">{completedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-3xl font-bold text-gray-900">{averageScore.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-gray-900">{upcomingCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Exam Card */}
      {nextExam ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4">
            <div className="flex items-center gap-2 text-white">
              <Calendar className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Next Assessment</h3>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Subject</p>
                <p className="text-lg font-medium text-gray-900">
                  {nextExam.subject}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Chapter</p>
                <p className="text-lg font-medium text-gray-900">
                  {nextExam.chapter}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Start Time</p>
                <p className="text-lg font-medium text-gray-900">
                  {formatDate(nextExam.start_time)},{' '}
                  {formatTime(nextExam.start_time)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Duration</p>
                <p className="text-lg font-medium text-gray-900">
                  {nextExam.duration_minutes} minutes
                </p>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock
                  className={`h-5 w-5 ${
                    timeRemaining === 'Available Now!'
                      ? 'text-green-600'
                      : timeRemaining === 'Exam Ended'
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`}
                />
                <p className="text-sm text-gray-600">Time Remaining</p>
              </div>
              <p
                className={`text-3xl mb-4 font-semibold ${
                  timeRemaining === 'Available Now!'
                    ? 'text-green-600'
                    : timeRemaining === 'Exam Ended'
                    ? 'text-red-600'
                    : 'text-blue-600'
                }`}
              >
                {timeRemaining}
              </p>
              <button
                onClick={handleStartExam}
                disabled={timeRemaining !== 'Available Now!'}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  timeRemaining === 'Available Now!'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : timeRemaining === 'Exam Ended'
                    ? 'bg-red-100 text-red-700 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-700 cursor-not-allowed'
                }`}
              >
                {timeRemaining === 'Available Now!'
                  ? 'Start Exam'
                  : timeRemaining === 'Exam Ended'
                  ? 'Exam Ended'
                  : 'Exam Not Started'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <BookOpen className="w-16 h-16 text-gray-400" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Assessments Yet
              </h3>
              <p className="text-gray-600">
                Your teacher hasn't created any assessments yet. Check back later!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Exam Guidelines */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Exam Guidelines</h3>
        </div>
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">
                  Important Instructions
                </h4>
                <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
                  <li>Ensure you have a stable internet connection</li>
                  <li>You can navigate between questions using Next/Previous buttons</li>
                  <li>Your answers are saved automatically</li>
                  <li>Once submitted, you cannot modify your answers</li>
                  <li>Do not refresh the page during the exam</li>
                  <li>The exam will auto-submit when time expires</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
