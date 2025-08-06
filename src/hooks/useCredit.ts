import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { checkSufficientCredit } from '../services/paymentService';

export const useCredit = () => {
  const { userInfo } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  const checkCredit = async (requiredAmount: number): Promise<boolean> => {
    if (!userInfo?.id) {
      return false;
    }

    setIsChecking(true);
    try {
      const result = await checkSufficientCredit(userInfo.id, requiredAmount);
      return result.hasSufficientCredit;
    } catch (error) {
      console.error('Check credit error:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  const getCurrentCredit = (): number => {
    return userInfo?.credit || 0;
  };

  const hasEnoughCredit = (requiredAmount: number): boolean => {
    const currentCredit = getCurrentCredit();
    return currentCredit >= requiredAmount;
  };

  return {
    currentCredit: getCurrentCredit(),
    checkCredit,
    hasEnoughCredit,
    isChecking,
    userId: userInfo?.id
  };
}; 