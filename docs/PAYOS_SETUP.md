# Hướng dẫn cấu hình PayOS

## 🔧 **Khắc phục lỗi "API Key or Client Key not found"**

### **Bước 1: Đăng ký tài khoản PayOS**

1. Truy cập https://my.payos.vn
2. Đăng ký tài khoản merchant
3. Xác thực email và thông tin doanh nghiệp

### **Bước 2: Lấy API Credentials**

1. **Đăng nhập vào PayOS Dashboard**
2. **Vào mục "API Management"**
3. **Copy các thông tin sau:**
   - `Client ID`
   - `API Key`
   - `Checksum Key`

### **Bước 3: Cấu hình Backend**

#### **1. Cập nhật appsettings.json**

```json
{
  "PayOS": {
    "ClientId": "your-client-id-here",
    "ApiKey": "your-api-key-here",
    "ChecksumKey": "your-checksum-key-here",
    "Environment": "Production" // hoặc "Sandbox" cho testing
  },
  "Frontend": {
    "PaymentSuccessUrl": "http://localhost:3000/payment/callback?status=success",
    "PaymentErrorUrl": "http://localhost:3000/payment/callback?status=failed",
    "PaymentPendingUrl": "http://localhost:3000/payment/callback?status=pending",
    "PaymentCancelledUrl": "http://localhost:3000/payment/callback?status=cancelled"
  }
}
```

#### **2. Tạo Configuration Class**

```csharp
// Models/PayOSConfiguration.cs
public class PayOSConfiguration
{
    public string ClientId { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string ChecksumKey { get; set; } = string.Empty;
    public string Environment { get; set; } = "Production";
}

public class FrontendConfiguration
{
    public string PaymentSuccessUrl { get; set; } = string.Empty;
    public string PaymentErrorUrl { get; set; } = string.Empty;
    public string PaymentPendingUrl { get; set; } = string.Empty;
    public string PaymentCancelledUrl { get; set; } = string.Empty;
}
```

#### **3. Cập nhật Program.cs**

```csharp
// Program.cs
builder.Services.Configure<PayOSConfiguration>(
    builder.Configuration.GetSection("PayOS"));

builder.Services.Configure<FrontendConfiguration>(
    builder.Configuration.GetSection("Frontend"));

// Đảm bảo PayOSService được register
builder.Services.AddScoped<IPaymentGateway, PayOSService>();
```

### **Bước 4: Test với Sandbox**

Nếu bạn muốn test trước khi go live:

```json
{
  "PayOS": {
    "ClientId": "sandbox-client-id",
    "ApiKey": "sandbox-api-key",
    "ChecksumKey": "sandbox-checksum-key",
    "Environment": "Sandbox"
  }
}
```

### **Bước 5: Tắt Mock Mode**

Sau khi cấu hình PayOS thành công:

1. **Mở file `src/services/paymentService.ts`**
2. **Thay đổi:**
   ```typescript
   const USE_MOCK = false; // Thay đổi từ true thành false
   ```

### **Bước 6: Test Payment Flow**

1. **Chạy backend và frontend**
2. **Đăng nhập với tài khoản student**
3. **Click "Nạp tiền" trong header**
4. **Nhập số credit và test thanh toán**

## 🔍 **Troubleshooting**

### **Lỗi 1: "API Key or Client Key not found"**

**Nguyên nhân:**

- Credentials chưa được cấu hình
- Credentials không đúng
- Environment không đúng (Production vs Sandbox)

**Khắc phục:**

1. Kiểm tra lại credentials trong appsettings.json
2. Đảm bảo đã copy đúng từ PayOS dashboard
3. Kiểm tra environment setting

### **Lỗi 2: "Invalid signature"**

**Nguyên nhân:**

- ChecksumKey không đúng
- PayOSService không tạo signature đúng

**Khắc phục:**

1. Kiểm tra lại ChecksumKey
2. Đảm bảo PayOSService implementation đúng

### **Lỗi 3: "Webhook not received"**

**Nguyên nhân:**

- Webhook URL chưa được đăng ký với PayOS
- Backend không accessible từ internet

**Khắc phục:**

1. Đăng ký webhook URL trong PayOS dashboard
2. Sử dụng ngrok hoặc public URL cho development

## 📋 **Checklist cấu hình**

- [ ] Đăng ký tài khoản PayOS
- [ ] Lấy API credentials
- [ ] Cấu hình appsettings.json
- [ ] Tạo Configuration classes
- [ ] Register services trong Program.cs
- [ ] Test với sandbox environment
- [ ] Tắt mock mode
- [ ] Test payment flow end-to-end

## 🚀 **Production Deployment**

Khi deploy lên production:

1. **Cập nhật URLs:**

   ```json
   {
     "Frontend": {
       "PaymentSuccessUrl": "https://yourdomain.com/payment/callback?status=success",
       "PaymentErrorUrl": "https://yourdomain.com/payment/callback?status=failed",
       "PaymentPendingUrl": "https://yourdomain.com/payment/callback?status=pending",
       "PaymentCancelledUrl": "https://yourdomain.com/payment/callback?status=cancelled"
     }
   }
   ```

2. **Đăng ký webhook URL:**

   ```
   https://yourdomain.com/api/payment/payos-webhook
   ```

3. **Chuyển sang Production environment:**
   ```json
   {
     "PayOS": {
       "Environment": "Production"
     }
   }
   ```

## 📞 **Hỗ trợ**

Nếu vẫn gặp vấn đề:

1. **Kiểm tra logs backend** để xem chi tiết lỗi
2. **Liên hệ PayOS support** nếu vấn đề về credentials
3. **Kiểm tra network connectivity** giữa backend và PayOS
4. **Verify webhook endpoints** có accessible không
