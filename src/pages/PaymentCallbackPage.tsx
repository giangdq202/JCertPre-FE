import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import paths from '../routes/path';

const PaymentCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const statusParam = searchParams.get('status');
    const codeParam = searchParams.get('code');
    const cancelParam = searchParams.get('cancel');
    const orderCode = searchParams.get('orderId') || searchParams.get('orderCode');

    // Redirect to appropriate payment page based on status
    if (cancelParam || statusParam === 'cancelled') {
      // Redirect to cancelled page
      navigate(paths.payment_cancelled, { 
        state: { orderCode, from: 'callback' } 
      });
    } else if (statusParam === 'success' || codeParam === '00') {
      // Redirect to success page
      navigate(paths.payment_success, { 
        state: { orderCode, from: 'callback' } 
      });
    } else if (statusParam === 'failed' || statusParam === 'error') {
      // Redirect to error page
      navigate(paths.payment_error, { 
        state: { orderCode, from: 'callback' } 
      });
    } else if (statusParam === 'pending') {
      // Redirect to pending page
      navigate(paths.payment_pending, { 
        state: { orderCode, from: 'callback' } 
      });
    } else {
      // Default to error page if status is unknown
      navigate(paths.payment_error, { 
        state: { orderCode, from: 'callback' } 
      });
    }
  }, [searchParams, navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang xử lý kết quả thanh toán...</p>
      </div>
    </div>
  );
};

export default PaymentCallbackPage; 