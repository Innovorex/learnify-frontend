import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Award,
  CheckCircle,
  Loader2,
  Clock,
  AlertCircle,
  Trophy,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import apiService from '@/services/api';
import { ModuleExamQuestion, ModuleExamResponse } from '@/types';
import { toast } from 'sonner';

export const ModuleExamPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [questions, setQuestions] = useState<ModuleExamQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [questionId: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ModuleExamResponse | null>(null);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    if (moduleId) {
      fetchExamQuestions();
    }
  }, [moduleId]);

  const fetchExamQuestions = async () => {
    try {
      setLoading(true);
      const data = await apiService.startModuleExam(parseInt(moduleId!));
      setQuestions(data);
      setStartTime(new Date());
    } catch (error: any) {
      console.error('Failed to fetch exam questions:', error);
      toast.error('Failed to load exam questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unansweredCount = questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      toast.warning(`Please answer all questions (${unansweredCount} remaining)`);
      return;
    }

    try {
      setSubmitting(true);

      // Format answers for submission
      const formattedAnswers = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        question_id: parseInt(questionId),
        selected_answer: selectedAnswer,
      }));

      const response = await apiService.submitModuleExam(
        parseInt(moduleId!),
        formattedAnswers
      );

      setResult(response);

      if (response.passed) {
        toast.success(`Congratulations! You passed with ${Math.round(response.percentage)}%`);
      } else {
        toast.error(`You scored ${Math.round(response.percentage)}%. Minimum required: 60%`);
      }
    } catch (error: any) {
      console.error('Failed to submit exam:', error);
      toast.error('Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const getElapsedTime = () => {
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const [elapsedTime, setElapsedTime] = useState('0:00');

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(getElapsedTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Show results screen
  if (result) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Module
        </Button>

        <Card className={result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
          <CardContent className="p-8 text-center">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
              result.passed ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {result.passed ? (
                <Trophy className="w-10 h-10 text-white" />
              ) : (
                <AlertCircle className="w-10 h-10 text-white" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mt-6">
              {result.passed ? 'Congratulations!' : 'Keep Trying!'}
            </h2>
            <p className="text-gray-600 mt-2">
              {result.passed
                ? 'You have successfully passed this module exam'
                : 'You need 60% to pass this module'}
            </p>

            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(result.percentage)}%</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600">Correct</p>
                <p className="text-2xl font-bold text-green-600">{result.correct}</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{result.total}</p>
              </div>
            </div>

            {result.passed && result.next_module_unlocked && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-900 font-medium">
                  Next module unlocked! Continue your learning journey.
                </p>
              </div>
            )}

            <div className="mt-8 space-y-3">
              <Button
                onClick={() => navigate(-1)}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600"
              >
                {result.passed ? 'Continue to Next Module' : 'Return to Module'}
              </Button>
              {!result.passed && (
                <Button
                  onClick={() => {
                    setResult(null);
                    setAnswers({});
                    fetchExamQuestions();
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Retake Exam
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show exam questions
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Module
        </Button>

        <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">Module Exam</h1>
                <p className="text-purple-100">
                  Answer all {questions.length} questions (10 questions) • Passing score: 60%
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end space-x-2 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{elapsedTime}</span>
                </div>
                <p className="text-sm text-purple-100 mt-1">
                  {answeredCount} / {questions.length} answered
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-purple-400 bg-opacity-30 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Question {index + 1}
                </h3>
                {answers[question.id] && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>
              <p className="text-gray-700 mt-2">{question.question}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {question.options.map((option, optionIndex) => {
                  const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D
                  const isSelected = answers[question.id] === optionLetter;

                  return (
                    <button
                      key={optionIndex}
                      onClick={() => handleAnswerSelect(question.id, optionLetter)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                            isSelected
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {optionLetter}
                        </div>
                        <span className="text-gray-900">{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Submit Button */}
      <Card className="sticky bottom-4 border-2 border-blue-300 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {answeredCount === questions.length ? 'Ready to submit?' : 'Answer all questions to submit'}
              </p>
              <p className="text-sm text-gray-600">
                {answeredCount} of {questions.length} questions answered
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={answeredCount !== questions.length || submitting}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-indigo-600"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Award className="w-5 h-5 mr-2" />
                  Submit Exam
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
