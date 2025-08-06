export interface User {
  id: string;
  name: string;
  role: 'Student' | 'Instructor' | 'Admin';
}

export enum ParticipantRole {
  Student = 0,
  Instructor = 1,
  Admin = 2
}

export interface Room {
  name: string;
  numParticipants: number;
  creationTime: number;
  metadata?: string;
  maxParticipants?: number;
  emptyTimeoutMinutes?: number;
}

export interface RoomCreateRequest {
  roomName: string;
  emptyTimeoutMinutes?: number;
  maxParticipants?: number;
  metadata?: string;
}

export interface TokenRequest {
  roomName: string;
  participantName: string;
  participantIdentity?: string;
  role?: string;
}

export interface TokenResponse {
  token: string;
}

export interface Participant {
  identity: string;
  name?: string;
  isLocal: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor';
}

export interface ChatMessage {
  type: 'chat' | 'announcement' | 'control';
  message: string;
  sender: string;
  timestamp: string;
}

export interface RoomStats {
  totalParticipants: number;
  studentCount: number;
  instructorCount: number;
}

export interface BroadcastMessage {
  type: 'announcement' | 'control' | 'chat';
  content: string;
  sender?: string;
  timestamp?: number;
}

export interface RoomStatistics {
  roomName: string;
  totalParticipants: number;
  instructorCount: number;
  studentCount: number;
  creationTime: string;
  isRecording: boolean;
}

export interface RoomConfig {
  roomName: string;
  participantName: string;
  role: string;
  token: string;
  isMockMode?: boolean;
} 