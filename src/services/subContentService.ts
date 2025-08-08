// src/services/subContentService.ts

import axiosInstance from "../consts/axios/axiosInstance"; // Assuming axiosInstance is correctly configured
import { Pagination } from "../types/pagination"; // Assuming you have a common Pagination type
import { Description } from "@mui/icons-material"; // Keep this if you use it for other purposes, though not directly in this file's logic

const BASE_SUB_CONTENTS_URL = "/subcontents"; // Base URL for subcontent API

// --- Enums for Dạng câu hỏi properties (Mirroring C# enums with numeric values) ---
// CHÚ Ý: Các giá trị số này phải KHỚP CHÍNH XÁC với các giá trị enum trong C# backend của bạn
// Mondai1 = 0, Mondai2 = 1, v.v.
// Nếu thứ tự trong C# khác, hãy điều chỉnh cho phù hợp.
export enum SubContentName {
  Mondai1 = 0, // Đọc chữ Hán
  Mondai2 = 1, // Nhớ chữ Hán
  Mondai3 = 2, // Chọn từ phù hợp với câu
  Mondai4 = 3, // Tìm câu có cách diễn đạt giống
  Mondai5 = 4, // Chọn ngữ pháp phù hợp với câu
  Mondai6 = 5, // Sắp xếp câu
  Mondai7 = 6, // Tìm đáp án đúng để hoàn thành đoạn văn
  Mondai8 = 7, // Đoạn văn ngắn
  Mondai9 = 8, // Trung văn
  Mondai10 = 9, // Tìm kiếm thông tin
  Mondai11 = 10, // Hiểu đề bài
  Mondai12 = 11, // Hiểu điểm chính
  Mondai13 = 12, // Diễn đạt bằng lời nói
  Mondai14 = 13, // Phản hồi tức thời
}

export enum CourseLevel {
  N5 = 0,
  N4 = 1,
  N3 = 2,
  N2 = 3,
  N1 = 4,
}

export enum ContentName {
  Kanji = 0, // chữ hán
  Vocabulary = 1, // từ vựng
  Grammar = 2, // ngữ pháp
  Reading = 3, // đọc hiểu
  Listening = 4, // nghe hiểu
}

// --- Interfaces for Dạng câu hỏi DTOs ---

/**
 * Represents a Dạng câu hỏi data transfer object.
 * Lưu ý: Các trường enum trong DTO nhận về từ API vẫn có thể là chuỗi nếu backend của bạn
 * sử dụng StringEnumConverter. Nếu backend gửi số, thì chỉ cần để kiểu enum số là đủ.
 * Ở đây, tôi giữ là string để tương thích với `_Description` mà bạn có.
 * Nhưng các DTO gửi lên (Create, Update) sẽ dùng enum số.
 */
export interface SubContentDto {
  subContentId: string; // GUID in C# is string in TypeScript
  subContentName: string; // Vẫn để string để khớp với subContentNameDescription
  subContentNameDescription: string; // Đây là mô tả sẽ hiển thị "Dạng câu hỏi"
  level: string; // Vẫn để string để khớp với levelDescription
  levelDescription: string;
  contentName: string; // Vẫn để string để khớp với contentNameDescription
  contentNameDescription: string;
}

/**
 * Data transfer object for creating a new Dạng câu hỏi.
 * Các trường enum sẽ là DẠNG SỐ (numeric enum).
 */
export interface CreateSubContentDto {
  subContentName: SubContentName; // Sẽ là số (0, 1, 2...)
  level: CourseLevel; // Sẽ là số (0, 1, 2...)
  contentName: ContentName; // Sẽ là số (0, 1, 2...)
}

/**
 * Data transfer object for updating an existing Dạng câu hỏi.
 * All fields are optional as only specific fields might be updated.
 * Các trường enum sẽ là DẠNG SỐ (numeric enum).
 */
export interface UpdateSubContentDto {
  subContentName?: SubContentName; // Sẽ là số (0, 1, 2...)
  level?: CourseLevel; // Sẽ là số (0, 1, 2...)
  contentName?: ContentName; // Sẽ là số (0, 1, 2...)
}

/**
 * Represents an enum value with its name, description, and integer value.
 * Cái này vẫn cần vì backend trả về để UI hiển thị các tên đẹp.
 */
export interface EnumValueDto {
  name: string; // Tên chuỗi của enum (ví dụ: "Mondai1")
  description: string; // Mô tả tiếng Việt (ví dụ: "Đọc chữ Hán")
  value: number; // Giá trị số nguyên của enum (ví dụ: 0)
}

// --- API Functions for Dạng câu hỏi ---

/**
 * Fetches a paginated list of Dạng câu hỏi with optional search and filters.
 * Corresponds to GET /api/subcontents
 * @param search Optional search term.
 * @param level Optional filter by CourseLevel enum.
 * @param contentName Optional filter by ContentName enum.
 * @param subContentName Optional filter by SubContentName enum.
 * @param pageIndex Page number (starts from 1).
 * @param pageSize Items per page.
 * @returns A promise that resolves to a Pagination object containing SubContentDto items.
 */
export const getAllSubContents = async (
  search?: string,
  level?: CourseLevel, // Vẫn là numeric enum
  contentName?: ContentName, // Vẫn là numeric enum
  subContentName?: SubContentName, // Vẫn là numeric enum
  pageIndex: number = 1,
  pageSize: number = 10
): Promise<Pagination<SubContentDto>> => {
  try {
    const params: any = {
      pageIndex,
      pageSize,
    };
    
    // Only add search parameter if it's not undefined
    if (search !== undefined) {
      params.search = search;
    }
    
    // Only add enum parameters if they are defined
    if (level !== undefined) {
      params.level = CourseLevel[level];
    }
    if (contentName !== undefined) {
      params.contentName = ContentName[contentName];
    }
    if (subContentName !== undefined) {
      params.subContentName = SubContentName[subContentName];
    }

    const response = await axiosInstance.get<Pagination<SubContentDto>>(
      BASE_SUB_CONTENTS_URL,
      { params }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Dạng câu hỏi:", error);
    throw error;
  }
};

/**
 * Creates a new Dạng câu hỏi.
 * Corresponds to POST /api/subcontents
 * @param createSubContentDto The data for the new Dạng câu hỏi.
 * @returns A promise that resolves to the created SubContentDto.
 */
export const createSubContent = async (
  createSubContentDto: CreateSubContentDto // DTO này đã dùng numeric enum
): Promise<SubContentDto> => {
  try {
    const response = await axiosInstance.post<SubContentDto>(
      BASE_SUB_CONTENTS_URL,
      createSubContentDto // Axios sẽ tự tuần tự hóa các số thành JSON
    );
    return response.data;
  } catch (error) {
    console.error("Error creating Dạng câu hỏi:", error);
    throw error;
  }
};

/**
 * Updates an existing Dạng câu hỏi by ID.
 * Corresponds to PUT /api/subcontents/{subContentId}
 * @param subContentId The ID of the Dạng câu hỏi to update.
 * @param updateSubContentDto The data to update the Dạng câu hỏi with.
 * @returns A promise that resolves to the updated SubContentDto.
 */
export const updateSubContent = async (
  subContentId: string,
  updateSubContentDto: UpdateSubContentDto // DTO này đã dùng numeric enum
): Promise<SubContentDto> => {
  try {
    const response = await axiosInstance.put<SubContentDto>(
      `${BASE_SUB_CONTENTS_URL}/${subContentId}`,
      updateSubContentDto // Axios sẽ tự tuần tự hóa các số thành JSON
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating Dạng câu hỏi ${subContentId}:`, error);
    throw error;
  }
};

/**
 * Deletes a Dạng câu hỏi by ID.
 * Corresponds to DELETE /api/subcontents/{subContentId}
 * @param subContentId The ID of the Dạng câu hỏi to delete.
 * @returns A promise that resolves when the deletion is successful.
 */
export const deleteSubContentById = async (
  subContentId: string
): Promise<void> => {
  try {
    await axiosInstance.delete(`${BASE_SUB_CONTENTS_URL}/${subContentId}`);
  } catch (error) {
    console.error(`Error deleting Dạng câu hỏi ${subContentId}:`, error);
    throw error;
  }
};

/**
 * Fetches all values and descriptions for the SubContentName enum.
 * Corresponds to GET /api/subcontents/enum-values/subcontent-name
 * @returns A promise that resolves to an array of EnumValueDto.
 */
export const getSubContentNameEnumValues = async (): Promise<
  EnumValueDto[]
> => {
  try {
    const response = await axiosInstance.get<EnumValueDto[]>(
      `${BASE_SUB_CONTENTS_URL}/enum-values/subcontent-name`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching SubContentName enum values:", error);
    throw error;
  }
};

/**
 * Fetches all values and descriptions for the CourseLevel enum.
 * Corresponds to GET /api/subcontents/enum-values/level
 * @returns A promise that resolves to an array of EnumValueDto.
 */
export const getCourseLevelEnumValues = async (): Promise<EnumValueDto[]> => {
  try {
    const response = await axiosInstance.get<EnumValueDto[]>(
      `${BASE_SUB_CONTENTS_URL}/enum-values/level`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching CourseLevel enum values:", error);
    throw error;
  }
};

/**
 * Fetches all values and descriptions for the ContentName enum.
 * Corresponds to GET /api/subcontents/enum-values/content-name
 * @returns A promise that resolves to an array of EnumValueDto.
 */
export const getContentNameEnumValues = async (): Promise<EnumValueDto[]> => {
  try {
    const response = await axiosInstance.get<EnumValueDto[]>(
      `${BASE_SUB_CONTENTS_URL}/enum-values/content-name`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching ContentName enum values:", error);
    throw error;
  }
};