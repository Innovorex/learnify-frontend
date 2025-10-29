import axios from 'axios';
import type {
  K12Assessment,
  K12Question,
  K12Result,
  AssessmentStatus,
  TeacherSummary,
  AssessmentResults,
  CreateAssessmentRequest,
  SubmitExamRequest,
  ExamResult,
} from '../types/k12';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ============================================================================
// TEACHER ENDPOINTS
// ============================================================================

/**
 * Create a new K-12 assessment
 */
export const createAssessment = async (
  data: CreateAssessmentRequest
): Promise<{ id: number; message: string; assessment: K12Assessment }> => {
  const response = await axios.post(
    `${API_URL}/teacher/k12/create-assessment`,
    null,
    {
      params: data,
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

/**
 * Get all assessments created by a teacher
 */
export const getTeacherAssessments = async (
  teacherId: number
): Promise<K12Assessment[]> => {
  const response = await axios.get(
    `${API_URL}/teacher/k12/my-assessments/${teacherId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

/**
 * Get questions for a specific assessment (teacher view - includes correct answers)
 */
export const getAssessmentQuestions = async (
  assessmentId: number
): Promise<K12Question[]> => {
  const response = await axios.get(
    `${API_URL}/teacher/k12/assessment/${assessmentId}/questions`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

/**
 * Get results for a specific assessment
 */
export const getAssessmentResults = async (
  assessmentId: number
): Promise<AssessmentResults> => {
  const response = await axios.get(
    `${API_URL}/teacher/k12/results/${assessmentId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

/**
 * Get teacher's K-12 summary statistics
 */
export const getTeacherSummary = async (
  teacherId: number
): Promise<TeacherSummary> => {
  const response = await axios.get(
    `${API_URL}/teacher/k12/summary/${teacherId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

// ============================================================================
// STUDENT ENDPOINTS
// ============================================================================

/**
 * Get all available assessments for a class and section
 */
export const getAvailableAssessments = async (
  className: string,
  section: string
): Promise<K12Assessment[]> => {
  const response = await axios.get(
    `${API_URL}/student/assessments/${className}/${section}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

/**
 * Get questions for an assessment (student view - NO correct answers)
 */
export const getStudentAssessmentQuestions = async (
  assessmentId: number
): Promise<K12Question[]> => {
  const response = await axios.get(
    `${API_URL}/student/assessment/${assessmentId}/questions`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

/**
 * Submit exam answers
 */
export const submitExam = async (
  data: SubmitExamRequest
): Promise<ExamResult> => {
  const response = await axios.post(`${API_URL}/student/submit-exam`, data, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

/**
 * Get assessments with completion status for a student
 */
export const getAssessmentsWithStatus = async (
  studentId: number,
  className: string,
  section: string
): Promise<AssessmentStatus[]> => {
  const response = await axios.get(
    `${API_URL}/student/assessments-with-status/${studentId}/${className}/${section}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

/**
 * Get all results for a student
 */
export const getStudentResults = async (
  studentId: number
): Promise<K12Result[]> => {
  const response = await axios.get(
    `${API_URL}/student/my-results/${studentId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if an assessment is currently active
 */
export const isAssessmentActive = (assessment: K12Assessment): boolean => {
  const now = new Date();
  const startTime = new Date(assessment.start_time);
  const endTime = new Date(assessment.end_time);
  return now >= startTime && now <= endTime;
};

/**
 * Check if an assessment is upcoming
 */
export const isAssessmentUpcoming = (assessment: K12Assessment): boolean => {
  const now = new Date();
  const startTime = new Date(assessment.start_time);
  return now < startTime;
};

/**
 * Check if an assessment has ended
 */
export const isAssessmentEnded = (assessment: K12Assessment): boolean => {
  const now = new Date();
  const endTime = new Date(assessment.end_time);
  return now > endTime;
};

/**
 * Get assessment status label
 */
export const getAssessmentStatusLabel = (
  assessment: K12Assessment
): 'upcoming' | 'active' | 'ended' => {
  if (isAssessmentActive(assessment)) return 'active';
  if (isAssessmentUpcoming(assessment)) return 'upcoming';
  return 'ended';
};

/**
 * Format date for display
 */
export const formatAssessmentDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default {
  // Teacher methods
  createAssessment,
  getTeacherAssessments,
  getAssessmentQuestions,
  getAssessmentResults,
  getTeacherSummary,

  // Student methods
  getAvailableAssessments,
  getStudentAssessmentQuestions,
  submitExam,
  getAssessmentsWithStatus,
  getStudentResults,

  // Utility methods
  isAssessmentActive,
  isAssessmentUpcoming,
  isAssessmentEnded,
  getAssessmentStatusLabel,
  formatAssessmentDate,
};
