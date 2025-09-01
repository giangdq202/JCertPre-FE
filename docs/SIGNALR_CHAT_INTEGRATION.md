# SignalR Real-Time Chat Integration

This document describes the SignalR integration for real-time chat functionality in the JCertPre application.

## Overview

The application now supports real-time messaging between students and staff using SignalR technology. Messages are delivered instantly without the need to refresh the page or rely on polling.

## Backend Integration

The backend exposes a SignalR hub at `/hubs/chat` with the following functionality:

### ChatHub Methods

- `JoinConversation(Guid conversationId)` - Join a conversation room
- `LeaveConversation(Guid conversationId)` - Leave a conversation room

### Security

- Hub requires `[Authorize]` attribute
- Users can only join conversations they are participants in
- JWT token is required for authentication

### Events

- `MessageCreated` - Fired when a new message is sent to a conversation

## Frontend Implementation

### Services

#### SignalRService (`src/services/signalrService.ts`)

Manages the SignalR connection lifecycle:

- Connection establishment with automatic reconnection
- JWT token-based authentication
- Group management for conversations
- Event handling for received messages

#### useSignalRChat Hook (`src/hooks/useSignalRChat.ts`)

React hook that simplifies SignalR integration:

- Automatic connection management based on authentication state
- Conversation joining/leaving
- Message event handling
- Cleanup on component unmount

### UI Components

#### ChatConnectionStatus (`src/components/chat/ChatConnectionStatus.tsx`)

Visual indicator showing real-time connection status:

- Green/Orange theme support
- Connected/Disconnected states
- Integrated into chat headers

### Pages Updated

#### Student MessagesPage (`src/pages/student/MessagesPage.tsx`)

- Real-time message reception
- Toast notifications for new messages
- Connection status indicator
- Automatic message deduplication

#### Staff StaffMessagesPage (`src/pages/staff/StaffMessagesPage.tsx`)

- Real-time message reception
- Toast notifications for new messages
- Connection status indicator
- Disabled during study plan mode
- Removed polling-based refresh (replaced with real-time)

### Updated Hooks

#### useConversation Hook (`src/hooks/useConversation.ts`)

- Added `setMessages` function to interface
- Exposed message state setter for SignalR updates
- Maintains existing functionality for API calls

## Features

### Real-Time Messaging

- Instant message delivery
- No page refresh required
- Automatic message deduplication
- Proper message ordering by timestamp

### Connection Management

- Automatic connection on page load
- Reconnection handling with backoff strategy
- Graceful degradation when connection is lost
- Visual connection status indicators

### Security

- JWT token authentication
- User authorization for conversations
- Secure WebSocket connections

### User Experience

- Toast notifications for new messages
- Connection status indicators
- Seamless integration with existing UI
- No breaking changes to existing functionality

## Configuration

### Environment Variables

The SignalR service uses the same base URL as other API calls, configured in:

- `src/consts/apiUrl/baseUrl.ts` - `BASE_URL` constant

### Dependencies

- `@microsoft/signalr` - SignalR client library
- Existing dependencies for notifications and UI

## Usage Example

```tsx
// In a chat component
const { isConnected } = useSignalRChat({
  conversationId: conversation?.conversationId || null,
  onMessageReceived: (message) => {
    // Handle incoming message
    console.log("New message:", message);
  },
  enabled: !!conversation,
});
```

## Testing

1. Start the development server: `npm run dev`
2. Ensure backend is running with SignalR hub enabled
3. Log in as both student and staff in different browser tabs
4. Send messages and verify real-time delivery
5. Check connection status indicators
6. Test reconnection by temporarily disconnecting network

## Technical Notes

### Connection URL

SignalR connects to: `{BASE_URL}/hubs/chat` where `BASE_URL` is from the existing API configuration.

### Transport Methods

- Primary: WebSockets
- Fallback: Server-Sent Events
- Automatic transport selection based on browser support

### Reconnection Strategy

- Up to 3 automatic reconnection attempts
- Random delay between 2-4 seconds for each attempt
- Exponential backoff for subsequent attempts

### Message Deduplication

Messages are deduplicated using `messageId` to prevent duplicate display during reconnection or race conditions.

## Future Enhancements

- Typing indicators
- Message read receipts
- Presence status for users
- File sharing capabilities
- Message reactions
- Group chat support
