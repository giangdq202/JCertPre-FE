import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StaffHeader from '../../components/header/StaffHeader';
import StaffSidebar from '../../components/sidebar/StaffSidebar';
import { 
  HiOutlineChatBubbleLeftRight, 
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineArrowLeft
} from 'react-icons/hi2';
import { MdOutlineSend } from 'react-icons/md';

interface Message {
  id: string;
  content: string;
  sender: 'student' | 'academic_manager';
  timestamp: Date;
  isRead: boolean;
}

interface StudentInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

const StaffMessagesPage: React.FC = () => {
  const { inquiryId } = useParams<{ inquiryId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock data for demonstration
  useEffect(() => {
    // Mock student info based on inquiryId
    const mockStudentInfo: StudentInfo = {
      id: inquiryId || '1',
      name: 'Nguyễn Văn An',
      email: 'nguyenvanan@email.com',
      avatar: 'https://placehold.co/40x40/cccccc/ffffff?text=NA'
    };

    // Mock messages
    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Chào cô! Em muốn hỏi về khóa học N1, em có thể học được không?',
        sender: 'student',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        isRead: true
      },
      {
        id: '2',
        content: 'Chào bạn! Tất nhiên rồi! Khóa học N1 phù hợp với những bạn đã có nền tảng N2. Bạn có thể chia sẻ trình độ hiện tại của mình không?',
        sender: 'academic_manager',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        isRead: true
      },
      {
        id: '3',
        content: 'Em đã học xong N2 và muốn thi N1 vào tháng 7. Em có thể học online được không?',
        sender: 'student',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        isRead: true
      },
      {
        id: '4',
        content: 'Hoàn toàn được! Chúng tôi có khóa học online với lịch học linh hoạt. Bạn có muốn tôi gửi thông tin chi tiết không?',
        sender: 'academic_manager',
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        isRead: true
      },
      {
        id: '5',
        content: 'Vâng, em muốn xem thông tin chi tiết ạ!',
        sender: 'student',
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
        isRead: true
      }
    ];

    setStudentInfo(mockStudentInfo);
    setMessages(mockMessages);
  }, [inquiryId]);

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
      sender: 'academic_manager',
      timestamp: new Date(),
      isRead: false
    };

    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    setIsLoading(false);
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

  if (!studentInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StaffHeader />
        <div className="flex">
          <StaffSidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <HiOutlineChatBubbleLeftRight className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Không tìm thấy thông tin học viên
              </h3>
              <p className="text-gray-500">
                Vui lòng quay lại trang yêu cầu tư vấn
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StaffHeader />
      <div className="flex">
        <StaffSidebar />
        
        <div className="flex-1 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/staff/inquiries')}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <HiOutlineArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <img
                    src={studentInfo.avatar}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {studentInfo.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {studentInfo.email}
                    </p>
                  </div>
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
                className={`flex ${message.sender === 'academic_manager' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.sender === 'academic_manager'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className={`flex items-center justify-end gap-1 mt-2 text-xs ${
                    message.sender === 'academic_manager' ? 'text-orange-100' : 'text-gray-500'
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isLoading}
                className="bg-orange-500 text-white p-3 rounded-xl hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
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

export default StaffMessagesPage; 