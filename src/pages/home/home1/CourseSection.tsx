import React, { useRef } from "react";
import { FaArrowLeft, FaArrowRight, FaStar } from "react-icons/fa";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import loginImg from "../../../assets/login.png";

interface Course {
  id: number;
  image: string;
  title: string;
  teacher: string;
  rating: number;
  price: number;
}

const courses: Course[] = [
  {
    id: 1,
    image: loginImg,
    title: "Nhập môn tiếng Nhật – Khởi đầu vững chắc",
    teacher: "Nguyễn Thị Ngọc Ánh",
    rating: 4.8,
    price: 0,
  },
  {
    id: 2,
    image: loginImg,
    title: "Viết Email chuyên nghiệp bằng tiếng Nhật",
    teacher: "Lê Viêt Sơn",
    rating: 4.5,
    price: 199000,
  },
  {
    id: 3,
    image: loginImg,
    title: "Giao tiếp tiếng Nhật nơi công sở",
    teacher: "Trần Quang Anh",
    rating: 4.9,
    price: 0,
  },
  {
    id: 4,
    image: loginImg,
    title: "Luyện thi JLPT N5 cơ bản",
    teacher: "Phạm Hữu Kiên",
    rating: 4.7,
    price: 150000,
  },
  {
    id: 5,
    image: loginImg,
    title: "Kỹ năng nghe tiếng Nhật nâng cao",
    teacher: "Hoàng Linh",
    rating: 4.6,
    price: 200000,
  },
];

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 4,
    slidesToSlide: 4,
  },
  tablet: {
    breakpoint: { max: 1024, min: 768 },
    items: 2,
    slidesToSlide: 2,
  },
  mobile: {
    breakpoint: { max: 768, min: 0 },
    items: 1,
    slidesToSlide: 1,
  },
};

const CourseSection: React.FC = () => {
  const carouselRef = useRef<any>(null);

  return (
    <section
      className="py-14 px-6 md:px-20 font-[Noto_Serif_JP] bg-gradient-to-b from-white to-[#b0e57c]"
      aria-label="Popular courses"
    >
      <h2 className="text-xl md:text-3xl font-extrabold text-gray-900 mb-12 tracking-wide text-center">
        Các khoá học dành cho bạn
      </h2>

      <div className="relative">
        <button
          onClick={() => carouselRef.current?.previous()}
          className="absolute top-1/2 left-0 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow-md hover:bg-green-600 hover:text-white transition"
          aria-label="Previous"
        >
          <FaArrowLeft size={24} />
        </button>

        <Carousel
          ref={carouselRef}
          responsive={responsive}
          infinite
          swipeable
          draggable
          showDots={true}
          arrows={false}
          containerClass="carousel-container"
          itemClass="px-2"
        >
          {courses.map((course) => (
            <div
              key={course.id}
              className="relative bg-white rounded-2xl shadow-xl cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="relative">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-40 object-cover rounded-t-2xl"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 z-10">
                  <span className="bg-green-200 text-green-800 text-xs font-semibold px-3 py-1 rounded-full shadow">
                    {course.price === 0
                      ? "Miễn phí"
                      : course.price.toLocaleString("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        })}
                  </span>
                </div>
              </div>

              <div className="p-4 text-left flex flex-col justify-between min-h-[180px] mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-1">
                    GV: {course.teacher}
                  </p>
                  <div className="flex items-center gap-1 text-yellow-400 text-xs">
                    <FaStar />
                    <span className="text-gray-800 font-medium">
                      {course.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="px-4 py-1.5 rounded-full font-semibold text-red-900 text-sm
             bg-gradient-to-r from-red-400 to-white
             hover:from-red-500 hover:to-gray-200
             focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                >
                  Đăng ký
                </button>
              </div>
            </div>
          ))}
        </Carousel>

        <button
          onClick={() => carouselRef.current?.next()}
          className="absolute top-1/2 right-0 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow-md hover:bg-green-600 hover:text-white transition"
          aria-label="Next"
        >
          <FaArrowRight size={24} />
        </button>
      </div>
    </section>
  );
};

export default CourseSection;
