import { useEffect, useCallback, useRef } from 'react';
import { signalrService } from '../services/signalrService';
import { MessageDto } from '../services/conversationService';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

export interface UseSignalRChatOptions {
  conversationId: string | null;
  onMessageReceived?: (message: MessageDto) => void;
  enabled?: boolean;
}

export const useSignalRChat = ({ 
  conversationId, 
  onMessageReceived,
  enabled = true 
}: UseSignalRChatOptions) => {
  const { jwtToken } = useAuth();
  const isInitialized = useRef(false);
  const currentConversationId = useRef<string | null>(null);
  const messageHandlerRef = useRef<((message: MessageDto) => void) | null>(null);

  // Store the latest callback in ref to avoid stale closures
  messageHandlerRef.current = onMessageReceived || null;

  // Initialize connection - similar to demo's ensureConnection
  const ensureConnection = useCallback(async () => {
    if (!jwtToken || !enabled) {
      return false;
    }

    try {
      if (!signalrService.isConnected()) {
        await signalrService.startConnection(jwtToken);
      }
      
      // Set up message handler
      signalrService.offMessageReceived(); // Clear previous handlers
      signalrService.onMessageReceived((message: MessageDto) => {
        if (messageHandlerRef.current) {
          messageHandlerRef.current(message);
        }
      });
      
      isInitialized.current = true;
      return true;
    } catch (error) {
      console.error('Failed to ensure SignalR connection:', error);
      
      // More user-friendly error messages
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('401')) {
        toast.warn('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      } else if (errorMessage.includes('404')) {
        toast.info('Tính năng chat real-time tạm thời không khả dụng');
      } else {
        console.log('SignalR không khả dụng, sử dụng chế độ thường'); // Silent fallback
      }
      
      return false;
    }
  }, [jwtToken, enabled]);

  // Join conversation - similar to demo's joinRoom
  const joinRoom = useCallback(async () => {
    if (!conversationId || !enabled) {
      return;
    }

    try {
      const connected = await ensureConnection();
      if (!connected) {
        return;
      }

      // Leave previous conversation if different
      if (currentConversationId.current && currentConversationId.current !== conversationId) {
        try {
          await signalrService.leaveConversation(currentConversationId.current);
        } catch (error) {
          console.warn('Failed to leave previous conversation:', error);
        }
      }

      // Join new conversation
      if (currentConversationId.current !== conversationId) {
        console.log(`[useSignalRChat] Attempting to join conversation: ${conversationId}`);
        await signalrService.joinConversation(conversationId);
        currentConversationId.current = conversationId;
        console.log(`[useSignalRChat] Successfully joined conversation: ${conversationId}`);
      } else {
        console.log(`[useSignalRChat] Already in conversation: ${conversationId}`);
      }
    } catch (error) {
      console.error('Failed to join conversation:', error);
    }
  }, [conversationId, enabled, ensureConnection]);

  // Initialize connection when enabled
  useEffect(() => {
    if (enabled && jwtToken && !isInitialized.current) {
      ensureConnection();
    }
  }, [enabled, jwtToken, ensureConnection]);

  // Join conversation when conversationId changes
  useEffect(() => {
    if (enabled && conversationId && signalrService.isConnected()) {
      joinRoom();
    }
  }, [conversationId, enabled, joinRoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentConversationId.current) {
        signalrService.leaveConversation(currentConversationId.current).catch(console.warn);
        currentConversationId.current = null;
      }
      signalrService.offMessageReceived();
    };
  }, []);

  return {
    isConnected: signalrService.isConnected(),
    joinConversation: signalrService.joinConversation,
    leaveConversation: signalrService.leaveConversation,
    ensureConnection
  };
};
