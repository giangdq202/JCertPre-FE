import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import paths from '../../routes/path';

/**
 * Component to handle redirects from backend payment return endpoint
 * This should be used when backend redirects to frontend after processing PayOS callback
 */
const PaymentReturnHandler: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const status = searchParams.get('status');
    const cancel = searchParams.get('cancel');
    const orderCode = searchParams.get('orderCode') || searchParams.get('id');

    // Determine where to redirect based on payment result
    let redirectPath = paths.payment_error; // Default fallback
    
    if (cancel === 'true' || status === 'CANCELLED') {
      redirectPath = paths.payment_cancelled;
    } else if (code === '00' || status === 'PAID') {
      redirectPath = paths.payment_success;
    } else if (status === 'PENDING') {
      redirectPath = paths.payment_pending;
    } else if (status === 'FAILED' || code !== '00') {
      redirectPath = paths.payment_error;
    }

    // Navigate with order information
    navigate(redirectPath, {
      state: {
        orderCode,
        from: 'backend-return'
      },
      replace: true // Replace current history entry
    });
  }, [searchParams, navigate]);

  // Show loading while processing
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang xử lý kết quả thanh toán...</p>
        <p className="text-gray-500 text-sm mt-2">Vui lòng chờ trong giây lát...</p>
      </div>
    </div>
  );
};

export default PaymentReturnHandler;
