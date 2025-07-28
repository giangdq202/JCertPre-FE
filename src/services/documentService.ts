// src/services/documentService.ts

import axiosInstance from "../consts/axios/axiosInstance";

const BASE_DOCUMENTS_URL = "/documents"; // Base URL for document API

// --- Interfaces for Document DTOs ---

/**
 * Represents a Document data transfer object.
 */
export interface DocumentDto {
  documentId: string; // Guid in C# is string in TypeScript
  lessonId: string;
  documentName: string;
  fileUrl: string;
  uploadedAt: string; // DateTime in C# is string (ISO 8601) in TypeScript
}

/**
 * Data transfer object for creating a new document.
 * Note: This will be used internally with FormData.
 */
export interface CreateDocumentDto {
  lessonId: string;
  file: File; // Frontend will pass the actual File object
}

/**
 * Data transfer object for updating an existing document.
 * Note: This will be used internally with FormData.
 */
export interface UpdateDocumentRequest {
  documentName?: string;
  newFile?: File; // Frontend will pass the actual File object if updating file
}

// --- API Functions for Documents ---

/**
 * Uploads a new image document (JPG, PNG, JPEG only).
 * POST /api/documents/upload/image
 */
export const uploadImageDocument = async (
  createDocumentDto: CreateDocumentDto
): Promise<DocumentDto> => {
  const formData = new FormData();
  formData.append("lessonId", createDocumentDto.lessonId);
  formData.append("file", createDocumentDto.file);
  try {
    const response = await axiosInstance.post<DocumentDto>(
      `${BASE_DOCUMENTS_URL}/upload/image`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading image document:", error);
    throw error;
  }
};

/**
 * Uploads a new video document (MP4 only).
 * POST /api/documents/upload/video
 */
export const uploadVideoDocument = async (
  createDocumentDto: CreateDocumentDto
): Promise<DocumentDto> => {
  const formData = new FormData();
  formData.append("lessonId", createDocumentDto.lessonId);
  formData.append("file", createDocumentDto.file);
  try {
    const response = await axiosInstance.post<DocumentDto>(
      `${BASE_DOCUMENTS_URL}/upload/video`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading video document:", error);
    throw error;
  }
};

/**
 * Uploads a new raw document (PDF, Word, Excel, PowerPoint only).
 * POST /api/documents/upload/document
 */
export const uploadRawDocument = async (
  createDocumentDto: CreateDocumentDto
): Promise<DocumentDto> => {
  const formData = new FormData();
  formData.append("lessonId", createDocumentDto.lessonId);
  formData.append("file", createDocumentDto.file);
  try {
    const response = await axiosInstance.post<DocumentDto>(
      `${BASE_DOCUMENTS_URL}/upload/document`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading raw document:", error);
    throw error;
  }
};

/**
 * Fetches a document by its ID.
 * GET /api/documents/{id}
 */
export const getDocumentById = async (id: string): Promise<DocumentDto> => {
  try {
    const response = await axiosInstance.get<DocumentDto>(
      `${BASE_DOCUMENTS_URL}/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching document ${id}:`, error);
    throw error;
  }
};

/**
 * Fetches all documents for a specific lesson.
 * GET /api/documents/lesson/{lessonId}
 */
export const getDocumentsByLessonId = async (
  lessonId: string
): Promise<DocumentDto[]> => {
  try {
    const response = await axiosInstance.get<DocumentDto[]>(
      `${BASE_DOCUMENTS_URL}/lesson/${lessonId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching documents for lesson ${lessonId}:`, error);
    throw error;
  }
};

/**
 * Updates an existing document.
 * PUT /api/documents/{id}
 * @param id The document ID.
 * @param updateDocumentRequest The update request containing new data (documentName and/or newFile).
 * @returns A promise that resolves to the updated DocumentDto.
 */
export const updateDocument = async (
  id: string,
  updateDocumentRequest: UpdateDocumentRequest
): Promise<DocumentDto> => {
  const formData = new FormData();
  if (updateDocumentRequest.documentName) {
    formData.append("documentName", updateDocumentRequest.documentName);
  }
  if (updateDocumentRequest.newFile) {
    formData.append("newFile", updateDocumentRequest.newFile); // 'newFile' must match IFormFile parameter name in backend
  }

  try {
    const response = await axiosInstance.put<DocumentDto>(
      `${BASE_DOCUMENTS_URL}/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating document ${id}:`, error);
    throw error;
  }
};

/**
 * Deletes a document by its ID.
 * DELETE /api/documents/{id}
 * @param id The document ID.
 * @returns A promise that resolves when the deletion is successful.
 */
export const deleteDocument = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`${BASE_DOCUMENTS_URL}/${id}`);
  } catch (error) {
    console.error(`Error deleting document ${id}:`, error);
    throw error;
  }
};
