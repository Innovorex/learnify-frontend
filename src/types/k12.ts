// K-12 Assessment System Types

export interface K12Assessment {
  id: number;
  teacher_id: number;
  class_name: string;
  section: string;
  subject: string;
  chapter: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  created_at: string;
}

export interface K12Question {
  id: number;
  assessment_id: number;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer?: string; // Only visible to teacher
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface K12Result {
  assessment_id: number;
  subject: string;
  chapter: string;
  score: number;
  total: number;
  submitted_at: string;
}

export interface AssessmentStatus {
  id: number;
  subject: string;
  chapter: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: 'available' | 'scheduled' | 'completed' | 'missed';
  score?: number | null;
  total_questions?: number | null;
  submitted_at?: string | null;
}

export interface TeacherSummary {
  total_assessments: number;
  total_students: number;
  average_score: number;
  recent_assessments: K12Assessment[];
}

export interface AssessmentResults {
  assessment_id: number;
  total_students: number;
  average_score: number;
  top_scorer: string | null;
  results: StudentResult[];
}

export interface StudentResult {
  student_id: number;
  student_name: string;
  score: number;
  submitted_at: string;
}

export interface CreateAssessmentRequest {
  teacher_id: number;
  class_name: string;
  section: string;
  subject: string;
  chapter: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

export interface SubmitExamRequest {
  student_id: number;
  assessment_id: number;
  answers: Record<string, string>; // questionId -> selectedAnswer (A/B/C/D)
}

export interface ExamResult {
  score: number;
  total_questions: number;
  percentage: number;
  correct_answers: number;
  message: string;
}
