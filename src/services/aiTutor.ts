import axios from 'axios';
import type {
  StartSessionRequest,
  StartSessionResponse,
  ChatRequest,
  ChatResponse,
  SessionHistory,
  SessionMessages
} from '../types/aiTutor';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('access_token');  // IMPORTANT: 'access_token' not 'token'
  return token;
};

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const aiTutorService = {
  async startSession(request: StartSessionRequest): Promise<StartSessionResponse> {
    const response = await api.post('/api/ai-tutor/start-session', request);
    return response.data;
  },

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await api.post('/api/ai-tutor/chat', request);
    return response.data;
  },

  async getSessions(): Promise<SessionHistory[]> {
    const response = await api.get('/api/ai-tutor/sessions');
    return response.data;
  },

  async getSessionMessages(sessionId: number): Promise<SessionMessages> {
    const response = await api.get(`/api/ai-tutor/session/${sessionId}/messages`);
    return response.data;
  },

  async closeSession(sessionId: number): Promise<{ message: string; session_id: number }> {
    const response = await api.patch(`/api/ai-tutor/session/${sessionId}/close`);
    return response.data;
  },
};
