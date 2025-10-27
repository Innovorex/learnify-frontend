import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import apiService from '@/services/api';
import { CareerRecommendation, CourseEnrollment } from '@/types';
import { toast } from 'sonner';

export const CareerProgressionCard: React.FC = () => {
  const [recommendation, setRecommendation] = useState<CareerRecommendation | null>(null);
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCareerData();
  }, []);

  const fetchCareerData = async () => {
    try {
      setLoading(true);

      // Get recommendation
      const rec = await apiService.getCareerRecommendation();
      setRecommendation(rec);

      // Check if already enrolled
      if (rec.recommended_course) {
        const enrollments = await apiService.getMyCourses();
        const activeEnrollment = enrollments.find(
          (e) => e.course.id === rec.recommended_course?.id && e.status === 'in_progress'
        );
        setEnrollment(activeEnrollment || null);
      }
    } catch (error: any) {
      console.error('Failed to fetch career data:', error);
      // Don't show error toast - this is optional feature
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

      // Refresh data to show enrollment
      await fetchCareerData();
    } catch (error: any) {
      console.error('Enrollment failed:', error);
      if (error.response?.data?.detail?.includes('already enrolled')) {
        toast.info('You are already enrolled in this course');
        await fetchCareerData();
      } else {
        toast.error('Failed to enroll in course');
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handleViewCourse = () => {
    if (enrollment) {
      navigate(`/career-progression/${enrollment.course.id}`);
    }
  };

  // Don't show card if no recommendation or already completed
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendation?.recommended_course) {
    return null; // Don't show card if no recommendation
  }

  const course = recommendation.recommended_course;
  const isEnrolled = !!enrollment;
  const progress = enrollment?.progress_percentage || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Career Progression</h3>
            <p className="text-gray-600">Enhance your qualifications</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Course Info */}
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 mb-1">{course.name}</h4>
              {isEnrolled && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {enrollment?.modules_completed} of {enrollment?.total_modules} modules completed
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={isEnrolled ? handleViewCourse : handleEnroll}
            disabled={enrolling}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
          >
            {enrolling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enrolling...
              </>
            ) : isEnrolled ? (
              <>
                Continue Learning
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Start Course
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
