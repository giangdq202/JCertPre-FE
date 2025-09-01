import { useState, useEffect, useCallback } from 'react';
import {
  ConversationDto,
  MessageDto,
  MessageRequest,
  createConversation,
  sendMessage,
  getConversation,
  getMyConversations
} from '../services/conversationService';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

export interface UseConversationReturn {
  conversations: ConversationDto[];
  currentConversation: ConversationDto | null;
  messages: MessageDto[];
  isLoading: boolean;
  isSendingMessage: boolean;
  error: string | null;
  
  // Actions
  loadConversations: () => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  createNewConversation: () => Promise<void>;
  sendNewMessage: (content: string) => Promise<void>;
  setCurrentConversation: (conversation: ConversationDto | null) => void;
  setMessages: (messages: MessageDto[] | ((prev: MessageDto[]) => MessageDto[])) => void;
}

export const useConversation = (): UseConversationReturn => {
  const { userInfo } = useAuth();
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [currentConversation, setCurrentConversation] = useState<ConversationDto | null>(null);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all conversations for current user
  const loadConversations = useCallback(async (showToast = false) => {
    if (!userInfo?.id) return;

    if (showToast) setIsLoading(true);
    setError(null);
    
    try {
      const userConversations = await getMyConversations(userInfo.id);
      
      // Sắp xếp conversations theo thời gian tạo (mới nhất trước)
      const sortedConversations = userConversations.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setConversations(sortedConversations);
      
      // Nếu chưa có currentConversation, chọn conversation đầu tiên
      if (!currentConversation && sortedConversations.length > 0) {
        const firstConversation = sortedConversations[0];
        setCurrentConversation(firstConversation);
        
        // Sắp xếp messages theo thời gian (cũ nhất trước)
        const sortedMessages = (firstConversation.messages || []).sort((a, b) => 
          new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );
        setMessages(sortedMessages);
      }
      
    } catch (err) {
      console.error('Failed to load conversations:', err);
      if (showToast) {
        setError('Không thể tải danh sách cuộc hội thoại');
        toast.error('Không thể tải danh sách cuộc hội thoại');
      }
    } finally {
      if (showToast) setIsLoading(false);
    }
  }, [userInfo?.id, currentConversation]);

  // Load specific conversation with messages
  const loadConversation = useCallback(async (conversationId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const conversation = await getConversation(conversationId);
      setCurrentConversation(conversation);
      
      // Sắp xếp messages theo thời gian (cũ nhất trước)
      const sortedMessages = (conversation.messages || []).sort((a, b) => 
        new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      );
      setMessages(sortedMessages);
    } catch (err) {
      console.error('Failed to load conversation:', err);
      setError('Không thể tải cuộc hội thoại');
      toast.error('Không thể tải cuộc hội thoại');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new conversation for student
  const createNewConversation = useCallback(async () => {
    if (!userInfo?.id) {
      toast.error('Không thể xác định thông tin người dùng');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const newConversation = await createConversation(userInfo.id);
      setCurrentConversation(newConversation);
      setMessages(newConversation.messages || []);
      
      // Add to conversations list
      setConversations(prev => [newConversation, ...prev]);
      
      toast.success('Tạo cuộc hội thoại thành công!');
    } catch (err) {
      console.error('Failed to create conversation:', err);
      setError('Không thể tạo cuộc hội thoại');
      toast.error('Không thể tạo cuộc hội thoại');
    } finally {
      setIsLoading(false);
    }
  }, [userInfo?.id]);

  // Send message in current conversation
  const sendNewMessage = useCallback(async (content: string) => {
    if (!currentConversation || !userInfo?.id) {
      toast.error('Không thể gửi tin nhắn');
      return;
    }

    setIsSendingMessage(true);
    setError(null);
    
    try {
      const messageRequest: MessageRequest = {
        Content: content.trim(),
        senderId: userInfo.id
      };

      const newMessage = await sendMessage(currentConversation.conversationId, messageRequest);
      
      // Add message to current messages (sắp xếp theo thời gian)
      setMessages(prev => {
        const updatedMessages = [...prev, newMessage];
        return updatedMessages.sort((a, b) => 
          new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
        );
      });
      
      // Update conversation's last message in conversations list
      setConversations(prev => 
        prev.map(conv => 
          conv.conversationId === currentConversation.conversationId
            ? { ...conv, messages: [...(conv.messages || []), newMessage] }
            : conv
        )
      );

    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Không thể gửi tin nhắn');
      toast.error('Không thể gửi tin nhắn');
    } finally {
      setIsSendingMessage(false);
    }
  }, [currentConversation, userInfo?.id]);

  // Auto-load conversations when user is available and setup auto-refresh
  useEffect(() => {
    if (!userInfo?.id) return;

    // Load conversations initially
    const initializeConversations = async () => {
      try {
        const userConversations = await getMyConversations(userInfo.id);
        
        if (userConversations.length === 0) {
          // Tự động tạo conversation nếu chưa có
          console.log('No conversations found, creating new conversation...');
          await createNewConversation();
        } else {
          // Load existing conversations
          await loadConversations(true);
        }
      } catch (error) {
        console.error('Failed to initialize conversations:', error);
      }
    };

    initializeConversations();

    // Auto-refresh conversations every 10 seconds (increased from 5 seconds)
    const interval = setInterval(() => {
      if (userInfo?.id) {
        loadConversations(false); // Silent refresh without loading indicators
      }
    }, 10000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [userInfo?.id, loadConversations, createNewConversation]);

  return {
    conversations,
    currentConversation,
    messages,
    isLoading,
    isSendingMessage,
    error,
    loadConversations,
    loadConversation,
    createNewConversation,
    sendNewMessage,
    setCurrentConversation,
    setMessages // Expose setMessages for SignalR updates
  };
};
