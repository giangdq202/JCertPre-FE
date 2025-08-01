import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  onClick?: () => void;
  text?: string;
  className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ 
  onClick, 
  text = "Quay lại", 
  className = "flex items-center text-gray-600 hover:text-green-700" 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={className}
    >
      <FaArrowLeft className="mr-2" /> 
      {text}
    </button>
  );
};

export default BackButton; 