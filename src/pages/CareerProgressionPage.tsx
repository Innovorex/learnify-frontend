import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Lock,
  CheckCircle,
  PlayCircle,
  ArrowLeft,
  Award,
  Clock,
  Loader2,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import apiService from '@/services/api';
import { CourseModule } from '@/types';
import { toast } from 'sonner';

export const CareerProgressionPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCourseModules(parseInt(courseId!));
      setCourse(data.course);
      setModules(data.modules);

      // Check if all modules are completed and fetch certificate
      const allCompleted = data.modules.every((m: CourseModule) => m.status === 'completed');
      if (allCompleted && data.course.enrollment_id) {
        fetchCertificate(data.course.enrollment_id);
      }
    } catch (error: any) {
      console.error('Failed to fetch course data:', error);
      toast.error('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCertificate = async (enrollmentId: number) => {
    try {
      const certData = await apiService.getCertificate(enrollmentId);
      setCertificate(certData);
      console.log('Certificate fetched:', certData);
    } catch (error) {
      console.error('Failed to fetch certificate:', error);
    }
  };

  const handleDownloadCertificate = () => {
    if (certificate) {
      toast.success(`Certificate ${certificate.certificate_number} is ready!`);
      // TODO: Implement actual PDF download when backend generates PDFs
      alert(`Certificate Number: ${certificate.certificate_number}\nVerification Code: ${certificate.verification_code}\n\nPDF generation coming soon!`);
    }
  };

  const handleModuleClick = (module: CourseModule) => {
    if (module.is_locked) {
      toast.warning('Complete previous modules to unlock this one');
      return;
    }
    navigate(`/career-progression/module/${module.id}`);
  };

  const getModuleStatusIcon = (module: CourseModule) => {
    if (module.status === 'completed' && module.passed) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
    if (module.status === 'in_progress') {
      return <PlayCircle className="w-5 h-5 text-blue-600" />;
    }
    if (module.is_locked) {
      return <Lock className="w-5 h-5 text-gray-400" />;
    }
    return <BookOpen className="w-5 h-5 text-gray-600" />;
  };

  const getModuleStatusText = (module: CourseModule) => {
    if (module.status === 'completed' && module.passed) {
      return { text: 'Completed', color: 'text-green-600' };
    }
    if (module.status === 'in_progress') {
      return { text: 'In Progress', color: 'text-blue-600' };
    }
    if (module.is_locked) {
      return { text: 'Locked', color: 'text-gray-400' };
    }
    return { text: 'Not Started', color: 'text-gray-600' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Course not found</p>
        <Button onClick={() => navigate('/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const completedModules = modules.filter((m) => m.status === 'completed' && m.passed).length;
  const progressPercentage = (completedModules / modules.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="outline"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-8 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <GraduationCap className="w-8 h-8" />
                <h1 className="text-3xl font-bold">{course.name}</h1>
              </div>
              <p className="text-purple-100 mb-4">{course.university}</p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration_months} months</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{modules.length} modules</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4" />
                  <span>{completedModules} completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-purple-400 bg-opacity-30 rounded-full h-3">
              <div
                className="bg-white h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Course Description */}
      {course.description && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">About This Course</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{course.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Modules List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Course Modules</h3>
          <p className="text-gray-600">Complete modules in sequence to progress</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {modules.map((module) => {
              const statusIcon = getModuleStatusIcon(module);
              const statusInfo = getModuleStatusText(module);

              return (
                <button
                  key={module.id}
                  onClick={() => handleModuleClick(module)}
                  disabled={module.is_locked}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    module.is_locked
                      ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-60'
                      : module.status === 'completed' && module.passed
                      ? 'bg-green-50 border-green-200 hover:border-green-300'
                      : module.status === 'in_progress'
                      ? 'bg-blue-50 border-blue-200 hover:border-blue-300'
                      : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          module.is_locked
                            ? 'bg-gray-200'
                            : module.status === 'completed' && module.passed
                            ? 'bg-green-100'
                            : module.status === 'in_progress'
                            ? 'bg-blue-100'
                            : 'bg-gray-100'
                        }`}
                      >
                        {statusIcon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Module {module.module_number}: {module.module_name}
                        </h4>
                        <p className={`text-sm ${statusInfo.color}`}>
                          {statusInfo.text}
                          {module.exam_score !== null && module.exam_score !== undefined && (
                            <span className="ml-2">• Score: {Math.round(module.exam_score)}%</span>
                          )}
                        </p>
                        {module.duration_weeks && (
                          <p className="text-xs text-gray-500 mt-1">
                            Duration: {module.duration_weeks} weeks
                          </p>
                        )}
                      </div>
                    </div>
                    {!module.is_locked && (
                      <div className="text-blue-600">
                        <PlayCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Course Completion */}
      {completedModules === modules.length && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Congratulations! Course Completed
                  </h4>
                  {certificate ? (
                    <div className="text-gray-600 text-sm mt-1">
                      <p>Certificate Number: <span className="font-mono font-semibold">{certificate.certificate_number}</span></p>
                      <p className="text-xs mt-0.5">Verification Code: {certificate.verification_code}</p>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">
                      You have successfully completed all modules. Your certificate is ready!
                    </p>
                  )}
                </div>
              </div>
              {certificate && (
                <Button
                  onClick={handleDownloadCertificate}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  View Certificate
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
