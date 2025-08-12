import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaClock, FaHome, FaEnvelope, FaHeadset } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';
import paths from '../routes/path';
import { useNotification } from '../components/notifications';

const PaymentPendingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useAuth();
  const { info: showInfo } = useNotification();
  const [countdown, setCountdown] = useState(5);
  
  // Get order information from navigation state
  const orderCode = location.state?.orderCode;
  const fromCallback = location.state?.from === 'callback';

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Redirect to student home if user is student, otherwise general home
          if (userInfo?.roleName === 'STUDENT') {
            navigate(paths.student_home);
          } else {
            navigate(paths.home);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, userInfo?.roleName]);

  const handleGoHome = () => {
    if (userInfo?.roleName === 'STUDENT') {
      navigate(paths.student_home);
    } else {
      navigate(paths.home);
    }
  };

  const handleContactSupport = () => {
    showInfo('Liên hệ hỗ trợ', 'Vui lòng kiểm tra email hoặc liên hệ hỗ trợ để biết trạng thái giao dịch');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Pending Icon */}
        <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <FaClock className="w-12 h-12 text-blue-600" />
        </div>

        {/* Pending Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Giao dịch đang xử lý
        </h1>
        
        <p className="text-gray-600 mb-6 text-lg">
          Giao dịch thanh toán của bạn đang được xử lý. Vui lòng chờ trong giây lát.
        </p>

        {/* Order Information */}
        {orderCode && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-blue-700 font-medium mb-2">Thông tin đơn hàng:</p>
            <p className="text-blue-600 text-sm">Mã đơn hàng: {orderCode}</p>
          </div>
        )}

        {/* Status Info */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-blue-700 font-medium mb-2">
            Trạng thái: Đang xử lý
          </p>
          <p className="text-blue-600 text-sm">
            Giao dịch sẽ được hoàn tất trong vòng 24 giờ
          </p>
        </div>

        {/* Countdown */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-gray-700 font-medium">
            Tự động chuyển về trang chủ sau {countdown} giây
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleContactSupport}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <FaEnvelope className="w-5 h-5" />
            Liên hệ hỗ trợ
          </button>
          
          <button
            onClick={handleGoHome}
            className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <FaHome className="w-5 h-5" />
            Về trang chủ
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            Mã giao dịch: {orderCode || `TXN_${new Date().getTime()}`}
          </p>
          <p className="text-sm text-gray-500">
            Bạn sẽ nhận được email xác nhận khi giao dịch hoàn tất
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPendingPage;
