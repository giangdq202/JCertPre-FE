import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaHome, FaCreditCard } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';
import paths from '../routes/path';

const PaymentSuccessPage: React.FC = () => {
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

  const handleViewCreditHistory = () => {
    if (userInfo?.roleName === 'STUDENT') {
      navigate(paths.credit_history);
    } else {
      navigate(paths.home);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <FaCheckCircle className="w-12 h-12 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Thanh toán thành công!
        </h1>
        
        <p className="text-gray-600 mb-6 text-lg">
          Cảm ơn bạn đã nạp credit. Credit đã được cộng vào tài khoản của bạn!
        </p>

        {/* Order Information */}
        {orderCode && (
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <p className="text-green-700 font-medium mb-2">Thông tin đơn hàng:</p>
            <p className="text-green-600 text-sm">Mã đơn hàng: {orderCode}</p>
          </div>
        )}

        {/* Current Credit Display */}
        {userInfo && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaCreditCard className="w-5 h-5 text-blue-600" />
              <span className="text-blue-700 font-medium">Credit hiện tại:</span>
            </div>
            <span className="text-2xl font-bold text-blue-900">
              {userInfo.credit || 0} credit
            </span>
          </div>
        )}

        {/* Countdown */}
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <p className="text-green-700 font-medium">
            Tự động chuyển về trang chủ sau {countdown} giây
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {userInfo?.roleName === 'STUDENT' && (
            <button
              onClick={handleViewCreditHistory}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <FaCreditCard className="w-5 h-5" />
              Xem lịch sử credit
            </button>
          )}
          
          <button
            onClick={handleGoHome}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <FaHome className="w-5 h-5" />
            Về trang chủ
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            Credit đã được cộng vào tài khoản của bạn
          </p>
          <p className="text-sm text-gray-500">
            Bạn có thể sử dụng credit để mua khóa học và tham gia kỳ thi
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
