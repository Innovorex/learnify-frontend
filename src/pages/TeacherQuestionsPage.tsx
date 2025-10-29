import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import type { K12Question } from '../types/k12';
import k12Api from '../services/k12Api';

export const TeacherQuestionsPage: React.FC = () => {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<K12Question[]>([]);

  useEffect(() => {
    if (assessmentId) {
      loadQuestions();
    }
  }, [assessmentId]);

  const loadQuestions = async () => {
    if (!assessmentId) return;

    try {
      setLoading(true);
      const questionsData = await k12Api.getAssessmentQuestions(parseInt(assessmentId));
      setQuestions(questionsData);

      // You might want to also load assessment details
      // For now, we'll just use the questions
    } catch (error: any) {
      console.error('Error loading questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/teacher/k12/assessments')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assessments
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Assessment Questions</h1>
        <p className="text-gray-600 mt-1">
          Assessment ID: {assessmentId} • {questions.length} Questions
        </p>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600">No questions found for this assessment</p>
        </div>
      ) : (
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold">
                    {index + 1}
                  </span>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${getDifficultyBadge(
                      question.difficulty
                    )}`}
                  >
                    {question.difficulty}
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div className="mb-4">
                <p className="text-lg text-gray-900 font-medium">
                  {question.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {Object.entries(question.options).map(([key, value]) => {
                  const isCorrect = question.correct_answer === key;
                  return (
                    <div
                      key={key}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
                        isCorrect
                          ? 'bg-green-50 border-green-300'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex items-center justify-center w-6 h-6 rounded-full font-semibold text-sm ${
                            isCorrect
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-300 text-gray-700'
                          }`}
                        >
                          {key}
                        </span>
                        {isCorrect && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <p className={`flex-1 text-gray-900 ${isCorrect ? 'font-medium' : ''}`}>
                        {value}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Correct Answer Label */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Correct Answer:</span>{' '}
                  <span className="text-green-600 font-semibold">
                    Option {question.correct_answer}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
