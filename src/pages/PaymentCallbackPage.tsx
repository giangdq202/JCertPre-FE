import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { FiCheckCircle, FiXCircle, FiClock, FiCreditCard } from 'react-icons/fi';

const PaymentCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userInfo } = useAuth();
  const [status, setStatus] = useState<'success' | 'failed' | 'pending' | 'loading'>('loading');
  const [message, setMessage] = useState<string>('');
  const [orderCode, setOrderCode] = useState<string>('');

  useEffect(() => {
    const orderCodeParam = searchParams.get('orderId') || searchParams.get('orderCode');
    const statusParam = searchParams.get('status');
    const codeParam = searchParams.get('code');
    const cancelParam = searchParams.get('cancel');

    setOrderCode(orderCodeParam || '');

    if (cancelParam) {
      setStatus('failed');
      setMessage('Thanh toán đã bị hủy bởi người dùng');
    } else if (statusParam === 'success' || codeParam === '00') {
      setStatus('success');
      setMessage('Thanh toán thành công! Credit đã được cộng vào tài khoản của bạn.');
    } else if (statusParam === 'failed') {
      setStatus('failed');
      setMessage('Thanh toán thất bại. Vui lòng thử lại.');
    } else {
      setStatus('pending');
      setMessage('Đang xử lý thanh toán. Vui lòng chờ trong giây lát...');
    }

    // Auto redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/student/home');
    }, 5000);

    return () => clearTimeout(timer);
  }, [searchParams, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <FiCheckCircle className="h-16 w-16 text-green-600" />;
      case 'failed':
        return <FiXCircle className="h-16 w-16 text-red-600" />;
      case 'pending':
        return <FiClock className="h-16 w-16 text-yellow-600" />;
      default:
        return <FiCreditCard className="h-16 w-16 text-blue-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const handleGoHome = () => {
    navigate('/student/home');
  };

  const handleTryAgain = () => {
    navigate('/credit-purchase');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
        {/* Status Icon */}
        <div className="text-center mb-6">
          {getStatusIcon()}
        </div>

        {/* Status Message */}
        <div className={`border rounded-xl p-4 mb-6 ${getStatusColor()}`}>
          <h2 className="text-xl font-bold mb-2">
            {status === 'success' && 'Thanh toán thành công!'}
            {status === 'failed' && 'Thanh toán thất bại'}
            {status === 'pending' && 'Đang xử lý'}
            {status === 'loading' && 'Đang kiểm tra...'}
          </h2>
          <p className="text-sm">{message}</p>
        </div>

        {/* Order Details */}
        {orderCode && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Thông tin đơn hàng:</h3>
            <p className="text-sm text-gray-600">Mã đơn hàng: {orderCode}</p>
          </div>
        )}

        {/* Current Credit Display */}
        {status === 'success' && userInfo && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">Credit hiện tại:</span>
              <span className="text-lg font-bold text-green-900">
                {userInfo.credit || 0} credit
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {status === 'failed' && (
            <button
              onClick={handleTryAgain}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition duration-200"
            >
              Thử lại
            </button>
          )}
          <button
            onClick={handleGoHome}
            className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-medium transition duration-200"
          >
            Về trang chủ
          </button>
        </div>

        {/* Auto Redirect Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Tự động chuyển về trang chủ sau 5 giây...
          </p>
        </div>

        {/* Additional Info */}
        {status === 'success' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Lưu ý:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Credit đã được cộng vào tài khoản của bạn</li>
              <li>• Bạn có thể sử dụng credit để mua khóa học</li>
              <li>• Xem lịch sử giao dịch trong phần Credit</li>
            </ul>
          </div>
        )}

        {status === 'failed' && (
          <div className="mt-6 p-4 bg-red-50 rounded-xl">
            <h4 className="text-sm font-medium text-red-900 mb-2">Hỗ trợ:</h4>
            <ul className="text-xs text-red-800 space-y-1">
              <li>• Kiểm tra lại thông tin thanh toán</li>
              <li>• Đảm bảo tài khoản có đủ số dư</li>
              <li>• Liên hệ hỗ trợ nếu vấn đề tiếp tục</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentCallbackPage; 