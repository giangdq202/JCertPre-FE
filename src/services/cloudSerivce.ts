import axiosInstance from "../consts/axios/axiosInstance";

export interface UploadImageResponseDto {
  message: string;
  imageUrl: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  createdAt: string; // ISO 8601 string
}

/**
 * Kiểu dữ liệu trả về khi upload video thành công.
 */
export interface UploadVideoResponseDto {
  message: string;
  videoUrl: string;
  publicId: string;
  format: string;
  duration: number;
  width: number;
  height: number;
  bytes: number;
  createdAt: string; // ISO 8601 string
}

/**
 * Kiểu dữ liệu trả về khi upload file (tài liệu) thành công.
 */
export interface UploadDocumentResponseDto {
  message: string;
  fileUrl: string;
  publicId: string;
  format: string;
  bytes: number;
  createdAt: string; // ISO 8601 string
}

/**
 * Kiểu dữ liệu trả về khi xóa một tài nguyên trên Cloudinary.
 */
export interface DeleteAssetResponseDto {
    message: string;
    publicId: string;
    result: string; // 'ok' or 'not found'
}


// === CÁC HÀM GỌI API ===

/**
 * Tải lên một file hình ảnh.
 * @param imageFile - File hình ảnh (từ input type="file").
 * @returns Thông tin của hình ảnh đã tải lên.
 */
export const uploadImage = async (imageFile: File): Promise<UploadImageResponseDto> => {
  const formData = new FormData();
  // Key 'imageFile' phải khớp với tên tham số IFormFile trong API
  formData.append('imageFile', imageFile);

  try {
    const response = await axiosInstance.post<UploadImageResponseDto>('/cloudinary-test/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    console.error("UploadImage API error:", error);
    throw error;
  }
};

/**
 * Tải lên một file video.
 * @param videoFile - File video (từ input type="file").
 * @returns Thông tin của video đã tải lên.
 */
export const uploadVideo = async (videoFile: File): Promise<UploadVideoResponseDto> => {
  const formData = new FormData();
  // Key 'videoFile' phải khớp với tên tham số IFormFile trong API
  formData.append('videoFile', videoFile);

  try {
    const response = await axiosInstance.post<UploadVideoResponseDto>('/cloudinary-test/upload-video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    console.error("UploadVideo API error:", error);
    throw error;
  }
};

/**
 * Tải lên một file tài liệu (raw file).
 * @param documentFile - File tài liệu (từ input type="file").
 * @returns Thông tin của file đã tải lên.
 */
export const uploadDocument = async (documentFile: File): Promise<UploadDocumentResponseDto> => {
    const formData = new FormData();
    // Key 'rawFile' phải khớp với tên tham số IFormFile trong API
    formData.append('rawFile', documentFile);

    try {
      const response = await axiosInstance.post<UploadDocumentResponseDto>('/cloudinary-test/upload-document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      console.error("UploadDocument API error:", error);
      throw error;
    }
  };

/**
 * Xóa một hình ảnh khỏi Cloudinary bằng publicId.
 * @param publicId - Public ID của hình ảnh cần xóa.
 */
export const deleteImage = async (publicId: string): Promise<DeleteAssetResponseDto> => {
    try {
        const response = await axiosInstance.delete<DeleteAssetResponseDto>(`/cloudinary-test/delete-image/${publicId}`);
        return response.data;
    } catch (error) {
        console.error(`DeleteImage API error for publicId ${publicId}:`, error);
        throw error;
    }
};

/**
 * Xóa một video khỏi Cloudinary bằng publicId.
 * @param publicId - Public ID của video cần xóa.
 */
export const deleteVideo = async (publicId: string): Promise<DeleteAssetResponseDto> => {
    try {
        const response = await axiosInstance.delete<DeleteAssetResponseDto>(`/cloudinary-test/delete-video/${publicId}`);
        return response.data;
    } catch (error) {
        console.error(`DeleteVideo API error for publicId ${publicId}:`, error);
        throw error;
    }
};

/**
 * Xóa một file tài liệu khỏi Cloudinary bằng publicId.
 * @param publicId - Public ID của file cần xóa.
 */
export const deleteDocument = async (publicId: string): Promise<DeleteAssetResponseDto> => {
    try {
        const response = await axiosInstance.delete<DeleteAssetResponseDto>(`/cloudinary-test/delete-document/${publicId}`);
        return response.data;
    } catch (error) {
        console.error(`DeleteDocument API error for publicId ${publicId}:`, error);
        throw error;
    }
};