// src/pages/staff/CourseDetailPage.tsx
import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Spin, // Import Spin
  message,
  Popconfirm,
  Card,
  List,
  Modal,
  Space,
  Tag,
} from "antd";
import {
  EditOutlined, // Icon này vẫn có thể dùng cho nút Save nếu muốn
  SaveOutlined,
  RollbackOutlined,
  DeleteOutlined,
  PlusOutlined,
  UserDeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import StaffSidebar from "../../components/sidebar/StaffSidebar";
import StaffHeader from "../../components/header/StaffHeader";
import ThumbnailUploader from "../../components/forms/ThumbnailUploader"; // Import your thumbnail uploader component
import {
  getCourseById,
  updateCourse,
  updateCourseStatus,
  addInstructorToCourse,
  removeInstructorFromCourse,
  CourseDto,
  UpdateCourseDto,
  CourseStatus,
  CourseLevel,
  CourseType,
  InstructorInfoDto,
} from "../../services/courseService"; // Đảm bảo đường dẫn đúng

const { Option } = Select;
const { TextArea } = Input;

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [course, setCourse] = useState<CourseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  // Đã loại bỏ state 'editing'
  const [isAddInstructorModalVisible, setIsAddInstructorModalVisible] = useState<boolean>(false);
  const [newInstructorId, setNewInstructorId] = useState<string>("");

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      console.log("Fetching course details for ID:", courseId);

      if (!courseId) {
        message.error("Course ID is missing. Redirecting to course list.");
        setLoading(false);
        navigate("/staff/courses");
        return;
      }
      setLoading(true);
      try {
        const data = await getCourseById(courseId);
        setCourse(data);
        form.setFieldsValue({
          title: data.title,
          description: data.description,
          level: data.level,
          courseType: data.courseType,
          price: data.price,
          thumbnailUrl: data.thumbnailUrl,
          status: data.status,
        });
      } catch (error) {
        message.error("Failed to fetch course details. Please check the ID or network connection.");
        console.error("Error fetching course details:", error);
        navigate("/staff/courses"); // Quay lại trang danh sách nếu không tìm thấy khóa học
      } finally {
        setLoading(false);
      }
    };
    fetchCourseDetails();
  }, [courseId, form, navigate]);

  // Handle form submission for updating course
  const onFinish = async (values: UpdateCourseDto) => {
    if (!courseId) return;
    setSubmitting(true);
    try {
      const updatedCourse = await updateCourse(courseId, values);
      setCourse(updatedCourse); // Cập nhật lại state course với dữ liệu mới
      message.success("Course updated successfully!");
      // Không cần tắt chế độ chỉnh sửa vì luôn ở chế độ chỉnh sửa
    } catch (error) {
      message.error("Failed to update course.");
      console.error("Error updating course:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle status update
  const handleUpdateStatus = async (newStatus: CourseStatus) => {
    if (!courseId) return;
    setSubmitting(true);
    try {
      await updateCourseStatus(courseId, newStatus);
      setCourse((prev) => (prev ? { ...prev, status: newStatus } : null)); // Cập nhật trạng thái trong UI
      message.success(`Course status updated to ${CourseStatus[newStatus]} successfully!`);
    } catch (error) {
      message.error("Failed to update course status.");
      console.error("Error updating course status:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle adding instructor
  const handleAddInstructor = async () => {
    if (!courseId || !newInstructorId) {
      message.warning("Please enter an instructor ID.");
      return;
    }
    setSubmitting(true);
    try {
      await addInstructorToCourse(courseId, newInstructorId);
      message.success("Instructor added successfully!");
      // Re-fetch course details to update instructor list
      const updatedData = await getCourseById(courseId);
      setCourse(updatedData);
      setIsAddInstructorModalVisible(false);
      setNewInstructorId("");
    } catch (error) {
      message.error("Failed to add instructor. Check ID or if already assigned.");
      console.error("Error adding instructor:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle removing instructor
  const handleRemoveInstructor = async (instructorIdToRemove: string) => {
    if (!courseId) return;
    setSubmitting(true);
    try {
      await removeInstructorFromCourse(courseId, instructorIdToRemove);
      message.success("Instructor removed successfully!");
      // Re-fetch course details to update instructor list
      const updatedData = await getCourseById(courseId);
      setCourse(updatedData);
    } catch (error) {
      message.error("Failed to remove instructor.");
      console.error("Error removing instructor:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Hàm để reset form về giá trị ban đầu của khóa học
  const handleCancelEdit = () => {
    if (course) {
      form.setFieldsValue({
        title: course.title,
        description: course.description,
        level: course.level,
        courseType: course.courseType,
        price: course.price,
        thumbnailUrl: course.thumbnailUrl,
        status: course.status,
      });
      message.info("Changes discarded.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen font-['Noto_Serif_JP']">
        <StaffSidebar />
        <div className="flex-1 flex flex-col justify-center items-center bg-gray-50">
          <Spin size="large" />
          <p className="mt-4 text-lg text-gray-700">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-screen font-['Noto_Serif_JP']">
        <StaffSidebar />
        <div className="flex-1 flex flex-col justify-center items-center bg-gray-50">
          <p className="text-lg text-gray-700">Course not found or an error occurred.</p>
          <Button type="primary" onClick={() => navigate("/staff/courses")} className="mt-4 bg-pink-600 hover:bg-pink-700">
            Back to Course List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-['Noto_Serif_JP']">
      <StaffSidebar />
      <div className="flex-1 flex flex-col">
        <StaffHeader />
        <main className="pt-16 p-6 bg-gray-50 h-full overflow-auto">
          <h1 className="text-3xl font-bold text-pink-700 mb-6">Course Details: {course.title}</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Course Details Form */}
            <Card title="Course Information" className="md:col-span-2 shadow-md rounded-lg">
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={course}
                // Đã loại bỏ prop 'disabled' để form luôn có thể chỉnh sửa
              >
                <Form.Item
                  name="title"
                  label="Title"
                  rules={[{ required: true, message: "Please input the course title!" }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="description"
                  label="Description"
                  rules={[{ required: true, message: "Please input the course description!" }]}
                >
                  <TextArea rows={4} />
                </Form.Item>
                <Form.Item
                  name="level"
                  label="Level"
                  rules={[{ required: true, message: "Please select the course level!" }]}
                >
                  <Select placeholder="Select a level">
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
                  <InputNumber min={0} style={{ width: "100%" }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value!.replace(/\$\s?|(,*)/g, '') as any} />
                </Form.Item>
                <Form.Item
                  name="thumbnailUrl"
                  label="Thumbnail URL"
                  rules={[{ type: "url", message: "Please enter a valid URL!" }]}
                >
                   <ThumbnailUploader form={form} initialImageUrl={course?.thumbnailUrl} />
                </Form.Item>

                {/* Luôn hiển thị nút Save Changes và Cancel */}
                <Space>
                  <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />} className="bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700">
                    Save Changes
                  </Button>
                  <Button onClick={handleCancelEdit} icon={<RollbackOutlined />}>
                    Cancel
                  </Button>
                </Space>
              </Form>
            </Card>

            {/* Course Status and Instructors */}
            <div className="md:col-span-1 flex flex-col gap-6">
              <Card title="Course Status" className="shadow-md rounded-lg">
                <p className="mb-4 text-lg">
                  Current Status: <Tag color={
                    course.status === CourseStatus.Published ? "green" :
                    course.status === CourseStatus.Draft ? "blue" :
                    course.status === CourseStatus.Archived ? "gold" :
                    course.status === CourseStatus.Suspended ? "red" : "default"
                  }>{CourseStatus[course.status].toUpperCase()}</Tag>
                </p>
                <Space direction="vertical" className="w-full">
                  {Object.keys(CourseStatus)
                    .filter((key) => isNaN(Number(key)))
                    .map((key) => {
                      const statusValue = CourseStatus[key as keyof typeof CourseStatus];
                      if (statusValue === course.status) return null; // Không hiển thị trạng thái hiện tại
                      return (
                        <Popconfirm
                          key={key}
                          title={`Are you sure to change status to ${key}?`}
                          onConfirm={() => handleUpdateStatus(statusValue)}
                          okText="Yes"
                          cancelText="No"
                          icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
                          disabled={submitting}
                        >
                          <Button
                            block
                            loading={submitting}
                            className={
                              statusValue === CourseStatus.Published ? "bg-green-500 hover:bg-green-600 text-white border-none" :
                              statusValue === CourseStatus.Draft ? "bg-blue-500 hover:bg-blue-600 text-white border-none" :
                              statusValue === CourseStatus.Archived ? "bg-yellow-500 hover:bg-yellow-600 text-white border-none" :
                              statusValue === CourseStatus.Suspended ? "bg-red-500 hover:bg-red-600 text-white border-none" : ""
                            }
                          >
                            Set as {key}
                          </Button>
                        </Popconfirm>
                      );
                    })}
                </Space>
              </Card>

              <Card
                title="Instructors"
                className="shadow-md rounded-lg"
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsAddInstructorModalVisible(true)}
                    className="bg-pink-600 hover:bg-pink-700 border-pink-600 hover:border-pink-700"
                  >
                    Add Instructor
                  </Button>
                }
              >
                <List
                  itemLayout="horizontal"
                  dataSource={course.instructors}
                  locale={{ emptyText: "No instructors assigned." }}
                  renderItem={(instructor: InstructorInfoDto) => (
                    <List.Item
                      actions={[
                        <Popconfirm
                          key="delete"
                          title="Are you sure to remove this instructor?"
                          onConfirm={() => handleRemoveInstructor(instructor.id)}
                          okText="Yes"
                          cancelText="No"
                          icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
                          disabled={submitting}
                        >
                          <Button
                            type="text"
                            danger
                            icon={<UserDeleteOutlined />}
                            loading={submitting}
                          />
                        </Popconfirm>,
                      ]}
                    >
                      <List.Item.Meta
                        title={instructor.fullName}
                        description={instructor.email}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Modal for adding instructor */}
      <Modal
        title="Add Instructor to Course"
        visible={isAddInstructorModalVisible}
        onCancel={() => setIsAddInstructorModalVisible(false)}
        onOk={handleAddInstructor}
        confirmLoading={submitting}
        okText="Add"
      >
        <Form layout="vertical">
          <Form.Item label="Instructor ID" required>
            <Input
              value={newInstructorId}
              onChange={(e) => setNewInstructorId(e.target.value)}
              placeholder="Enter instructor's GUID"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseDetailPage;