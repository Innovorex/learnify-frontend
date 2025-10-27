import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  BookOpen,
  Users,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Download,
  FileText,
  Calendar,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  duration_hours: number;
  difficulty_level: string;
  platform: string;
  provider: string;
  certificate_available: boolean;
  url: string;
  is_active: boolean;
}

interface Submission {
  id: number;
  teacher_id: number;
  teacher_name: string;
  module_id: number;
  module_name: string;
  file_path: string;
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
  ai_suggested_score: number | null;
  admin_validated_score: number | null;
  created_at: string;
  updated_at: string;
}

export const AdminCourseManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'courses' | 'submissions'>('submissions');

  // Courses state
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Submissions state
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [reviewScore, setReviewScore] = useState<number>(0);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    loadCourses();
    loadSubmissions();
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [filterStatus]);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://104.251.217.92:8000/courses/catalog', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      const token = localStorage.getItem('access_token');
      const statusParam = filterStatus === 'all' ? '' : `?status=${filterStatus}`;
      const response = await fetch(`http://104.251.217.92:8000/submission/admin/all${statusParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error('Error loading submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleReviewSubmission = async (submissionId: number, status: 'approved' | 'rejected', score: number) => {
    try {
      setReviewing(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://104.251.217.92:8000/submission/validate/${submissionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          admin_validated_score: status === 'approved' ? score : 0
        })
      });

      if (response.ok) {
        toast.success(`Submission ${status}!`);
        setSelectedSubmission(null);
        setReviewScore(0);
        await loadSubmissions();
      } else {
        toast.error('Failed to review submission');
      }
    } catch (error) {
      console.error('Error reviewing submission:', error);
      toast.error('Error reviewing submission');
    } finally {
      setReviewing(false);
    }
  };

  const viewFile = async (submissionId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://104.251.217.92:8000/submission/admin/file/${submissionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Get the blob and create a URL for it
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        toast.error('Failed to load file');
      }
    } catch (error) {
      console.error('Error viewing file:', error);
      toast.error('Error loading file');
    }
  };

  // Course statistics
  const courseStats = {
    total: courses.length,
    active: courses.filter(c => c.is_active).length,
    platforms: {
      diksha: courses.filter(c => c.platform === 'DIKSHA').length,
      swayam: courses.filter(c => c.platform === 'SWAYAM').length,
      ncert: courses.filter(c => c.platform === 'NCERT').length
    },
    avgDuration: courses.length > 0
      ? Math.round(courses.reduce((sum, c) => sum + c.duration_hours, 0) / courses.length)
      : 0
  };

  // Submission statistics
  const submissionStats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-700';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'DIKSHA':
        return 'bg-blue-100 text-blue-700';
      case 'SWAYAM':
        return 'bg-purple-100 text-purple-700';
      case 'NCERT':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Professional Development & Submissions</h1>
          <p className="text-sm text-gray-600">Manage CPD courses and review teacher submissions</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => { loadCourses(); loadSubmissions(); }}
            variant="ghost"
            className="border border-gray-300"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card className="p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'submissions'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Submission Review</span>
              {submissionStats.pending > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {submissionStats.pending}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'courses'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>CPD Courses</span>
            </div>
          </button>
        </div>
      </Card>

      {/* Submissions Tab */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          {/* Submission Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Submissions</p>
                  <p className="text-3xl font-bold text-blue-900">{submissionStats.total}</p>
                </div>
                <FileText className="h-12 w-12 text-blue-600" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800">Pending Review</p>
                  <p className="text-3xl font-bold text-orange-900">{submissionStats.pending}</p>
                  <p className="text-xs text-orange-600 mt-1">Needs attention</p>
                </div>
                <AlertCircle className="h-12 w-12 text-orange-600" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Approved</p>
                  <p className="text-3xl font-bold text-green-900">{submissionStats.approved}</p>
                </div>
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800">Rejected</p>
                  <p className="text-3xl font-bold text-red-900">{submissionStats.rejected}</p>
                </div>
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
            </Card>
          </div>

          {/* Filter Tabs */}
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'pending'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending ({submissionStats.pending})
              </button>
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({submissionStats.total})
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'approved'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Approved ({submissionStats.approved})
              </button>
              <button
                onClick={() => setFilterStatus('rejected')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rejected ({submissionStats.rejected})
              </button>
            </div>
          </Card>

          {/* Submissions List */}
          {loadingSubmissions ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : submissions.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {submissions.map((submission) => (
                <Card key={submission.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {submission.teacher_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{submission.teacher_name}</h3>
                          <p className="text-sm text-gray-600">{submission.module_name}</p>
                        </div>
                      </div>

                      {submission.notes && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{submission.notes}</p>
                        </div>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(submission.created_at).toLocaleDateString()}
                        </div>
                        {submission.admin_validated_score !== null && (
                          <div className="flex items-center">
                            <Target className="h-4 w-4 mr-1" />
                            Score: {submission.admin_validated_score}%
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          submission.status === 'pending'
                            ? 'bg-orange-100 text-orange-700'
                            : submission.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {submission.status.toUpperCase()}
                      </span>

                      <div className="flex space-x-2">
                        {submission.file_path && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => viewFile(submission.id)}
                            className="border border-gray-300"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View File
                          </Button>
                        )}
                        {submission.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setReviewScore(submission.ai_suggested_score || 75);
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No submissions found</p>
            </Card>
          )}
        </div>
      )}

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          {/* Course Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Courses</p>
                  <p className="text-3xl font-bold text-blue-900">{courseStats.total}</p>
                  <p className="text-xs text-blue-600 mt-1">{courseStats.active} active</p>
                </div>
                <BookOpen className="h-12 w-12 text-blue-600" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">DIKSHA</p>
                  <p className="text-3xl font-bold text-purple-900">{courseStats.platforms.diksha}</p>
                  <p className="text-xs text-purple-600 mt-1">courses</p>
                </div>
                <Users className="h-12 w-12 text-purple-600" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">SWAYAM</p>
                  <p className="text-3xl font-bold text-green-900">{courseStats.platforms.swayam}</p>
                  <p className="text-xs text-green-600 mt-1">courses</p>
                </div>
                <Award className="h-12 w-12 text-green-600" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800">Avg Duration</p>
                  <p className="text-3xl font-bold text-orange-900">{courseStats.avgDuration}h</p>
                  <p className="text-xs text-orange-600 mt-1">per course</p>
                </div>
                <Clock className="h-12 w-12 text-orange-600" />
              </div>
            </Card>
          </div>

          {/* Courses Grid */}
          {loadingCourses ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Card key={course.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPlatformColor(course.platform)}`}>
                      {course.platform}
                    </span>
                    {course.certificate_available && (
                      <Award className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{course.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium text-gray-900">{course.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium text-gray-900">{course.duration_hours}h</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Level:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty_level)}`}>
                        {course.difficulty_level}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => window.open(course.url, '_blank')}
                    variant="ghost"
                    size="sm"
                    className="w-full border border-gray-300"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Course
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Submission</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Teacher</p>
                  <p className="font-medium text-gray-900">{selectedSubmission.teacher_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Module</p>
                  <p className="font-medium text-gray-900">{selectedSubmission.module_name}</p>
                </div>
                {selectedSubmission.notes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Notes</p>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{selectedSubmission.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={reviewScore}
                  onChange={(e) => setReviewScore(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedSubmission(null);
                    setReviewScore(0);
                  }}
                  disabled={reviewing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleReviewSubmission(selectedSubmission.id, 'rejected', 0)}
                  disabled={reviewing}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleReviewSubmission(selectedSubmission.id, 'approved', reviewScore)}
                  disabled={reviewing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
