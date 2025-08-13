import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaExclamationTriangle, FaHome, FaRedo, FaHeadset } from 'react-icons/fa';
import { useAuth } from '../auth/AuthContext';
import paths from '../routes/path';
import { useNotification } from '../components/notifications';

const PaymentErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useAuth();
  const { error: showError } = useNotification();
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

  const handleContactSupport = () => {
    showError('Liên hệ hỗ trợ', 'Vui lòng liên hệ hỗ trợ khách hàng qua email: support@jcertpre.com');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        {/* Error Icon */}
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <FaExclamationTriangle className="w-12 h-12 text-red-600" />
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Lỗi thanh toán
        </h1>
        
        <p className="text-gray-600 mb-6 text-lg">
          Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.
        </p>

        {/* Order Information */}
        {orderCode && (
          <div className="bg-red-50 rounded-lg p-4 mb-6">
            <p className="text-red-700 font-medium mb-2">Thông tin đơn hàng:</p>
            <p className="text-red-600 text-sm">Mã đơn hàng: {orderCode}</p>
          </div>
        )}

        {/* Countdown */}
        <div className="bg-red-50 rounded-lg p-4 mb-6">
          <p className="text-red-700 font-medium">
            Tự động chuyển về trang chủ sau {countdown} giây
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <FaRedo className="w-5 h-5" />
            Thử lại thanh toán
          </button>
          
          <button
            onClick={handleContactSupport}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <FaHeadset className="w-5 h-5" />
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
          <p className="text-sm text-gray-500">
            Mã lỗi: PAYMENT_ERROR_{new Date().getTime()}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Vui lòng ghi nhớ mã này khi liên hệ hỗ trợ
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentErrorPage;
