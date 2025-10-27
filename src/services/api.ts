import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  LoginCredentials,
  SignupCredentials,
  AuthResponse,
  User,
  TeacherProfile,
  TeacherProfileInput,
  Module,
  GeneratedAssessment,
  AssessmentSubmission,
  AssessmentScore,
  PerformanceSummary,
  ProgressEntry,
  GrowthPlan,
  CareerRecommendation,
  EnrollmentResponse,
  CourseEnrollment,
  CourseModule,
  ModuleContent,
  ModuleExamQuestion,
  ModuleExamResponse,
  TopicCompleteResponse,
} from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://104.251.217.92:8000',
      timeout: 120000, // Increased to 120 seconds for AI question generation
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async signup(credentials: SignupCredentials): Promise<User> {
    const response: AxiosResponse<User> = await this.api.post('/auth/signup', credentials);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/me');
    return response.data;
  }

  // Teacher Profile endpoints
  async createTeacherProfile(profile: TeacherProfileInput): Promise<TeacherProfile> {
    const response: AxiosResponse<TeacherProfile> = await this.api.post('/teacher/profile', profile);
    return response.data;
  }

  async getTeacherProfile(): Promise<TeacherProfile> {
    const response: AxiosResponse<TeacherProfile> = await this.api.get('/teacher/profile/me');
    return response.data;
  }

  // Module endpoints
  async getModules(): Promise<Module[]> {
    const response: AxiosResponse<Module[]> = await this.api.get('/modules/');
    return response.data;
  }

  // Assessment endpoints
  async generateAssessment(moduleId: number): Promise<GeneratedAssessment> {
    const response: AxiosResponse<GeneratedAssessment> = await this.api.post(`/assessment/generate/${moduleId}`);
    return response.data;
  }

  async submitAssessment(moduleId: number, submission: AssessmentSubmission): Promise<AssessmentScore> {
    const response: AxiosResponse<AssessmentScore> = await this.api.post(`/assessment/submit/${moduleId}`, submission);
    return response.data;
  }

  // Performance endpoints
  async getPerformanceSummary(): Promise<PerformanceSummary> {
    const response: AxiosResponse<PerformanceSummary> = await this.api.get('/performance/summary/me');
    return response.data;
  }

  async generateGrowthPlan(): Promise<GrowthPlan> {
    const response: AxiosResponse<GrowthPlan> = await this.api.post('/performance/growth-plan/me');
    return response.data;
  }

  // Progress tracking endpoints
  async getProgress(): Promise<ProgressEntry> {
    const response: AxiosResponse<ProgressEntry> = await this.api.get('/tracking/teacher/me/progress');
    return response.data;
  }

  async getModuleTrend(moduleId: number): Promise<any> {
    const response = await this.api.get(`/tracking/teacher/me/module/${moduleId}/trend`);
    return response.data;
  }

  // File upload endpoints
  async uploadFile(moduleId: number, file: File, notes?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (notes) {
      formData.append('notes', notes);
    }

    const response = await this.api.post(`/submission/upload/${moduleId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Admin endpoints (for admin users)
  async getAdminOverview(): Promise<any> {
    const response = await this.api.get('/tracking/admin/overview');
    return response.data;
  }

  async getLeaderboard(): Promise<any> {
    const response = await this.api.get('/performance/admin/leaderboard');
    return response.data;
  }

  async exportCSV(): Promise<any> {
    const response = await this.api.get('/tracking/admin/export/csv');
    return response.data;
  }

  // Career Progression endpoints
  async getCareerRecommendation(): Promise<CareerRecommendation> {
    const response: AxiosResponse<CareerRecommendation> = await this.api.get('/api/career-progression/recommend');
    return response.data;
  }

  async enrollInCareerCourse(courseId: number): Promise<EnrollmentResponse> {
    const response: AxiosResponse<EnrollmentResponse> = await this.api.post(`/api/career-progression/enroll/${courseId}`);
    return response.data;
  }

  async getMyCourses(): Promise<CourseEnrollment[]> {
    const response: AxiosResponse<CourseEnrollment[]> = await this.api.get('/api/career-progression/my-courses');
    return response.data;
  }

  async getCourseModules(courseId: number): Promise<{ course: any; modules: CourseModule[] }> {
    const response = await this.api.get(`/api/career-progression/course/${courseId}/modules`);
    return response.data;
  }

  async getModuleContent(moduleId: number): Promise<ModuleContent> {
    const response: AxiosResponse<ModuleContent> = await this.api.get(`/api/career-progression/module/${moduleId}/content`);
    return response.data;
  }

  async markTopicComplete(topicId: number): Promise<TopicCompleteResponse> {
    const response: AxiosResponse<TopicCompleteResponse> = await this.api.post(`/api/career-progression/topic/${topicId}/complete`);
    return response.data;
  }

  async startModuleExam(moduleId: number): Promise<ModuleExamQuestion[]> {
    const response: AxiosResponse<ModuleExamQuestion[]> = await this.api.post(`/api/career-progression/module/${moduleId}/start-exam`);
    return response.data;
  }

  async submitModuleExam(moduleId: number, answers: { question_id: number; selected_answer: string }[]): Promise<ModuleExamResponse> {
    const response: AxiosResponse<ModuleExamResponse> = await this.api.post(`/api/career-progression/module/${moduleId}/submit-exam`, { answers });
    return response.data;
  }

  async getCertificate(enrollmentId: number): Promise<any> {
    const response = await this.api.get(`/api/career-progression/enrollment/${enrollmentId}/certificate`);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;