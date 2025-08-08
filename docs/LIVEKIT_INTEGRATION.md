# LiveKit Integration Guide

## Tổng quan

LiveKit đã được tích hợp thành công vào project chính của bạn. Đây là hướng dẫn chi tiết về cách sử dụng và cấu hình.

## Cấu trúc Files

```
src/
├── components/livekit/
│   ├── VideoConference.tsx      # Component chính cho video conference
│   ├── PreJoin.tsx              # Component để join vào room
│   ├── RoomManager.tsx          # Component quản lý rooms
│   └── VideoConference.module.css
├── pages/livekit/
│   └── LiveKitHomePage.tsx      # Trang chính của LiveKit
├── services/
│   └── livekitService.ts        # Service để gọi API LiveKit
└── types/
    └── livekit.types.ts         # Types cho LiveKit
```

## Routes đã thêm

- `/livekit` - Trang chính LiveKit
- `/livekit/join` - Join vào room
- `/livekit/join/:roomName` - Join vào room cụ thể
- `/livekit/create` - Tạo room mới (chỉ Academic Manager)
- `/livekit/manage` - Quản lý rooms (chỉ Academic Manager)
- `/livekit/room/:roomName` - Video conference room

## Cấu hình Environment Variables

Thêm các biến môi trường sau vào file `.env`:

```env
# LiveKit Server URL
VITE_LIVEKIT_URL=wss://your-livekit-server.com

# API Base URL (nếu khác với hiện tại)
VITE_API_BASE_URL=https://your-api-domain.com/api
```

## Dependencies đã thêm

Các dependencies sau đã được thêm vào `package.json`:

```json
{
  "@livekit/components-react": "^2.9.14",
  "@livekit/components-styles": "^1.1.6",
  "livekit-client": "^2.15.3"
}
```

## Cách sử dụng

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Cấu hình Backend API

Đảm bảo backend của bạn có các endpoints sau:

- `GET /api/LiveKit/token` - Lấy token để join room
- `GET /api/LiveKit/admin-token` - Lấy admin token
- `POST /api/LiveKit/rooms` - Tạo room mới
- `DELETE /api/LiveKit/rooms/{roomName}` - Xóa room
- `GET /api/LiveKit/rooms/{roomName}` - Lấy thông tin room
- `GET /api/LiveKit/rooms/{roomName}/participants` - Lấy danh sách participants
- `POST /api/LiveKit/rooms/{roomName}/broadcast` - Gửi broadcast message
- `POST /api/LiveKit/rooms/{roomName}/participants/{identity}/promote` - Promote participant
- `POST /api/LiveKit/rooms/{roomName}/participants/{identity}/demote` - Demote participant
- `POST /api/LiveKit/rooms/{roomName}/participants/{identity}/mute` - Mute participant
- `DELETE /api/LiveKit/rooms/{roomName}/participants/{identity}` - Remove participant
- `GET /api/LiveKit/rooms/{roomName}/statistics` - Lấy thống kê room

### 3. Sử dụng trong ứng dụng

#### Join vào video conference:

```typescript
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();
navigate("/livekit/join");
```

#### Tạo room mới (chỉ Academic Manager):

```typescript
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();
navigate("/livekit/create");
```

#### Quản lý rooms (chỉ Academic Manager):

```typescript
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();
navigate("/livekit/manage");
```

## Tính năng chính

### 1. Video Conference

- Hỗ trợ video/audio real-time
- Chat trong room
- Quản lý participants
- Layout options (Grid, Focus, Carousel)
- Screen sharing
- Recording (nếu backend hỗ trợ)

### 2. Room Management

- Tạo room mới
- Xem danh sách participants
- Mute/Unmute participants
- Remove participants
- Promote/Demote participants
- Broadcast messages

### 3. Security

- Role-based access control
- Token-based authentication
- Admin privileges cho Academic Manager

## Troubleshooting

### 1. Lỗi kết nối LiveKit Server

- Kiểm tra `VITE_LIVEKIT_URL` trong file `.env`
- Đảm bảo LiveKit server đang chạy
- Kiểm tra firewall/network settings

### 2. Lỗi API calls

- Kiểm tra `VITE_API_BASE_URL` trong file `.env`
- Đảm bảo backend API đang chạy
- Kiểm tra authentication token

### 3. Lỗi permissions

- Đảm bảo user có đúng role (STUDENT hoặc ACADEMIC_MANAGER)
- Kiểm tra ProtectedRoute configuration

## Tích hợp với Navigation

Để thêm link đến LiveKit trong navigation, thêm vào header hoặc sidebar:

```typescript
// Trong Header hoặc Sidebar component
<Button onClick={() => navigate("/livekit")} startIcon={<VideoCallIcon />}>
  Video Conference
</Button>
```

## Customization

### 1. Styling

- Chỉnh sửa `VideoConference.module.css` để thay đổi giao diện
- Sử dụng Material-UI theme để customize colors

### 2. Features

- Thêm tính năng recording
- Customize chat interface
- Thêm file sharing
- Implement breakout rooms

### 3. Integration với Course System

- Liên kết rooms với courses
- Auto-create rooms cho lessons
- Schedule video conferences

## Support

Nếu gặp vấn đề, kiểm tra:

1. Console logs trong browser
2. Network tab trong DevTools
3. Backend logs
4. LiveKit server logs
