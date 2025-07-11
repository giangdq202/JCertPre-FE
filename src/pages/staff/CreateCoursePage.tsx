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
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Xử lý khi submit form
  const onFinish = async (values: CreateCourseDto) => {
    setSubmitting(true);
    try {
      const newCourse = await createCourse(values);
      message.success(`Course "${newCourse.title}" created successfully!`);
      form.resetFields(); // Reset form sau khi tạo thành công
      navigate(`/course-detail/${newCourse.courseId}`); // Điều hướng đến trang chi tiết khóa học vừa tạo
    } catch (error) {
      message.error("Failed to create course. Please check your input.");
      console.error("Error creating course:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen font-['Noto_Serif_JP']">
      <StaffSidebar />
      <div className="flex-1 flex flex-col">
        <StaffHeader />
        <main className="pt-16 p-6 bg-gray-50 h-full overflow-auto">
          <h1 className="text-3xl font-bold text-pink-700 mb-6">Create New Course</h1>

          <Card className="max-w-3xl mx-auto shadow-md rounded-lg">
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
                label="Course Title"
                rules={[
                  { required: true, message: "Please input the course title!" },
                  { min: 3, message: "Title must be at least 3 characters." },
                  { max: 200, message: "Title cannot exceed 200 characters." },
                ]}
              >
                <Input placeholder="e.g., JLPT N5 Complete Course - Beginner Japanese" />
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
                rules={[
                  { required: true, message: "Please input the course description!" },
                  { min: 10, message: "Description must be at least 10 characters." },
                  { max: 2000, message: "Description cannot exceed 2000 characters." },
                ]}
              >
                <TextArea rows={6} placeholder="Detailed description of the course content and objectives." />
              </Form.Item>

              <Form.Item
                name="level"
                label="JLPT Level"
                rules={[{ required: true, message: "Please select the course level!" }]}
              >
                <Select placeholder="Select a JLPT level">
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
                label="Course Type"
                rules={[{ required: true, message: "Please select the course type!" }]}
              >
                <Select placeholder="Select a course type">
                  {Object.keys(CourseType)
                    .filter((key) => isNaN(Number(key)))
                    .map((key) => (
                      <Option key={key} value={CourseType[key as keyof typeof CourseType]}>
                        {key}
                      </Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="price"
                label="Price (VND)"
                rules={[{ required: true, message: "Please input the course price!" }]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '') as any}
                  placeholder="e.g., 1500000 (Set to 0 for free courses)"
                />
              </Form.Item>

              <Form.Item
                name="thumbnail"
                label="Thumbnail"
                rules={[{ type: "url", message: "Please enter the thumbnail!" }]}
              >
                <ThumbnailUploader form={form} />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />} className="bg-pink-600 hover:bg-pink-700 border-pink-600 hover:border-pink-700">
                    Create Course
                  </Button>
                  <Button onClick={() => navigate(paths.course_management)} icon={<RollbackOutlined />}>
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
