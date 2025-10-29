import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Users, TrendingUp, Award, AlertCircle } from 'lucide-react';
import type { AssessmentResults, K12Assessment } from '../types/k12';
import k12Api from '../services/k12Api';
import { useAuth } from '../contexts/AuthContext';

export const TeacherResultsPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [assessment, setAssessment] = useState<K12Assessment | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    if (assessmentId && user) {
      loadData();
    }
  }, [assessmentId, user]);

  const loadData = async () => {
    if (!assessmentId || !user) return;

    try {
      setLoading(true);

      // Load results
      const resultsData = await k12Api.getAssessmentResults(parseInt(assessmentId));
      setResults(resultsData);

      // Load questions to get total count
      const questions = await k12Api.getAssessmentQuestions(parseInt(assessmentId));
      setTotalQuestions(questions.length);

      // Load all teacher assessments to find this one
      const assessments = await k12Api.getTeacherAssessments(user.id);
      const foundAssessment = assessments.find(a => a.id === parseInt(assessmentId));
      if (foundAssessment) {
        setAssessment(foundAssessment);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const getScoreBadgeClass = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800 border-green-300';
    if (percentage >= 70) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  // Calculate highest and lowest scores from results
  const getHighestScore = () => {
    if (!results || results.results.length === 0) return 0;
    return Math.max(...results.results.map(r => (r.score / totalQuestions) * 100));
  };

  const getLowestScore = () => {
    if (!results || results.results.length === 0) return 0;
    return Math.min(...results.results.map(r => (r.score / totalQuestions) * 100));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No results found for this assessment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/teacher/k12/assessments')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assessments
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Assessment Results</h1>
        {assessment && (
          <p className="text-gray-600 mt-1">
            {assessment.subject} - {assessment.chapter} (Class{' '}
            {assessment.class_name}-{assessment.section})
          </p>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Total Students</p>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{results.total_students}</h3>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Average Score</p>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">
            {results.average_score.toFixed(1)}%
          </h3>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Highest Score</p>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">
            {getHighestScore().toFixed(0)}%
          </h3>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-sm text-gray-600">Lowest Score</p>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">
            {getLowestScore().toFixed(0)}%
          </h3>
        </div>
      </div>

      {/* Results Table */}
      {results.results.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No student has submitted this assessment yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Student Results</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.results
                  .sort((a, b) => b.score - a.score)
                  .map((student, index) => {
                    const percentage = (student.score / totalQuestions) * 100;
                    return (
                      <tr key={student.student_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full font-semibold text-sm">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.student_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {student.score}/{totalQuestions}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getScoreBadgeClass(
                              percentage
                            )}`}
                          >
                            {percentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(student.submitted_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
