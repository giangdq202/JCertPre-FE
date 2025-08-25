# Firebase Google Authentication Setup Guide

## Tổng quan

Hệ thống đã được tích hợp với Firebase để hỗ trợ đăng nhập bằng Google. Người dùng có thể đăng nhập bằng tài khoản Google và hệ thống sẽ tự động xử lý qua backend API.

## Cấu trúc đã tích hợp

### 1. Backend API

- **Endpoint**: `POST /api/auth/firebase-login`
- **Payload**:
  ```json
  {
    "firebaseToken": "string" // Firebase ID Token từ client
  }
  ```
- **Response**: Tương tự login thông thường, trả về accessToken, refreshToken và thông tin user

### 2. Frontend Components

#### Files đã thêm/cập nhật:

- `src/config/firebase.ts` - Cấu hình Firebase
- `src/services/authService.ts` - Thêm `firebaseLogin()` function
- `src/auth/AuthContext.tsx` - Thêm `handleFirebaseLogin()` handler
- `src/pages/login/Login.tsx` - Tích hợp Google Sign-In button
- `.env` - Thêm Firebase configuration variables

### 3. UI/UX Features

- Nút "Đăng nhập bằng Google" với loading state
- Error handling cho các trường hợp popup bị chặn/hủy
- Tự động redirect theo role sau khi login thành công

## Setup Instructions

### 1. Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Enable Authentication > Sign-in method > Google
4. Thêm domain của website vào Authorized domains

### 2. Lấy Firebase Config

1. Project Settings > General > Your apps
2. Add app > Web app
3. Copy Firebase config object

### 3. Cập nhật Environment Variables

Sửa file `.env` với thông tin Firebase thực tế (lưu ý sử dụng prefix `VITE_` cho Vite):

```env
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

**Lưu ý**: Sau khi thay đổi environment variables, bạn cần restart dev server (`npm run dev`) để áp dụng thay đổi.

### 4. Backend Setup

Đảm bảo backend có thể verify Firebase ID Token:

- Cài đặt Firebase Admin SDK
- Implement logic verify token trong `FirebaseLoginAsync()`
- Mapping user từ Firebase với user trong database

## Quy trình hoạt động

1. **User click "Đăng nhập bằng Google"**
2. **Firebase popup hiện lên** cho user chọn tài khoản Google
3. **Client nhận ID Token** từ Firebase
4. **Gửi ID Token đến backend** qua `/api/auth/firebase-login`
5. **Backend verify token** với Firebase Admin SDK
6. **Tìm/tạo user** trong database dựa trên thông tin Google
7. **Trả về JWT tokens** như login thông thường
8. **Frontend lưu tokens** và redirect theo role

## Error Handling

### Client-side errors:

- `auth/popup-closed-by-user`: User đóng popup
- `auth/popup-blocked`: Browser chặn popup
- Network errors: Lỗi kết nối Firebase

### Server-side errors:

- Invalid Firebase token
- User không tồn tại trong hệ thống
- Account disabled/suspended

## Security Notes

1. **Firebase ID Token** có thời gian sống ngắn (~1 giờ)
2. **Backend phải verify token** với Firebase trước khi tin tưởng
3. **Không lưu trữ Firebase credentials** trong code
4. **Environment variables** phải được bảo mật

## Testing

### Development:

- Thêm `localhost:3000` vào Firebase Authorized domains
- Test với tài khoản Google cá nhân

### Production:

- Thêm production domain vào Authorized domains
- Test với account thật của hệ thống

## Dependencies đã thêm

```json
{
  "firebase": "latest" // Client SDK cho authentication
}
```

Hệ thống sẵn sàng cho Google Authentication!
