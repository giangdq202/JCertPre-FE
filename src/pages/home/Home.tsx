import React from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import slide1 from "../../assets/slide1.png";
import slide2 from "../../assets/slide2.png";
import slide3 from "../../assets/slide3.png";
import backgroundImage from "../../assets/background.png";
import card1 from "../../assets/card1.png";
import card2 from "../../assets/card2.png";
import card3 from "../../assets/card3.png";
import CourseSection from "../../pages/home/home1/CourseSection";
import BenefitsSection from "../../pages/home/home2/BenefitsSection";
import paths from "../../routes/path";

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const images: string[] = [slide1, slide2, slide3];

  const handleViewMore = (path: string) => {
    if (!isAuthenticated) {
      navigate(paths.login, { replace: true });
    } else {
      navigate(path, { replace: true });
    }
  };

  return (
    <div className="font-['Noto_Serif_JP']">
      {/* Carousel */}
      <div className="relative w-screen mt-[80px] overflow-hidden bg-white">
        <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false}
          showStatus={false}
          showIndicators={false}
          interval={4500}
        >
          {images.map((img, idx) => (
            <div key={idx} className="relative w-screen h-[500px]">
              <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: `url(${backgroundImage})` }}
              />
              <img
                src={img}
                alt={`slide-${idx}`}
                className="relative z-10 w-full h-full object-contain"
              />
              {idx === 2 && (
                <div className="absolute bottom-6 left-6 z-20 text-left text-[#1F1F1F] max-w-sm bg-white/85 px-5 py-4 rounded-xl shadow-lg backdrop-blur-md border border-gray-200">
                  <h1 className="text-2xl font-bold mb-2 leading-snug">
                    Cùng{" "}
                    <span className="text-red-600 font-extrabold tracking-wide">
                      JCertPre
                    </span>{" "}
                    chinh phục tiếng Nhật
                  </h1>
                  <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                    Khóa học, từ vựng, ngữ pháp, luyện đề & theo dõi tiến độ –
                    tất cả trong một nền tảng thông minh.
                  </p>
                </div>
              )}
            </div>
          ))}
        </Carousel>
      </div>

      <div className="bg-white py-14 px-6 md:px-16 font-['Noto_Serif_JP']">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="group bg-[#F9F9F9] text-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 border border-gray-200 hover:border-red-300">
            <div className="h-64 w-full">
              <img
                src={card1}
                alt="Học & Luyện Tập"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2 group-hover:text-red-600">
                Học & Luyện Tập
              </h3>
              <div className="w-10 h-1 bg-red-400 group-hover:bg-red-600 mb-4 transition-all duration-300"></div>
              <p className="text-sm mb-6 text-gray-700 leading-relaxed">
                Tham gia lớp học trực tuyến, xem lại video bài giảng, làm bài
                luyện tập từ N5–N1 và truy cập tài liệu giải đề.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => handleViewMore("/courses")}
                  className="border border-red-600 px-5 py-2 text-sm rounded hover:bg-red-600 hover:text-white transition"
                >
                  XEM THÊM
                </button>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="group bg-[#FDF8EE] text-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 border border-yellow-200 hover:border-yellow-400">
            <div className="h-64 w-full">
              <img
                src={card2}
                alt="Thi Thử & Đánh Giá"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2 group-hover:text-yellow-600">
                Thi Thử & Đánh Giá
              </h3>
              <div className="w-10 h-1 bg-yellow-400 group-hover:bg-yellow-600 mb-4 transition-all duration-300"></div>
              <p className="text-sm mb-6 text-gray-700 leading-relaxed">
                Thi thử JLPT đúng thời gian thật, chấm điểm tự động, phân tích
                kết quả và gợi ý cải thiện.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => handleViewMore("/mocktest")}
                  className="border border-yellow-600 px-5 py-2 text-sm rounded hover:bg-yellow-600 hover:text-white transition"
                >
                  XEM THÊM
                </button>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group bg-[#EFF6FC] text-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 border border-blue-200 hover:border-blue-400">
            <div className="h-64 w-full">
              <img
                src={card3}
                alt="Flashcard & Ghi Nhớ"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2 group-hover:text-blue-600">
                Flashcard & Ghi Nhớ
              </h3>
              <div className="w-10 h-1 bg-blue-400 group-hover:bg-blue-600 mb-4 transition-all duration-300"></div>
              <p className="text-sm mb-6 text-gray-700 leading-relaxed">
                Tạo flashcard cá nhân, chia sẻ và luyện tập ghi nhớ từ vựng
                thông minh cùng cộng đồng học viên.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => handleViewMore("/practice")}
                  className="border border-blue-600 px-5 py-2 text-sm rounded hover:bg-blue-600 hover:text-white transition"
                >
                  XEM THÊM
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CourseSection />
      <BenefitsSection />
    </div>
  );
};

export default Home;