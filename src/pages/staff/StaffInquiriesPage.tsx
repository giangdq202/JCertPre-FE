import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffHeader from '../../components/header/StaffHeader';
import StaffSidebar from '../../components/sidebar/StaffSidebar';
import { 
  HiOutlineChatBubbleLeftRight,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineArrowRight
} from 'react-icons/hi2';

interface Inquiry {
  id: string;
  studentName: string;
  studentEmail: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  status: 'new' | 'in_progress' | 'resolved';
}

const StaffInquiriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockInquiries: Inquiry[] = [
      {
        id: '1',
        studentName: 'Nguyễn Văn An',
        studentEmail: 'nguyenvanan@email.com',
        lastMessage: 'Em muốn hỏi về khóa học N1, em có thể học được không?',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        unreadCount: 2,
        status: 'new'
      },
      {
        id: '2',
        studentName: 'Trần Thị Bình',
        studentEmail: 'tranthibinh@email.com',
        lastMessage: 'Tôi muốn đăng ký thi thử vào tuần tới',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        unreadCount: 1,
        status: 'in_progress'
      },
      {
        id: '3',
        studentName: 'Lê Văn Cường',
        studentEmail: 'levancuong@email.com',
        lastMessage: 'Bạn có thể gợi ý phương pháp học từ vựng hiệu quả không?',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        unreadCount: 0,
        status: 'resolved'
      },
      {
        id: '4',
        studentName: 'Phạm Thị Dung',
        studentEmail: 'phamthidung@email.com',
        lastMessage: 'Em cần tư vấn về lịch học online',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        unreadCount: 3,
        status: 'new'
      },
      {
        id: '5',
        studentName: 'Hoàng Văn Em',
        studentEmail: 'hoangvanem@email.com',
        lastMessage: 'Cảm ơn bạn đã tư vấn!',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        unreadCount: 0,
        status: 'resolved'
      }
    ];

    // Simulate API call
    setTimeout(() => {
      setInquiries(mockInquiries);
      setLoading(false);
    }, 1000);
  }, []);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes} phút trước`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} giờ trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new':
        return 'Mới';
      case 'in_progress':
        return 'Đang xử lý';
      case 'resolved':
        return 'Đã giải quyết';
      default:
        return 'Không xác định';
    }
  };

  const handleViewChat = (inquiryId: string) => {
    navigate(`/staff/messages/${inquiryId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StaffHeader />
        <div className="flex">
          <StaffSidebar />
          <div className="flex-1 p-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-4 border-orange-500 border-opacity-25"></div>
              <span className="ml-4 text-gray-600">Đang tải yêu cầu tư vấn...</span>
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
        
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Yêu cầu tư vấn
            </h1>
            <p className="text-gray-600">
              Quản lý các yêu cầu tư vấn từ học viên
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Yêu cầu mới
              </h3>
              <p className="text-3xl font-bold text-red-600 mb-4">
                {inquiries.filter(i => i.status === 'new').length}
              </p>
              <button className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                Xem yêu cầu
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Đang xử lý
              </h3>
              <p className="text-3xl font-bold text-yellow-600 mb-4">
                {inquiries.filter(i => i.status === 'in_progress').length}
              </p>
              <button className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors">
                Xem chi tiết
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Đã giải quyết
              </h3>
              <p className="text-3xl font-bold text-green-600 mb-4">
                {inquiries.filter(i => i.status === 'resolved').length}
              </p>
              <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                Xem báo cáo
              </button>
            </div>
          </div>

          {/* Inquiries Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <HiOutlineUser className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {inquiry.studentName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {inquiry.studentEmail}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                    {getStatusText(inquiry.status)}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {inquiry.lastMessage}
                  </p>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <HiOutlineClock className="w-3 h-3" />
                    {formatTime(inquiry.lastMessageTime)}
                  </div>
                  {inquiry.unreadCount > 0 && (
                    <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-1">
                      {inquiry.unreadCount} tin nhắn mới
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleViewChat(inquiry.id)}
                  className="w-full bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <span>Đi đến cuộc trò chuyện</span>
                  <HiOutlineArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {inquiries.length === 0 && (
            <div className="text-center py-12">
              <HiOutlineChatBubbleLeftRight className="mx-auto text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Không có yêu cầu tư vấn
              </h3>
              <p className="text-gray-500">
                Hiện tại chưa có yêu cầu tư vấn nào từ học viên
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffInquiriesPage; 