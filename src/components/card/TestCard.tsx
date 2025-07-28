import React from "react";
import { FiClock, FiPlayCircle } from "react-icons/fi";

interface TestCardProps {
  title: string;
  description: string;
  durationMinutes: number;
  availableFrom: string;
  availableTo: string;
  maxAttempts: number;
  status: number;
}

const TestCard: React.FC<TestCardProps> = ({
  title,
  description,
  durationMinutes,
  availableFrom,
  availableTo,
  maxAttempts,
  status,
}) => {
  const statusLabel = () => {
    switch (status) {
      case 0:
        return "Chưa làm";
      case 1:
        return "Đang mở";
      case 2:
        return "Đã hoàn thành";
      default:
        return "Không xác định";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg hover:ring-2 hover:ring-green-500 transition p-5 flex flex-col justify-between">
      {/* Title & Status */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-2">{title}</h4>
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">{description}</p>
      </div>

      {/* Info */}
      <div className="text-sm text-gray-500 space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <FiClock className="text-green-500" />
          <span>Thời gian: {durationMinutes} phút</span>
        </div>
        <p>Thời gian mở: {new Date(availableFrom).toLocaleDateString()}</p>
        <p>Đóng: {new Date(availableTo).toLocaleDateString()}</p>
        <p>Lượt thi tối đa: {maxAttempts}</p>
        <p className="font-medium text-gray-700">Trạng thái: {statusLabel()}</p>
      </div>

      {/* Action Button */}
      <button className="w-full flex items-center justify-center gap-2 bg-green-600 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition">
        <FiPlayCircle className="text-lg" />
        Bắt đầu thi
      </button>
    </div>
  );
};

export default TestCard;
