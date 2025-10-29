import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Calendar, Clock, BookOpen } from 'lucide-react';
import k12Api from '../services/k12Api';
import type { AssessmentStatus } from '../types/k12';

export const StudentAssessmentsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<AssessmentStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, [user]);

  const fetchAssessments = async () => {
    if (!user || !user.class_name || !user.section) {
      toast.error('Class and section information not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const assessmentsData = await k12Api.getAssessmentsWithStatus(
        user.id,
        user.class_name,
        user.section
      );
      setAssessments(assessmentsData);
    } catch (error: any) {
      console.error('Error loading assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border border-green-300';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border border-gray-300';
      case 'missed':
        return 'bg-red-100 text-red-800 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };

  const getStatusLabel = (assessment: AssessmentStatus) => {
    switch (assessment.status) {
      case 'available':
        return 'Available Now';
      case 'scheduled':
        return 'Scheduled';
      case 'completed':
        return 'Completed';
      case 'missed':
        return 'Missed';
      default:
        return 'Unknown';
    }
  };

  const handleStartExam = (assessmentId: number) => {
    navigate(`/student/assessment/${assessmentId}`);
  };

  const handleViewResult = () => {
    navigate('/student/results');
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const isAvailableNow = (assessment: AssessmentStatus) => {
    const now = new Date();
    const startTime = new Date(assessment.start_time);
    const endTime = new Date(assessment.end_time);
    return now >= startTime && now <= endTime && assessment.status === 'available' || assessment.status === 'scheduled';
  };

  const isScheduled = (assessment: AssessmentStatus) => {
    const now = new Date();
    const startTime = new Date(assessment.start_time);
    return now < startTime && assessment.status === 'available' || assessment.status === 'scheduled';
  };

  const isMissed = (assessment: AssessmentStatus) => {
    const now = new Date();
    const endTime = new Date(assessment.end_time);
    return now > endTime && assessment.status === 'available' || assessment.status === 'scheduled';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading assessments...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Assessments</h1>
        <p className="text-gray-600 mt-1">
          View all your assessments - available, scheduled, completed, and missed
        </p>
      </div>

      {assessments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No assessments found for your class</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessments.filter((a) => a).map((assessment) => {
            const startDateTime = formatDateTime(assessment.start_time);
            const endDateTime = formatDateTime(assessment.end_time);

            return (
              <div
                key={assessment.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {assessment.subject}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {assessment.chapter}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                        assessment.status
                      )}`}
                    >
                      {getStatusLabel(assessment)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Start: {startDateTime.date} at {startDateTime.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        End: {endDateTime.date} at {endDateTime.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Duration: {assessment.duration_minutes} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="h-4 w-4" />
                      <span>
                        ID: AS{assessment.id.toString().padStart(3, '0')}
                      </span>
                    </div>
                    {assessment.status === 'completed' &&
                      assessment.score !== undefined && (
                        <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                          <span>
                            Score: {assessment.score}/{assessment.total_questions}
                          </span>
                        </div>
                      )}
                  </div>

                  {isAvailableNow(assessment) && (
                    <button
                      onClick={() => handleStartExam(assessment.id)}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                    >
                      Start Now
                    </button>
                  )}
                  {assessment.status === 'completed' && (
                    <button
                      onClick={handleViewResult}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      View Result
                    </button>
                  )}
                  {isScheduled(assessment) && (
                    <button
                      disabled
                      className="w-full bg-yellow-100 text-yellow-800 py-2 px-4 rounded-lg font-semibold cursor-not-allowed"
                    >
                      Starts {startDateTime.time}
                    </button>
                  )}
                  {isMissed(assessment) && (
                    <button
                      disabled
                      className="w-full bg-red-100 text-red-800 py-2 px-4 rounded-lg font-semibold cursor-not-allowed"
                    >
                      Expired
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
