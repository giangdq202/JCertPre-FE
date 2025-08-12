import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types for API requests and responses
interface CreateLivestreamDto {
  courseId: string;
  description?: string;
  scheduledDateTime: string; // ISO string
  durationMinutes: number;
}

interface UpdateLivestreamDto {
  description?: string;
  scheduledDateTime?: string; // ISO string
  durationMinutes?: number;
}

interface LivestreamDto {
  livestreamId: string;
  courseId: string;
  description?: string;
  scheduledDateTime: string;
  durationMinutes: number;
  status: LivestreamStatus;
  courseName?: string;
  endDateTime: string;
  isLive: boolean;
  isScheduled: boolean;
  canStart: boolean;
}

interface LivestreamJoinDto {
  token: string;
  roomName: string;
  title: string;
  scheduledDateTime: string;
  description?: string;
  durationMinutes: number;
}

interface LivestreamTimetableDto {
  livestreamId: string;
  courseId: string;
  courseName: string;
  description?: string;
  scheduledDateTime: string;
  durationMinutes: number;
  status: LivestreamStatus;
  endDateTime: string;
  isLive: boolean;
  canJoin: boolean;
  canStart: boolean;
  userRole: UserRoleInCourse;
  startsWithin15Minutes: boolean;
  timeStatus: string;
}

interface Pagination<T> {
  pageIndex: number;
  pageSize: number;
  totalItemsCount: number;
  items: T[];
}

interface CanJoinResponse {
  canJoin: boolean;
}

enum LivestreamStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  COMPLETED = 'COMPLETED'
}

enum UserRoleInCourse {
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
  NONE = 'NONE'
}

// Export types for use in components
export type { 
  CreateLivestreamDto, 
  UpdateLivestreamDto, 
  LivestreamDto, 
  LivestreamJoinDto, 
  LivestreamTimetableDto,
  Pagination,
  CanJoinResponse
};
export { LivestreamStatus, UserRoleInCourse };

class LivestreamApiService {
  private api: AxiosInstance;

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api') {
    this.api = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use((config) => {
      const token = this.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          console.error('API Error Response:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            url: error.config?.url
          });
        } else if (error.request) {
          console.error('API Network Error:', {
            message: error.message,
            url: error.config?.url
          });
        } else {
          console.error('API Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  // Create a new livestream
  async createLivestream(request: CreateLivestreamDto): Promise<LivestreamDto> {
    try {
    const response: AxiosResponse<LivestreamDto> = await this.api.post('/livestreams', request);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network Error: Could not reach the API server. Please check if the backend is running.');
      } else {
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  // Get livestream by ID
  async getLivestreamById(id: string): Promise<LivestreamDto> {
    try {
    const response: AxiosResponse<LivestreamDto> = await this.api.get(`/livestreams/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network Error: Could not reach the API server. Please check if the backend is running.');
      } else {
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  // Update livestream
  async updateLivestream(id: string, request: UpdateLivestreamDto): Promise<LivestreamDto> {
    try {
    const response: AxiosResponse<LivestreamDto> = await this.api.put(`/livestreams/${id}`, request);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network Error: Could not reach the API server. Please check if the backend is running.');
      } else {
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  // Delete livestream
  async deleteLivestream(id: string): Promise<void> {
    try {
    await this.api.delete(`/livestreams/${id}`);
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network Error: Could not reach the API server. Please check if the backend is running.');
      } else {
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  // Get livestreams with filtering and pagination
  async getLivestreams(params: {
    courseId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    timetableFormat?: boolean;
    pageIndex?: number;
    pageSize?: number;
  } = {}): Promise<Pagination<LivestreamDto> | LivestreamDto[] | LivestreamTimetableDto[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.courseId) queryParams.append('courseId', params.courseId);
      if (params.userId) queryParams.append('userId', params.userId);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.timetableFormat !== undefined) queryParams.append('timetableFormat', params.timetableFormat.toString());
      if (params.pageIndex) queryParams.append('pageIndex', params.pageIndex.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

      const response: AxiosResponse<Pagination<LivestreamDto> | LivestreamDto[] | LivestreamTimetableDto[]> = 
      await this.api.get(`/livestreams?${queryParams}`);
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network Error: Could not reach the API server. Please check if the backend is running.');
      } else {
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  // Get livestreams by course
  async getLivestreamsByCourse(courseId: string): Promise<LivestreamDto[]> {
    try {
      const response: AxiosResponse<LivestreamDto[]> = await this.api.get(`/livestreams?courseId=${courseId}`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network Error: Could not reach the API server. Please check if the backend is running.');
      } else {
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  // Get livestreams by user
  async getLivestreamsByUser(userId: string): Promise<LivestreamDto[]> {
    try {
      const response: AxiosResponse<LivestreamDto[]> = await this.api.get(`/livestreams?userId=${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network Error: Could not reach the API server. Please check if the backend is running.');
      } else {
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  // Get livestreams for enrolled courses of a user
  async getLivestreamsForEnrolledCourses(userId: string): Promise<LivestreamTimetableDto[]> {
    try {
      const response: AxiosResponse<LivestreamTimetableDto[]> = await this.api.get(`/livestreams?userId=${userId}&timetableFormat=true`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network Error: Could not reach the API server. Please check if the backend is running.');
      } else {
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  // Get livestream timetable by user
  async getLivestreamTimetableByUser(userId: string): Promise<LivestreamTimetableDto[]> {
    try {
      const response: AxiosResponse<LivestreamTimetableDto[]> = await this.api.get(`/livestreams?userId=${userId}&timetableFormat=true`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network Error: Could not reach the API server. Please check if the backend is running.');
      } else {
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  // Generate join token for livestream
  async generateJoinToken(livestreamId: string, userId: string): Promise<LivestreamJoinDto> {
    try {
      const response: AxiosResponse<LivestreamJoinDto> = await this.api.get(`/livestreams/${livestreamId}/join-token?userId=${userId}`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network Error: Could not reach the API server. Please check if the backend is running.');
      } else {
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  // Check if user can join livestream
  async canJoinLivestream(livestreamId: string, userId: string): Promise<boolean> {
    try {
      const response: AxiosResponse<CanJoinResponse> = await this.api.get(`/livestreams/${livestreamId}/can-join?userId=${userId}`);
      return response.data.canJoin;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network Error: Could not reach the API server. Please check if the backend is running.');
      } else {
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  // Mute/unmute participant in livestream
  async muteParticipant(livestreamId: string, participantId: string, muteData: { mute: boolean }): Promise<void> {
    try {
      await this.api.post(`/livestreams/${livestreamId}/participants/${participantId}/mute`, muteData);
    } catch (error: any) {
      if (error.response) {
        throw new Error(`API Error ${error.response.status}: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Network Error: Could not reach the API server. Please check if the backend is running.');
      } else {
        throw new Error(`Request Error: ${error.message}`);
      }
    }
  }

  // Alias for generateJoinToken to match livekitService naming
  async getJoinToken(livestreamId: string, userId: string): Promise<LivestreamJoinDto> {
    return this.generateJoinToken(livestreamId, userId);
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  removeAuthToken(): void {
    localStorage.removeItem('authToken');
  }
}

export const livestreamApi = new LivestreamApiService(); 