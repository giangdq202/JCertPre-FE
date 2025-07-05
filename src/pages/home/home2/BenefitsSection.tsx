import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import bgImage from "../../../assets/background_benefit.jpg";

const benefits = [
  {
    title: "Giáo viên uy tín, giàu kinh nghiệm",
    description:
      "Đội ngũ giáo viên giàu kinh nghiệm giúp bạn học chắc và hiểu sâu.",
  },
  {
    title: "Nội dung học phong phú, sát thực tế",
    description:
      "Bài học đa dạng, cập nhật thường xuyên, bám sát đề thi và giao tiếp thực tế.",
  },
  {
    title: "Học mọi lúc mọi nơi",
    description:
      "Truy cập linh hoạt trên điện thoại, máy tính bảng, laptop chỉ với 1 tài khoản.",
  },
  {
    title: "Hỗ trợ nhanh chóng, tận tâm",
    description:
      "Tư vấn và hỗ trợ kỹ thuật 24/7 qua nhiều kênh, đảm bảo không gián đoạn học tập.",
  },
  {
    title: "Đánh giá trình độ chính xác",
    description:
      "Hệ thống kiểm tra đầu vào giúp bạn bắt đầu đúng cấp độ để học hiệu quả.",
  },
  {
    title: "Cấp chứng chỉ uy tín",
    description:
      "Hoàn thành khoá học, bạn sẽ nhận được chứng chỉ điện tử đáng tin cậy.",
  },
];

const BenefitsSection: React.FC = () => {
  return (
    <section
      className="relative py-20 px-6 md:px-16 bg-fixed bg-cover bg-center"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      <div className="relative z-10 max-w-7xl mx-auto">
        <h2 className="text-xl md:text-3xl font-extrabold text-gray-900 mb-12 tracking-wide text-center">
          Các lợi ích khi học tại <span className="text-white">JCertPre</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-red-200 shadow-md bg-gradient-to-br from-white to-red-50 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <FaCheckCircle className="text-green-600 w-5 h-5" />
                <h3 className="text-lg font-semibold text-red-700">
                  {item.title}
                </h3>
              </div>
              <p className="text-gray-800 leading-relaxed text-base">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
