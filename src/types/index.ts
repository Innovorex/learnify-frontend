// User and Auth Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'teacher' | 'admin';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  role: 'teacher' | 'admin';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Teacher Profile Types
export interface TeacherProfile {
  id: number;
  user_id: number;
  education: string;
  grades_teaching: string;
  subjects_teaching: string;
  experience_years: number;
  board: string;
  state?: string;
}

export interface TeacherProfileInput {
  education: string;
  grades_teaching: string;
  subjects_teaching: string;
  experience_years: number;
  board: string;
  state?: string;
}

// Module Types
export interface Module {
  id: number;
  name: string;
  description: string;
  assessment_type: 'mcq' | 'submission' | 'outcome';
}

// Assessment Types
export interface MCQQuestion {
  id?: number; // Database ID for the question
  question: string;
  options: string[];
  correct_answer?: string;
}

export interface GeneratedAssessment {
  module_id: number;
  module_name: string;
  questions: MCQQuestion[];
}

export interface SubmitAnswer {
  question_id: number;
  selected_answer: string;
}

export interface AssessmentSubmission {
  answers: SubmitAnswer[];
}

export interface AnswerReview {
  question: string;
  options: string[];
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
}

export interface AssessmentScore {
  total_questions: number;
  correct: number;
  score_percent: number;
  review: AnswerReview[];
}

// Performance Types
export interface ModuleScore {
  module_id: number;
  module_name: string;
  assessment_type: string;
  score: number;
  rating: string;
}

export interface Benchmark {
  teacher_percentile: number;
  cohort_size: number;
  cohort_definition: {
    board: string;
    grades_teaching: string;
    subjects_teaching: string;
  };
}

export interface PerformanceSummary {
  overall_score: number;
  overall_rating: string;
  weighted_breakdown: {
    mcq: number;
    submission: number;
    outcome: number;
  };
  module_scores: ModuleScore[];
  benchmark: Benchmark;
}

// Progress Tracking Types
export interface ProgressEntry {
  teacher_id: number;
  teacher_name: string;
  timeline: TimelineEntry[];
  total_assessments: number;
}

export interface TimelineEntry {
  date: string;
  module_name: string;
  score: number;
  rating: string;
  type: string;
}

// Growth Plan Types
export interface GrowthPlan {
  content: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  detail: string;
}

// Career Progression Types
export interface CareerCourse {
  id: number;
  name: string;
  university: string;
  duration_months: number;
  total_modules: number;
  description?: string;
}

export interface CareerRecommendation {
  current_qualification: string;
  recommended_course: CareerCourse | null;
  next_after?: string;
  reason?: string;
  message?: string;
}

export interface CourseModule {
  id: number;
  module_number: number;
  module_name: string;
  description?: string;
  duration_weeks?: number;
  passing_score: number;
  is_locked: boolean;
  status: 'not_started' | 'in_progress' | 'completed';
  exam_score?: number;
  exam_attempts: number;
  passed: boolean;
}

export interface ModuleTopic {
  id: number;
  topic_number: number;
  topic_name: string;
  content_text?: string;
  video_url?: string;
  video_duration?: string;
  completed: boolean;
}

export interface EnrollmentResponse {
  enrollment_id: number;
  course_name: string;
  status: string;
  current_module?: string;
}

export interface CourseEnrollment {
  enrollment_id: number;
  course: CareerCourse;
  status: string;
  progress_percentage: number;
  modules_completed: number;
  total_modules: number;
  current_module?: CourseModule;
}

export interface ModuleContent {
  module: CourseModule;
  topics: ModuleTopic[];
  progress: {
    total_topics: number;
    completed_topics: number;
    percentage: number;
  };
}

export interface ModuleExamQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer?: string;
}

export interface ModuleExamResponse {
  score: number;
  passed: boolean;
  correct: number;
  total: number;
  percentage: number;
  next_module_unlocked: boolean;
  module_completed: boolean;
}

export interface TopicCompleteResponse {
  success: boolean;
  module_progress_percentage: number;
  topics_completed: number;
  total_topics: number;
}