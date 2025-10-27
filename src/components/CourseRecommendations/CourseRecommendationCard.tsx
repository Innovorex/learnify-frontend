import React from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface CourseRecommendation {
  id: number;
  title: string;
  description: string;
  category: string;
  duration_hours: number;
  platform: string;
  url: string;
  certificate_available: boolean;
  recommendation: {
    score: number;
    priority: string;
    reasoning: string;
    improvement_areas: string[];
  };
}

interface CourseRecommendationCardProps {
  course: CourseRecommendation;
  onEnroll: (courseId: number) => void;
  onDismiss: (courseId: number) => void;
  isLoading?: boolean;
}

export const CourseRecommendationCard: React.FC<CourseRecommendationCardProps> = ({
  course,
  onEnroll,
  onDismiss,
  isLoading = false
}) => {
  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  const priorityColor = priorityColors[course.recommendation.priority.toLowerCase() as keyof typeof priorityColors] || priorityColors.medium;

  return (
    <Card className="p-4 space-y-3 border-l-4 border-blue-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">
            {course.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColor}`}>
              {course.recommendation.priority} Priority
            </span>
            <span className="text-xs text-gray-500">
              {course.platform}
            </span>
          </div>
        </div>
        <div className="text-right text-xs text-gray-500">
          <div>{course.duration_hours}h</div>
          {course.certificate_available && (
            <div className="text-green-600">📜 Certificate</div>
          )}
        </div>
      </div>

      {/* AI Reasoning */}
      <div className="bg-blue-50 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <div className="text-blue-600 text-sm">🤖</div>
          <div>
            <div className="text-xs font-medium text-blue-800 mb-1">
              AI Recommendation (Score: {course.recommendation.score}/100)
            </div>
            <p className="text-xs text-blue-700 leading-relaxed">
              {course.recommendation.reasoning}
            </p>
          </div>
        </div>
      </div>

      {/* Improvement Areas */}
      {course.recommendation.improvement_areas.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs font-medium text-gray-700">Will help improve:</div>
          <div className="flex flex-wrap gap-1">
            {course.recommendation.improvement_areas.map((area, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <p className="text-xs text-gray-600 line-clamp-2">
        {course.description}
      </p>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          onClick={() => onEnroll(course.id)}
          className="flex-1 text-xs py-2 bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Enroll Now'}
        </Button>
        <Button
          onClick={() => onDismiss(course.id)}
          variant="ghost"
          className="text-xs py-2 text-gray-500 hover:text-gray-700"
          disabled={isLoading}
        >
          Dismiss
        </Button>
      </div>

      {/* Direct Link */}
      <div className="pt-1">
        <a
          href={course.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
        >
          View on {course.platform} ↗
        </a>
      </div>
    </Card>
  );
};