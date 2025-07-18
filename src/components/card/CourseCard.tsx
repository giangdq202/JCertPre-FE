import React from "react";
import { FaBookOpen, FaArrowRight } from "react-icons/fa";
import clsx from "clsx";
export type CourseTypeEnum = "Online" | "Offline" | "Hybrid";
export type CourseStatusEnum = "Draft" | "Published" | "Archived" | "Suspended";

export const CourseTypeLabel: Record<CourseTypeEnum, string> = {
  Online: "Trực tuyến",
  Offline: "Trực tiếp",
  Hybrid: "Kết hợp",
};

export const CourseStatusLabel: Record<CourseStatusEnum, string> = {
  Draft: "Nháp",
  Published: "Xuất bản",
  Archived: "Lưu trữ",
  Suspended: "Tạm ngưng",
};

interface CourseCardProps {
  id: number | string;
  thumbnail: string;
  title: string;
  level: string;
  buttonText: string;
  onClick: () => void;
  description?: string;
  price?: number;
  progress?: number;
  courseType?: CourseTypeEnum;
}

const typeColorMap: Record<CourseTypeEnum, string> = {
  Online: "bg-red-100 text-red-700",
  Offline: "bg-green-100 text-green-700",
  Hybrid: "bg-pink-100 text-pink-700",
};

const CourseCard: React.FC<CourseCardProps> = ({
  thumbnail,
  title,
  description,
  level,
  price,
  progress,
  courseType,
  buttonText,
  onClick,
}) => {
  return (
    <div className="group relative block bg-white rounded-xl shadow-md hover:shadow-lg hover:ring-2 hover:ring-green-400 transition duration-300 overflow-hidden">
      {/* Badge: Chỉ loại khóa học */}
      {courseType && (
        <div className="absolute top-3 left-3 z-10">
          <span
            className={clsx(
              "px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide",
              typeColorMap[courseType]
            )}
          >
            {CourseTypeLabel[courseType]}
          </span>
        </div>
      )}
      <div className="aspect-[16/9] w-full overflow-hidden rounded-t-xl bg-gray-100">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
        />
      </div>

      <div className="p-6 flex flex-col justify-between min-h-[260px]">
        <div className="space-y-3">
          <h4 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
            {title}
          </h4>

          {description && (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {description}
            </p>
          )}

          <div className="text-xs text-gray-500 flex items-center gap-2 mt-2">
            <FaBookOpen className="text-green-500" />
            <span>Trình độ: {level}</span>
          </div>

          {/* Ẩn giá nếu đã mua */}
          {progress === undefined && price !== undefined && (
            <p className="text-green-600 font-semibold">
              {price === 0 ? "Miễn phí" : price.toLocaleString("vi-VN") + "₫"}
            </p>
          )}

          {progress !== undefined && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Hoàn thành {progress}%
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onClick}
          className="mt-6 flex items-center justify-center gap-2 bg-green-600 text-white text-sm font-semibold py-3 rounded-lg
                     group-hover:bg-green-700 transition-colors duration-300 cursor-pointer select-none
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 w-full"
        >
          <span>{buttonText}</span>
          <FaArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
