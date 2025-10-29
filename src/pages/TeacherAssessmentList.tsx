import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import {
  Plus,
  Eye,
  BarChart3,
  Calendar,
  Clock,
  Users,
  BookOpen,
} from 'lucide-react';
import type { K12Assessment } from '../types/k12';
import k12Api from '../services/k12Api';

export const TeacherAssessmentList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<K12Assessment[]>([]);

  useEffect(() => {
    loadAssessments();
  }, [user]);

  const loadAssessments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await k12Api.getTeacherAssessments(user.id);
      setAssessments(data);
    } catch (error: any) {
      console.error('Error loading assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (assessment: K12Assessment) => {
    const status = k12Api.getAssessmentStatusLabel(assessment);

    switch (status) {
      case 'active':
        return (
          <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            Active
          </span>
        );
      case 'upcoming':
        return (
          <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
            Upcoming
          </span>
        );
      case 'ended':
        return (
          <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
            Ended
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Student Assessments
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your student assessments
          </p>
        </div>
        <button
          onClick={() => navigate('/teacher/k12/create')}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Create Assessment
        </button>
      </div>

      {/* Assessments List */}
      {assessments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Assessments Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first student assessment to get started
          </p>
          <button
            onClick={() => navigate('/teacher/k12/create')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            Create Assessment
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class & Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chapter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assessments.map((assessment) => (
                <tr key={assessment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {assessment.subject}
                      </div>
                      <div className="text-sm text-gray-500">
                        Class {assessment.class_name}-{assessment.section}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {assessment.chapter}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      {k12Api.formatAssessmentDate(assessment.start_time)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock className="w-4 h-4 mr-1" />
                      {assessment.duration_minutes} min
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(assessment)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          navigate(
                            `/teacher/k12/assessment/${assessment.id}/questions`
                          )
                        }
                        className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Questions"
                      >
                        <Eye className="w-4 h-4" />
                        Questions
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/teacher/k12/results/${assessment.id}`)
                        }
                        className="flex items-center gap-1 px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="View Results"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Results
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
