import axiosInstance from "../consts/axios/axiosInstance";
import {
  GET_PAYMENT_HISTORY_URL,
  GET_CREDIT_HISTORY_URL,
  CHECK_CREDIT_URL,
  CREATE_CREDIT_PURCHASE_URL,
} from "../consts/apiUrl/baseUrl";
import {
  CreateCreditPurchaseRequest,
  CreateCreditPurchaseResponse,
  PaymentHistoryItem,
  CreditTransactionItem,
  CreditCheckResponse,
} from "../types/common.types";

export const getPaymentHistory = async (userId: string): Promise<PaymentHistoryItem[]> => {
  try {
    const response = await axiosInstance.get<PaymentHistoryItem[]>(
      GET_PAYMENT_HISTORY_URL(userId)
    );
    return response.data;
  } catch (error) {
    console.error("Get payment history error:", error);
    throw error;
  }
};

export const getCreditHistory = async (userId: string): Promise<CreditTransactionItem[]> => {
  try {
    const response = await axiosInstance.get<CreditTransactionItem[]>(
      GET_CREDIT_HISTORY_URL(userId)
    );
    return response.data;
  } catch (error) {
    console.error("Get credit history error:", error);
    throw error;
  }
};

export const checkSufficientCredit = async (userId: string, amount: number): Promise<CreditCheckResponse> => {
  try {
    const response = await axiosInstance.get<CreditCheckResponse>(
      CHECK_CREDIT_URL(userId, amount)
    );
    return response.data;
  } catch (error) {
    console.error("Check credit error:", error);
    throw error;
  }
};

export const createCreditPurchase = async (request: CreateCreditPurchaseRequest): Promise<CreateCreditPurchaseResponse> => {
  try {
    const response = await axiosInstance.post<CreateCreditPurchaseResponse>(
      CREATE_CREDIT_PURCHASE_URL,
      request
    );
    return response.data;
  } catch (error) {
    console.error("Create credit purchase error:", error);
    throw error;
  }
}; 