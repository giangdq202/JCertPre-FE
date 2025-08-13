import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTimesCircle, FaHome, FaRedo } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';
import paths from '../routes/path';

const PaymentCancelledPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useAuth();
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

  const handleRetry = () => {
    navigate(paths.credit_purchase);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Cancelled Icon */}
        <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
          <FaTimesCircle className="w-12 h-12 text-yellow-600" />
        </div>

        {/* Cancelled Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Thanh toán bị hủy
        </h1>
        
        <p className="text-gray-600 mb-6 text-lg">
          Giao dịch thanh toán đã bị hủy. Bạn có thể thử lại hoặc liên hệ hỗ trợ nếu cần.
        </p>

        {/* Order Information */}
        {orderCode && (
          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <p className="text-yellow-700 font-medium mb-2">Thông tin đơn hàng:</p>
            <p className="text-yellow-600 text-sm">Mã đơn hàng: {orderCode}</p>
          </div>
        )}

        {/* Countdown */}
        <div className="bg-yellow-50 rounded-lg p-4 mb-6">
          <p className="text-yellow-700 font-medium">
            Tự động chuyển về trang chủ sau {countdown} giây
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <FaRedo className="w-5 h-5" />
            Thử lại thanh toán
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
          <p className="text-sm text-gray-500">
            Nếu có vấn đề gì, vui lòng liên hệ hỗ trợ khách hàng
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelledPage;
