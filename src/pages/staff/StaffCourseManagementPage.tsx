import React, { useState, useEffect } from "react";
import { Table, Button, Input, Select, Space, Tag, message, PaginationProps } from "antd";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import StaffSidebar from "../../components/sidebar/StaffSidebar";
import StaffHeader from "../../components/header/StaffHeader";
import {
  getCourses,
  CourseListDto,
  CourseQueryParameters,
  CourseStatus,
  CourseLevel,
  CourseType,
} from "../../services/courseService"; // Đảm bảo đường dẫn đúng

const { Option } = Select;

const StaffCourseManagementPage: React.FC = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<CourseListDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [queryParameters, setQueryParameters] = useState<CourseQueryParameters>({
    pageNumber: 1,
    pageSize: 10,
    searchTerm: null,
    instructorId: null,
    status: null,
    level: null,
    courseType: null,
  });

  // Hàm để fetch dữ liệu khóa học từ API
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await getCourses(queryParameters);
      setCourses(response.items);
      setPagination((prev) => ({
        ...prev,
        total: response.totalItemsCount,
        current: Math.max(1, response.pageIndex),
        pageSize: response.pageSize,
      }));
    } catch (error) {
      message.error("Failed to fetch courses.");
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi queryParameters thay đổi
  useEffect(() => {
    fetchCourses();
  }, [queryParameters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Xử lý thay đổi phân trang
  const handleTableChange = (page: number, pageSize?: number) => {
    setQueryParameters((prev) => ({
      ...prev,
      pageNumber: page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  // Xử lý thay đổi tìm kiếm
  const handleSearch = (value: string) => {
    setQueryParameters((prev) => ({
      ...prev,
      searchTerm: value || null,
      pageNumber: 1, // Reset về trang 1 khi tìm kiếm
    }));
  };

  // Xử lý thay đổi bộ lọc trạng thái
  const handleStatusFilterChange = (value: CourseStatus | null) => {
    setQueryParameters((prev) => ({
      ...prev,
      status: value,
      pageNumber: 1,
    }));
  };

  // Xử lý thay đổi bộ lọc cấp độ
  const handleLevelFilterChange = (value: CourseLevel | null) => {
    setQueryParameters((prev) => ({
      ...prev,
      level: value,
      pageNumber: 1,
    }));
  };

  // Xử lý thay đổi bộ lọc loại khóa học
  const handleTypeFilterChange = (value: CourseType | null) => {
    setQueryParameters((prev) => ({
      ...prev,
      courseType: value,
      pageNumber: 1,
    }));
  };

  // Định nghĩa cột cho bảng khóa học
  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: CourseListDto) => (
        // Khi click vào tiêu đề, điều hướng đến trang chi tiết khóa học
        <Link to={`/course-detail/${record.courseId}`} className="text-blue-600 hover:underline">
          {text}
        </Link>
      ),
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      render: (level: CourseLevel) => CourseLevel[level], // Hiển thị tên enum
    },
    {
      title: "Type",
      dataIndex: "courseType",
      key: "courseType",
      render: (type: CourseType) => CourseType[type], // Hiển thị tên enum
    },
    {
      title: "Price (VND)",
      dataIndex: "price",
      key: "price",
      render: (price: number) => price.toLocaleString("vi-VN"), // Định dạng tiền tệ Việt Nam
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: CourseStatus) => {
        let color: string;
        switch (status) {
          case CourseStatus.Published:
            color = "green";
            break;
          case CourseStatus.Draft:
            color = "blue";
            break;
          case CourseStatus.Archived:
            color = "gold";
            break;
          case CourseStatus.Suspended:
            color = "red";
            break;
          default:
            color = "default";
        }
        return <Tag color={color}>{CourseStatus[status].toUpperCase()}</Tag>;
      },
    },
    {
      title: "Enrollments",
      dataIndex: "enrollmentsCount",
      key: "enrollmentsCount",
    },
    {
      title: "Instructors",
      dataIndex: "instructorsCount",
      key: "instructorsCount",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div className="flex h-screen font-['Noto_Serif_JP']">
      <StaffSidebar />
      <div className="flex-1 flex flex-col">
        <StaffHeader />
        <main className="pt-16 p-6 bg-gray-50 h-full overflow-auto">
          <h1 className="text-3xl font-bold text-pink-700 mb-6">Course Management</h1>

          {/* Filter and Create Course Section */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <Space className="w-full justify-between items-end mb-4" wrap>
              <Input.Search
                placeholder="Search by title or description"
                allowClear
                onSearch={handleSearch}
                style={{ width: 300 }}
                enterButton={<SearchOutlined />}
              />
              <Select
                placeholder="Filter by Status"
                allowClear
                style={{ width: 180 }}
                onChange={handleStatusFilterChange}
                value={queryParameters.status}
              >
                {Object.keys(CourseStatus)
                  .filter((key) => isNaN(Number(key)))
                  .map((key) => (
                    <Option key={key} value={CourseStatus[key as keyof typeof CourseStatus]}>
                      {key}
                    </Option>
                  ))}
              </Select>
              <Select
                placeholder="Filter by Level"
                allowClear
                style={{ width: 150 }}
                onChange={handleLevelFilterChange}
                value={queryParameters.level}
              >
                {Object.keys(CourseLevel)
                  .filter((key) => isNaN(Number(key)))
                  .map((key) => (
                    <Option key={key} value={CourseLevel[key as keyof typeof CourseLevel]}>
                      {key}
                    </Option>
                  ))}
              </Select>
              <Select
                placeholder="Filter by Type"
                allowClear
                style={{ width: 150 }}
                onChange={handleTypeFilterChange}
                value={queryParameters.courseType}
              >
                {Object.keys(CourseType)
                  .filter((key) => isNaN(Number(key)))
                  .map((key) => (
                    <Option key={key} value={CourseType[key as keyof typeof CourseType]}>
                      {key}
                    </Option>
                  ))}
              </Select>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate("/course-management/create-course")}
                className="bg-pink-600 hover:bg-pink-700 border-pink-600 hover:border-pink-700"
              >
                Create New Course
              </Button>
            </Space>
          </div>

          {/* Courses Table */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Table
              columns={columns}
              dataSource={courses}
              rowKey="courseId"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                onChange: handleTableChange,
                onShowSizeChange: handleTableChange,
              }}
              className="w-full"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffCourseManagementPage;