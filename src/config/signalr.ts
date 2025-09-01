// SignalR Feature Toggle Configuration
export const SIGNALR_CONFIG = {
  // Set này thành true khi backend đã cấu hình SignalR
  ENABLED: true, // Enable để test với demo backend
  
  // Debugging mode
  DEBUG_MODE: true,
  
  // Reconnection settings
  MAX_RECONNECT_ATTEMPTS: 3,
  RECONNECT_DELAY_MIN: 2000,
  RECONNECT_DELAY_MAX: 4000,
  
  // Hub endpoint
  HUB_ENDPOINT: '/hubs/chat',
  
  // Transport methods priority
  TRANSPORT_METHODS: [
    'WebSockets',
    'ServerSentEvents', 
    'LongPolling'
  ]
};

// Environment check
export const isSignalRAvailable = () => {
  return SIGNALR_CONFIG.ENABLED && typeof window !== 'undefined';
};

// Development helpers
export const signalRDebugLog = (message: string, ...args: any[]) => {
  if (SIGNALR_CONFIG.DEBUG_MODE) {
    console.log(`[SignalR] ${message}`, ...args);
  }
};
