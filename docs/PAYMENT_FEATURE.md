# Tính năng Payment Credit

## Tổng quan

Tính năng payment credit cho phép người dùng nạp credit vào tài khoản để mua khóa học và tham gia kỳ thi. Hệ thống sử dụng PayOS làm cổng thanh toán với tỷ lệ 1 credit = 1 VND.

## Các thành phần chính

### 1. Types và Interfaces

- `src/types/common.types.ts`: Chứa các interface cho payment
- `UserInfoResponse`: Thêm field `credit` để lưu số credit của user
- `CreateCreditPurchaseRequest/Response`: Request/Response cho việc tạo đơn hàng
- `PaymentHistoryItem/CreditTransactionItem`: Types cho lịch sử giao dịch

### 2. Services

- `src/services/paymentService.ts`: Chứa các API calls cho payment
  - `getPaymentHistory()`: Lấy lịch sử thanh toán
  - `getCreditHistory()`: Lấy lịch sử giao dịch credit
  - `checkSufficientCredit()`: Kiểm tra credit có đủ không
  - `createCreditPurchase()`: Tạo đơn hàng nạp credit

### 3. Components

- `src/components/CreditDisplay.tsx`: Component hiển thị credit và nút nạp tiền
- `src/components/modals/InsufficientCreditModal.tsx`: Modal thông báo khi credit không đủ
- `src/components/header/StudentHeader.tsx`: Cập nhật để hiển thị credit

### 4. Pages

- `src/pages/student/CreditPurchasePage.tsx`: Trang nạp credit
- `src/pages/student/CreditHistoryPage.tsx`: Trang lịch sử giao dịch
- `src/pages/PaymentCallbackPage.tsx`: Trang xử lý callback từ PayOS

### 5. Hooks

- `src/hooks/useCredit.ts`: Hook quản lý credit và kiểm tra credit

## Luồng hoạt động

### 1. Nạp Credit

1. User click nút "Nạp tiền" trong header
2. Chuyển đến trang `CreditPurchasePage`
3. User nhập số credit muốn nạp
4. Click "Nạp Credit" → Gọi API `createCreditPurchase`
5. Redirect đến PayOS để thanh toán
6. Sau khi thanh toán → PayOS callback về `PaymentCallbackPage`
7. Hiển thị kết quả và tự động redirect về trang chủ

### 2. Kiểm tra Credit

1. Sử dụng hook `useCredit()` để kiểm tra credit
2. Nếu không đủ → Hiển thị `InsufficientCreditModal`
3. User có thể nạp thêm credit hoặc xem lịch sử

### 3. Xem lịch sử

1. Click nút "Lịch sử" trong header
2. Chuyển đến trang `CreditHistoryPage`
3. Hiển thị 2 tabs: Lịch sử Credit và Lịch sử Thanh toán

## API Endpoints

### Backend (C#)

```csharp
[Route("api/payment")]
public class PaymentController : ControllerBase
{
    [HttpGet("history/{userId:guid}")] // Lịch sử thanh toán
    [HttpGet("credit-history/{userId:guid}")] // Lịch sử credit
    [HttpGet("check-credit/{userId:guid}/{amount:decimal}")] // Kiểm tra credit
    [HttpPost("create-credit-purchase")] // Tạo đơn hàng nạp credit
    [HttpPost("payos-webhook")] // Webhook từ PayOS
    [HttpGet("return")] // Callback thành công
    [HttpGet("cancel")] // Callback hủy
}
```

### Frontend (TypeScript)

```typescript
// API URLs
export const PAYMENT_BASE_URL = `${BASE_URL}/payment`;
export const GET_PAYMENT_HISTORY_URL = (userId: string) =>
  `${PAYMENT_BASE_URL}/history/${userId}`;
export const GET_CREDIT_HISTORY_URL = (userId: string) =>
  `${PAYMENT_BASE_URL}/credit-history/${userId}`;
export const CHECK_CREDIT_URL = (userId: string, amount: number) =>
  `${PAYMENT_BASE_URL}/check-credit/${userId}/${amount}`;
export const CREATE_CREDIT_PURCHASE_URL = `${PAYMENT_BASE_URL}/create-credit-purchase`;
```

## Routes

```typescript
// Payment routes
credit_purchase: "/credit-purchase",
credit_history: "/credit-history",
payment_callback: "/payment/callback",
```

## Cách sử dụng

### 1. Hiển thị Credit trong Header

```tsx
import CreditDisplay from "../components/CreditDisplay";

// Trong component
<CreditDisplay />;
```

### 2. Kiểm tra Credit trước khi thực hiện hành động

```tsx
import { useCredit } from "../hooks/useCredit";
import InsufficientCreditModal from "../components/modals/InsufficientCreditModal";

const MyComponent = () => {
  const { currentCredit, hasEnoughCredit } = useCredit();
  const [showModal, setShowModal] = useState(false);

  const handleAction = () => {
    if (!hasEnoughCredit(requiredAmount)) {
      setShowModal(true);
      return;
    }
    // Thực hiện hành động
  };

  return (
    <>
      {/* Component content */}
      <InsufficientCreditModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        requiredAmount={requiredAmount}
        currentCredit={currentCredit}
      />
    </>
  );
};
```

### 3. Sử dụng CreditDisplay với tùy chọn

```tsx
// Chỉ hiển thị credit, không có nút
<CreditDisplay showPurchaseButton={false} showHistoryButton={false} />

// Hiển thị compact
<CreditDisplay compact={true} />

// Tùy chỉnh style
<CreditDisplay className="my-custom-class" />
```

## Cấu hình PayOS

### 1. Backend Configuration

```csharp
// appsettings.json
{
  "PayOS": {
    "ClientId": "your-client-id",
    "ApiKey": "your-api-key",
    "ChecksumKey": "your-checksum-key"
  },
  "Frontend": {
    "PaymentSuccessUrl": "http://localhost:3000/payment/callback?status=success",
    "PaymentErrorUrl": "http://localhost:3000/payment/callback?status=failed",
    "PaymentPendingUrl": "http://localhost:3000/payment/callback?status=pending",
    "PaymentCancelledUrl": "http://localhost:3000/payment/callback?status=cancelled"
  }
}
```

### 2. Frontend Configuration

```typescript
// Có thể thêm vào .env
VITE_PAYMENT_SUCCESS_URL=http://localhost:3000/payment/callback?status=success
VITE_PAYMENT_ERROR_URL=http://localhost:3000/payment/callback?status=failed
```

## Lưu ý quan trọng

1. **Bảo mật**: Tất cả API calls đều cần authentication
2. **Error Handling**: Xử lý lỗi network và API errors
3. **Loading States**: Hiển thị loading khi đang xử lý
4. **Validation**: Validate input trước khi gửi request
5. **Webhook**: Backend cần xử lý webhook từ PayOS để cập nhật trạng thái
6. **Idempotency**: Tránh duplicate transactions
7. **Logging**: Log tất cả payment activities để audit

## Testing

### 1. Test Credit Display

```tsx
// Test hiển thị credit
expect(screen.getByText("100")).toBeInTheDocument();

// Test nút nạp tiền
fireEvent.click(screen.getByText("Nạp tiền"));
expect(mockNavigate).toHaveBeenCalledWith("/credit-purchase");
```

### 2. Test Payment Flow

```tsx
// Test tạo đơn hàng
const mockResponse = {
  paymentUrl: "https://payos.vn/checkout/...",
  orderCode: 123456789,
  amount: 100000,
  description: "Nap 100000 credit",
};

// Test callback
const mockSearchParams = new URLSearchParams(
  "?orderId=123456789&status=success"
);
```

## Troubleshooting

### 1. Credit không cập nhật sau khi nạp

- Kiểm tra webhook từ PayOS
- Kiểm tra logs backend
- Refresh userInfo trong AuthContext

### 2. Payment callback không hoạt động

- Kiểm tra URL callback trong PayOS dashboard
- Kiểm tra route `/payment/callback`
- Kiểm tra query parameters

### 3. API errors

- Kiểm tra authentication token
- Kiểm tra API endpoints
- Kiểm tra network connectivity
