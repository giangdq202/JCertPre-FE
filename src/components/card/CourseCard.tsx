import React from "react";
import { FaBookOpen, FaArrowRight, FaCheckCircle } from "react-icons/fa";
import clsx from "clsx";
import CertificateGenerator from "../CertificateGenerator";

export type CourseTypeEnum = "Personal" | "Public";
export type CourseStatusEnum = "Draft" | "Published" | "Archived";

export const CourseTypeLabel: Record<CourseTypeEnum, string> = {
  Personal: "Cá nhân",
  Public: "Công khai",
};

export const CourseStatusLabel: Record<CourseStatusEnum, string> = {
  Draft: "Nháp",
  Published: "Xuất bản",
  Archived: "Lưu trữ",
};

interface CourseCardProps {
  id: number | string;
  thumbnail: string;
  title: string;
  level: string;
  buttonText?: string;
  onClick: () => void;
  description?: string;
  price?: number;
  progress?: number;
  courseType?: CourseTypeEnum;
  instructor?: {
    avatarUrl?: string;
    fullName: string;
  };
  studentName?: string;
  onCertificateDownload?: () => void;
}

const typeColorMap: Record<CourseTypeEnum, string> = {
  Personal: "bg-red-100 text-red-700",
  Public: "bg-green-100 text-green-700",
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
  instructor,
  studentName,
  onCertificateDownload,
}) => {
  const isPurchased = progress !== undefined; // true nếu đã đăng ký
  const isCompleted = progress !== undefined && progress >= 100;

  const certificateData = {
    studentName: studentName || "Học viên",
    courseTitle: title,
    completionDate: new Date().toLocaleDateString('vi-VN'),
    courseLevel: level,
    instructorName: instructor?.fullName,
  };

  return (
    <div className="group relative block bg-white rounded-xl shadow-md hover:shadow-lg hover:ring-2 hover:ring-green-400 transition duration-300 overflow-hidden h-full flex flex-col">
      {/* Badge loại khóa học */}
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

      {/* Badge hoàn thành */}
      {isCompleted && (
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-green-100 text-green-700">
            <FaCheckCircle className="inline mr-1" />
            Hoàn thành
          </span>
        </div>
      )}

      {/* Ảnh thumbnail */}
      <div className="aspect-[16/9] w-full overflow-hidden rounded-t-xl bg-gray-100">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out"
        />
      </div>

      {/* Nội dung */}
      <div className="p-6 flex flex-col h-full">
        <div className="flex-1 space-y-3">
          <h4 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-300">
            {title}
          </h4>

          {description && (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
              {description}
            </p>
          )}
        </div>

        {/* Thông tin cố định trên nút */}
        <div className="mt-6 space-y-3">
          {/* Trình độ - luôn hiển thị */}
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <FaBookOpen className="text-green-500" />
            <span>Trình độ: {level}</span>
          </div>

          {/* Thông tin giáo viên - luôn hiển thị */}
          <div className="flex items-center gap-2">
            <img
              src={instructor?.avatarUrl || "https://placehold.co/24x24/cccccc/ffffff?text=GV"}
              alt={instructor?.fullName || "Giáo viên"}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs text-gray-600 truncate">
              {instructor?.fullName || "Giáo viên"}
            </span>
          </div>

          {/* Giá hoặc tiến độ - tùy theo trạng thái */}
          {!isPurchased && price !== undefined ? (
            <p className="text-green-600 font-semibold text-sm">
              {price === 0 ? "Miễn phí" : price.toLocaleString("vi-VN") + "₫"}
            </p>
          ) : isPurchased && (
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress || 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {progress === undefined ? "Đang tải..." : `Hoàn thành ${progress}%`}
              </p>
            </div>
          )}

          {/* Button hoặc trạng thái hoàn thành */}
          {isCompleted ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-600 font-semibold">
                <FaCheckCircle className="w-5 h-5" />
                <span>Đã hoàn thành</span>
              </div>
              <CertificateGenerator 
                certificateData={certificateData}
                onDownload={onCertificateDownload}
              />
            </div>
          ) : (
            <button
              onClick={onClick}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white text-sm font-semibold py-3 rounded-lg
                         group-hover:bg-green-700 transition-colors duration-300 cursor-pointer select-none
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
            >
              <span>{buttonText || (isPurchased ? "Tiếp tục học" : "Đăng ký")}</span>
              <FaArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
