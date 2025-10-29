import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GeneratedAssessment, AssessmentScore } from '@/types';
import apiService from '@/services/api';
import { toast } from 'sonner';

interface QuestionCardProps {
  questionIndex: number;
  question: string;
  options: string[];
  selectedAnswer: string;
  onAnswerChange: (answer: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  questionIndex,
  question,
  options,
  selectedAnswer,
  onAnswerChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            Question {questionIndex + 1}
          </h3>
          {selectedAnswer && (
            <CheckCircle className="w-5 h-5 text-green-600" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-800 font-medium">{question}</p>
        <div className="space-y-2">
          {options.map((option, index) => {
            const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
            return (
              <label
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedAnswer === optionLetter
                    ? 'bg-blue-50 border-blue-300'
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${questionIndex}`}
                  value={optionLetter}
                  checked={selectedAnswer === optionLetter}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-800 flex-1">
                  <span className="font-medium">{optionLetter})</span> {option}
                </span>
              </label>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export const AssessmentTakePage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<GeneratedAssessment | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState<AssessmentScore | null>(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (!moduleId) return;

    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const data = await apiService.generateAssessment(parseInt(moduleId));
        setAssessment(data);
      } catch (error: any) {
        console.error('Failed to generate assessment:', error);
        toast.error('Failed to generate assessment questions');
        navigate('/assessments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [moduleId, navigate]);

  // Timer effect
  useEffect(() => {
    if (!assessment || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [assessment, timeRemaining]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleSubmit = async () => {
    if (!assessment || !moduleId) return;

    // Check if all questions are answered
    const unansweredQuestions = assessment.questions.length - Object.keys(answers).length;
    if (unansweredQuestions > 0) {
      const proceed = window.confirm(
        `You have ${unansweredQuestions} unanswered question(s). Do you want to submit anyway?`
      );
      if (!proceed) return;
    }

    setSubmitting(true);
    try {
      // Convert answers to the format expected by the API
      const submission = {
        answers: assessment.questions.map((question, index) => ({
          question_id: question.id || (index + 1), // Use actual database ID or fallback to index
          selected_answer: answers[index] || 'A', // Default to A if not answered
        })),
      };

      const scoreResult = await apiService.submitAssessment(parseInt(moduleId), submission);
      setScore(scoreResult);
      setShowScore(true);
      toast.success('Assessment submitted successfully!');
    } catch (error: any) {
      console.error('Failed to submit assessment:', error);
      toast.error('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating assessment questions...</p>
        </div>
      </div>
    );
  }

  if (showScore && score) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              {score.score_percent >= 80 ? (
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              ) : (
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Assessment Complete!
            </h2>
            <div className="space-y-4 mb-6">
              <div className="text-4xl font-bold text-blue-600">
                {score.score_percent}%
              </div>
              <p className="text-gray-600">
                You got {score.correct} out of {score.total_questions} questions correct
              </p>
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                score.score_percent >= 85
                  ? 'bg-green-100 text-green-800'
                  : score.score_percent >= 60
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {score.score_percent >= 85
                  ? 'Excellent'
                  : score.score_percent >= 60
                  ? 'Good'
                  : 'Needs Improvement'}
              </div>
            </div>
            <div className="space-x-4">
              <Button onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
              <Button variant="outline" onClick={() => setShowReview(!showReview)}>
                {showReview ? 'Hide Review' : 'Review Answers'}
              </Button>
              <Button variant="outline" onClick={() => navigate('/assessments')}>
                Take Another Assessment
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Answer Review Section */}
        {showReview && score && (
          <Card className="mt-6">
            <CardHeader>
              <h3 className="text-xl font-semibold text-gray-900">Answer Review</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {score.review.map((review, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                    <div className={`flex items-center space-x-1 ${
                      review.is_correct ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {review.is_correct ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                      <span className="text-sm font-medium">
                        {review.is_correct ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-800 mb-3">{review.question}</p>

                  {/* Show correct answer summary */}
                  <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">
                        <span className="font-medium">Your answer:</span> {review.user_answer}
                      </span>
                      <span className="text-gray-700">
                        <span className="font-medium">Correct answer:</span> <span className="text-green-600 font-bold">{review.correct_answer}</span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {review.options.map((option, optIndex) => {
                      const optionLetter = String.fromCharCode(65 + optIndex);
                      const isUserAnswer = review.user_answer === optionLetter;
                      const isCorrectAnswer = review.correct_answer === optionLetter;

                      return (
                        <div
                          key={optIndex}
                          className={`p-3 rounded-lg border ${
                            isCorrectAnswer
                              ? 'bg-green-100 border-green-400 text-green-900'
                              : isUserAnswer && !review.is_correct
                              ? 'bg-red-50 border-red-300 text-red-800'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{optionLetter})</span>
                            <span className="flex-1">{option}</span>
                            {isCorrectAnswer && (
                              <span className="text-xs bg-green-600 text-white px-2 py-1 rounded font-medium">
                                ✓ Correct Answer
                              </span>
                            )}
                            {isUserAnswer && !isCorrectAnswer && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                Your Answer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (!assessment) return null;

  const answeredCount = Object.keys(answers).length;
  const progressPercentage = (answeredCount / assessment.questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {assessment.module_name}
              </h1>
              <p className="text-gray-600">
                Answer all questions to complete the assessment
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className={`font-mono font-medium ${
                  timeRemaining < 300 ? 'text-red-600' : 'text-gray-700'
                }`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Progress</div>
                <div className="font-medium">
                  {answeredCount}/{assessment.questions.length}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        {assessment.questions.map((question, index) => (
          <QuestionCard
            key={index}
            questionIndex={index}
            question={question.question}
            options={question.options}
            selectedAnswer={answers[index] || ''}
            onAnswerChange={(answer) => handleAnswerChange(index, answer)}
          />
        ))}
      </div>

      {/* Submit Button */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {answeredCount === assessment.questions.length
                ? 'All questions answered!'
                : `${assessment.questions.length - answeredCount} question(s) remaining`}
            </div>
            <Button
              onClick={handleSubmit}
              loading={submitting}
              disabled={submitting}
              size="lg"
            >
              Submit Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};