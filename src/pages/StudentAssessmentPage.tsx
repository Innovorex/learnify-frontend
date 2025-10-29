import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Send,
  AlertCircle,
} from 'lucide-react';
import type { K12Assessment, K12Question } from '../types/k12';
import k12Api from '../services/k12Api';

export const StudentAssessmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState<K12Assessment | null>(null);
  const [questions, setQuestions] = useState<K12Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  useEffect(() => {
    loadAssessment();
  }, [id]);

  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const loadAssessment = async () => {
    if (!id || !user) return;

    try {
      setLoading(true);

      // Get available assessments to find this one
      const availableAssessments = await k12Api.getAvailableAssessments(
        user.class_name!,
        user.section!
      );
      const foundAssessment = availableAssessments.find(
        (a) => a.id === parseInt(id)
      );

      if (!foundAssessment) {
        toast.error('Assessment not found');
        navigate('/student/dashboard');
        return;
      }

      // Check if assessment is active
      if (!k12Api.isAssessmentActive(foundAssessment)) {
        toast.error('This assessment is not currently active');
        navigate('/student/dashboard');
        return;
      }

      setAssessment(foundAssessment);

      // Load questions
      const questionsData = await k12Api.getStudentAssessmentQuestions(
        parseInt(id)
      );
      setQuestions(questionsData);

      // Calculate time remaining
      const endTime = new Date(foundAssessment.end_time).getTime();
      const now = Date.now();
      const remainingSeconds = Math.floor((endTime - now) / 1000);
      setTimeRemaining(Math.max(0, remainingSeconds));
    } catch (error: any) {
      console.error('Error loading assessment:', error);
      toast.error('Failed to load assessment');
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleQuestionNav = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = () => {
    const unanswered = questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      setShowSubmitConfirm(true);
    } else {
      submitExam();
    }
  };

  const handleAutoSubmit = () => {
    toast.info('Time is up! Submitting your exam...');
    submitExam();
  };

  const submitExam = async () => {
    if (!user || !assessment) return;

    try {
      setSubmitting(true);

      const result = await k12Api.submitExam({
        student_id: user.id,
        assessment_id: assessment.id,
        answers,
      });

      toast.success(
        `Exam submitted! Your score: ${result.score}/${result.total_questions}`
      );
      navigate('/student/dashboard');
    } catch (error: any) {
      console.error('Error submitting exam:', error);
      toast.error('Failed to submit exam. Please try again.');
    } finally {
      setSubmitting(false);
      setShowSubmitConfirm(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const isTimeWarning = timeRemaining <= 300; // 5 minutes

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!assessment || questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Questions Available
          </h2>
          <p className="text-gray-600 mb-4">
            Questions are being generated. Please check back in a few minutes.
          </p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {assessment.subject} - {assessment.chapter}
              </h1>
              <p className="text-sm text-gray-600">
                Class {assessment.class_name}-{assessment.section}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  isTimeWarning
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                <Clock className="w-5 h-5" />
                <span className="font-bold text-lg">
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {answeredCount}/{questions.length} answered
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  currentQuestion.difficulty === 'easy'
                    ? 'bg-green-100 text-green-700'
                    : currentQuestion.difficulty === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {currentQuestion.difficulty}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {Object.entries(currentQuestion.options).map(([key, value]) => {
              const isSelected = answers[currentQuestion.id] === key;
              return (
                <button
                  key={key}
                  onClick={() => handleAnswerSelect(currentQuestion.id, key)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-700">{key}.</span>{' '}
                      <span className="text-gray-900">{value}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex-1 mx-4 flex flex-wrap justify-center gap-2">
            {questions.map((q, index) => (
              <button
                key={q.id}
                onClick={() => handleQuestionNav(index)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-blue-600 text-white'
                    : answers[q.id]
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentQuestionIndex === questions.length - 1}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg"
          >
            <Send className="w-5 h-5" />
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-4 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Unanswered Questions
                </h3>
                <p className="text-gray-600 mb-4">
                  You have {questions.length - answeredCount} unanswered
                  questions. Are you sure you want to submit?
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Review
              </button>
              <button
                onClick={submitExam}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Anyway'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Time Warning */}
      {isTimeWarning && timeRemaining > 0 && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="font-bold">
              Only {formatTime(timeRemaining)} remaining!
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
