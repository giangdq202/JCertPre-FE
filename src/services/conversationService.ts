import axiosInstance from "../consts/axios/axiosInstance";
import {
  CONVERSATION_BASE_URL,
  CREATE_CONVERSATION_URL,
  SEND_MESSAGE_URL,
  ASSIGN_INSTRUCTOR_URL,
  GET_CONVERSATION_BY_ID_URL
} from "../consts/apiUrl/baseUrl";

// Types based on the ACTUAL API Controller DTOs (camelCase)
export interface AppUserDto {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  credit?: number;
  createdAt?: string;
  lastLogin?: string;
  status?: number;
  roleId?: string;
  roleName?: string;
}

export interface MessageDto {
  messageId: string;
  content: string;
  senderId: string;
  senderName: string;
  conversationId: string;
  sentAt: string;
}

export interface ConversationDto {
  conversationId: string;
  conversationName: string;
  createdAt: string;
  participants: AppUserDto[];
  messages: MessageDto[];
}

export interface MessageRequest {
  Content: string;
  senderId: string;
}

export interface ApiErrorResponse {
  StatusCode: number;
  ErrorCode: string;
  Message: string;
}

// Service functions
export const createConversation = async (studentId: string): Promise<ConversationDto> => {
  try {
    const response = await axiosInstance.post<ConversationDto>(
      `${CREATE_CONVERSATION_URL}?studentId=${studentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Create conversation API error:", error);
    throw error;
  }
};

export const sendMessage = async (
  conversationId: string, 
  messageRequest: MessageRequest
): Promise<MessageDto> => {
  try {
    const response = await axiosInstance.post<MessageDto>(
      SEND_MESSAGE_URL(conversationId),
      messageRequest
    );
    return response.data;
  } catch (error) {
    console.error("Send message API error:", error);
    throw error;
  }
};

export const assignInstructor = async (
  conversationId: string, 
  instructorId: string
): Promise<void> => {
  try {
    await axiosInstance.post(
      `${ASSIGN_INSTRUCTOR_URL(conversationId)}?instructorId=${instructorId}`
    );
  } catch (error) {
    console.error("Assign instructor API error:", error);
    throw error;
  }
};

export const getConversation = async (conversationId: string): Promise<ConversationDto> => {
  try {
    const response = await axiosInstance.get<ConversationDto>(
      GET_CONVERSATION_BY_ID_URL(conversationId)
    );
    return response.data;
  } catch (error) {
    console.error("Get conversation API error:", error);
    throw error;
  }
};

export const getMyConversations = async (userId: string): Promise<ConversationDto[]> => {
  try {
    const response = await axiosInstance.get<ConversationDto[]>(
      `${CONVERSATION_BASE_URL}/my-conversations/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error("Get my conversations API error:", error);
    throw error;
  }
};

// Debug: Check API response structure
export const debugConversationAPI = async (userId: string) => {
  try {
    console.log('Testing conversation API with userId:', userId);
    const conversations = await getMyConversations(userId);
    console.log('API Response:', conversations);
    
    if (conversations.length > 0) {
      const firstConv = conversations[0];
      console.log('First conversation structure:', {
        conversationId: firstConv.conversationId,
        conversationName: firstConv.conversationName,
        createdAt: firstConv.createdAt,
        participants: firstConv.participants,
        messages: firstConv.messages
      });
      
      if (firstConv.messages && firstConv.messages.length > 0) {
        console.log('First message structure:', firstConv.messages[0]);
      }
    }
  } catch (error) {
    console.error('Debug error:', error);
  }
};

// Example usage functions (you can remove these after testing)
export const conversationServiceExamples = {
  // Example: Create a new conversation for a student
  async createNewConversation(studentId: string) {
    try {
      const conversation = await createConversation(studentId);
      console.log('New conversation created:', conversation);
      return conversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw error;
    }
  },

  // Example: Send a message in a conversation
  async sendNewMessage(conversationId: string, senderId: string, content: string) {
    try {
      const messageRequest: MessageRequest = {
        Content: content,
        senderId: senderId
      };
      const message = await sendMessage(conversationId, messageRequest);
      console.log('Message sent:', message);
      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  // Example: Get all conversations for a user
  async loadUserConversations(userId: string) {
    try {
      const conversations = await getMyConversations(userId);
      console.log('User conversations:', conversations);
      return conversations;
    } catch (error) {
      console.error('Failed to load conversations:', error);
      throw error;
    }
  },

  // Example: Get conversation details with messages
  async loadConversationDetails(conversationId: string) {
    try {
      const conversation = await getConversation(conversationId);
      console.log('Conversation details:', conversation);
      return conversation;
    } catch (error) {
      console.error('Failed to load conversation details:', error);
      throw error;
    }
  },

  // Example: Assign an instructor to a conversation
  async addInstructorToConversation(conversationId: string, instructorId: string) {
    try {
      await assignInstructor(conversationId, instructorId);
      console.log('Instructor assigned successfully');
    } catch (error) {
      console.error('Failed to assign instructor:', error);
      throw error;
    }
  }
};
