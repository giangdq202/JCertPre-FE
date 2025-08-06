import React, { useState, useEffect, useRef } from 'react';
import StudentHeader from '../../components/header/StudentHeader';
import StudentSideBar from '../../components/sidebar/StudentSideBar';
import { 
  HiOutlineChatBubbleLeftRight, 
  HiOutlineClock,
  HiOutlineUser
} from 'react-icons/hi2';
import { MdOutlineSend } from 'react-icons/md';

interface Message {
  id: string;
  content: string;
  sender: 'student' | 'academic_manager';
  timestamp: Date;
  isRead: boolean;
}

const MessagesPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data for demonstration
  useEffect(() => {
    // Mock messages
    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Chào bạn! Tôi là Academic Manager, có thể giúp gì cho bạn?',
        sender: 'academic_manager',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        isRead: true
      },
      {
        id: '2',
        content: 'Chào cô! Em muốn hỏi về khóa học N1, em có thể học được không?',
        sender: 'student',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        isRead: true
      },
      {
        id: '3',
        content: 'Tất nhiên rồi! Khóa học N1 phù hợp với những bạn đã có nền tảng N2. Bạn có thể chia sẻ trình độ hiện tại của mình không?',
        sender: 'academic_manager',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        isRead: true
      },
      {
        id: '4',
        content: 'Em đã học xong N2 và muốn thi N1 vào tháng 7. Em có thể học online được không?',
        sender: 'student',
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        isRead: true
      },
      {
        id: '5',
        content: 'Hoàn toàn được! Chúng tôi có khóa học online với lịch học linh hoạt. Bạn có muốn tôi gửi thông tin chi tiết không?',
        sender: 'academic_manager',
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        isRead: true
      },
      {
        id: '6',
        content: 'Cảm ơn bạn đã tư vấn!',
        sender: 'student',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        isRead: true
      }
    ];

    setMessages(mockMessages);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const newMsg: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: 'student',
      timestamp: new Date(),
      isRead: false
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    setIsLoading(false);

    // Simulate academic manager response after 2 seconds
    setTimeout(() => {
      const responseMsg: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Cảm ơn bạn đã liên hệ! Tôi sẽ phản hồi sớm nhất có thể.',
        sender: 'academic_manager',
        timestamp: new Date(),
        isRead: false
      };
      setMessages(prev => [...prev, responseMsg]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="flex">
        <StudentSideBar />
        
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <HiOutlineUser className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Tư vấn học tập
                  </h3>
                  <p className="text-sm text-gray-500">
                    Academic Manager
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <span className="flex items-center gap-1 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Đang hoạt động
                </span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'student' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === 'student'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className={`flex items-center justify-end gap-1 mt-2 text-xs ${
                    message.sender === 'student' ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    <HiOutlineClock className="w-3 h-3" />
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-6 border-t border-gray-200 bg-white">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isLoading}
                className="bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <MdOutlineSend className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Nhấn Enter để gửi, Shift + Enter để xuống dòng
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage; 