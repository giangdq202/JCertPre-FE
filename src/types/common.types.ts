export interface TokenData {
  // Các claim từ JwtRegisteredClaimNames
  exp?: number; // Expiration time (Unix timestamp)
  iat?: number; // Issued at time (Unix timestamp)
  nbf?: number; // Not Before (Unix timestamp)
  jti?: string; // JWT ID
  iss?: string; // Issuer
  aud?: string; // Audience
  name: string; // Từ ClaimTypes.Name (fullName của user)
  nameidentifier: string; // Từ ClaimTypes.NameIdentifier (userId của user)
  role: string; // Từ ClaimTypes.Role (roleName của user)

  // Nếu bạn muốn bao gồm thêm các thông tin từ đối tượng 'user' trả về từ API
  // (mà không phải là claim từ token), bạn có thể định nghĩa thêm ở đây.
  // Tuy nhiên, userInfo trong AuthContext đang dùng decode(accessToken),
  // nên TokenData này chủ yếu phản ánh các claims.
  // Để bao gồm các thông tin khác như 'email', 'phone', v.v. từ 'userDto', bạn cần
  // điều chỉnh AuthContext để setUserInfo từ responseData.user thay vì decode.
  // email?: string;
  // phone?: string | null;
  // avatarUrl?: string | null;
  // id?: string; // id của user, giống nameidentifier
}

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string | null; 
  avatarUrl?: string | null; 
}

// Payment Types
export interface UserInfoResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl?: string | null;
  roleName: string;
  credit?: number; // Thêm credit field
}

export interface CreateCreditPurchaseRequest {
  userId: string;
  creditAmount: number;
}

export interface CreateCreditPurchaseResponse {
  paymentUrl: string;
  orderCode: number;
  amount: number;
  description: string;
}

export interface PaymentHistoryItem {
  paymentId: string;
  userId: string;
  amount: number;
  paymentType: string;
  transactionId?: string;
  status: string;
  createdAt: string;
  description?: string;
}

export interface CreditTransactionItem {
  transactionId: string;
  userId: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface CreditCheckResponse {
  userId: string;
  hasSufficientCredit: boolean;
  requiredAmount: number;
}