import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Types for API requests and responses
interface TokenRequest {
  roomName: string;
  participantIdentity?: string;
  participantName?: string;
  role?: 'Student' | 'Instructor' | 'Admin';
}

interface TokenResponse {
  token: string;
}

interface BroadcastMessageRequest {
  message: any;
}

interface CreateRoomRequest {
  roomName: string;
  emptyTimeoutMinutes?: number;
  maxParticipants?: number;
  metadata?: string;
}

// Export types for use in components
export type { TokenRequest, TokenResponse, BroadcastMessageRequest, CreateRoomRequest, Room, ParticipantInfo };

interface Room {
  name: string;
  numParticipants: number;
  creationTime: number;
  metadata?: string;
  activeRecording: boolean;
}

interface ParticipantInfo {
  sid: string;
  identity: string;
  name: string;
  metadata?: string;
  joinedAt?: string;
  role?: string;
}

class LiveKitApiService {
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

  async getToken(request: TokenRequest): Promise<string> {
    try {
      const params = new URLSearchParams();
      params.append('roomName', request.roomName);
      if (request.participantIdentity || request.participantName) {
        params.append('participantIdentity', request.participantIdentity || request.participantName || '');
      }
      if (request.participantName) {
        params.append('participantName', request.participantName);
      }
      if (request.role) {
        params.append('role', request.role);
      }

      console.log('Making token request to:', `${this.api.defaults.baseURL}/api/livekit/token?${params}`);
      
      const response: AxiosResponse<TokenResponse> = await this.api.get(`/api/livekit/token?${params}`);
      return response.data.token;
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

  async getAdminToken(request: TokenRequest): Promise<string> {
    try {
      const params = new URLSearchParams();
      params.append('roomName', request.roomName);
      if (request.participantIdentity || request.participantName) {
        params.append('participantIdentity', request.participantIdentity || request.participantName || '');
      }
      if (request.participantName) {
        params.append('participantName', request.participantName);
      }

      console.log('Making admin token request to:', `${this.api.defaults.baseURL}/api/livekit/admin-token?${params}`);
      
      const response: AxiosResponse<TokenResponse> = await this.api.get(`/api/livekit/admin-token?${params}`);
      return response.data.token;
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

  async createRoom(request: CreateRoomRequest): Promise<Room> {
    try {
      const response: AxiosResponse<Room> = await this.api.post('/api/livekit/rooms', {
        roomName: request.roomName,
        emptyTimeoutMinutes: request.emptyTimeoutMinutes || 5,
        maxParticipants: request.maxParticipants || 100,
        metadata: request.metadata || ''
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to create room: ${error}`);
    }
  }

  async getRooms(): Promise<Room[]> {
    try {
      const response: AxiosResponse<Room[]> = await this.api.get('/api/livekit/rooms');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get rooms: ${error}`);
    }
  }

  async deleteRoom(roomName: string): Promise<void> {
    try {
      await this.api.delete(`/api/livekit/rooms/${roomName}`);
    } catch (error) {
      throw new Error(`Failed to delete room: ${error}`);
    }
  }

  async getRoom(roomName: string): Promise<Room> {
    try {
      const response: AxiosResponse<Room> = await this.api.get(`/api/livekit/rooms/${roomName}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get room: ${error}`);
    }
  }

  async getParticipants(roomName: string): Promise<ParticipantInfo[]> {
    try {
      const adminToken = await this.getAdminToken({ roomName, participantIdentity: 'dashboard-admin' });
      const response: AxiosResponse<ParticipantInfo[]> = await this.api.get(`/api/livekit/rooms/${roomName}/participants`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get participants: ${error}`);
    }
  }

  async broadcastMessage(roomName: string, message: BroadcastMessageRequest): Promise<void> {
    try {
      const adminToken = await this.getAdminToken({ roomName, participantIdentity: 'dashboard-admin' });
      await this.api.post(`/api/livekit/rooms/${roomName}/broadcast`, { 
        message: message 
      }, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
    } catch (error) {
      throw new Error(`Failed to broadcast message: ${error}`);
    }
  }

  async promoteParticipant(roomName: string, participantId: string): Promise<ParticipantInfo> {
    try {
      const adminToken = await this.getAdminToken({ roomName, participantIdentity: 'dashboard-admin' });
      const response: AxiosResponse<ParticipantInfo> = await this.api.post(`/api/livekit/rooms/${roomName}/participants/${participantId}/promote`, {}, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to promote participant: ${error}`);
    }
  }

  async demoteParticipant(roomName: string, participantId: string): Promise<ParticipantInfo> {
    try {
      const adminToken = await this.getAdminToken({ roomName, participantIdentity: 'dashboard-admin' });
      const response: AxiosResponse<ParticipantInfo> = await this.api.post(`/api/livekit/rooms/${roomName}/participants/${participantId}/demote`, {}, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to demote participant: ${error}`);
    }
  }

  async muteParticipant(roomName: string, participantId: string): Promise<void> {
    try {
      const adminToken = await this.getAdminToken({ roomName, participantIdentity: 'dashboard-admin' });
      await this.api.post(`/api/livekit/rooms/${roomName}/participants/${participantId}/mute`, {}, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
    } catch (error) {
      throw new Error(`Failed to mute participant: ${error}`);
    }
  }

  async removeParticipant(roomName: string, participantId: string): Promise<void> {
    try {
      const adminToken = await this.getAdminToken({ roomName, participantIdentity: 'dashboard-admin' });
      await this.api.delete(`/api/livekit/rooms/${roomName}/participants/${participantId}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
    } catch (error) {
      throw new Error(`Failed to remove participant: ${error}`);
    }
  }

  async getRoomStatistics(roomName: string): Promise<any> {
    try {
      const adminToken = await this.getAdminToken({ roomName, participantIdentity: 'dashboard-admin' });
      const response = await this.api.get(`/api/livekit/rooms/${roomName}/statistics`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get room statistics: ${error}`);
    }
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

export const livekitApi = new LiveKitApiService(); 