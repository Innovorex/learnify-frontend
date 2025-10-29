import React, { useState, useEffect } from 'react';
import { CourseRecommendationCard } from './CourseRecommendationCard';
import { Button } from '../ui/Button';

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

export const CourseRecommendationsSidebar: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  // Load existing recommendations on mount
  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/courses/recommendations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } else if (response.status === 401) {
        setError('Please log in to view recommendations');
      } else {
        setError('Failed to load recommendations');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error loading recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewRecommendations = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/courses/recommendations/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to generate recommendations');
      }
    } catch (err) {
      setError('Failed to generate recommendations');
      console.error('Error generating recommendations:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnroll = async (courseId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/courses/recommendations/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove from recommendations after enrollment
        setRecommendations(prev => prev.filter(rec => rec.id !== courseId));
        // You could also show a success message here
      } else {
        setError('Failed to enroll in course');
      }
    } catch (err) {
      setError('Failed to enroll in course');
      console.error('Error enrolling in course:', err);
    }
  };

  const handleDismiss = async (courseId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_URL}/courses/recommendations/${courseId}/dismiss`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove from recommendations after dismissal
        setRecommendations(prev => prev.filter(rec => rec.id !== courseId));
      } else {
        setError('Failed to dismiss recommendation');
      }
    } catch (err) {
      setError('Failed to dismiss recommendation');
      console.error('Error dismissing recommendation:', err);
    }
  };

  if (!isExpanded) {
    return (
      <div className="fixed top-20 right-4 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg"
        >
          📚 CPD Courses ({recommendations.length})
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-20 right-4 w-80 max-h-[calc(100vh-6rem)] bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            🎓 CPD Course Recommendations
          </h2>
          <Button
            onClick={() => setIsExpanded(false)}
            variant="ghost"
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            ✕
          </Button>
        </div>

        <div className="mt-2 flex gap-2">
          <Button
            onClick={generateNewRecommendations}
            disabled={isGenerating}
            className="flex-1 text-xs py-2 bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? '🤖 AI Analyzing...' : '🔄 Get AI Recommendations'}
          </Button>
        </div>

        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-sm text-gray-500">
            Loading recommendations...
          </div>
        ) : recommendations.length > 0 ? (
          <div className="p-4 space-y-4">
            {recommendations.map((course) => (
              <CourseRecommendationCard
                key={course.id}
                course={course}
                onEnroll={handleEnroll}
                onDismiss={handleDismiss}
                isLoading={false}
              />
            ))}
          </div>
        ) : (
          <div className="p-4 text-center space-y-3">
            <div className="text-gray-400 text-2xl">📚</div>
            <div className="text-sm text-gray-600">
              No course recommendations yet
            </div>
            <div className="text-xs text-gray-500">
              Complete some assessments to get AI-powered course recommendations based on your performance
            </div>
            <Button
              onClick={generateNewRecommendations}
              disabled={isGenerating}
              className="text-xs py-2 bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? 'Generating...' : 'Generate Recommendations'}
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      {recommendations.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 text-center">
            Recommendations powered by AI analysis of your performance
          </div>
        </div>
      )}
    </div>
  );
};