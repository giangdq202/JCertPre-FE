# Livestream Integration

This document describes the Livestream feature integration with LiveKit for real-time video streaming.

## Overview

The Livestream feature allows instructors to schedule and conduct live video sessions with students. It integrates with the existing LiveKit infrastructure to provide high-quality video conferencing capabilities.

## Features

### Core Features

- **Livestream Scheduling**: Create and manage scheduled livestreams
- **Automatic Start/End**: Livestreams start automatically 15 minutes before scheduled time
- **Role-based Access**: Different permissions for instructors and students
- **Real-time Video**: High-quality video streaming using LiveKit
- **Chat System**: Real-time chat during livestreams
- **Participant Management**: View and manage participants
- **Timetable View**: User-friendly timetable showing all scheduled livestreams

### Status Management

- **SCHEDULED**: Livestream is scheduled but not yet started
- **LIVE**: Livestream is currently active and can be joined
- **COMPLETED**: Livestream has ended

## File Structure

```
src/
├── services/
│   └── livestreamService.ts          # Livestream API service
├── components/
│   └── livestream/
│       ├── LivestreamManager.tsx     # Admin livestream management
│       ├── LivestreamTimetable.tsx   # User timetable view
│       ├── LivestreamJoin.tsx        # Join livestream interface
│       └── LivestreamRoom.tsx        # LiveKit room component
```

## API Endpoints

### Livestream Management

- `POST /api/livestreams` - Create new livestream
- `GET /api/livestreams/{id}` - Get livestream by ID
- `PUT /api/livestreams/{id}` - Update livestream
- `DELETE /api/livestreams/{id}` - Delete livestream

### Livestream Listing

- `GET /api/livestreams` - Get all livestreams with filtering
- `GET /api/livestreams?courseId={id}` - Get livestreams by course
- `GET /api/livestreams?userId={id}` - Get livestreams by user
- `GET /api/livestreams?userId={id}&timetableFormat=true` - Get user timetable

### Join Management

- `GET /api/livestreams/{id}/join-token?userId={id}` - Generate join token
- `GET /api/livestreams/{id}/can-join?userId={id}` - Check join permission

## Components

### LivestreamManager

**Purpose**: Admin interface for managing livestreams
**Features**:

- Create new livestreams
- Edit existing livestreams
- Delete livestreams
- View livestream status
- Join live streams

**Usage**:

```tsx
import LivestreamManager from "../components/livestream/LivestreamManager";

<LivestreamManager />;
```

### LivestreamTimetable

**Purpose**: User interface for viewing scheduled livestreams
**Features**:

- Display user's livestream timetable
- Show livestream status and details
- Join live streams
- Grid and table views

**Usage**:

```tsx
import LivestreamTimetable from "../components/livestream/LivestreamTimetable";

<LivestreamTimetable userId="user-id" />;
```

### LivestreamJoin

**Purpose**: Interface for joining livestreams
**Features**:

- Display livestream details
- Check join permissions
- Generate join tokens
- Navigate to livestream room

**Usage**:

```tsx
import LivestreamJoin from "../components/livestream/LivestreamJoin";

<LivestreamJoin livestreamId="livestream-id" userId="user-id" />;
```

### LivestreamRoom

**Purpose**: LiveKit room for livestream participation
**Features**:

- Real-time video streaming
- Chat functionality
- Participant management
- Multiple layout options (grid, focus, carousel)

**Usage**:

```tsx
import LivestreamRoom from "../components/livestream/LivestreamRoom";

<LivestreamRoom livestreamId="livestream-id" userId="user-id" />;
```

## Service Methods

### LivestreamApiService

```typescript
// Create livestream
await livestreamApi.createLivestream(createData);

// Get livestream by ID
const livestream = await livestreamApi.getLivestreamById(id);

// Update livestream
await livestreamApi.updateLivestream(id, updateData);

// Delete livestream
await livestreamApi.deleteLivestream(id);

// Get livestreams with filtering
const livestreams = await livestreamApi.getLivestreams({
  courseId: "course-id",
  userId: "user-id",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  timetableFormat: true,
  pageIndex: 1,
  pageSize: 10,
});

// Get user timetable
const timetable = await livestreamApi.getLivestreamTimetableByUser(userId);

// Generate join token
const joinData = await livestreamApi.generateJoinToken(livestreamId, userId);

// Check join permission
const canJoin = await livestreamApi.canJoinLivestream(livestreamId, userId);
```

## Data Types

### LivestreamDto

```typescript
interface LivestreamDto {
  livestreamId: string;
  courseId: string;
  description?: string;
  scheduledDateTime: string;
  durationMinutes: number;
  status: LivestreamStatus;
  courseName?: string;
  endDateTime: string;
  isLive: boolean;
  isScheduled: boolean;
  canStart: boolean;
}
```

### LivestreamJoinDto

```typescript
interface LivestreamJoinDto {
  token: string;
  roomName: string;
  title: string;
  scheduledDateTime: string;
  description?: string;
  durationMinutes: number;
}
```

### LivestreamTimetableDto

```typescript
interface LivestreamTimetableDto {
  livestreamId: string;
  courseId: string;
  courseName: string;
  description?: string;
  scheduledDateTime: string;
  durationMinutes: number;
  status: LivestreamStatus;
  endDateTime: string;
  isLive: boolean;
  canJoin: boolean;
  canStart: boolean;
  userRole: UserRoleInCourse;
  startsWithin15Minutes: boolean;
  timeStatus: string;
}
```

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:5001/api
VITE_LIVEKIT_URL=wss://your-livekit-server.com
```

## Dependencies

```json
{
  "@livekit/components-react": "^2.9.14",
  "@livekit/components-styles": "^1.1.6",
  "livekit-client": "^2.15.3",
  "@mui/x-date-pickers": "^6.0.0",
  "date-fns": "^2.30.0"
}
```

## Usage Examples

### Creating a Livestream

```typescript
const createData: CreateLivestreamDto = {
  courseId: "course-id",
  description: "Introduction to React",
  scheduledDateTime: "2024-01-15T10:00:00Z",
  durationMinutes: 60,
};

const livestream = await livestreamApi.createLivestream(createData);
```

### Joining a Livestream

```typescript
// Check if user can join
const canJoin = await livestreamApi.canJoinLivestream(livestreamId, userId);

if (canJoin) {
  // Generate join token
  const joinData = await livestreamApi.generateJoinToken(livestreamId, userId);

  // Navigate to livestream room
  navigate(`/livestream/room/${livestreamId}`);
}
```

### Getting User Timetable

```typescript
const timetable = await livestreamApi.getLivestreamTimetableByUser(userId);

timetable.forEach((item) => {
  console.log(`${item.courseName} - ${item.timeStatus}`);
});
```

## Integration with LiveKit

The livestream feature integrates with LiveKit for video streaming:

1. **Token Generation**: Backend generates LiveKit tokens with appropriate permissions
2. **Room Management**: Each livestream has a unique LiveKit room
3. **Role-based Permissions**: Instructors have full permissions, students have limited permissions
4. **Real-time Features**: Video, audio, chat, and participant management

## Security Considerations

- **Authentication**: All API calls require valid authentication tokens
- **Authorization**: Role-based access control for livestream operations
- **Token Security**: LiveKit tokens are generated server-side with appropriate permissions
- **Permission Checks**: Users can only join livestreams they're enrolled in

## Error Handling

The service includes comprehensive error handling:

```typescript
try {
  const livestream = await livestreamApi.getLivestreamById(id);
} catch (error) {
  if (error.response) {
    // API error with status code
    console.error(
      `API Error ${error.response.status}: ${error.response.data?.message}`
    );
  } else if (error.request) {
    // Network error
    console.error("Network Error: Could not reach the API server");
  } else {
    // Other error
    console.error(`Request Error: ${error.message}`);
  }
}
```

## Future Enhancements

- **Recording**: Automatic livestream recording
- **Analytics**: Viewership and engagement metrics
- **Notifications**: Real-time notifications for livestream events
- **Mobile Support**: Mobile-optimized livestream interface
- **Screen Sharing**: Enhanced screen sharing capabilities
- **Whiteboard**: Interactive whiteboard feature
