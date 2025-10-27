import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Award,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import apiService from '@/services/api';
import { CareerRecommendation, CourseEnrollment } from '@/types';
import { toast } from 'sonner';

export const CPDCoursesPage: React.FC = () => {
  const [recommendation, setRecommendation] = useState<CareerRecommendation | null>(null);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get recommendation
      const rec = await apiService.getCareerRecommendation();
      setRecommendation(rec);

      // Get enrolled courses
      const courses = await apiService.getMyCourses();
      setEnrollments(courses);
    } catch (error: any) {
      console.error('Failed to fetch CPD data:', error);
      toast.error('Failed to load CPD courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!recommendation?.recommended_course) return;

    try {
      setEnrolling(true);
      await apiService.enrollInCareerCourse(recommendation.recommended_course.id);
      toast.success('Successfully enrolled in course!');
      await fetchData();
    } catch (error: any) {
      console.error('Enrollment failed:', error);
      if (error.response?.data?.detail?.includes('already enrolled')) {
        toast.info('You are already enrolled in this course');
        await fetchData();
      } else {
        toast.error('Failed to enroll in course');
      }
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CPD Courses</h1>
        <p className="text-gray-600 mt-1">
          Continuous Professional Development - Enhance your qualifications
        </p>
      </div>

      {/* Recommended Course */}
      {recommendation?.recommended_course && (
        <Card>
          <CardContent className="pt-6">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6 border-2 border-purple-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {recommendation.recommended_course.name}
                    </h4>
                    <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4" />
                        <span>{recommendation.recommended_course.university}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>{recommendation.recommended_course.duration_months} months</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{recommendation.recommended_course.total_modules} modules</span>
                      </div>
                    </div>
                  </div>
                </div>
                {!enrollments.find(e => e.course.id === recommendation.recommended_course?.id) && (
                  <Button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                  >
                    {enrolling ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4 mr-2" />
                        Enroll Now
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enrolled Courses */}
      {enrollments.length > 0 ? (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">My Enrolled Courses</h3>
            <p className="text-gray-600">Your ongoing professional development courses</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <button
                  key={enrollment.enrollment_id}
                  onClick={() => navigate(`/career-progression/${enrollment.course.id}`)}
                  className="w-full text-left p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {enrollment.course.name}
                        </h4>
                        <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="w-4 h-4" />
                            <span>{enrollment.course.university}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4" />
                            <span>
                              {enrollment.modules_completed} / {enrollment.total_modules} modules
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              enrollment.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {enrollment.status === 'completed' ? 'Completed' : 'In Progress'}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Progress</span>
                            <span className="text-sm font-medium text-gray-900">
                              {Math.round(enrollment.progress_percentage)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${enrollment.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        !recommendation?.recommended_course && (
          <Card>
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No CPD Courses Available
              </h3>
              <p className="text-gray-600">
                {recommendation?.message || 'You are already fully qualified!'}
              </p>
            </CardContent>
          </Card>
        )
      )}

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h4 className="font-semibold text-gray-900 mb-2">About CPD Courses</h4>
          <p className="text-gray-700 text-sm leading-relaxed">
            Continuous Professional Development (CPD) courses help you advance your teaching career.
            Complete modules with study materials and videos, pass exams, and earn recognized qualifications.
            All courses are <span className="font-semibold">100% free</span> and self-paced.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
