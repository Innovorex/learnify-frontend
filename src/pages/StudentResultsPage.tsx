import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, TrendingUp, Award, Calendar, BookOpen } from 'lucide-react';
import k12Api from '../services/k12Api';
import type { K12Result } from '../types/k12';

export const StudentResultsPage: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<K12Result[]>([]);
  const [selectedResult, setSelectedResult] = useState<K12Result | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyResults();
  }, [user]);

  const fetchMyResults = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const resultsData = await k12Api.getStudentResults(user.id);
      setResults(resultsData);
    } catch (error: any) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800 border-green-300';
    if (percentage >= 70) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (percentage >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const averageScore =
    results.length > 0
      ? Math.round(
          results.reduce((acc, r) => acc + (r.score / r.total) * 100, 0) / results.length
        )
      : 0;

  const bestScore =
    results.length > 0
      ? Math.max(...results.map((r) => (r.score / r.total) * 100))
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Results</h1>
        <p className="text-gray-600 mt-1">View your assessment performance</p>
      </div>

      {results.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            No exam results yet. Take your first assessment!
          </p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">Average Score</p>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{averageScore}%</h3>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Award className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Best Score</p>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{Math.round(bestScore)}%</h3>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600">Exams Taken</p>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{results.length}</h3>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Assessment History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assessment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((result) => {
                    const percentage = Math.round((result.score / result.total) * 100);
                    return (
                      <tr key={result.assessment_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          AS{result.assessment_id.toString().padStart(3, '0')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.subject} - {result.chapter}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.score}/{result.total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getScoreColor(
                              percentage
                            )}`}
                          >
                            {percentage}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(result.submitted_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => {
                              setSelectedResult(result);
                              setShowDetailsDialog(true);
                            }}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Details Modal */}
      {showDetailsDialog && selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Assessment Details
              </h2>
              <p className="text-gray-600 mt-1">
                Assessment #{selectedResult.assessment_id}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Score Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Score</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedResult.score}/{selectedResult.total}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Percentage</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.round((selectedResult.score / selectedResult.total) * 100)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date</p>
                    <p className="text-lg text-gray-900">
                      {formatDate(selectedResult.submitted_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Remarks:</span>{' '}
                  {((selectedResult.score / selectedResult.total) * 100) >= 90
                    ? 'Excellent performance! Keep up the great work!'
                    : ((selectedResult.score / selectedResult.total) * 100) >= 70
                    ? 'Good performance! Review the questions you missed.'
                    : 'Keep practicing. Review the chapter materials.'}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetailsDialog(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
