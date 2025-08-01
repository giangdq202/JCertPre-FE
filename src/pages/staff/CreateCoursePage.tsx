import React, { useState } from "react";
import { Form, Input, InputNumber, Select, Button, Spin, message, Card, Space } from "antd";
import { SaveOutlined, RollbackOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ThumbnailUploader from "../../components/forms/ThumbnailUploader"; // Import your thumbnail uploader component
import StaffSidebar from "../../components/sidebar/StaffSidebar";
import StaffHeader from "../../components/header/StaffHeader";
import {
  createCourse,
  CreateCourseDto,
  CourseLevel,
  CourseType,
} from "../../services/courseService"; // Đảm bảo đường dẫn đúng
import paths from "../../routes/path";

const { Option } = Select;
const { TextArea } = Input;

const CreateCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm(); // Use Ant Design Form hook
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  // Xử lý khi submit form
  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      const courseData: CreateCourseDto = {
        title: values.title,
        description: values.description,
        level: values.level,
        courseType: CourseType.Online, // Default to Online (0)
        price: values.price,
        thumbnailFile: thumbnailFile, // Use the file from state
      };

      const newCourse = await createCourse(courseData);
      message.success(`Course "${newCourse.title}" created successfully!`);
      form.resetFields(); // Reset form sau khi tạo thành công
      setThumbnailFile(null); // Reset thumbnail file
      navigate(`/course-detail/${newCourse.courseId}`); // Điều hướng đến trang chi tiết khóa học vừa tạo
    } catch (error) {
      message.error("Failed to create course. Please check your input.");
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Course</h1>

          <Card className="max-w-3xl mx-auto shadow-xl rounded-xl"> {/* Replaced Ant Design Card styling with Tailwind */}
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                level: CourseLevel.N5, // Giá trị mặc định
                courseType: CourseType.Online, // Giá trị mặc định
                price: 0, // Giá trị mặc định
              }}
            >
              <Form.Item
                name="title"
                label={<span className="text-gray-700 font-medium">Course Title</span>}
                rules={[
                  { required: true, message: "Please input the course title!" },
                  { min: 3, message: "Title must be at least 3 characters." },
                  { max: 200, message: "Title cannot exceed 200 characters." },
                ]}
              >
                <Input placeholder="e.g., JLPT N5 Complete Course - Beginner Japanese" className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-orange-500 focus:border-orange-500" />
              </Form.Item>

              <Form.Item
                name="description"
                label={<span className="text-gray-700 font-medium">Description</span>}
                rules={[
                  { required: true, message: "Please input the course description!" },
                  { min: 10, message: "Description must be at least 10 characters." },
                  { max: 2000, message: "Description cannot exceed 2000 characters." },
                ]}
              >
                <TextArea rows={6} placeholder="Detailed description of the course content and objectives." className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-orange-500 focus:border-orange-500" />
              </Form.Item>

              <Form.Item
                name="level"
                label={<span className="text-gray-700 font-medium">JLPT Level</span>}
                rules={[{ required: true, message: "Please select the course level!" }]}
              >
                <Select placeholder="Select a JLPT level" className="rounded-lg focus:ring-orange-500 focus:border-orange-500">
                  {Object.keys(CourseLevel)
                    .filter((key) => isNaN(Number(key)))
                    .map((key) => (
                      <Option key={key} value={CourseLevel[key as keyof typeof CourseLevel]}>
                        {key}
                      </Option>
                    ))}
                </Select>
              </Form.Item>

              {/* Course Type - Hidden, default to Online (0) */}

              <Form.Item
                name="price"
                label={<span className="text-gray-700 font-medium">Price (VND)</span>}
                rules={[{ required: true, message: "Please input the course price!" }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '') as any}
                  placeholder="e.g., 1500000 (Set to 0 for free courses)"
                  className="rounded-lg px-4 py-2 border border-gray-300 focus:ring-orange-500 focus:border-orange-500"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-gray-700 font-medium">Thumbnail</span>}
              >
                <ThumbnailUploader 
                  form={form} 
                  initialImageUrl={form.getFieldValue('thumbnailUrl')} 
                  onFileChange={handleThumbnailChange}
                />
              </Form.Item>

              <Form.Item>
                <Space className="flex gap-4"> {/* Replaced Ant Design Space with Tailwind flex gap */}
                  <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />} className="bg-orange-600 hover:bg-orange-700 border-orange-600 hover:border-orange-700 rounded-lg shadow-md font-semibold">
                    Create Course
                  </Button>
                  <Button onClick={() => form.resetFields()} icon={<RollbackOutlined />} className="rounded-lg shadow-md font-semibold"> {/* Reset button */}
                    Reset
                  </Button>
                  <Button onClick={() => navigate(paths.course_management)} icon={<RollbackOutlined />} className="rounded-lg shadow-md font-semibold">
                    Cancel
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
