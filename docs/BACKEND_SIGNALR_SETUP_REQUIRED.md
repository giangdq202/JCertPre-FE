# Backend SignalR Setup Guide

## Lỗi hiện tại

Frontend đang gặp lỗi kết nối SignalR vì backend chưa được cấu hình đúng:

```
WebSocket connection to 'ws://localhost:5001/hubs/chat' failed
Status: 401 (Unauthorized)
```

## Cần thêm vào Backend

### 1. **Program.cs hoặc Startup.cs**

```csharp
// Add SignalR service
builder.Services.AddSignalR();

// Configure CORS for SignalR (nếu cần)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSignalR", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173") // Frontend URL
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Quan trọng cho SignalR
    });
});

// Map SignalR Hub
app.MapHub<ChatHub>("/hubs/chat");

// Apply CORS (nếu cần)
app.UseCors("AllowSignalR");
```

### 2. **ChatHub.cs** (đã có)

```csharp
[Authorize]
public class ChatHub : Hub
{
    private readonly IConversationService _conversationService;

    public ChatHub(IConversationService conversationService)
    {
        _conversationService = conversationService;
    }

    public async Task JoinConversation(Guid conversationId)
    {
        // Security: verify current user is participant before joining group
        var conversation = await _conversationService.GetConversationAsync(conversationId);
        var userIdString = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (conversation == null || string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            throw new HubException("UNAUTHORIZED");
        }
        var isParticipant = conversation.Participants.Exists(p => p.Id == userId);
        if (!isParticipant)
        {
            throw new HubException("FORBIDDEN");
        }
        await Groups.AddToGroupAsync(Context.ConnectionId, conversationId.ToString());
    }

    public async Task LeaveConversation(Guid conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId.ToString());
    }
}
```

### 3. **SignalRChatNotifier.cs** (đã có)

```csharp
public class SignalRChatNotifier : IChatNotifier
{
    private readonly IHubContext<ChatHub> _hubContext;

    public SignalRChatNotifier(IHubContext<ChatHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task NotifyMessageCreatedAsync(Guid conversationId, MessageDto message)
    {
        return _hubContext.Clients.Group(conversationId.ToString())
            .SendAsync("MessageCreated", message);
    }
}
```

### 4. **Dependency Injection**

```csharp
// Trong Program.cs hoặc Startup.cs
builder.Services.AddScoped<IChatNotifier, SignalRChatNotifier>();
```

### 5. **Authentication cho SignalR**

Đảm bảo JWT authentication được cấu hình cho SignalR:

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Existing JWT config...

        // Enable JWT for SignalR
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });
```

## Test các endpoint

Sau khi setup, test:

1. **GET** `http://localhost:5001/hubs/chat` - Không nên trả về 404
2. **WebSocket** connection với JWT token
3. **Hub methods**: `JoinConversation`, `LeaveConversation`

## Khi nào bật SignalR ở Frontend

Sau khi backend setup xong, thay đổi trong `src/config/signalr.ts`:

```typescript
export const SIGNALR_CONFIG = {
  ENABLED: true, // Đổi thành true
  DEBUG_MODE: false, // Đổi thành false for production
  // ...
};
```

## Troubleshooting

### Lỗi 401 Unauthorized:

- Kiểm tra JWT token có được gửi đúng không
- Kiểm tra authentication middleware order
- Kiểm tra CORS configuration

### Lỗi 404 Not Found:

- Kiểm tra `app.MapHub<ChatHub>("/hubs/chat")` có được gọi không
- Kiểm tra routing order

### WebSocket connection failed:

- Kiểm tra CORS allows credentials
- Kiểm tra firewall/proxy settings
- Kiểm tra HTTPS vs HTTP mixing

---

**Frontend sẽ tự động hoạt động khi backend được setup đúng!** 🚀
