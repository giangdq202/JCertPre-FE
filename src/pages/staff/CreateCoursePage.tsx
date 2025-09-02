import React, { useState } from "react";
import { Form, Input, InputNumber, Select, Button, Spin, message, Card, Space, DatePicker, AutoComplete } from "antd";
import { SaveOutlined, RollbackOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ThumbnailUploader from "../../components/forms/ThumbnailUploader"; // Import your thumbnail uploader component
import StaffSidebar from "../../components/sidebar/StaffSidebar";
import StaffHeader from "../../components/header/StaffHeader";
import {
  createCourse,
  createPersonalCourse,
  CreateCourseDto,
  CourseLevel,
  CourseType,
} from "../../services/courseService"; // Đảm bảo đường dẫn đúng
import { getAllUsers, UserDto } from "../../services/userService";
import paths from "../../routes/path";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

const CreateCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm(); // Use Ant Design Form hook
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [courseType, setCourseType] = useState<CourseType>(CourseType.Public);
  const [userSearchResults, setUserSearchResults] = useState<UserDto[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [searchingUsers, setSearchingUsers] = useState<boolean>(false);

  // Validate course dates
  const validateCourseDates = (startDate: any, endDate: any): { isValid: boolean; message: string } => {
    if (!startDate || !endDate) {
      return { isValid: false, message: "Vui lòng chọn cả ngày bắt đầu và ngày kết thúc." };
    }

    const now = dayjs();
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    // Check if start date is not in the past (must be at least today)
    if (start.isBefore(now, 'day')) {
      return { isValid: false, message: "Ngày bắt đầu không được là ngày đã qua." };
    }

    // Check if end date is after start date
    if (!end.isAfter(start)) {
      return { isValid: false, message: "Ngày kết thúc phải sau ngày bắt đầu." };
    }

    return { isValid: true, message: "" };
  };

  // Search users by email
  const handleUserSearch = async (searchText: string) => {
    if (!searchText || searchText.length < 3) {
      setUserSearchResults([]);
      return;
    }

    try {
      setSearchingUsers(true);
      const response = await getAllUsers({
        searchQuery: searchText,
        pageSize: 10,
      });
      setUserSearchResults(response.items);
    } catch (error) {
      console.error("Error searching users:", error);
      message.error("Không thể tìm kiếm người dùng");
      setUserSearchResults([]);
    } finally {
      setSearchingUsers(false);
    }
  };

  // Handle user selection
  const handleUserSelect = (value: string, option: any) => {
    const user = userSearchResults.find(u => u.id === value);
    setSelectedUser(user || null);
  };

  // Handle course type change
  const handleCourseTypeChange = (value: CourseType) => {
    setCourseType(value);
    if (value === CourseType.Public) {
      setSelectedUser(null);
      form.setFieldValue('selectedUser', undefined);
    }
  };

  // Xử lý khi submit form
  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      // Validate course dates
      const dateValidation = validateCourseDates(values.startDate, values.endDate);
      if (!dateValidation.isValid) {
        message.error(dateValidation.message);
        setSubmitting(false);
        return;
      }

      // Validate personal course requirements
      if (values.courseType === CourseType.Personal && !selectedUser) {
        message.error("Vui lòng chọn người dùng cho khóa học cá nhân");
        setSubmitting(false);
        return;
      }

      const courseData: CreateCourseDto = {
        title: values.title,
        description: values.description,
        level: values.level,
        courseType: values.courseType,
        price: values.price,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        thumbnailFile: thumbnailFile, // Use the file from state
      };

      let newCourse;
      if (values.courseType === CourseType.Personal && selectedUser) {
        // Create personal course
        newCourse = await createPersonalCourse(selectedUser.id, courseData);
        message.success(`Khóa học cá nhân "${newCourse.title}" đã được tạo thành công cho ${selectedUser.fullName}!`);
      } else {
        // Create public course
        newCourse = await createCourse(courseData);
        message.success(`Khóa học "${newCourse.title}" đã được tạo thành công!`);
      }

      form.resetFields(); // Reset form sau khi tạo thành công
      setThumbnailFile(null); // Reset thumbnail file
      setSelectedUser(null); // Reset selected user
      setUserSearchResults([]); // Reset search results
      navigate(`/course-detail/${newCourse.courseId}`); // Điều hướng đến trang chi tiết khóa học vừa tạo
    } catch (error) {
      message.error("Không thể tạo khóa học. Vui lòng kiểm tra lại thông tin.");
      console.error("Error creating course:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle thumbnail file change
  const handleThumbnailChange = (file: File | null) => {
    setThumbnailFile(file);
  };

  return (
    <div className="flex h-screen font-inter"> {/* Changed font to Inter */}
      <StaffSidebar />
      <div className="flex-1 flex flex-col">
        <StaffHeader />
        <main className="pt-16 p-6 bg-gray-50 h-full overflow-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Tạo khóa học mới</h1>

          <Card className="max-w-3xl mx-auto shadow-xl rounded-xl"> {/* Replaced Ant Design Card styling with Tailwind */}
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                level: CourseLevel.N5, // Giá trị mặc định
                courseType: CourseType.Public, // Giá trị mặc định
                price: 0, // Giá trị mặc định
              }}
            >
              <Form.Item
                name="title"
                label={<span className="text-gray-700 font-medium">Tên khóa học</span>}
                rules={[
                  { required: true, message: "Vui lòng nhập tên khóa học!" },
                  { min: 3, message: "Tên khóa học phải có ít nhất 3 ký tự." },
                  { max: 200, message: "Tên khóa học không được vượt quá 200 ký tự." },
                ]}
              >
                <Input placeholder="Ví dụ: Khóa học JLPT N5 hoàn chỉnh - Tiếng Nhật sơ cấp" className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-orange-500 focus:border-orange-500" />
              </Form.Item>

              <Form.Item
                name="description"
                label={<span className="text-gray-700 font-medium">Mô tả</span>}
                rules={[
                  { required: true, message: "Vui lòng nhập mô tả khóa học!" },
                  { min: 10, message: "Mô tả phải có ít nhất 10 ký tự." },
                  { max: 2000, message: "Mô tả không được vượt quá 2000 ký tự." },
                ]}
              >
                <TextArea rows={6} placeholder="Mô tả chi tiết về nội dung và mục tiêu của khóa học." className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-orange-500 focus:border-orange-500" />
              </Form.Item>

              <Form.Item
                name="level"
                label={<span className="text-gray-700 font-medium">Cấp độ JLPT</span>}
                rules={[{ required: true, message: "Vui lòng chọn cấp độ khóa học!" }]}
              >
                <Select placeholder="Chọn cấp độ JLPT" className="rounded-lg focus:ring-orange-500 focus:border-orange-500">
                  {Object.keys(CourseLevel)
                    .filter((key) => isNaN(Number(key)))
                    .map((key) => (
                      <Option key={key} value={CourseLevel[key as keyof typeof CourseLevel]}>
                        {key}
                      </Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="courseType"
                label={<span className="text-gray-700 font-medium">Loại khóa học</span>}
                rules={[{ required: true, message: "Vui lòng chọn loại khóa học!" }]}
              >
                <Select 
                  placeholder="Chọn loại khóa học" 
                  className="rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  onChange={handleCourseTypeChange}
                >
                  <Option value={CourseType.Public}>Công khai</Option>
                  <Option value={CourseType.Personal}>Cá nhân</Option>
                </Select>
              </Form.Item>

              {courseType === CourseType.Personal && (
                <Form.Item
                  name="selectedUser"
                  label={<span className="text-gray-700 font-medium">Chọn người dùng (cho khóa học cá nhân)</span>}
                  rules={[{ required: courseType === CourseType.Personal, message: "Vui lòng chọn người dùng cho khóa học cá nhân!" }]}
                >
                  <Select
                    showSearch
                    placeholder="Tìm kiếm người dùng theo email hoặc tên"
                    filterOption={false}
                    onSearch={handleUserSearch}
                    onSelect={handleUserSelect}
                    loading={searchingUsers}
                    className="rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    notFoundContent={searchingUsers ? <Spin size="small" /> : "Không tìm thấy người dùng"}
                  >
                    {userSearchResults.map((user) => (
                      <Option key={user.id} value={user.id}>
                        {user.fullName} - {user.email}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              )}

              <Form.Item
                name="price"
                label={<span className="text-gray-700 font-medium">Giá (VND)</span>}
                rules={[{ required: true, message: "Vui lòng nhập giá khóa học!" }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '') as any}
                  placeholder="Ví dụ: 1500000 (Đặt 0 cho khóa học miễn phí)"
                  className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                />
              </Form.Item>

              <Form.Item
                name="startDate"
                label={<span className="text-gray-700 font-medium">Ngày bắt đầu</span>}
                rules={[
                  { required: true, message: "Vui lòng chọn ngày bắt đầu khóa học!" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const now = dayjs();
                      if (dayjs(value).isBefore(now, 'day')) {
                        return Promise.reject(new Error('Ngày bắt đầu không được là ngày đã qua.'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày bắt đầu"
                  className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>

              <Form.Item
                name="endDate"
                label={<span className="text-gray-700 font-medium">Ngày kết thúc</span>}
                rules={[
                  { required: true, message: "Vui lòng chọn ngày kết thúc khóa học!" },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const startDate = form.getFieldValue('startDate');
                      if (startDate && !dayjs(value).isAfter(dayjs(startDate))) {
                        return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu.'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
                dependencies={['startDate']}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày kết thúc"
                  className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                  disabledDate={(current) => {
                    const startDate = form.getFieldValue('startDate');
                    if (startDate) {
                      return current && current <= dayjs(startDate);
                    }
                    return current && current < dayjs().startOf('day');
                  }}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-gray-700 font-medium">Ảnh thumbnail</span>}
              >
                <ThumbnailUploader 
                  form={form} 
                  initialImageUrl={null} 
                  onFileChange={handleThumbnailChange}
                />
              </Form.Item>

              <Form.Item>
                <Space className="flex gap-4"> {/* Replaced Ant Design Space with Tailwind flex gap */}
                  <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />} className="bg-orange-600 hover:bg-orange-700 border-orange-600 hover:border-orange-700 rounded-lg shadow-md font-semibold">
                    Tạo khóa học
                  </Button>
                  <Button onClick={() => form.resetFields()} icon={<RollbackOutlined />} className="rounded-lg shadow-md font-semibold"> {/* Reset button */}
                    Đặt lại
                  </Button>
                  <Button onClick={() => navigate(paths.course_management)} icon={<RollbackOutlined />} className="rounded-lg shadow-md font-semibold">
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default CreateCoursePage;
