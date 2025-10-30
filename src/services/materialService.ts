import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  MaterialUploadRequest,
  MaterialUploadResponse,
  MaterialListResponse,
  TeachingMaterial,
  MaterialUpdateRequest,
  FileProcessingStatus,
  MaterialFilters,
} from '@/types/materials';

class MaterialService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://104.251.217.92:8000',
      timeout: 120000,
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

  /**
   * Upload a teaching material file
   */
  async uploadMaterial(request: MaterialUploadRequest): Promise<MaterialUploadResponse> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('title', request.title);

    if (request.description) {
      formData.append('description', request.description);
    }
    if (request.subject) {
      formData.append('subject', request.subject);
    }
    if (request.grade_level) {
      formData.append('grade_level', request.grade_level);
    }
    if (request.topics) {
      formData.append('topics', request.topics);
    }

    const response: AxiosResponse<MaterialUploadResponse> = await this.api.post(
      '/api/materials/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * List all materials for the current teacher
   */
  async listMaterials(filters?: MaterialFilters): Promise<MaterialListResponse> {
    const params: Record<string, any> = {
      page: filters?.page || 1,
      page_size: filters?.page_size || 20,
    };

    if (filters?.subject) {
      params.subject = filters.subject;
    }
    if (filters?.grade_level) {
      params.grade_level = filters.grade_level;
    }
    if (filters?.status) {
      params.status = filters.status;
    }

    const response: AxiosResponse<MaterialListResponse> = await this.api.get(
      '/api/materials/',
      { params }
    );

    return response.data;
  }

  /**
   * Get a specific material by ID
   */
  async getMaterial(materialId: number): Promise<TeachingMaterial> {
    const response: AxiosResponse<TeachingMaterial> = await this.api.get(
      `/api/materials/${materialId}`
    );

    return response.data;
  }

  /**
   * Update material metadata
   */
  async updateMaterial(
    materialId: number,
    updates: MaterialUpdateRequest
  ): Promise<TeachingMaterial> {
    const response: AxiosResponse<TeachingMaterial> = await this.api.patch(
      `/api/materials/${materialId}`,
      updates
    );

    return response.data;
  }

  /**
   * Delete a material
   */
  async deleteMaterial(materialId: number): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.delete(
      `/api/materials/${materialId}`
    );

    return response.data;
  }

  /**
   * Get processing status of a material
   */
  async getProcessingStatus(materialId: number): Promise<FileProcessingStatus> {
    const response: AxiosResponse<FileProcessingStatus> = await this.api.get(
      `/api/materials/${materialId}/status`
    );

    return response.data;
  }

  /**
   * Poll processing status until completed or failed
   */
  async pollProcessingStatus(
    materialId: number,
    onProgress?: (status: FileProcessingStatus) => void,
    intervalMs: number = 2000
  ): Promise<FileProcessingStatus> {
    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        try {
          const status = await this.getProcessingStatus(materialId);

          if (onProgress) {
            onProgress(status);
          }

          if (status.status === 'completed' || status.status === 'failed') {
            clearInterval(pollInterval);
            resolve(status);
          }
        } catch (error) {
          clearInterval(pollInterval);
          reject(error);
        }
      }, intervalMs);
    });
  }
}

export const materialService = new MaterialService();
export default materialService;
