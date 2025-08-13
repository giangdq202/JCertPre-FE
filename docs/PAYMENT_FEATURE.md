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
- `src/pages/PaymentCallbackPage.tsx`: Trang xử lý callback từ PayOS (đã được cập nhật)
- `src/pages/PaymentSuccessPage.tsx`: Trang thanh toán thành công
- `src/pages/PaymentCancelledPage.tsx`: Trang thanh toán bị hủy
- `src/pages/PaymentErrorPage.tsx`: Trang lỗi thanh toán
- `src/pages/PaymentPendingPage.tsx`: Trang thanh toán đang xử lý

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
7. `PaymentCallbackPage` tự động redirect đến trang kết quả tương ứng:
   - **Thành công** → `PaymentSuccessPage` → Hiển thị thông tin credit và order
   - **Bị hủy** → `PaymentCancelledPage` → Hiển thị thông tin order và nút thử lại
   - **Lỗi** → `PaymentErrorPage` → Hiển thị thông tin order và nút liên hệ hỗ trợ
   - **Đang xử lý** → `PaymentPendingPage` → Hiển thị thông tin order và trạng thái
8. Mỗi trang sẽ tự động redirect về trang chủ sau 5 giây

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
payment_success: "/payment/success",
payment_cancelled: "/payment/cancelled",
payment_error: "/payment/error",
payment_pending: "/payment/pending",
```

## Tích hợp với Payment Pages

### 1. PaymentCallbackPage (Router chính)

`PaymentCallbackPage` giờ đây hoạt động như một router thông minh:
- Nhận callback từ PayOS với các tham số: `status`, `code`, `cancel`, `orderId`
- Tự động redirect đến trang kết quả tương ứng
- Truyền thông tin order qua navigation state

### 2. Các Payment Pages

Mỗi trang thanh toán có tính năng:
- **Hiển thị thông tin order** (nếu có)
- **Redirect thông minh** (student → student home, khác → general home)
- **Countdown 5 giây** tự động redirect
- **Nút hành động** phù hợp với từng trạng thái

### 3. Tích hợp với AuthContext

Tất cả payment pages đều sử dụng `useAuth()` để:
- Kiểm tra role của user
- Redirect đến trang chủ phù hợp
- Hiển thị thông tin credit (nếu có)

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

### 1. Tích hợp Payment Pages

- **PaymentCallbackPage** giờ đây chỉ là router, không hiển thị UI
- Tất cả payment pages đều có **countdown 5 giây** tự động redirect
- **Thông tin order** được truyền qua navigation state
- **Redirect thông minh** dựa trên role của user

### 2. URL Callback

PayOS sẽ gọi về các URL sau:
- **Thành công**: `/payment/callback?status=success&code=00&orderId=123`
- **Bị hủy**: `/payment/callback?status=cancelled&orderId=123`
- **Lỗi**: `/payment/callback?status=failed&orderId=123`
- **Đang xử lý**: `/payment/callback?status=pending&orderId=123`

### 3. State Management

Mỗi payment page nhận thông tin order qua:
```tsx
const location = useLocation();
const orderCode = location.state?.orderCode;
const fromCallback = location.state?.from === 'callback';
```

### 4. Error Handling

- Nếu không có thông tin order → Hiển thị thông báo mặc định
- Nếu có lỗi trong quá trình redirect → Fallback về trang chủ
- Tất cả payment pages đều có error boundary

## Troubleshooting

### 1. Payment Pages không hiển thị

- Kiểm tra routing trong `src/routes/index.tsx`
- Đảm bảo PaymentCallbackPage redirect đúng
- Kiểm tra console để xem có lỗi navigation không

### 2. Thông tin order không hiển thị

- Kiểm tra PayOS callback URL có đúng format không
- Đảm bảo `orderId` được truyền đúng
- Kiểm tra navigation state trong React DevTools

### 3. Redirect không hoạt động

- Kiểm tra `useEffect` dependencies
- Đảm bảo `navigate` function được gọi đúng
- Kiểm tra role detection logic

## Future Enhancements

1. **Real-time Status Updates**: WebSocket để cập nhật trạng thái thanh toán real-time
2. **Payment Analytics**: Tracking và phân tích hành vi thanh toán
3. **Multi-language Support**: Hỗ trợ đa ngôn ngữ cho payment pages
4. **Payment Methods**: Thêm các phương thức thanh toán khác
5. **Auto-refresh**: Tự động refresh trạng thái thanh toán
6. **Email Notifications**: Gửi email xác nhận thanh toán
7. **Payment History**: Lưu trữ và hiển thị lịch sử thanh toán chi tiết
