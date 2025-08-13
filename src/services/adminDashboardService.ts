import axiosInstance from "../consts/axios/axiosInstance";
import {
  GET_ADMIN_DASHBOARD_TOTAL_REVENUE_URL,
  GET_ADMIN_DASHBOARD_TOTAL_ENROLLMENTS_URL,
  GET_ADMIN_DASHBOARD_ENROLLMENTS_BY_MONTH_URL,
  GET_ADMIN_DASHBOARD_CURRENT_MONTH_ENROLLMENTS_URL,
  GET_ADMIN_DASHBOARD_CURRENT_MONTH_REVENUE_URL,
  GET_ADMIN_DASHBOARD_REVENUE_BY_MONTH_URL,
} from "../consts/apiUrl/baseUrl";

// Define types based on provided C# DTOs
export interface TotalRevenueDto {
  totalAmount: number;
  currency: string;
  totalTransactions: number;
  calculatedAt: string;
}

export interface TotalEnrollmentsDto {
  totalCount: number;
  calculatedAt: string;
}

export interface EnrollmentsByMonthDto {
  data: Record<string, number>; // Dictionary<string, long> in C#
  calculatedAt: string;
}

export interface CurrentMonthEnrollmentsDto {
  count: number;
  month: string;
  calculatedAt: string;
}

export interface CurrentMonthRevenueDto {
  totalAmount: number;
  currency: string;
  month: string;
  calculatedAt: string;
}

export interface RevenueByMonthDto {
  data: Record<string, number>; // Dictionary<string, decimal> in C#
  currency: string;
  calculatedAt: string;
}

// API endpoints
const BASE_URL = "/admin-dashboard";

// Get total revenue from money deposit transactions
export const getTotalRevenue = async (): Promise<TotalRevenueDto> => {
  try {
    const response = await axiosInstance.get<TotalRevenueDto>(GET_ADMIN_DASHBOARD_TOTAL_REVENUE_URL);
    return response.data;
  } catch (error) {
    console.error("GetTotalRevenue API error:", error);
    throw error;
  }
};

// Get total number of course enrollments
export const getTotalEnrollments = async (): Promise<TotalEnrollmentsDto> => {
  try {
    const response = await axiosInstance.get<TotalEnrollmentsDto>(GET_ADMIN_DASHBOARD_TOTAL_ENROLLMENTS_URL);
    return response.data;
  } catch (error) {
    console.error("GetTotalEnrollments API error:", error);
    throw error;
  }
};

// Get course enrollments statistics by month for the last 12 months
export const getEnrollmentsByMonth = async (): Promise<EnrollmentsByMonthDto> => {
  try {
    const response = await axiosInstance.get<EnrollmentsByMonthDto>(GET_ADMIN_DASHBOARD_ENROLLMENTS_BY_MONTH_URL);
    return response.data;
  } catch (error) {
    console.error("GetEnrollmentsByMonth API error:", error);
    throw error;
  }
};

// Get current month enrollments count
export const getCurrentMonthEnrollments = async (): Promise<CurrentMonthEnrollmentsDto> => {
  try {
    const response = await axiosInstance.get<CurrentMonthEnrollmentsDto>(GET_ADMIN_DASHBOARD_CURRENT_MONTH_ENROLLMENTS_URL);
    return response.data;
  } catch (error) {
    console.error("GetCurrentMonthEnrollments API error:", error);
    throw error;
  }
};

// Get current month revenue amount
export const getCurrentMonthRevenue = async (): Promise<CurrentMonthRevenueDto> => {
  try {
    const response = await axiosInstance.get<CurrentMonthRevenueDto>(GET_ADMIN_DASHBOARD_CURRENT_MONTH_REVENUE_URL);
    return response.data;
  } catch (error) {
    console.error("GetCurrentMonthRevenue API error:", error);
    throw error;
  }
};

// Get revenue statistics by month for the last 12 months
export const getRevenueByMonth = async (): Promise<RevenueByMonthDto> => {
  try {
    const response = await axiosInstance.get<RevenueByMonthDto>(GET_ADMIN_DASHBOARD_REVENUE_BY_MONTH_URL);
    return response.data;
  } catch (error) {
    console.error("GetRevenueByMonth API error:", error);
    throw error;
  }
};
